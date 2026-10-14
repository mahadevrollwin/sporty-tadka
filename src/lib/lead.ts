export function isValidPhone(value: string) {
  const trimmed = value.trim();
  if (!/^[+0-9\s().-]+$/.test(trimmed)) return false;
  const pluses = trimmed.match(/\+/g);
  if (pluses && (pluses.length > 1 || !trimmed.startsWith("+"))) return false;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
