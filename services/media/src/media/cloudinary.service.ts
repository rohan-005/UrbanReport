import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger('CloudinaryService');
  private configured = false;

  constructor(private readonly configService: ConfigService) {
    const cloudName =
      this.configService.get<string>('CLOUDINARY_CLOUD_NAME') ||
      process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey =
      this.configService.get<string>('CLOUDINARY_API_KEY') ||
      process.env.CLOUDINARY_API_KEY;
    const apiSecret =
      this.configService.get<string>('CLOUDINARY_API_SECRET') ||
      process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
      this.configured = true;
      this.logger.log(`Cloudinary configured successfully for cloud: '${cloudName}'`);
    } else {
      this.logger.warn(
        'Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) not fully provided. Falling back to stub mode.',
      );
    }
  }

  /**
   * Returns whether Cloudinary credentials are fully configured.
   */
  isConfigured(): boolean {
    return this.configured;
  }

  /**
   * Upload image buffer to Cloudinary.
   */
  async uploadImage(
    buffer: Buffer,
    mediaId: string,
    mimeType: string = 'image/jpeg',
  ): Promise<{
    publicId: string;
    secureUrl: string;
    format: string;
    bytes: number;
    width: number;
    height: number;
  }> {
    if (!this.configured) {
      // Stub fallback when Cloudinary env credentials are not set in dev/test environment
      this.logger.warn(`Cloudinary not configured. Generating stub response for asset: ${mediaId}`);
      const ext = mimeType.split('/')[1] || 'jpg';
      const stubUrl = `https://res.cloudinary.com/urbanreports-demo/image/upload/v1/urbanreports/complaints/${mediaId}.${ext}`;
      return {
        publicId: `urbanreports/complaints/${mediaId}`,
        secureUrl: stubUrl,
        format: ext,
        bytes: buffer.length,
        width: 800,
        height: 600,
      };
    }

    return new Promise((resolve, reject) => {
      const folder = 'urbanreports/complaints';
      const publicId = mediaId;

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: 'image',
          overwrite: true,
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            this.logger.error(`Cloudinary upload failed for ${mediaId}: ${error?.message || 'Unknown error'}`);
            return reject(
              new BadRequestException(`Cloudinary upload failed: ${error?.message || 'No response'}`),
            );
          }

          this.logger.log(`Cloudinary asset uploaded: ${result.public_id} (${result.secure_url})`);
          resolve({
            publicId: result.public_id,
            secureUrl: result.secure_url,
            format: result.format || 'jpg',
            bytes: result.bytes || buffer.length,
            width: result.width || 0,
            height: result.height || 0,
          });
        },
      );

      uploadStream.end(buffer);
    });
  }

  /**
   * Delete asset from Cloudinary by public ID.
   */
  async deleteImage(publicId: string): Promise<{ result: string }> {
    if (!this.configured) {
      this.logger.warn(`Cloudinary not configured. Simulating asset deletion for: ${publicId}`);
      return { result: 'ok' };
    }

    try {
      const res = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
      this.logger.log(`Deleted Cloudinary asset ${publicId}: status = ${res.result}`);
      return res;
    } catch (err: any) {
      this.logger.error(`Failed to delete Cloudinary asset ${publicId}: ${err.message}`);
      throw new InternalServerErrorException(`Cloudinary deletion error: ${err.message}`);
    }
  }
}
