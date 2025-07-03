"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EntregadorMetricas } from "@/types";
import { Users, Package, TrendingUp, Award, Clock } from "lucide-react";

interface TopDriversDialogProps {
  isOpen: boolean;
  onClose: () => void;
  drivers: EntregadorMetricas[];
}

export function TopDriversDialog({ isOpen, onClose, drivers }: TopDriversDialogProps) {
  // Filtrar e ordenar os drivers por entregas_entrega (não total_entregas)
  const topDrivers = drivers
    .filter(driver => driver.entregas_entrega > 0)
    .sort((a, b) => b.entregas_entrega - a.entregas_entrega)
    .slice(0, 5);

  const totalDeliveries = topDrivers.reduce((sum, driver) => sum + driver.entregas_entrega, 0);
  const totalCollections = topDrivers.reduce((sum, driver) => sum + driver.entregas_coleta, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-yellow-500" />
            <span>Top 5 Drivers - Detailed Performance</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Total Deliveries</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">{totalDeliveries}</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Total Collections</span>
              </div>
              <div className="text-2xl font-bold text-green-900">{totalCollections}</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Top Drivers</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">{topDrivers.length}</div>
            </div>
          </div>

          {/* Drivers List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#001B38] mb-4">Driver Performance Details</h3>
            
            {topDrivers.map((driver, index) => (
              <div
                key={`${driver.nome}-${index}`}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#001B38] text-white font-bold">
                      {index === 0 ? (
                        <Award className="w-6 h-6 text-yellow-400" />
                      ) : (
                        <span className="text-lg">{index + 1}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-[#001B38] mb-1">{driver.nome}</h4>
                      <div className="flex items-center space-x-2">
                        {index === 0 && (
                          <div className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            🏆 Top Performer
                          </div>
                        )}
                        {driver.entregas_entrega >= 50 && (
                          <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            High Volume
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[#001B38]">{driver.entregas_entrega}</div>
                    <div className="text-sm text-gray-500">deliveries</div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Package className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Collections</span>
                    </div>
                    <div className="text-xl font-bold text-gray-900">{driver.entregas_coleta}</div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Total Orders</span>
                    </div>
                    <div className="text-xl font-bold text-gray-900">{driver.total_entregas}</div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Performance</span>
                    </div>
                    <div className="text-xl font-bold text-gray-900">
                      {driver.entregas_entrega > 0 ? 
                        `${((driver.entregas_entrega / totalDeliveries) * 100).toFixed(1)}%` : 
                        '0%'
                      }
                    </div>
                    <div className="text-xs text-gray-500">of top 5 deliveries</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Stats */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-600 mb-1">Average Deliveries</div>
                <div className="text-lg font-bold text-[#001B38]">
                  {topDrivers.length > 0 ? Math.round(totalDeliveries / topDrivers.length) : 0}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Average Collections</div>
                <div className="text-lg font-bold text-[#001B38]">
                  {topDrivers.length > 0 ? Math.round(totalCollections / topDrivers.length) : 0}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Total Orders</div>
                <div className="text-lg font-bold text-[#001B38]">
                  {totalDeliveries + totalCollections}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Data Source</div>
                <div className="text-lg font-bold text-[#001B38]">Database</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 