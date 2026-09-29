import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  Eye, 
  History, 
  Laptop, 
  Check, 
  X,
  FileSpreadsheet,
  Building2,
  Calendar,
  Download,
  Upload
} from 'lucide-react';
import { User, Asset, AssetHistoryEvent } from '../types/inventory';
import { exportUserDirectoryCSV } from '../utils/export';

interface UserManagementViewProps {
  users: User[];
  assets: Asset[];
  history: AssetHistoryEvent[];
  onOpenUserModal: (user: User) => void;
  onCreateUser: (newUser: Omit<User, 'id' | 'avatarColor'>) => void;
  onUpdateUser: (updatedUser: User) => void;
  onDeleteUser: (userId: string) => void;
  onOpenUserUploadModal: () => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  assets,
  history,
  onOpenUserModal,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  onOpenUserUploadModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form states for Create/Edit
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [role, setRole] = useState('');
  const [deskLocation, setDeskLocation] = useState('');
  const [notes, setNotes] = useState('');

  const departments = ['ALL', ...Array.from(new Set(users.map((u) => u.department)))];

  const filteredUsers = users.filter((u) => {
    if (deptFilter !== 'ALL' && u.department !== deptFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone ? u.phone.toLowerCase().includes(q) : false) ||
      u.role.toLowerCase().includes(q) ||
      u.deskLocation.toLowerCase().includes(q)
    );
  });

  const openCreateModal = () => {
    setName('');
    setEmail('');
    setPhone('');
    setDepartment('Engineering');
    setRole('');
    setDeskLocation('Building A · Floor 3 · Desk ');
    setNotes('');
    setIsCreateModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPhone(u.phone || '');
    setDepartment(u.department);
    setRole(u.role);
    setDeskLocation(u.deskLocation);
    setNotes(u.notes || '');
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (editingUser) {
      onUpdateUser({
        ...editingUser,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() ? phone.trim() : undefined,
        department: department.trim(),
        role: role.trim(),
        deskLocation: deskLocation.trim(),
        notes: notes.trim(),
      });
      setEditingUser(null);
    } else {
      onCreateUser({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() ? phone.trim() : undefined,
        department: department.trim(),
        role: role.trim() || 'Team Member',
        deskLocation: deskLocation.trim() || 'Remote / Flexible Desk',
        notes: notes.trim(),
        joinedDate: new Date().toISOString().split('T')[0],
      });
      setIsCreateModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Action */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              User Directory &amp; Custodian Management
            </h2>
            <span className="text-2xs bg-blue-100 text-blue-800 font-mono font-semibold px-2 py-0.5 rounded">
              {users.length} Employees Registered
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage employee accounts, assign hardware custody, and audit individual handover slips.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => exportUserDirectoryCSV(filteredUsers, assets)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
            title={`Export CSV: exports only the ${filteredUsers.length} currently listed employees. Can be used directly for mass upload.`}
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
            <span className="text-2xs font-mono text-slate-400">({filteredUsers.length})</span>
          </button>
          
          <button
            type="button"
            onClick={onOpenUserUploadModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
            title="Upload CSV to bulk import employees into User Directory"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Upload CSV</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Employee</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, role, or desk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Department:</span>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d === 'ALL' ? 'All Departments' : d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold">
                <th className="py-3 px-4 min-w-[200px]">Employee Name</th>
                <th className="py-3 px-3 min-w-[190px]">Corporate Email</th>
                <th className="py-3 px-3 min-w-[150px]">Department &amp; Role</th>
                <th className="py-3 px-3 min-w-[150px]">Desk Location</th>
                <th className="py-3 px-3 min-w-[120px] text-center">Active Assets</th>
                <th className="py-3 px-4 text-right min-w-[140px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const userAssets = assets.filter((a) => a.assignedUserId === user.id);
                const userHistoryCount = history.filter((h) => h.userId === user.id).length;
                const isJohn = user.name.toLowerCase().includes('john');

                return (
                  <tr 
                    key={user.id} 
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isJohn ? 'bg-blue-50/20' : ''
                    }`}
                  >
                    {/* User */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => onOpenUserModal(user)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer"
                          style={{ backgroundColor: user.avatarColor }}
                          title={`View ${user.name} profile and assigned equipment`}
                        >
                          {user.name.split(' ').map((n) => n[0]).join('')}
                        </button>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onOpenUserModal(user)}
                              className="font-bold text-slate-900 hover:text-blue-600 hover:underline cursor-pointer text-left transition-colors"
                              title={`View ${user.name} profile and assigned equipment`}
                            >
                              {user.name}
                            </button>
                            {isJohn && (
                              <span className="text-3xs font-mono bg-blue-100 text-blue-700 px-1 py-0.2 rounded">
                                Sample Lead
                              </span>
                            )}
                          </div>
                          <div className="text-2xs text-slate-400">
                            Member since: {user.joinedDate || '2023'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Corporate Email (No Phone in directory table) */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[190px] select-all font-mono text-2xs">{user.email}</span>
                      </div>
                    </td>

                    {/* Department & Role */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{user.department}</div>
                      <div className="text-2xs text-slate-500 truncate max-w-[150px]">{user.role}</div>
                    </td>

                    {/* Desk Location */}
                    <td className="py-3 px-3 text-slate-600 text-2xs">
                      <div className="flex items-center gap-1 truncate max-w-[170px]">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{user.deskLocation}</span>
                      </div>
                    </td>

                    {/* Active Hardware Count */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => onOpenUserModal(user)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                      >
                        <Laptop className="w-3 h-3" />
                        <span>{userAssets.length} Devices</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenUserModal(user)}
                          className="px-2 py-1 text-2xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded transition-colors whitespace-nowrap"
                          title="Open Equipment Handover Slip & History"
                        >
                          <Eye className="w-3 h-3 inline mr-1" />
                          Slip
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(user)}
                          className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                          title="Edit employee contact details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {userAssets.length === 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove ${user.name} from directory?`)) {
                                onDeleteUser(user.id);
                              }
                            }}
                            className="p-1 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                            title="Delete unassigned user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit User Modal */}
      {(isCreateModalOpen || editingUser) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden text-slate-900">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-700" />
                <h3 className="font-bold text-sm text-slate-900">
                  {editingUser ? `Edit Employee Details: ${editingUser.name}` : 'Register New Employee'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingUser(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-3.5">
              
              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Miller"
                  className="w-full py-1.5 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john.miller@company.io"
                    className="w-full py-1.5 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Phone Info (Optional)
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 312-9901 (optional)"
                    className="w-full py-1.5 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Engineering"
                    className="w-full py-1.5 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Job Title / Role
                  </label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Staff Systems Engineer"
                    className="w-full py-1.5 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Desk Location / Office
                </label>
                <input
                  type="text"
                  required
                  value={deskLocation}
                  onChange={(e) => setDeskLocation(e.target.value)}
                  placeholder="Building A · Floor 3 · Desk 312"
                  className="w-full py-1.5 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Custodian notes, hardware allocation tier..."
                  className="w-full py-1.5 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-2xs"
                >
                  {editingUser ? 'Save Changes' : 'Create Employee'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
