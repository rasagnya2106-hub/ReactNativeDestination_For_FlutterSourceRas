import { useCallback } from 'react';

export const isNotEmpty = (value: string | null | undefined): boolean => {
  return value != null && value.trim().length > 0;
};

export const isEmailValid = (email: string): boolean => {
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const isPasswordStrong = (password: string): boolean => {
  // At least 8 characters, at least one letter and one number
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return passwordRegex.test(password);
};

export const useValidators = () => {
  const validateNotEmpty = useCallback(
    (value: string | null | undefined): boolean => isNotEmpty(value),
    []
  );

  const validateEmail = useCallback(
    (email: string): boolean => isEmailValid(email),
    []
  );

  const validatePassword = useCallback(
    (password: string): boolean => isPasswordStrong(password),
    []
  );

  return {
    validateNotEmpty,
    validateEmail,
    validatePassword,
  };
};