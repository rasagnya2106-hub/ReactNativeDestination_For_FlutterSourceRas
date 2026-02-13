import React, { createContext, useContext, useState, ReactNode } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { View, Text, Button, StyleSheet } from 'react-native';

// Navigation param list
type RootStackParamList = {
  Home: undefined;
  Details: { itemId: number };
};

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
type DetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'Details'>;

// Global App Context
type AppContextType = {
  counter: number;
  increment: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const AppProvider = ({ children }: { children: ReactNode }) => {
  const [counter, setCounter] = useState<number>(0);
  const increment = () => setCounter((prev) => prev + 1);
  return (
    <AppContext.Provider value={{ counter, increment }}>
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

// Screens
const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const { counter, increment } = useAppContext();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      <Text>Counter: {counter}</Text>
      <Button title="Increment Counter" onPress={increment} />
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate('Details', { itemId: 42 })}
      />
    </View>
  );
};

const DetailsScreen = ({ route, navigation }: DetailsScreenProps) => {
  const { itemId } = route.params;
  const { counter } = useAppContext();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Details Screen</Text>
      <Text>Item ID: {itemId}</Text>
      <Text>Current Counter: {counter}</Text>
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
  );
};

// Stack Navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
          <Stack.Screen name="Details" component={DetailsScreen} options={{ title: 'Details' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 24,
    marginBottom: 12,
    fontWeight: '600',
  },
});