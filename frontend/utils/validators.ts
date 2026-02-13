// validators.ts
import { Platform } from 'react-native';

/**
 * Checks if a value is present (not null/undefined/empty).
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
export const isEmailValid = (email: string | null | undefined): boolean => {
  if (!email) return false;
  const trimmed = email.trim();
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|} -]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  return emailRegex.test(trimmed);
};

/**
 * Checks password strength.
 */
export const isPasswordStrong = (
  password: string | null | undefined,
  minLength = 8,
): boolean => {
  if (!password) return false;
  const trimmed = password.trim();
  if (trimmed.length < minLength) return false;
  const hasUpper = /[A-Z]/.test(trimmed);
  const hasLower = /[a-z]/.test(trimmed);
  const hasNumber = /[0-9]/.test(trimmed);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(trimmed);
  return hasUpper && hasLower && hasNumber && hasSpecial;
};

/**
 * Validates a phone number (digits only, 10‑15 digits).
 */
export const isPhoneNumberValid = (
  phone: string | null | undefined,
): boolean => {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  return /^\d{10,15}$/.test(digits);
};

/**
 * Validates a URL.
 */
export const isUrlValid = (url: string | null | undefined): boolean => {
  if (!url) return false;
  const trimmed = url.trim();
  const urlRegex = new RegExp(
    '^' +
      '(?:(?:https?|ftp)://)' + // protocol
      '(?:\\S+(?::\\S*)?@)?' + // authentication
      '(?:' +
      '(?!10(?:\\.\\d{1,3}){3})' +
      '(?!127(?:\\.\\d{1,3}){3})' +
      '(?!169\\.254(?:\\.\\d{1,3}){2})' +
      '(?!192\\.168(?:\\.\\d{1,3}){2})' +
      '(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})' +
      '(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])' +
      '(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}' +
      '(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-5]))' +
      '|' +
      '(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)' +
      '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*' +
      '(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))' +
      ')' +
      '(?::\\d{2,5})?' + // port
      '(?:/\\S*)?' + // path
      '$',
    'i',
  );
  return urlRegex.test(trimmed);
};

/**
 * Validates a credit card number using the Luhn algorithm.
 */
export const isCreditCardNumberValid = (
  number: string | null | undefined,
): boolean => {
  if (!number) return false;
  const sanitized = number.replace(/\s+/g, '');
  if (!/^\d{13,19}$/.test(sanitized)) return false;

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
 * Checks if a string contains only alphanumeric characters.
 */
export const isAlphaNumeric = (value: string | null | undefined): boolean => {
  if (!value) return false;
  const trimmed = value.trim();
  return /^[a-zA-Z0-9]+$/.test(trimmed);
};

/**
 * Determines if a date is in the future.
 */
export const isDateInFuture = (
  date: Date | string | null | undefined,
): boolean => {
  if (!date) return false;
  const target = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(target.getTime())) return false;
  return target.getTime() > Date.now();
};

/**
 * Checks if two dates fall on the same calendar day.
 */
export const isSameDay = (
  date1: Date | string,
  date2: Date | string,
): boolean => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

/**
 * Checks if the current platform is among the supported list.
 */
export const isPlatformSupported = (
  platforms: ('ios' | 'android')[],
): boolean => {
  return platforms.includes(Platform.OS as 'ios' | 'android');
};

/**
 * Validates that a value is a finite number.
 */
export const isNumber = (value: unknown): boolean => {
  return typeof value === 'number' && Number.isFinite(value);
};

/**
 * Checks if a number is an integer.
 */
export const isInteger = (value: unknown): boolean => {
  return typeof value === 'number' && Number.isInteger(value);
};

/**
 * Checks if a number is positive (greater than zero).
 */
export const isPositive = (value: unknown): boolean => {
  return typeof value === 'number' && value > 0;
};

/**
 * Checks if a number lies within a closed range [min, max].
 */
export const isInRange = (
  value: number,
  min: number,
  max: number,
): boolean => {
  return value >= min && value <= max;
};

/**
 * Validates string length constraints.
 */
export const isStringLength = (
  value: string | null | undefined,
  min: number,
  max: number,
): boolean => {
  if (!value) return false;
  const len = value.length;
  return len >= min && len <= max;
};

/**
 * Validates array length constraints.
 */
export const isArrayLength = <T>(
  arr: T[] | null | undefined,
  min: number,
  max: number,
): boolean => {
  if (!Array.isArray(arr)) return false;
  const len = arr.length;
  return len >= min && len <= max;
};

/**
 * Validates that an object has at least a given number of own keys.
 */
export const hasObjectKeys = (
  obj: object | null | undefined,
  minKeys: number,
): boolean => {
  if (!obj || typeof obj !== 'object') return false;
  return Object.keys(obj).length >= minKeys;
};

/**
 * Checks if a date string or object is a valid date.
 */
export const isDateValid = (date: Date | string | null | undefined): boolean => {
  if (!date) return false;
  const d = typeof date === 'string' ? new Date(date) : date;
  return !isNaN(d.getTime());
};

/**
 * Validates a time string in HH:MM (24‑hour) format.
 */
export const isTimeValid = (time: string | null | undefined): boolean => {
  if (!time) return false;
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time.trim());
};

/**
 * Validates a hexadecimal color string (e.g., #FFF, #FFFFFF, #FFFFFFFF).
 */
export const isHexColor = (color: string | null | undefined): boolean => {
  if (!color) return false;
  return /^#([A-Fa-f0-9]{3,4}){1,2}$/.test(color.trim());
};

/**
 * Validates a currency format (e.g., 12.34, 0.99, 1000).
 */
export const isCurrencyFormat = (value: string | null | undefined): boolean => {
  if (!value) return false;
  return /^\d+(\.\d{1,2})?$/.test(value.trim());
};

/**
 * Validates US ZIP code (5‑digit or ZIP+4).
 */
export const isZipCode = (zip: string | null | undefined): boolean => {
  if (!zip) return false;
  return /^\d{5}(-\d{4})?$/.test(zip.trim());
};

/**
 * Validates credit card expiry in MM/YY or MM/YYYY format and ensures it is not past.
 */
export const isCreditCardExpiryValid = (
  expiry: string | null | undefined,
): boolean => {
  if (!expiry) return false;
  const trimmed = expiry.trim();
  const match = /^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/.exec(trimmed);
  if (!match) return false;
  const month = parseInt(match[1], 10);
  let year = parseInt(match[2], 10);
  if (year < 100) {
    year += 2000;
  }
  const now = new Date();
  const expiryDate = new Date(year, month - 1, 1);
  expiryDate.setMonth(expiryDate.getMonth() + 1);
  expiryDate.setDate(0);
  return expiryDate >= now;
};

/**
 * Validates CVV (3 or 4 digits).
 */
export const isCvvValid = (cvv: string | number | null | undefined): boolean => {
  if (cvv === null || cvv === undefined) return false;
  const str = typeof cvv === 'number' ? cvv.toString() : cvv.trim();
  return /^\d{3,4}$/.test(str);
};

// FormContext.tsx
import React, { createContext, useState, ReactNode } from 'react';

export interface RegistrationData {
  email: string;
  password: string;
  phone?: string;
}

interface FormContextProps {
  data: RegistrationData;
  updateData: (fields: Partial<RegistrationData>) => void;
  resetData: () => void;
}

export const FormContext = createContext<FormContextProps>({
  data: { email: '', password: '' },
  updateData: () => {},
  resetData: () => {},
});

export const FormProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<RegistrationData>({
    email: '',
    password: '',
    phone: '',
  });

  const updateData = (fields: Partial<RegistrationData>) => {
    setData(prev => ({ ...prev, ...fields }));
  };

  const resetData = () => {
    setData({ email: '', password: '', phone: '' });
  };

  return (
    <FormContext.Provider value={{ data, updateData, resetData }}>
      {children}
    </FormContext.Provider>
  );
};

// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FormProvider } from './FormContext';
import HomeScreen from './HomeScreen';
import RegistrationScreen from './RegistrationScreen';

export type RootStackParamList = {
  Home: undefined;
  Register: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <FormProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Register" component={RegistrationScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </FormProvider>
  );
};

export default App;

// HomeScreen.tsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from './App';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Demo App</Text>
      <Button title="Register" onPress={() => navigation.navigate('Register')} />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
});

// RegistrationScreen.tsx
import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from './App';
import { FormContext } from './FormContext';
import {
  isEmailValid,
  isPasswordStrong,
  isPhoneNumberValid,
  isRequired,
} from './validators';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegistrationScreen = ({ navigation }: Props) => {
  const { data, updateData, resetData } = useContext(FormContext);
  const [email, setEmail] = useState(data.email);
  const [password, setPassword] = useState(data.password);
  const [phone, setPhone] = useState(data.phone ?? '');

  const handleSubmit = () => {
    const errors: string[] = [];

    if (!isRequired(email) || !isEmailValid(email)) {
      errors.push('Please enter a valid email address.');
    }
    if (!isRequired(password) || !isPasswordStrong(password)) {
      errors.push(
        'Password must be at least 8 characters and include upper, lower, number, and special character.',
      );
    }
    if (phone && !isPhoneNumberValid(phone)) {
      errors.push('Phone number must contain 10‑15 digits.');
    }

    if (errors.length > 0) {
      Alert.alert('Validation Errors', errors.join('\n'));
      return;
    }

    updateData({ email, password, phone });
    Alert.alert('Success', 'Registration data saved.', [
      {
        text: 'OK',
        onPress: () => {
          resetData();
          navigation.navigate('Home');
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Register</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Strong password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Text style={styles.label}>Phone (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="+1234567890"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <View style={styles.buttonContainer}>
        <Button title="Submit" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
};

export default RegistrationScreen;

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  header: {
    fontSize: 28,
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    marginTop: 12,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 4,
    padding: 8,
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: 24,
  },
});

// __tests__/validators.test.ts
import {
  isEmailValid,
  isPasswordStrong,
  isPhoneNumberValid,
  isRequired,
} from '../validators';

describe('Validator Utilities', () => {
  test('isRequired works for various types', () => {
    expect(isRequired('test')).toBe(true);
    expect(isRequired('')).toBe(false);
    expect(isRequired(null)).toBe(false);
    expect(isRequired(undefined)).toBe(false);
    expect(isRequired([])).toBe(false);
    expect(isRequired([1])).toBe(true);
    expect(isRequired({})).toBe(false);
    expect(isRequired({ a: 1 })).toBe(true);
  });

  test('isEmailValid validates correctly', () => {
    expect(isEmailValid('user@example.com')).toBe(true);
    expect(isEmailValid('invalid-email')).toBe(false);
    expect(isEmailValid('')).toBe(false);
  });

  test('isPasswordStrong validates strength', () => {
    expect(isPasswordStrong('Aa1!aaaa')).toBe(true);
    expect(isPasswordStrong('weak')).toBe(false);
    expect(isPasswordStrong('NoSpecial1')).toBe(false);
  });

  test('isPhoneNumberValid validates digits length', () => {
    expect(isPhoneNumberValid('+12345678901')).toBe(true);
    expect(isPhoneNumberValid('12345')).toBe(false);
  });
});