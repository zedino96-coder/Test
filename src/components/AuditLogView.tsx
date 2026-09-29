import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  UserCheck, 
  RotateCcw, 
  Edit3, 
  Trash2, 
  PlusCircle, 
  CheckCircle2, 
  Laptop, 
  Monitor, 
  Smartphone, 
  Headphones, 
  Scan, 
  Mouse,
  AlertCircle
} from 'lucide-react';
import { AssetHistoryEvent, User, Asset, AssetCategory } from '../types/inventory';
import { exportHistoryLogsCSV } from '../utils/export';

interface AuditLogViewProps {
  history: AssetHistoryEvent[];
  users: User[];
  assets: Asset[];
  onOpenEditEvent: (event: AssetHistoryEvent) => void;
  onOpenAddPastEvent: () => void;
  onDeleteEvent: (eventId: string) => void;
  onOpenDeviceHistory?: (serialNumber: string) => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  history,
  users,
  assets,
  onOpenEditEvent,
  onOpenAddPastEvent,
  onDeleteEvent,
  onOpenDeviceHistory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('ALL');
  const [userFilter, setUserFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const categories = ['ALL', ...Array.from(new Set(history.map((h) => h.category)))];

  const filteredHistory = history.filter((event) => {
    if (eventTypeFilter !== 'ALL' && event.eventType !== eventTypeFilter) return false;
    if (userFilter !== 'ALL' && event.userId !== userFilter) return false;
    if (categoryFilter !== 'ALL' && event.category !== categoryFilter) return false;

    if (startDate && event.date < startDate) return false;
    if (endDate && event.date > endDate) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSn = event.serialNumber.toLowerCase().includes(q);
      const matchModel = event.assetModel.toLowerCase().includes(q);
      const matchUser = (event.userName || '').toLowerCase().includes(q);
      const matchNotes = event.notes.toLowerCase().includes(q);
      const matchCustodian = event.custodian.toLowerCase().includes(q);
      if (!matchSn && !matchModel && !matchUser && !matchNotes && !matchCustodian) {
        return false;
      }
    }

    return true;
  });

  const getEventBadge = (type: AssetHistoryEvent['eventType']) => {
    switch (type) {
      case 'handover':
        return (
          <span className="inline-flex items-center gap-1 text-2xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            <UserCheck className="w-3 h-3 text-blue-600" />
            Handover / Issue
          </span>
        );
      case 'return':
        return (
          <span className="inline-flex items-center gap-1 text-2xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <RotateCcw className="w-3 h-3 text-emerald-600" />
            Return to Stock
          </span>
        );
      case 'registration':
        return (
          <span className="inline-flex items-center gap-1 text-2xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            <PlusCircle className="w-3 h-3 text-purple-600" />
            Asset Registered
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1 text-2xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            Maintenance
          </span>
        );
      case 'past_adjustment':
        return (
          <span className="inline-flex items-center gap-1 text-2xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
            Past Adjustment
          </span>
        );
      default:
        return (
          <span className="text-2xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            {type}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Audit &amp; Handover Lifecycle History
            </h2>
            <span className="text-2xs bg-blue-100 text-blue-800 font-mono font-semibold px-2 py-0.5 rounded">
              {history.length} Logged Events
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete institutional audit trail of all equipment allocations, returns, and historical custodian notes. All past records can be edited retroactively.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenAddPastEvent}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-2xs"
            title="Add an assignment, return, or maintenance event that took place in the past"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Log Past Event</span>
          </button>
          <button
            type="button"
            onClick={() => exportHistoryLogsCSV(filteredHistory)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Log CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search serial number, employee, model, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Date Range:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="py-1 px-2 text-xs bg-slate-50 border border-slate-300 rounded text-slate-800 font-mono"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="py-1 px-2 text-xs bg-slate-50 border border-slate-300 rounded text-slate-800 font-mono"
            />
          </div>
        </div>

        {/* Facet Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          
          {/* Event Type */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">Event:</span>
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="py-1 px-2 text-xs bg-slate-50 border border-slate-300 rounded text-slate-800"
            >
              <option value="ALL">All Event Types</option>
              <option value="handover">Handover / Allocation</option>
              <option value="return">Return to Stock</option>
              <option value="registration">Asset Registration</option>
              <option value="maintenance">Maintenance</option>
              <option value="past_adjustment">Past Adjustment</option>
            </select>
          </div>

          {/* User Filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">Employee:</span>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="py-1 px-2 text-xs bg-slate-50 border border-slate-300 rounded text-slate-800"
            >
              <option value="ALL">All Employees</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-1 px-2 text-xs bg-slate-50 border border-slate-300 rounded text-slate-800"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>

          {(eventTypeFilter !== 'ALL' || userFilter !== 'ALL' || categoryFilter !== 'ALL' || startDate || endDate || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setEventTypeFilter('ALL');
                setUserFilter('ALL');
                setCategoryFilter('ALL');
                setStartDate('');
                setEndDate('');
                setSearchQuery('');
              }}
              className="text-2xs text-slate-500 hover:text-slate-800 underline ml-auto"
            >
              Clear filters
            </button>
          )}

          <div className="text-2xs text-slate-400 ml-auto font-mono tabular-nums">
            {filteredHistory.length} events displayed
          </div>

        </div>
      </div>

      {/* Main Events Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold">
                <th className="py-3 px-4 min-w-[110px]">Date (Past/Present)</th>
                <th className="py-3 px-3 min-w-[130px]">Event Type</th>
                <th className="py-3 px-3 min-w-[180px]">Hardware Asset (sn)</th>
                <th className="py-3 px-3 min-w-[160px]">Employee / Custodian</th>
                <th className="py-3 px-3">Notes &amp; Reason</th>
                <th className="py-3 px-4 text-right min-w-[110px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.map((evt) => {
                const user = users.find((u) => u.id === evt.userId);

                return (
                  <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors group">
                    
                    {/* Date */}
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{evt.date}</span>
                      </div>
                      {evt.isPastCorrection && (
                        <span className="text-3xs text-amber-600 bg-amber-50 px-1 py-0.2 rounded border border-amber-200 block mt-0.5 w-fit">
                          Past Edit
                        </span>
                      )}
                    </td>

                    {/* Event Type */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getEventBadge(evt.eventType)}
                    </td>

                    {/* Asset info */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{evt.assetModel}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <code className="text-2xs font-mono bg-slate-100 px-1 py-0.2 rounded text-slate-800 tabular-nums font-medium">
                          {evt.serialNumber}
                        </code>
                        <span className="text-3xs text-slate-400">({evt.category})</span>
                      </div>
                    </td>

                    {/* Employee / Custodian */}
                    <td className="py-3 px-3">
                      {evt.userName ? (
                        <div>
                          <span className="font-semibold text-slate-900">{evt.userName}</span>
                          <span className="text-3xs text-slate-400 block">
                            Cust: {evt.custodian}
                          </span>
                        </div>
                      ) : (
                        <div className="text-slate-500">
                          <span>Central IT Stock</span>
                          <span className="text-3xs text-slate-400 block">
                            Cust: {evt.custodian}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Notes */}
                    <td className="py-3 px-3 text-slate-600 text-2xs max-w-sm">
                      <p className="line-clamp-2">{evt.notes}</p>
                      {evt.conditionAtEvent && (
                        <span className="text-3xs text-slate-400">
                          Condition: {evt.conditionAtEvent}
                        </span>
                      )}
                    </td>

                    {/* Action: Edit past event */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenEditEvent(evt)}
                          className="px-2 py-1 text-2xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors"
                          title="Edit past event date, notes, or details"
                        >
                          <Edit3 className="w-3 h-3 inline mr-1 text-slate-500" />
                          Edit Past
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Delete this historical log event?')) {
                              onDeleteEvent(evt.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Delete historical log entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}

              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No audit records matched your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
