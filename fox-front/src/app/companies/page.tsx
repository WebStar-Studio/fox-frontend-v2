"use client";

import { AdminRoute } from "@/components/ProtectedRoute";
import { Topbar } from "@/components/Topbar";
import { DashboardCard } from "@/components/DashboardCard";
import { useEmpresasMetricas, useRefreshData } from "@/hooks/useApiData";
import { 
  Building2, 
  MapPin, 
  TrendingUp,
  AlertCircle,
  Loader2,
  FileSpreadsheet
} from "lucide-react";

function CompaniesPageContent() {
  const { data: empresasData, isLoading, error, refetch } = useEmpresasMetricas();
  const refreshData = useRefreshData();

  const handleRefresh = () => {
    console.log("Refreshing companies data...");
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
          title="Companies" 
          onRefresh={handleRefresh}
          onImportData={handleImportData}
        />
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading companies data...</span>
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
          title="Companies" 
          onRefresh={handleRefresh}
          onImportData={handleImportData}
        />
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-6 h-6" />
            <span>Error loading companies: {error.message}</span>
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
  if (!empresasData || empresasData.empresas.length === 0) {
    const isDataUnavailable = error && error.message.includes('404');
    
    return (
      <div className="p-8">
        <Topbar 
          title="Companies" 
          onRefresh={handleRefresh}
          onImportData={handleImportData}
        />
        
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <FileSpreadsheet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-[#001B38] mb-2">
            {isDataUnavailable ? 'No Data Available' : 'No Companies Found'}
          </h3>
          <p className="text-lg text-gray-600 mb-6">
            {isDataUnavailable ? 'Upload delivery data to see company analytics' : 'No companies found in the current data'}
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

  // Calculate average deliveries per company
  const averageDeliveries = empresasData.total_empresas > 0 
    ? Math.round(empresasData.total_pedidos / empresasData.total_empresas)
    : 0;

  return (
    <div className="p-8">
      <Topbar 
        title="Companies" 
        onRefresh={handleRefresh}
        onImportData={handleImportData}
      />

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Companies */}
        <DashboardCard
          title="Total Companies"
          value={empresasData.total_empresas.toString()}
          subtitle={`${empresasData.total_empresas} active companies`}
          icon={<Building2 className="w-6 h-6" />}
          status="good"
        />

        {/* Total Deliveries */}
        <DashboardCard
          title="Total Deliveries"
          value={empresasData.total_pedidos.toString()}
          subtitle={`Across all companies`}
          icon={<MapPin className="w-6 h-6" />}
          status="good"
        />

        {/* Average Deliveries */}
        <DashboardCard
          title="Average Deliveries"
          value={averageDeliveries.toString()}
          subtitle={`Per company`}
          icon={<TrendingUp className="w-6 h-6" />}
          status="good"
        />
      </div>

      {/* Company List Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-[#001B38]">Company List</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Orders
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {empresasData.empresas.map((empresa, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                      <div className="text-sm font-medium text-gray-900">
                        {empresa.nome}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-md">
                      {empresa.endereco_mais_comum}
                    </div>
                    {empresa.total_localizacoes > 1 && (
                      <div className="text-xs text-gray-500 mt-1">
                        +{empresa.total_localizacoes - 1} more location(s)
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-2">
                        {empresa.total_pedidos}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {empresa.total_pedidos}
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
              Showing {empresasData.empresas.length} companies
            </span>
            <span>
              Data source: {empresasData.fonte === 'banco_de_dados' ? 'Database' : 'Memory'}
            </span>
          </div>
        </div>
      </div>

      {/* Top Company Highlight */}
      {empresasData.empresa_mais_ativa && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#001B38] mb-2">
            🏆 Most Active Company
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-900 font-medium">
                {empresasData.empresa_mais_ativa.nome}
              </p>
              <p className="text-blue-700 text-sm">
                {empresasData.empresa_mais_ativa.total_pedidos} orders • {empresasData.empresa_mais_ativa.total_localizacoes} locations
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900">
                {empresasData.empresa_mais_ativa.total_pedidos}
              </div>
              <div className="text-blue-700 text-sm">orders</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CompaniesPage() {
  return (
    <AdminRoute>
      <CompaniesPageContent />
    </AdminRoute>
  );
}