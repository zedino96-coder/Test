import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  AlertCircle,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { User } from '../types/inventory';
import { downloadUserUploadTemplateCSV, parseCSVText } from '../utils/export';

interface UserUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingUsers: User[];
  onImportUsers: (newUsers: User[]) => void;
}

interface ParsedUserRow {
  name: string;
  email: string;
  department: string;
  role: string;
  deskLocation: string;
  joinedDate: string;
  notes: string;
  isValid: boolean;
  validationError?: string;
  isUpdate?: boolean;
}

export const UserUploadModal: React.FC<UserUploadModalProps> = ({
  isOpen,
  onClose,
  existingUsers,
  onImportUsers,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedUserRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetUploadState = () => {
    setFile(null);
    setParsedRows([]);
    setParseError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      resetUploadState();
    }
  }, [isOpen]);

  const handleClose = () => {
    resetUploadState();
    onClose();
  };

  if (!isOpen) return null;

  const handleFileProcess = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.txt')) {
      setParseError('Please upload a valid .CSV file');
      return;
    }

    setFile(selectedFile);
    setParseError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        setParseError('File is empty');
        return;
      }

      try {
        const rawRows = parseCSVText(text);
        if (rawRows.length === 0) {
          setParseError('No employee data rows found in CSV. Please verify file format.');
          return;
        }

        const existingEmails = new Set(existingUsers.map((u) => u.email.toLowerCase().trim()));
        const seenEmailsInFile = new Set<string>();

        const items: ParsedUserRow[] = rawRows.map((row) => {
          // Normalize column lookups
          const name = (row['fullname'] || row['name'] || row['employeename'] || row['user'] || '').trim();
          const email = (row['corporateemail'] || row['email'] || row['workemail'] || '').trim();
          const department = (row['department'] || row['dept'] || 'Engineering').trim();
          const role = (row['role'] || row['jobrole'] || row['title'] || 'Specialist').trim();
          const deskLocation = (row['desklocation'] || row['desk'] || row['location'] || 'Building A · Floor 1').trim();
          const joinedDate = (row['joineddate'] || row['startdate'] || row['joined'] || new Date().toISOString().split('T')[0]).trim();
          const notes = (row['notes'] || row['note'] || row['comments'] || '').trim();

          let isValid = true;
          let validationError: string | undefined;
          let isUpdate = false;

          if (!name) {
            isValid = false;
            validationError = 'Employee name is required';
          } else if (!email) {
            isValid = false;
            validationError = 'Corporate email is required';
          } else if (!email.includes('@') || !email.includes('.')) {
            isValid = false;
            validationError = 'Invalid email syntax';
          } else {
            isUpdate = existingEmails.has(email.toLowerCase());
            seenEmailsInFile.add(email.toLowerCase());
          }

          return {
            name,
            email,
            department,
            role,
            deskLocation,
            joinedDate,
            notes,
            isValid,
            validationError,
            isUpdate,
          };
        });

        setParsedRows(items);
      } catch (err: any) {
        setParseError(`Failed to parse CSV: ${err.message}`);
      }
    };

    reader.readAsText(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleConfirmImport = () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) return;

    const colors = ['#2563eb', '#059669', '#7c3aed', '#db2777', '#d97706', '#0891b2', '#e11d48', '#4f46e5'];

    const importedUsers: User[] = validRows.map((row, index) => {
      const existing = existingUsers.find((u) => u.email.toLowerCase() === row.email.toLowerCase());
      if (existing) {
        return {
          ...existing,
          name: row.name,
          department: row.department,
          role: row.role,
          deskLocation: row.deskLocation,
          joinedDate: row.joinedDate || existing.joinedDate,
          notes: row.notes || existing.notes,
        };
      }
      return {
        id: `usr-batch-${Date.now()}-${index}`,
        name: row.name,
        email: row.email,
        phone: '', // Maintained empty or omitted as per privacy guidelines
        department: row.department,
        role: row.role,
        deskLocation: row.deskLocation,
        avatarColor: colors[Math.floor(Math.random() * colors.length)],
        joinedDate: row.joinedDate,
        notes: row.notes || 'Batch imported via User Directory CSV upload',
      };
    });

    onImportUsers(importedUsers);
    resetUploadState();
    onClose();
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.filter((r) => !r.isValid).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Upload Employee Directory (CSV)
              </h2>
              <p className="text-xs text-slate-500">
                Bulk import employees, departments, job roles, and desk locations into User Directory
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Top Actions: Template Download */}
          <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate-900 text-xs">Need the Employee CSV Template?</h4>
                <p className="text-2xs text-slate-600 mt-0.5">
                  Download our formatted CSV template with required column headers (FullName, CorporateEmail, Department, Role, DeskLocation).
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={downloadUserUploadTemplateCSV}
              className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-blue-50 border border-blue-300 text-blue-700 font-semibold rounded-lg text-xs transition-colors shrink-0 shadow-2xs"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Download Template</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          {!file ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/50'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
              />
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">
                Drop your Employee CSV file here, or browse
              </h3>
              <p className="text-slate-500 text-xs mb-3">
                Supports .CSV files with comma-separated employee rosters
              </p>
              <span className="inline-block px-3 py-1 bg-white border border-slate-200 text-slate-700 rounded-md font-medium text-xs shadow-2xs">
                Select CSV from Computer
              </span>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-mono font-bold text-xs">
                  CSV
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-xs">{file.name}</p>
                  <p className="text-2xs text-slate-500">
                    {(file.size / 1024).toFixed(1)} KB · {parsedRows.length} rows detected
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setParsedRows([]);
                  setParseError(null);
                }}
                className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
              >
                Upload Different File
              </button>
            </div>
          )}

          {/* Parse Error Notification */}
          {parseError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Parsed Rows Preview */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Data Validation Preview
                  </h4>
                  <span className="text-2xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-semibold">
                    {validCount} Ready to Import
                  </span>
                  {invalidCount > 0 && (
                    <span className="text-2xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono font-semibold">
                      {invalidCount} Needs Attention
                    </span>
                  )}
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold sticky top-0 z-10">
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">Name</th>
                      <th className="py-2 px-3">Corporate Email</th>
                      <th className="py-2 px-3">Department</th>
                      <th className="py-2 px-3">Role</th>
                      <th className="py-2 px-3">Desk Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-2xs">
                    {parsedRows.map((row, idx) => (
                      <tr 
                        key={idx} 
                        className={row.isValid ? 'hover:bg-slate-50' : 'bg-red-50/40 hover:bg-red-50/70'}
                      >
                        <td className="py-2 px-3">
                          {row.isValid ? (
                            row.isUpdate ? (
                              <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 font-medium font-sans">
                                Update Profile
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-medium font-sans">
                                <CheckCircle2 className="w-3 h-3 shrink-0" />
                                New Employee
                              </span>
                            )
                          ) : (
                            <span 
                              className="inline-flex items-center gap-1 text-red-600 font-medium font-sans"
                              title={row.validationError}
                            >
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              {row.validationError || 'Invalid'}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-900 font-sans">{row.name || '—'}</td>
                        <td className="py-2 px-3 text-slate-700">{row.email || '—'}</td>
                        <td className="py-2 px-3 text-slate-600 font-sans">{row.department}</td>
                        <td className="py-2 px-3 text-slate-600 font-sans">{row.role}</td>
                        <td className="py-2 px-3 text-slate-500 font-sans">{row.deskLocation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="text-2xs text-slate-500">
            {validCount > 0 ? (
              <span>Ready to add <strong className="text-slate-900">{validCount}</strong> employees to User Directory</span>
            ) : (
              <span>Upload a CSV file to validate and import employees</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={validCount === 0}
              onClick={handleConfirmImport}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs"
            >
              <UserCheck className="w-4 h-4" />
              <span>Import {validCount} Employees</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
