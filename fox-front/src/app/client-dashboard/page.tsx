"use client";

import { ClientRoute } from "@/components/ProtectedRoute";
import { DashboardCard } from "@/components/DashboardCard";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardData } from "@/hooks/useApiData";
import { 
  Package, 
  Clock, 
  TrendingUp, 
  Users,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
  LogOut,
  User
} from "lucide-react";

function ClientDashboardContent() {
  const { user, logout } = useAuth();
  const { metricas, isLoading, error, isDatabaseEmpty } = useDashboardData();

  const handleLogout = async () => {
    await logout();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-[#001B38]">Client Dashboard</h1>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Hello, {user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading data...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !isDatabaseEmpty) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-[#001B38]">Client Dashboard</h1>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Hello, {user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-6 h-6" />
            <span>Error loading data</span>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (isDatabaseEmpty || !metricas) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-[#001B38]">Client Dashboard</h1>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Hello, {user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center h-64 text-center px-4">
          <FileSpreadsheet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-[#001B38] mb-2">
            No data available
          </h3>
          <p className="text-lg text-gray-600 mb-6">
            Please wait while delivery data is being loaded into the system
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-[#001B38]">Client Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Overview of your deliveries</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-md">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">{user?.name}</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Client</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Cards - Only metrics allowed for clients */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Deliveries */}
          <DashboardCard
            title="Total Deliveries"
            value={metricas.resumo_processamento.total_linhas.toString()}
            subtitle="Processed deliveries"
            icon={<Package className="w-6 h-6" />}
            status="good"
          />

          {/* Collection Time */}
          <DashboardCard
            title="Collection Time"
            value={
              metricas.medias['Collection Time (minutos)'] 
                ? `${metricas.medias['Collection Time (minutos)']?.toFixed(1)}min`
                : 'N/A'
            }
            subtitle="Average collection time"
            icon={<Clock className="w-6 h-6" />}
            status={
              metricas.medias['Collection Time (minutos)'] && metricas.medias['Collection Time (minutos)'] < 30 
                ? 'good' 
                : 'warning'
            }
          />

          {/* Delivery Time */}
          <DashboardCard
            title="Delivery Time"
            value={
              metricas.medias['Delivery Time (minutos)'] 
                ? `${metricas.medias['Delivery Time (minutos)']?.toFixed(1)}min`
                : 'N/A'
            }
            subtitle="Average delivery time"
            icon={<TrendingUp className="w-6 h-6" />}
            status={
              metricas.medias['Delivery Time (minutos)'] && metricas.medias['Delivery Time (minutos)'] < 60 
                ? 'good' 
                : 'warning'
            }
          />

          {/* Customer Experience */}
          <DashboardCard
            title="Customer Experience"
            value={
              metricas.medias['Customer Experience (minutos)'] 
                ? `${metricas.medias['Customer Experience (minutos)']?.toFixed(1)}min`
                : 'N/A'
            }
            subtitle="Average total time"
            icon={<Users className="w-6 h-6" />}
            status={
              metricas.medias['Customer Experience (minutos)'] && metricas.medias['Customer Experience (minutos)'] < 90 
                ? 'good' 
                : 'warning'
            }
          />
        </div>

        {/* Delivery Completion Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#001B38] mb-4">Delivery Completion Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {metricas.analise_status.resumo_percentual.entregas_concluidas.toFixed(1)}%
              </div>
              <div className="text-sm text-green-700 mt-1">Completed Deliveries</div>
              <div className="text-xs text-green-600 mt-2">
                {metricas.analise_status.resumo_quantitativo.entregas_concluidas} deliveries
              </div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">
                {metricas.analise_status.resumo_percentual.entregas_canceladas.toFixed(1)}%
              </div>
              <div className="text-sm text-red-700 mt-1">Cancelled Deliveries</div>
              <div className="text-xs text-red-600 mt-2">
                {metricas.analise_status.resumo_quantitativo.entregas_canceladas} deliveries
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-600">
                {metricas.analise_status.resumo_percentual.outros_status.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-700 mt-1">Other Status</div>
              <div className="text-xs text-gray-600 mt-2">
                {metricas.analise_status.resumo_quantitativo.outros_status} deliveries
              </div>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[#001B38] mb-4">Performance Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Success Rate</span>
              <span className="font-semibold text-green-600">
                {metricas.analise_status.taxa_sucesso.percentual.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Total Deliveries</span>
              <span className="font-semibold">
                {metricas.analise_status.resumo_quantitativo.total_entregas}
              </span>
            </div>
            
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Dashboard updated in real time • Secure and private data</p>
        </div>
      </div>
    </div>
  );
}

export default function ClientDashboardPage() {
  return (
    <ClientRoute>
      <ClientDashboardContent />
    </ClientRoute>
  );
}
