"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DriverStats } from "@/types";

interface BarChartDriversProps {
  driverStats: DriverStats[];
}

export function BarChartDrivers({ driverStats }: BarChartDriversProps) {
  // Converter DriverStats para formato simplificado apenas com deliveries
  const driversData = driverStats.slice(0, 5).map(stat => ({
    name: stat.driver_name,
    deliveries: stat.total_deliveries
  }));

  // Tooltip customizado para mostrar apenas deliveries
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
                Deliveries: 
              </span>
              <span className="text-sm font-medium">
                {entry.value}
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
            Top 5 Drivers - Deliveries
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
        <CardTitle className="text-lg font-semibold text-[#001B38]">
          Top 5 Drivers - Deliveries
        </CardTitle>
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
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="deliveries" 
                fill="#001B38" 
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
        </div>
      </CardContent>
    </Card>
  );
} 