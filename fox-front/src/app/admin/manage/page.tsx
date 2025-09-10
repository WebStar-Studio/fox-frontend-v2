"use client";

import { useState, useEffect } from 'react';
import { AdminRoute } from "@/components/ProtectedRoute";
import { Topbar } from "@/components/Topbar";
import { Users, UserPlus, Shield, User, Trash2, Edit3, Search, Filter } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { User as UserType, RegisterCredentials } from '@/types';
import { authService } from '@/lib/supabase';

interface CreateAdminFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function AdminManageContent() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'client'>('all');
  const [formData, setFormData] = useState<CreateAdminFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  // Efeito separado para hard-refresh após 5 segundos
  useEffect(() => {
    let refreshTimeout: NodeJS.Timeout;
    
    if (loading) {
      console.log('⏱️ Iniciando timeout de 5s para hard-refresh...');
      refreshTimeout = setTimeout(() => {
        console.log('⚠️ Carregamento demorou mais de 5s, fazendo hard-refresh...');
        window.location.reload();
      }, 5000);
    }

    return () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
        console.log('✅ Timeout de refresh cancelado - carregamento concluído');
      }
    };
  }, [loading]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await authService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔧 Iniciando criação de admin...', formData);
    
    setFormError('');
    setFormSuccess('');

    // Validações
    if (!formData.name || !formData.email || !formData.password) {
      console.log('❌ Campos obrigatórios faltando');
      setFormError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      console.log('❌ Senhas não coincidem');
      setFormError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      console.log('❌ Senha muito curta');
      setFormError('Password must be at least 6 characters');
      return;
    }

    try {
      console.log('✅ Validações passaram, chamando authService.createAdmin');
      const credentials: RegisterCredentials = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: 'admin'
      };

      console.log('📤 Enviando credenciais:', { ...credentials, password: '[HIDDEN]' });
      const response = await authService.createAdmin(credentials);
      console.log('📥 Resposta recebida:', response);
      
      if (response.error) {
        console.log('❌ Erro na resposta:', response.error);
        setFormError(response.error);
      } else {
        console.log('✅ Admin criado com sucesso!');
        setFormSuccess('Administrator created successfully!');
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        setTimeout(() => {
          setShowCreateForm(false);
          loadUsers(); // Recarregar lista
        }, 1500);
      }
    } catch (error) {
      console.error('❌ Erro capturado:', error);
      setFormError(`Error creating administrator: ${error}`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    // Limpar mensagens anteriores
    setFormError('');
    setFormSuccess('');

    try {
      console.log('🗑️ Iniciando exclusão via interface...', userId);
      
      // Fazer backup local da lista antes da exclusão
      const currentUsers = [...users];
      console.log('📋 Total de usuários antes da exclusão:', currentUsers.length);
      
      await authService.deleteUser(userId);
      
      console.log('✅ Exclusão bem-sucedida, recarregando lista...');
      
      // Atualizar lista imediatamente removendo o usuário localmente
      setUsers(currentUsers.filter(u => u.id !== userId));
      
      // Mostrar mensagem de sucesso
      setFormSuccess('User deleted successfully!');
      
      // Recarregar do servidor para garantir sincronização
      setTimeout(async () => {
        try {
          console.log('🔄 Recarregando lista do servidor...');
          const updatedUsers = await authService.getAllUsers();
          console.log('📋 Total de usuários após recarregar:', updatedUsers.length);
          setUsers(updatedUsers);
          
          // Limpar mensagem de sucesso após 3 segundos
          setTimeout(() => setFormSuccess(''), 3000);
        } catch (reloadError) {
          console.error('❌ Erro ao recarregar lista:', reloadError);
        }
      }, 500);
      
    } catch (error) {
      console.error('❌ Erro ao excluir usuário:', error);
      setFormError(`Error deleting user: ${error}`);
    }
  };

  // Filtrar usuários
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const adminUsers = filteredUsers.filter(u => u.role === 'admin');
  const clientUsers = filteredUsers.filter(u => u.role === 'client');

  return (
    <div className="p-8">
      <Topbar title="Admin Management" />

      {/* Header with create admin button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#001B38]">Platform Users</h2>
          <p className="text-gray-600 mt-1">
            Manage administrators and view all users
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-[#001B38] text-white rounded-lg hover:bg-[#002855] transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create Administrator</span>
        </button>
      </div>

      {/* Success/Error alerts */}
      {formError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {formError}
        </div>
      )}
      
      {formSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {formSuccess}
        </div>
      )}

      {/* Create admin form */}
      {showCreateForm && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-[9999]"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(2px)'
          }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl border"
               onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#001B38]">Create New Administrator</h3>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setFormError('');
                  setFormSuccess('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#001B38]"
                  placeholder="Administrator name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#001B38]"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#001B38]"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#001B38]"
                  placeholder="Confirm the password"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormError('');
                    setFormSuccess('');
                  }}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#001B38] text-white rounded-md hover:bg-[#002855]"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#001B38]"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as 'all' | 'admin' | 'client')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#001B38]"
            >
              <option value="all">All users</option>
              <option value="admin">Admins only</option>
              <option value="client">Clients only</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading users...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Administrators section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-red-50">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Administrators ({adminUsers.length})
                </h3>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {adminUsers.map((admin) => (
                <div key={admin.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <Shield className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{admin.name}</div>
                        <div className="text-sm text-gray-500">{admin.email}</div>
                        <div className="text-xs text-gray-400">
                          Created on: {new Date(admin.created_at).toLocaleDateString('en-US')}
                        </div>
                      </div>
                    </div>
                    
                    {admin.id !== user?.id && (
                      <button
                        onClick={() => handleDeleteUser(admin.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete administrator"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {adminUsers.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No administrators found
                </div>
              )}
            </div>
          </div>

          {/* Clients section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-blue-50">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Clients ({clientUsers.length})
                </h3>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {clientUsers.map((client) => (
                <div key={client.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{client.name}</div>
                        <div className="text-sm text-gray-500">{client.email}</div>
                        <div className="text-xs text-gray-400">
                          Created on: {new Date(client.created_at).toLocaleDateString('en-US')}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteUser(client.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete client"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {clientUsers.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No clients found
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Summary statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{users.length}</div>
              <div className="text-sm text-gray-500">Total Users</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-red-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'admin').length}
              </div>
              <div className="text-sm text-gray-500">Administrators</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'client').length}
              </div>
              <div className="text-sm text-gray-500">Clients</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminManagePage() {
  return (
    <AdminRoute>
      <AdminManageContent />
    </AdminRoute>
  );
}
