"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeliveryStatusData, StatusDistribution } from "@/types";

interface DonutDeliveryStatusProps {
  statusDistribution: StatusDistribution[];
}

// Mapeamento de cores para diferentes status
const statusColors: Record<string, string> = {
  'delivered': '#1BC47D',
  'completed': '#1BC47D', 
  'finished': '#1BC47D',
  'done': '#1BC47D',
  'entregue': '#1BC47D',
  'concluído': '#1BC47D',
  'concluido': '#1BC47D',
  'cancelled': '#F87171',
  'canceled': '#F87171',
  'cancelado': '#F87171',
  'cancelada': '#F87171',
  'pending': '#FBBF24',
  'in_progress': '#3B82F6',
  'accepted': '#3B82F6',
  'collected': '#8B5CF6',
  'default': '#9CA3AF'
};

export function DonutDeliveryStatus({ statusDistribution }: DonutDeliveryStatusProps) {
  // Converter StatusDistribution para DeliveryStatusData
  const deliveryData: DeliveryStatusData[] = statusDistribution.map(status => ({
    name: status.status,
    value: status.count,
    color: statusColors[status.status.toLowerCase()] || statusColors['default']
  }));

  // Fallback para dados vazios
  if (deliveryData.length === 0) {
    return (
      <Card className="bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-[#001B38]">
            Delivery Completion Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-gray-500">
            Nenhum dado de status disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = deliveryData.reduce((sum, item) => sum + item.value, 0);
  const primaryStatus = deliveryData[0]; // Status mais comum

  return (
    <Card className="bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-[#001B38]">
          Delivery Completion Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <div className="relative w-64 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deliveryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  startAngle={90}
                  endAngle={450}
                  dataKey="value"
                >
                  {deliveryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#001B38]">
                  {total > 0 ? Math.round((primaryStatus.value / total) * 100) : 0}%
                </div>
                <div className="text-sm font-medium" style={{ color: primaryStatus.color }}>
                  {primaryStatus.name}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center mt-6 flex-wrap gap-4">
          {deliveryData.slice(0, 4).map((entry, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded" 
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-sm text-gray-600">
                {entry.name} ({entry.value})
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 