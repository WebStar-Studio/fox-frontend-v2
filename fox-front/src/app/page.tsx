"use client";

import { Topbar } from "@/components/Topbar";
import { DashboardCard } from "@/components/DashboardCard";
import { BarChartDrivers } from "@/components/BarChartDrivers";
import { DonutDeliveryStatus } from "@/components/DonutDeliveryStatus";
import { TopDrivers } from "@/components/TopDrivers";
import { TopIntervals } from "@/components/TopIntervals";
import { UploadDialog } from "@/components/UploadDialog";
import { useDashboardData, useRefreshData, useAnaliseTemporalMetricas, useEmpresasMetricas } from "@/hooks/useApiData";
import { apiService } from "@/lib/api";
import { 
  Package, 
  TrendingUp, 
  Clock, 
  Euro, 
  Users, 
  MapPin,
  AlertCircle,
  Loader2,
  Upload,
  FileSpreadsheet,
  RefreshCw,
  Calendar,
  Building2
} from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const { 
    metricas, 
    dados, 
    driverStats, 
    statusDistribution, 
    topDrivers, 
    statusBanco, 
    isLoading, 
    error, 
    isDatabaseEmpty, 
    refetch 
  } = useDashboardData();
  
  const { data: analiseTemporalData } = useAnaliseTemporalMetricas();
  const refreshData = useRefreshData();
  const { data: empresasMetricas } = useEmpresasMetricas();

  const handleRefresh = () => {
    console.log("Refreshing dashboard...");
    refreshData();
    refetch();
  };

  const handleImportData = () => {
    // Implementar lógica de import
    console.log("Importing data...");
  };

  // Renderizar loading state
  if (isLoading) {
    return (
      <div className="p-8">
        <Topbar 
          title="Dashboard" 
          onRefresh={handleRefresh}
          onImportData={handleImportData}
        />
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Carregando dados...</span>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar error state - apenas se houver erro real de conexão
  if (error && !isDatabaseEmpty) {
    return (
      <div className="p-8">
        <Topbar 
          title="Dashboard" 
          onRefresh={handleRefresh}
          onImportData={handleImportData}
        />
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-6 h-6" />
            <span>Erro ao carregar dados: {(error as Error)?.message || 'Erro desconhecido'}</span>
            <button 
              onClick={handleRefresh}
              className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar estado de banco vazio (após clear) - usando a nova lógica estável
  if (isDatabaseEmpty) {
    console.log('🔍 Debug: Renderizando estado de banco vazio', {
      isDatabaseEmpty,
      statusBanco,
      error,
      isLoading
    });
    
    return (
      <div className="p-8">
        <Topbar 
          title="Dashboard" 
          onRefresh={handleRefresh}
          onImportData={handleImportData}
        />

        {/* Status do banco - mostrando que está conectado mas vazio */}
        {statusBanco && (
          <div className="mb-6 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center">
                <div className="w-2 h-2 rounded-full mr-2 bg-green-500"></div>
                Connected to database
              </span>
              <span className="text-gray-600">
                {statusBanco.total_registros_banco || 0} records in database
              </span>
            </div>
          </div>
        )}

        {/* Mensagem de upload personalizada */}
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="mb-6">
            <FileSpreadsheet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-[#001B38] mb-2">
              No Data Available
            </h3>
            <p className="text-lg text-gray-600 mb-6 max-w-md">
              Upload a spreadsheet to view data and analytics in your dashboard
            </p>
          </div>

          {/* Call to action */}
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <UploadDialog>
                <button className="flex items-center space-x-3 px-6 py-3 bg-[#001B38] text-white rounded-lg text-base font-medium hover:bg-[#002855] transition-colors shadow-md">
                  <Upload className="w-5 h-5" />
                  <span>Upload Spreadsheet</span>
                </button>
              </UploadDialog>

              <button
                onClick={handleRefresh}
                className="flex items-center space-x-2 px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>

            {/* Informações úteis */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg max-w-md text-sm text-gray-600">
              <div className="font-medium mb-2">📋 Supported formats:</div>
              <div className="space-y-1">
                <div>• Excel files (.xlsx, .xls)</div>
                <div>• CSV files (.csv)</div>
                <div>• Must contain delivery data columns</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Extrair métricas principais do banco de dados
  const totalDeliveries = metricas?.metricas_principais?.["Total Deliveries"] || 0;
  const totalCourierCommission = metricas?.metricas_principais?.["Total Courier Commission"] || 0;
  const activeDrivers = metricas?.metricas_principais?.["Active Drivers"] || 0;
  const totalDistance = metricas?.metricas_principais?.["Total Distance"] || 0;
  const averageDistancePerDelivery = metricas?.metricas_principais?.["Average Distance per Delivery"] || 0;
  
  // Extrair métricas de tempo do banco de dados
  const averageCollectionTime = metricas?.medias?.["Collection Time (minutos)"] || 0;
  const averageDeliveryTime = metricas?.medias?.["Delivery Time (minutos)"] || 0;
  const averageCustomerExperience = metricas?.medias?.["Customer Experience (minutos)"] || 0;
  
  const deliveredCount = metricas?.analise_status?.resumo_quantitativo?.entregas_concluidas || 0;
  
  // Extrair métricas de empresas
  const activeCompanies = empresasMetricas?.total_empresas || 0;

  // Debug: Log das métricas para verificar os dados
  console.log('🔍 Debug Dashboard - Métricas do banco:', {
    averageCollectionTime,
    averageDeliveryTime,
    averageCustomerExperience,
    totalDeliveries,
    totalCourierCommission,
    totalDistance,
    averageDistancePerDelivery,
    metricas: metricas?.medias,
    fonte: metricas?.resumo_processamento?.fonte
  });

  // Debug: Log dos top drivers
  console.log('🔍 Debug Dashboard - Top Drivers:', {
    topDriversCount: topDrivers.length,
    topDrivers: topDrivers.map(d => ({
      nome: d.nome,
      entregas_entrega: d.entregas_entrega,
      entregas_coleta: d.entregas_coleta,
      total_entregas: d.total_entregas
    }))
  });

  return (
    <div className="p-8">
      <Topbar 
        title="Dashboard" 
        onRefresh={handleRefresh}
        onImportData={handleImportData}
      />

      {/* Status do banco - indicador visual */}
      {statusBanco && (
        <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${statusBanco.banco_conectado ? 'bg-green-500' : 'bg-red-500'}`}></div>
              {statusBanco.banco_conectado ? 'Conectado ao banco de dados' : 'Desconectado do banco'}
            </span>
            <span className="text-gray-600">
              {statusBanco.total_registros_banco || 0} registros no banco | 
              {statusBanco.total_registros_memoria || 0} em memória
            </span>
          </div>
        </div>
      )}

      {/* Dashboard Overview Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[#001B38] mb-6">Dashboard Overview</h2>
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <DashboardCard
            title="Total Deliveries"
            value={totalDeliveries.toString()}
            subtitle={`${deliveredCount} completed`}
            icon={<Package className="w-5 h-5" />}
            status="good"
          />
          
          <DashboardCard
            title="Collection Time"
            value={averageCollectionTime > 0 ? apiService.formatTime(averageCollectionTime) : "0m"}
            subtitle="Average collection time"
            icon={<Clock className="w-5 h-5" />}
            status={averageCollectionTime <= 30 ? "good" : averageCollectionTime <= 60 ? "warning" : "critical"}
          />
          
          <DashboardCard
            title="Average Delivery Time"
            value={averageDeliveryTime > 0 ? apiService.formatTime(averageDeliveryTime) : "0m"}
            subtitle="Average delivery time"
            icon={<Clock className="w-5 h-5" />}
            status="good"
          />
          
          <DashboardCard
            title="Total Courier Commission"
            value={apiService.formatCurrency(totalCourierCommission)}
            subtitle={`${deliveredCount} completed orders`}
            icon={<Euro className="w-5 h-5" />}
            status="good"
          />
          
          <DashboardCard
            title="Active Drivers"
            value={activeDrivers.toString()}
            subtitle="Total drivers with deliveries"
            icon={<Users className="w-5 h-5" />}
          />
          
          <DashboardCard
            title="Active Companies"
            value={activeCompanies.toString()}
            subtitle="Total companies with orders"
            icon={<Building2 className="w-5 h-5" />}
          />
        </div>

        {/* Second Row of Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <DashboardCard
            title="Customer Experience"
            value={averageCustomerExperience > 0 ? apiService.formatTime(averageCustomerExperience) : "N/A"}
            subtitle="Total experience time (Collection + Delivery)"
            icon={<Clock className="w-5 h-5" />}
            status={averageCustomerExperience > 0 ? (averageCustomerExperience <= 90 ? "good" : averageCustomerExperience <= 180 ? "warning" : "critical") : "warning"}
          />
          
          <DashboardCard
            title="Total Distance"
            value={`${totalDistance.toFixed(1)} km`}
            subtitle="Total distance traveled"
            icon={<MapPin className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        <BarChartDrivers driverStats={driverStats} />
        <DonutDeliveryStatus statusDistribution={statusDistribution} />
      </div>

      {/* Top Drivers and Analytics Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        <TopDrivers drivers={topDrivers} />
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#001B38] mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Average Distance per Delivery</span>
              <span className="text-lg font-bold text-[#001B38]">{averageDistancePerDelivery.toFixed(1)} km</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Active Drivers</span>
              <span className="text-lg font-bold text-[#001B38]">{activeDrivers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Completed Deliveries</span>
              <span className="text-lg font-bold text-[#001B38]">{deliveredCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Temporal Analysis Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <TopIntervals intervals={analiseTemporalData?.analise_temporal?.top10_intervalos_30min || []} />
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#001B38] mb-4">Temporal Insights</h3>
          {analiseTemporalData ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Orders Analyzed</span>
                <span className="text-lg font-bold text-[#001B38]">
                  {analiseTemporalData.resumo.total_pedidos_analisados}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Different Time Slots</span>
                <span className="text-lg font-bold text-[#001B38]">
                  {analiseTemporalData.resumo.total_horarios_diferentes}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Peak Intervals (30min)</span>
                <span className="text-lg font-bold text-[#001B38]">
                  {analiseTemporalData.resumo.total_intervalos_analisados}
                </span>
              </div>
              {analiseTemporalData.resumo.horario_mais_movimentado && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">Busiest Time Slot</div>
                  <div className="text-lg font-bold text-[#001B38]">
                    {analiseTemporalData.resumo.horario_mais_movimentado.data_hora}
                  </div>
                  <div className="text-sm text-gray-600">
                    {analiseTemporalData.resumo.horario_mais_movimentado.quantidade_pedidos} orders
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">Loading temporal data...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
