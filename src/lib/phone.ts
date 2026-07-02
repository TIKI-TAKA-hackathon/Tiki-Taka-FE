// Korean mobile phone helpers shared by the signup / connect / login flows.

// Keeps only digits. Used for validation and for the value sent to the backend.
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

// Formats a Korean mobile number as 010-1234-5678 while the user types.
export function formatPhone(value: string): string {
  const digits = digitsOnly(value).slice(0, 11);
  if (digits.length < 4) {
    return digits;
  }
  if (digits.length < 8) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

// A valid Korean mobile number: 010 + 8 digits.
export function isValidPhone(value: string): boolean {
  return /^01[016789]\d{7,8}$/.test(digitsOnly(value));
}
