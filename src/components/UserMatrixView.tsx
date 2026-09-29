import React, { useState } from 'react';
import { 
  Search, 
  Eye, 
  Download, 
  Laptop, 
  Mouse, 
  Headphones, 
  Monitor, 
  Smartphone,
  Scan,
  Cpu,
  LayoutList, 
  Table2, 
  Copy, 
  Check, 
  Filter,
  PlusCircle,
  CheckCircle2,
  Calendar,
  MapPin,
  Mail,
  UserCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { User, Asset } from '../types/inventory';
import { exportUserEquipmentSlipCSV, exportUserMatrixCSV } from '../utils/export';

interface UserMatrixViewProps {
  users: User[];
  assets: Asset[];
  onOpenUserModal: (user: User) => void;
  onOpenAssignModal: (category?: string, userId?: string) => void;
  onOpenDeviceHistory?: (asset: Asset) => void;
}

export const UserMatrixView: React.FC<UserMatrixViewProps> = ({
  users,
  assets,
  onOpenUserModal,
  onOpenAssignModal,
  onOpenDeviceHistory,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'matrix'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [monitorCountFilter, setMonitorCountFilter] = useState<'ALL' | '1' | '2'>('ALL');
  const [copiedSn, setCopiedSn] = useState<string | null>(null);

  const departments = ['ALL', ...Array.from(new Set(users.map((u) => u.department)))];

  const handleCopySn = (sn: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(sn);
    setCopiedSn(sn);
    setTimeout(() => setCopiedSn(null), 1800);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Laptop':
        return <Laptop className="w-3.5 h-3.5 text-blue-600" />;
      case 'Monitor':
        return <Monitor className="w-3.5 h-3.5 text-indigo-600" />;
      case 'Keyboard / Mouse':
        return <Mouse className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Headset':
        return <Headphones className="w-3.5 h-3.5 text-amber-600" />;
      case 'Phone':
        return <Smartphone className="w-3.5 h-3.5 text-rose-600" />;
      default:
        if (category.includes('Honeywell') || category.includes('Scanner')) {
          return <Scan className="w-3.5 h-3.5 text-orange-600" />;
        }
        return <Cpu className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesDept = departmentFilter === 'ALL' || u.department === departmentFilter;
    if (!matchesDept) return false;

    const userAssets = assets.filter((a) => a.assignedUserId === u.id);
    const monitorCount = userAssets.filter((a) => a.category === 'Monitor').length;

    if (monitorCountFilter === '1' && monitorCount !== 1) return false;
    if (monitorCountFilter === '2' && monitorCount !== 2) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();

    // Match user fields
    if (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.department.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)) {
      return true;
    }

    // Match any serial number, brand, or model assigned to this user
    return userAssets.some(
      (a) => a.serialNumber.toLowerCase().includes(q) || 
             a.model.toLowerCase().includes(q) || 
             a.brand.toLowerCase().includes(q)
    );
  });

  const johnUser = users.find((u) => u.name.toLowerCase().includes('john'));

  return (
    <div className="space-y-6">
      
      {/* Spotlight for "John" matching prompt */}
      {johnUser && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-lg p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-9 h-9 rounded-md flex items-center justify-center text-white text-xs font-bold shadow-xs border border-white/20 shrink-0"
              style={{ backgroundColor: johnUser.avatarColor }}
            >
              JM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold tracking-tight text-white">
                  Spotlight: {johnUser.name}
                </h3>
                <span className="text-3xs bg-blue-500/30 text-blue-200 px-1.5 py-0.2 rounded border border-blue-400/30 font-medium">
                  Sample Record
                </span>
                <span className="text-3xs bg-emerald-500/30 text-emerald-200 px-1.5 py-0.2 rounded border border-emerald-400/30 font-mono">
                  2 Monitors Assigned
                </span>
              </div>
              <p className="text-2xs text-slate-300 mt-0.5">
                Staff Systems Engineer · Engineering · Desk 312 · Holding Lenovo Laptop (sn: PW0QRQB8), Jabra (sn: 89780115) &amp; Dual 4K Monitors
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onOpenUserModal(johnUser)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded transition-colors shadow-xs"
            >
              <Eye className="w-3.5 h-3.5 text-slate-900" />
              <span>Equipment Slip</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const johnAssets = assets.filter((a) => a.assignedUserId === johnUser.id);
                exportUserEquipmentSlipCSV(johnUser.name, johnAssets, johnUser.phone);
              }}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-slate-700 hover:bg-slate-600 rounded transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar with List vs Matrix Toggle */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Live Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search employee, email, role, or serial number (e.g. 89780115)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900"
            />
          </div>

          {/* Right Controls: View Switcher & Export */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>Card View</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('matrix')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors ${
                  viewMode === 'matrix'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Table2 className="w-3.5 h-3.5" />
                <span>Matrix Table</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => exportUserMatrixCSV(users, assets)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Badges & Facets */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          
          {/* Department Filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">Department:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="py-1 px-2 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-slate-900 text-slate-800"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d === 'ALL' ? 'All Departments' : d}
                </option>
              ))}
            </select>
          </div>

          {/* Monitors Filter: 2 monitors vs 1 monitor */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">Monitors Setup:</span>
            <select
              value={monitorCountFilter}
              onChange={(e) => setMonitorCountFilter(e.target.value as any)}
              className="py-1 px-2 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-slate-900 text-slate-800"
            >
              <option value="ALL">All Setups (1 or 2)</option>
              <option value="2">Dual Monitors (2)</option>
              <option value="1">Single Monitor (1)</option>
            </select>
          </div>

          {(departmentFilter !== 'ALL' || monitorCountFilter !== 'ALL' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setDepartmentFilter('ALL');
                setMonitorCountFilter('ALL');
                setSearchQuery('');
              }}
              className="text-2xs text-slate-500 hover:text-slate-800 underline ml-2"
            >
              Reset filters
            </button>
          )}

          <div className="text-2xs text-slate-400 ml-auto font-mono tabular-nums">
            Showing {filteredUsers.length} of {users.length} Users
          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* OPTION 1: USER CARDS WITH INTEGRATED EQUIPMENT SLIP      */}
      {/* Slipping the whole equipment slip into user card         */}
      {/* Displays category & sn prominently; click for details    */}
      {/* ======================================================== */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredUsers.map((user) => {
            const userAssets = assets.filter((a) => a.assignedUserId === user.id);
            const monitors = userAssets.filter((a) => a.category === 'Monitor');
            const isJohn = user.name.toLowerCase().includes('john');

            return (
              <div
                key={user.id}
                className={`bg-white rounded-lg border border-slate-200 p-3.5 sm:p-4 shadow-2xs hover:shadow-xs transition-shadow ${
                  isJohn ? 'border-blue-300 bg-blue-50/10' : ''
                }`}
              >
                {/* Employee Dossier Header - Compact & No Phone */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-2xs shrink-0"
                      style={{ backgroundColor: user.avatarColor }}
                    >
                      {user.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-bold text-slate-900">{user.name}</h4>
                        {isJohn && (
                          <span className="text-3xs font-mono bg-blue-100 text-blue-700 px-1 py-0.2 rounded font-semibold">
                            Sample
                          </span>
                        )}
                        <span className="text-3xs bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                          {user.department}
                        </span>
                        {monitors.length === 2 ? (
                          <span className="text-3xs bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.2 rounded font-medium">
                            2 Monitors
                          </span>
                        ) : monitors.length === 1 ? (
                          <span className="text-3xs bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded font-medium">
                            1 Monitor
                          </span>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-2xs text-slate-500 mt-0.5">
                        <span>{user.role}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {user.email}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {user.deskLocation}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for User */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenUserModal(user)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                      title="Open full Equipment Handover Slip & Timeline"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-700" />
                      <span>Equipment Slip</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => exportUserEquipmentSlipCSV(user.name, userAssets, user.phone)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                      title="Download CSV Slip"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Slipped Equipment Slip Inside User Card: Category and SN only; Compact & Clickable */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-3xs font-bold uppercase tracking-wider text-slate-400">
                      Custody Equipment Slip ({userAssets.length})
                    </span>
                    <span className="text-3xs text-slate-400">
                      Click item for details
                    </span>
                  </div>

                  {userAssets.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {userAssets.map((asset) => (
                        <div
                          key={asset.id}
                          onClick={() => onOpenDeviceHistory ? onOpenDeviceHistory(asset) : onOpenUserModal(user)}
                          className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-50/70 hover:bg-blue-50/50 hover:border-blue-400 transition-all cursor-pointer group"
                          title="Click to view full device specs, history, and custody info"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            {getCategoryIcon(asset.category)}
                            <span className="text-2xs font-bold text-slate-800 truncate group-hover:text-blue-700">
                              {asset.category}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-3xs font-mono text-slate-400">sn:</span>
                            <code className="text-3xs font-mono font-bold text-slate-900 bg-white border border-slate-200 px-1 py-0.2 rounded select-all group-hover:border-blue-300">
                              {asset.serialNumber}
                            </code>
                            <button
                              type="button"
                              onClick={(e) => handleCopySn(asset.serialNumber, e)}
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
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-2 px-3 rounded-md border border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-between text-2xs text-slate-400">
                      <span>No hardware currently assigned to {user.name}</span>
                      <button
                        type="button"
                        onClick={() => onOpenAssignModal(undefined, user.id)}
                        className="text-2xs font-semibold text-blue-600 hover:underline"
                      >
                        + Assign Equipment
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* OPTION 2: USER ASSIGNMENTS AS A COMPACT MATRIX TABLE     */}
      {/* Category and SN display with clickable details           */}
      {/* ======================================================== */}
      {viewMode === 'matrix' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-800 font-semibold">
                  <th className="py-3 px-4 min-w-[200px]">Employee / Department</th>
                  <th className="py-3 px-3 min-w-[170px]">
                    <div className="flex items-center gap-1">
                      <Laptop className="w-3.5 h-3.5 text-slate-600" />
                      <span>Laptop (Lenovo)</span>
                    </div>
                  </th>
                  <th className="py-3 px-3 min-w-[170px]">
                    <div className="flex items-center gap-1">
                      <Mouse className="w-3.5 h-3.5 text-slate-600" />
                      <span>Keyboard / Mouse</span>
                    </div>
                  </th>
                  <th className="py-3 px-3 min-w-[170px]">
                    <div className="flex items-center gap-1">
                      <Headphones className="w-3.5 h-3.5 text-slate-600" />
                      <span>Headset</span>
                    </div>
                  </th>
                  <th className="py-3 px-3 min-w-[220px]">
                    <div className="flex items-center gap-1">
                      <Monitor className="w-3.5 h-3.5 text-slate-600" />
                      <span>Monitors (1 or 2)</span>
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right min-w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => {
                  const userAssets = assets.filter((a) => a.assignedUserId === user.id);
                  const laptop = userAssets.find((a) => a.category === 'Laptop');
                  const km = userAssets.find((a) => a.category === 'Keyboard / Mouse');
                  const headset = userAssets.find((a) => a.category === 'Headset');
                  const monitors = userAssets.filter((a) => a.category === 'Monitor');
                  const isJohn = user.name.toLowerCase().includes('john');

                  return (
                    <tr 
                      key={user.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isJohn ? 'bg-blue-50/20' : ''
                      }`}
                    >
                      {/* User Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div 
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ backgroundColor: user.avatarColor }}
                          >
                            {user.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{user.name}</span>
                              {isJohn && (
                                <span className="text-3xs font-mono bg-blue-100 text-blue-700 px-1 py-0.2 rounded">
                                  Sample
                                </span>
                              )}
                            </div>
                            <div className="text-2xs text-slate-500">
                              {user.role} · {user.department}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Laptop: Category & SN in display (Clickable for specs) */}
                      <td className="py-3 px-3">
                        {laptop ? (
                          <div 
                            onClick={() => onOpenDeviceHistory ? onOpenDeviceHistory(laptop) : onOpenUserModal(user)}
                            className="space-y-0.5 cursor-pointer group"
                            title="Click for full device history & specs"
                          >
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-2xs text-slate-700 group-hover:text-blue-600 transition-colors">
                                Laptop
                              </span>
                              <span className="text-3xs text-slate-400 font-mono">
                                ({laptop.brand})
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-3xs text-slate-400 font-mono font-medium">sn:</span>
                              <code className="text-2xs font-mono bg-slate-100 text-slate-900 font-semibold px-1.5 py-0.2 rounded tabular-nums select-all group-hover:bg-blue-50 group-hover:text-blue-700">
                                {laptop.serialNumber}
                              </code>
                              <button
                                type="button"
                                onClick={(e) => handleCopySn(laptop.serialNumber, e)}
                                className="text-slate-400 hover:text-slate-700 p-0.5"
                                title="Copy serial number"
                              >
                                {copiedSn === laptop.serialNumber ? (
                                  <Check className="w-2.5 h-2.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-2.5 h-2.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-2xs text-slate-400 italic">None</span>
                        )}
                      </td>

                      {/* Keyboard / Mouse: Category & SN in display */}
                      <td className="py-3 px-3">
                        {km ? (
                          <div 
                            onClick={() => onOpenDeviceHistory ? onOpenDeviceHistory(km) : onOpenUserModal(user)}
                            className="space-y-0.5 cursor-pointer group"
                            title="Click for full device history & specs"
                          >
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-2xs text-slate-700 group-hover:text-blue-600 transition-colors">
                                Keyboard/Mouse
                              </span>
                              <span className="text-3xs text-slate-400 font-mono">
                                ({km.brand})
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-3xs text-slate-400 font-mono font-medium">sn:</span>
                              <code className="text-2xs font-mono bg-slate-100 text-slate-900 font-semibold px-1.5 py-0.2 rounded tabular-nums select-all group-hover:bg-blue-50 group-hover:text-blue-700">
                                {km.serialNumber}
                              </code>
                              <button
                                type="button"
                                onClick={(e) => handleCopySn(km.serialNumber, e)}
                                className="text-slate-400 hover:text-slate-700 p-0.5"
                                title="Copy serial number"
                              >
                                {copiedSn === km.serialNumber ? (
                                  <Check className="w-2.5 h-2.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-2.5 h-2.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-2xs text-slate-400 italic">None</span>
                        )}
                      </td>

                      {/* Headset: Category & SN in display */}
                      <td className="py-3 px-3">
                        {headset ? (
                          <div 
                            onClick={() => onOpenDeviceHistory ? onOpenDeviceHistory(headset) : onOpenUserModal(user)}
                            className="space-y-0.5 cursor-pointer group"
                            title="Click for full device history & specs"
                          >
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-2xs text-slate-700 group-hover:text-blue-600 transition-colors">
                                Headset
                              </span>
                              <span className="text-3xs text-slate-400 font-mono">
                                ({headset.brand})
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-3xs text-slate-400 font-mono font-medium">sn:</span>
                              <code className="text-2xs font-mono bg-slate-100 text-slate-900 font-semibold px-1.5 py-0.2 rounded tabular-nums select-all group-hover:bg-blue-50 group-hover:text-blue-700">
                                {headset.serialNumber}
                              </code>
                              <button
                                type="button"
                                onClick={(e) => handleCopySn(headset.serialNumber, e)}
                                className="text-slate-400 hover:text-slate-700 p-0.5"
                                title="Copy serial number"
                              >
                                {copiedSn === headset.serialNumber ? (
                                  <Check className="w-2.5 h-2.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-2.5 h-2.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-2xs text-slate-400 italic">None</span>
                        )}
                      </td>

                      {/* Monitors: Category & SN in display (1 or 2) */}
                      <td className="py-3 px-3">
                        {monitors.length > 0 ? (
                          <div className="space-y-1.5">
                            {monitors.map((mon, mIdx) => (
                              <div 
                                key={mon.id} 
                                onClick={() => onOpenDeviceHistory ? onOpenDeviceHistory(mon) : onOpenUserModal(user)}
                                className="flex items-center gap-1 text-2xs cursor-pointer group"
                                title="Click for full monitor specs and history"
                              >
                                <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                                  Monitor #{mIdx + 1}:
                                </span>
                                <span className="text-3xs text-slate-400 font-mono">sn:</span>
                                <code className="font-mono bg-slate-100 text-slate-900 font-semibold px-1 py-0.2 rounded tabular-nums select-all group-hover:bg-blue-50 group-hover:text-blue-700">
                                  {mon.serialNumber}
                                </code>
                                <span className="text-3xs text-slate-400 truncate max-w-[80px]">
                                  ({mon.brand})
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => handleCopySn(mon.serialNumber, e)}
                                  className="text-slate-400 hover:text-slate-700 p-0.5"
                                  title="Copy serial number"
                                >
                                  {copiedSn === mon.serialNumber ? (
                                    <Check className="w-2 h-2 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-2 h-2" />
                                  )}
                                </button>
                              </div>
                            ))}
                            {monitors.length === 1 && (
                              <div className="text-3xs text-amber-600 font-medium">
                                (1 monitor setup)
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-2xs text-slate-400 italic">None</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenUserModal(user)}
                            className="px-2.5 py-1 text-2xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors whitespace-nowrap"
                          >
                            View Slip
                          </button>
                          <button
                            type="button"
                            onClick={() => exportUserEquipmentSlipCSV(user.name, userAssets, user.phone)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                            title="Export CSV"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
