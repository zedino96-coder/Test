import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Laptop, 
  AlertCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Asset, User, AssetCategory, ASSET_CATEGORIES } from '../types/inventory';
import { downloadUploadTemplateCSV, downloadCategoryUploadTemplateCSV, parseCSVText } from '../utils/export';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  existingAssets: Asset[];
  onImportAssets: (newAssets: Asset[]) => void;
  initialCategory?: AssetCategory;
}

interface ParsedItem {
  raw: Record<string, string>;
  category: AssetCategory;
  brand: string;
  model: string;
  serialNumber: string;
  status: 'assigned' | 'in_stock';
  assignedUserId: string | null;
  assignedUserName: string | null;
  assignedDate: string | null;
  location: string;
  condition: 'New' | 'Excellent' | 'Good';
  notes: string;
  isValid: boolean;
  validationError?: string;
  isDuplicateSn?: boolean;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  users,
  existingAssets,
  onImportAssets,
  initialCategory,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetUploadState = () => {
    setFile(null);
    setParsedItems([]);
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
          setParseError('No data rows found in CSV. Please verify file format.');
          return;
        }

        const existingSns = new Set(existingAssets.map((a) => a.serialNumber.toLowerCase().trim()));
        const seenSnsInFile = new Set<string>();

        const items: ParsedItem[] = rawRows.map((row) => {
          // Normalize column names
          const categoryRaw = row['category'] || row['equipment'] || row['hardwaretype'] || '';
          let brand = row['brand'] || row['manufacturer'] || '';
          const model = row['model'] || row['specification'] || row['item'] || '';
          const sn = (row['serialnumber'] || row['sn'] || row['serial'] || '').trim();
          const statusRaw = (row['status'] || '').toLowerCase();
          const assignedToRaw = row['assignedtouser'] || row['assignedto'] || row['user'] || row['assignedusername'] || '';
          const locationRaw = row['location'] || row['storage'] || '';
          const conditionRaw = (row['condition'] || 'Excellent').trim();
          const notesRaw = row['notes'] || row['note'] || '';

          // Normalize category, defaulting to initialCategory if specified
          let category: AssetCategory = initialCategory || 'Laptop';
          const catLower = categoryRaw.toLowerCase();
          if (catLower.includes('laptop') || catLower.includes('notebook') || catLower.includes('thinkpad')) {
            category = 'Laptop';
          } else if (catLower.includes('keyboard') || catLower.includes('mouse') || catLower.includes('combo')) {
            category = 'Keyboard / Mouse';
          } else if (catLower.includes('headset') || catLower.includes('headphones') || catLower.includes('audio') || catLower.includes('jabra')) {
            category = 'Headset';
          } else if (catLower.includes('monitor') || catLower.includes('display') || catLower.includes('screen')) {
            category = 'Monitor';
          } else if (catLower.includes('phone') || catLower.includes('iphone') || catLower.includes('mobile')) {
            category = 'Phone';
          } else if (catLower.includes('scanner') || catLower.includes('honeywell') || catLower.includes('eda')) {
            category = 'Honeywell Scanner';
          } else if (categoryRaw) {
            category = categoryRaw;
          }

          // Rule: Corporate Brand Standards
          if (category === 'Laptop') {
            brand = brand || 'Lenovo';
          } else if (category === 'Monitor') {
            brand = brand || 'Iiyama';
          } else if (category === 'Keyboard / Mouse') {
            brand = brand || 'Logi';
          } else if (category === 'Phone') {
            brand = brand || 'Iphone';
          } else if (category === 'Honeywell Scanner') {
            brand = brand || 'Honeywell';
          } else if (!brand) {
            brand = 'Enterprise';
          }

          // Match user
          let matchedUser: User | undefined;
          if (assignedToRaw) {
            matchedUser = users.find(
              (u) =>
                u.name.toLowerCase().includes(assignedToRaw.toLowerCase()) ||
                u.email.toLowerCase().includes(assignedToRaw.toLowerCase())
            );
          }

          const isAssigned = statusRaw === 'assigned' || Boolean(matchedUser);
          const isAlreadyExisting = existingSns.has(sn.toLowerCase());
          const isDuplicateInFile = seenSnsInFile.has(sn.toLowerCase());
          if (sn) seenSnsInFile.add(sn.toLowerCase());

          let isValid = sn.length > 0 && model.length > 0;
          let validationError: string | undefined;

          if (!sn) {
            isValid = false;
            validationError = 'Missing serial number (sn)';
          } else if (!model) {
            isValid = false;
            validationError = 'Missing hardware model';
          } else if (isAlreadyExisting) {
            isValid = false;
            validationError = `Serial number already exists in inventory (will not upload)`;
          } else if (isDuplicateInFile) {
            isValid = false;
            validationError = `Duplicate serial number in file (will not upload)`;
          }

          const assignedDateRaw = row['assigneddate'] || row['assigndate'] || row['date'] || '';

          return {
            raw: row,
            category,
            brand,
            model: model || 'Enterprise Hardware Unit',
            serialNumber: sn,
            status: isAssigned ? 'assigned' : 'in_stock',
            assignedUserId: isAssigned && matchedUser ? matchedUser.id : null,
            assignedUserName: isAssigned && matchedUser ? matchedUser.name : isAssigned && assignedToRaw ? assignedToRaw : null,
            assignedDate: isAssigned ? (assignedDateRaw || new Date().toISOString().split('T')[0]) : null,
            location: matchedUser ? matchedUser.deskLocation : locationRaw || 'Central IT Stockroom',
            condition: (['New', 'Excellent', 'Good'].includes(conditionRaw) ? conditionRaw : 'Good') as any,
            notes: notesRaw,
            isValid,
            validationError,
            isDuplicateSn: isAlreadyExisting || isDuplicateInFile,
          };
        });

        setParsedItems(items);
      } catch (err: any) {
        setParseError(`Error parsing CSV file: ${err.message || 'Malformed format'}`);
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

  const handleConfirmImport = () => {
    const validItems = parsedItems.filter((i) => i.isValid);
    if (validItems.length === 0) return;

    const newAssets: Asset[] = validItems.map((item, idx) => ({
      id: `ast-imp-${Date.now()}-${idx + 1}`,
      category: item.category,
      brand: item.brand,
      model: item.model,
      serialNumber: item.serialNumber,
      assetTag: `AST-${item.category.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: item.status,
      lifecycleStatus: item.status === 'assigned' ? 'deployed' : 'in_stock',
      assignedUserId: item.assignedUserId,
      assignedUserName: item.assignedUserName,
      assignedDate: item.status === 'assigned' ? (item.assignedDate || new Date().toISOString().split('T')[0]) : null,
      location: item.location,
      condition: item.condition,
      notes: item.notes,
      updatedAt: new Date().toISOString(),
    }));

    onImportAssets(newAssets);
    resetUploadState();
    onClose();
  };

  const validCount = parsedItems.filter((i) => i.isValid).length;
  const invalidCount = parsedItems.length - validCount;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-sm text-slate-900 tracking-tight">
              {initialCategory ? `Stock Upload · ${initialCategory}` : 'Master Inventory Hardware Import'}
            </h3>
            {initialCategory && (
              <span className="text-2xs bg-blue-100 text-blue-800 font-mono font-semibold px-2 py-0.5 rounded">
                Category: {initialCategory}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Top Banner with Download Template Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-blue-50/70 border border-blue-200">
            <div>
              <h4 className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                {initialCategory 
                  ? `Need the ${initialCategory} upload template?`
                  : 'Need the official hardware upload spreadsheet template?'}
              </h4>
              <p className="text-2xs text-blue-800 mt-0.5">
                {initialCategory
                  ? `Download formatted CSV with verified corporate standards for ${initialCategory} fleet.`
                  : 'Download the formatted CSV with verified columns (Category, Brand, Model, SerialNumber, Status, AssignedToUser).'}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {initialCategory && (
                <button
                  type="button"
                  onClick={() => downloadCategoryUploadTemplateCSV(initialCategory)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-50 transition-colors shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{initialCategory} Template</span>
                </button>
              )}
              <button
                type="button"
                onClick={downloadUploadTemplateCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>All-Fleet Template</span>
              </button>
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileProcess(e.target.files[0]);
                }
              }}
            />
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-600">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-800">
              Click to browse or drag and drop your completed CSV file
            </p>
            <p className="text-2xs text-slate-500 mt-1">
              Supports .CSV files exported from Excel, Sheets, or AssetTrack Pro template
            </p>
            {file && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded bg-white border border-slate-200 text-xs font-medium text-slate-700">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>{file.name}</span>
                <span className="text-2xs text-slate-400">({Math.round(file.size / 1024)} KB)</span>
              </div>
            )}
          </div>

          {/* Error Message */}
          {parseError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Preview Parsed Rows */}
          {parsedItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Preview Import Records ({parsedItems.length} items parsed)
                </h4>
                <div className="flex items-center gap-3 text-2xs">
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {validCount} ready to import
                  </span>
                  {invalidCount > 0 && (
                    <span className="text-amber-700 font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {invalidCount} incomplete (will be skipped)
                    </span>
                  )}
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg max-h-56 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold sticky top-0">
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3 font-mono">Serial No. (sn)</th>
                      <th className="py-2 px-3">Brand &amp; Model</th>
                      <th className="py-2 px-3">Status / Assigned</th>
                      <th className="py-2 px-3 text-right">Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedItems.map((item, idx) => (
                      <tr 
                        key={idx} 
                        className={`hover:bg-slate-50 transition-colors ${
                          !item.isValid ? 'bg-amber-50/30' : ''
                        }`}
                      >
                        <td className="py-2 px-3 font-medium text-slate-900">
                          {item.category}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-800 tabular-nums">
                          {item.serialNumber ? (
                            <span className="bg-slate-100 px-1 py-0.5 rounded text-2xs select-all">
                              {item.serialNumber}
                            </span>
                          ) : (
                            <span className="text-rose-500 italic text-2xs">Missing SN</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-700">
                          <span className="font-semibold text-slate-900">{item.brand}</span>{' '}
                          <span className="text-slate-500">{item.model}</span>
                        </td>
                        <td className="py-2 px-3">
                          {item.status === 'assigned' ? (
                            <span className="text-2xs text-blue-700 font-medium">
                              Assigned to {item.assignedUserName || 'Unknown'}
                            </span>
                          ) : (
                            <span className="text-2xs text-emerald-700 font-medium">
                              In Stock
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {item.isValid ? (
                            <span className="text-2xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-medium" title="New serial number: ready to import">
                              Ready to Import
                            </span>
                          ) : item.isDuplicateSn ? (
                            <span className="text-2xs text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 font-semibold" title={item.validationError}>
                              Already Exists (Skipped)
                            </span>
                          ) : (
                            <span className="text-2xs text-rose-600 font-medium" title={item.validationError}>
                              {item.validationError}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-2xs text-slate-500">
            {parsedItems.length > 0 ? (
              validCount === 0 ? (
                <span className="text-rose-600 font-medium">
                  All {parsedItems.length} items have existing serial numbers — nothing will be uploaded
                </span>
              ) : (
                <span>
                  <strong className="text-emerald-700">{validCount}</strong> new asset(s) ready to import ·{' '}
                  <span className="text-slate-500">{parsedItems.length - validCount} existing serial number(s) skipped</span>
                </span>
              )
            ) : (
              'Upload a CSV template to begin'
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={validCount === 0}
              onClick={handleConfirmImport}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors shadow-2xs"
            >
              <span>{validCount === 0 ? 'No New Assets to Import' : `Import ${validCount} New Hardware Assets`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
