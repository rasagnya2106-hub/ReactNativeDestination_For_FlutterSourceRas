import React, { createContext, useState, ReactNode } from 'react';

type AuthContextType = {};

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state] = useState<AuthContextType>({} as AuthContextType);
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
};