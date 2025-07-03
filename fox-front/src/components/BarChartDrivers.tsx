"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DriverData, DriverStats } from "@/types";

interface BarChartDriversProps {
  driverStats: DriverStats[];
}

export function BarChartDrivers({ driverStats }: BarChartDriversProps) {
  // Converter DriverStats para DriverData para compatibilidade com o gráfico
  const driversData: DriverData[] = driverStats.slice(0, 5).map(stat => ({
    name: stat.driver_name,
    deliveries: stat.total_deliveries,
    successRate: stat.success_rate
  }));

  // Tooltip customizado para mostrar detalhes
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-[#001B38] mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2 mb-1">
              <div 
                className="w-3 h-3 rounded" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600">
                {entry.dataKey === 'deliveries' ? 'Deliveries' : 'Success Rate'}: 
              </span>
              <span className="text-sm font-medium">
                {entry.dataKey === 'deliveries' ? entry.value : `${entry.value.toFixed(1)}%`}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Fallback para dados vazios
  if (driversData.length === 0) {
    return (
      <Card className="bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-[#001B38]">
            Top 5 Drivers - Best Success Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-gray-500">
            Nenhum dado de motoristas disponível
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-[#001B38]">
            Top 5 Drivers - Best Success Rate
          </CardTitle>
          <button className="text-sm text-blue-600 hover:text-blue-800">
            Click to view details
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={driversData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
              />
              <YAxis 
                yAxisId="left"
                orientation="left"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
                domain={[0, 120]}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                yAxisId="left"
                dataKey="deliveries" 
                fill="#001B38" 
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
              <Bar 
                yAxisId="right"
                dataKey="successRate" 
                fill="#FF7F0E" 
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-[#001B38] rounded"></div>
            <span className="text-sm text-gray-600">Deliveries</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-[#FF7F0E] rounded"></div>
            <span className="text-sm text-gray-600">Success Rate %</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 