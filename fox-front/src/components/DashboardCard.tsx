"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DashboardCardProps } from "@/types";

export function DashboardCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  status = 'good' 
}: DashboardCardProps) {
  const statusColors = {
    good: 'text-[#1BC47D]',
    warning: 'text-yellow-500',
    critical: 'text-red-500'
  };

  return (
    <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          {icon && (
            <div className="text-gray-400">
              {icon}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="text-2xl font-bold text-[#001B38]">{value}</div>
          <div className={`text-sm font-medium ${statusColors[status]}`}>
            {subtitle}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 