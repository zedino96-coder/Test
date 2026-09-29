import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  RotateCcw,
  CheckCircle2, 
  MapPin, 
  Mail, 
  Phone, 
  Briefcase, 
  History, 
  Laptop, 
  Calendar,
  Edit3,
  Layers,
  Monitor,
  Mouse,
  Headphones,
  Smartphone,
  Scan,
  ShieldCheck,
  User as UserIcon,
  Tag,
  Network,
  ExternalLink,
  Plus,
  PhoneCall,
  Cpu,
  Box
} from 'lucide-react';
import { Asset, User, AssetHistoryEvent } from '../types/inventory';
import { exportUserEquipmentSlipCSV } from '../utils/export';

interface UserAssetCardModalProps {
  user: User | null;
  users: User[];
  assets: Asset[];
  history: AssetHistoryEvent[];
  onClose: () => void;
  onSelectUser: (user: User) => void;
  onUnassignAsset: (assetId: string) => void;
  onRequestReturn?: (asset: Asset, user: User) => void;
  onOpenAssignModal: (category?: string, userId?: string) => void;
  onOpenEditEvent?: (event: AssetHistoryEvent) => void;
  onOpenEquipmentModal?: (asset: Asset) => void;
}

export const UserAssetCardModal: React.FC<UserAssetCardModalProps> = ({
  user,
  users,
  assets,
  history,
  onClose,
  onSelectUser,
  onUnassignAsset,
  onRequestReturn,
  onOpenAssignModal,
  onOpenEditEvent,
  onOpenEquipmentModal,
}) => {
  // 3 Primary Tabs as requested: "all", "user info", "equipment assigned"
  const [activeTab, setActiveTab] = useState<'all' | 'user_info' | 'equipment_assigned'>('all');
  const [copied, setCopied] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!user) return null;

  const assignedAssets = assets.filter((a) => a.assignedUserId === user.id);
  const userHistory = history
    .filter((h) => h.userId === user.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const laptop = assignedAssets.find((a) => a.category === 'Laptop');
  const km = assignedAssets.find((a) => a.category === 'Keyboard / Mouse');
  const headset = assignedAssets.find((a) => a.category === 'Headset');
  const phone = assignedAssets.find((a) => a.category === 'Phone');
  const scanner = assignedAssets.find((a) => a.category.includes('Honeywell') || a.brand === 'Honeywell');
  const monitors = assignedAssets.filter((a) => a.category === 'Monitor');

  // Copy table matching user screenshot: Equipment \t sn
  const handleCopyTable = () => {
    const rows: string[] = [];
    if (headset) rows.push(`${headset.brand}\t${headset.serialNumber}`);
    if (laptop) rows.push(`${laptop.brand}\t${laptop.serialNumber}`);
    monitors.forEach((m, idx) => {
      rows.push(`${m.brand} Monitor ${idx + 1}\t${m.serialNumber}`);
    });
    if (km) rows.push(`${km.brand}\t${km.serialNumber}`);
    if (phone) rows.push(`${phone.brand}\t${phone.serialNumber}`);
    if (scanner) rows.push(`${scanner.brand}\t${scanner.serialNumber}`);

    const text = `Equipment\tsn\n` + rows.join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleTriggerReturn = (assetToReturn: Asset) => {
    if (onRequestReturn && user) {
      onRequestReturn(assetToReturn, user);
    } else {
      onUnassignAsset(assetToReturn.id);
    }
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden text-slate-900 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        
        {/* Top Control Bar with Quick Switcher */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Employee Dossier
            </span>
            <span className="text-slate-300">|</span>
            <select
              value={user.id}
              onChange={(e) => {
                const found = users.find((u) => u.id === e.target.value);
                if (found) onSelectUser(found);
              }}
              className="text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded px-2 py-1"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.department})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyTable}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
              title="Copy Equipment and SN table for spreadsheets"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copied' : 'Copy Table'}</span>
            </button>
            <button
              type="button"
              onClick={() => exportUserEquipmentSlipCSV(user.name, assignedAssets, user.phone)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>CSV</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* User Dossier Profile Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-bold shadow-xs shrink-0"
                style={{ backgroundColor: user.avatarColor }}
              >
                {user.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{user.name}</h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <Briefcase className="w-3 h-3 text-slate-400" />
                  <span>{user.role} · {user.department}</span>
                </div>
              </div>
            </div>

            {/* User Contact Info: Email & Phone */}
            <div className="text-xs text-slate-600 space-y-1 sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-lg">
              <div className="flex items-center sm:justify-end gap-1.5 text-slate-700">
                <Mail className="w-3 h-3 text-slate-400" />
                <span className="select-all font-medium">{user.email}</span>
              </div>
              <div className="flex items-center sm:justify-end gap-1.5 text-slate-900 font-mono text-2xs font-semibold">
                <Phone className="w-3 h-3 text-blue-600" />
                {user.phone ? (
                  <span className="select-all">{user.phone}</span>
                ) : (
                  <span className="text-slate-400 font-sans italic font-normal">No number assigned</span>
                )}
              </div>
              <div className="flex items-center sm:justify-end gap-1.5 text-slate-500 text-2xs">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{user.deskLocation}</span>
              </div>
            </div>
          </div>

          {/* Three Primary Tabs requested by user: All, User Info, Equipment Assigned */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('user_info')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'user_info'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>User Info</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('equipment_assigned')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'equipment_assigned'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Equipment Assigned ({assignedAssets.length})</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">

          {/* ============================================================== */}
          {/* TAB 1: ALL (Combined Complete View)                            */}
          {/* ============================================================== */}
          {activeTab === 'all' && (
            <div className="space-y-6">
              
              {/* Quick Summary Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-2xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Deployed Hardware
                  </span>
                  <div className="text-xl font-bold text-slate-900">
                    {assignedAssets.length} <span className="text-xs font-normal text-slate-500">Units</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-2xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Department Bay
                  </span>
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {user.department}
                  </div>
                  <div className="text-3xs text-slate-500 truncate">
                    {user.deskLocation}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-2xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Custody Records
                  </span>
                  <div className="text-xl font-bold text-slate-900">
                    {userHistory.length} <span className="text-xs font-normal text-slate-500">Events</span>
                  </div>
                </div>
              </div>

              {/* Equipment Allocation Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Active Equipment Allocation
                  </h3>
                  <button
                    type="button"
                    onClick={() => onOpenAssignModal(undefined, user.id)}
                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Assign Device</span>
                  </button>
                </div>

                {assignedAssets.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-lg border border-slate-200">
                    No hardware currently deployed to this employee.
                  </div>
                ) : (
                  <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-300 bg-slate-100 text-slate-800 font-bold">
                          <th className="py-2.5 px-3 w-1/3">Equipment</th>
                          <th className="py-2.5 px-3 font-mono">Serial No. (sn)</th>
                          <th className="py-2.5 px-3">Condition</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {assignedAssets.map((asset) => (
                          <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-3 font-medium text-slate-900">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center shrink-0">
                                  {getCategoryIcon(asset.category)}
                                </div>
                                <div>
                                  <span className="font-semibold block">{asset.brand} {asset.category}</span>
                                  <span className="text-3xs text-slate-500 block truncate max-w-[200px]">
                                    {asset.model}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                              {asset.serialNumber}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="text-2xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                {asset.condition}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {onOpenEquipmentModal && (
                                  <button
                                    type="button"
                                    onClick={() => onOpenEquipmentModal(asset)}
                                    className="px-2 py-1 text-2xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded"
                                    title="View Equipment Card"
                                  >
                                    Inspect Card
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleTriggerReturn(asset)}
                                  className="px-2 py-1 text-2xs font-medium text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded"
                                >
                                  Return
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Handover History Log in All tab */}
              {userHistory.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Recent Custody Timeline
                  </h3>
                  <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 bg-slate-50/50">
                    {userHistory.slice(0, 4).map((evt) => (
                      <div key={evt.id} className="p-3 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-900 block capitalize">
                            {evt.eventType.replace('_', ' ')} · {evt.assetModel}
                          </span>
                          <span className="text-2xs text-slate-500 font-mono block">
                            SN: {evt.serialNumber} {evt.notes ? `· ${evt.notes}` : ''}
                          </span>
                        </div>
                        <span className="text-3xs font-mono text-slate-400 shrink-0">
                          {evt.date}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: USER INFO (Dedicated Profile Dossier)                    */}
          {/* ============================================================== */}
          {activeTab === 'user_info' && (
            <div className="space-y-6">
              
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Employee Identity &amp; Contact Records
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block">
                      Full Legal / Corporate Name
                    </span>
                    <p className="font-bold text-slate-900 text-sm">{user.name}</p>
                    <p className="text-2xs text-slate-500">Corporate Employee ID: {user.id}</p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block">
                      Corporate Work Email
                    </span>
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-mono text-xs text-slate-900 font-medium truncate select-all">{user.email}</p>
                      <button
                        type="button"
                        onClick={() => handleCopyText(user.email, 'email')}
                        className="p-1 text-slate-400 hover:text-slate-800"
                        title="Copy email"
                      >
                        {copiedKey === 'email' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <p className="text-2xs text-slate-400">Primary single sign-on identifier</p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block">
                      Direct Phone Number
                    </span>
                    {user.phone ? (
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-mono text-xs text-slate-900 font-bold select-all">{user.phone}</p>
                        <button
                          type="button"
                          onClick={() => handleCopyText(user.phone!, 'phone')}
                          className="p-1 text-slate-400 hover:text-slate-800"
                          title="Copy phone"
                        >
                          {copiedKey === 'phone' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No direct number assigned</p>
                    )}
                    <p className="text-2xs text-slate-400">Mobile or desk extension</p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block">
                      Department &amp; Job Title
                    </span>
                    <p className="font-bold text-slate-900">{user.role}</p>
                    <p className="text-2xs text-slate-500">Department: {user.department}</p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block">
                      Allocated Desk Location
                    </span>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{user.deskLocation}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block">
                      Tenure &amp; Onboarding Date
                    </span>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{user.joinedDate || '2023-01-01'}</span>
                    </div>
                  </div>
                </div>

                {user.notes && (
                  <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Custodian Notes / Special Allocations
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">{user.notes}</p>
                  </div>
                )}
              </div>

              {/* Hardware Profile Breakdown */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Assigned Hardware Summary
                </h4>
                <div className="flex flex-wrap gap-2">
                  {assignedAssets.map((a) => (
                    <div key={a.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs">
                      {getCategoryIcon(a.category)}
                      <span className="font-semibold text-slate-800">{a.category}</span>
                      <span className="font-mono text-2xs text-slate-500">({a.serialNumber})</span>
                    </div>
                  ))}
                  {assignedAssets.length === 0 && (
                    <span className="text-xs text-slate-400">No hardware active</span>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: EQUIPMENT ASSIGNED (Detailed Interactive Cards)          */}
          {/* ============================================================== */}
          {activeTab === 'equipment_assigned' && (
            <div className="space-y-5">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Assigned Hardware Devices ({assignedAssets.length})
                  </h3>
                  <p className="text-2xs text-slate-500">
                    Full hardware details, serial numbers, tags, and network specs
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenAssignModal(undefined, user.id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Assign New Device</span>
                </button>
              </div>

              {assignedAssets.length === 0 ? (
                <div className="text-center py-10 px-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <Laptop className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">No equipment assigned</p>
                  <p className="text-2xs text-slate-400 mt-0.5">Click "Assign New Device" to issue hardware to {user.name}.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignedAssets.map((asset) => {
                    const isHon = 
                      asset.category.toLowerCase().includes('honeywell') || 
                      asset.brand.toLowerCase() === 'honeywell' || 
                      Boolean(asset.honeywellSpecs);

                    return (
                      <div 
                        key={asset.id} 
                        className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-colors"
                      >
                        {/* Equipment Header */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                              {getCategoryIcon(asset.category)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-sm">{asset.brand} {asset.model}</span>
                                {isHon && (
                                  <span className="text-3xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                                    Honeywell Unit
                                  </span>
                                )}
                              </div>
                              <span className="text-2xs text-slate-500">{asset.category} · Tag: {asset.assetTag}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {onOpenEquipmentModal && (
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onOpenEquipmentModal(asset);
                                }}
                                className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                              >
                                <span>Inspect Card</span>
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleTriggerReturn(asset)}
                              className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Return</span>
                            </button>
                          </div>
                        </div>

                        {/* Specs row */}
                        <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-lg text-2xs mb-3">
                          <div>
                            <span className="text-slate-400 block font-medium">Serial Number</span>
                            <span className="font-mono font-bold text-slate-900">{asset.serialNumber}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-medium">Condition</span>
                            <span className="font-semibold text-emerald-700">{asset.condition} Grade</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-medium">Assigned Date</span>
                            <span className="font-medium text-slate-800">{asset.assignedDate || 'Active'}</span>
                          </div>
                        </div>

                        {/* SPECIAL HONEYWELL INFORMATION (If Honeywell Device) */}
                        {isHon && (
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-1.5 mb-2">
                              <Network className="w-3.5 h-3.5 text-amber-600" />
                              <span className="text-2xs font-bold uppercase tracking-wider text-amber-800">
                                Honeywell Network &amp; MAC Specifications
                              </span>
                            </div>

                            <div className="border border-slate-200 rounded-lg overflow-hidden text-2xs bg-white">
                              <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 font-mono">
                                <div className="p-2 flex items-center justify-between">
                                  <span className="font-sans font-semibold text-slate-500">IP-Adresse (IPv6):</span>
                                  <span className="text-slate-900 select-all truncate ml-2 font-bold">
                                    {asset.honeywellSpecs?.ipv6 || 'fe80::e212:963e:fca6:6433'}
                                  </span>
                                </div>
                                <div className="p-2 flex items-center justify-between">
                                  <span className="font-sans font-semibold text-slate-500">IP-Adresse (IPv4):</span>
                                  <span className="text-blue-700 select-all truncate ml-2 font-bold">
                                    {asset.honeywellSpecs?.ipv4 || '10.190.32.34'}
                                  </span>
                                </div>
                                <div className="p-2 flex items-center justify-between">
                                  <span className="font-sans font-semibold text-slate-500">WLAN-MAC des Geräts:</span>
                                  <span className="text-slate-900 select-all truncate ml-2 font-bold">
                                    {asset.honeywellSpecs?.wifiMacDevice || 'c4:ef:da:76:eb:13'}
                                  </span>
                                </div>
                                <div className="p-2 flex items-center justify-between">
                                  <span className="font-sans font-semibold text-slate-500">Bluetooth-Adresse:</span>
                                  <span className="text-slate-900 select-all truncate ml-2 font-bold">
                                    {asset.honeywellSpecs?.bluetoothMac || 'c4:ef:da:78:2b:13'}
                                  </span>
                                </div>
                                <div className="p-2 flex items-center justify-between col-span-2">
                                  <span className="font-sans font-semibold text-slate-500">Second BLE MAC:</span>
                                  <span className="text-slate-900 select-all truncate ml-2 font-bold">
                                    {asset.honeywellSpecs?.secondBleMac || 'c4:ef:da:75:ab:10'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-2xs text-slate-500">
            {assignedAssets.length} active hardware unit(s) deployed to <strong className="text-slate-800">{user.name}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
