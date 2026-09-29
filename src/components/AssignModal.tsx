import React, { useState, useEffect } from 'react';
import { X, Check, Laptop, AlertCircle } from 'lucide-react';
import { Asset, User, AssetCategory, ASSET_CATEGORIES } from '../types/inventory';

interface AssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  users: User[];
  defaultCategory?: string;
  defaultUserId?: string;
  defaultAssetId?: string;
  onAssign: (assetId: string, userId: string, date: string, notes?: string) => void;
}

export const AssignModal: React.FC<AssignModalProps> = ({
  isOpen,
  onClose,
  assets,
  users,
  defaultCategory,
  defaultUserId,
  defaultAssetId,
  onAssign,
}) => {
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [assignmentDate, setAssignmentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  useEffect(() => {
    if (defaultAssetId) {
      setSelectedAssetId(defaultAssetId);
      const asset = assets.find((a) => a.id === defaultAssetId);
      if (asset) setCategoryFilter(asset.category);
    } else if (defaultCategory) {
      setCategoryFilter(defaultCategory);
      // Auto pick first available in stock of that category
      const available = assets.filter(
        (a) => a.category === defaultCategory && a.status === 'in_stock'
      );
      if (available.length > 0) {
        setSelectedAssetId(available[0].id);
      } else {
        setSelectedAssetId('');
      }
    } else {
      setCategoryFilter('ALL');
      const firstInStock = assets.find((a) => a.status === 'in_stock');
      if (firstInStock) setSelectedAssetId(firstInStock.id);
    }

    if (defaultUserId) {
      setSelectedUserId(defaultUserId);
    } else if (users.length > 0) {
      setSelectedUserId(users[0].id);
    }
  }, [defaultAssetId, defaultCategory, defaultUserId, assets, users, isOpen]);

  if (!isOpen) return null;

  const inStockAssets = assets.filter((a) => {
    if (a.status !== 'in_stock' && a.id !== selectedAssetId) return false;
    if (categoryFilter !== 'ALL' && a.category !== categoryFilter) return false;
    return true;
  });

  const selectedAsset = assets.find((a) => a.id === selectedAssetId);
  const selectedUser = users.find((u) => u.id === selectedUserId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !selectedUserId) return;
    onAssign(selectedAssetId, selectedUserId, assignmentDate, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden text-slate-900">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Laptop className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-sm text-slate-900 tracking-tight">
              Assign Hardware to Employee
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Category Filter */}
          <div>
            <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Filter Available Stock By Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                const first = assets.find(
                  (a) => a.status === 'in_stock' && (e.target.value === 'ALL' || a.category === e.target.value)
                );
                if (first) setSelectedAssetId(first.id);
                else setSelectedAssetId('');
              }}
              className="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
            >
              <option value="ALL">All Categories</option>
              {ASSET_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Select Hardware Item in Stock */}
          <div>
            <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Select In-Stock Device (Serial Number &amp; Model) *
            </label>
            {inStockAssets.length > 0 ? (
              <select
                required
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full py-2 px-3 text-xs bg-white border border-slate-300 rounded-lg font-mono text-slate-900 focus:ring-1 focus:ring-slate-900"
              >
                {inStockAssets.map((a) => (
                  <option key={a.id} value={a.id}>
                    [{a.category}] {a.brand} {a.model} — SN: {a.serialNumber}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>No available in-stock devices matching this category.</span>
              </div>
            )}
            {selectedAsset && (
              <p className="text-2xs text-slate-500 mt-1">
                Current Storage: {selectedAsset.location} · Condition: {selectedAsset.condition}
              </p>
            )}
          </div>

          {/* Target User */}
          <div>
            <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Assign To Employee *
            </label>
            <select
              required
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-1 focus:ring-slate-900 font-medium"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.role} ({u.department})
                </option>
              ))}
            </select>
            {selectedUser && (
              <p className="text-2xs text-slate-500 mt-1">
                Deployment Location: {selectedUser.deskLocation}
              </p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Issue / Handover Date
            </label>
            <input
              type="date"
              required
              value={assignmentDate}
              onChange={(e) => setAssignmentDate(e.target.value)}
              className="w-full py-1.5 px-3 text-xs bg-white border border-slate-300 rounded-lg font-mono text-slate-800"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Handover Notes / Accessories (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Issued with USB-C charger, carry bag, security cable..."
              className="w-full py-1.5 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedAssetId || !selectedUserId}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors shadow-2xs"
            >
              Confirm Assignment
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
