/**
  * Validate Aadhaar Number format:
  * - Must be exactly 12 digits
  * - Must contain only numeric characters
  * - Cannot start with 0 or 1
  * - Cannot be all identical digits (e.g. 000000000000 or 999999999999)
  * Note: Frontend local validation only. Does NOT connect to UIDAI.
  */
export function validateAadhaarNumber(aadhaar: string): { isValid: boolean; error?: string } {
  if (!aadhaar) {
    return { isValid: false, error: 'Aadhaar number is required.' };
  }

  // Remove spaces or hyphens
  const clean = aadhaar.replace(/[\s-]/g, '');

  if (!/^\d+$/.test(clean)) {
    return { isValid: false, error: 'Aadhaar must contain numeric digits only.' };
  }

  if (clean.length !== 12) {
    return { isValid: false, error: 'Aadhaar must be exactly 12 digits.' };
  }

  if (clean.startsWith('0') || clean.startsWith('1')) {
    return { isValid: false, error: 'Aadhaar cannot start with 0 or 1.' };
  }

  // Check for all repeated digits (e.g., 222222222222)
  if (/^(\d)\1{11}$/.test(clean)) {
    return { isValid: false, error: 'Aadhaar cannot consist of a single repeated digit.' };
  }

  return { isValid: true };
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone: string): boolean {
  const clean = phone.replace(/[\s-+()]/g, '');
  return clean.length >= 10 && clean.length <= 13 && /^\d+$/.test(clean);
}

export function formatAadhaarInput(val: string): string {
  const digits = val.replace(/\D/g, '').slice(0, 12);
  const parts = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(' ');
}
