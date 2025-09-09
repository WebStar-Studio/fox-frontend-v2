"use client";

import { AdminRoute } from "@/components/ProtectedRoute";
import { Topbar } from "@/components/Topbar";
import { DashboardCard } from "@/components/DashboardCard";
import { useEntregadoresMetricas, useRefreshData } from "@/hooks/useApiData";
import { 
  User, 
  TruckIcon, 
  Package,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
  Users
} from "lucide-react";

function DriversPageContent() {
  const { data: entregadoresData, isLoading, error, refetch } = useEntregadoresMetricas();
  const refreshData = useRefreshData();

  const handleRefresh = () => {
    console.log("Refreshing drivers data...");
    refreshData();
    refetch();
  };

  const handleImportData = () => {
    console.log("Importing data...");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-8">
        <Topbar 
          title="Drivers" 
          onRefresh={handleRefresh}
          onImportData={handleImportData}
        />
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading drivers data...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state (apenas para erros reais, não para dados não encontrados)
  if (error && !error.message.includes('404')) {
    return (
      <div className="p-8">
        <Topbar 
          title="Drivers" 
          onRefresh={handleRefresh}
          onImportData={handleImportData}
        />
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-6 h-6" />
            <span>Error loading drivers: {error.message}</span>
            <button 
              onClick={handleRefresh}
              className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!entregadoresData || entregadoresData.entregadores.length === 0) {
    const isDataUnavailable = error && error.message.includes('404');
    
    return (
      <div className="p-8">
        <Topbar 
          title="Drivers" 
          onRefresh={handleRefresh}
          onImportData={handleImportData}
        />
        
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <FileSpreadsheet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-[#001B38] mb-2">
            {isDataUnavailable ? 'No Data Available' : 'No Drivers Found'}
          </h3>
          <p className="text-lg text-gray-600 mb-6">
            {isDataUnavailable ? 'Upload delivery data to see driver analytics' : 'No drivers found in the current data'}
          </p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-[#001B38] text-white rounded-lg hover:bg-[#002855] transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Topbar 
        title="Drivers" 
        onRefresh={handleRefresh}
        onImportData={handleImportData}
      />

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Drivers */}
        <DashboardCard
          title="Total Drivers"
          value={entregadoresData.total_entregadores.toString()}
          subtitle={`${entregadoresData.total_entregadores} active drivers`}
          icon={<Users className="w-6 h-6" />}
          status="good"
        />

        {/* Total Deliveries */}
        <DashboardCard
          title="Total Deliveries"
          value={entregadoresData.entregadores.reduce((total, entregador) => total + entregador.entregas_entrega, 0).toString()}
          subtitle={`Across all drivers`}
          icon={<Package className="w-6 h-6" />}
          status="good"
        />

        {/* Average Deliveries */}
        <DashboardCard
          title="Average Deliveries"
          value={entregadoresData.media_entregas_por_entregador.toFixed(1)}
          subtitle={`Per driver`}
          icon={<TruckIcon className="w-6 h-6" />}
          status="good"
        />
      </div>

      {/* Drivers List Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-[#001B38]">Drivers List</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deliveries
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {entregadoresData.entregadores.map((entregador, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-gray-400 mr-3" />
                      <div className="text-sm font-medium text-gray-900">
                        {entregador.nome}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-2">
                        {entregador.entregas_entrega}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {entregador.entregas_entrega}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {entregadoresData.entregadores.length} drivers
            </span>
            <span>
              Data source: {entregadoresData.fonte === 'banco_de_dados' ? 'Database' : 'Memory'}
            </span>
          </div>
        </div>
      </div>

      {/* Top Driver Highlight */}
      {entregadoresData.entregador_mais_ativo && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#001B38] mb-2">
            🏆 Most Active Driver
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-900 font-medium">
                {entregadoresData.entregador_mais_ativo.nome}
              </p>
              <p className="text-blue-700 text-sm">
                Top performer in deliveries
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900">
                {entregadoresData.entregador_mais_ativo.entregas_entrega}
              </div>
              <div className="text-blue-700 text-sm">deliveries</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DriversPage() {
  return (
    <AdminRoute>
      <DriversPageContent />
    </AdminRoute>
  );
} 