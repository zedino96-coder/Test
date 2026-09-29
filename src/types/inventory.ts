export type StandardAssetCategory = 
  | 'Laptop'
  | 'Keyboard / Mouse'
  | 'Headset'
  | 'Monitor'
  | 'Phone'
  | 'Honeywell Scanner';

export type AssetCategory = StandardAssetCategory | string;

export const DEFAULT_ASSET_CATEGORIES: string[] = [
  'Laptop',
  'Keyboard / Mouse',
  'Headset',
  'Monitor',
  'Phone',
  'Honeywell Scanner',
];

export const ASSET_CATEGORIES: string[] = DEFAULT_ASSET_CATEGORIES;

export const BRAND_CONSTRAINTS: Record<string, string[]> = {
  'Laptop': ['Lenovo'],
  'Monitor': ['Iiyama'],
  'Keyboard / Mouse': ['Logi'],
  'Phone': ['Iphone'],
  'Honeywell Scanner': ['Honeywell'],
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
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string; // User phone info requested
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
