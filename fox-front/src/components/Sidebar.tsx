"use client";

import { 
  LayoutDashboard, 
  Building2,
  Users,
  LogOut,
  User,
  Settings
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarItem } from "@/types";

const sidebarItems: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    href: "/",
    isActive: false
  },
  {
    id: "companies",
    label: "Companies",
    icon: <Building2 className="w-5 h-5" />,
    href: "/companies",
    isActive: false
  },
  {
    id: "drivers",
    label: "Drivers",
    icon: <Users className="w-5 h-5" />,
    href: "/drivers",
    isActive: false
  },
  {
    id: "admin-manage",
    label: "Gerenciar Admins",
    icon: <Settings className="w-5 h-5" />,
    href: "/admin/manage",
    isActive: false
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const isActiveRoute = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="fixed left-0 top-0 h-full w-60 bg-white border-r border-gray-200 z-10">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-[#001B38]">Fox Delivery</h1>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive = isActiveRoute(item.href);
            
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-[#001B38] border-r-2 border-[#001B38] font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-[#001B38]"
                  }`}
                >
                  <span className={isActive ? "text-[#001B38]" : "text-gray-400"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info and Logout */}
      <div className="absolute bottom-4 left-4 right-4 space-y-3">
        {user && (
          <div className="border-t border-gray-200 pt-3">
            <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-md">
              <div className="flex items-center justify-center w-8 h-8 bg-[#001B38] rounded-full">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-900 truncate">
                  {user.name}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user.role === 'admin' ? 'Administrador' : 'Cliente'}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-2 flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        )}
        
        <div className="text-xs text-gray-500 text-center">
          <div>Fox Delivery Dashboard</div>
          <div className="mt-1">v2.0</div>
        </div>
      </div>
    </div>
  );
} 