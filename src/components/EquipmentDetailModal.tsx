import React, { useState } from 'react';
import { 
  X, 
  Laptop, 
  Monitor, 
  Mouse, 
  Headphones, 
  Smartphone, 
  Scan, 
  Layers, 
  Copy, 
  Check, 
  Calendar, 
  MapPin, 
  UserCheck, 
  Tag, 
  DollarSign, 
  ShieldCheck, 
  RotateCcw, 
  History, 
  Printer, 
  Edit3, 
  Wifi, 
  Bluetooth, 
  Network, 
  CheckCircle2, 
  Clock,
  ExternalLink,
  ChevronRight,
  Save,
  PhoneCall,
  Cpu,
  Box
} from 'lucide-react';
import { Asset, User, AssetHistoryEvent, HoneywellDeviceSpecs } from '../types/inventory';

interface EquipmentDetailModalProps {
  asset: Asset | null;
  users: User[];
  history: AssetHistoryEvent[];
  onClose: () => void;
  onOpenUserModal?: (user: User) => void;
  onOpenAssignModal?: (category?: string, userId?: string, assetId?: string) => void;
  onRequestReturn?: (asset: Asset, user: User) => void;
  onUpdateAsset?: (updated: Asset) => void;
  onOpenDeviceHistory?: (asset: Asset) => void;
}

export const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({
  asset,
  users,
  history,
  onClose,
  onOpenUserModal,
  onOpenAssignModal,
  onRequestReturn,
  onUpdateAsset,
  onOpenDeviceHistory,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'honeywell' | 'history'>('details');
  const [isEditingHoneywell, setIsEditingHoneywell] = useState(false);

  // Editable Honeywell specs
  const [honeywellForm, setHoneywellForm] = useState<HoneywellDeviceSpecs>({
    ipv6: asset?.honeywellSpecs?.ipv6 || 'fe80::e212:963e:fca6:6433',
    ipv4: asset?.honeywellSpecs?.ipv4 || '10.190.32.34',
    wifiMacNetwork: asset?.honeywellSpecs?.wifiMacNetwork || 'Wähle zum Ansehen ein gespeichertes Netzwerk aus',
    wifiMacDevice: asset?.honeywellSpecs?.wifiMacDevice || 'c4:ef:da:76:eb:13',
    bluetoothMac: asset?.honeywellSpecs?.bluetoothMac || 'c4:ef:da:78:2b:13',
    secondBleMac: asset?.honeywellSpecs?.secondBleMac || 'c4:ef:da:75:ab:10',
  });

  if (!asset) return null;

  const assignedUser = users.find((u) => u.id === asset.assignedUserId);
  const deviceEvents = history
    .filter((h) => h.assetId === asset.id || h.serialNumber === asset.serialNumber)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const isHoneywell = 
    asset.category.toLowerCase().includes('honeywell') || 
    asset.brand.toLowerCase() === 'honeywell' || 
    Boolean(asset.honeywellSpecs);

  const isChip = asset.category.toLowerCase().includes('chip');

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleSaveHoneywellSpecs = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateAsset) return;

    const updated: Asset = {
      ...asset,
      honeywellSpecs: {
        ...honeywellForm,
      },
      updatedAt: new Date().toISOString(),
    };

    onUpdateAsset(updated);
    setIsEditingHoneywell(false);
  };

  const getCategoryIcon = (category: string) => {
    const catLower = category.toLowerCase();
    if (catLower.includes('laptop') || catLower.includes('notebook')) return <Laptop className="w-5 h-5 text-blue-600" />;
    if (catLower.includes('monitor') || catLower.includes('display')) return <Monitor className="w-5 h-5 text-indigo-600" />;
    if (catLower.includes('keyboard') || catLower.includes('mouse')) return <Mouse className="w-5 h-5 text-emerald-600" />;
    if (catLower.includes('headset') || catLower.includes('audio')) return <Headphones className="w-5 h-5 text-violet-600" />;
    if (catLower.includes('fixed phone') || catLower.includes('desk phone') || catLower.includes('voip')) return <PhoneCall className="w-5 h-5 text-cyan-600" />;
    if (catLower.includes('phone') || catLower.includes('mobile')) return <Smartphone className="w-5 h-5 text-cyan-600" />;
    if (catLower.includes('chip') || catLower.includes('token') || catLower.includes('yubi') || catLower.includes('nfc')) return <Cpu className="w-5 h-5 text-emerald-600" />;
    if (catLower.includes('scanner') || catLower.includes('honeywell')) return <Scan className="w-5 h-5 text-amber-600" />;
    if (catLower.includes('other') || catLower.includes('dock') || catLower.includes('printer')) return <Box className="w-5 h-5 text-slate-600" />;
    return <Layers className="w-5 h-5 text-slate-600" />;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden text-slate-900 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
              {getCategoryIcon(asset.category)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">
                  {asset.category}
                </span>
                <span className="text-3xs font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
                  {asset.brand}
                </span>
                {isHoneywell && (
                  <span className="text-3xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                    Honeywell Hardware
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                {asset.model}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Print Hardware Dossier"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top Identification Bar */}
        <div className="px-6 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          {isChip ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-emerald-700 font-bold uppercase tracking-wider text-2xs">Chip Number (Necessary):</span>
                <div className="flex items-center gap-1 font-mono font-bold text-emerald-950 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-300">
                  <span>{asset.serialNumber}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(asset.serialNumber, 'sn')}
                    className="p-0.5 text-emerald-600 hover:text-emerald-900"
                    title="Copy Chip Number"
                  >
                    {copiedKey === 'sn' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">ID Number:</span>
                <div className="flex items-center gap-1 font-mono text-2xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  <span>{asset.assetTag}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(asset.assetTag, 'id')}
                    className="p-0.5 text-slate-400 hover:text-slate-700"
                    title="Copy ID Number"
                  >
                    {copiedKey === 'id' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Serial No:</span>
                <div className="flex items-center gap-1 font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  <span>{asset.serialNumber}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(asset.serialNumber, 'sn')}
                    className="p-0.5 text-slate-400 hover:text-slate-800"
                    title="Copy Serial Number"
                  >
                    {copiedKey === 'sn' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Asset Tag:</span>
                <span className="font-mono text-2xs font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                  {asset.assetTag}
                </span>
              </div>
            </>
          )}

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Status:</span>
            {asset.status === 'assigned' ? (
              <span className="inline-flex items-center gap-1 text-2xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>Assigned</span>
              </span>
            ) : asset.status === 'in_stock' ? (
              <span className="inline-flex items-center gap-1 text-2xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span>In Stock</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-2xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                <span>{asset.status}</span>
              </span>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 bg-slate-50/60">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'details'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Equipment Details</span>
          </button>

          {isHoneywell && (
            <button
              type="button"
              onClick={() => setActiveTab('honeywell')}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'honeywell'
                  ? 'border-amber-600 text-amber-700 bg-amber-50/50 rounded-t'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Network className="w-3.5 h-3.5 text-amber-600" />
              <span>Honeywell Network &amp; MAC Specs</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Custody History ({deviceEvents.length})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">

          {/* TAB 1: Hardware Details */}
          {activeTab === 'details' && (
            <div className="space-y-6">

              {/* Assignment Banner */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80">
                <span className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Current Custody &amp; Deployment
                </span>

                {asset.status === 'assigned' && assignedUser ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs shrink-0"
                        style={{ backgroundColor: assignedUser.avatarColor }}
                      >
                        {assignedUser.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              if (onOpenUserModal) onOpenUserModal(assignedUser);
                            }}
                            className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1 text-left"
                            title="Open Employee Dossier"
                          >
                            <span>{assignedUser.name}</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-2xs text-slate-500">
                          {assignedUser.role} · {assignedUser.department}
                        </p>
                        <p className="text-2xs text-slate-400">
                          Assigned since: {asset.assignedDate || 'Current assignment'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {onRequestReturn && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onRequestReturn(asset, assignedUser);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Return to Stock</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">Available in Central Stockroom</span>
                        <span className="text-2xs text-slate-500">Location: {asset.location}</span>
                      </div>
                    </div>

                    {onOpenAssignModal && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenAssignModal(asset.category, undefined, asset.id);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
                      >
                        + Assign to Employee
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Hardware Specs Grid: For Chip category, only Chip number (necessary) and ID number */}
              {isChip ? (
                <div className="space-y-4">
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-emerald-700" />
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">Chip Specification</h3>
                        <p className="text-2xs text-slate-500">Security Token / Access Identification Card</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-2xs">
                        <span className="text-2xs font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                          Chip Number <span className="text-rose-600 font-bold">* (Necessary)</span>
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-base font-bold text-slate-900 select-all">
                            {asset.serialNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(asset.serialNumber, 'chip-spec-sn')}
                            className="p-1 text-slate-400 hover:text-slate-800 transition-colors"
                            title="Copy Chip Number"
                          >
                            {copiedKey === 'chip-spec-sn' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-2xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                          ID Number
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-base font-semibold text-slate-800 select-all">
                            {asset.assetTag}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(asset.assetTag, 'chip-spec-id')}
                            className="p-1 text-slate-400 hover:text-slate-800 transition-colors"
                            title="Copy ID Number"
                          >
                            {copiedKey === 'chip-spec-id' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 bg-white border border-slate-200 rounded-lg space-y-1">
                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block">
                      Category &amp; Fleet Standard
                    </span>
                    <p className="font-semibold text-slate-800">{asset.category}</p>
                    <p className="text-2xs text-slate-500">Approved corporate brand: {asset.brand}</p>
                  </div>

                  <div className="p-3.5 bg-white border border-slate-200 rounded-lg space-y-1">
                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block">
                      Physical Condition
                    </span>
                    <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{asset.condition} Grade</span>
                    </p>
                    <p className="text-2xs text-slate-500">Lifecycle stage: {asset.lifecycleStatus}</p>
                  </div>

                  <div className="p-3.5 bg-white border border-slate-200 rounded-lg space-y-1">
                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block">
                      Deployment Location
                    </span>
                    <p className="font-semibold text-slate-800 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{asset.location}</span>
                    </p>
                  </div>

                  <div className="p-3.5 bg-white border border-slate-200 rounded-lg space-y-1">
                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block">
                      Procurement &amp; Warranty
                    </span>
                    <p className="font-semibold text-slate-800">
                      {asset.purchaseCost ? `$${asset.purchaseCost.toLocaleString()}` : 'Enterprise Fleet Tier'}
                    </p>
                    <p className="text-2xs text-slate-500">
                      Warranty until: {asset.warrantyExpiry || 'Active 3-Yr IT Warranty'}
                    </p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {asset.notes && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-2xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    ITAM Custodian Notes
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">{asset.notes}</p>
                </div>
              )}

              {/* If Honeywell, show quick teaser to Network specs */}
              {isHoneywell && (
                <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Network className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 block">
                        Honeywell Scanner Network &amp; MAC Addresses Configured
                      </span>
                      <span className="text-2xs text-slate-600">
                        IPv4: {asset.honeywellSpecs?.ipv4 || '10.190.32.34'} · Wi-Fi MAC: {asset.honeywellSpecs?.wifiMacDevice || 'c4:ef:da:76:eb:13'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('honeywell')}
                    className="px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <span>View Network Info</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: HONEYWELL SPECIAL SPECS TABLE (Matching Screenshot Exactly) */}
          {activeTab === 'honeywell' && (
            <div className="space-y-4">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Honeywell Network &amp; Wireless MAC Specifications
                  </h3>
                  <p className="text-2xs text-slate-500">
                    Exact device network configuration for barcode scanners &amp; handheld terminals
                  </p>
                </div>
                
                {onUpdateAsset && (
                  <button
                    type="button"
                    onClick={() => setIsEditingHoneywell(!isEditingHoneywell)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{isEditingHoneywell ? 'Cancel Edit' : 'Edit Specs'}</span>
                  </button>
                )}
              </div>

              {!isEditingHoneywell ? (
                /* The Exact Table from User Screenshot */
                <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                  <table className="w-full text-left border-collapse font-sans text-xs">
                    <tbody>
                      {/* IP-Adresse (IPv6) */}
                      <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-4 font-semibold text-slate-800 w-[240px] bg-slate-50/70 border-r border-slate-200">
                          IP-Adresse (IPv6)
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-900">
                          <div className="flex items-center justify-between gap-2">
                            <span className="select-all">{asset.honeywellSpecs?.ipv6 || 'fe80::e212:963e:fca6:6433'}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(asset.honeywellSpecs?.ipv6 || 'fe80::e212:963e:fca6:6433', 'ipv6')}
                              className="p-1 text-slate-400 hover:text-slate-800 rounded transition-colors"
                              title="Copy IPv6"
                            >
                              {copiedKey === 'ipv6' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* IP-Adresse (IPv4) */}
                      <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-4 font-semibold text-slate-800 bg-slate-50/70 border-r border-slate-200">
                          IP-Adresse (IPv4)
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-900">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold select-all text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                              {asset.honeywellSpecs?.ipv4 || '10.190.32.34'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(asset.honeywellSpecs?.ipv4 || '10.190.32.34', 'ipv4')}
                              className="p-1 text-slate-400 hover:text-slate-800 rounded transition-colors"
                              title="Copy IPv4"
                            >
                              {copiedKey === 'ipv4' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* WLAN-MAC-Adresse */}
                      <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-4 font-semibold text-slate-800 bg-slate-50/70 border-r border-slate-200">
                          WLAN-MAC-Adresse
                        </td>
                        <td className="py-2.5 px-4 text-slate-700">
                          <div className="flex items-center justify-between gap-2">
                            <span className="italic text-slate-500">
                              {asset.honeywellSpecs?.wifiMacNetwork || 'Wähle zum Ansehen ein gespeichertes Netzwerk aus'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(asset.honeywellSpecs?.wifiMacNetwork || 'Wähle zum Ansehen ein gespeichertes Netzwerk aus', 'wlan')}
                              className="p-1 text-slate-400 hover:text-slate-800 rounded transition-colors"
                              title="Copy"
                            >
                              {copiedKey === 'wlan' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* WLAN-MAC-Adresse des Geräts */}
                      <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-4 font-semibold text-slate-800 bg-slate-50/70 border-r border-slate-200">
                          WLAN-MAC-Adresse des Geräts
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-900 font-bold">
                          <div className="flex items-center justify-between gap-2">
                            <span className="select-all">{asset.honeywellSpecs?.wifiMacDevice || 'c4:ef:da:76:eb:13'}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(asset.honeywellSpecs?.wifiMacDevice || 'c4:ef:da:76:eb:13', 'wlan_dev')}
                              className="p-1 text-slate-400 hover:text-slate-800 rounded transition-colors"
                              title="Copy Device MAC"
                            >
                              {copiedKey === 'wlan_dev' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Bluetooth-Adresse */}
                      <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-4 font-semibold text-slate-800 bg-slate-50/70 border-r border-slate-200">
                          Bluetooth-Adresse
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-900 font-bold">
                          <div className="flex items-center justify-between gap-2">
                            <span className="select-all">{asset.honeywellSpecs?.bluetoothMac || 'c4:ef:da:78:2b:13'}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(asset.honeywellSpecs?.bluetoothMac || 'c4:ef:da:78:2b:13', 'bt')}
                              className="p-1 text-slate-400 hover:text-slate-800 rounded transition-colors"
                              title="Copy Bluetooth MAC"
                            >
                              {copiedKey === 'bt' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Second BLE MAC address */}
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-4 font-semibold text-slate-800 bg-slate-50/70 border-r border-slate-200">
                          Second BLE MAC address
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-900 font-bold">
                          <div className="flex items-center justify-between gap-2">
                            <span className="select-all">{asset.honeywellSpecs?.secondBleMac || 'c4:ef:da:75:ab:10'}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(asset.honeywellSpecs?.secondBleMac || 'c4:ef:da:75:ab:10', 'ble')}
                              className="p-1 text-slate-400 hover:text-slate-800 rounded transition-colors"
                              title="Copy Second BLE MAC"
                            >
                              {copiedKey === 'ble' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Edit Honeywell Specs Form */
                <form onSubmit={handleSaveHoneywellSpecs} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-2xs font-bold uppercase text-slate-600 mb-1">
                      IP-Adresse (IPv6)
                    </label>
                    <input
                      type="text"
                      value={honeywellForm.ipv6 || ''}
                      onChange={(e) => setHoneywellForm({ ...honeywellForm, ipv6: e.target.value })}
                      placeholder="e.g. fe80::e212:963e:fca6:6433"
                      className="w-full py-1.5 px-3 font-mono text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-2xs font-bold uppercase text-slate-600 mb-1">
                        IP-Adresse (IPv4)
                      </label>
                      <input
                        type="text"
                        value={honeywellForm.ipv4 || ''}
                        onChange={(e) => setHoneywellForm({ ...honeywellForm, ipv4: e.target.value })}
                        placeholder="e.g. 10.190.32.34"
                        className="w-full py-1.5 px-3 font-mono text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-2xs font-bold uppercase text-slate-600 mb-1">
                        WLAN-MAC-Adresse des Geräts
                      </label>
                      <input
                        type="text"
                        value={honeywellForm.wifiMacDevice || ''}
                        onChange={(e) => setHoneywellForm({ ...honeywellForm, wifiMacDevice: e.target.value })}
                        placeholder="e.g. c4:ef:da:76:eb:13"
                        className="w-full py-1.5 px-3 font-mono text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-2xs font-bold uppercase text-slate-600 mb-1">
                      WLAN-MAC-Adresse
                    </label>
                    <input
                      type="text"
                      value={honeywellForm.wifiMacNetwork || ''}
                      onChange={(e) => setHoneywellForm({ ...honeywellForm, wifiMacNetwork: e.target.value })}
                      placeholder="e.g. Wähle zum Ansehen ein gespeichertes Netzwerk aus"
                      className="w-full py-1.5 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-2xs font-bold uppercase text-slate-600 mb-1">
                        Bluetooth-Adresse
                      </label>
                      <input
                        type="text"
                        value={honeywellForm.bluetoothMac || ''}
                        onChange={(e) => setHoneywellForm({ ...honeywellForm, bluetoothMac: e.target.value })}
                        placeholder="e.g. c4:ef:da:78:2b:13"
                        className="w-full py-1.5 px-3 font-mono text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-2xs font-bold uppercase text-slate-600 mb-1">
                        Second BLE MAC address
                      </label>
                      <input
                        type="text"
                        value={honeywellForm.secondBleMac || ''}
                        onChange={(e) => setHoneywellForm({ ...honeywellForm, secondBleMac: e.target.value })}
                        placeholder="e.g. c4:ef:da:75:ab:10"
                        className="w-full py-1.5 px-3 font-mono text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingHoneywell(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Specs</span>
                    </button>
                  </div>
                </form>
              )}

              <p className="text-2xs text-slate-400 italic">
                * Data is indexed for inventory audits, active barcode verification, and network asset scanning.
              </p>

            </div>
          )}

          {/* TAB 3: Device History Timeline */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">
                  Custody &amp; Handover Events ({deviceEvents.length})
                </span>
                {onOpenDeviceHistory && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenDeviceHistory(asset);
                    }}
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>Full Audit View</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {deviceEvents.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                  No custody events recorded for this device serial number yet.
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 border-l-2 border-slate-200">
                  {deviceEvents.map((evt) => (
                    <div key={evt.id} className="relative group">
                      <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-slate-900" />
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-bold text-slate-900 capitalize">
                            {evt.eventType.replace('_', ' ')}
                          </span>
                          <span className="text-3xs text-slate-400 font-mono">
                            {evt.date}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700">{evt.notes}</p>
                        {evt.userName && (
                          <p className="text-2xs text-slate-500 mt-1 font-medium">
                            Employee: {evt.userName} {evt.custodian ? `· Custodian: ${evt.custodian}` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-2xs text-slate-500">
            Serial Number: <span className="font-mono font-bold text-slate-800">{asset.serialNumber}</span>
          </div>

          <div className="flex items-center gap-2">
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
    </div>
  );
};
