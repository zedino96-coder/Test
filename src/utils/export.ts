import { Asset, User, CategoryStockSummary, AssetHistoryEvent } from '../types/inventory';

function escapeCSV(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

function triggerDownload(content: string, filename: string, mimeType: string = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export Equipment inventory (exports only what is currently listed/filtered)
 * Schema matches the mass upload template exactly so the exported CSV can be re-uploaded.
 */
export function exportEquipmentCSV(assets: Asset[], categoryFilter?: string): void {
  const headers = [
    'Category',
    'Brand',
    'Model',
    'SerialNumber',
    'Status',
    'AssignedToUser',
    'AssignedDate',
    'Location',
    'Condition',
    'Notes',
  ];

  const rows = assets.map((a) => [
    escapeCSV(a.category),
    escapeCSV(a.brand),
    escapeCSV(a.model),
    escapeCSV(a.serialNumber),
    escapeCSV(a.status),
    escapeCSV(a.assignedUserName || ''),
    escapeCSV(a.assignedDate || ''),
    escapeCSV(a.location || ''),
    escapeCSV(a.condition || 'Excellent'),
    escapeCSV(a.notes || ''),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  const catSlug = categoryFilter && categoryFilter !== 'ALL' 
    ? categoryFilter.toLowerCase().replace(/[^a-z0-9]/g, '_') 
    : 'all';
  triggerDownload(csvContent, `equipment_${catSlug}_export_${dateStr}.csv`);
}

/**
 * Master inventory export of all assets (SysAid ITAM style, 100% upload compatible)
 */
export function exportAllAssetsCSV(assets: Asset[]): void {
  exportEquipmentCSV(assets, 'master');
}

/**
 * Audit & Handover Logs Export
 */
export function exportHistoryLogsCSV(logs: AssetHistoryEvent[]): void {
  const headers = [
    'Event ID',
    'Date (Past/Present)',
    'Event Type',
    'Hardware Category',
    'Brand & Model',
    'Serial Number (sn)',
    'Target Employee',
    'Employee Email',
    'Employee Phone',
    'Desk Location',
    'Custodian Officer',
    'Condition',
    'Handover Notes / Reason',
    'Was Past Correction',
  ];

  const rows = logs.map((l) => [
    escapeCSV(l.id),
    escapeCSV(l.date),
    escapeCSV(l.eventType),
    escapeCSV(l.category),
    escapeCSV(l.assetModel),
    escapeCSV(l.serialNumber),
    escapeCSV(l.userName || '—'),
    escapeCSV(l.userEmail || '—'),
    escapeCSV(l.userPhone || '—'),
    escapeCSV(l.deskLocation || '—'),
    escapeCSV(l.custodian),
    escapeCSV(l.conditionAtEvent || '—'),
    escapeCSV(l.notes),
    escapeCSV(l.isPastCorrection ? 'Yes' : 'No'),
  ]);

  const csvContent = [
    '# ASSETTRACK PRO - AUDIT & HANDOVER LOGS EXPORT',
    headers.join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\r\n');

  const dateStr = new Date().toISOString().split('T')[0];
  triggerDownload(csvContent, `it_handover_audit_logs_${dateStr}.csv`);
}

/**
 * User Assignment Matrix
 */
export function exportUserMatrixCSV(users: User[], assets: Asset[]): void {
  const headers = [
    'User Name',
    'Email',
    'Phone',
    'Department',
    'Role',
    'Desk Location',
    'Laptop SN (Lenovo)',
    'Laptop Model',
    'Keyboard & Mouse SN (Logi)',
    'Keyboard & Mouse Model',
    'Headset SN',
    'Headset Model',
    'Phone SN (Iphone)',
    'Phone Model',
    'Honeywell Scanner SN',
    'Monitors Count',
    'Monitor 1 SN (Iiyama)',
    'Monitor 1 Model',
    'Monitor 2 SN (Iiyama)',
    'Monitor 2 Model',
  ];

  const rows = users.map((u) => {
    const userAssets = assets.filter((a) => a.assignedUserId === u.id);
    const laptop = userAssets.find((a) => a.category === 'Laptop');
    const km = userAssets.find((a) => a.category === 'Keyboard / Mouse');
    const headset = userAssets.find((a) => a.category === 'Headset');
    const phone = userAssets.find((a) => a.category === 'Phone');
    const scanner = userAssets.find((a) => a.category.includes('Honeywell') || a.brand === 'Honeywell');
    const monitors = userAssets.filter((a) => a.category === 'Monitor');
    const mon1 = monitors[0];
    const mon2 = monitors[1];

    return [
      escapeCSV(u.name),
      escapeCSV(u.email),
      escapeCSV(u.phone),
      escapeCSV(u.department),
      escapeCSV(u.role),
      escapeCSV(u.deskLocation),
      escapeCSV(laptop?.serialNumber || '—'),
      escapeCSV(laptop ? `${laptop.brand} ${laptop.model}` : '—'),
      escapeCSV(km?.serialNumber || '—'),
      escapeCSV(km ? `${km.brand} ${km.model}` : '—'),
      escapeCSV(headset?.serialNumber || '—'),
      escapeCSV(headset ? `${headset.brand} ${headset.model}` : '—'),
      escapeCSV(phone?.serialNumber || '—'),
      escapeCSV(phone ? `${phone.brand} ${phone.model}` : '—'),
      escapeCSV(scanner?.serialNumber || '—'),
      escapeCSV(monitors.length),
      escapeCSV(mon1?.serialNumber || '—'),
      escapeCSV(mon1 ? `${mon1.brand} ${mon1.model}` : '—'),
      escapeCSV(mon2?.serialNumber || '—'),
      escapeCSV(mon2 ? `${mon2.brand} ${mon2.model}` : '—'),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  triggerDownload(csvContent, `user_hardware_assignment_matrix_${dateStr}.csv`);
}

/**
 * Stock summary by category export
 */
export function exportStockSummaryCSV(summaries: CategoryStockSummary[]): void {
  const headers = [
    'Hardware Category',
    'Total Inventory Qty',
    'Assigned Qty',
    'In Stock / Unassigned Qty',
    'Utilization Rate',
    'Current Assignees & Serial Numbers',
  ];

  const rows = summaries.map((s) => {
    const utilization = s.total > 0 ? `${Math.round((s.assigned / s.total) * 100)}%` : '0%';
    const assigneesFormatted = s.assignedUsers
      .map((u) => `${u.userName} (${u.serialNumber})`)
      .join('; ');

    return [
      escapeCSV(s.category),
      escapeCSV(s.total),
      escapeCSV(s.assigned),
      escapeCSV(s.inStock),
      escapeCSV(utilization),
      escapeCSV(assigneesFormatted),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  triggerDownload(csvContent, `stock_summary_by_category_${dateStr}.csv`);
}

/**
 * Single user equipment handover slip (e.g. John's equipment and serial numbers)
 */
export function exportUserEquipmentSlipCSV(userName: string, userAssets: Asset[], userPhone?: string): void {
  const headers = ['Equipment', 'sn', 'Brand', 'Model', 'Status', 'Asset Tag', 'Date Assigned'];
  const rows = userAssets.map((a) => [
    escapeCSV(a.category),
    escapeCSV(a.serialNumber),
    escapeCSV(a.brand),
    escapeCSV(a.model),
    escapeCSV(a.status === 'assigned' ? 'Assigned' : 'In Stock'),
    escapeCSV(a.assetTag || '—'),
    escapeCSV(a.assignedDate || '—'),
  ]);

  const csvContent = [
    `# IT Equipment Handover Record for: ${userName} ${userPhone ? `(${userPhone})` : ''}`,
    headers.join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\r\n');

  const cleanName = userName.toLowerCase().replace(/\s+/g, '_');
  triggerDownload(csvContent, `equipment_slip_${cleanName}.csv`);
}

/**
 * Download standard upload template CSV for batch importing inventory
 */
export function downloadUploadTemplateCSV(): void {
  const headers = [
    'Category',
    'Brand',
    'Model',
    'SerialNumber',
    'Status',
    'AssignedToUser',
    'AssignedDate',
    'Location',
    'Condition',
    'Notes',
  ];

  const sampleRows = [
    [
      'Laptop',
      'Lenovo',
      'ThinkPad T14s Gen 4 AMD',
      'PW0QRQB8',
      'assigned',
      'John Miller',
      '2026-01-12',
      'Building A · Floor 3 · Desk 312',
      'Excellent',
      'Assigned to John Miller with Lenovo 65W GaN adapter',
    ],
    [
      'Headset',
      'Jabra',
      'Evolve2 65 Flex UC Wireless',
      '89780115',
      'assigned',
      'John Miller',
      '2026-01-12',
      'Building A · Floor 3 · Desk 312',
      'Excellent',
      'Includes Jabra Link 380 USB-C dongle',
    ],
    [
      'Monitor',
      'Iiyama',
      'ProLite XUB2792UHSU 27" 4K',
      'IIY-034K89-M1',
      'assigned',
      'John Miller',
      '2026-01-12',
      'Building A · Floor 3 · Desk 312',
      'Excellent',
      'Primary monitor · 4K UHD 65W PD',
    ],
    [
      'Monitor',
      'Iiyama',
      'ProLite XUB2792UHSU 27" 4K',
      'IIY-034K90-M2',
      'assigned',
      'John Miller',
      '2026-01-12',
      'Building A · Floor 3 · Desk 312',
      'Excellent',
      'Secondary monitor (user has 2 Iiyama monitors)',
    ],
    [
      'Keyboard / Mouse',
      'Logi',
      'MX Keys S + MX Master 3S Combo',
      'KM-9921448',
      'assigned',
      'John Miller',
      '2026-01-12',
      'Building A · Floor 3 · Desk 312',
      'Excellent',
      'Paired via Logi Bolt USB receiver',
    ],
    [
      'Phone',
      'Iphone',
      'iPhone 15 Pro 256GB Natural Titanium',
      'F17K9921DN',
      'assigned',
      'John Miller',
      '2026-01-12',
      'Building A · Floor 3 · Desk 312',
      'Excellent',
      'Corporate eSIM enabled',
    ],
    [
      'Honeywell Scanner',
      'Honeywell',
      'ScanPal EDA52 Enterprise Mobile Computer',
      'HON-EDA52-991',
      'assigned',
      'John Miller',
      '2026-01-12',
      'Building A · Floor 3 · Desk 312',
      'Excellent',
      'Barcode reader unit for physical stock audits',
    ],
    [
      'Laptop',
      'Lenovo',
      'ThinkPad X1 Carbon Gen 11',
      'PW088219XA',
      'in_stock',
      '',
      '',
      'Central IT Stockroom · Shelf L1',
      'New',
      'Ready for deployment (only Lenovo laptops)',
    ],
    [
      'Monitor',
      'Iiyama',
      'ProLite XUB2792UHSU 27" 4K',
      'IIY-STKM-01',
      'in_stock',
      '',
      '',
      'Central IT Stockroom · Bay M-01',
      'New',
      'Reserve Iiyama monitor in stock',
    ],
  ];

  const comments = [
    '# ASSETTRACK PRO - HARDWARE INVENTORY UPLOAD TEMPLATE',
    '# INSTRUCTIONS & CONSTRAINTS:',
    '# 1. Laptop brand is Lenovo',
    '# 2. Monitor brand is Iiyama',
    '# 3. Keyboard / Mouse brand is Logi',
    '# 4. Phone brand is Iphone',
    '# 5. Honeywell Scanners brand is Honeywell',
    '# 6. Categories: Laptop, Keyboard / Mouse, Headset, Monitor, Phone, Honeywell Scanner (or custom added)',
    '# 7. Status: "assigned" or "in_stock"',
  ];

  const csvContent = [
    ...comments,
    headers.join(','),
    ...sampleRows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\r\n');

  triggerDownload(csvContent, 'inventory_upload_template.csv');
}

/**
 * Robust CSV parser
 */
export function parseCSVText(csvText: string): Array<Record<string, string>> {
  const lines = csvText.split(/\r\n|\n|\r/);
  const dataLines = lines.filter((l) => l.trim().length > 0 && !l.trim().startsWith('#'));

  if (dataLines.length < 2) return [];

  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(dataLines[0]).map((h) => h.toLowerCase().replace(/[\s\-_()]/g, ''));
  const results: Array<Record<string, string>> = [];

  for (let i = 1; i < dataLines.length; i++) {
    const rawCols = parseRow(dataLines[i]);
    if (rawCols.length === 0 || (rawCols.length === 1 && !rawCols[0])) continue;

    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = rawCols[idx] !== undefined ? rawCols[idx] : '';
    });
    results.push(rowObj);
  }

  return results;
}

/**
 * User Directory Export (exports only what is currently listed/filtered)
 * Schema matches the mass upload template exactly so the exported CSV can be re-uploaded.
 */
export function exportUserDirectoryCSV(users: User[], assets?: Asset[]): void {
  const headers = [
    'FullName',
    'CorporateEmail',
    'Department',
    'Role',
    'DeskLocation',
    'JoinedDate',
    'Notes',
  ];

  const rows = users.map((u) => [
    escapeCSV(u.name),
    escapeCSV(u.email),
    escapeCSV(u.department),
    escapeCSV(u.role),
    escapeCSV(u.deskLocation),
    escapeCSV(u.joinedDate || '2024-01-15'),
    escapeCSV(u.notes || ''),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  triggerDownload(csvContent, `users_directory_export_${dateStr}.csv`);
}

/**
 * Download standard upload template CSV for batch importing employees into User Directory
 */
export function downloadUserUploadTemplateCSV(): void {
  const headers = [
    'FullName',
    'CorporateEmail',
    'Department',
    'Role',
    'DeskLocation',
    'JoinedDate',
    'Notes',
  ];

  const sampleRows = [
    [
      'Sarah Connor',
      'sarah.connor@example.com',
      'Engineering',
      'DevOps Architect',
      'Building B · Floor 2 · Desk 204',
      '2024-03-01',
      'Remote hybrid schedule on Tuesdays and Thursdays',
    ],
    [
      'Marcus Wright',
      'marcus.wright@example.com',
      'Product',
      'Product Owner',
      'Building A · Floor 4 · Desk 418',
      '2024-04-15',
      'Requires dual Iiyama monitors and Lenovo ThinkPad',
    ],
    [
      'Elena Fisher',
      'elena.fisher@example.com',
      'Design',
      'Lead UI/UX Designer',
      'Building A · Floor 3 · Desk 322',
      '2024-05-10',
      'Color-calibrated 4K display profile assigned',
    ],
  ];

  const csvContent = [
    '# ASSETTRACK PRO - EMPLOYEE DIRECTORY BULK IMPORT TEMPLATE',
    '# Required columns: FullName, CorporateEmail, Department, Role, DeskLocation',
    headers.join(','),
    ...sampleRows.map((r) => r.map((c) => escapeCSV(c)).join(',')),
  ].join('\r\n');

  triggerDownload(csvContent, 'employee_directory_upload_template.csv');
}

/**
 * Download category-specific hardware upload template CSV
 */
export function downloadCategoryUploadTemplateCSV(category: string): void {
  const headers = [
    'Category',
    'Brand',
    'Model',
    'SerialNumber',
    'Status',
    'AssignedToUser',
    'AssignedDate',
    'Location',
    'Condition',
    'Notes',
  ];

  let sampleRows: string[][] = [];

  if (category === 'Laptop') {
    sampleRows = [
      ['Laptop', 'Lenovo', 'ThinkPad T14s Gen 4 AMD', 'PW0QRQB9', 'in_stock', '', '', 'Central IT Stockroom · Rack L1', 'New', 'Standard Lenovo corporate laptop fleet'],
      ['Laptop', 'Lenovo', 'ThinkPad X1 Carbon Gen 11', 'PW0X1C99', 'in_stock', '', '', 'Central IT Stockroom · Rack L2', 'New', 'Executive ultralight laptop'],
    ];
  } else if (category === 'Monitor') {
    sampleRows = [
      ['Monitor', 'Iiyama', 'ProLite XUB2792UHSU 27" 4K', 'IIY-4K-09921', 'in_stock', '', '', 'Central IT Stockroom · Bay M3', 'New', 'Standard Iiyama 4K IPS panel'],
      ['Monitor', 'Iiyama', 'ProLite XUB2493HS 24" FHD', 'IIY-FHD-7712', 'in_stock', '', '', 'Central IT Stockroom · Bay M4', 'New', 'Secondary workstation monitor'],
    ];
  } else if (category === 'Keyboard / Mouse') {
    sampleRows = [
      ['Keyboard / Mouse', 'Logi', 'MX Keys S + MX Master 3S Combo', 'KM-LOGI-8821', 'in_stock', '', '', 'Central IT Stockroom · Bin K1', 'New', 'Logi Bolt wireless receiver included'],
      ['Keyboard / Mouse', 'Logi', 'Wave Keys Ergonomic Keyboard', 'KM-WAVE-3301', 'in_stock', '', '', 'Central IT Stockroom · Bin K2', 'New', 'Ergonomic fleet combo'],
    ];
  } else if (category === 'Phone') {
    sampleRows = [
      ['Phone', 'Iphone', 'iPhone 15 Pro 256GB', 'F17IPHONE99', 'in_stock', '', '', 'Central IT Stockroom · Safe P1', 'New', 'Corporate eSIM unlocked'],
      ['Phone', 'Iphone', 'iPhone 14 128GB', 'F14IPHONE12', 'in_stock', '', '', 'Central IT Stockroom · Safe P2', 'Excellent', 'Refurbished corporate line'],
    ];
  } else if (category === 'Honeywell Scanner') {
    sampleRows = [
      ['Honeywell Scanner', 'Honeywell', 'ScanPal EDA52 Enterprise', 'HON-EDA-8819', 'in_stock', '', '', 'Central IT Stockroom · Cage H1', 'New', 'Industrial 2D imager with battery dock'],
    ];
  } else {
    sampleRows = [
      [category, 'Enterprise', 'Standard Enterprise Unit', `SN-${Date.now().toString().slice(-6)}`, 'in_stock', '', '', 'Central IT Stockroom', 'New', `Batch import for ${category}`],
    ];
  }

  const csvContent = [
    `# ASSETTRACK PRO - BATCH UPLOAD TEMPLATE FOR: ${category.toUpperCase()}`,
    headers.join(','),
    ...sampleRows.map((r) => r.map((c) => escapeCSV(c)).join(',')),
  ].join('\r\n');

  const cleanCat = category.toLowerCase().replace(/[^a-z0-9]/g, '_');
  triggerDownload(csvContent, `upload_template_${cleanCat}.csv`);
}

/**
 * Full JSON export of database
 */
export function exportCompleteJSON(
  assets: Asset[], 
  users: User[], 
  history: AssetHistoryEvent[], 
  categories: string[], 
  brands: Record<string, string[]>
): void {
  const exportPayload = {
    exportedAt: new Date().toISOString(),
    system: 'AssetTrack Pro IT Asset Management (ITAM)',
    summary: {
      totalAssets: assets.length,
      assignedAssets: assets.filter((a) => a.status === 'assigned').length,
      inStockAssets: assets.filter((a) => a.status === 'in_stock').length,
      totalUsers: users.length,
      totalHistoryEvents: history.length,
    },
    categories,
    brands,
    users,
    assets,
    history,
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const dateStr = new Date().toISOString().split('T')[0];
  triggerDownload(jsonStr, `it_asset_full_backup_${dateStr}.json`, 'application/json');
}
