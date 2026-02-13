import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as AppProvider } from './context/AppContext';
import RootNavigator from './navigation/RootNavigator';
import { StyleSheet } from 'react-native';

const App = () => {
  return (
    <AppProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AppProvider>
  );
};

export default App;

const styles = StyleSheet.create({});