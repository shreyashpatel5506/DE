import React, { createContext, useContext, useState, useEffect } from 'react';

type Role = 'user' | 'officer' | null;

interface AuthState {
  isLoggedIn: boolean;
  role: Role;
  userId: string | null;
  userName?: string;
  email?: string;
}

interface AuthContextType extends AuthState {
  loginUser: (userData: any) => void;
  loginOfficer: (officerData: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    role: null,
    userId: null,
  });

  useEffect(() => {
    // Try to recover state from localStorage since we can't read the httpOnly cookie directly
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      try {
        setAuthState(JSON.parse(storedAuth));
      } catch (e) {
        console.error("Failed to parse stored auth");
      }
    }
  }, []);

  const loginUser = (userData: any) => {
    const newState = {
      isLoggedIn: true,
      role: 'user' as Role,
      userId: userData._id || userData.id,
      userName: userData.userName,
      email: userData.email,
    };
    setAuthState(newState);
    localStorage.setItem('auth', JSON.stringify(newState));
  };

  const loginOfficer = (officerData: any) => {
    const newState = {
      isLoggedIn: true,
      role: 'officer' as Role,
      userId: officerData._id || officerData.id,
      email: officerData.email,
    };
    setAuthState(newState);
    localStorage.setItem('auth', JSON.stringify(newState));
  };

  const logout = () => {
    setAuthState({ isLoggedIn: false, role: null, userId: null });
    localStorage.removeItem('auth');
    // Note: A true logout would also call a backend endpoint to clear the httpOnly cookie
  };

  return (
    <AuthContext.Provider value={{ ...authState, loginUser, loginOfficer, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
