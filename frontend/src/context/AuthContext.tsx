import React, { createContext, useContext, useEffect, useState } from 'react';

export type UserRole = 'admin' | 'organizer' | 'user';

export interface User {
  id: number;
  ms_id: string;
  givenName: string;
  surname: string;
  jobTitle: string;
  department: string;
  displayName: string;
  role: UserRole;
  created_at: Date;
}

interface AuthContextType {
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext: Loading user from localStorage...');
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('authToken');
    console.log('AuthContext: Stored user:', storedUser);
    console.log('AuthContext: Stored token:', storedToken);
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        parsedUser.created_at = new Date(parsedUser.created_at);
        setCurrentUser(parsedUser);
        console.log('AuthContext: User loaded:', parsedUser);
      } catch (error) {
        console.error('AuthContext: Failed to parse user from localStorage:', error);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
      }
    } else {
      console.log('AuthContext: No user or token found in localStorage');
    }
    setLoading(false);
  }, []);

  const login = (user: User) => {
    console.log('AuthContext: Logging in user:', user);
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const logout = () => {
    console.log('AuthContext: Logging out user');
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading }}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};