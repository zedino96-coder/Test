import React, { useState } from 'react';
import { 
  Laptop, 
  Mouse, 
  Headphones, 
  Monitor, 
  Smartphone,
  Scan,
  CheckCircle, 
  Archive, 
  Users, 
  ArrowUpRight, 
  Filter, 
  UserCheck,
  PhoneCall,
  Cpu,
  Box,
  PieChart as PieChartIcon
} from 'lucide-react';
import { Asset, User, AssetCategory, CategoryStockSummary, ASSET_CATEGORIES } from '../types/inventory';

interface StockOverviewProps {
  assets: Asset[];
  users: User[];
  summaries: CategoryStockSummary[];
  onOpenUserModal: (user: User) => void;
  onOpenAssignModal: (category?: string, userId?: string, assetId?: string) => void;
  onFilterByCategoryInInventory: (category: AssetCategory) => void;
}

export const StockOverview: React.FC<StockOverviewProps> = ({
  assets,
  users,
  summaries,
  onOpenUserModal,
  onOpenAssignModal,
  onFilterByCategoryInInventory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory>('Laptop');

  const totalAssets = assets.length;
  const assignedAssets = assets.filter((a) => a.status === 'assigned').length;
  const inStockAssets = assets.filter((a) => a.status === 'in_stock').length;

  const getCategoryIcon = (cat: AssetCategory) => {
    switch (cat) {
      case 'Laptop':
        return <Laptop className="w-4 h-4" />;
      case 'Keyboard / Mouse':
        return <Mouse className="w-4 h-4" />;
      case 'Headset':
        return <Headphones className="w-4 h-4" />;
      case 'Monitor':
        return <Monitor className="w-4 h-4" />;
      case 'Phone':
        return <Smartphone className="w-4 h-4" />;
      case 'Fixed Phone':
        return <PhoneCall className="w-4 h-4 text-cyan-600" />;
      case 'Chip':
        return <Cpu className="w-4 h-4 text-emerald-600" />;
      case 'Honeywell Scanner':
        return <Scan className="w-4 h-4 text-amber-600" />;
      case 'Other':
        return <Box className="w-4 h-4 text-slate-600" />;
      default:
        return <Box className="w-4 h-4" />;
    }
  };

  const currentSummary = summaries.find((s) => s.category === selectedCategory);
  const currentAssignedAssets = assets.filter(
    (a) => a.category === selectedCategory && a.status === 'assigned'
  );
  const currentInStockAssets = assets.filter(
    (a) => a.category === selectedCategory && a.status === 'in_stock'
  );

  return (
    <div className="space-y-8">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Hardware Fleet</span>
            <Archive className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {totalAssets}
            </span>
            <span className="text-xs text-slate-500">20 per category</span>
          </div>
          <div className="mt-2 text-2xs text-slate-500">
            5 categories · Standard enterprise deployment
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Assigned to Employees</span>
            <CheckCircle className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-blue-600 font-mono tabular-nums">
              {assignedAssets}
            </span>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              ({totalAssets > 0 ? Math.round((assignedAssets / totalAssets) * 100) : 0}%)
            </span>
          </div>
          <div className="mt-2 text-2xs text-slate-500">
            10 items per category active with staff
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">In Stock / Available</span>
            <Archive className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-emerald-600 font-mono tabular-nums">
              {inStockAssets}
            </span>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              ({totalAssets > 0 ? Math.round((inStockAssets / totalAssets) * 100) : 0}%)
            </span>
          </div>
          <div className="mt-2 text-2xs text-slate-500">
            Ready in Central IT Stockroom
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Provisioned Users</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {users.length}
            </span>
            <span className="text-xs text-emerald-600 font-medium">100% Fully Equipped</span>
          </div>
          <div className="mt-2 text-2xs text-slate-500">
            Including John Miller (Lead Engineer)
          </div>
        </div>
      </div>

      {/* DASHBOARD PIE CHART: Assigned vs In Stock Equipment Ratio */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Left: Summary text & Metrics */}
          <div className="flex-1 w-full space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                  <PieChartIcon className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Equipment Allocation &amp; Stock Ratio (Pie Chart)
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Visualizing deployment status across all {totalAssets} corporate hardware units: active employee custody vs. stockroom buffer.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Assigned Legend Card */}
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full bg-blue-600 shrink-0 shadow-xs" />
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">Assigned to Staff</span>
                    <span className="text-2xs text-slate-500">In employee custody</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-blue-700 block">{assignedAssets}</span>
                  <span className="text-2xs font-semibold text-blue-600 font-mono">
                    {totalAssets > 0 ? ((assignedAssets / totalAssets) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>

              {/* In Stock Legend Card */}
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 shrink-0 shadow-xs" />
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">In Stock / Available</span>
                    <span className="text-2xs text-slate-500">Ready in IT stockroom</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-emerald-700 block">{inStockAssets}</span>
                  <span className="text-2xs font-semibold text-emerald-600 font-mono">
                    {totalAssets > 0 ? ((inStockAssets / totalAssets) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Category Distribution Bar */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <div className="flex items-center justify-between text-2xs text-slate-600 mb-1.5 font-medium">
                <span>Fleet Utilization Rate</span>
                <span className="font-mono font-bold text-slate-900">
                  {totalAssets > 0 ? Math.round((assignedAssets / totalAssets) * 100) : 0}% Deployed
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                <div 
                  className="bg-blue-600 h-full transition-all" 
                  style={{ width: `${totalAssets > 0 ? (assignedAssets / totalAssets) * 100 : 0}%` }}
                  title={`Assigned: ${assignedAssets}`}
                />
                <div 
                  className="bg-emerald-500 h-full transition-all" 
                  style={{ width: `${totalAssets > 0 ? (inStockAssets / totalAssets) * 100 : 0}%` }}
                  title={`In Stock: ${inStockAssets}`}
                />
              </div>
            </div>
          </div>

          {/* Right: SVG Pie/Donut Chart */}
          <div className="flex flex-col items-center justify-center p-2 shrink-0">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg 
                viewBox="0 0 160 160" 
                className="w-full h-full -rotate-90 transform"
              >
                {/* Background track circle */}
                <circle
                  cx="80"
                  cy="80"
                  r="58"
                  className="stroke-slate-100"
                  strokeWidth="20"
                  fill="none"
                />

                {/* Assigned Segment (Blue) */}
                <circle
                  cx="80"
                  cy="80"
                  r="58"
                  stroke="#2563eb"
                  strokeWidth="20"
                  fill="none"
                  strokeDasharray={`${totalAssets > 0 ? ((assignedAssets / totalAssets) * 364.425) : 0} 364.425`}
                  strokeDashoffset="0"
                  strokeLinecap="butt"
                  className="transition-all duration-700 ease-out hover:opacity-90"
                />

                {/* In Stock Segment (Emerald) */}
                <circle
                  cx="80"
                  cy="80"
                  r="58"
                  stroke="#10b981"
                  strokeWidth="20"
                  fill="none"
                  strokeDasharray={`${totalAssets > 0 ? ((inStockAssets / totalAssets) * 364.425) : 0} 364.425`}
                  strokeDashoffset={`${totalAssets > 0 ? -((assignedAssets / totalAssets) * 364.425) : 0}`}
                  strokeLinecap="butt"
                  className="transition-all duration-700 ease-out hover:opacity-90"
                />
              </svg>

              {/* Donut Center Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                  {totalAssets}
                </span>
                <span className="text-3xs uppercase tracking-wider font-bold text-slate-400">
                  Total Units
                </span>
                <span className="text-3xs font-semibold text-blue-600 mt-0.5">
                  {totalAssets > 0 ? Math.round((assignedAssets / totalAssets) * 100) : 0}% Active
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-2 text-2xs">
              <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span>Assigned ({totalAssets > 0 ? Math.round((assignedAssets / totalAssets) * 100) : 0}%)</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>In Stock ({totalAssets > 0 ? Math.round((inStockAssets / totalAssets) * 100) : 0}%)</span>
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Stock Cards by Category (Qty 20 simulation) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Hardware Stock by Category
            </h2>
            <p className="text-xs text-slate-500">
              Each category maintains a total pool of 20 units (10 assigned to staff, 10 reserve in stock).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {summaries.map((s) => {
            const isSelected = selectedCategory === s.category;
            const assignedPct = s.total > 0 ? (s.assigned / s.total) * 100 : 0;

            return (
              <button
                key={s.category}
                type="button"
                onClick={() => setSelectedCategory(s.category)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-white border-slate-900 ring-2 ring-slate-900/10 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    {getCategoryIcon(s.category)}
                  </div>
                  <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono tabular-nums">
                    Qty {s.total}
                  </span>
                </div>

                <h3 className="font-semibold text-xs text-slate-900 tracking-tight mb-1 truncate">
                  {s.category}
                </h3>

                <div className="flex items-center justify-between text-2xs text-slate-500 mb-2">
                  <span>Assigned: <strong className="text-blue-600 font-mono tabular-nums">{s.assigned}</strong></span>
                  <span>In Stock: <strong className="text-emerald-600 font-mono tabular-nums">{s.inStock}</strong></span>
                </div>

                {/* Split Bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-blue-600 h-full transition-all" 
                    style={{ width: `${assignedPct}%` }}
                    title={`${s.assigned} Assigned`}
                  />
                  <div 
                    className="bg-emerald-500 h-full transition-all" 
                    style={{ width: `${100 - assignedPct}%` }}
                    title={`${s.inStock} In Stock`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Stock Breakdown: "Assigned by Category and by Whom" & "Available In Stock" */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        
        {/* Header with Category Filter */}
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                {selectedCategory} Inventory Breakdown
              </span>
              <span className="text-xs text-slate-400 font-mono tabular-nums">
                (20 total: {currentAssignedAssets.length} Assigned / {currentInStockAssets.length} In Stock)
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Assigned assets &amp; by whom, plus available unassigned stock in storage.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onFilterByCategoryInInventory(selectedCategory)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
            >
              <span>View All in Master Table</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              type="button"
              onClick={() => onOpenAssignModal(selectedCategory)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors"
            >
              <span>+ Assign From Stock</span>
            </button>
          </div>
        </div>

        {/* Two-Column or Stacked View: Left = Assigned by Whom, Right = Unassigned In Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          
          {/* Section 1: Assigned by Whom (10 Items) */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Assigned by Whom ({currentAssignedAssets.length})
                </h3>
              </div>
              <span className="text-2xs text-slate-500">Active users holding device</span>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold">
                    <th className="py-2 px-3">Assignee</th>
                    <th className="py-2 px-3 font-mono">
                      {selectedCategory === 'Chip' ? 'Chip Number (Necessary)' : 'Serial Number (sn)'}
                    </th>
                    <th className="py-2 px-3">
                      {selectedCategory === 'Chip' ? 'ID Number' : 'Hardware Model'}
                    </th>
                    <th className="py-2 px-3 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentAssignedAssets.map((asset) => {
                    const user = users.find((u) => u.id === asset.assignedUserId);
                    const isJohn = user?.name.toLowerCase().includes('john');

                    return (
                      <tr 
                        key={asset.id} 
                        className={`hover:bg-slate-50 transition-colors ${
                          isJohn ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <td className="py-2 px-3 font-medium text-slate-900">
                          {user ? (
                            <button
                              type="button"
                              onClick={() => onOpenUserModal(user)}
                              className="text-left group flex items-center gap-1.5 hover:text-blue-600"
                            >
                              <div
                                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-2xs font-bold shrink-0"
                                style={{ backgroundColor: user.avatarColor }}
                              >
                                {user.name.split(' ').map((n) => n[0]).join('')}
                              </div>
                              <span className="font-semibold underline-offset-2 group-hover:underline">
                                {user.name}
                              </span>
                              {isJohn && (
                                <span className="text-3xs bg-blue-100 text-blue-700 px-1 py-0.2 rounded font-mono">
                                  SAMPLE
                                </span>
                              )}
                            </button>
                          ) : (
                            <span className="text-slate-500">{asset.assignedUserName || 'Unknown'}</span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-mono font-medium text-slate-800 tabular-nums">
                          <span className={`px-1.5 py-0.5 rounded text-2xs select-all ${
                            selectedCategory === 'Chip' ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200' : 'bg-slate-100'
                          }`}>
                            {asset.serialNumber}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-600 truncate max-w-[140px]">
                          {selectedCategory === 'Chip' ? (
                            <span className="font-mono text-2xs font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                              {asset.assetTag}
                            </span>
                          ) : (
                            <>
                              <span className="font-medium text-slate-800">{asset.brand}</span>{' '}
                              <span className="text-slate-500">{asset.model}</span>
                            </>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {user && (
                            <button
                              type="button"
                              onClick={() => onOpenUserModal(user)}
                              className="text-2xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
                            >
                              Slip
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {currentAssignedAssets.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-slate-400">
                        No assigned assets in this category.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Unassigned Assets in Stock (10 Items) */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Archive className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Unassigned Reserve in Stock ({currentInStockAssets.length})
                </h3>
              </div>
              <span className="text-2xs text-slate-500">Available in storage</span>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold">
                    <th className="py-2 px-3 font-mono">
                      {selectedCategory === 'Chip' ? 'Chip Number (Necessary)' : 'Serial Number (sn)'}
                    </th>
                    <th className="py-2 px-3">
                      {selectedCategory === 'Chip' ? 'ID Number' : 'Hardware Model'}
                    </th>
                    <th className="py-2 px-3">Stock Location</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentInStockAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-3 font-mono font-medium text-slate-800 tabular-nums">
                        <span className={`px-1.5 py-0.5 rounded text-2xs select-all ${
                          selectedCategory === 'Chip' ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200' : 'bg-slate-100'
                        }`}>
                          {asset.serialNumber}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-600 truncate max-w-[140px]">
                        {selectedCategory === 'Chip' ? (
                          <span className="font-mono text-2xs font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                            {asset.assetTag}
                          </span>
                        ) : (
                          <>
                            <span className="font-medium text-slate-800">{asset.brand}</span>{' '}
                            <span className="text-slate-500">{asset.model}</span>
                          </>
                        )}
                      </td>
                      <td className="py-2 px-3 text-slate-500 text-2xs truncate max-w-[120px]">
                        {asset.location}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => onOpenAssignModal(asset.category, undefined, asset.id)}
                          className="text-2xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded font-medium transition-colors"
                        >
                          Assign
                        </button>
                      </td>
                    </tr>
                  ))}
                  {currentInStockAssets.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-slate-400">
                        Zero unassigned items in stock for this category.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
