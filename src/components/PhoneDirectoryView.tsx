import React, { useState } from 'react';
import { 
  Phone, 
  Search, 
  Copy, 
  Check, 
  ExternalLink, 
  Mail, 
  MapPin, 
  Briefcase, 
  Filter, 
  Download,
  PhoneCall,
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';
import { User } from '../types/inventory';

interface PhoneDirectoryViewProps {
  users: User[];
  onOpenUserModal: (user: User) => void;
}

export const PhoneDirectoryView: React.FC<PhoneDirectoryViewProps> = ({
  users,
  onOpenUserModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const departments = ['ALL', ...Array.from(new Set(users.map((u) => u.department)))];

  const handleCopyPhone = (phone: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 1800);
  };

  const filteredUsers = users.filter((u) => {
    const matchesDept = departmentFilter === 'ALL' || u.department === departmentFilter;
    if (!matchesDept) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();

    return (
      u.name.toLowerCase().includes(q) ||
      (u.phone ? u.phone.toLowerCase().includes(q) : false) ||
      u.department.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.deskLocation.toLowerCase().includes(q)
    );
  });

  const handleExportPhoneList = () => {
    const headers = ['Employee Name', 'Phone Number', 'Email', 'Department', 'Role', 'Desk Location'];
    const rows = filteredUsers.map((u) => [
      `"${u.name.replace(/"/g, '""')}"`,
      `"${(u.phone || '').replace(/"/g, '""')}"`,
      `"${u.email.replace(/"/g, '""')}"`,
      `"${u.department.replace(/"/g, '""')}"`,
      `"${u.role.replace(/"/g, '""')}"`,
      `"${u.deskLocation.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Corporate_Phone_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Dedicated to Phone Numbers Directory */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Corporate Phone Numbers Directory</span>
                <span className="text-2xs bg-blue-100 text-blue-800 font-mono font-semibold px-2 py-0.5 rounded">
                  {users.filter((u) => u.phone).length} Verified Lines
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official employee corporate phone number listings and direct dialing extensions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportPhoneList}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Phone List (CSV)</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          {/* Search Field */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, phone number, department, or desk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full sm:w-auto py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-900 font-medium"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'ALL' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Counter and quick reset */}
        <div className="flex items-center justify-between text-2xs text-slate-500 pt-1">
          <span>
            Showing <strong className="text-slate-800">{filteredUsers.length}</strong> of {users.length} contact records
          </span>
          {(searchQuery || departmentFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setDepartmentFilter('ALL');
              }}
              className="text-blue-600 hover:underline font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Phone Numbers List / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold">
                <th className="py-3 px-4 min-w-[220px]">Employee Name</th>
                <th className="py-3 px-4 min-w-[200px]">Phone Number</th>
                <th className="py-3 px-3 min-w-[160px]">Department</th>
                <th className="py-3 px-3 min-w-[160px]">Role / Title</th>
                <th className="py-3 px-3 min-w-[140px]">Desk Location</th>
                <th className="py-3 px-4 text-right min-w-[120px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const isCopied = copiedPhone === user.phone;

                return (
                  <tr 
                    key={user.id} 
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    
                    {/* Employee Name & Avatar */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-2xs"
                          style={{ backgroundColor: user.avatarColor }}
                        >
                          {user.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">
                            {user.name}
                          </span>
                          <span className="text-2xs text-slate-400 block truncate max-w-[180px]">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Dedicated Phone Number Column */}
                    <td className="py-3 px-4">
                      {user.phone ? (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 group-hover:border-blue-300 group-hover:bg-blue-50/40 transition-colors">
                            <Phone className="w-3 h-3 text-blue-600 shrink-0" />
                            <span className="select-all">{user.phone}</span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => handleCopyPhone(user.phone!, e)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
                            title="Copy phone number"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-2xs text-slate-400 italic">No number assigned</span>
                      )}
                    </td>

                    {/* Department */}
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-2xs font-medium bg-slate-100 text-slate-800">
                        {user.department}
                      </span>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-3 text-slate-600">
                      <span className="truncate block max-w-[180px]">{user.role}</span>
                    </td>

                    {/* Desk Location */}
                    <td className="py-3 px-3 text-slate-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{user.deskLocation}</span>
                      </div>
                    </td>

                    {/* Open User Details Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onOpenUserModal(user)}
                        className="inline-flex items-center gap-1 text-2xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                        title="Open employee details & equipment card"
                      >
                        <span>User Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>

                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No employee records match the search filter.
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
