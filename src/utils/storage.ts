import { Asset, User, AssetHistoryEvent, DEFAULT_ASSET_CATEGORIES, BRAND_CONSTRAINTS } from '../types/inventory';
import { generateInitialAssets, INITIAL_USERS } from '../data/initialData';

const ASSETS_STORAGE_KEY = 'assettrack_assets_v3';
const USERS_STORAGE_KEY = 'assettrack_users_v3';
const HISTORY_STORAGE_KEY = 'assettrack_history_v3';
const CATEGORIES_STORAGE_KEY = 'assettrack_categories_v3';
const BRANDS_STORAGE_KEY = 'assettrack_brands_v3';

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
      return parsed;
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
      return parsed;
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
      return parsed;
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

export function resetToFactorySimulation(): { assets: Asset[]; users: User[]; history: AssetHistoryEvent[] } {
  localStorage.removeItem(ASSETS_STORAGE_KEY);
  localStorage.removeItem(USERS_STORAGE_KEY);
  localStorage.removeItem(HISTORY_STORAGE_KEY);
  localStorage.removeItem(CATEGORIES_STORAGE_KEY);
  localStorage.removeItem(BRANDS_STORAGE_KEY);

  const { assets, history } = generateInitialAssets();
  const users = INITIAL_USERS;

  saveAssets(assets);
  saveUsers(users);
  saveHistory(history);
  saveCategories(DEFAULT_ASSET_CATEGORIES);
  saveBrands(BRAND_CONSTRAINTS);

  return { assets, users, history };
}
