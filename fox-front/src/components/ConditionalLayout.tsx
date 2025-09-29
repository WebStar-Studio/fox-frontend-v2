"use client";

import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/Sidebar';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  // Rotas que não devem mostrar o sidebar via ConditionalLayout
  const authRoutes = ['/login', '/register'];
  const clientRoutes = ['/client-dashboard'];
  const companyRoutes = ['/company-dashboard'];
  
  const isAuthRoute = authRoutes.includes(pathname);
  const isClientRoute = clientRoutes.includes(pathname);
  const isCompanyRoute = companyRoutes.includes(pathname);

  // Se for rota de autenticação, mostrar apenas o conteúdo
  if (isAuthRoute) {
    return <>{children}</>;
  }

  // Se for rota de cliente, mostrar layout simplificado
  if (isClientRoute) {
    return <>{children}</>;
  }

  // Se for rota de empresa, mostrar layout simplificado (sidebar já incluída na página)
  if (isCompanyRoute) {
    return <>{children}</>;
  }

  // Se não estiver autenticado e não for rota de auth, não mostrar sidebar
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Layout padrão com sidebar (para admins e outras rotas)
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-60">
        {children}
      </main>
    </div>
  );
}
