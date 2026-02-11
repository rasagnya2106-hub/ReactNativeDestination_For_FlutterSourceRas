import React, { createContext, useContext, useState, ReactNode } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { View, Text, Button, StyleSheet, Platform } from 'react-native';

type RootStackParamList = {
  Home: undefined;
  Details: { message: string };
};

type AppContextType = {
  counter: number;
  increment: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const AppProvider = ({ children }: { children: ReactNode }) => {
  const [counter, setCounter] = useState<number>(0);
  const increment = () => setCounter(prev => prev + 1);
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

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const { counter, increment } = useAppContext();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      <Text style={styles.counter}>Counter: {counter}</Text>
      <Button title="Increment Counter" onPress={increment} />
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate('Details', { message: 'Hello from Home!' })}
      />
    </View>
  );
};

type DetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'Details'>;

const DetailsScreen = ({ route, navigation }: DetailsScreenProps) => {
  const { message } = route.params;
  const { counter } = useAppContext();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Details Screen</Text>
      <Text style={styles.message}>Message: {message}</Text>
      <Text style={styles.counter}>Counter from context: {counter}</Text>
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
  );
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: Platform.OS === 'android' ? '#6200ee' : '#fff',
            },
            headerTintColor: Platform.OS === 'android' ? '#fff' : '#6200ee',
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
          <Stack.Screen name="Details" component={DetailsScreen} options={{ title: 'Details' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 24,
    marginBottom: 12,
    fontWeight: '600',
  },
  counter: {
    fontSize: 18,
    marginVertical: 8,
  },
  message: {
    fontSize: 16,
    marginBottom: 12,
  },
});

export default App;