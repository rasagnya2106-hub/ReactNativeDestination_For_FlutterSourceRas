import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppProvider } from './providers/AppProvider';

const App = () => (
  <AppProvider>
    <NavigationContainer />
  </AppProvider>
);

export default App;