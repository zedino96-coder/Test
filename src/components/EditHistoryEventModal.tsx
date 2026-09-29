import React, { useState, useEffect } from 'react';
import { X, Calendar, History, Save, AlertCircle } from 'lucide-react';
import { AssetHistoryEvent, User, Asset, AssetCondition } from '../types/inventory';

interface EditHistoryEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit: AssetHistoryEvent | null;
  users: User[];
  assets: Asset[];
  onSaveEvent: (event: AssetHistoryEvent, isNew: boolean) => void;
}

export const EditHistoryEventModal: React.FC<EditHistoryEventModalProps> = ({
  isOpen,
  onClose,
  eventToEdit,
  users,
  assets,
  onSaveEvent,
}) => {
  const isNew = !eventToEdit;

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [eventType, setEventType] = useState<AssetHistoryEvent['eventType']>('handover');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [custodian, setCustodian] = useState<string>('IT Operations Admin');
  const [condition, setCondition] = useState<AssetCondition>('Excellent');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (eventToEdit) {
      setDate(eventToEdit.date);
      setEventType(eventToEdit.eventType);
      setSelectedAssetId(eventToEdit.assetId);
      setSelectedUserId(eventToEdit.userId || '');
      setCustodian(eventToEdit.custodian || 'IT Operations Admin');
      setCondition(eventToEdit.conditionAtEvent || 'Excellent');
      setNotes(eventToEdit.notes || '');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setEventType('handover');
      setSelectedAssetId(assets[0]?.id || '');
      setSelectedUserId(users[0]?.id || '');
      setCustodian('IT Operations Admin');
      setCondition('Excellent');
      setNotes('Historical event recorded retroactively.');
    }
  }, [eventToEdit, isOpen, assets, users]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    const asset = assets.find((a) => a.id === selectedAssetId);
    const user = users.find((u) => u.id === selectedUserId);

    const saved: AssetHistoryEvent = {
      id: eventToEdit ? eventToEdit.id : `evt-hist-${Date.now()}`,
      assetId: asset ? asset.id : eventToEdit?.assetId || 'manual',
      serialNumber: asset ? asset.serialNumber : eventToEdit?.serialNumber || 'UNKNOWN-SN',
      assetModel: asset ? `${asset.brand} ${asset.model}` : eventToEdit?.assetModel || 'Hardware Unit',
      category: asset ? asset.category : eventToEdit?.category || 'Hardware',
      eventType,
      date, // Editable for the past!
      userId: user ? user.id : null,
      userName: user ? user.name : null,
      userEmail: user?.email,
      userPhone: user?.phone,
      custodian: custodian.trim() || 'IT Admin',
      notes: notes.trim(),
      conditionAtEvent: condition,
      deskLocation: user ? user.deskLocation : undefined,
      updatedAt: new Date().toISOString(),
      isPastCorrection: true,
    };

    onSaveEvent(saved, isNew);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-sm text-slate-900">
              {isNew ? 'Log Historical Past Event' : 'Edit Past Event & Handover Date'}
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

        {/* Notice for editing the past */}
        <div className="px-6 py-2.5 bg-amber-50/70 border-b border-amber-200/60 text-2xs text-amber-900 flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>
            You can set the event date to any past year, month, or day. The timeline will sort and audit accordingly.
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Event Date (Past or Present) *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full py-1.5 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Event Type *
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as any)}
                className="w-full py-1.5 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
              >
                <option value="handover">Handover / Allocation</option>
                <option value="return">Return to Stock</option>
                <option value="maintenance">Maintenance / Repair</option>
                <option value="registration">Asset Registration</option>
                <option value="past_adjustment">Past Record Correction</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Select Hardware Asset *
            </label>
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="w-full py-1.5 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  [{a.category}] {a.brand} {a.model} — SN: {a.serialNumber}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Target Employee
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full py-1.5 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
              >
                <option value="">— Central IT Stock (No User) —</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} · {u.department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Device Condition at Date
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="w-full py-1.5 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
              >
                <option value="New">New</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              IT Custodian / Officer
            </label>
            <input
              type="text"
              required
              value={custodian}
              onChange={(e) => setCustodian(e.target.value)}
              placeholder="e.g. Alex Admin (IT Ops Lead)"
              className="w-full py-1.5 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
            />
          </div>

          <div>
            <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Handover Notes / Audit Remarks
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter handover details, return rationale, signed form reference..."
              className="w-full py-1.5 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
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
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-2xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isNew ? 'Record Historical Event' : 'Save Past Changes'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
