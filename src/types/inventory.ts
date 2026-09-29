export type StandardAssetCategory = 
  | 'Laptop'
  | 'Keyboard / Mouse'
  | 'Headset'
  | 'Monitor'
  | 'Phone'
  | 'Fixed Phone'
  | 'Chip'
  | 'Honeywell Scanner'
  | 'Other';

export type AssetCategory = StandardAssetCategory | string;

export const DEFAULT_ASSET_CATEGORIES: string[] = [
  'Laptop',
  'Keyboard / Mouse',
  'Headset',
  'Monitor',
  'Phone',
  'Fixed Phone',
  'Chip',
  'Honeywell Scanner',
  'Other',
];

export const ASSET_CATEGORIES: string[] = DEFAULT_ASSET_CATEGORIES;

export const BRAND_CONSTRAINTS: Record<string, string[]> = {
  'Laptop': ['Lenovo'],
  'Monitor': ['Iiyama'],
  'Keyboard / Mouse': ['Logi'],
  'Phone': ['Iphone'],
  'Fixed Phone': ['Cisco', 'Yealink', 'Polycom'],
  'Chip': ['Yubico', 'NXP', 'STMicroelectronics', 'HID'],
  'Honeywell Scanner': ['Honeywell'],
  'Other': ['Lenovo', 'StarTech', 'Zebra', 'APC', 'Generic'],
};

export type AssetCondition = 'New' | 'Excellent' | 'Good' | 'Fair' | 'Poor';
export type AssetStatus = 'assigned' | 'in_stock' | 'maintenance' | 'retired';
export type LifecycleStage = 'procured' | 'deployed' | 'in_stock' | 'maintenance' | 'retired';

export interface AssetHistoryEvent {
  id: string;
  assetId: string;
  serialNumber: string;
  assetModel: string;
  category: string;
  eventType: 'handover' | 'return' | 'maintenance' | 'registration' | 'retired' | 'past_adjustment';
  date: string; // YYYY-MM-DD (editable for past records!)
  userId: string | null;
  userName: string | null;
  userEmail?: string;
  userPhone?: string;
  custodian: string;
  notes: string;
  conditionAtEvent?: AssetCondition;
  deskLocation?: string;
  updatedAt: string;
  isPastCorrection?: boolean;
}

export interface HoneywellDeviceSpecs {
  ipv6?: string;              // IP-Adresse (IPv6)
  ipv4?: string;              // IP-Adresse (IPv4)
  wifiMacNetwork?: string;    // WLAN-MAC-Adresse
  wifiMacDevice?: string;     // WLAN-MAC-Adresse des Geräts
  bluetoothMac?: string;      // Bluetooth-Adresse
  secondBleMac?: string;      // Second BLE MAC address
}

export interface Asset {
  id: string;
  category: AssetCategory;
  brand: string;
  model: string;
  serialNumber: string;
  assetTag: string; // SysAid ITAM standard asset barcode tag
  status: AssetStatus;
  lifecycleStatus: LifecycleStage; // SysAid ITAM lifecycle
  assignedUserId: string | null;
  assignedUserName: string | null;
  assignedDate: string | null;
  purchaseDate?: string;
  warrantyExpiry?: string;
  purchaseCost?: number;
  location: string;
  condition: AssetCondition;
  notes?: string;
  honeywellSpecs?: HoneywellDeviceSpecs; // Special info for Honeywell scanners / networked units
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string; // Optional: not all users have a phone number
  department: string;
  role: string;
  deskLocation: string;
  avatarColor: string;
  notes?: string;
  joinedDate?: string;
}

export interface CategoryStockSummary {
  category: string;
  total: number;
  assigned: number;
  inStock: number;
  maintenance?: number;
  retired?: number;
  assignedUsers: {
    userId: string;
    userName: string;
    serialNumber: string;
    model: string;
  }[];
}


export const DEFAULT_DESK_LOCATIONS: string[] = [
  'Building A · Floor 1 · Reception',
  'Building A · Floor 2 · Finance',
  'Building A · Floor 3 · Engineering',
  'Building A · Floor 3 · IT Operations',
  'Building B · Floor 1 · Sales',
  'Building B · Floor 2 · Marketing',
  'Building B · Floor 2 · HR',
  'Warehouse · Bay 1',
  'Remote / Flexible Desk',
];

export interface ProductionProfile {
  id: string;
  lineName: string;            // Required: Production line name (only necessary field)
  sapName?: string;            // Optional: SAP name
  ip?: string;                 // Optional: IP address
  equipmentAssigned?: string[]; // Optional: Equipment assigned (Honeywell serial numbers or IDs)
  status?: 'active' | 'standby' | 'maintenance';
  location?: string;
  notes?: string;
  updatedAt?: string;
}
