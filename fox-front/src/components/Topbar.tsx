"use client";

import { RefreshCw, Upload, Trash2 } from "lucide-react";
import { UploadDialog } from "./UploadDialog";
import { ClearDataDialog } from "./ClearDataDialog";

interface TopbarProps {
  title: string;
  onRefresh?: () => void;
  onImportData?: () => void;
}

export function Topbar({ title, onRefresh, onImportData }: TopbarProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <nav className="text-sm text-blue-600 mb-1">Dashboard</nav>
        <h1 className="text-2xl font-bold text-[#001B38]">{title}</h1>
      </div>
      
      <div className="flex items-center space-x-3">
        <button
          onClick={onRefresh}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-[#001B38] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
        
        <ClearDataDialog>
          <button className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors">
            <Trash2 className="w-4 h-4" />
            <span>Clear Data</span>
          </button>
        </ClearDataDialog>
        
        <UploadDialog>
          <button className="flex items-center space-x-2 px-4 py-2 bg-[#001B38] text-white rounded-md text-sm font-medium hover:bg-[#002855] transition-colors">
            <Upload className="w-4 h-4" />
            <span>Import Data</span>
          </button>
        </UploadDialog>
      </div>
    </div>
  );
} 