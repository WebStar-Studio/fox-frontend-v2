import { createClient } from '@supabase/supabase-js';
import { AuthUser, LoginCredentials, RegisterCredentials, AuthResponse, User } from '@/types';

// Configurações do Supabase - Fox Delivery System
const supabaseUrl = 'https://mqjzleuzlnzxkhkbmnhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xanpsZXV6bG56eGtoa2JtbmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMjcwMDgsImV4cCI6MjA2NDgwMzAwOH0.heXYddv63EbKsdSaX7lfq3byVAEWvF5RqK-e8_lbpn4';

// Configuração otimizada para persistência de sessão
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key) => {
        if (typeof window === 'undefined') return null;
        return window.localStorage.getItem(key);
      },
      setItem: (key, value) => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(key, value);
      },
      removeItem: (key) => {
        if (typeof window === 'undefined') return;
        window.localStorage.removeItem(key);
      },
    },
  },
});

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
            role: credentials.role || 'client',
          },
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: 'Registration failed' };
      }

      // Aguardar um momento para garantir que o trigger execute
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Atualizar o perfil com email
      await supabase
        .from('user_profiles')
        .update({
          email: credentials.email,
          name: credentials.name,
          role: credentials.role || 'client',
        })
        .eq('id', data.user.id);

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
   * Obter usuário atual com sessão
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      // Primeiro verificar se há uma sessão válida
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        console.log('No valid session found');
        return null;
      }

      // Buscar dados do perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile) {
        console.warn('Profile not found for user:', session.user.id);
        return null;
      }

      return {
        id: session.user.id,
        email: session.user.email!,
        name: profile.name,
        role: profile.role,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
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

  /**
   * Obter todos os usuários com emails (apenas para administradores)
   * Usa função RPC para obter emails da tabela auth.users
   */
  async getAllUsers(): Promise<User[]> {
    try {
      console.log('🔍 Buscando todos os usuários via RPC...');
      const { data, error } = await supabase.rpc('get_users_with_emails');
      
      if (error) {
        console.error('❌ Erro na RPC get_users_with_emails:', error);
        throw error;
      }

      console.log('✅ Usuários obtidos via RPC:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Error in getAllUsers:', error);
      throw error;
    }
  }

  /**
   * Criar um novo administrador
   */
  async createAdmin(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      console.log('🔧 AuthService.createAdmin chamado com:', { ...credentials, password: '[HIDDEN]' });
      
      // Criar o usuário na autenticação com metadata incluindo role
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name,
            role: 'admin',
          },
        },
      });

      console.log('📡 Resposta do supabase.auth.signUp:', { data: data?.user?.id, error: error?.message });

      if (error) {
        console.log('❌ Erro no signUp:', error.message);
        return { user: null, error: error.message };
      }

      if (!data.user) {
        console.log('❌ Usuário não criado');
        return { user: null, error: 'Failed to create user' };
      }

      console.log('✅ Usuário criado na auth, ID:', data.user.id);

      // Aguardar um pouco para o trigger processar
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Atualizar o perfil com role admin e email
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          name: credentials.name,
          role: 'admin',
          email: credentials.email, // Salvar email no perfil
        })
        .eq('id', data.user.id);

      if (updateError) {
        console.log('❌ Erro ao atualizar perfil:', updateError.message);
        // Tentar criar o perfil se não existir
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            name: credentials.name,
            role: 'admin',
            email: credentials.email,
          });
        
        if (insertError) {
          console.log('❌ Erro ao criar perfil:', insertError.message);
          return { user: null, error: `Falha ao criar perfil: ${insertError.message}` };
        }
      }

      console.log('✅ Perfil de admin criado/atualizado com sucesso!');

      const authUser: AuthUser = {
        id: data.user.id,
        email: credentials.email,
        name: credentials.name,
        role: 'admin',
      };

      return { user: authUser };
    } catch (error) {
      console.error('Error creating admin:', error);
      return { user: null, error: 'Failed to create admin' };
    }
  }

  /**
   * Excluir um usuário (apenas para administradores)
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      console.log('🗑️ Iniciando exclusão do usuário via RPC:', userId);
      
      // Usar função RPC que contorna limitações de RLS
      const { data, error } = await supabase.rpc('delete_user_as_admin', {
        user_id_to_delete: userId
      });

      console.log('📡 Resultado da exclusão via RPC:', { data, error });

      if (error) {
        throw new Error(`Erro ao excluir usuário: ${error.message}`);
      }

      if (!data) {
        throw new Error('Falha na exclusão: função retornou false');
      }

      console.log('✅ Usuário excluído com sucesso via RPC!');

      // Nota: Para excluir completamente o usuário da autenticação,
      // seria necessário usar a API de administrador do Supabase
      // Por enquanto, apenas excluímos o perfil
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
