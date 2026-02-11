import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  createRef,
} from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

// -----------------------------------------------------------------------------
// Types & Navigation
// -----------------------------------------------------------------------------
export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
};

type User = {
  id: string;
  name: string;
  email: string;
};

interface LoginResponse {
  id: string;
  name: string;
  email: string;
  token: string;
  message?: string;
}

interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  token: string;
  message?: string;
}

type AuthContextProps = {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

type AuthProviderProps = {
  children?: ReactNode;
};

export const navigationRef = createRef<NavigationContainerRef<RootStackParamList>>();

const navigateReset = (routes: { name: keyof RootStackParamList }[]) => {
  navigationRef.current?.reset({
    index: 0,
    routes: routes as any,
  });
};

// -----------------------------------------------------------------------------
// Screens
// -----------------------------------------------------------------------------
const LoginScreen = () => {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch {
      // error handled in context
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Login" onPress={handleLogin} />
      )}
      <TouchableOpacity
        style={styles.link}
        onPress={() => navigationRef.current?.navigate('Register')}
      >
        <Text style={styles.linkText}>Don’t have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const RegisterScreen = () => {
  const { register, loading, error } = useAuth();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleRegister = async () => {
    try {
      await register(name, email, password);
    } catch {
      // error handled in context
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Register" onPress={handleRegister} />
      )}
      <TouchableOpacity
        style={styles.link}
        onPress={() => navigationRef.current?.navigate('Login')}
      >
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const HomeScreen = () => {
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.name ?? 'User'}!</Text>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Logout" onPress={handleLogout} />
      )}
    </View>
  );
};

// -----------------------------------------------------------------------------
// Navigation Stack
// -----------------------------------------------------------------------------
const Stack = createNativeStackNavigator<RootStackParamList>();

// -----------------------------------------------------------------------------
// Auth Provider
// -----------------------------------------------------------------------------
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load persisted auth data on app start
  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('@auth_token');
      const storedUser = await AsyncStorage.getItem('@auth_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      setError('Failed to load stored authentication data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const handleLoginResponse = (data: any): LoginResponse => {
    if (
      typeof data.id !== 'string' ||
      typeof data.name !== 'string' ||
      typeof data.email !== 'string' ||
      typeof data.token !== 'string'
    ) {
      throw new Error('Invalid login response format.');
    }
    return data as LoginResponse;
  };

  const handleRegisterResponse = (data: any): RegisterResponse => {
    if (
      typeof data.id !== 'string' ||
      typeof data.name !== 'string' ||
      typeof data.email !== 'string' ||
      typeof data.token !== 'string'
    ) {
      throw new Error('Invalid registration response format.');
    }
    return data as RegisterResponse;
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://example.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const rawData = await response.json();

      if (!response.ok) {
        const message = rawData.message ?? 'Login failed.';
        throw new Error(message);
      }

      const data = handleLoginResponse(rawData);

      const loggedInUser: User = {
        id: data.id,
        name: data.name,
        email: data.email,
      };

      setUser(loggedInUser);
      setToken(data.token);
      await AsyncStorage.setItem('@auth_token', data.token);
      await AsyncStorage.setItem('@auth_user', JSON.stringify(loggedInUser));

      navigateReset([{ name: 'Home' }]);
    } catch (e: any) {
      setError(e.message ?? 'An unexpected error occurred during login.');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await AsyncStorage.removeItem('@auth_token');
      await AsyncStorage.removeItem('@auth_user');
      setUser(null);
      setToken(null);
      navigateReset([{ name: 'Login' }]);
    } catch (e: any) {
      setError(e.message ?? 'An unexpected error occurred during logout.');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://example.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const rawData = await response.json();

      if (!response.ok) {
        const message = rawData.message ?? 'Registration failed.';
        throw new Error(message);
      }

      const data = handleRegisterResponse(rawData);

      const newUser: User = {
        id: data.id,
        name: data.name,
        email: data.email,
      };

      setUser(newUser);
      setToken(data.token);
      await AsyncStorage.setItem('@auth_token', data.token);
      await AsyncStorage.setItem('@auth_user', JSON.stringify(newUser));

      navigateReset([{ name: 'Home' }]);
    } catch (e: any) {
      setError(e.message ?? 'An unexpected error occurred during registration.');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextProps = {
    isAuthenticated: !!token,
    user,
    token,
    loading,
    error,
    login,
    logout,
    register,
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {token ? (
            <Stack.Screen name="Home" component={HomeScreen} />
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  error: {
    color: '#b00020',
    marginBottom: 12,
    textAlign: 'center',
  },
  link: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#0066cc',
  },
});