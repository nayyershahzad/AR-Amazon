import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified: boolean;
  monthlyIncome: number;
  monthlyExpenses: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const initAuth = () => {
      console.log('useAuth: Initializing authentication state');
      const token = localStorage.getItem('authToken');
      const userInfo = localStorage.getItem('userInfo');
      
      console.log('useAuth: Token exists:', !!token);
      console.log('useAuth: UserInfo exists:', !!userInfo);

      if (token && userInfo) {
        try {
          const user = JSON.parse(userInfo);
          console.log('useAuth: User parsed successfully:', user.email);
          setAuthState({
            user,
            token,
            isLoading: false,
            isAuthenticated: true,
          });
          console.log('useAuth: Set authenticated state');
        } catch (error) {
          console.error('Error parsing user info:', error);
          logout();
        }
      } else {
        console.log('useAuth: No token or userInfo, setting unauthenticated');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
    
    // Listen for storage changes (in case token is set in another tab/component)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken' || e.key === 'userInfo') {
        console.log('useAuth: localStorage change detected, re-initializing');
        initAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for a custom event that we can dispatch
    const handleAuthRefresh = () => {
      console.log('useAuth: Auth refresh event received');
      initAuth();
    };
    
    window.addEventListener('auth-refresh', handleAuthRefresh);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-refresh', handleAuthRefresh);
    };
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userInfo', JSON.stringify(user));
    setAuthState({
      user,
      token,
      isLoading: false,
      isAuthenticated: true,
    });
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  const updateUser = (updatedUser: Partial<User>) => {
    if (authState.user) {
      const newUser = { ...authState.user, ...updatedUser };
      localStorage.setItem('userInfo', JSON.stringify(newUser));
      setAuthState(prev => ({
        ...prev,
        user: newUser,
      }));
    }
  };

  // Helper function to make authenticated API calls
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const backendURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const token = authState.token;

    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(`${backendURL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Token expired or invalid
      logout();
      throw new Error('Authentication expired');
    }

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    return response.json();
  };

  return {
    ...authState,
    login,
    logout,
    updateUser,
    apiCall,
  };
};

export default useAuth;
export type { User, AuthState };