"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requireAuth?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  requireAuth = true 
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Remover timeout automático - deixar a autenticação carregar normalmente
    // O timeout estava causando redirecionamentos prematuros
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Verificar autenticação quando loading terminar
    if (!loading) {
      // Limpar timeout se auth carregou com sucesso
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Se requer autenticação e usuário não está logado
      if (requireAuth && !isAuthenticated) {
        console.log('[ProtectedRoute] Not authenticated, redirecting to login');
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          router.push('/login');
        }
        return;
      }

      // Se requer role específico e usuário não tem o role
      if (requiredRole && user && user.role !== requiredRole) {
        console.log(`[ProtectedRoute] Wrong role. Required: ${requiredRole}, Current: ${user.role}`);
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          // Redirecionar baseado no role atual
          if (user.role === 'client') {
            router.push('/client-dashboard');
          } else if (user.role === 'admin') {
            router.push('/');
          } else {
            router.push('/login');
          }
        }
        return;
      }

      // Se passou todas as verificações, renderizar
      setShouldRender(true);
    }
  }, [loading, isAuthenticated, user, requiredRole, requireAuth, router]);

  // Mostrar loading enquanto verifica autenticação
  if (loading || !shouldRender) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#001B38]" />
          <span className="text-gray-600">Verificando autenticação...</span>
        </div>
      </div>
    );
  }

  // Se requer autenticação e usuário não está logado
  if (requireAuth && !isAuthenticated) {
    return null; // Vai redirecionar
  }

  // Se requer role específico e usuário não tem o role  
  if (requiredRole && user?.role !== requiredRole) {
    return null; // Vai redirecionar
  }

  return <>{children}</>;
}

// Componente específico para rotas de admin
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="admin">
      {children}
    </ProtectedRoute>
  );
}

// Componente específico para rotas de cliente
export function ClientRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="client">
      {children}
    </ProtectedRoute>
  );
}
