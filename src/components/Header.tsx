import React, { useState, useRef, useEffect } from 'react';
import { 
  Laptop, 
  Download, 
  RotateCcw, 
  Plus, 
  FileSpreadsheet, 
  Table2, 
  Layers, 
  FileJson, 
  ChevronDown,
  FileText,
  Users,
  History,
  SlidersHorizontal,
  ShieldCheck,
  Phone,
  Factory,
  LayoutDashboard
} from 'lucide-react';
import { Asset, User, CategoryStockSummary, AssetHistoryEvent } from '../types/inventory';
import { 
  exportAllAssetsCSV, 
  exportEquipmentCSV,
  exportUserDirectoryCSV, 
  exportStockSummaryCSV, 
  exportHistoryLogsCSV,
  exportCompleteJSON, 
  downloadUploadTemplateCSV 
} from '../utils/export';

interface HeaderProps {
  activeTab: 'overview' | 'equipment' | 'production' | 'users_manage' | 'phones' | 'inventory' | 'history';
  setActiveTab: (tab: 'overview' | 'equipment' | 'production' | 'users_manage' | 'phones' | 'inventory' | 'history') => void;
  assets: Asset[];
  users: User[];
  history: AssetHistoryEvent[];
  summaries: CategoryStockSummary[];
  categories: string[];
  brands: Record<string, string[]>;
  productionCount?: number;
  onOpenNewAssetModal: () => void;
  onOpenUploadModal?: () => void;
  onOpenCategoryBrandModal: () => void;
  onResetSimulation: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  assets,
  users,
  history,
  summaries,
  categories,
  brands,
  productionCount,
  onOpenNewAssetModal,
  onOpenCategoryBrandModal,
  onResetSimulation,
}) => {
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setExportMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Laptop className="w-4 h-4 text-slate-100" />
            </div>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); setActiveTab('overview'); }}
              className="text-lg font-bold tracking-tight text-slate-900"
            >
              AssetTrack Pro
            </a>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
              <span>Dashboard</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('equipment')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'equipment'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>Equipment</span>
              <span className="text-2xs font-mono bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded-sm">
                {assets.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('production')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'production'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Factory className="w-3.5 h-3.5 text-amber-600" />
              <span>Production</span>
              <span className="text-2xs font-mono bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-sm font-semibold">
                {productionCount ?? 10}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'inventory'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>Master Inventory</span>
              <span className="text-2xs font-mono bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded-sm">
                {assets.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('users_manage')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'users_manage'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>User Directory</span>
              <span className="text-2xs font-mono bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded-sm">
                {users.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('phones')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'phones'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>Phone Numbers</span>
              <span className="text-2xs font-mono bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-sm font-semibold">
                {users.filter((u) => u.phone).length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>Audit &amp; Logs</span>
              <span className="text-2xs font-mono bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded-sm">
                {history.length}
              </span>
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2">
            
            {/* Standards & Brand Manager */}
            <button
              type="button"
              onClick={onOpenCategoryBrandModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs whitespace-nowrap"
              title="Configure hardware categories and company brand standards (Lenovo, Iiyama, Logi, iPhone, Honeywell)"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Standards</span>
            </button>

            {/* Export Dropdown */}
            <div className="relative" ref={exportRef}>
              <button
                type="button"
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs whitespace-nowrap"
                aria-expanded={exportMenuOpen}
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {exportMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-40 text-left">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider">Export Inventory Files</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      exportAllAssetsCSV(assets);
                      setExportMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-medium text-slate-900">Master Asset Inventory (.CSV)</p>
                      <p className="text-2xs text-slate-500">All {assets.length} assets with SysAid tags &amp; serials</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      exportEquipmentCSV(assets);
                      setExportMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors"
                  >
                    <Layers className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="font-medium text-slate-900">Equipment Fleet (.CSV)</p>
                      <p className="text-2xs text-slate-500">All {assets.length} items (Mass Upload compatible)</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      exportUserDirectoryCSV(users);
                      setExportMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors"
                  >
                    <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-medium text-slate-900">Employee Directory (.CSV)</p>
                      <p className="text-2xs text-slate-500">All {users.length} staff (Mass Upload compatible)</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      exportHistoryLogsCSV(history);
                      setExportMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors"
                  >
                    <History className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <p className="font-medium text-slate-900">Audit &amp; Handover Logs (.CSV)</p>
                      <p className="text-2xs text-slate-500">All {history.length} custody events &amp; past records</p>
                    </div>
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    type="button"
                    onClick={() => {
                      downloadUploadTemplateCSV();
                      setExportMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-blue-700 hover:bg-blue-50 flex items-center gap-2 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="font-medium text-blue-900">Download Upload Template (.CSV)</p>
                      <p className="text-2xs text-blue-600">Sample CSV with corporate standards</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      exportCompleteJSON(assets, users, history, categories, brands);
                      setExportMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors"
                  >
                    <FileJson className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <p className="font-medium text-slate-900">Full ITAM Backup (.JSON)</p>
                      <p className="text-2xs text-slate-500">All assets, users, history, and standards</p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Add Hardware Button */}
            <button
              type="button"
              onClick={onOpenNewAssetModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors shadow-2xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Hardware</span>
              <span className="sm:hidden">Add</span>
            </button>

            {/* Reset Simulation Button */}
            <button
              type="button"
              onClick={onResetSimulation}
              title="Reset simulation baseline: Lenovo laptops, Iiyama monitors, Logi keyboards/mice, iPhones, Honeywell scanners"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Sub-nav row for medium/small screens */}
      <div className="xl:hidden flex items-center overflow-x-auto px-4 py-2 bg-slate-50 border-t border-slate-200 gap-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-2.5 py-1 rounded font-medium whitespace-nowrap ${
            activeTab === 'overview' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('equipment')}
          className={`px-2.5 py-1 rounded font-medium whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'equipment' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
          }`}
        >
          <span>Equipment</span>
          <span className="text-2xs font-mono bg-slate-200 px-1 rounded-sm">{assets.length}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`px-2.5 py-1 rounded font-medium whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'inventory' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
          }`}
        >
          <span>Master Inventory</span>
          <span className="text-2xs font-mono bg-slate-200 px-1 rounded-sm">{assets.length}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('users_manage')}
          className={`px-2.5 py-1 rounded font-medium whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'users_manage' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
          }`}
        >
          <span>User Directory</span>
          <span className="text-2xs font-mono bg-slate-200 px-1 rounded-sm">{users.length}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('phones')}
          className={`px-2.5 py-1 rounded font-medium whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'phones' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
          }`}
        >
          <Phone className="w-3 h-3 text-blue-600" />
          <span>Phone Numbers</span>
          <span className="text-2xs font-mono bg-blue-100 text-blue-700 px-1 rounded-sm">{users.filter((u) => u.phone).length}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`px-2.5 py-1 rounded font-medium whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'history' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
          }`}
        >
          <span>Audit &amp; Logs</span>
          <span className="text-2xs font-mono bg-slate-200 px-1 rounded-sm">{history.length}</span>
        </button>
      </div>
    </header>
  );
};
