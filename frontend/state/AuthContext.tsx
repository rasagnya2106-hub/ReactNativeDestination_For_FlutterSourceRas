import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createNavigationContainerRef,
  NavigationContainerRef,
  StackActions,
} from '@react-navigation/native';

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
};

type AuthAction =
  | { type: 'INIT'; payload: { user: User | null; token: string | null } }
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: { error: string } }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'REGISTER_FAILURE'; payload: { error: string } };

type AuthContextProps = {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'INIT':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case 'LOGIN_START':
    case 'REGISTER_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return { ...state, loading: false, error: action.payload.error };
    case 'LOGOUT':
      return { ...state, user: null, token: null, loading: false, error: null };
    default:
      return state;
  }
}

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Register: undefined;
};

function navigate<Name extends keyof RootStackParamList>(
  name: Name,
  params?: RootStackParamList[Name],
) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

function resetStack(routeName: keyof RootStackParamList) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.replace(routeName));
  }
}

const USER_KEY = '@auth_user';
const TOKEN_KEY = '@auth_token';

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const [userJson, token] = await Promise.all([
          AsyncStorage.getItem(USER_KEY),
          AsyncStorage.getItem(TOKEN_KEY),
        ]);
        const user = userJson ? (JSON.parse(userJson) as User) : null;
        dispatch({ type: 'INIT', payload: { user, token } });
        if (user && token) {
          resetStack('Home');
        } else {
          resetStack('Login');
        }
      } catch {
        dispatch({ type: 'INIT', payload: { user: null, token: null } });
        resetStack('Login');
      }
    };
    loadStoredAuth();
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await fetch('https://example.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message ?? 'Login failed');
      }
      const data = await response.json();
      const user: User = data.user;
      const token: string = data.token;
      await Promise.all([
        AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
        AsyncStorage.setItem(TOKEN_KEY, token),
      ]);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      resetStack('Home');
    } catch (e: any) {
      dispatch({ type: 'LOGIN_FAILURE', payload: { error: e.message } });
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
  ) => {
    dispatch({ type: 'REGISTER_START' });
    try {
      const response = await fetch('https://example.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message ?? 'Registration failed');
      }
      const data = await response.json();
      const user: User = data.user;
      const token: string = data.token;
      await Promise.all([
        AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
        AsyncStorage.setItem(TOKEN_KEY, token),
      ]);
      dispatch({ type: 'REGISTER_SUCCESS', payload: { user, token } });
      resetStack('Home');
    } catch (e: any) {
      dispatch({ type: 'REGISTER_FAILURE', payload: { error: e.message } });
    }
  };

  const logout = async () => {
    await Promise.all([
      AsyncStorage.removeItem(USER_KEY),
      AsyncStorage.removeItem(TOKEN_KEY),
    ]);
    dispatch({ type: 'LOGOUT' });
    resetStack('Login');
  };

  return (
    <AuthContext.Provider value={{ state, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};