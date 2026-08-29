import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { MediaService } from './media.service';
import { CloudinaryService } from './cloudinary.service';
import { Media, ProcessingStatus } from './schemas/media.schema';
import {
  BadRequestException,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
  ForbiddenException,
} from '@nestjs/common';

describe('MediaService', () => {
  let service: MediaService;
  let mockCloudinaryService: any;
  let mockMediaModel: any;
  let mockConfigService: any;

  // 1x1 PNG magic header sample buffer
  const samplePngBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49,
    0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06,
    0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89,
  ]);

  beforeEach(async () => {
    mockCloudinaryService = {
      isConfigured: jest.fn().mockReturnValue(true),
      uploadImage: jest.fn().mockImplementation((buf, mediaId) =>
        Promise.resolve({
          publicId: `urbanreports/complaints/${mediaId}`,
          secureUrl: `https://res.cloudinary.com/demo/image/upload/v1/urbanreports/complaints/${mediaId}.png`,
          format: 'png',
          bytes: buf.length,
          width: 1,
          height: 1,
        }),
      ),
      deleteImage: jest.fn().mockResolvedValue({ result: 'ok' }),
    };

    mockMediaModel = {
      create: jest.fn().mockImplementation((doc) => Promise.resolve(doc)),
      findOne: jest.fn(),
      deleteOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({}) }),
    };

    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'MAX_IMAGE_SIZE') return '10485760';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        { provide: CloudinaryService, useValue: mockCloudinaryService },
        { provide: getModelToken(Media.name), useValue: mockMediaModel },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
  });

  describe('validateFile', () => {
    it('should pass for a valid PNG file under size limit', () => {
      const mockFile = {
        buffer: samplePngBuffer,
        size: samplePngBuffer.length,
        mimetype: 'image/png',
        originalname: 'test.png',
      } as Express.Multer.File;

      expect(() => service.validateFile(mockFile)).not.toThrow();
    });

    it('should throw UnsupportedMediaTypeException for invalid mime type', () => {
      const mockFile = {
        buffer: samplePngBuffer,
        size: samplePngBuffer.length,
        mimetype: 'application/pdf',
        originalname: 'test.pdf',
      } as Express.Multer.File;

      expect(() => service.validateFile(mockFile)).toThrow(UnsupportedMediaTypeException);
    });

    it('should throw PayloadTooLargeException for oversized file', () => {
      const mockFile = {
        buffer: samplePngBuffer,
        size: 20 * 1024 * 1024,
        mimetype: 'image/png',
        originalname: 'large.png',
      } as Express.Multer.File;

      expect(() => service.validateFile(mockFile)).toThrow(PayloadTooLargeException);
    });

    it('should throw BadRequestException if buffer header signature does not match image format', () => {
      const mockFile = {
        buffer: Buffer.from('NOT_AN_IMAGE_CONTENT'),
        size: 20,
        mimetype: 'image/png',
        originalname: 'fake.png',
      } as Express.Multer.File;

      expect(() => service.validateFile(mockFile)).toThrow(BadRequestException);
    });
  });

  describe('checksum and dimensions', () => {
    it('should compute deterministic SHA-256 checksum', () => {
      const checksum1 = service.calculateChecksum(samplePngBuffer);
      const checksum2 = service.calculateChecksum(samplePngBuffer);
      expect(checksum1).toBe(checksum2);
      expect(checksum1).toHaveLength(64);
    });

    it('should extract dimensions from valid image buffer', () => {
      const dims = service.extractDimensions(samplePngBuffer);
      expect(dims).toEqual({ width: 1, height: 1 });
    });
  });

  describe('uploadMedia', () => {
    it('should successfully process Cloudinary upload and return record', async () => {
      const mockFile = {
        buffer: samplePngBuffer,
        size: samplePngBuffer.length,
        mimetype: 'image/png',
        originalname: 'test.png',
      } as Express.Multer.File;

      const record = await service.uploadMedia(mockFile, 'user-123');
      expect(record.mediaId).toMatch(/^med_/);
      expect(record.owner).toBe('user-123');
      expect(record.processingStatus).toBe(ProcessingStatus.READY);
      expect(record.cloudinaryUrl).toContain('res.cloudinary.com');
      expect(mockCloudinaryService.uploadImage).toHaveBeenCalled();
      expect(mockMediaModel.create).toHaveBeenCalled();
    });
  });

  describe('deleteMedia', () => {
    it('should reject deletion if non-owner and non-admin requester', async () => {
      mockMediaModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          mediaId: 'med_001',
          owner: 'user-owner',
          cloudinaryPublicId: 'urbanreports/complaints/med_001',
        }),
      });

      await expect(
        service.deleteMedia('med_001', { userId: 'other-user', role: 'CITIZEN' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
