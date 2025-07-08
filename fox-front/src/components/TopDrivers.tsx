"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, Award, TrendingUp } from "lucide-react";
import { EntregadorMetricas } from "@/types";

interface TopDriversProps {
  drivers: EntregadorMetricas[];
}

export function TopDrivers({ drivers }: TopDriversProps) {
  
  // Filtrar e ordenar os drivers por entregas_entrega (não total_entregas)
  const topDrivers = drivers
    .filter(driver => driver.entregas_entrega > 0)
    .sort((a, b) => b.entregas_entrega - a.entregas_entrega)
    .slice(0, 5);

  if (topDrivers.length === 0) {
    return (
      <Card className="bg-white border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#001B38]">Top 5 Drivers</h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex items-center justify-center h-32 text-gray-500">
            <p>No delivery data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#001B38]">Top 5 Drivers</h3>
          <Users className="w-5 h-5 text-gray-400" />
        </div>

        <div className="space-y-4">
          {topDrivers.map((driver, index) => (
            <div
              key={`${driver.nome}-${index}`}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#001B38] text-white font-bold">
                  {index === 0 ? (
                    <Award className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-[#001B38]">{driver.nome}</h4>
                  <p className="text-sm text-gray-600">
                    {driver.entregas_coleta} collections · {driver.entregas_entrega} deliveries
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-lg font-bold text-[#001B38]">
                    {driver.entregas_entrega}
                  </span>
                </div>
                <p className="text-sm text-gray-500">deliveries</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Based on delivery count</span>
            <span>{drivers.length} total drivers</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 