export function maskAadhaar(aadhaar: string): string {
  const digits = aadhaar.replace(/\D/g, '');
  if (digits.length !== 12) return 'XXXX-XXXX-XXXX';
  const last4 = digits.slice(8);
  return `XXXX-XXXX-${last4}`;
}

export function validateAadhaarFormat(aadhaar: string): boolean {
  const digits = aadhaar.replace(/\D/g, '');
  if (digits.length !== 12) return false;
  if (/^(\d)\1{11}$/.test(digits)) return false; // Reject 000000000000 or 111111111111
  return true;
}
