"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CompanyRoute } from "@/components/ProtectedRoute";
import { Sidebar } from "@/components/Sidebar";
import { Building2, Package, Clock, TrendingUp, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { apiService } from '@/lib/api';
import { EmpresaMetricasDetalhadas } from '@/types';

function CompanyDashboardContent() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<EmpresaMetricasDetalhadas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar se tem company_name
    if (!user?.company_name) {
      setError('No company assigned to this account');
      setLoading(false);
      return;
    }

    loadCompanyMetrics();
  }, [user]);

  const loadCompanyMetrics = async () => {
    if (!user?.company_name) return;

    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getEmpresaMetricasEspecifica(user.company_name);
      setMetrics(response.metricas);
    } catch (err) {
      console.error('Error loading company metrics:', err);
      setError('Failed to load company data');
    } finally {
      setLoading(false);
    }
  };

  const formatMinutes = (minutes: number | null) => {
    if (minutes === null) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-[#001B38] mx-auto mb-4 animate-pulse" />
          <div className="text-gray-600">Loading your company data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <XCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Data</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">No Data Available</h3>
          <p className="text-yellow-700">No delivery data found for your company</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-72 min-h-screen bg-gray-50 p-6 md:p-8">{/* Header */}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-3">
          <div className="w-16 h-16 bg-[#001B38] rounded-full flex items-center justify-center">
            <Building2 className="w-9 h-9 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-[#001B38]">{user?.company_name}</h1>
            <p className="text-lg text-gray-600">Delivery Performance Dashboard</p>
          </div>
        </div>
      </div>

      {/* Main Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Deliveries */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Package className="w-10 h-10 opacity-90" />
            <div className="text-4xl font-bold">{metrics.total_deliveries}</div>
          </div>
          <div className="text-base font-semibold opacity-95">Total Deliveries</div>
          <div className="text-xs opacity-80 mt-1">All analyzed orders</div>
        </div>

        {/* Collection Time */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-10 h-10 opacity-90" />
            <div className="text-4xl font-bold">{formatMinutes(metrics.collection_time.media_minutos)}</div>
          </div>
          <div className="text-base font-semibold opacity-95">Avg Collection Time</div>
          <div className="text-xs opacity-80 mt-1">{metrics.collection_time.amostras_validas} samples</div>
        </div>

        {/* Delivery Time */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-10 h-10 opacity-90" />
            <div className="text-4xl font-bold">{formatMinutes(metrics.delivery_time.media_minutos)}</div>
          </div>
          <div className="text-base font-semibold opacity-95">Avg Delivery Time</div>
          <div className="text-xs opacity-80 mt-1">{metrics.delivery_time.amostras_validas} samples</div>
        </div>

        {/* Delayed Orders */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <AlertCircle className="w-10 h-10 opacity-90" />
            <div className="text-4xl font-bold">{metrics.delayed_orders.percentual}%</div>
          </div>
          <div className="text-base font-semibold opacity-95">Delayed Orders</div>
          <div className="text-xs opacity-80 mt-1">{metrics.delayed_orders.total} of {metrics.delayed_orders.total_com_metricas}</div>
        </div>
      </div>

      {/* Detailed Metrics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Customer Experience */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle2 className="w-6 h-6 text-[#001B38]" />
            <h3 className="text-xl font-semibold text-[#001B38]">Customer Experience</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Time:</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatMinutes(metrics.customer_experience.media_minutos)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Minimum Time:</span>
              <span className="text-lg font-medium text-green-600">
                {formatMinutes(metrics.customer_experience.minimo_minutos)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Maximum Time:</span>
              <span className="text-lg font-medium text-red-600">
                {formatMinutes(metrics.customer_experience.maximo_minutos)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-gray-600">Valid Samples:</span>
              <span className="text-lg font-medium text-gray-900">
                {metrics.customer_experience.amostras_validas}
              </span>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-6 h-6 text-[#001B38]" />
            <h3 className="text-xl font-semibold text-[#001B38]">Performance Summary</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Orders Analyzed:</span>
              <span className="text-lg font-semibold text-gray-900">
                {metrics.resumo_performance.pedidos_analisados}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Complete Metrics:</span>
              <span className="text-lg font-semibold text-gray-900">
                {metrics.resumo_performance.pedidos_com_metricas_completas}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-gray-600">Success Rate:</span>
              <span className="text-lg font-bold text-green-600">
                {metrics.resumo_performance.taxa_sucesso_metricas.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Time Ranges */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-[#001B38] mb-6">Time Range Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Collection Time Details */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Collection Time
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Average:</span>
                <span className="font-medium">{formatMinutes(metrics.collection_time.media_minutos)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Best:</span>
                <span className="font-medium text-green-600">{formatMinutes(metrics.collection_time.minimo_minutos)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Worst:</span>
                <span className="font-medium text-red-600">{formatMinutes(metrics.collection_time.maximo_minutos)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Time Details */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3 flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Delivery Time
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Average:</span>
                <span className="font-medium">{formatMinutes(metrics.delivery_time.media_minutos)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Best:</span>
                <span className="font-medium text-green-600">{formatMinutes(metrics.delivery_time.minimo_minutos)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Worst:</span>
                <span className="font-medium text-red-600">{formatMinutes(metrics.delivery_time.maximo_minutos)}</span>
              </div>
            </div>
          </div>

          {/* Delayed Orders Details */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Delays Analysis
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Delayed:</span>
                <span className="font-medium">{metrics.delayed_orders.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delay Rate:</span>
                <span className="font-medium text-orange-600">{metrics.delayed_orders.percentual}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Criterion:</span>
                <span className="font-medium text-xs">&gt; 60 min</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-5">
        <div className="flex items-start space-x-3">
          <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Dashboard Information</h4>
            <p className="text-sm text-blue-700 leading-relaxed">
              This dashboard displays real-time metrics for <strong>{user?.company_name}</strong>. 
              Data is automatically updated and includes all historical delivery information from the database. 
              Time metrics are calculated based on submission, collection, and delivery timestamps, excluding waiting times.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CompanyDashboardPage() {
  return (
    <CompanyRoute>
      <Sidebar />
      <CompanyDashboardContent />
    </CompanyRoute>
  );
}
