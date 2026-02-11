// src/models/User.ts
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export const parseUser = (json: unknown): User => {
  const data = json as Record<string, unknown>;

  if (typeof data.id !== 'string' && typeof data.id !== 'number') {
    throw new Error('Invalid or missing "id" field');
  }
  if (typeof data.name !== 'string') {
    throw new Error('Invalid or missing "name" field');
  }
  if (typeof data.email !== 'string') {
    throw new Error('Invalid or missing "email" field');
  }
  if (typeof data.createdAt !== 'string' && !(data.createdAt instanceof Date)) {
    throw new Error('Invalid or missing "createdAt" field');
  }

  return {
    id: String(data.id),
    name: String(data.name),
    email: String(data.email),
    avatarUrl: typeof data.avatarUrl === 'string' ? data.avatarUrl : undefined,
    createdAt:
      data.createdAt instanceof Date
        ? data.createdAt
        : new Date(String(data.createdAt)),
    updatedAt:
      typeof data.updatedAt === 'string'
        ? new Date(data.updatedAt)
        : data.updatedAt instanceof Date
        ? data.updatedAt
        : undefined,
  };
};

export const userToJson = (user: User): Record<string, unknown> => ({
  id: user.id,
  name: user.name,
  email: user.email,
  avatarUrl: user.avatarUrl,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt?.toISOString(),
});

// src/services/api.ts
import { User, parseUser } from '../models/User';

const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

export const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_BASE_URL}/users`);
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  const json = await response.json();
  // jsonplaceholder returns an array of user objects; adapt fields
  return json.map((item: any) => {
    const adapted = {
      id: String(item.id),
      name: item.name,
      email: item.email,
      avatarUrl: `https://i.pravatar.cc/150?u=${item.id}`,
      createdAt: new Date(),
    };
    return parseUser(adapted);
  });
};

export const fetchUserById = async (id: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  const item = await response.json();
  const adapted = {
    id: String(item.id),
    name: item.name,
    email: item.email,
    avatarUrl: `https://i.pravatar.cc/150?u=${item.id}`,
    createdAt: new Date(),
  };
  return parseUser(adapted);
};

// src/context/UserContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../models/User';
import { fetchUsers, fetchUserById } from '../services/api';

interface UserContextProps {
  users: User[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getUser: (id: string) => Promise<User>;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await loadUsers();
  };

  const getUser = async (id: string) => {
    return await fetchUserById(id);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <UserContext.Provider value={{ users, loading, error, refresh, getUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = (): UserContextProps => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import UserListScreen from '../screens/UserListScreen';
import UserDetailScreen from '../screens/UserDetailScreen';
import { User } from '../models/User';

export type RootStackParamList = {
  UserList: undefined;
  UserDetail: { userId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="UserList">
      <Stack.Screen name="UserList" component={UserListScreen} options={{ title: 'Users' }} />
      <Stack.Screen
        name="UserDetail"
        component={UserDetailScreen}
        options={{ title: 'User Detail' }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

// src/screens/UserListScreen.tsx
import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useUserContext } from '../context/UserContext';
import { User } from '../models/User';

type Props = NativeStackScreenProps<RootStackParamList, 'UserList'>;

const UserListScreen = ({ navigation }: Props) => {
  const { users, loading, error, refresh } = useUserContext();

  const renderItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('UserDetail', { userId: item.id })}
    >
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.email}>{item.email}</Text>
    </TouchableOpacity>
  );

  if (loading && users.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error && users.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity onPress={refresh} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
      contentContainerStyle={users.length === 0 && styles.centered}
      ListEmptyComponent={<Text>No users found.</Text>}
    />
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#0066cc',
    borderRadius: 4,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default UserListScreen;

// src/screens/UserDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useUserContext } from '../context/UserContext';
import { User } from '../models/User';

type Props = NativeStackScreenProps<RootStackParamList, 'UserDetail'>;

const UserDetailScreen = ({ route }: Props) => {
  const { userId } = route.params;
  const { getUser } = useUserContext();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetched = await getUser(userId);
        setUser(fetched);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [userId, getUser]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error ?? 'User not found'}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {user.avatarUrl && (
        <Image source={{ uri: user.avatarUrl }} style={styles.avatar} resizeMode="cover" />
      )}
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.email}>{user.email}</Text>
      <Text style={styles.infoLabel}>Created At:</Text>
      <Text style={styles.infoValue}>{user.createdAt.toLocaleString()}</Text>
      {user.updatedAt && (
        <>
          <Text style={styles.infoLabel}>Updated At:</Text>
          <Text style={styles.infoValue}>{user.updatedAt.toLocaleString()}</Text>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 24,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  email: {
    fontSize: 18,
    color: '#555',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#888',
    marginTop: 12,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
  },
});

export default UserDetailScreen;

// src/App.tsx
import React from 'react';
import { SafeAreaView, StyleSheet, Platform, StatusBar } from 'react-native';
import { UserProvider } from './context/UserContext';
import { AppNavigator } from './navigation/AppNavigator';

const App = () => {
  return (
    <UserProvider>
      <SafeAreaView style={styles.safeArea}>
        <AppNavigator />
      </SafeAreaView>
    </UserProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});

export default App;

// jest.config.js
module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation)/)',
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
};

// __tests__/UserListScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { UserProvider } from '../src/context/UserContext';
import UserListScreen from '../src/screens/UserListScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../src/navigation/AppNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

const renderWithProviders = () => {
  return render(
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="UserList" component={UserListScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
};

test('renders loading indicator initially', async () => {
  const { getByTestId, queryByText } = renderWithProviders();
  expect(getByTestId('ActivityIndicator')).toBeTruthy();
  await waitFor(() => {
    expect(queryByText(/No users found/)).toBeTruthy();
  });
});