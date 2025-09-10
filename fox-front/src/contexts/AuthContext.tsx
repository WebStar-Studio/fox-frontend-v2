"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType, AuthUser, LoginCredentials, RegisterCredentials, AuthResponse, ROLE_PERMISSIONS } from '@/types';
import { authService } from '@/lib/supabase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        // Aguardar um pequeno delay para garantir que o localStorage está disponível
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const currentUser = await authService.getCurrentUser();
        
        if (isMounted) {
          setUser(currentUser);
          setIsInitialized(true);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };

    // Monitorar mudanças no estado de autenticação
    const { data: { subscription } } = authService.onAuthStateChange((authUser) => {
      if (isMounted) {
        setUser(authUser);
        if (!isInitialized) {
          setIsInitialized(true);
          setLoading(false);
        }
      }
    });

    initAuth();

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      if (response.user) {
        setUser(response.user);
      }
      return response;
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const response = await authService.register(credentials);
      if (response.user) {
        setUser(response.user);
      }
      return response;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isClient: user?.role === 'client',
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

// Hook para verificar permissões
export function usePermissions() {
  const { user, isAdmin, isClient } = useAuth();
  
  const permissions = user ? ROLE_PERMISSIONS[user.role] : null;
  
  const hasPermission = (permission: keyof typeof ROLE_PERMISSIONS.admin): boolean => {
    if (!permissions) return false;
    return permissions[permission] as boolean;
  };

  const canViewMetric = (metric: string): boolean => {
    if (!permissions) return false;
    return permissions.allowedMetrics.includes('all') || permissions.allowedMetrics.includes(metric);
  };

  return {
    permissions,
    hasPermission,
    canViewMetric,
    isAdmin,
    isClient,
  };
}
