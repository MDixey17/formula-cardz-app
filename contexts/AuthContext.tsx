import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, AuthRequest, NewUserRequest, UpdatedUserResponse } from '@/types/api';
import { apiService } from '@/services/apiService';

interface AuthContextType {
  user: AuthResponse | null;
  isLoading: boolean;
  login: (credentials: AuthRequest, rememberMe?: boolean) => Promise<void>;
  register: (userData: NewUserRequest) => Promise<void>;
  logout: () => Promise<void>;
  isTokenExpired: () => Promise<boolean>;
  refreshUser: (userData: UpdatedUserResponse) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'formula_cardz_token';
const USER_KEY = 'formula_cardz_user';
const TOKEN_TIMESTAMP_KEY = 'formula_cardz_token_timestamp';
const REMEMBER_ME_KEY = 'formula_cardz_remember_me';
const TOKEN_EXPIRY_HOURS = 24;
const REMEMBER_ME_EXPIRY_HOURS = 24 * 60; // 60 days

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isTokenExpired = async (): Promise<boolean> => {
    const timestampStr = await AsyncStorage.getItem(TOKEN_TIMESTAMP_KEY);
    const rememberMeStr = await AsyncStorage.getItem(REMEMBER_ME_KEY);
    if (!timestampStr) return true;

    const timestamp = parseInt(timestampStr, 10);
    const isRememberMe = rememberMeStr === 'true';
    const now = Date.now();
    const expiryHours = isRememberMe ? REMEMBER_ME_EXPIRY_HOURS : TOKEN_EXPIRY_HOURS;
    const expiryTime = timestamp + (expiryHours * 60 * 60 * 1000);

    return now > expiryTime;
  };

  const login = async (credentials: AuthRequest, rememberMe: boolean = false): Promise<void> => {
    try {
      const response = await apiService.login(credentials);

      await AsyncStorage.setItem(TOKEN_KEY, response.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(response));
      await AsyncStorage.setItem(TOKEN_TIMESTAMP_KEY, Date.now().toString());
      await AsyncStorage.setItem(REMEMBER_ME_KEY, rememberMe ? 'true' : 'false');

      setUser(response);
    } catch (error: any) {
      throw new Error('Login failed!\nError: ' + error.message);
    }
  };

  const register = async (userData: NewUserRequest): Promise<void> => {
    try {
      const response = await apiService.register(userData);

      await AsyncStorage.setItem(TOKEN_KEY, response.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(response));
      await AsyncStorage.setItem(TOKEN_TIMESTAMP_KEY, Date.now().toString());
      await AsyncStorage.setItem(REMEMBER_ME_KEY, 'false'); // Any new account defaults to 1 day

      setUser(response);
    } catch (error: any) {
      throw new Error('Registration failed!\nError: ' + error.message);
    }
  };

  const refreshUser = async (userData: UpdatedUserResponse): Promise<void> => {
    try {
      const updatedData: AuthResponse = {
        email: userData.user.email,
        username: userData.user.username,
        token: user?.token ?? 'NOT-SET',
        id: userData.user._id,
        profileImageUrl: userData.user.profileImageUrl,
        favoriteConstructors: userData.user.favoriteConstructors,
        favoriteDrivers: userData.user.favoriteDrivers,
        hasPremium: userData.user.hasPremium,
      }
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedData));
      setUser(updatedData);
    } catch (error: any) {
      throw new Error('Refresh user failed!\nError: ' + error.message);
    }
  }

  const logout = async (): Promise<void> => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, TOKEN_TIMESTAMP_KEY, REMEMBER_ME_KEY]);
    setUser(null);
  };

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const userStr = await AsyncStorage.getItem(USER_KEY);

      if (token && userStr && !(await isTokenExpired())) {
        const userData: AuthResponse = JSON.parse(userStr);
        setUser(userData);
      } else {
        // Token expired or doesn't exist
        await logout();
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthState();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    isTokenExpired,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}