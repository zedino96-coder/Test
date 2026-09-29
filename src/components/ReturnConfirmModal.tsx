import React, { useState } from 'react';
import { 
  AlertTriangle, 
  RotateCcw, 
  X, 
  User as UserIcon, 
  Tag, 
  Calendar, 
  CheckCircle2,
  FileText
} from 'lucide-react';
import { Asset, User } from '../types/inventory';

interface ReturnConfirmModalProps {
  isOpen: boolean;
  asset: Asset | null;
  user: User | null;
  onClose: () => void;
  onConfirmReturn: (assetId: string, returnDate: string, condition: string, notes: string) => void;
}

export const ReturnConfirmModal: React.FC<ReturnConfirmModalProps> = ({
  isOpen,
  asset,
  user,
  onClose,
  onConfirmReturn,
}) => {
  const [returnDate, setReturnDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [condition, setCondition] = useState<string>('Good');
  const [returnNotes, setReturnNotes] = useState('');

  if (!isOpen || !asset) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmReturn(
      asset.id,
      returnDate,
      condition,
      returnNotes.trim() || `Returned by ${user?.name || 'employee'} to Central IT Stockroom. Verified and processed.`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rose-100 bg-rose-50/70">
          <div className="flex items-center gap-2 text-rose-800">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
              <RotateCcw className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Confirm Equipment Return
              </h3>
              <p className="text-2xs text-rose-700 font-medium">
                Authorization required · User Directory Return Protocol
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Target Device Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">
                Hardware Custody Release
              </span>
              <span className="text-2xs font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                {asset.category}
              </span>
            </div>

            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-bold text-sm text-slate-900">
                  {asset.brand} {asset.model}
                </div>
                <div className="text-2xs text-slate-500 mt-0.5 font-mono">
                  Tag: <span className="font-bold text-slate-700">{asset.assetTag || 'AST-N/A'}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xs text-slate-400 block font-mono">Serial Number (sn):</span>
                <code className="text-xs font-mono font-bold bg-white border border-slate-300 text-slate-900 px-2 py-0.5 rounded select-all inline-block mt-0.5">
                  {asset.serialNumber}
                </code>
              </div>
            </div>

            {user && (
              <div className="pt-2 mt-1 border-t border-slate-200 flex items-center justify-between text-2xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Current Custodian:</span>
                  <span className="font-bold text-slate-900">{user.name}</span>
                </div>
                <span className="text-slate-400">{user.department}</span>
              </div>
            )}
          </div>

          {/* Form Fields: Return Date & Condition */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Return Date *
              </label>
              <input
                type="date"
                required
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full py-1.5 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Physical Condition Upon Return
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full py-1.5 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-1 focus:ring-slate-900 font-medium"
              >
                <option value="New">New / Like New</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good (Working)</option>
                <option value="Fair">Fair (Minor Scuffs)</option>
                <option value="Poor">Poor (Needs Inspection)</option>
              </select>
            </div>
          </div>

          {/* Notes / Custodian Handover Remarks */}
          <div>
            <label className="block text-2xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Return Inspection Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              placeholder="e.g. Device wiped, cables returned, in good working condition..."
              className="w-full py-1.5 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-1 focus:ring-slate-900 resize-none"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-2xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Confirming this return will de-allocate the device from <strong>{user?.name || 'the employee'}</strong>, move it into <strong>Central IT Stockroom</strong>, and append an indelible record to the user and device history audit logs.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Confirm Return to Stock</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
