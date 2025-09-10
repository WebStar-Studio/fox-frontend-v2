"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ResetPassword() {
  const [email, setEmail] = useState('novoadmin@gmail.com');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    setLoading(true);
    setMessage('');

    try {
      // Primeiro, fazer login como service role (apenas para teste)
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) {
        // Se não tiver acesso admin, tentar método alternativo
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/update-password`,
        });

        if (error) {
          setMessage(`Erro: ${error.message}`);
        } else {
          setMessage('Email de reset enviado! Verifique sua caixa de entrada.');
        }
      } else {
        // Se tiver acesso admin, atualizar diretamente
        const user = users?.find(u => u.email === email);
        if (user) {
          const { error } = await supabase.auth.admin.updateUserById(
            user.id,
            { password: newPassword }
          );

          if (error) {
            setMessage(`Erro: ${error.message}`);
          } else {
            setMessage('Senha atualizada com sucesso!');
          }
        } else {
          setMessage('Usuário não encontrado');
        }
      }
    } catch (error) {
      setMessage(`Erro: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async () => {
    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: newPassword,
      });

      if (error) {
        setMessage(`Erro no login: ${error.message}`);
      } else if (data.user) {
        setMessage(`Login bem-sucedido! User ID: ${data.user.id}`);
        
        // Buscar perfil
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          setMessage(prev => `${prev}\nErro ao buscar perfil: ${profileError.message}`);
        } else {
          setMessage(prev => `${prev}\nPerfil encontrado: ${profile.name} (${profile.role})`);
        }
      }
    } catch (error) {
      setMessage(`Erro: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Reset/Test Password</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Nova Senha</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Digite a nova senha"
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleResetPassword}
              disabled={loading || !email}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processando...' : 'Enviar Email de Reset'}
            </button>

            <button
              onClick={handleTestLogin}
              disabled={loading || !email || !newPassword}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Testando...' : 'Testar Login'}
            </button>
          </div>

          {message && (
            <div className={`p-3 rounded ${message.includes('Erro') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              <pre className="whitespace-pre-wrap text-sm">{message}</pre>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">Usuários conhecidos:</h3>
          <ul className="text-sm space-y-1">
            <li>• novoadmin@gmail.com (Fox Admin - admin)</li>
            <li>• admin@gmail.com (Admin - admin)</li>
            <li>• cliente@gmail.com (teste Cliente - client)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
