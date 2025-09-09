import { createClient } from '@supabase/supabase-js';
import { AuthUser, LoginCredentials, RegisterCredentials, AuthResponse } from '@/types';

// Configurações do Supabase - Fox Delivery System
const supabaseUrl = 'https://mqjzleuzlnzxkhkbmnhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xanpsZXV6bG56eGtoa2JtbmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMjcwMDgsImV4cCI6MjA2NDgwMzAwOH0.heXYddv63EbKsdSaX7lfq3byVAEWvF5RqK-e8_lbpn4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class AuthService {
  
  /**
   * Login do usuário
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: 'Login failed' };
      }

      // Buscar dados do perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        return { user: null, error: 'User profile not found' };
      }

      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email!,
        name: profile.name,
        role: profile.role,
      };

      return { user: authUser };
    } catch (error) {
      return { user: null, error: 'Login failed' };
    }
  }

  /**
   * Cadastro de novo usuário
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name,
          },
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: 'Registration failed' };
      }

      // O perfil será criado automaticamente pelo trigger do Supabase
      // Aguardar um momento para garantir que o trigger execute
      await new Promise(resolve => setTimeout(resolve, 1000));

      const authUser: AuthUser = {
        id: data.user.id,
        email: credentials.email,
        name: credentials.name,
        role: credentials.role || 'client',
      };

      return { user: authUser };
    } catch (error) {
      return { user: null, error: 'Registration failed' };
    }
  }

  /**
   * Logout do usuário
   */
  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  /**
   * Obter usuário atual
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      // Buscar dados do perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        return null;
      }

      return {
        id: user.id,
        email: user.email!,
        name: profile.name,
        role: profile.role,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Verificar se o usuário está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  }

  /**
   * Monitorar mudanças no estado de autenticação
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const authUser = await this.getCurrentUser();
        callback(authUser);
      } else {
        callback(null);
      }
    });
  }
}

export const authService = new AuthService();
