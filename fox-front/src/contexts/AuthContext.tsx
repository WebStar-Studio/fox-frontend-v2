"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType, AuthUser, LoginCredentials, RegisterCredentials, AuthResponse, ROLE_PERMISSIONS } from '@/types';
import { authService, supabase } from '@/lib/supabase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let initComplete = false;

    const initAuth = async () => {
      if (initComplete) return;
      initComplete = true;

      try {
        console.log('[AuthContext] Starting auth initialization...');
        
        // Forçar refresh da sessão no Supabase
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (session && !error) {
            console.log('[AuthContext] Session refreshed successfully');
          }
        } catch (refreshError) {
          console.warn('[AuthContext] Session refresh error:', refreshError);
        }

        const currentUser = await authService.getCurrentUser();
        
        if (isMounted) {
          console.log('[AuthContext] User loaded:', currentUser?.email || 'No user');
          setUser(currentUser);
          setLoading(false);
        }
      } catch (error) {
        console.error('[AuthContext] Init error:', error);
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    // Escutar mudanças de autenticação
    const { data: { subscription } } = authService.onAuthStateChange((authUser) => {
      console.log('[AuthContext] Auth state changed:', authUser?.email || 'No user');
      if (isMounted && !loading) {
        setUser(authUser);
      }
    });

    // Detectar se é uma nova aba/janela
    const isNewTab = !sessionStorage.getItem('auth-initialized');
    
    if (isNewTab) {
      console.log('[AuthContext] New tab detected, forcing immediate init');
      sessionStorage.setItem('auth-initialized', 'true');
      initAuth(); // Inicializar imediatamente em nova aba
    } else {
      // Em recarregamento normal, pequeno delay
      const timer = setTimeout(() => {
        initAuth();
      }, 50);
      
      return () => {
        isMounted = false;
        clearTimeout(timer);
        subscription?.unsubscribe();
      };
    }

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
