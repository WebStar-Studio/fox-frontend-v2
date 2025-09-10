import { createClient } from '@supabase/supabase-js';
import { AuthUser, LoginCredentials, RegisterCredentials, AuthResponse, User } from '@/types';

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

  /**
   * Obter todos os usuários com emails (apenas para administradores)
   * Usa função RPC para contornar limitações de RLS
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
            role: 'admin', // O trigger vai usar este valor
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
      console.log('✅ Trigger automático deve ter criado perfil com role=admin');

      // Aguardar um pouco para o trigger processar
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verificar se o perfil foi criado corretamente
      const { data: profile, error: checkError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      console.log('🔍 Verificando perfil criado:', { profile, checkError });

      // Se não foi criado como admin, forçar update
      if (!profile || profile.role !== 'admin') {
        console.log('⚠️ Role incorreta, forçando UPDATE para admin...');
        
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            name: credentials.name,
            role: 'admin',
          })
          .eq('id', data.user.id);

        console.log('📡 Resultado do UPDATE forçado:', { updateError });

        if (updateError) {
          console.log('❌ Erro no update forçado:', updateError.message);
          return { user: null, error: `Falha ao definir role admin: ${updateError.message}` };
        }

        console.log('✅ UPDATE forçado bem-sucedido!');
      } else {
        console.log('✅ Perfil já criado corretamente como admin!');
      }

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
