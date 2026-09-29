import { Asset, User, AssetHistoryEvent } from '../types/inventory';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'John Miller',
    email: 'john.miller@company.io',
    phone: '+1 (555) 312-9901',
    department: 'Engineering',
    role: 'Staff Systems Engineer',
    deskLocation: 'Building A · Floor 3 · Desk 312',
    avatarColor: '#2563eb',
    joinedDate: '2023-03-15',
    notes: 'Primary hardware custodian for engineering fleet',
  },
  {
    id: 'usr-2',
    name: 'Sarah Chen',
    email: 'sarah.chen@company.io',
    phone: '+1 (555) 314-2204',
    department: 'Engineering',
    role: 'Senior Frontend Engineer',
    deskLocation: 'Building A · Floor 3 · Desk 314',
    avatarColor: '#059669',
    joinedDate: '2023-07-01',
  },
  {
    id: 'usr-3',
    name: 'Michael Scott',
    email: 'michael.scott@company.io',
    phone: '+1 (555) 204-8812',
    department: 'Product',
    role: 'Principal Product Manager',
    deskLocation: 'Building A · Floor 2 · Desk 204',
    avatarColor: '#7c3aed',
    joinedDate: '2022-11-10',
  },
  {
    id: 'usr-4',
    name: 'Elena Rostova',
    email: 'elena.rostova@company.io',
    phone: '+1 (555) 108-4491',
    department: 'DevOps & Cloud',
    role: 'Senior Infrastructure Engineer',
    deskLocation: 'Building B · Floor 1 · Desk 108',
    avatarColor: '#db2777',
    joinedDate: '2023-01-20',
  },
  {
    id: 'usr-5',
    name: 'Marcus Vance',
    email: 'marcus.vance@company.io',
    phone: '+1 (555) 320-7731',
    department: 'QA & Testing',
    role: 'QA Automation Lead',
    deskLocation: 'Building A · Floor 3 · Desk 320',
    avatarColor: '#d97706',
    joinedDate: '2023-05-12',
  },
  {
    id: 'usr-6',
    name: 'David Kim',
    email: 'david.kim@company.io',
    phone: '+1 (555) 318-6620',
    department: 'Engineering',
    role: 'Backend Architect',
    deskLocation: 'Building A · Floor 3 · Desk 318',
    avatarColor: '#0891b2',
    joinedDate: '2022-09-01',
  },
  {
    id: 'usr-7',
    name: 'Priya Patel',
    email: 'priya.patel@company.io',
    phone: '+1 (555) 210-9943',
    department: 'Design',
    role: 'Lead UI/UX Designer',
    deskLocation: 'Building A · Floor 2 · Desk 210',
    avatarColor: '#e11d48',
    joinedDate: '2023-08-15',
  },
  {
    id: 'usr-8',
    name: 'Alex Morgan',
    email: 'alex.morgan@company.io',
    phone: '+1 (555) 222-1109',
    department: 'Data & Analytics',
    role: 'Staff Data Scientist',
    deskLocation: 'Building B · Floor 2 · Desk 222',
    avatarColor: '#4f46e5',
    joinedDate: '2024-02-01',
  },
  {
    id: 'usr-9',
    name: 'Jessica Taylor',
    email: 'jessica.taylor@company.io',
    phone: '+1 (555) 115-3378',
    department: 'InfoSec',
    role: 'Senior Security Analyst',
    deskLocation: 'Building B · Floor 1 · Desk 115',
    avatarColor: '#0d9488',
    joinedDate: '2023-10-05',
  },
  {
    id: 'usr-10',
    name: 'Carlos Gomez',
    email: 'carlos.gomez@company.io',
    phone: '+1 (555) 324-5502',
    department: 'Engineering',
    role: 'Full-Stack Developer',
    deskLocation: 'Building A · Floor 3 · Desk 324',
    avatarColor: '#65a30d',
    joinedDate: '2024-01-10',
  },
];

export function generateInitialAssets(): { assets: Asset[]; history: AssetHistoryEvent[] } {
  const assets: Asset[] = [];
  const history: AssetHistoryEvent[] = [];

  const addHistory = (
    asset: Asset,
    eventType: AssetHistoryEvent['eventType'],
    date: string,
    user: User | null,
    notes: string,
    custodian = 'IT Asset Admin'
  ) => {
    history.push({
      id: `evt-${asset.id}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      assetId: asset.id,
      serialNumber: asset.serialNumber,
      assetModel: `${asset.brand} ${asset.model}`,
      category: asset.category,
      eventType,
      date,
      userId: user ? user.id : null,
      userName: user ? user.name : null,
      userEmail: user?.email,
      userPhone: user?.phone,
      custodian,
      notes,
      conditionAtEvent: asset.condition,
      deskLocation: user ? user.deskLocation : asset.location,
      updatedAt: new Date().toISOString(),
    });
  };

  // ==========================================
  // 1. LAPTOPS (Brand: ONLY Lenovo)
  // ==========================================
  const laptopAssigned = [
    { model: 'ThinkPad T14s Gen 4 AMD Ryzen 7', sn: 'PW0QRQB8', user: INITIAL_USERS[0], date: '2026-01-12' }, // John
    { model: 'ThinkPad X1 Carbon Gen 11 Intel i7', sn: 'PW091288X', user: INITIAL_USERS[1], date: '2026-01-15' },
    { model: 'ThinkPad T14 Gen 4 Intel i5', sn: 'PW078129LX', user: INITIAL_USERS[2], date: '2026-01-18' },
    { model: 'ThinkPad P16s Gen 2 AMD Workstation', sn: 'PW088210P', user: INITIAL_USERS[3], date: '2026-01-20' },
    { model: 'ThinkPad T16 Gen 2 Intel i7', sn: 'PW044910TX', user: INITIAL_USERS[4], date: '2026-01-22' },
    { model: 'ThinkPad P1 Gen 6 RTX 4080 Workstation', sn: 'PW066291PW', user: INITIAL_USERS[5], date: '2026-01-25' },
    { model: 'ThinkPad X1 Yoga Gen 8 2-in-1 Touch', sn: 'PW011289YG', user: INITIAL_USERS[6], date: '2026-02-01' },
    { model: 'ThinkPad P16v Gen 1 AMD Ryzen 9', sn: 'PW099412PV', user: INITIAL_USERS[7], date: '2026-02-05' },
    { model: 'ThinkPad T14s Gen 4 Intel i7', sn: 'PW055819TS', user: INITIAL_USERS[8], date: '2026-02-10' },
    { model: 'ThinkPad L14 Gen 4 AMD Ryzen 5', sn: 'PW033910LM', user: INITIAL_USERS[9], date: '2026-02-12' },
  ];

  laptopAssigned.forEach((item, index) => {
    const asset: Asset = {
      id: `ast-lap-${index + 1}`,
      category: 'Laptop',
      brand: 'Lenovo',
      model: item.model,
      serialNumber: item.sn,
      assetTag: `AST-LNV-${1000 + index + 1}`,
      status: 'assigned',
      lifecycleStatus: 'deployed',
      assignedUserId: item.user.id,
      assignedUserName: item.user.name,
      assignedDate: item.date,
      purchaseDate: '2025-11-20',
      warrantyExpiry: '2028-11-20',
      purchaseCost: 1450,
      location: item.user.deskLocation,
      condition: 'Excellent',
      notes: index === 0 ? 'Assigned to John Miller with Lenovo 65W GaN adapter & lock' : 'Standard engineering deployment',
      updatedAt: '2026-02-15T09:00:00Z',
    };
    assets.push(asset);
    addHistory(asset, 'registration', '2025-11-22', null, 'Received from Lenovo enterprise vendor. Asset tag barcode generated.');
    addHistory(asset, 'handover', item.date, item.user, `Hardware issued to ${item.user.name} (${item.user.department}). Handover form signed.`);
  });

  // 10 Lenovo Laptops in stock
  const laptopStock = [
    { model: 'ThinkPad T14s Gen 4 AMD Ryzen 7', sn: 'PW0998811A' },
    { model: 'ThinkPad T14s Gen 4 AMD Ryzen 7', sn: 'PW0998812B' },
    { model: 'ThinkPad X1 Carbon Gen 11 Intel i7', sn: 'PW088219XA' },
    { model: 'ThinkPad X1 Carbon Gen 11 Intel i7', sn: 'PW088220XB' },
    { model: 'ThinkPad T14 Gen 4 Intel i5', sn: 'PW066311LX' },
    { model: 'ThinkPad T14 Gen 4 Intel i5', sn: 'PW066312LY' },
    { model: 'ThinkPad P14s Gen 4 Mobile Workstation', sn: 'PW055102P1' },
    { model: 'ThinkPad P14s Gen 4 Mobile Workstation', sn: 'PW055103P2' },
    { model: 'ThinkPad L14 Gen 4 AMD Ryzen 5', sn: 'PW044819LA' },
    { model: 'ThinkPad X13 Gen 4 AMD Ultralight', sn: 'PW022910X3' },
  ];

  laptopStock.forEach((item, index) => {
    const asset: Asset = {
      id: `ast-lap-${index + 11}`,
      category: 'Laptop',
      brand: 'Lenovo',
      model: item.model,
      serialNumber: item.sn,
      assetTag: `AST-LNV-${1000 + index + 11}`,
      status: 'in_stock',
      lifecycleStatus: 'in_stock',
      assignedUserId: null,
      assignedUserName: null,
      assignedDate: null,
      purchaseDate: '2025-12-05',
      warrantyExpiry: '2028-12-05',
      purchaseCost: 1350,
      location: 'Central IT Stockroom · Shelf L1',
      condition: 'New',
      notes: 'New Lenovo ThinkPad in factory box, imaged with enterprise OS v2026.1',
      updatedAt: '2026-02-20T10:00:00Z',
    };
    assets.push(asset);
    addHistory(asset, 'registration', '2025-12-08', null, 'Asset received and stored in Central IT Stockroom.');
  });

  // ==========================================
  // 2. MONITORS (Brand: ONLY Iiyama)
  // ==========================================
  const monitorAssignments = [
    // John: 2 Iiyama monitors
    { model: 'ProLite XUB2792UHSU 27" 4K IPS USB-C', sn: 'IIY-034K89-M1', user: INITIAL_USERS[0], date: '2026-01-12', notes: 'Primary Display 1 · 4K UHD 65W PD' },
    { model: 'ProLite XUB2792UHSU 27" 4K IPS USB-C', sn: 'IIY-034K90-M2', user: INITIAL_USERS[0], date: '2026-01-12', notes: 'Secondary Display 2 · DisplayPort MST' },

    // Sarah: 2 Iiyama monitors
    { model: 'ProLite XUB3493WQSU 34" UWQHD Curved IPS', sn: 'IIY-088192-M1', user: INITIAL_USERS[1], date: '2026-01-15', notes: 'Primary Ultrawide Display' },
    { model: 'ProLite XUB2792UHSU 27" 4K IPS', sn: 'IIY-088193-M2', user: INITIAL_USERS[1], date: '2026-01-15', notes: 'Secondary Vertical Portrait Display' },

    // Michael: 1 Iiyama monitor (sometimes one!)
    { model: 'ProLite XUB2792HSU 27" FHD IPS Height Adj', sn: 'IIY-991204-M1', user: INITIAL_USERS[2], date: '2026-01-18', notes: 'Single Monitor Workstation Setup' },

    // Elena: 2 Iiyama monitors
    { model: 'ProLite XUB2792QSU 27" QHD IPS', sn: 'IIY-772910-M1', user: INITIAL_USERS[3], date: '2026-01-20', notes: 'Primary Display 1' },
    { model: 'ProLite XUB2792QSU 27" QHD IPS', sn: 'IIY-772911-M2', user: INITIAL_USERS[3], date: '2026-01-20', notes: 'Secondary Display 2' },

    // Marcus: 2 Iiyama monitors
    { model: 'ProLite XUB2792UHSU 27" 4K IPS', sn: 'IIY-055102-M1', user: INITIAL_USERS[4], date: '2026-01-22', notes: 'Primary Display 1' },
    { model: 'ProLite XUB2792UHSU 27" 4K IPS', sn: 'IIY-055103-M2', user: INITIAL_USERS[4], date: '2026-01-22', notes: 'Secondary Display 2' },

    // David: 2 Iiyama monitors
    { model: 'ProLite XUB2792UHSU 27" 4K IPS', sn: 'IIY-552199-M1', user: INITIAL_USERS[5], date: '2026-01-25', notes: 'Primary Display 1' },
    { model: 'ProLite XUB2792UHSU 27" 4K IPS', sn: 'IIY-552200-M2', user: INITIAL_USERS[5], date: '2026-01-25', notes: 'Secondary Display 2' },

    // Priya: 2 Iiyama monitors
    { model: 'ProLite XUB3493WQSU 34" Ultrawide', sn: 'IIY-884P21-M1', user: INITIAL_USERS[6], date: '2026-02-01', notes: 'Designer Display 1' },
    { model: 'ProLite XUB2792QSU 27" QHD IPS', sn: 'IIY-884P22-M2', user: INITIAL_USERS[6], date: '2026-02-01', notes: 'Color-calibrated Display 2' },

    // Alex: 1 Iiyama monitor (sometimes one!)
    { model: 'ProLite XUB2792UHSU 27" 4K IPS', sn: 'IIY-991204-M1', user: INITIAL_USERS[7], date: '2026-02-05', notes: 'Single Monitor Setup' },

    // Jessica: 2 Iiyama monitors
    { model: 'ProLite XUB2792QSU 27" QHD IPS', sn: 'IIY-448102-M1', user: INITIAL_USERS[8], date: '2026-02-10', notes: 'Primary Display 1' },
    { model: 'ProLite XUB2792QSU 27" QHD IPS', sn: 'IIY-448103-M2', user: INITIAL_USERS[8], date: '2026-02-10', notes: 'Secondary Display 2' },

    // Carlos: 1 Iiyama monitor (sometimes one!)
    { model: 'ProLite XUB2792HSU 27" FHD IPS', sn: 'IIY-339182-M1', user: INITIAL_USERS[9], date: '2026-02-12', notes: 'Single Monitor Setup' },
  ];

  monitorAssignments.forEach((item, index) => {
    const asset: Asset = {
      id: `ast-mon-${index + 1}`,
      category: 'Monitor',
      brand: 'Iiyama', // ONLY Iiyama
      model: item.model,
      serialNumber: item.sn,
      assetTag: `AST-IIY-${2000 + index + 1}`,
      status: 'assigned',
      lifecycleStatus: 'deployed',
      assignedUserId: item.user.id,
      assignedUserName: item.user.name,
      assignedDate: item.date,
      purchaseDate: '2025-10-15',
      warrantyExpiry: '2028-10-15',
      purchaseCost: 380,
      location: item.user.deskLocation,
      condition: 'Excellent',
      notes: item.notes,
      updatedAt: '2026-02-15T09:00:00Z',
    };
    assets.push(asset);
    addHistory(asset, 'registration', '2025-10-20', null, 'Received from Iiyama authorized distributor.');
    addHistory(asset, 'handover', item.date, item.user, `Delivered & mounted at desk ${item.user.deskLocation}.`);
  });

  // 4 Iiyama Monitors in stock
  const monitorStock = [
    { model: 'ProLite XUB2792UHSU 27" 4K IPS USB-C', sn: 'IIY-STKM-01' },
    { model: 'ProLite XUB2792UHSU 27" 4K IPS USB-C', sn: 'IIY-STKM-02' },
    { model: 'ProLite XUB2792QSU 27" QHD IPS', sn: 'IIY-STKM-03' },
    { model: 'ProLite XUB2493HS 24" FHD IPS', sn: 'IIY-STKM-04' },
  ];

  monitorStock.forEach((item, index) => {
    const asset: Asset = {
      id: `ast-mon-${index + 18}`,
      category: 'Monitor',
      brand: 'Iiyama', // ONLY Iiyama
      model: item.model,
      serialNumber: item.sn,
      assetTag: `AST-IIY-${2000 + index + 18}`,
      status: 'in_stock',
      lifecycleStatus: 'in_stock',
      assignedUserId: null,
      assignedUserName: null,
      assignedDate: null,
      purchaseDate: '2025-12-10',
      warrantyExpiry: '2028-12-10',
      purchaseCost: 380,
      location: 'Central IT Stockroom · Bay M-01',
      condition: 'New',
      notes: 'New Iiyama monitor in original factory packaging',
      updatedAt: '2026-02-20T10:00:00Z',
    };
    assets.push(asset);
    addHistory(asset, 'registration', '2025-12-12', null, 'In stock ready for workstation deployment.');
  });

  // ==========================================
  // 3. KEYBOARD / MOUSE (Brand: ONLY Logi)
  // ==========================================
  const kmAssigned = [
    { model: 'MX Keys S + MX Master 3S Wireless Combo', sn: 'KM-9921448', user: INITIAL_USERS[0], date: '2026-01-12' },
    { model: 'Wave Keys Ergonomic + Lift Vertical Mouse', sn: 'KM-9921449', user: INITIAL_USERS[1], date: '2026-01-15' },
    { model: 'MK295 Silent Wireless Combo', sn: 'KM-9921450', user: INITIAL_USERS[2], date: '2026-01-18' },
    { model: 'MX Mechanical Mini + MX Master 3S', sn: 'KM-9921451', user: INITIAL_USERS[3], date: '2026-01-20' },
    { model: 'MK540 Advanced Wireless Combo', sn: 'KM-9921452', user: INITIAL_USERS[4], date: '2026-01-22' },
    { model: 'MX Keys S + MX Anywhere 3S Combo', sn: 'KM-9921453', user: INITIAL_USERS[5], date: '2026-01-25' },
    { model: 'Wave Keys Ergonomic + Lift Mouse', sn: 'KM-9921454', user: INITIAL_USERS[6], date: '2026-02-01' },
    { model: 'MX Mechanical Wireless Combo', sn: 'KM-9921455', user: INITIAL_USERS[7], date: '2026-02-05' },
    { model: 'MK295 Silent Wireless Combo', sn: 'KM-9921456', user: INITIAL_USERS[8], date: '2026-02-10' },
    { model: 'MK540 Advanced Wireless Combo', sn: 'KM-9921457', user: INITIAL_USERS[9], date: '2026-02-12' },
  ];

  kmAssigned.forEach((item, index) => {
    const asset: Asset = {
      id: `ast-km-${index + 1}`,
      category: 'Keyboard / Mouse',
      brand: 'Logi', // ONLY Logi
      model: item.model,
      serialNumber: item.sn,
      assetTag: `AST-LOGI-${3000 + index + 1}`,
      status: 'assigned',
      lifecycleStatus: 'deployed',
      assignedUserId: item.user.id,
      assignedUserName: item.user.name,
      assignedDate: item.date,
      location: item.user.deskLocation,
      condition: 'Excellent',
      notes: 'Paired via Logi Bolt USB receiver & Bluetooth channel 1',
      updatedAt: '2026-02-15T09:00:00Z',
    };
    assets.push(asset);
    addHistory(asset, 'registration', '2025-11-01', null, 'Received from Logi corporate partner.');
    addHistory(asset, 'handover', item.date, item.user, `Issued to ${item.user.name}.`);
  });

  // 10 Logi Keyboards/Mice in stock
  for (let i = 1; i <= 10; i++) {
    const asset: Asset = {
      id: `ast-km-${i + 10}`,
      category: 'Keyboard / Mouse',
      brand: 'Logi', // ONLY Logi
      model: i % 2 === 0 ? 'MX Keys S + MX Master 3S Combo' : 'MK295 Silent Wireless Combo',
      serialNumber: `KM-LOGI-STK0${i}`,
      assetTag: `AST-LOGI-${3010 + i}`,
      status: 'in_stock',
      lifecycleStatus: 'in_stock',
      assignedUserId: null,
      assignedUserName: null,
      assignedDate: null,
      location: 'Central IT Stockroom · Shelf K2',
      condition: 'New',
      notes: 'Unopened box with Logi Bolt dongle and alkaline batteries',
      updatedAt: '2026-02-20T10:00:00Z',
    };
    assets.push(asset);
  }

  // ==========================================
  // 4. PHONES (Brand: ONLY Iphone)
  // ==========================================
  const phoneAssignments = [
    { model: 'iPhone 15 Pro 256GB Natural Titanium', sn: 'F17K9921DN', user: INITIAL_USERS[0], date: '2026-01-12' }, // John
    { model: 'iPhone 15 Pro 128GB Blue Titanium', sn: 'F17K9922DN', user: INITIAL_USERS[1], date: '2026-01-15' },
    { model: 'iPhone 15 128GB Black', sn: 'F17K9923DN', user: INITIAL_USERS[2], date: '2026-01-18' },
    { model: 'iPhone 15 Pro 256GB Black Titanium', sn: 'F17K9924DN', user: INITIAL_USERS[3], date: '2026-01-20' },
    { model: 'iPhone 14 128GB Midnight', sn: 'F17K9925DN', user: INITIAL_USERS[4], date: '2026-01-22' },
    { model: 'iPhone 15 Pro 512GB Natural Titanium', sn: 'F17K9926DN', user: INITIAL_USERS[5], date: '2026-01-25' },
    { model: 'iPhone 15 256GB Pink', sn: 'F17K9927DN', user: INITIAL_USERS[6], date: '2026-02-01' },
    { model: 'iPhone 15 Pro 256GB White Titanium', sn: 'F17K9928DN', user: INITIAL_USERS[7], date: '2026-02-05' },
    { model: 'iPhone 15 Pro 128GB Natural Titanium', sn: 'F17K9929DN', user: INITIAL_USERS[8], date: '2026-02-10' },
    { model: 'iPhone 14 128GB Starlight', sn: 'F17K9930DN', user: INITIAL_USERS[9], date: '2026-02-12' },
  ];

  phoneAssignments.forEach((item, index) => {
    const asset: Asset = {
      id: `ast-phn-${index + 1}`,
      category: 'Phone',
      brand: 'Iphone', // ONLY Iphone
      model: item.model,
      serialNumber: item.sn,
      assetTag: `AST-IPH-${4000 + index + 1}`,
      status: 'assigned',
      lifecycleStatus: 'deployed',
      assignedUserId: item.user.id,
      assignedUserName: item.user.name,
      assignedDate: item.date,
      purchaseDate: '2025-10-01',
      warrantyExpiry: '2027-10-01',
      purchaseCost: 999,
      location: item.user.deskLocation,
      condition: 'Excellent',
      notes: `Configured with corporate MDM profile & eSIM (${item.user.phone})`,
      updatedAt: '2026-02-15T09:00:00Z',
    };
    assets.push(asset);
    addHistory(asset, 'registration', '2025-10-05', null, 'Enrolled into Apple Business Manager & MDM.');
    addHistory(asset, 'handover', item.date, item.user, `Issued to ${item.user.name} with eSIM assigned.`);
  });

  // 5 iPhones in stock
  for (let i = 1; i <= 5; i++) {
    const asset: Asset = {
      id: `ast-phn-${i + 10}`,
      category: 'Phone',
      brand: 'Iphone', // ONLY Iphone
      model: 'iPhone 15 128GB Black',
      serialNumber: `F17K-STK0${i}`,
      assetTag: `AST-IPH-${4010 + i}`,
      status: 'in_stock',
      lifecycleStatus: 'in_stock',
      assignedUserId: null,
      assignedUserName: null,
      assignedDate: null,
      purchaseDate: '2025-11-15',
      warrantyExpiry: '2027-11-15',
      purchaseCost: 799,
      location: 'Central IT Safe · Drawer P1',
      condition: 'New',
      notes: 'New in sealed Apple retail box with USB-C woven cable',
      updatedAt: '2026-02-20T10:00:00Z',
    };
    assets.push(asset);
  }

  // ==========================================
  // 5. HONEYWELL DEVICES (Brand: Honeywell)
  // ==========================================
  const honeywellUnits = [
    { model: 'ScanPal EDA52 Enterprise Mobile Computer', sn: 'HON-EDA52-991', user: INITIAL_USERS[0], date: '2026-01-12' }, // John
    { model: 'Voyager 1400g 2D Multi-Interface Scanner', sn: 'HON-VYG-1400G1', user: INITIAL_USERS[4], date: '2026-01-22' }, // Marcus
    { model: 'Xenon Ultra 1960g High-Density Scanner', sn: 'HON-XNN-1960G1', user: INITIAL_USERS[8], date: '2026-02-10' }, // Jessica
  ];

  honeywellUnits.forEach((item, index) => {
    const asset: Asset = {
      id: `ast-hon-${index + 1}`,
      category: 'Honeywell Scanner',
      brand: 'Honeywell',
      model: item.model,
      serialNumber: item.sn,
      assetTag: `AST-HON-${5000 + index + 1}`,
      status: 'assigned',
      lifecycleStatus: 'deployed',
      assignedUserId: item.user.id,
      assignedUserName: item.user.name,
      assignedDate: item.date,
      purchaseDate: '2025-09-10',
      warrantyExpiry: '2028-09-10',
      purchaseCost: 650,
      location: item.user.deskLocation,
      condition: 'Excellent',
      notes: 'Industrial grade barcode validation unit for IT inventory ops',
      updatedAt: '2026-02-15T09:00:00Z',
    };
    assets.push(asset);
    addHistory(asset, 'registration', '2025-09-15', null, 'Commissioned for inventory barcode scanning.');
    addHistory(asset, 'handover', item.date, item.user, `Issued to ${item.user.name} for hardware audits.`);
  });

  // 3 Honeywell scanners in stock
  const honeywellStock = [
    { model: 'Voyager 1400g 2D USB Barcode Scanner', sn: 'HON-VYG-STK01' },
    { model: 'Voyager 1400g 2D USB Barcode Scanner', sn: 'HON-VYG-STK02' },
    { model: 'ScanPal EDA52 Mobile Computer 5G', sn: 'HON-EDA52-STK03' },
  ];

  honeywellStock.forEach((item, index) => {
    const asset: Asset = {
      id: `ast-hon-${index + 4}`,
      category: 'Honeywell Scanner',
      brand: 'Honeywell',
      model: item.model,
      serialNumber: item.sn,
      assetTag: `AST-HON-${5004 + index}`,
      status: 'in_stock',
      lifecycleStatus: 'in_stock',
      assignedUserId: null,
      assignedUserName: null,
      assignedDate: null,
      purchaseDate: '2025-10-01',
      warrantyExpiry: '2028-10-01',
      purchaseCost: 550,
      location: 'Central IT Stockroom · Bay H-Scanner',
      condition: 'New',
      notes: 'Ready for warehouse & audit deployment',
      updatedAt: '2026-02-20T10:00:00Z',
    };
    assets.push(asset);
  });

  // ==========================================
  // 6. HEADSETS (Jabra & Poly)
  // ==========================================
  const headsetAssigned = [
    { brand: 'Jabra', model: 'Evolve2 65 Flex UC Wireless', sn: '89780115', user: INITIAL_USERS[0], date: '2026-01-12' }, // John's exact sn from photo
    { brand: 'Poly', model: 'Voyager Focus 2 UC Bluetooth', sn: '89882190', user: INITIAL_USERS[1], date: '2026-01-15' },
    { brand: 'Jabra', model: 'Evolve2 75 ANC Wireless', sn: '89780442', user: INITIAL_USERS[2], date: '2026-01-18' },
    { brand: 'Jabra', model: 'Evolve2 65 UC Stereo', sn: '89781198', user: INITIAL_USERS[3], date: '2026-01-20' },
    { brand: 'Poly', model: 'Voyager Free 60+ UC Earbuds', sn: '89884102', user: INITIAL_USERS[4], date: '2026-01-22' },
    { brand: 'Jabra', model: 'Evolve2 85 ANC Over-Ear', sn: '89789912', user: INITIAL_USERS[5], date: '2026-01-25' },
    { brand: 'Logi', model: 'Zone Wireless 2 ANC Headset', sn: '89441920', user: INITIAL_USERS[6], date: '2026-02-01' },
    { brand: 'Jabra', model: 'Evolve2 65 Flex UC Wireless', sn: '89782291', user: INITIAL_USERS[7], date: '2026-02-05' },
    { brand: 'Poly', model: 'Voyager 4320 UC Wireless', sn: '89886610', user: INITIAL_USERS[8], date: '2026-02-10' },
    { brand: 'Jabra', model: 'Evolve2 40 USB-C Corded', sn: '89789901', user: INITIAL_USERS[9], date: '2026-02-12' },
  ];

  headsetAssigned.forEach((item, index) => {
    const asset: Asset = {
      id: `ast-hs-${index + 1}`,
      category: 'Headset',
      brand: item.brand,
      model: item.model,
      serialNumber: item.sn,
      assetTag: `AST-HDS-${6000 + index + 1}`,
      status: 'assigned',
      lifecycleStatus: 'deployed',
      assignedUserId: item.user.id,
      assignedUserName: item.user.name,
      assignedDate: item.date,
      location: item.user.deskLocation,
      condition: 'Excellent',
      notes: index === 0 ? 'Includes Jabra Link 380 USB-C dongle and travel pouch' : 'Standard issue with charging stand',
      updatedAt: '2026-02-15T09:00:00Z',
    };
    assets.push(asset);
    addHistory(asset, 'registration', '2025-11-10', null, 'Received from distributor.');
    addHistory(asset, 'handover', item.date, item.user, `Issued to ${item.user.name}.`);
  });

  // 6 Headsets in stock
  for (let i = 1; i <= 6; i++) {
    const asset: Asset = {
      id: `ast-hs-${i + 10}`,
      category: 'Headset',
      brand: 'Jabra',
      model: 'Evolve2 65 Flex UC Wireless',
      serialNumber: `8978330${i}`,
      assetTag: `AST-HDS-${6010 + i}`,
      status: 'in_stock',
      lifecycleStatus: 'in_stock',
      assignedUserId: null,
      assignedUserName: null,
      assignedDate: null,
      location: 'Central IT Stockroom · Shelf H3',
      condition: 'New',
      notes: 'Tested audio and firmware updated',
      updatedAt: '2026-02-20T10:00:00Z',
    };
    assets.push(asset);
  }

  // ==========================================
  // HISTORICAL PAST HANDOVERS (Demonstrating past history & editable records)
  // ==========================================
  // John Miller past handover: John returned an older Lenovo T14 Gen 2 on 2025-11-10
  history.push({
    id: 'evt-past-john-1',
    assetId: 'ast-lap-archived-99',
    serialNumber: 'PW0552199-OLD',
    assetModel: 'Lenovo ThinkPad T14 Gen 2 Intel',
    category: 'Laptop',
    eventType: 'return',
    date: '2025-11-10',
    userId: INITIAL_USERS[0].id,
    userName: INITIAL_USERS[0].name,
    userEmail: INITIAL_USERS[0].email,
    userPhone: INITIAL_USERS[0].phone,
    custodian: 'Alex Admin (IT Lead)',
    notes: 'Scheduled 3-year hardware refresh. Returned in good condition with original charger.',
    conditionAtEvent: 'Good',
    deskLocation: INITIAL_USERS[0].deskLocation,
    updatedAt: '2025-11-10T14:30:00Z',
  });

  // John Miller original issuance of that Gen 2 back in 2023
  history.push({
    id: 'evt-past-john-0',
    assetId: 'ast-lap-archived-99',
    serialNumber: 'PW0552199-OLD',
    assetModel: 'Lenovo ThinkPad T14 Gen 2 Intel',
    category: 'Laptop',
    eventType: 'handover',
    date: '2023-03-15',
    userId: INITIAL_USERS[0].id,
    userName: INITIAL_USERS[0].name,
    userEmail: INITIAL_USERS[0].email,
    userPhone: INITIAL_USERS[0].phone,
    custodian: 'Sarah IT Custodian',
    notes: 'Initial employee onboarding equipment issue. Acknowledged in SysAid portal.',
    conditionAtEvent: 'New',
    deskLocation: INITIAL_USERS[0].deskLocation,
    updatedAt: '2023-03-15T10:00:00Z',
  });

  // Elena Rostova monitor upgrade on 2025-08-14
  history.push({
    id: 'evt-past-elena-1',
    assetId: 'ast-mon-archived-88',
    serialNumber: 'IIY-771120-RET',
    assetModel: 'Iiyama ProLite XUB2492HSU 24"',
    category: 'Monitor',
    eventType: 'return',
    date: '2025-08-14',
    userId: INITIAL_USERS[3].id,
    userName: INITIAL_USERS[3].name,
    userEmail: INITIAL_USERS[3].email,
    userPhone: INITIAL_USERS[3].phone,
    custodian: 'Central IT Desk',
    notes: 'Upgraded to dual 27" Iiyama QHD displays. Returned 24" unit to stock.',
    conditionAtEvent: 'Excellent',
    deskLocation: INITIAL_USERS[3].deskLocation,
    updatedAt: '2025-08-14T11:00:00Z',
  });

  // Sort history newest first
  history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return { assets, history };
}
