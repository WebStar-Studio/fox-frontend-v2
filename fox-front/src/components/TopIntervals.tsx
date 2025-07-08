"use client";

import { IntervaloTemporal } from "@/types";
import { Clock, TrendingUp, Calendar } from "lucide-react";

interface TopIntervalsProps {
  intervals: IntervaloTemporal[];
}

export function TopIntervals({ intervals }: TopIntervalsProps) {
  if (!intervals || intervals.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#001B38]">Top Peak Hours</h3>
          <Clock className="w-5 h-5 text-gray-400" />
        </div>
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No temporal data available</p>
        </div>
      </div>
    );
  }

  // Mostrar apenas os top 5 intervalos
  const topIntervals = intervals.slice(0, 5);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#001B38]">Top Peak Hours</h3>
        <TrendingUp className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="space-y-3">
        {topIntervals.map((interval, index) => (
          <div
            key={interval.intervalo_centro}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-800' :
                  index === 1 ? 'bg-gray-100 text-gray-800' :
                  index === 2 ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {index + 1}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">
                    {interval.descricao}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500">
                    {interval.dia_semana}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    {interval.periodo_do_dia}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-[#001B38]">
                {interval.quantidade_pedidos}
              </span>
              <span className="text-sm text-gray-500">orders</span>
            </div>
          </div>
        ))}
      </div>
      
      {intervals.length > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Showing top 5 of {intervals.length} peak intervals
          </p>
        </div>
      )}
    </div>
  );
} 