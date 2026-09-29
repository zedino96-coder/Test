import React, { useState } from 'react';
import { X, Plus, Layers, Shield, Check, Trash2 } from 'lucide-react';

interface CategoryBrandManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  brands: Record<string, string[]>;
  onAddCategory: (categoryName: string, initialBrand?: string) => void;
  onAddBrandToCategory: (categoryName: string, brandName: string) => void;
  onDeleteCategory?: (categoryName: string) => void;
}

export const CategoryBrandManagerModal: React.FC<CategoryBrandManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  brands,
  onAddCategory,
  onAddBrandToCategory,
  onDeleteCategory,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [newCatBrand, setNewCatBrand] = useState('');
  const [selectedCatForBrand, setSelectedCatForBrand] = useState(categories[0] || '');
  const [newBrandName, setNewBrandName] = useState('');

  if (!isOpen) return null;

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onAddCategory(newCatName.trim(), newCatBrand.trim() || undefined);
    setNewCatName('');
    setNewCatBrand('');
  };

  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatForBrand || !newBrandName.trim()) return;
    onAddBrandToCategory(selectedCatForBrand, newBrandName.trim());
    setNewBrandName('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-sm text-slate-900">
              Hardware Categories &amp; Brand Standards Manager
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Current Category & Brand Configuration */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Active Corporate Categories &amp; Permitted Brands
            </h4>
            <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {categories.map((cat) => {
                const catBrands = brands[cat] || [];
                return (
                  <div key={cat} className="p-3 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <span className="font-semibold text-xs text-slate-900">{cat}</span>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {catBrands.length > 0 ? (
                          catBrands.map((b) => (
                            <span 
                              key={b} 
                              className="text-2xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-medium border border-slate-200"
                            >
                              {b}
                            </span>
                          ))
                        ) : (
                          <span className="text-2xs text-slate-400 italic">Any brand permitted</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form 1: Add New Category */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              Add New Hardware Category
            </h4>
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-3xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Tablet, Docking Station"
                    className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-300 rounded text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-3xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Default Brand (Optional)
                  </label>
                  <input
                    type="text"
                    value={newCatBrand}
                    onChange={(e) => setNewCatBrand(e.target.value)}
                    placeholder="e.g. Apple, Dell, Lenovo"
                    className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-300 rounded text-slate-900"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
              >
                Add Category
              </button>
            </form>
          </div>

          {/* Form 2: Add Brand to an existing Category */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              Add Approved Brand to Existing Category
            </h4>
            <form onSubmit={handleAddBrand} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-3xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Select Category
                  </label>
                  <select
                    value={selectedCatForBrand}
                    onChange={(e) => setSelectedCatForBrand(e.target.value)}
                    className="w-full py-1.5 px-2 text-xs bg-white border border-slate-300 rounded text-slate-900"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-3xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Brand Name to Add *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    placeholder="e.g. Zebra, Dell, Samsung"
                    className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-300 rounded text-slate-900"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded transition-colors"
              >
                Add Approved Brand
              </button>
            </form>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded font-medium text-xs hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
