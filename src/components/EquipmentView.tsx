import React, { useState, useMemo } from 'react';
import { 
  Laptop, 
  Mouse, 
  Headphones, 
  Monitor, 
  Smartphone,
  Scan,
  Download, 
  Upload, 
  Plus,
  Search,
  Filter,
  CheckCircle2, 
  Archive, 
  UserCheck, 
  Copy, 
  Check, 
  History,
  RotateCcw,
  Sparkles,
  Layers,
  Tag,
  ExternalLink,
  SlidersHorizontal,
  PhoneCall,
  Cpu,
  Box
} from 'lucide-react';
import { 
  Asset, 
  User, 
  AssetCategory, 
  CategoryStockSummary, 
  ASSET_CATEGORIES,
  AssetHistoryEvent
} from '../types/inventory';
import { exportEquipmentCSV } from '../utils/export';
import { EquipmentDetailModal } from './EquipmentDetailModal';

interface EquipmentViewProps {
  assets: Asset[];
  users: User[];
  categories: string[];
  summaries: CategoryStockSummary[];
  history: AssetHistoryEvent[];
  onOpenUserModal: (user: User) => void;
  onOpenAssignModal: (category?: string, userId?: string, assetId?: string) => void;
  onOpenDeviceHistory: (asset: Asset) => void;
  onOpenUploadModal: (category?: AssetCategory) => void;
  onOpenNewAssetModal: () => void;
  onRequestReturn: (asset: Asset, user: User) => void;
  onOpenCategoryBrandModal: () => void;
  onUpdateAsset?: (asset: Asset) => void;
}

export const EquipmentView: React.FC<EquipmentViewProps> = ({
  assets,
  users,
  categories,
  summaries,
  history,
  onOpenUserModal,
  onOpenAssignModal,
  onOpenDeviceHistory,
  onOpenUploadModal,
  onOpenNewAssetModal,
  onRequestReturn,
  onOpenCategoryBrandModal,
  onUpdateAsset,
}) => {
  // Filter states: lists ALL by default!
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'assigned' | 'in_stock' | 'maintenance' | 'retired'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedSn, setCopiedSn] = useState<string | null>(null);
  const [selectedAssetForDetail, setSelectedAssetForDetail] = useState<Asset | null>(null);

  const handleCopySn = (sn: string) => {
    navigator.clipboard.writeText(sn);
    setCopiedSn(sn);
    setTimeout(() => setCopiedSn(null), 1800);
  };

  const getCategoryIcon = (category: string) => {
    const catLower = category.toLowerCase();
    if (catLower.includes('laptop') || catLower.includes('notebook')) return <Laptop className="w-4 h-4 text-blue-600" />;
    if (catLower.includes('monitor') || catLower.includes('display')) return <Monitor className="w-4 h-4 text-indigo-600" />;
    if (catLower.includes('keyboard') || catLower.includes('mouse')) return <Mouse className="w-4 h-4 text-emerald-600" />;
    if (catLower.includes('headset') || catLower.includes('audio')) return <Headphones className="w-4 h-4 text-violet-600" />;
    if (catLower.includes('fixed phone') || catLower.includes('desk phone') || catLower.includes('voip')) return <PhoneCall className="w-4 h-4 text-cyan-600" />;
    if (catLower.includes('phone') || catLower.includes('mobile')) return <Smartphone className="w-4 h-4 text-cyan-600" />;
    if (catLower.includes('chip') || catLower.includes('token') || catLower.includes('yubi') || catLower.includes('nfc')) return <Cpu className="w-4 h-4 text-emerald-600" />;
    if (catLower.includes('scanner') || catLower.includes('honeywell')) return <Scan className="w-4 h-4 text-amber-600" />;
    if (catLower.includes('other') || catLower.includes('dock') || catLower.includes('printer')) return <Box className="w-4 h-4 text-slate-600" />;
    return <Layers className="w-4 h-4 text-slate-600" />;
  };

  // Filtered Assets: Only what matches the current filters!
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      // Category filter
      if (selectedCategory !== 'ALL' && asset.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'ALL' && asset.status !== statusFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchSn = asset.serialNumber.toLowerCase().includes(q);
        const matchBrand = asset.brand.toLowerCase().includes(q);
        const matchModel = asset.model.toLowerCase().includes(q);
        const matchCategory = asset.category.toLowerCase().includes(q);
        const matchTag = (asset.assetTag || '').toLowerCase().includes(q);
        const matchUser = (asset.assignedUserName || '').toLowerCase().includes(q);
        const matchLocation = asset.location.toLowerCase().includes(q);
        const matchNotes = (asset.notes || '').toLowerCase().includes(q);

        if (!matchSn && !matchBrand && !matchModel && !matchCategory && !matchTag && !matchUser && !matchLocation && !matchNotes) {
          return false;
        }
      }

      return true;
    });
  }, [assets, selectedCategory, statusFilter, searchQuery]);

  // Dynamic metrics for the currently filtered set
  const totalFilteredCount = filteredAssets.length;
  const assignedFilteredCount = filteredAssets.filter((a) => a.status === 'assigned').length;
  const inStockFilteredCount = filteredAssets.filter((a) => a.status === 'in_stock').length;
  const otherFilteredCount = totalFilteredCount - assignedFilteredCount - inStockFilteredCount;
  const utilizationRate = totalFilteredCount > 0 
    ? Math.round((assignedFilteredCount / totalFilteredCount) * 100) 
    : 0;

  // Active category summary if a specific category is chosen
  const currentCategorySummary = selectedCategory !== 'ALL'
    ? summaries.find((s) => s.category === selectedCategory)
    : null;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Header Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Equipment Fleet
            </h2>
            <span className="text-2xs bg-slate-100 text-slate-800 font-mono font-semibold px-2 py-0.5 rounded">
              {totalFilteredCount} of {assets.length} Listed
            </span>
            {selectedCategory !== 'ALL' && (
              <span className="text-2xs bg-blue-100 text-blue-800 font-medium px-2 py-0.5 rounded">
                Filtered: {selectedCategory}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete enterprise hardware inventory across all hardware tiers. Filter by category, status, or search.
          </p>
        </div>

        {/* Action Buttons: Export what is listed & Mass Upload with identical format */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => exportEquipmentCSV(filteredAssets, selectedCategory)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
            title="Export CSV: exports only what is currently listed in this view. Can be used directly for mass upload."
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
            <span className="text-2xs font-mono text-slate-400">({totalFilteredCount})</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenUploadModal(selectedCategory !== 'ALL' ? (selectedCategory as AssetCategory) : undefined)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
            title="Upload CSV to mass upload or update equipment records"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Upload CSV</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewAssetModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Device</span>
          </button>
        </div>
      </div>

      {/* Filter Bar: Category Selector (All + Individual Categories) */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Category:</span>
          </div>

          <button
            type="button"
            onClick={onOpenCategoryBrandModal}
            className="flex items-center gap-1 text-2xs text-slate-500 hover:text-slate-800 hover:underline"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Manage Brand Standards</span>
          </button>
        </div>

        {/* Category Pills with counts */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Option 1: ALL EQUIPMENT */}
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Equipment</span>
            <span className={`text-2xs font-mono px-1.5 py-0.2 rounded ${
              selectedCategory === 'ALL' ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'
            }`}>
              {assets.length}
            </span>
          </button>

          {/* Individual Categories */}
          {categories.map((cat) => {
            const catAssets = assets.filter((a) => a.category === cat);
            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-slate-50'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-2xs font-mono px-1.5 py-0.2 rounded ${
                  isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'
                }`}>
                  {catAssets.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filters: Status Tabs + Search Input */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
          {/* Status Segmented Buttons */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 text-2xs font-medium rounded-md transition-colors ${
                statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Status ({selectedCategory === 'ALL' ? assets.length : assets.filter((a) => a.category === selectedCategory).length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('assigned')}
              className={`px-2.5 py-1 text-2xs font-medium rounded-md transition-colors ${
                statusFilter === 'assigned' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Assigned
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('in_stock')}
              className={`px-2.5 py-1 text-2xs font-medium rounded-md transition-colors ${
                statusFilter === 'in_stock' ? 'bg-white text-emerald-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In Stock
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search serial number (sn), brand, model, employee, tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-2xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Metrics Cards for Listed Items */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">Listed Units</span>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
            {totalFilteredCount}
          </div>
          <span className="text-2xs text-slate-500">
            {selectedCategory === 'ALL' ? 'Total across all fleet' : `Total in ${selectedCategory}`}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">Assigned In Use</span>
          <div className="text-2xl font-bold text-blue-600 font-mono tabular-nums mt-0.5">
            {assignedFilteredCount}
          </div>
          <span className="text-2xs text-slate-500">Active employee custody</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">In Stock Reserve</span>
          <div className="text-2xl font-bold text-emerald-600 font-mono tabular-nums mt-0.5">
            {inStockFilteredCount}
          </div>
          <span className="text-2xs text-slate-500">Available to assign</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">Deployment Rate</span>
          <div className="text-2xl font-bold text-slate-800 font-mono tabular-nums mt-0.5">
            {utilizationRate}%
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2 flex">
            <div 
              className="bg-blue-600 h-full transition-all" 
              style={{ width: `${utilizationRate}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Fleet Standards Banner (If specific category is chosen) */}
      {selectedCategory !== 'ALL' && (
        <div className="bg-blue-50/60 border border-blue-200 p-4 rounded-xl flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <span className="font-bold">{selectedCategory} Fleet Standard: </span>
              {selectedCategory === 'Laptop' && 'Enterprise Lenovo fleet standard (100% ThinkPad laptops).'}
              {selectedCategory === 'Monitor' && 'Enterprise Iiyama display fleet standard (100% Iiyama displays).'}
              {selectedCategory === 'Keyboard / Mouse' && 'Enterprise Logi desktop accessories standard (100% Logi keyboards & mice).'}
              {selectedCategory === 'Phone' && 'Enterprise mobile iPhone fleet standard (100% corporate iPhones).'}
              {selectedCategory === 'Honeywell Scanner' && 'Rugged Honeywell handheld mobile computers & scanners.'}
              {!['Laptop', 'Monitor', 'Keyboard / Mouse', 'Phone', 'Honeywell Scanner'].includes(selectedCategory) && 'Custom equipment inventory category.'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenAssignModal(selectedCategory)}
            className="px-2.5 py-1 text-2xs font-semibold bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 rounded transition-colors shrink-0"
          >
            + Assign {selectedCategory}
          </button>
        </div>
      )}

      {/* Equipment Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
              Listed Equipment ({filteredAssets.length} items)
            </h3>
          </div>
          <span className="text-2xs text-slate-500">
            Export CSV exports only these {filteredAssets.length} listed items
          </span>
        </div>

        {filteredAssets.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Archive className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No equipment matches current filters</p>
            <p className="text-2xs text-slate-400 mt-1">Try resetting the category or search query.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('ALL');
                setStatusFilter('ALL');
                setSearchQuery('');
              }}
              className="mt-3 px-3 py-1.5 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/50 text-slate-700 font-semibold">
                  <th className="py-2.5 px-4">Category &amp; Brand</th>
                  {selectedCategory === 'Chip' ? (
                    <>
                      <th className="py-2.5 px-3 font-mono text-emerald-800 font-bold">Chip Number (Necessary)</th>
                      <th className="py-2.5 px-3 font-mono">ID Number</th>
                    </>
                  ) : (
                    <>
                      <th className="py-2.5 px-3">Model</th>
                      <th className="py-2.5 px-3 font-mono">Serial No. (sn)</th>
                    </>
                  )}
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-4">Assigned To</th>
                  <th className="py-2.5 px-3">Location</th>
                  {selectedCategory !== 'Chip' && <th className="py-2.5 px-3">Condition</th>}
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssets.map((asset) => {
                  const user = users.find((u) => u.id === asset.assignedUserId);
                  const isCopied = copiedSn === asset.serialNumber;
                  const isChipAsset = asset.category.toLowerCase().includes('chip');

                  return (
                    <tr 
                      key={asset.id} 
                      onClick={() => setSelectedAssetForDetail(asset)}
                      className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                      title="Click to open complete equipment card and network specifications"
                    >
                      {/* Category & Brand */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center shrink-0">
                            {getCategoryIcon(asset.category)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span>{asset.category}</span>
                              <span className="text-3xs font-mono font-medium bg-slate-100 text-slate-600 px-1 py-0.2 rounded">
                                {asset.brand}
                              </span>
                              {(asset.category.toLowerCase().includes('honeywell') || asset.brand.toLowerCase() === 'honeywell' || asset.honeywellSpecs) && (
                                <span className="text-3xs font-bold font-mono bg-amber-100 text-amber-800 px-1 py-0.2 rounded border border-amber-200">
                                  Honeywell
                                </span>
                              )}
                            </div>
                            {asset.assetTag && (
                              <span className="text-3xs font-mono text-slate-400">
                                {isChipAsset ? `ID: ${asset.assetTag}` : asset.assetTag}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* If viewing Chip category view */}
                      {selectedCategory === 'Chip' ? (
                        <>
                          {/* Chip Number (Necessary) */}
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-bold text-emerald-950 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                                {asset.serialNumber}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopySn(asset.serialNumber);
                                }}
                                className="p-1 text-slate-400 hover:text-slate-700 transition-colors opacity-0 group-hover:opacity-100"
                                title="Copy Chip Number"
                              >
                                {isCopied ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* ID Number */}
                          <td className="py-2.5 px-3 font-mono text-2xs text-slate-700 font-semibold">
                            {asset.assetTag}
                          </td>
                        </>
                      ) : (
                        <>
                          {/* Model */}
                          <td className="py-2.5 px-3 font-medium text-slate-800">
                            {asset.model}
                          </td>

                          {/* Serial Number (sn) */}
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-semibold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                                {isChipAsset ? `Chip: ${asset.serialNumber}` : asset.serialNumber}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopySn(asset.serialNumber);
                                }}
                                className="p-1 text-slate-400 hover:text-slate-700 transition-colors opacity-0 group-hover:opacity-100"
                                title="Copy Serial Number"
                              >
                                {isCopied ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </>
                      )}

                      {/* Status */}
                      <td className="py-2.5 px-3">
                        {asset.status === 'assigned' ? (
                          <span className="inline-flex items-center gap-1 text-2xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                            <span>Assigned</span>
                          </span>
                        ) : asset.status === 'in_stock' ? (
                          <span className="inline-flex items-center gap-1 text-2xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            <span>In Stock</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-2xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            <span>{asset.status}</span>
                          </span>
                        )}
                      </td>

                      {/* Assigned Employee */}
                      <td className="py-2.5 px-4">
                        {user ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenUserModal(user);
                            }}
                            className="flex items-center gap-2 hover:text-blue-600 text-left group/user cursor-pointer"
                            title={`Open ${user.name} dossier`}
                          >
                            <div 
                              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-3xs font-bold shrink-0"
                              style={{ backgroundColor: user.avatarColor }}
                            >
                              {user.name.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <span className="font-semibold text-slate-900 group-hover/user:underline">
                              {user.name}
                            </span>
                          </button>
                        ) : (
                          <span className="text-2xs text-slate-400 font-medium">
                            Unassigned (In Reserve)
                          </span>
                        )}
                      </td>

                      {/* Location */}
                      <td className="py-2.5 px-3 text-slate-600 text-2xs">
                        {asset.location}
                      </td>

                      {/* Condition */}
                      <td className="py-2.5 px-3 text-slate-600 text-2xs">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 font-medium">
                          {asset.condition}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAssetForDetail(asset);
                            }}
                            className="px-2 py-1 text-2xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded transition-colors shadow-2xs"
                            title="Open Equipment Dossier & Specs Card"
                          >
                            Card
                          </button>

                          {asset.status === 'in_stock' ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenAssignModal(asset.category, undefined, asset.id);
                              }}
                              className="px-2.5 py-1 text-2xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded transition-colors"
                            >
                              Assign
                            </button>
                          ) : user ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRequestReturn(asset, user);
                              }}
                              className="px-2.5 py-1 text-2xs font-medium text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                              title="Return device to Central IT Stockroom"
                            >
                              Return
                            </button>
                          ) : null}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenDeviceHistory(asset);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-800 rounded transition-colors"
                            title="View device lifecycle audit log"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Equipment Detail Modal Card */}
      {selectedAssetForDetail && (
        <EquipmentDetailModal
          asset={selectedAssetForDetail}
          users={users}
          history={history}
          onClose={() => setSelectedAssetForDetail(null)}
          onOpenUserModal={onOpenUserModal}
          onOpenAssignModal={onOpenAssignModal}
          onRequestReturn={onRequestReturn}
          onUpdateAsset={(updated) => {
            if (onUpdateAsset) onUpdateAsset(updated);
            setSelectedAssetForDetail(updated);
          }}
          onOpenDeviceHistory={onOpenDeviceHistory}
        />
      )}

    </div>
  );
};
