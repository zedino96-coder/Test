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
  Edit3
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
}) => {
  const [activeTab, setActiveTab] = useState<'slip' | 'history'>('slip');
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden text-slate-900">
        
        {/* Top Control Bar */}
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

        {/* User Dossier Header with Phone and Email fields */}
        <div className="px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-xs shrink-0"
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
                <span className="select-all">{user.phone || 'No phone recorded'}</span>
              </div>
              <div className="flex items-center sm:justify-end gap-1.5 text-slate-500 text-2xs">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{user.deskLocation}</span>
              </div>
            </div>
          </div>

          {/* Subtabs: Current Slip vs. Handover History */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveTab('slip')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'slip'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Current Active Equipment ({assignedAssets.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Handover &amp; Return History ({userHistory.length})</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Current Active Equipment Slip (Photo layout) */}
        {activeTab === 'slip' && (
          <div id="printable-handover-slip" className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Equipment &amp; Serial Number Allocation
              </h3>
              <span className="text-xs text-slate-500">
                {assignedAssets.length} hardware units currently deployed
              </span>
            </div>

            <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 text-xs font-semibold">
                    <th className="py-2.5 px-4 border-r border-slate-300 w-48">Equipment</th>
                    <th className="py-2.5 px-4 border-r border-slate-300 font-mono">sn</th>
                    <th className="py-2.5 px-4 hidden sm:table-cell">Brand &amp; Specification</th>
                    <th className="py-2.5 px-4 text-right w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  
                  {/* Headset (Jabra 89780115 for John) */}
                  {headset && (
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-slate-900 border-r border-slate-200">
                        <span className="text-blue-600">{headset.brand}</span> (Headset)
                      </td>
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-900 border-r border-slate-200 bg-slate-50/50">
                        <span className="select-all">{headset.serialNumber}</span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 hidden sm:table-cell">
                        {headset.model}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleTriggerReturn(headset)}
                          className="text-2xs font-medium text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-0.5 rounded transition-colors"
                          title="Confirm return of headset to Central Stock"
                        >
                          Return...
                        </button>
                      </td>
                    </tr>
                  )}

                  {/* Laptop (Lenovo PW0QRQB8 for John) */}
                  {laptop && (
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-slate-900 border-r border-slate-200">
                        <span className="text-blue-600">{laptop.brand}</span> (Laptop)
                      </td>
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-900 border-r border-slate-200 bg-slate-50/50">
                        <span className="select-all">{laptop.serialNumber}</span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 hidden sm:table-cell">
                        {laptop.model}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleTriggerReturn(laptop)}
                          className="text-2xs font-medium text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-0.5 rounded transition-colors"
                          title="Confirm return of laptop to Central Stock"
                        >
                          Return...
                        </button>
                      </td>
                    </tr>
                  )}

                  {/* Monitors (Brand: ONLY Iiyama, 1 or 2 per user) */}
                  {monitors.map((mon, idx) => (
                    <tr key={mon.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-slate-900 border-r border-slate-200">
                        <span className="text-blue-600">{mon.brand}</span> (Monitor #{idx + 1})
                      </td>
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-900 border-r border-slate-200 bg-slate-50/50">
                        <span className="select-all">{mon.serialNumber}</span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 hidden sm:table-cell">
                        {mon.model}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleTriggerReturn(mon)}
                          className="text-2xs font-medium text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-0.5 rounded transition-colors"
                          title="Confirm return of monitor to Central Stock"
                        >
                          Return...
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Keyboard / Mouse (Brand: ONLY Logi) */}
                  {km && (
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-slate-900 border-r border-slate-200">
                        <span className="text-blue-600">{km.brand}</span> (Keyboard/Mouse)
                      </td>
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-900 border-r border-slate-200 bg-slate-50/50">
                        <span className="select-all">{km.serialNumber}</span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 hidden sm:table-cell">
                        {km.model}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleTriggerReturn(km)}
                          className="text-2xs font-medium text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-0.5 rounded transition-colors"
                          title="Confirm return of keyboard/mouse to Central Stock"
                        >
                          Return...
                        </button>
                      </td>
                    </tr>
                  )}

                  {/* Phone (Brand: ONLY Iphone) */}
                  {phone && (
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-slate-900 border-r border-slate-200">
                        <span className="text-blue-600">{phone.brand}</span> (Smartphone)
                      </td>
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-900 border-r border-slate-200 bg-slate-50/50">
                        <span className="select-all">{phone.serialNumber}</span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 hidden sm:table-cell">
                        {phone.model}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleTriggerReturn(phone)}
                          className="text-2xs font-medium text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-0.5 rounded transition-colors"
                          title="Confirm return of smartphone to Central Stock"
                        >
                          Return...
                        </button>
                      </td>
                    </tr>
                  )}

                  {/* Honeywell Scanner */}
                  {scanner && (
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-slate-900 border-r border-slate-200">
                        <span className="text-blue-600">{scanner.brand}</span> (Scanner)
                      </td>
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-900 border-r border-slate-200 bg-slate-50/50">
                        <span className="select-all">{scanner.serialNumber}</span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 hidden sm:table-cell">
                        {scanner.model}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleTriggerReturn(scanner)}
                          className="text-2xs font-medium text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-0.5 rounded transition-colors"
                          title="Confirm return of Honeywell scanner to Central Stock"
                        >
                          Return...
                        </button>
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>

            {/* Formal Sign-off for Print */}
            <div className="mt-8 pt-6 border-t border-slate-200 text-xs text-slate-600 hidden print:block">
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div>
                  <p className="font-semibold text-slate-800">Employee Handover Acknowledgement:</p>
                  <p className="text-2xs text-slate-500 mt-1">
                    I acknowledge receipt of the IT hardware listed above.
                  </p>
                  <div className="mt-8 border-b border-slate-400 w-48"></div>
                  <p className="text-2xs text-slate-500 mt-1">Signature &amp; Date ({user.phone})</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">IT Custodian:</p>
                  <p className="text-2xs text-slate-500 mt-1">
                    Entered in SysAid AssetTrack Registry.
                  </p>
                  <div className="mt-8 border-b border-slate-400 w-48"></div>
                  <p className="text-2xs text-slate-500 mt-1">IT Officer Signature &amp; Date</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: User Handover & Return History */}
        {activeTab === 'history' && (
          <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Complete Handover &amp; Return Timeline for {user.name}
              </h3>
              <span className="text-2xs text-slate-400">
                All records editable for retroactive corrections
              </span>
            </div>

            <div className="space-y-3">
              {userHistory.map((hEvt) => (
                <div 
                  key={hEvt.id} 
                  className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {hEvt.date}
                      </span>
                      <span className={`text-2xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        hEvt.eventType === 'handover'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {hEvt.eventType === 'handover' ? 'Handover / Issued' : 'Return to Stock'}
                      </span>
                      {hEvt.isPastCorrection && (
                        <span className="text-3xs text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200 font-mono">
                          Past Edit
                        </span>
                      )}
                    </div>

                    {onOpenEditEvent && (
                      <button
                        type="button"
                        onClick={() => onOpenEditEvent(hEvt)}
                        className="text-2xs text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1"
                        title="Edit past date or notes"
                      >
                        <Edit3 className="w-2.5 h-2.5" />
                        <span>Edit Past</span>
                      </button>
                    )}
                  </div>

                  <div className="mt-1.5 flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-900">{hEvt.assetModel}</span>
                    <span className="text-slate-400">·</span>
                    <code className="text-2xs font-mono bg-slate-100 px-1.5 py-0.2 rounded text-slate-800 font-semibold select-all">
                      sn: {hEvt.serialNumber}
                    </code>
                    <span className="text-3xs text-slate-400">({hEvt.category})</span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    {hEvt.notes}
                  </p>

                  <div className="mt-2 text-2xs text-slate-400 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                    <span>Custodian Officer: <strong>{hEvt.custodian}</strong></span>
                    {hEvt.conditionAtEvent && (
                      <span>Condition: {hEvt.conditionAtEvent}</span>
                    )}
                  </div>
                </div>
              ))}

              {userHistory.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-400 italic">
                  No historical handover events recorded yet for this user.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>SysAid ITAM Equipment Protocol · Iiyama &amp; Logi Certified</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded font-medium hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
