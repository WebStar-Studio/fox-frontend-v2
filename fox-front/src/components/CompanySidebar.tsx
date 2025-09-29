"use client";

import { LogOut, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function CompanySidebar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="fixed left-0 top-0 h-full w-72 bg-white border-r border-gray-200 shadow-sm z-10">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-[#001B38]">Fox Delivery</h1>
        <p className="text-xs text-gray-500 mt-1">Company Portal</p>
      </div>

      {/* Company Info Section */}
      <div className="p-6">
        <div className="bg-gradient-to-br from-[#001B38] to-[#002855] rounded-lg p-5 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium opacity-80 mb-1">Company</div>
              <div className="text-sm font-bold truncate">
                {user?.company_name || 'N/A'}
              </div>
            </div>
          </div>
          
          <div className="pt-3 border-t border-white/20">
            <div className="text-xs font-medium opacity-80 mb-1">Account</div>
            <div className="text-sm font-semibold truncate mb-1">
              {user?.name}
            </div>
            <div className="text-xs opacity-70 truncate">
              {user?.email}
            </div>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="absolute bottom-6 left-6 right-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
        
        <div className="text-xs text-gray-400 text-center mt-4">
          <div>Fox Delivery Dashboard</div>
          <div className="mt-1">Company Portal v2.0</div>
        </div>
      </div>
    </div>
  );
}
