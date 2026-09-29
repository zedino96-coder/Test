import React, { useState } from 'react';
import { 
  Laptop, 
  Mouse, 
  Headphones, 
  Monitor, 
  Download, 
  Upload, 
  CheckCircle2, 
  Archive, 
  UserCheck, 
  Copy, 
  Check, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Asset, User, AssetCategory, CategoryStockSummary, ASSET_CATEGORIES } from '../types/inventory';
import { exportStockSummaryCSV } from '../utils/export';

interface StockCategoryViewProps {
  assets: Asset[];
  users: User[];
  summaries: CategoryStockSummary[];
  onOpenUserModal: (user: User) => void;
  onOpenAssignModal: (category?: string, userId?: string, assetId?: string) => void;
  onOpenUploadModal: (category?: AssetCategory) => void;
}

export const StockCategoryView: React.FC<StockCategoryViewProps> = ({
  assets,
  users,
  summaries,
  onOpenUserModal,
  onOpenAssignModal,
  onOpenUploadModal,
}) => {
  const [activeCategory, setActiveCategory] = useState<AssetCategory>('Laptop');
  const [copiedSn, setCopiedSn] = useState<string | null>(null);

  const handleCopySn = (sn: string) => {
    navigator.clipboard.writeText(sn);
    setCopiedSn(sn);
    setTimeout(() => setCopiedSn(null), 1800);
  };

  const currentSummary = summaries.find((s) => s.category === activeCategory);
  const assignedList = assets.filter((a) => a.category === activeCategory && a.status === 'assigned');
  const inStockList = assets.filter((a) => a.category === activeCategory && a.status === 'in_stock');

  return (
    <div className="space-y-6">
      
      {/* Category Selection Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {ASSET_CATEGORIES.map((cat) => {
            const sum = summaries.find((s) => s.category === cat);
            const isSelected = activeCategory === cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-2xs font-mono px-1.5 py-0.2 rounded ${
                  isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                }`}>
                  {sum?.assigned || 0}/{sum?.total || 0}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportStockSummaryCSV(summaries)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Stock Summary</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenUploadModal(activeCategory)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            title={`Upload CSV items for ${activeCategory} or central IT stock`}
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Upload CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Banner for Selected Category */}
      {currentSummary && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  {currentSummary.category}
                </h2>
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                  Total Qty: {currentSummary.total}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {currentSummary.category === 'Laptop' && 'Enterprise standard Lenovo laptops · 100% Lenovo fleet.'}
                {currentSummary.category === 'Monitor' && 'Exclusive Iiyama displays (100% Iiyama fleet) · Deployed 1-2 per workstation.'}
                {currentSummary.category === 'Keyboard / Mouse' && 'Standardized Logi wireless desktop combos · 100% Logi fleet.'}
                {currentSummary.category === 'Phone' && 'Enterprise mobile iPhone devices · 100% iPhone fleet.'}
                {currentSummary.category.includes('Honeywell') && 'Rugged Honeywell handheld mobile computers & barcode scanners.'}
                {!['Laptop', 'Monitor', 'Keyboard / Mouse', 'Phone'].includes(currentSummary.category) && !currentSummary.category.includes('Honeywell') && 'Enterprise asset tier · Managed with serial number custody tracking.'}
              </p>
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-6">
              <div className="text-left">
                <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">Assigned</span>
                <div className="text-2xl font-bold text-blue-600 font-mono tabular-nums">
                  {currentSummary.assigned}
                </div>
                <span className="text-2xs text-slate-500">Active in use</span>
              </div>
              <div className="h-8 w-px bg-slate-200"></div>
              <div className="text-left">
                <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">In Stock</span>
                <div className="text-2xl font-bold text-emerald-600 font-mono tabular-nums">
                  {currentSummary.inStock}
                </div>
                <span className="text-2xs text-slate-500">Unassigned</span>
              </div>
              <div className="h-8 w-px bg-slate-200"></div>
              <div className="text-left">
                <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">Utilization</span>
                <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                  {currentSummary.total > 0 ? Math.round((currentSummary.assigned / currentSummary.total) * 100) : 0}%
                </div>
                <span className="text-2xs text-slate-500">Target: 50%</span>
              </div>
            </div>
          </div>

          {/* Utilization Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-2xs text-slate-500 mb-1 font-medium">
              <span>{currentSummary.assigned} Units Assigned to Employees</span>
              <span>{currentSummary.inStock} Units In Stock Reserve</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
              <div 
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${(currentSummary.assigned / currentSummary.total) * 100}%` }}
              />
              <div 
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${(currentSummary.inStock / currentSummary.total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Two Grid Sections: Assigned By Whom & Unassigned In Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section 1: Assigned to Whom */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                Assigned By Whom ({assignedList.length} Units)
              </h3>
            </div>
            <span className="text-2xs text-slate-500">Active Staff</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/50 text-slate-700 font-semibold">
                  <th className="py-2.5 px-4">Employee</th>
                  <th className="py-2.5 px-3 font-mono">Serial No. (sn)</th>
                  <th className="py-2.5 px-3">Brand &amp; Model</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignedList.map((asset) => {
                  const user = users.find((u) => u.id === asset.assignedUserId);
                  const isJohn = user?.name.toLowerCase().includes('john');

                  return (
                    <tr 
                      key={asset.id} 
                      className={`hover:bg-slate-50 transition-colors ${
                        isJohn ? 'bg-blue-50/20' : ''
                      }`}
                    >
                      <td className="py-2.5 px-4 font-semibold text-slate-900">
                        {user ? (
                          <button
                            type="button"
                            onClick={() => onOpenUserModal(user)}
                            className="flex items-center gap-1.5 hover:text-blue-600 text-left group"
                          >
                            <div 
                              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-3xs font-bold shrink-0"
                              style={{ backgroundColor: user.avatarColor }}
                            >
                              {user.name.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <span className="group-hover:underline underline-offset-2">
                              {user.name}
                            </span>
                            {isJohn && (
                              <span className="text-3xs bg-blue-100 text-blue-700 px-1 py-0.2 rounded font-mono">
                                Sample
                              </span>
                            )}
                          </button>
                        ) : (
                          <span className="text-slate-400">{asset.assignedUserName || 'Unknown'}</span>
                        )}
                        <div className="text-3xs text-slate-400 font-normal pl-6">
                          {user?.role}
                        </div>
                      </td>

                      <td className="py-2.5 px-3 font-mono text-slate-800 tabular-nums">
                        <div className="flex items-center gap-1">
                          <code className="bg-slate-100 px-1.5 py-0.5 rounded text-2xs select-all font-semibold">
                            {asset.serialNumber}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopySn(asset.serialNumber)}
                            className="text-slate-400 hover:text-slate-700 p-0.5"
                            title="Copy serial number"
                          >
                            {copiedSn === asset.serialNumber ? (
                              <Check className="w-2.5 h-2.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-2.5 h-2.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-slate-600 truncate max-w-[130px]">
                        <span className="font-semibold text-slate-900">{asset.brand}</span>{' '}
                        <span className="text-slate-500">{asset.model}</span>
                      </td>

                      <td className="py-2.5 px-4 text-right">
                        {user ? (
                          <button
                            type="button"
                            onClick={() => onOpenUserModal(user)}
                            className="text-2xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2 py-0.5 rounded transition-colors"
                            title="Return process must be initiated from the User Directory / Dossier"
                          >
                            Custody...
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Unassigned In Stock */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Archive className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                Unassigned Stock in Storage ({inStockList.length} Units)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onOpenAssignModal(activeCategory)}
              className="text-2xs font-medium text-emerald-700 hover:text-emerald-900 underline"
            >
              + Assign Device
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/50 text-slate-700 font-semibold">
                  <th className="py-2.5 px-4 font-mono">Serial No. (sn)</th>
                  <th className="py-2.5 px-3">Brand &amp; Model</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inStockList.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-slate-800 tabular-nums">
                      <div className="flex items-center gap-1">
                        <code className="bg-slate-100 px-1.5 py-0.5 rounded text-2xs select-all">
                          {asset.serialNumber}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopySn(asset.serialNumber)}
                          className="text-slate-400 hover:text-slate-700 p-0.5"
                          title="Copy serial number"
                        >
                          {copiedSn === asset.serialNumber ? (
                            <Check className="w-2.5 h-2.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-2.5 h-2.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-slate-600 truncate max-w-[130px]">
                      <span className="font-semibold text-slate-900">{asset.brand}</span>{' '}
                      <span className="text-slate-500">{asset.model}</span>
                    </td>

                    <td className="py-2.5 px-3 text-slate-500 text-2xs truncate max-w-[130px]">
                      {asset.location}
                    </td>

                    <td className="py-2.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onOpenAssignModal(asset.category, undefined, asset.id)}
                        className="text-2xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded transition-colors"
                      >
                        Assign...
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
