import React from 'react';
import { 
  X, 
  History, 
  Calendar, 
  Edit3, 
  PlusCircle, 
  CheckCircle2, 
  RotateCcw, 
  Laptop, 
  ShieldCheck,
  Tag,
  DollarSign,
  UserCheck
} from 'lucide-react';
import { Asset, AssetHistoryEvent } from '../types/inventory';

interface DeviceHistoryModalProps {
  asset: Asset | null;
  history: AssetHistoryEvent[];
  onClose: () => void;
  onOpenEditEvent: (event: AssetHistoryEvent) => void;
  onAddEventForDevice: (asset: Asset) => void;
}

export const DeviceHistoryModal: React.FC<DeviceHistoryModalProps> = ({
  asset,
  history,
  onClose,
  onOpenEditEvent,
  onAddEventForDevice,
}) => {
  if (!asset) return null;

  const deviceEvents = history
    .filter((h) => h.assetId === asset.id || h.serialNumber === asset.serialNumber)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-sm text-slate-900">
              Device Lifecycle &amp; Custody History
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Device Summary Card (SysAid ITAM Style) */}
        <div className="p-6 bg-slate-50/60 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                  {asset.category}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Tag: {asset.assetTag || 'AST-N/A'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                {asset.brand} {asset.model}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 font-mono">
                <span>sn:</span>
                <span className="font-bold select-all bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  {asset.serialNumber}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-1 sm:text-right">
              <div>
                Status:{' '}
                <strong className={asset.status === 'assigned' ? 'text-blue-700' : 'text-emerald-700'}>
                  {asset.status === 'assigned' ? `Assigned to ${asset.assignedUserName}` : 'In Stock'}
                </strong>
              </div>
              <div className="text-2xs text-slate-400">
                Location: {asset.location}
              </div>
              {asset.warrantyExpiry && (
                <div className="text-2xs text-slate-400">
                  Warranty until: <span className="font-mono">{asset.warrantyExpiry}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timeline List */}
        <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
          
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Chronological Audit Trail ({deviceEvents.length} events recorded)
            </h4>
            <button
              type="button"
              onClick={() => onAddEventForDevice(asset)}
              className="flex items-center gap-1 text-2xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded"
            >
              <PlusCircle className="w-3 h-3" />
              <span>Log Past Event for this Device</span>
            </button>
          </div>

          <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 pt-2 pb-2">
            {deviceEvents.map((evt) => (
              <div key={evt.id} className="relative pl-6 group">
                
                {/* Dot */}
                <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-white border-2 border-slate-800"></div>

                <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 font-mono">
                        {evt.date}
                      </span>
                      <span className="text-2xs font-semibold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-100 text-slate-700">
                        {evt.eventType}
                      </span>
                      {evt.isPastCorrection && (
                        <span className="text-3xs text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 font-mono">
                          Past Edit
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenEditEvent(evt)}
                      className="text-2xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1"
                    >
                      <Edit3 className="w-2.5 h-2.5" />
                      <span>Edit Past</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-700 mt-1 font-medium">
                    {evt.notes}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-2xs text-slate-500 pt-1.5 border-t border-slate-100">
                    {evt.userName && (
                      <span>Employee: <strong>{evt.userName}</strong></span>
                    )}
                    <span>Custodian: <strong>{evt.custodian}</strong></span>
                    {evt.conditionAtEvent && (
                      <span>Condition: {evt.conditionAtEvent}</span>
                    )}
                  </div>
                </div>

              </div>
            ))}

            {deviceEvents.length === 0 && (
              <div className="pl-6 text-xs text-slate-400 italic">
                No past history events recorded yet for this device.
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-2xs text-slate-500">
            SysAid ITAM Lifecycle Compliance Record
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded font-medium text-xs hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
