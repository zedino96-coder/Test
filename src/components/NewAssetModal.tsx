import React, { useState, useEffect } from 'react';
import { X, Plus, Laptop, ShieldCheck } from 'lucide-react';
import { Asset, User, AssetCategory, AssetCondition, LifecycleStage } from '../types/inventory';

interface NewAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  categories: string[];
  brands: Record<string, string[]>;
  onAddAsset: (newAsset: Omit<Asset, 'id' | 'updatedAt'>) => void;
}

export const NewAssetModal: React.FC<NewAssetModalProps> = ({
  isOpen,
  onClose,
  users,
  categories,
  brands,
  onAddAsset,
}) => {
  const [category, setCategory] = useState<string>(categories[0] || 'Laptop');
  const [brand, setBrand] = useState('Lenovo');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [assetTag, setAssetTag] = useState('');
  const [condition, setCondition] = useState<AssetCondition>('New');
  const [lifecycleStatus, setLifecycleStatus] = useState<LifecycleStage>('in_stock');
  const [status, setStatus] = useState<'in_stock' | 'assigned'>('in_stock');
  const [assignedUserId, setAssignedUserId] = useState<string>('');
  const [purchaseCost, setPurchaseCost] = useState<string>('');
  const [warrantyExpiry, setWarrantyExpiry] = useState<string>('');
  const [location, setLocation] = useState('Central IT Stockroom');
  const [notes, setNotes] = useState('');

  // Update default brand when category changes based on corporate standards
  useEffect(() => {
    const allowed = brands[category];
    if (allowed && allowed.length > 0) {
      setBrand(allowed[0]);
    } else {
      if (category === 'Laptop') setBrand('Lenovo');
      else if (category === 'Monitor') setBrand('Iiyama');
      else if (category === 'Keyboard / Mouse') setBrand('Logi');
      else if (category === 'Phone') setBrand('Iphone');
      else if (category.includes('Honeywell')) setBrand('Honeywell');
    }
    // Auto generate sample asset tag
    setAssetTag(`AST-${category.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`);
  }, [category, brands]);

  if (!isOpen) return null;

  const isChip = category === 'Chip';
  const allowedBrands = brands[category] || [];
  const isBrandRestricted = allowedBrands.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isChip) {
      if (!serialNumber.trim()) return; // Chip number is necessary

      const assignedUser = status === 'assigned' ? users.find((u) => u.id === assignedUserId) : null;
      onAddAsset({
        category: 'Chip',
        brand: brand.trim() || 'Chip',
        model: 'Security Chip / Smart Token',
        serialNumber: serialNumber.trim(), // Chip number
        assetTag: assetTag.trim() || `ID-${serialNumber.trim()}`, // ID number
        status,
        lifecycleStatus: status === 'assigned' ? 'deployed' : lifecycleStatus,
        assignedUserId: assignedUser ? assignedUser.id : null,
        assignedUserName: assignedUser ? assignedUser.name : null,
        assignedDate: assignedUser ? new Date().toISOString().split('T')[0] : null,
        location: assignedUser ? assignedUser.deskLocation : location.trim() || 'Central IT Stockroom',
        condition,
        notes: notes.trim(),
      });
      onClose();
      return;
    }

    if (!serialNumber.trim() || !model.trim() || !brand.trim()) return;

    const assignedUser = status === 'assigned' ? users.find((u) => u.id === assignedUserId) : null;

    onAddAsset({
      category,
      brand: brand.trim(),
      model: model.trim(),
      serialNumber: serialNumber.trim(),
      assetTag: assetTag.trim() || `AST-${Date.now().toString().slice(-5)}`,
      status,
      lifecycleStatus: status === 'assigned' ? 'deployed' : lifecycleStatus,
      assignedUserId: assignedUser ? assignedUser.id : null,
      assignedUserName: assignedUser ? assignedUser.name : null,
      assignedDate: assignedUser ? new Date().toISOString().split('T')[0] : null,
      purchaseCost: purchaseCost ? parseFloat(purchaseCost) : undefined,
      warrantyExpiry: warrantyExpiry || undefined,
      purchaseDate: new Date().toISOString().split('T')[0],
      location: assignedUser ? assignedUser.deskLocation : location.trim(),
      condition,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-sm text-slate-900 tracking-tight">
              Register New Hardware Device (SysAid ITAM)
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 max-h-[85vh] overflow-y-auto">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Hardware Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Brand / Manufacturer *
              </label>
              {isBrandRestricted ? (
                allowedBrands.length === 1 ? (
                  <div className="py-1.5 px-2.5 text-xs bg-slate-100 border border-slate-300 rounded-lg text-slate-900 font-semibold flex items-center justify-between">
                    <span>{allowedBrands[0]}</span>
                    <span className="text-3xs bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                      Corporate Standard
                    </span>
                  </div>
                ) : (
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                  >
                    {allowedBrands.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                )
              ) : (
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Enter brand name"
                  className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              )}
            </div>
          </div>

          {isChip ? (
            /* Chip Category: only Chip number (necessary) and ID number */
            <div className="space-y-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-lg text-2xs font-medium">
                Chip Configuration: Only <strong>Chip Number</strong> is necessary. <strong>ID Number</strong> is optional.
              </div>

              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Chip Number <span className="text-rose-600">* (Necessary)</span>
                </label>
                <input
                  type="text"
                  required
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="e.g. YUBI-5NFC-901 or CHIP-88402"
                  className="w-full py-2 px-3 text-xs bg-white border border-slate-300 rounded-lg font-mono uppercase text-slate-900 font-bold"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  ID Number (Optional)
                </label>
                <input
                  type="text"
                  value={assetTag}
                  onChange={(e) => setAssetTag(e.target.value)}
                  placeholder="e.g. ID-90124 or AST-CHP-8001"
                  className="w-full py-2 px-3 text-xs bg-white border border-slate-300 rounded-lg font-mono uppercase text-slate-900"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Model Name &amp; Spec *
                  </label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. ProLite XUB2792UHSU, ThinkPad T14s"
                    className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Asset Tag Barcode
                  </label>
                  <input
                    type="text"
                    value={assetTag}
                    onChange={(e) => setAssetTag(e.target.value)}
                    placeholder="AST-10293"
                    className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-300 rounded-lg font-mono uppercase text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Serial Number (sn) *
                </label>
                <input
                  type="text"
                  required
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="e.g. IIY-034K89, PW0QRQB8, F17K9921DN"
                  className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-300 rounded-lg font-mono uppercase text-slate-900 font-semibold"
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Physical Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as AssetCondition)}
                className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
              >
                <option value="New">New / Unopened</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'in_stock' | 'assigned')}
                className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
              >
                <option value="in_stock">In Stock / Available</option>
                <option value="assigned">Assign Immediately</option>
              </select>
            </div>
          </div>

          {status === 'assigned' ? (
            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Assign Directly To Employee *
              </label>
              <select
                required
                value={assignedUserId}
                onChange={(e) => setAssignedUserId(e.target.value)}
                className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
              >
                <option value="">Select Employee...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} · {u.department}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Storage Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Central IT Stockroom · Shelf M1"
                className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          )}

          {/* SysAid ITAM Fields */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-3xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Purchase Cost ($)
              </label>
              <input
                type="number"
                value={purchaseCost}
                onChange={(e) => setPurchaseCost(e.target.value)}
                placeholder="e.g. 850"
                className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-3xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Warranty Expiry Date
              </label>
              <input
                type="date"
                value={warrantyExpiry}
                onChange={(e) => setWarrantyExpiry(e.target.value)}
                className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Handover / Custodian Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. PO-2026-992, includes original cable..."
              className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
            />
          </div>

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
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-2xs"
            >
              Add Hardware Item
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
