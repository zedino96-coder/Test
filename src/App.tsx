import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { StockOverview } from './components/StockOverview';
import { EquipmentView } from './components/EquipmentView';
import { UserManagementView } from './components/UserManagementView';
import { PhoneDirectoryView } from './components/PhoneDirectoryView';
import { AssetsTableView } from './components/AssetsTableView';
import { AuditLogView } from './components/AuditLogView';
import { UserAssetCardModal } from './components/UserAssetCardModal';
import { DeviceHistoryModal } from './components/DeviceHistoryModal';
import { EditHistoryEventModal } from './components/EditHistoryEventModal';
import { CategoryBrandManagerModal } from './components/CategoryBrandManagerModal';
import { AssignModal } from './components/AssignModal';
import { NewAssetModal } from './components/NewAssetModal';
import { UploadModal } from './components/UploadModal';
import { UserUploadModal } from './components/UserUploadModal';
import { ReturnConfirmModal } from './components/ReturnConfirmModal';
import { EquipmentDetailModal } from './components/EquipmentDetailModal';
import { ProductionView } from './components/ProductionView';
import { 
  loadStoredAssets, 
  saveAssets, 
  loadStoredUsers, 
  saveUsers, 
  loadStoredHistory,
  saveHistory,
  loadStoredCategories,
  saveCategories,
  loadStoredBrands,
  saveBrands,
  loadStoredProductionProfiles,
  saveProductionProfiles,
  resetToFactorySimulation 
} from './utils/storage';
import { 
  Asset, 
  User, 
  AssetCategory, 
  CategoryStockSummary, 
  AssetHistoryEvent,
  BRAND_CONSTRAINTS,
  ProductionProfile
} from './types/inventory';
import { CheckCircle2, RotateCcw } from 'lucide-react';

export default function App() {
  const [assets, setAssets] = useState<Asset[]>(() => loadStoredAssets());
  const [users, setUsers] = useState<User[]>(() => loadStoredUsers());
  const [history, setHistory] = useState<AssetHistoryEvent[]>(() => loadStoredHistory());
  const [categories, setCategories] = useState<string[]>(() => loadStoredCategories());
  const [brands, setBrands] = useState<Record<string, string[]>>(() => loadStoredBrands());
  const [productionProfiles, setProductionProfiles] = useState<ProductionProfile[]>(() => loadStoredProductionProfiles());

  // Active Tab: overview, equipment, production, users_manage (directory), phones (phone numbers), inventory, history (audit)
  const [activeTab, setActiveTab] = useState<'overview' | 'equipment' | 'production' | 'users_manage' | 'phones' | 'inventory' | 'history'>('overview');
  
  // Honeywell scanner assets filter for production lines
  const honeywellAssets = useMemo(() => {
    return assets.filter((a) => a.category === 'Honeywell Scanner' || a.brand === 'Honeywell');
  }, [assets]);
  
  // Modals
  const [selectedUserForModal, setSelectedUserForModal] = useState<User | null>(null);
  const [selectedAssetForHistory, setSelectedAssetForHistory] = useState<Asset | null>(null);
  const [selectedAssetForCard, setSelectedAssetForCard] = useState<Asset | null>(null);
  const [historyEventToEdit, setHistoryEventToEdit] = useState<AssetHistoryEvent | null>(null);
  const [isEditHistoryModalOpen, setIsEditHistoryModalOpen] = useState(false);
  const [isCategoryBrandModalOpen, setIsCategoryBrandModalOpen] = useState(false);

  const [assignModalConfig, setAssignModalConfig] = useState<{
    isOpen: boolean;
    defaultCategory?: string;
    defaultUserId?: string;
    defaultAssetId?: string;
  }>({ isOpen: false });

  const [isNewAssetModalOpen, setIsNewAssetModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadModalCategory, setUploadModalCategory] = useState<AssetCategory | undefined>(undefined);
  const [isUserUploadModalOpen, setIsUserUploadModalOpen] = useState(false);
  const [returnConfirmTarget, setReturnConfirmTarget] = useState<{
    asset: Asset;
    user: User;
  } | null>(null);

  // Category filter passthrough to master table
  const [tableCategoryFilter, setTableCategoryFilter] = useState<string>('ALL');

  // Flash toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Derive summaries dynamically across current categories
  const summaries: CategoryStockSummary[] = useMemo(() => {
    return categories.map((cat) => {
      const catAssets = assets.filter((a) => a.category === cat);
      const assigned = catAssets.filter((a) => a.status === 'assigned');
      const inStock = catAssets.filter((a) => a.status === 'in_stock');
      const maintenance = catAssets.filter((a) => a.status === 'maintenance');
      const retired = catAssets.filter((a) => a.status === 'retired');

      return {
        category: cat,
        total: catAssets.length,
        assigned: assigned.length,
        inStock: inStock.length,
        maintenance: maintenance.length,
        retired: retired.length,
        assignedUsers: assigned.map((a) => ({
          userId: a.assignedUserId || '',
          userName: a.assignedUserName || 'Unknown',
          serialNumber: a.serialNumber,
          model: `${a.brand} ${a.model}`,
        })),
      };
    });
  }, [categories, assets]);

  // Operations: Assign Asset with History Log
  const handleAssign = (assetId: string, userId: string, date: string, notes?: string) => {
    const user = users.find((u) => u.id === userId);
    const asset = assets.find((a) => a.id === assetId);
    if (!user || !asset) return;

    const nextAssets = assets.map((a) => {
      if (a.id === assetId) {
        return {
          ...a,
          status: 'assigned' as const,
          lifecycleStatus: 'deployed' as const,
          assignedUserId: user.id,
          assignedUserName: user.name,
          assignedDate: date,
          location: user.deskLocation,
          notes: notes ? `${a.notes ? a.notes + ' · ' : ''}${notes}` : a.notes,
          updatedAt: new Date().toISOString(),
        };
      }
      return a;
    });

    // Create handover history log event
    const newEvent: AssetHistoryEvent = {
      id: `evt-handover-${Date.now()}`,
      assetId: asset.id,
      serialNumber: asset.serialNumber,
      assetModel: `${asset.brand} ${asset.model}`,
      category: asset.category,
      eventType: 'handover',
      date: date || new Date().toISOString().split('T')[0],
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
      custodian: 'IT Operations Admin',
      notes: notes || `Handover completed to ${user.name} (${user.role}).`,
      conditionAtEvent: asset.condition,
      deskLocation: user.deskLocation,
      updatedAt: new Date().toISOString(),
    };

    const nextHistory = [newEvent, ...history];

    setAssets(nextAssets);
    setHistory(nextHistory);
    saveAssets(nextAssets);
    saveHistory(nextHistory);
    showToast(`Successfully assigned ${asset.brand} (${asset.serialNumber}) to ${user.name}`);
  };

  // Operations: Confirmed Return of Asset from User Directory
  const handleConfirmReturn = (assetId: string, returnDate: string, condition: string, notes: string) => {
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return;

    const prevUserId = asset.assignedUserId;
    const prevUserName = asset.assignedUserName;
    const prevUser = users.find((u) => u.id === prevUserId);

    const nextAssets = assets.map((a) => {
      if (a.id === assetId) {
        return {
          ...a,
          status: 'in_stock' as const,
          lifecycleStatus: 'in_stock' as const,
          assignedUserId: null,
          assignedUserName: null,
          assignedDate: null,
          condition: (condition as any) || a.condition,
          location: 'Central IT Stockroom',
          updatedAt: new Date().toISOString(),
        };
      }
      return a;
    });

    // Create formal return history log event
    const newEvent: AssetHistoryEvent = {
      id: `evt-return-${Date.now()}`,
      assetId: asset.id,
      serialNumber: asset.serialNumber,
      assetModel: `${asset.brand} ${asset.model}`,
      category: asset.category,
      eventType: 'return',
      date: returnDate || new Date().toISOString().split('T')[0],
      userId: prevUserId,
      userName: prevUserName,
      userEmail: prevUser?.email,
      userPhone: prevUser?.phone,
      custodian: 'IT Operations Admin',
      notes: notes || `Returned from ${prevUserName || 'employee'} to Central IT Stockroom. Processed via User Directory return authorization.`,
      conditionAtEvent: (condition as any) || asset.condition,
      deskLocation: 'Central IT Stockroom',
      updatedAt: new Date().toISOString(),
    };

    const nextHistory = [newEvent, ...history];

    setAssets(nextAssets);
    setHistory(nextHistory);
    saveAssets(nextAssets);
    saveHistory(nextHistory);
    setReturnConfirmTarget(null);
    showToast(`Confirmed return: ${asset.brand} (${asset.serialNumber}) returned to Central Stock`);
  };

  // Operations: Unassign Asset with Return History Log (Fallback)
  const handleUnassign = (assetId: string) => {
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return;

    const prevUserId = asset.assignedUserId;
    const prevUserName = asset.assignedUserName;
    const prevUser = users.find((u) => u.id === prevUserId);

    const nextAssets = assets.map((a) => {
      if (a.id === assetId) {
        return {
          ...a,
          status: 'in_stock' as const,
          lifecycleStatus: 'in_stock' as const,
          assignedUserId: null,
          assignedUserName: null,
          assignedDate: null,
          location: 'Central IT Stockroom',
          updatedAt: new Date().toISOString(),
        };
      }
      return a;
    });

    // Create return history log event
    const newEvent: AssetHistoryEvent = {
      id: `evt-return-${Date.now()}`,
      assetId: asset.id,
      serialNumber: asset.serialNumber,
      assetModel: `${asset.brand} ${asset.model}`,
      category: asset.category,
      eventType: 'return',
      date: new Date().toISOString().split('T')[0],
      userId: prevUserId,
      userName: prevUserName,
      userEmail: prevUser?.email,
      userPhone: prevUser?.phone,
      custodian: 'IT Operations Admin',
      notes: `Returned from ${prevUserName || 'employee'} to Central IT Stockroom. Checked and cleaned.`,
      conditionAtEvent: asset.condition,
      deskLocation: 'Central IT Stockroom',
      updatedAt: new Date().toISOString(),
    };

    const nextHistory = [newEvent, ...history];

    setAssets(nextAssets);
    setHistory(nextHistory);
    saveAssets(nextAssets);
    saveHistory(nextHistory);
    showToast(`Returned device (${asset.serialNumber}) to Central IT Stockroom`);
  };

  // Operations: Add New Asset
  const handleAddAsset = (newAssetData: Omit<Asset, 'id' | 'updatedAt'>) => {
    const snKey = newAssetData.serialNumber.toLowerCase().trim();
    if (assets.some((a) => a.serialNumber.toLowerCase().trim() === snKey)) {
      showToast(`Cannot register: Serial number "${newAssetData.serialNumber}" already exists in inventory!`);
      return;
    }

    const newAsset: Asset = {
      ...newAssetData,
      id: `ast-custom-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };

    const registrationEvent: AssetHistoryEvent = {
      id: `evt-reg-${Date.now()}`,
      assetId: newAsset.id,
      serialNumber: newAsset.serialNumber,
      assetModel: `${newAsset.brand} ${newAsset.model}`,
      category: newAsset.category,
      eventType: 'registration',
      date: new Date().toISOString().split('T')[0],
      userId: newAsset.assignedUserId,
      userName: newAsset.assignedUserName,
      custodian: 'IT Procurement Admin',
      notes: `Asset procured and entered into ITAM inventory. Condition: ${newAsset.condition}. Tag: ${newAsset.assetTag}`,
      conditionAtEvent: newAsset.condition,
      deskLocation: newAsset.location,
      updatedAt: new Date().toISOString(),
    };

    const nextAssets = [newAsset, ...assets];
    const nextHistory = [registrationEvent, ...history];

    setAssets(nextAssets);
    setHistory(nextHistory);
    saveAssets(nextAssets);
    saveHistory(nextHistory);
    showToast(`Registered new device: ${newAsset.brand} ${newAsset.model} (SN: ${newAsset.serialNumber})`);
  };

  // Operations: Update Asset Specifications (e.g. Honeywell network specs, notes)
  const handleUpdateAsset = (updatedAsset: Asset) => {
    const nextAssets = assets.map((a) => (a.id === updatedAsset.id ? updatedAsset : a));
    setAssets(nextAssets);
    saveAssets(nextAssets);
    showToast(`Saved specifications for ${updatedAsset.brand} ${updatedAsset.model}`);
  };

  // Operations: Update Production Profiles
  const handleUpdateProductionProfiles = (updated: ProductionProfile[]) => {
    setProductionProfiles(updated);
    saveProductionProfiles(updated);
    showToast('Saved production floor profile changes');
  };

  // Operations: Batch Import Hardware Assets via CSV (Skips any existing serial number)
  const handleImportAssets = (newAssets: Asset[]) => {
    const existingSnSet = new Set(assets.map((a) => a.serialNumber.toLowerCase().trim()));
    const strictlyNewAssets = newAssets.filter(
      (a) => a.serialNumber && !existingSnSet.has(a.serialNumber.toLowerCase().trim())
    );

    if (strictlyNewAssets.length === 0) {
      showToast('No hardware imported: all serial numbers already exist in inventory.');
      return;
    }

    const nextAssets = [...strictlyNewAssets, ...assets];
    setAssets(nextAssets);
    saveAssets(nextAssets);
    showToast(`Successfully imported ${strictlyNewAssets.length} new hardware asset(s) via CSV!`);
  };

  // Operations: Batch Import / Mass Update Users via CSV (User Directory)
  const handleImportUsers = (newUsers: User[]) => {
    const nextUsers = [...users];
    let addedCount = 0;
    let updatedCount = 0;

    newUsers.forEach((imported) => {
      const emailKey = imported.email.toLowerCase().trim();
      const existingIndex = nextUsers.findIndex((u) => u.email.toLowerCase().trim() === emailKey);
      if (existingIndex >= 0) {
        nextUsers[existingIndex] = {
          ...nextUsers[existingIndex],
          name: imported.name || nextUsers[existingIndex].name,
          department: imported.department || nextUsers[existingIndex].department,
          role: imported.role || nextUsers[existingIndex].role,
          deskLocation: imported.deskLocation || nextUsers[existingIndex].deskLocation,
          notes: imported.notes || nextUsers[existingIndex].notes,
          joinedDate: imported.joinedDate || nextUsers[existingIndex].joinedDate,
        };
        updatedCount++;
      } else {
        nextUsers.push(imported);
        addedCount++;
      }
    });

    setUsers(nextUsers);
    saveUsers(nextUsers);
    showToast(`Mass upload processed: ${addedCount} added, ${updatedCount} updated.`);
  };

  // User Management Handlers (Create, Edit, Delete)
  const handleCreateUser = (newUserData: Omit<User, 'id' | 'avatarColor'>) => {
    const colors = ['#2563eb', '#059669', '#7c3aed', '#db2777', '#d97706', '#0891b2', '#e11d48', '#4f46e5'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newUser: User = {
      ...newUserData,
      id: `usr-${Date.now()}`,
      avatarColor: randomColor,
    };

    const nextUsers = [...users, newUser];
    setUsers(nextUsers);
    saveUsers(nextUsers);
    showToast(`Created new user profile: ${newUser.name} (${newUser.email})`);
  };

  const handleUpdateUser = (updatedUser: User) => {
    const nextUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    
    // Also sync assignedUserName if name was changed
    const nextAssets = assets.map((a) => {
      if (a.assignedUserId === updatedUser.id) {
        return {
          ...a,
          assignedUserName: updatedUser.name,
          location: updatedUser.deskLocation,
        };
      }
      return a;
    });

    setUsers(nextUsers);
    setAssets(nextAssets);
    saveUsers(nextUsers);
    saveAssets(nextAssets);
    showToast(`Updated user details for ${updatedUser.name}`);
  };

  const handleDeleteUser = (userId: string) => {
    const heldAssets = assets.filter((a) => a.assignedUserId === userId);
    if (heldAssets.length > 0) {
      alert(`Cannot delete user: They currently hold ${heldAssets.length} assigned hardware assets. Please unassign their equipment first.`);
      return;
    }

    const targetUser = users.find((u) => u.id === userId);
    const nextUsers = users.filter((u) => u.id !== userId);
    setUsers(nextUsers);
    saveUsers(nextUsers);
    showToast(`Deleted user profile: ${targetUser?.name || userId}`);
  };

  // History Event Handlers (Editable for the past!)
  const handleSaveHistoryEvent = (eventData: AssetHistoryEvent, isNew: boolean) => {
    let nextHistory: AssetHistoryEvent[];

    if (isNew) {
      const newEvent: AssetHistoryEvent = {
        ...eventData,
        id: `evt-retro-${Date.now()}`,
        isPastCorrection: true,
        updatedAt: new Date().toISOString(),
      };
      nextHistory = [newEvent, ...history];
      showToast(`Recorded historical handover event for date: ${newEvent.date}`);
    } else {
      nextHistory = history.map((h) => 
        h.id === eventData.id 
          ? { ...eventData, isPastCorrection: true, updatedAt: new Date().toISOString() } 
          : h
      );
      showToast(`Updated historical handover record (Date: ${eventData.date})`);
    }

    // Sort newest first
    nextHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setHistory(nextHistory);
    saveHistory(nextHistory);
    setIsEditHistoryModalOpen(false);
    setHistoryEventToEdit(null);
  };

  const handleDeleteHistoryEvent = (eventId: string) => {
    const nextHistory = history.filter((h) => h.id !== eventId);
    setHistory(nextHistory);
    saveHistory(nextHistory);
    showToast('Deleted audit log record');
  };

  // Category & Brand Standards Management Handlers
  const handleAddCategory = (catName: string, initialBrand?: string) => {
    if (categories.includes(catName)) {
      alert(`Category "${catName}" already exists.`);
      return;
    }
    const nextCats = [...categories, catName];
    setCategories(nextCats);
    saveCategories(nextCats);

    if (initialBrand) {
      const nextBrands = {
        ...brands,
        [catName]: [initialBrand],
      };
      setBrands(nextBrands);
      saveBrands(nextBrands);
    }
    showToast(`Added new hardware category: ${catName}`);
  };

  const handleAddBrandToCategory = (catName: string, brandName: string) => {
    const existing = brands[catName] || [];
    if (existing.includes(brandName)) {
      alert(`Brand "${brandName}" already standard for ${catName}.`);
      return;
    }
    const nextBrands = {
      ...brands,
      [catName]: [...existing, brandName],
    };
    setBrands(nextBrands);
    saveBrands(nextBrands);
    showToast(`Added brand standard "${brandName}" to ${catName}`);
  };

  const handleDeleteCategory = (catName: string) => {
    const inUse = assets.some((a) => a.category === catName);
    if (inUse) {
      alert(`Cannot delete category "${catName}" because assets currently belong to this category.`);
      return;
    }
    const nextCats = categories.filter((c) => c !== catName);
    setCategories(nextCats);
    saveCategories(nextCats);
    showToast(`Removed category: ${catName}`);
  };

  // Reset to Baseline
  const handleResetSimulation = () => {
    const { assets: resetAssets, users: resetUsers, history: resetHistory, productionProfiles: resetProd } = resetToFactorySimulation();
    setAssets(resetAssets);
    setUsers(resetUsers);
    setHistory(resetHistory);
    setCategories(loadStoredCategories());
    setBrands(loadStoredBrands());
    setProductionProfiles(resetProd);
    showToast('Reset inventory baseline including Fixed Phone, Chip, Other and Production Floor profiles');
  };

  const handleFilterByCategoryInInventory = (cat: string) => {
    setTableCategoryFilter(cat);
    setActiveTab('inventory');
  };

  // Device history trigger
  const handleOpenDeviceHistoryBySN = (serialNumber: string) => {
    const asset = assets.find((a) => a.serialNumber.toLowerCase() === serialNumber.toLowerCase());
    if (asset) {
      setSelectedAssetForHistory(asset);
    } else {
      // Find from history
      const hist = history.find((h) => h.serialNumber.toLowerCase() === serialNumber.toLowerCase());
      if (hist) {
        // Construct temporary asset representation for modal
        setSelectedAssetForHistory({
          id: hist.assetId,
          category: hist.category,
          brand: hist.assetModel.split(' ')[0],
          model: hist.assetModel,
          serialNumber: hist.serialNumber,
          assetTag: `AST-${hist.category.slice(0, 3).toUpperCase()}-ARCHIVED`,
          status: 'retired',
          lifecycleStatus: 'retired',
          assignedUserId: hist.userId,
          assignedUserName: hist.userName,
          assignedDate: hist.date,
          location: hist.deskLocation || 'Archive / Past Custody',
          condition: hist.conditionAtEvent || 'Good',
          notes: 'Archived equipment record',
          updatedAt: hist.updatedAt,
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        assets={assets}
        users={users}
        history={history}
        summaries={summaries}
        categories={categories}
        brands={brands}
        productionCount={productionProfiles.length}
        onOpenNewAssetModal={() => setIsNewAssetModalOpen(true)}
        onOpenCategoryBrandModal={() => setIsCategoryBrandModalOpen(true)}
        onResetSimulation={handleResetSimulation}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Tab 1: Overview & Stock */}
        {activeTab === 'overview' && (
          <StockOverview
            assets={assets}
            users={users}
            summaries={summaries}
            onOpenUserModal={(u) => setSelectedUserForModal(u)}
            onOpenAssignModal={(cat, uId, aId) =>
              setAssignModalConfig({
                isOpen: true,
                defaultCategory: cat,
                defaultUserId: uId,
                defaultAssetId: aId,
              })
            }
            onFilterByCategoryInInventory={handleFilterByCategoryInInventory}
          />
        )}

        {/* Tab 2: User Directory & Custodian Management */}
        {activeTab === 'users_manage' && (
          <UserManagementView
            users={users}
            assets={assets}
            history={history}
            onOpenUserModal={(u) => setSelectedUserForModal(u)}
            onCreateUser={handleCreateUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onOpenUserUploadModal={() => setIsUserUploadModalOpen(true)}
          />
        )}

        {/* Tab: Dedicated Phone Numbers Tab (Directory List) */}
        {activeTab === 'phones' && (
          <PhoneDirectoryView
            users={users}
            onOpenUserModal={(u) => setSelectedUserForModal(u)}
          />
        )}

        {/* Tab 4: Master Inventory Table (SysAid ITAM Style) */}
        {activeTab === 'inventory' && (
          <AssetsTableView
            assets={assets}
            users={users}
            categories={categories}
            onOpenUserModal={(u) => setSelectedUserForModal(u)}
            onOpenDeviceHistory={(asset) => setSelectedAssetForHistory(asset)}
            onOpenAssignModal={(cat, uId, aId) =>
              setAssignModalConfig({
                isOpen: true,
                defaultCategory: cat,
                defaultUserId: uId,
                defaultAssetId: aId,
              })
            }
            onOpenNewAssetModal={() => setIsNewAssetModalOpen(true)}
            onOpenUploadModal={() => {
              setUploadModalCategory(undefined);
              setIsUploadModalOpen(true);
            }}
            initialCategoryFilter={tableCategoryFilter}
          />
        )}

        {/* Tab 5: Equipment Fleet View (Lists all hardware with category & status filters) */}
        {activeTab === 'equipment' && (
          <EquipmentView
            assets={assets}
            users={users}
            categories={categories}
            summaries={summaries}
            history={history}
            onOpenUserModal={(u) => setSelectedUserForModal(u)}
            onOpenAssignModal={(cat, uId, aId) =>
              setAssignModalConfig({
                isOpen: true,
                defaultCategory: cat,
                defaultUserId: uId,
                defaultAssetId: aId,
              })
            }
            onOpenDeviceHistory={(asset) => setSelectedAssetForHistory(asset)}
            onOpenUploadModal={(cat) => {
              setUploadModalCategory(cat);
              setIsUploadModalOpen(true);
            }}
            onOpenNewAssetModal={() => setIsNewAssetModalOpen(true)}
            onRequestReturn={(asset, user) => {
              setReturnConfirmTarget({ asset, user });
            }}
            onOpenCategoryBrandModal={() => setIsCategoryBrandModalOpen(true)}
            onUpdateAsset={handleUpdateAsset}
          />
        )}

        {/* Tab: Production Floor & Manufacturing Lines (10 profiles with Honeywell hardware) */}
        {activeTab === 'production' && (
          <ProductionView
            productionProfiles={productionProfiles}
            honeywellAssets={honeywellAssets}
            onUpdateProfiles={handleUpdateProductionProfiles}
            onOpenEquipmentCard={(asset) => setSelectedAssetForCard(asset)}
          />
        )}

        {/* Tab 6: Audit & Handover Logs (Special Tab with Filtering & Past Editing) */}
        {activeTab === 'history' && (
          <AuditLogView
            history={history}
            users={users}
            assets={assets}
            onOpenEditEvent={(event) => {
              setHistoryEventToEdit(event);
              setIsEditHistoryModalOpen(true);
            }}
            onOpenAddPastEvent={() => {
              setHistoryEventToEdit(null);
              setIsEditHistoryModalOpen(true);
            }}
            onDeleteEvent={handleDeleteHistoryEvent}
            onOpenDeviceHistory={handleOpenDeviceHistoryBySN}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-800">AssetTrack Pro</span>
            <span aria-hidden="true">·</span>
            <span>{assets.length} Total Hardware Assets</span>
            <span aria-hidden="true">·</span>
            <span>Lenovo Laptops</span>
            <span aria-hidden="true">·</span>
            <span>Iiyama Monitors</span>
            <span aria-hidden="true">·</span>
            <span>Logi Keyboard/Mice</span>
            <span aria-hidden="true">·</span>
            <span>iPhones</span>
            <span aria-hidden="true">·</span>
            <span>Honeywell Handheld Scanners</span>
          </div>
          <div className="flex items-center gap-4 text-2xs text-slate-400">
            <span>SysAid ITAM Standard Barcodes Verified</span>
            <button
              type="button"
              onClick={handleResetSimulation}
              className="text-slate-500 hover:text-slate-800 underline"
            >
              Reset Simulation Baseline
            </button>
          </div>
        </div>
      </footer>

      {/* User Equipment Card / Handover Slip Modal */}
      {selectedUserForModal && (
        <UserAssetCardModal
          user={selectedUserForModal}
          users={users}
          assets={assets}
          history={history}
          onClose={() => setSelectedUserForModal(null)}
          onSelectUser={(u) => setSelectedUserForModal(u)}
          onUnassignAsset={handleUnassign}
          onRequestReturn={(asset, user) => {
            setReturnConfirmTarget({ asset, user });
          }}
          onOpenAssignModal={(cat, uId) => {
            setAssignModalConfig({
              isOpen: true,
              defaultCategory: cat,
              defaultUserId: uId,
            });
          }}
          onOpenEditEvent={(evt) => {
            setHistoryEventToEdit(evt);
            setIsEditHistoryModalOpen(true);
          }}
          onOpenEquipmentModal={(asset) => setSelectedAssetForCard(asset)}
        />
      )}

      {/* Global Equipment Detail Card Modal */}
      {selectedAssetForCard && (
        <EquipmentDetailModal
          asset={selectedAssetForCard}
          users={users}
          history={history}
          onClose={() => setSelectedAssetForCard(null)}
          onOpenUserModal={(u) => {
            setSelectedAssetForCard(null);
            setSelectedUserForModal(u);
          }}
          onOpenAssignModal={(cat, uId, aId) => {
            setSelectedAssetForCard(null);
            setAssignModalConfig({
              isOpen: true,
              defaultCategory: cat,
              defaultUserId: uId,
              defaultAssetId: aId,
            });
          }}
          onRequestReturn={(asset, user) => {
            setSelectedAssetForCard(null);
            setReturnConfirmTarget({ asset, user });
          }}
          onUpdateAsset={handleUpdateAsset}
          onOpenDeviceHistory={(asset) => {
            setSelectedAssetForCard(null);
            setSelectedAssetForHistory(asset);
          }}
        />
      )}

      {/* Return Confirmation Modal (Exclusive User Directory Protocol) */}
      {returnConfirmTarget && (
        <ReturnConfirmModal
          isOpen={!!returnConfirmTarget}
          asset={returnConfirmTarget.asset}
          user={returnConfirmTarget.user}
          onClose={() => setReturnConfirmTarget(null)}
          onConfirmReturn={handleConfirmReturn}
        />
      )}

      {/* Device History & Lifecycle Modal */}
      {selectedAssetForHistory && (
        <DeviceHistoryModal
          asset={selectedAssetForHistory}
          history={history}
          onClose={() => setSelectedAssetForHistory(null)}
          onOpenEditEvent={(evt) => {
            setHistoryEventToEdit(evt);
            setIsEditHistoryModalOpen(true);
          }}
          onAddEventForDevice={(asset) => {
            setHistoryEventToEdit(null);
            setIsEditHistoryModalOpen(true);
          }}
        />
      )}

      {/* Past History Event Editor / Retroactive Handover Logger */}
      <EditHistoryEventModal
        isOpen={isEditHistoryModalOpen}
        onClose={() => {
          setIsEditHistoryModalOpen(false);
          setHistoryEventToEdit(null);
        }}
        eventToEdit={historyEventToEdit}
        users={users}
        assets={assets}
        onSaveEvent={handleSaveHistoryEvent}
      />

      {/* Category & Brand Standards Manager Modal */}
      <CategoryBrandManagerModal
        isOpen={isCategoryBrandModalOpen}
        onClose={() => setIsCategoryBrandModalOpen(false)}
        categories={categories}
        brands={brands}
        onAddCategory={handleAddCategory}
        onAddBrandToCategory={handleAddBrandToCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      {/* Hardware Assignment Modal */}
      <AssignModal
        isOpen={assignModalConfig.isOpen}
        onClose={() => setAssignModalConfig({ isOpen: false })}
        assets={assets}
        users={users}
        defaultCategory={assignModalConfig.defaultCategory}
        defaultUserId={assignModalConfig.defaultUserId}
        defaultAssetId={assignModalConfig.defaultAssetId}
        onAssign={handleAssign}
      />

      {/* Add New Hardware Asset Modal */}
      <NewAssetModal
        isOpen={isNewAssetModalOpen}
        onClose={() => setIsNewAssetModalOpen(false)}
        users={users}
        categories={categories}
        brands={brands}
        onAddAsset={handleAddAsset}
      />

      {/* Batch CSV Upload & Template Modal (Master Inventory & Stock Categories) */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setUploadModalCategory(undefined);
        }}
        users={users}
        existingAssets={assets}
        onImportAssets={handleImportAssets}
        initialCategory={uploadModalCategory}
      />

      {/* User Directory CSV Upload Modal (Employees) */}
      <UserUploadModal
        isOpen={isUserUploadModalOpen}
        onClose={() => setIsUserUploadModalOpen(false)}
        existingUsers={users}
        onImportUsers={handleImportUsers}
      />

    </div>
  );
}
