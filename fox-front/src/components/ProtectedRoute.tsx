"use client";

import { useEffect, useState } from 'react';
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
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Só verificar após o loading terminar
    if (!loading && !hasChecked) {
      setHasChecked(true);
      
      // Se requer autenticação e usuário não está logado
      if (requireAuth && !isAuthenticated) {
        console.log('Redirecting to login - not authenticated');
        router.push('/login');
        return;
      }

      // Se requer role específico e usuário não tem o role
      if (requiredRole && user && user.role !== requiredRole) {
        console.log(`Redirecting - wrong role. Required: ${requiredRole}, Current: ${user.role}`);
        // Redirecionar baseado no role atual
        if (user.role === 'client') {
          router.push('/client-dashboard');
        } else if (user.role === 'admin') {
          router.push('/');
        } else {
          router.push('/login');
        }
        return;
      }
    }
  }, [loading, isAuthenticated, user, requiredRole, requireAuth, router, hasChecked]);

  // Mostrar loading enquanto verifica autenticação
  if (loading || !hasChecked) {
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
