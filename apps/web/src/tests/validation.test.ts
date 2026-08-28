import { describe, it, expect } from 'vitest';
import { validateAadhaarNumber, validateEmail, validatePhone, formatAadhaarInput } from '../lib/utils/validation';

describe('Validation Utility Tests', () => {
  describe('Aadhaar 12-digit Local Validation', () => {
    it('should approve valid 12-digit numeric Aadhaar string', () => {
      const res = validateAadhaarNumber('5555 6666 7777');
      expect(res.isValid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it('should reject Aadhaar string with fewer than 12 digits', () => {
      const res = validateAadhaarNumber('1234 5678');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('12 digits');
    });

    it('should reject Aadhaar starting with 0 or 1', () => {
      const res = validateAadhaarNumber('0123 4567 8901');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('cannot start with 0 or 1');
    });

    it('should reject Aadhaar with all repeated digits', () => {
      const res = validateAadhaarNumber('9999 9999 9999');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('repeated digit');
    });

    it('should format raw digits into 4-4-4 space-separated Aadhaar format', () => {
      const formatted = formatAadhaarInput('555566667777');
      expect(formatted).toBe('5555 6666 7777');
    });
  });

  describe('Email & Phone Validation', () => {
    it('should correctly validate valid email formats', () => {
      expect(validateEmail('citizen@example.com')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
    });

    it('should correctly validate 10-digit mobile numbers', () => {
      expect(validatePhone('+91 9876543210')).toBe(true);
      expect(validatePhone('123')).toBe(false);
    });
  });
});
