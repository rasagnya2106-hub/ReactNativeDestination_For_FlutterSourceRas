import { Platform } from 'react-native';

/**
 * Checks if the given value is not null, undefined, empty string, empty array, or empty object.
 */
export const isRequired = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value as object).length > 0;
  return true;
};

/**
 * Validates an email address.
 */
export const isEmailValid = (email: string): boolean => {
  if (!isRequired(email)) return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|} -]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};

/**
 * Validates password strength.
 */
export const isPasswordStrong = (password: string, minLength = 8): boolean => {
  if (!isRequired(password)) return false;
  const trimmed = password.trim();
  if (trimmed.length < minLength) return false;
  const hasUpper = /[A-Z]/.test(trimmed);
  const hasLower = /[a-z]/.test(trimmed);
  const hasDigit = /[0-9]/.test(trimmed);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(trimmed);
  return hasUpper && hasLower && hasDigit && hasSpecial;
};

/**
 * Validates a phone number.
 */
export const isPhoneNumberValid = (phone: string): boolean => {
  if (!isRequired(phone)) return false;
  const cleaned = phone.replace(/[^\d+]/g, '');
  const numericPart = cleaned.replace(/\+/g, '');
  const digitCount = numericPart.length;
  const validLength = digitCount >= 7 && digitCount <= 15;
  const pattern = /^\+?\d{7,15}$/;
  return validLength && pattern.test(cleaned);
};

/**
 * Validates a URL.
 */
export const isUrlValid = (url: string): boolean => {
  if (!isRequired(url)) return false;
  const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
  return urlRegex.test(url.trim());
};

/**
 * Validates a credit card number using Luhn algorithm.
 */
export const isCreditCardValid = (cardNumber: string): boolean => {
  if (!isRequired(cardNumber)) return false;
  const sanitized = cardNumber.replace(/[\s-]/g, '');
  if (!/^\d+$/.test(sanitized)) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

/**
 * Validates a date string.
 */
export const isDateValid = (
  dateStr: string,
  format: 'ISO' | 'MM/DD/YYYY' = 'ISO',
): boolean => {
  if (!isRequired(dateStr)) return false;
  const trimmed = dateStr.trim();

  if (format === 'ISO') {
    const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!isoRegex.test(trimmed)) return false;
    const date = new Date(trimmed);
    return !isNaN(date.getTime());
  }

  if (format === 'MM/DD/YYYY') {
    const usRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
    if (!usRegex.test(trimmed)) return false;
    const [month, day, year] = trimmed.split('/');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    return (
      date.getFullYear() === parseInt(year, 10) &&
      date.getMonth() === parseInt(month, 10) - 1 &&
      date.getDate() === parseInt(day, 10)
    );
  }

  return false;
};

/**
 * iOS bundle identifier validation.
 */
export const isIosBundleIdValid = (bundleId: string): boolean => {
  if (Platform.OS !== 'ios') return true;
  if (!isRequired(bundleId)) return false;
  const pattern = /^[a-zA-Z][a-zA-Z0-9-]*(\.[a-zA-Z0-9-]+)+$/;
  return pattern.test(bundleId.trim());
};

/**
 * Android package name validation.
 */
export const isAndroidPackageNameValid = (packageName: string): boolean => {
  if (Platform.OS !== 'android') return true;
  if (!isRequired(packageName)) return false;
  const pattern = /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/;
  return pattern.test(packageName.trim());
};