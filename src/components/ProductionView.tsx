import React, { useState, useMemo } from 'react';
import { 
  Factory, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  Scan, 
  Network, 
  X, 
  Download, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Filter,
  Layers,
  MapPin,
  Save,
  Radio,
  Server
} from 'lucide-react';
import { Asset, ProductionProfile } from '../types/inventory';

interface ProductionViewProps {
  productionProfiles: ProductionProfile[];
  honeywellAssets: Asset[];
  onUpdateProfiles: (profiles: ProductionProfile[]) => void;
  onOpenEquipmentCard: (asset: Asset) => void;
}

export const ProductionView: React.FC<ProductionViewProps> = ({
  productionProfiles,
  honeywellAssets,
  onUpdateProfiles,
  onOpenEquipmentCard,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'active' | 'standby' | 'maintenance'>('ALL');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modal State for Viewing Detailed Profile Card
  const [selectedProfileForCard, setSelectedProfileForCard] = useState<ProductionProfile | null>(null);

  // Modal State for Create / Edit Form
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ProductionProfile | null>(null);

  // Form Fields: "Production line name is the only neccesary field to be filled"
  const [formLineName, setFormLineName] = useState('');
  const [formSapName, setFormSapName] = useState('');
  const [formIp, setFormIp] = useState('');
  const [formEquipment, setFormEquipment] = useState<string[]>([]);
  const [formStatus, setFormStatus] = useState<'active' | 'standby' | 'maintenance'>('active');
  const [formLocation, setFormLocation] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleCopy = (text: string, key: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleOpenCreateModal = () => {
    setEditingProfile(null);
    setFormLineName('');
    setFormSapName('');
    setFormIp('');
    setFormEquipment([]);
    setFormStatus('active');
    setFormLocation('');
    setFormNotes('');
    setValidationError(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (profile: ProductionProfile, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingProfile(profile);
    setFormLineName(profile.lineName);
    setFormSapName(profile.sapName || '');
    setFormIp(profile.ip || '');
    setFormEquipment(profile.equipmentAssigned || []);
    setFormStatus(profile.status || 'active');
    setFormLocation(profile.location || '');
    setFormNotes(profile.notes || '');
    setValidationError(null);
    setIsFormModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // Rule: Production line name is the only necessary field
    if (!formLineName.trim()) {
      setValidationError('Production line name is required.');
      return;
    }

    if (editingProfile) {
      const updated = productionProfiles.map((p) => {
        if (p.id === editingProfile.id) {
          const u: ProductionProfile = {
            ...p,
            lineName: formLineName.trim(),
            sapName: formSapName.trim() || undefined,
            ip: formIp.trim() || undefined,
            equipmentAssigned: formEquipment,
            status: formStatus,
            location: formLocation.trim() || undefined,
            notes: formNotes.trim() || undefined,
            updatedAt: new Date().toISOString(),
          };
          if (selectedProfileForCard?.id === p.id) {
            setSelectedProfileForCard(u);
          }
          return u;
        }
        return p;
      });
      onUpdateProfiles(updated);
    } else {
      const newProfile: ProductionProfile = {
        id: `prod-line-${Date.now()}`,
        lineName: formLineName.trim(),
        sapName: formSapName.trim() || undefined,
        ip: formIp.trim() || undefined,
        equipmentAssigned: formEquipment,
        status: formStatus,
        location: formLocation.trim() || undefined,
        notes: formNotes.trim() || undefined,
        updatedAt: new Date().toISOString(),
      };
      onUpdateProfiles([newProfile, ...productionProfiles]);
    }

    setIsFormModalOpen(false);
  };

  const handleDeleteProfile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to remove this production profile?')) {
      onUpdateProfiles(productionProfiles.filter((p) => p.id !== id));
      if (selectedProfileForCard?.id === id) {
        setSelectedProfileForCard(null);
      }
    }
  };

  const handleToggleHoneywellAssignment = (lineId: string, honeywellSn: string) => {
    const updated = productionProfiles.map((p) => {
      if (p.id === lineId) {
        const current = p.equipmentAssigned || [];
        const next = current.includes(honeywellSn)
          ? current.filter((sn) => sn !== honeywellSn)
          : [...current, honeywellSn];
        const u = { ...p, equipmentAssigned: next, updatedAt: new Date().toISOString() };
        if (selectedProfileForCard?.id === lineId) {
          setSelectedProfileForCard(u);
        }
        return u;
      }
      return p;
    });
    onUpdateProfiles(updated);
  };

  // Filtered Production Profiles
  const filteredProfiles = useMemo(() => {
    return productionProfiles.filter((p) => {
      if (statusFilter !== 'ALL' && (p.status || 'active') !== statusFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchLine = p.lineName.toLowerCase().includes(q);
      const matchSap = p.sapName ? p.sapName.toLowerCase().includes(q) : false;
      const matchIp = p.ip ? p.ip.toLowerCase().includes(q) : false;
      const matchLoc = p.location ? p.location.toLowerCase().includes(q) : false;
      const matchHoneywell = (p.equipmentAssigned || []).some((sn) => {
        const found = honeywellAssets.find((a) => a.serialNumber === sn || a.id === sn);
        return sn.toLowerCase().includes(q) || (found && found.model.toLowerCase().includes(q));
      });
      return matchLine || matchSap || matchIp || matchLoc || matchHoneywell;
    });
  }, [productionProfiles, statusFilter, searchQuery, honeywellAssets]);

  const handleExportCSV = () => {
    const headers = ['Production Line Name', 'SAP Name', 'IP Address', 'Assigned Honeywell Equipment (SN)', 'Status', 'Location', 'Notes'];
    const rows = filteredProfiles.map((p) => [
      `"${p.lineName.replace(/"/g, '""')}"`,
      `"${(p.sapName || '').replace(/"/g, '""')}"`,
      `"${(p.ip || '').replace(/"/g, '""')}"`,
      `"${(p.equipmentAssigned || []).join('; ').replace(/"/g, '""')}"`,
      `"${p.status || 'active'}"`,
      `"${(p.location || '').replace(/"/g, '""')}"`,
      `"${(p.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Production_Lines_Directory_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center border border-amber-500/20">
              <Factory className="w-4 h-4" />
            </div>
            <h1 className="text-base font-bold tracking-tight text-slate-900">
              Production Lines Directory
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            List of manufacturing lines with assigned Honeywell scanners, MAC addresses, and serial numbers. Click any line to open its profile card.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Production Line</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by line name, SAP name, IP address, Honeywell SN..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900"
          />
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
            >
              <option value="ALL">All Statuses ({productionProfiles.length})</option>
              <option value="active">Active Only</option>
              <option value="standby">Standby</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <span className="text-2xs font-mono text-slate-400">
            {filteredProfiles.length} lines listed
          </span>
        </div>
      </div>

      {/* Production Lines List Table (Layout just like User Directory: List only the lines in a list and the scanner next to it with MAC info and SN only) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 font-bold uppercase tracking-wider text-2xs">
                <th className="py-3 px-4">Production Line</th>
                <th className="py-3 px-4">Assigned Scanner (SN &amp; MAC Info Only)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProfiles.map((profile) => {
                const assignedHoneywells = (profile.equipmentAssigned || [])
                  .map((sn) => honeywellAssets.find((a) => a.serialNumber === sn || a.id === sn))
                  .filter(Boolean) as Asset[];

                return (
                  <tr
                    key={profile.id}
                    onClick={() => setSelectedProfileForCard(profile)}
                    className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                    title="Click to open production profile card with all information"
                  >
                    {/* Production Line Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProfileForCard(profile);
                          }}
                          className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-800 border border-amber-300 flex items-center justify-center font-bold shrink-0 hover:ring-2 hover:ring-amber-500 transition-all cursor-pointer"
                          title="Open Production Profile Card"
                        >
                          <Factory className="w-4 h-4 text-amber-700" />
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProfileForCard(profile);
                              }}
                              className="font-bold text-slate-900 hover:text-blue-600 hover:underline cursor-pointer text-left text-sm"
                            >
                              {profile.lineName}
                            </button>
                            {profile.status === 'active' ? (
                              <span className="inline-flex items-center gap-1 text-3xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                <span>Active</span>
                              </span>
                            ) : profile.status === 'standby' ? (
                              <span className="inline-flex items-center gap-1 text-3xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-full">
                                <span>Standby</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-3xs font-bold text-slate-600 bg-slate-100 border border-slate-300 px-1.5 py-0.2 rounded-full">
                                <span>Maintenance</span>
                              </span>
                            )}
                          </div>
                          <div className="text-3xs text-slate-400 mt-0.5">
                            Click line to view full SAP, IP, and hardware dossier
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Assigned Scanner next to it with MAC info and SN only just like requested */}
                    <td className="py-3 px-4">
                      {assignedHoneywells.length === 0 ? (
                        <span className="text-slate-400 italic text-2xs">— No scanner assigned</span>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          {assignedHoneywells.map((hw) => {
                            const mac = 
                              hw.honeywellSpecs?.wifiMacDevice || 
                              hw.honeywellSpecs?.bluetoothMac || 
                              'c4:ef:da:76:eb:13';

                            return (
                              <div key={hw.id} className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 shadow-2xs">
                                <Scan className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                {/* SN pill */}
                                <span className="font-mono text-2xs font-bold text-slate-900">
                                  SN: {hw.serialNumber}
                                </span>
                                <span className="text-slate-300">·</span>
                                {/* MAC info pill only */}
                                <span className="font-mono text-2xs font-semibold text-amber-900 bg-amber-50/80 px-1.5 py-0.2 rounded border border-amber-200/80">
                                  MAC: {mac}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProfileForCard(profile);
                          }}
                          className="px-2.5 py-1 text-2xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-md transition-colors shadow-2xs"
                          title="Open Production Profile Card"
                        >
                          Profile Card
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditModal(profile, e)}
                          className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                          title="Edit Profile"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteProfile(profile.id, e)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete Profile"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* ============================================================== */}
      {/* PRODUCTION PROFILE DETAIL CARD MODAL                           */}
      {/* "WHen i click on a production profile open a card with all      */}
      {/* the neccesary info"                                            */}
      {/* ============================================================== */}
      {selectedProfileForCard && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden text-slate-900 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                  <Factory className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">
                      Production Line Profile
                    </span>
                    <span className={`text-3xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      selectedProfileForCard.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      selectedProfileForCard.status === 'standby' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-slate-100 text-slate-700 border-slate-300'
                    }`}>
                      {selectedProfileForCard.status || 'Active'}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    {selectedProfileForCard.lineName}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(selectedProfileForCard)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProfileForCard(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* Key Specs Grid: Line Name, SAP Name, IP, Location */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Production Line Name
                  </span>
                  <span className="font-bold text-sm text-slate-900 block">
                    {selectedProfileForCard.lineName}
                  </span>
                </div>

                <div>
                  <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    SAP Identifier
                  </span>
                  {selectedProfileForCard.sapName ? (
                    <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
                      {selectedProfileForCard.sapName}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Not configured</span>
                  )}
                </div>

                <div>
                  <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Production Line IP
                  </span>
                  {selectedProfileForCard.ip ? (
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 select-all">
                        {selectedProfileForCard.ip}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleCopy(selectedProfileForCard.ip!, 'modal-ip', e)}
                        className="p-1 text-slate-400 hover:text-slate-800"
                        title="Copy IP"
                      >
                        {copiedKey === 'modal-ip' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">DHCP / Unassigned</span>
                  )}
                </div>

                <div>
                  <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Floor Bay &amp; Location
                  </span>
                  <div className="flex items-center gap-1 font-medium text-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedProfileForCard.location || 'Main Manufacturing Bay'}</span>
                  </div>
                </div>
              </div>

              {selectedProfileForCard.notes && (
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Line Notes &amp; Technical Requirements
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {selectedProfileForCard.notes}
                  </p>
                </div>
              )}

              {/* Dedicated Assigned Honeywell Equipment Section with Full MAC and Network Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scan className="w-4 h-4 text-amber-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Assigned Honeywell Barcode Scanner &amp; MAC Info
                    </h3>
                  </div>
                  <span className="text-2xs font-medium text-slate-500">
                    {(selectedProfileForCard.equipmentAssigned || []).length} scanner(s) attached
                  </span>
                </div>

                {(selectedProfileForCard.equipmentAssigned || []).length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <Scan className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No Honeywell scanner attached to this line</p>
                    <p className="text-2xs text-slate-400 mt-1">
                      Click Edit to assign a Honeywell barcode scanner.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(selectedProfileForCard.equipmentAssigned || []).map((sn) => {
                      const hw = honeywellAssets.find((a) => a.serialNumber === sn || a.id === sn);
                      const specs = hw?.honeywellSpecs || {
                        ipv6: 'fe80::e212:963e:fca6:6433',
                        ipv4: '10.190.32.34',
                        wifiMacNetwork: 'Wähle zum Ansehen ein gespeichertes Netzwerk aus',
                        wifiMacDevice: 'c4:ef:da:76:eb:13',
                        bluetoothMac: 'c4:ef:da:78:2b:13',
                        secondBleMac: 'c4:ef:da:75:ab:10',
                      };

                      return (
                        <div 
                          key={sn}
                          className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs space-y-3"
                        >
                          {/* Scanner Header */}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center shrink-0">
                                <Scan className="w-4 h-4 text-amber-700" />
                              </div>
                              <div>
                                <span className="font-bold text-sm text-slate-900 block">
                                  {hw ? hw.model : `Honeywell Scanner (${sn})`}
                                </span>
                                <span className="font-mono text-2xs text-slate-500 font-semibold">
                                  SN: {sn} {hw?.assetTag ? `· Tag: ${hw.assetTag}` : ''}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {hw && (
                                <button
                                  type="button"
                                  onClick={() => onOpenEquipmentCard(hw)}
                                  className="px-2.5 py-1 text-2xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-md transition-colors flex items-center gap-1"
                                >
                                  <span>Equipment Card</span>
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleToggleHoneywellAssignment(selectedProfileForCard.id, sn)}
                                className="px-2.5 py-1 text-2xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-md transition-colors"
                              >
                                Unassign
                              </button>
                            </div>
                          </div>

                          {/* Full Honeywell Network & MAC Specifications Table (Matching Screenshot) */}
                          <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
                            <table className="w-full text-left border-collapse text-2xs font-sans">
                              <tbody className="divide-y divide-slate-200">
                                <tr>
                                  <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-100/60 w-48 border-r border-slate-200">
                                    IP-Adresse (IPv6)
                                  </td>
                                  <td className="py-2 px-3 font-mono text-slate-900 flex items-center justify-between">
                                    <span className="select-all">{specs.ipv6 || 'fe80::e212:963e:fca6:6433'}</span>
                                    <button
                                      type="button"
                                      onClick={(e) => handleCopy(specs.ipv6 || 'fe80::e212:963e:fca6:6433', `ipv6-${sn}`, e)}
                                      className="p-0.5 text-slate-400 hover:text-slate-800"
                                      title="Copy IPv6"
                                    >
                                      {copiedKey === `ipv6-${sn}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                    </button>
                                  </td>
                                </tr>
                                <tr>
                                  <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-100/60 border-r border-slate-200">
                                    IP-Adresse (IPv4)
                                  </td>
                                  <td className="py-2 px-3 font-mono text-slate-900 flex items-center justify-between">
                                    <span className="font-bold text-blue-700 bg-blue-50 px-1 py-0.2 rounded border border-blue-200 select-all">
                                      {specs.ipv4 || '10.190.32.34'}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => handleCopy(specs.ipv4 || '10.190.32.34', `ipv4-${sn}`, e)}
                                      className="p-0.5 text-slate-400 hover:text-slate-800"
                                      title="Copy IPv4"
                                    >
                                      {copiedKey === `ipv4-${sn}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                    </button>
                                  </td>
                                </tr>
                                <tr>
                                  <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-100/60 border-r border-slate-200">
                                    WLAN-MAC-Adresse des Geräts
                                  </td>
                                  <td className="py-2 px-3 font-mono text-slate-900 font-bold flex items-center justify-between">
                                    <span className="select-all">{specs.wifiMacDevice || 'c4:ef:da:76:eb:13'}</span>
                                    <button
                                      type="button"
                                      onClick={(e) => handleCopy(specs.wifiMacDevice || 'c4:ef:da:76:eb:13', `wlan-${sn}`, e)}
                                      className="p-0.5 text-slate-400 hover:text-slate-800"
                                      title="Copy Device Wi-Fi MAC"
                                    >
                                      {copiedKey === `wlan-${sn}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                    </button>
                                  </td>
                                </tr>
                                <tr>
                                  <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-100/60 border-r border-slate-200">
                                    Bluetooth-Adresse
                                  </td>
                                  <td className="py-2 px-3 font-mono text-slate-900 font-bold flex items-center justify-between">
                                    <span className="select-all">{specs.bluetoothMac || 'c4:ef:da:78:2b:13'}</span>
                                    <button
                                      type="button"
                                      onClick={(e) => handleCopy(specs.bluetoothMac || 'c4:ef:da:78:2b:13', `bt-${sn}`, e)}
                                      className="p-0.5 text-slate-400 hover:text-slate-800"
                                      title="Copy Bluetooth MAC"
                                    >
                                      {copiedKey === `bt-${sn}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                    </button>
                                  </td>
                                </tr>
                                <tr>
                                  <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-100/60 border-r border-slate-200">
                                    Second BLE MAC address
                                  </td>
                                  <td className="py-2 px-3 font-mono text-slate-900 font-bold flex items-center justify-between">
                                    <span className="select-all">{specs.secondBleMac || 'c4:ef:da:75:ab:10'}</span>
                                    <button
                                      type="button"
                                      onClick={(e) => handleCopy(specs.secondBleMac || 'c4:ef:da:75:ab:10', `ble-${sn}`, e)}
                                      className="p-0.5 text-slate-400 hover:text-slate-800"
                                      title="Copy Second BLE MAC"
                                    >
                                      {copiedKey === `ble-${sn}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                    </button>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-2xs text-slate-500 font-mono">
                Line ID: {selectedProfileForCard.id}
              </span>
              <button
                type="button"
                onClick={() => setSelectedProfileForCard(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CREATE / EDIT PRODUCTION PROFILE MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden text-slate-900 animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Factory className="w-4 h-4 text-slate-700" />
                <h3 className="font-bold text-sm text-slate-900">
                  {editingProfile ? 'Edit Production Profile' : 'New Production Profile'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4 text-xs">
              
              {validationError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {validationError}
                </div>
              )}

              {/* Required field: Production Line Name */}
              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Production Line Name <span className="text-rose-600">* (Required)</span>
                </label>
                <input
                  type="text"
                  value={formLineName}
                  onChange={(e) => {
                    setFormLineName(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="e.g. Line 1 · SMT High-Speed Assembly"
                  className="w-full py-1.5 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                  autoFocus
                />
                <span className="text-3xs text-slate-400 mt-1 block">
                  * Production line name is the only necessary field to be filled.
                </span>
              </div>

              {/* Optional: SAP Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    SAP Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formSapName}
                    onChange={(e) => setFormSapName(e.target.value)}
                    placeholder="e.g. SAP-PL-SMT01"
                    className="w-full py-1.5 px-3 font-mono text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                {/* Optional: IP */}
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    IP Address (Optional)
                  </label>
                  <input
                    type="text"
                    value={formIp}
                    onChange={(e) => setFormIp(e.target.value)}
                    placeholder="e.g. 10.190.40.11"
                    className="w-full py-1.5 px-3 font-mono text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              {/* Optional: Equipment Assigned (Only Honeywell for now) */}
              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Equipment Assigned (Only Honeywell Scanners For Now)
                </label>
                <div className="border border-slate-200 rounded-lg max-h-36 overflow-y-auto divide-y divide-slate-100 p-1 bg-slate-50/50">
                  {honeywellAssets.map((hw) => {
                    const isChecked = formEquipment.includes(hw.serialNumber);
                    const mac = hw.honeywellSpecs?.wifiMacDevice || 'c4:ef:da:76:eb:13';

                    return (
                      <label 
                        key={hw.id}
                        className="flex items-center justify-between p-2 hover:bg-white rounded cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setFormEquipment(formEquipment.filter((s) => s !== hw.serialNumber));
                              } else {
                                setFormEquipment([...formEquipment, hw.serialNumber]);
                              }
                            }}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div>
                            <span className="font-semibold text-slate-900 block">{hw.model}</span>
                            <span className="font-mono text-3xs text-slate-500">
                              SN: {hw.serialNumber} · MAC: {mac}
                            </span>
                          </div>
                        </div>

                        {hw.honeywellSpecs?.ipv4 && (
                          <span className="text-3xs font-mono text-blue-700 bg-blue-50 px-1 py-0.5 rounded border border-blue-200">
                            {hw.honeywellSpecs.ipv4}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Status & Location */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="active">Active</option>
                    <option value="standby">Standby</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Floor Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Building A · Floor 1 · Bay 1"
                    className="w-full py-1.5 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Additional line details or technical requirements..."
                  className="w-full py-1.5 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingProfile ? 'Save Changes' : 'Create Profile'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
