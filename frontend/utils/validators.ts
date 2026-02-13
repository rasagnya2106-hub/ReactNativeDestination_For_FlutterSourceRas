export const isValidEmail = (email: string): boolean => {
  return email.includes('@');
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};