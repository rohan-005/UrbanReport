import { describe, it, expect, vi, afterEach } from 'vitest';
import { MapsService } from './mapsService';

describe('MapsService Geolocation Provider', () => {
  const originalNavigator = globalThis.navigator;

  afterEach(() => {
    if (originalNavigator) {
      Object.defineProperty(globalThis, 'navigator', {
        value: originalNavigator,
        configurable: true,
        writable: true,
      });
    }
    vi.restoreAllMocks();
  });

  it('should request high accuracy with maximumAge: 0 and timeout: 15000', async () => {
    const mockGetCurrentPosition = vi.fn((success) => {
      success({
        coords: {
          latitude: 12.9715987,
          longitude: 77.5945627,
          accuracy: 8.5,
        },
      });
    });

    Object.defineProperty(globalThis, 'navigator', {
      value: {
        geolocation: {
          getCurrentPosition: mockGetCurrentPosition,
        },
      },
      configurable: true,
      writable: true,
    });

    const location = await MapsService.getCurrentLocation();

    expect(mockGetCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );

    expect(location.lat).toBe(12.9715987);
    expect(location.lng).toBe(77.5945627);
    expect(location.accuracy).toBe(8.5);
  });

  it('should reject with permission error message when PERMISSION_DENIED occurs', async () => {
    const mockGetCurrentPosition = vi.fn((_, error) => {
      error({ code: 1, PERMISSION_DENIED: 1 });
    });

    Object.defineProperty(globalThis, 'navigator', {
      value: {
        geolocation: {
          getCurrentPosition: mockGetCurrentPosition,
        },
      },
      configurable: true,
      writable: true,
    });

    await expect(MapsService.getCurrentLocation()).rejects.toThrow(
      'Location access denied. Please grant location permissions in your browser settings.',
    );
  });
});
