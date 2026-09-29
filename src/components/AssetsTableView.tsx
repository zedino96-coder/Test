import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Download, 
  Upload, 
  Copy, 
  Check, 
  Plus, 
  CheckCircle2, 
  Archive, 
  History,
  Tag,
  Phone,
  RotateCcw
} from 'lucide-react';
import { Asset, User, AssetCategory } from '../types/inventory';
import { exportAllAssetsCSV } from '../utils/export';

interface AssetsTableViewProps {
  assets: Asset[];
  users: User[];
  categories: string[];
  onOpenUserModal: (user: User) => void;
  onOpenDeviceHistory: (asset: Asset) => void;
  onOpenAssignModal: (category?: string, userId?: string, assetId?: string) => void;
  onOpenNewAssetModal: () => void;
  onOpenUploadModal: () => void;
  initialCategoryFilter?: string | 'ALL';
}

export const AssetsTableView: React.FC<AssetsTableViewProps> = ({
  assets,
  users,
  categories,
  onOpenUserModal,
  onOpenDeviceHistory,
  onOpenAssignModal,
  onOpenNewAssetModal,
  onOpenUploadModal,
  initialCategoryFilter = 'ALL',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategoryFilter);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'assigned' | 'in_stock'>('ALL');
  const [userFilter, setUserFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'category' | 'serialNumber' | 'brand' | 'assignedUserName' | 'status'>('category');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialCategoryFilter) {
      setCategoryFilter(initialCategoryFilter);
    }
  }, [initialCategoryFilter]);

  const handleCopySn = (sn: string, id: string) => {
    navigator.clipboard.writeText(sn);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      if (categoryFilter !== 'ALL' && a.category !== categoryFilter) return false;
      if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;

      if (userFilter !== 'ALL') {
        if (userFilter === 'UNASSIGNED') {
          if (a.status !== 'in_stock') return false;
        } else if (a.assignedUserId !== userFilter) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSn = a.serialNumber.toLowerCase().includes(q);
        const matchBrand = a.brand.toLowerCase().includes(q);
        const matchModel = a.model.toLowerCase().includes(q);
        const matchTag = (a.assetTag || '').toLowerCase().includes(q);
        const matchUser = (a.assignedUserName || '').toLowerCase().includes(q);
        const matchCategory = a.category.toLowerCase().includes(q);
        const matchLoc = a.location.toLowerCase().includes(q);
        const matchNotes = (a.notes || '').toLowerCase().includes(q);

        if (!matchSn && !matchBrand && !matchModel && !matchTag && !matchUser && !matchCategory && !matchLoc && !matchNotes) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [assets, categoryFilter, statusFilter, userFilter, searchQuery, sortField, sortAsc]);

  const assignedCount = assets.filter((a) => a.status === 'assigned').length;
  const inStockCount = assets.filter((a) => a.status === 'in_stock').length;

  return (
    <div className="space-y-4">
      {/* Top Controls: Search + Faceted Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search serial number (sn), asset tag, brand, model, or employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenNewAssetModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Device</span>
            </button>
            <button
              type="button"
              onClick={() => exportAllAssetsCSV(filteredAssets)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-2xs"
              title={`Export CSV: exports only the ${filteredAssets.length} currently listed assets. Can be used directly for mass upload.`}
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
              <span className="text-2xs font-mono text-slate-400">({filteredAssets.length})</span>
            </button>
            <button
              type="button"
              onClick={onOpenUploadModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
              title="Upload CSV to import hardware assets into Master Inventory"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Upload CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns and Segments */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          
          {/* Status Tabs */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 text-2xs font-medium rounded-md transition-colors ${
                statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Status ({assets.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('assigned')}
              className={`px-2.5 py-1 text-2xs font-medium rounded-md transition-colors ${
                statusFilter === 'assigned' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Assigned ({assignedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('in_stock')}
              className={`px-2.5 py-1 text-2xs font-medium rounded-md transition-colors ${
                statusFilter === 'in_stock' ? 'bg-white text-emerald-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In Stock ({inStockCount})
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">Type:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-1 px-2 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-800"
            >
              <option value="ALL">All Hardware Types</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* User Dropdown */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">User:</span>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="py-1 px-2 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-800"
            >
              <option value="ALL">All Users / Stock</option>
              <option value="UNASSIGNED">— Unassigned (In Stock) —</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} · {u.department}
                </option>
              ))}
            </select>
          </div>

          {(categoryFilter !== 'ALL' || statusFilter !== 'ALL' || userFilter !== 'ALL' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('ALL');
                setStatusFilter('ALL');
                setUserFilter('ALL');
                setSearchQuery('');
              }}
              className="text-2xs text-slate-500 hover:text-slate-800 underline ml-auto"
            >
              Clear filters
            </button>
          )}

          <div className="text-2xs text-slate-400 ml-auto font-mono tabular-nums">
            {filteredAssets.length} assets matched
          </div>

        </div>

      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold select-none">
                <th 
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 w-36"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center gap-1">
                    <span>Category</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 w-44 font-mono"
                  onClick={() => handleSort('serialNumber')}
                >
                  <div className="flex items-center gap-1">
                    <span>Serial No. (sn)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  className="py-3 px-3 cursor-pointer hover:text-slate-900"
                  onClick={() => handleSort('brand')}
                >
                  <div className="flex items-center gap-1">
                    <span>Brand &amp; Model</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 w-28"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  className="py-3 px-3 cursor-pointer hover:text-slate-900"
                  onClick={() => handleSort('assignedUserName')}
                >
                  <div className="flex items-center gap-1">
                    <span>Assigned To (Whom)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 hidden lg:table-cell">Asset Tag / Location</th>
                <th className="py-3 px-4 text-right w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssets.map((asset) => {
                const assignedUser = users.find((u) => u.id === asset.assignedUserId);
                const isAssigned = asset.status === 'assigned';
                const isJohn = assignedUser?.name.toLowerCase().includes('john');

                return (
                  <tr 
                    key={asset.id} 
                    className={`hover:bg-slate-50/80 transition-colors group ${
                      isJohn ? 'bg-blue-50/15' : ''
                    }`}
                  >
                    {/* Category */}
                    <td className="py-2.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {asset.category}
                    </td>

                    {/* Serial Number */}
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-900 tabular-nums">
                      <div className="flex items-center justify-between gap-1 max-w-[170px]">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-2xs select-all font-semibold">
                          {asset.serialNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopySn(asset.serialNumber, asset.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 p-0.5"
                          title="Copy serial number"
                        >
                          {copiedId === asset.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Brand & Model */}
                    <td className="py-2.5 px-3 text-slate-700">
                      <div className="font-semibold text-slate-900">{asset.brand}</div>
                      <div className="text-2xs text-slate-500 truncate max-w-xs">{asset.model}</div>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {isAssigned ? (
                        <span className="inline-flex items-center gap-1 text-2xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          <CheckCircle2 className="w-3 h-3 text-blue-600" />
                          Assigned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-2xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <Archive className="w-3 h-3 text-emerald-600" />
                          In Stock
                        </span>
                      )}
                    </td>

                    {/* Assigned To & Phone */}
                    <td className="py-2.5 px-3">
                      {assignedUser ? (
                        <button
                          type="button"
                          onClick={() => onOpenUserModal(assignedUser)}
                          className="flex items-center gap-1.5 text-left group hover:text-blue-600"
                        >
                          <div 
                            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-3xs font-bold shrink-0"
                            style={{ backgroundColor: assignedUser.avatarColor }}
                          >
                            {assignedUser.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 group-hover:underline">
                              {assignedUser.name}
                            </span>
                            <span className="text-3xs text-slate-500 block">
                              {assignedUser.department}
                            </span>
                          </div>
                        </button>
                      ) : (
                        <span className="text-slate-400 italic text-2xs">— Central IT Stock</span>
                      )}
                    </td>

                    {/* Asset Tag & Location */}
                    <td className="py-2.5 px-3 text-slate-500 text-2xs hidden lg:table-cell">
                      <div className="font-mono text-slate-700 font-semibold">{asset.assetTag || 'AST-N/A'}</div>
                      <div className="truncate max-w-[160px] text-slate-400">{asset.location}</div>
                    </td>

                    {/* Actions: History & Return/Assign */}
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenDeviceHistory(asset)}
                          className="px-2 py-0.5 text-2xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors flex items-center gap-1"
                          title="View device lifecycle timeline & past handovers"
                        >
                          <History className="w-3 h-3 text-slate-500" />
                          <span>History</span>
                        </button>

                        {isAssigned && assignedUser ? (
                          <button
                            type="button"
                            onClick={() => onOpenUserModal(assignedUser)}
                            className="text-2xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2 py-0.5 rounded transition-colors"
                            title="Return process must be initiated from the User Directory / Dossier"
                          >
                            Manage Custody...
                          </button>
                        ) : !isAssigned ? (
                          <button
                            type="button"
                            onClick={() => onOpenAssignModal(asset.category, undefined, asset.id)}
                            className="text-2xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded transition-colors"
                          >
                            Assign...
                          </button>
                        ) : null}
                      </div>
                    </td>

                  </tr>
                );
              })}

              {filteredAssets.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No hardware assets matched your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
