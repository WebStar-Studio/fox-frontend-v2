"use client";

import { useState, useEffect } from 'react';
import { AdminRoute } from "@/components/ProtectedRoute";
import { Topbar } from "@/components/Topbar";
import { Users, UserPlus, Shield, Building2, Trash2, Search, Filter } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { User as UserType, RegisterCredentials, AvailableCompany } from '@/types';
import { authService } from '@/lib/supabase';

type CreateMode = 'admin' | 'company';

interface CreateUserFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  company_name?: string;
}

function AdminManageContent() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [availableCompanies, setAvailableCompanies] = useState<AvailableCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createMode, setCreateMode] = useState<CreateMode>('admin');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'company'>('all');
  const [formData, setFormData] = useState<CreateUserFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company_name: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    loadUsers();
    loadCompanies();
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

  const loadCompanies = async () => {
    try {
      const companies = await authService.getAvailableCompanies();
      setAvailableCompanies(companies);
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`🔧 Iniciando criação de ${createMode}...`, formData);
    
    setFormError('');
    setFormSuccess('');

    // Validações
    if (!formData.name || !formData.email || !formData.password) {
      console.log('❌ Campos obrigatórios faltando');
      setFormError('All fields are required');
      return;
    }

    if (createMode === 'company' && !formData.company_name) {
      setFormError('Company selection is required');
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
      const credentials: RegisterCredentials = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: createMode,
        company_name: formData.company_name
      };

      console.log('📤 Enviando credenciais:', { ...credentials, password: '[HIDDEN]' });
      
      const response = createMode === 'admin' 
        ? await authService.createAdmin(credentials)
        : await authService.createCompanyAccount(credentials);
      
      console.log('📥 Resposta recebida:', response);
      
      if (response.error) {
        console.log('❌ Erro na resposta:', response.error);
        setFormError(response.error);
      } else {
        console.log(`✅ ${createMode} criado com sucesso!`);
        setFormSuccess(`${createMode === 'admin' ? 'Administrator' : 'Company account'} created successfully!`);
        
        // Limpar formulário
        setFormData({ name: '', email: '', password: '', confirmPassword: '', company_name: '' });
        
        // Recarregar lista imediatamente
        await loadUsers();
        
        // Fechar popup após mostrar sucesso por um breve momento
        setTimeout(() => {
          setFormSuccess('');
          setShowCreateForm(false);
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Erro capturado:', error);
      setFormError(`Error creating ${createMode}: ${error}`);
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
                         u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (u.company_name && u.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const adminUsers = filteredUsers.filter(u => u.role === 'admin');
  const companyUsers = filteredUsers.filter(u => u.role === 'company');

  return (
    <div className="p-8">
      <Topbar title="Admin Management" />

      {/* Header with create buttons */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#001B38]">Platform Users</h2>
          <p className="text-gray-600 mt-1">
            Manage administrators and company accounts
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setCreateMode('admin');
              setFormData({ name: '', email: '', password: '', confirmPassword: '', company_name: '' });
              setShowCreateForm(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-[#001B38] text-white rounded-lg hover:bg-[#002855] transition-colors"
          >
            <Shield className="w-4 h-4" />
            <span>Create Admin</span>
          </button>
          <button
            onClick={() => {
              setCreateMode('company');
              setFormData({ name: '', email: '', password: '', confirmPassword: '', company_name: '' });
              setShowCreateForm(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Building2 className="w-4 h-4" />
            <span>Create Company</span>
          </button>
        </div>
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

      {/* Create user form */}
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
              <h3 className="text-lg font-semibold text-[#001B38]">
                Create New {createMode === 'admin' ? 'Administrator' : 'Company Account'}
              </h3>
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

            <form onSubmit={handleCreateUser} className="space-y-4">
              {createMode === 'company' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Company *
                  </label>
                  <select
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#001B38]"
                    required={createMode === 'company'}
                  >
                    <option value="">Select a company</option>
                    {availableCompanies.map((company) => (
                      <option key={company.company_name} value={company.company_name}>
                        {company.company_name} ({company.total_deliveries} deliveries)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#001B38]"
                  placeholder={createMode === 'admin' ? 'Administrator name' : 'Account holder name'}
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
                  placeholder="email@example.com"
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
                  Create {createMode === 'admin' ? 'Admin' : 'Company'}
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
              onChange={(e) => setFilterRole(e.target.value as 'all' | 'admin' | 'company')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#001B38]"
            >
              <option value="all">All users</option>
              <option value="admin">Admins only</option>
              <option value="company">Companies only</option>
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

          {/* Companies section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-blue-50">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Companies ({companyUsers.length})
                </h3>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {companyUsers.map((company) => (
                <div key={company.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{company.name}</div>
                        <div className="text-sm text-gray-500">{company.email}</div>
                        <div className="text-sm font-medium text-blue-600">{company.company_name}</div>
                        <div className="text-xs text-gray-400">
                          Created on: {new Date(company.created_at).toLocaleDateString('en-US')}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteUser(company.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete company account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {companyUsers.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No company accounts found
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
            <Building2 className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'company').length}
              </div>
              <div className="text-sm text-gray-500">Companies</div>
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
