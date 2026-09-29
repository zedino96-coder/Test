import { 
  Asset, 
  User, 
  AssetHistoryEvent, 
  DEFAULT_ASSET_CATEGORIES, 
  BRAND_CONSTRAINTS,
  ProductionProfile
} from '../types/inventory';
import { generateInitialAssets, INITIAL_USERS, INITIAL_PRODUCTION_PROFILES } from '../data/initialData';


const ASSETS_STORAGE_KEY = 'assettrack_assets_v3';
const USERS_STORAGE_KEY = 'assettrack_users_v3';
const HISTORY_STORAGE_KEY = 'assettrack_history_v3';
const CATEGORIES_STORAGE_KEY = 'assettrack_categories_v3';
const BRANDS_STORAGE_KEY = 'assettrack_brands_v3';
const PRODUCTION_STORAGE_KEY = 'assettrack_production_profiles_v1';

export function loadStoredAssets(): Asset[] {
  try {
    const raw = localStorage.getItem(ASSETS_STORAGE_KEY);
    if (!raw) {
      const { assets, history } = generateInitialAssets();
      saveAssets(assets);
      saveHistory(history);
      return assets;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const enhanced = parsed.map((a: Asset) => {
        if ((a.category === 'Honeywell Scanner' || a.brand === 'Honeywell') && !a.honeywellSpecs) {
          return {
            ...a,
            honeywellSpecs: {
              ipv6: 'fe80::e212:963e:fca6:6433',
              ipv4: '10.190.32.34',
              wifiMacNetwork: 'Wähle zum Ansehen ein gespeichertes Netzwerk aus',
              wifiMacDevice: 'c4:ef:da:76:eb:13',
              bluetoothMac: 'c4:ef:da:78:2b:13',
              secondBleMac: 'c4:ef:da:75:ab:10',
            },
          };
        }
        return a;
      });
      return enhanced;
    }
    const { assets, history } = generateInitialAssets();
    saveAssets(assets);
    saveHistory(history);
    return assets;
  } catch (err) {
    console.error('Error loading stored assets:', err);
    return generateInitialAssets().assets;
  }
}

export function saveAssets(assets: Asset[]): void {
  try {
    localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(assets));
  } catch (err) {
    console.error('Error saving assets to localStorage:', err);
  }
}

export function loadStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      saveUsers(INITIAL_USERS);
      return INITIAL_USERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    saveUsers(INITIAL_USERS);
    return INITIAL_USERS;
  } catch (err) {
    console.error('Error loading stored users:', err);
    return INITIAL_USERS;
  }
}

export function saveUsers(users: User[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving users to localStorage:', err);
  }
}

export function loadStoredHistory(): AssetHistoryEvent[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) {
      const { history } = generateInitialAssets();
      saveHistory(history);
      return history;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    const { history } = generateInitialAssets();
    saveHistory(history);
    return history;
  } catch (err) {
    console.error('Error loading stored history:', err);
    return [];
  }
}

export function saveHistory(history: AssetHistoryEvent[]): void {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (err) {
    console.error('Error saving history to localStorage:', err);
  }
}

export function loadStoredCategories(): string[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (!raw) {
      saveCategories(DEFAULT_ASSET_CATEGORIES);
      return DEFAULT_ASSET_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure all standard categories including Fixed Phone, Chip, Other are included
      const merged = Array.from(new Set([...DEFAULT_ASSET_CATEGORIES, ...parsed]));
      return merged;
    }
    return DEFAULT_ASSET_CATEGORIES;
  } catch (err) {
    return DEFAULT_ASSET_CATEGORIES;
  }
}

export function saveCategories(categories: string[]): void {
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  } catch (err) {
    console.error('Error saving categories:', err);
  }
}

export function loadStoredBrands(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(BRANDS_STORAGE_KEY);
    if (!raw) {
      saveBrands(BRAND_CONSTRAINTS);
      return BRAND_CONSTRAINTS;
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return { ...BRAND_CONSTRAINTS, ...parsed };
    }
    return BRAND_CONSTRAINTS;
  } catch (err) {
    return BRAND_CONSTRAINTS;
  }
}

export function saveBrands(brands: Record<string, string[]>): void {
  try {
    localStorage.setItem(BRANDS_STORAGE_KEY, JSON.stringify(brands));
  } catch (err) {
    console.error('Error saving brands:', err);
  }
}

export function loadStoredProductionProfiles(): ProductionProfile[] {
  try {
    const raw = localStorage.getItem(PRODUCTION_STORAGE_KEY);
    if (!raw) {
      saveProductionProfiles(INITIAL_PRODUCTION_PROFILES);
      return INITIAL_PRODUCTION_PROFILES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    saveProductionProfiles(INITIAL_PRODUCTION_PROFILES);
    return INITIAL_PRODUCTION_PROFILES;
  } catch (err) {
    console.error('Error loading production profiles:', err);
    return INITIAL_PRODUCTION_PROFILES;
  }
}

export function saveProductionProfiles(profiles: ProductionProfile[]): void {
  try {
    localStorage.setItem(PRODUCTION_STORAGE_KEY, JSON.stringify(profiles));
  } catch (err) {
    console.error('Error saving production profiles:', err);
  }
}

export function resetToFactorySimulation(): { 
  assets: Asset[]; 
  users: User[]; 
  history: AssetHistoryEvent[]; 
  productionProfiles: ProductionProfile[] 
} {
  localStorage.removeItem(ASSETS_STORAGE_KEY);
  localStorage.removeItem(USERS_STORAGE_KEY);
  localStorage.removeItem(HISTORY_STORAGE_KEY);
  localStorage.removeItem(CATEGORIES_STORAGE_KEY);
  localStorage.removeItem(BRANDS_STORAGE_KEY);
  localStorage.removeItem(PRODUCTION_STORAGE_KEY);

  const { assets, history } = generateInitialAssets();
  const users = INITIAL_USERS;
  const productionProfiles = INITIAL_PRODUCTION_PROFILES;

  saveAssets(assets);
  saveUsers(users);
  saveHistory(history);
  saveCategories(DEFAULT_ASSET_CATEGORIES);
  saveBrands(BRAND_CONSTRAINTS);
  saveProductionProfiles(productionProfiles);

  return { assets, users, history, productionProfiles };
}
