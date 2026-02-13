export const isNonEmpty = (value: string | null | undefined): boolean => {
  return typeof value === 'string' && value.trim().length > 0;
};

export const isValidEmail = (email: string): boolean => {
  if (!isNonEmpty(email)) return false;
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|} -]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const isValidPassword = (
  password: string,
  minLength: number = 8
): boolean => {
  if (!isNonEmpty(password)) return false;
  return password.length >= minLength;
};

export const isValidPhoneNumber = (phone: string): boolean => {
  if (!isNonEmpty(phone)) return false;
  const phoneRegex = /^\+?[0-9]{7,15}$/;
  return phoneRegex.test(phone);
};

export const validators = {
  isNonEmpty,
  isValidEmail,
  isValidPassword,
  isValidPhoneNumber,
};

export default validators;