import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'client' | 'mechanic' | 'workshop' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  location?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  location?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    name: 'أحمد محمد',
    email: 'ahmed@example.com',
    phone: '+20123456789',
    role: 'mechanic',
    location: 'أسوان، حي الصداقة',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'فاطمة علي',
    email: 'fatima@example.com',
    phone: '+20198765432',
    role: 'client',
    location: 'أسوان، حي النصر',
    createdAt: '2024-02-20'
  },
  {
    id: '3',
    name: 'مركز الصيانة المتقدم',
    email: 'workshop@example.com',
    phone: '+20111222333',
    role: 'workshop',
    location: 'أسوان، حي الشاطئ',
    createdAt: '2024-01-10'
  },
  {
    id: '4',
    name: 'المدير العام',
    email: 'admin@example.com',
    phone: '+20100000000',
    role: 'admin',
    location: 'أسوان',
    createdAt: '2023-12-01'
  }
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Find user by email (in real app, this would be an API call)
    const foundUser = mockUsers.find(u => u.email === email);

    // For demo purposes, accept any email/password combination and determine role by email pattern
    let userRole: UserRole = 'client';
    if (email.includes('mechanic') || email.includes('ميكانيكي')) {
      userRole = 'mechanic';
    } else if (email.includes('workshop') || email.includes('مركز') || email.includes('ورشة')) {
      userRole = 'workshop';
    } else if (email.includes('admin') || email.includes('مدير')) {
      userRole = 'admin';
    }

    if (foundUser || email.includes('@')) {
      const userToLogin = foundUser || {
        id: Date.now().toString(),
        name: email.split('@')[0],
        email: email,
        phone: '+20' + Math.random().toString().slice(2, 11),
        role: userRole,
        location: 'أسوان',
        createdAt: new Date().toISOString().split('T')[0]
      };

      setUser(userToLogin);
      localStorage.setItem('currentUser', JSON.stringify(userToLogin));
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check if email already exists
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      setIsLoading(false);
      return false;
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      location: userData.location,
      createdAt: new Date().toISOString().split('T')[0]
    };

    // Add to mock users (in real app, this would be saved to database)
    mockUsers.push(newUser);

    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
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