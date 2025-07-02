"use client";

import { 
  LayoutDashboard, 
  BarChart3, 
  Map, 
  Truck, 
  Building2, 
  Brain, 
  Upload 
} from "lucide-react";
import { SidebarItem } from "@/types";

const sidebarItems: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    href: "/dashboard",
    isActive: true
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: <BarChart3 className="w-5 h-5" />,
    href: "/analytics"
  },
  {
    id: "geographic",
    label: "Geographic Analysis",
    icon: <Map className="w-5 h-5" />,
    href: "/geographic"
  },
  {
    id: "drivers",
    label: "Drivers",
    icon: <Truck className="w-5 h-5" />,
    href: "/drivers"
  },
  {
    id: "deliveries",
    label: "Deliveries",
    icon: <Building2 className="w-5 h-5" />,
    href: "/deliveries"
  },
  {
    id: "companies",
    label: "Companies",
    icon: <Building2 className="w-5 h-5" />,
    href: "/companies"
  },
  {
    id: "smart-analysis",
    label: "Smart Analysis",
    icon: <Brain className="w-5 h-5" />,
    href: "/smart-analysis"
  },
  {
    id: "data-import",
    label: "Data Import",
    icon: <Upload className="w-5 h-5" />,
    href: "/data-import"
  }
];

export function Sidebar() {
  return (
    <div className="fixed left-0 top-0 h-full w-60 bg-white border-r border-gray-200 z-10">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-[#001B38]">Fox Delivery</h1>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => (
            <li key={item.id}>
              <a
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  item.isActive
                    ? "bg-blue-50 text-[#001B38] border-r-2 border-[#001B38]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-[#001B38]"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
} 