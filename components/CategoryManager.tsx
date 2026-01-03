
import React, { useState } from 'react';
import { Plus, Trash2, Edit2, ChevronRight, Tags, Layout, Check, X } from 'lucide-react';
import { Category, Subcategory } from '../types';

interface CategoryManagerProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, setCategories }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(categories[0]?.id || null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCat: Category = {
      id: Math.random().toString(36).substr(2, 9),
      name: newCategoryName,
      subcategories: []
    };
    setCategories(prev => [...prev, newCat]);
    setNewCategoryName('');
    setSelectedCategoryId(newCat.id);
  };

  const removeCategory = (id: string) => {
    if (window.confirm('Excluir esta categoria e todas as suas subcategorias?')) {
      setCategories(prev => prev.filter(c => c.id !== id));
      if (selectedCategoryId === id) setSelectedCategoryId(null);
    }
  };

  const addSubcategory = () => {
    if (!newSubcategoryName.trim() || !selectedCategoryId) return;
    const newSub: Subcategory = {
      id: Math.random().toString(36).substr(2, 9),
      name: newSubcategoryName
    };
    setCategories(prev => prev.map(c => 
      c.id === selectedCategoryId 
        ? { ...c, subcategories: [...c.subcategories, newSub] }
        : c
    ));
    setNewSubcategoryName('');
  };

  const removeSubcategory = (subId: string) => {
    if (!selectedCategoryId) return;
    setCategories(prev => prev.map(c => 
      c.id === selectedCategoryId 
        ? { ...c, subcategories: c.subcategories.filter(s => s.id !== subId) }
        : c
    ));
  };

  const startEditing = (id: string, currentName: string) => {
    setEditingId(id);
    setEditValue(currentName);
  };

  const saveEdit = (type: 'cat' | 'sub') => {
    if (!editingId || !editValue.trim()) return;
    
    setCategories(prev => prev.map(c => {
      if (type === 'cat' && c.id === editingId) {
        return { ...c, name: editValue };
      }
      if (type === 'sub') {
        return {
          ...c,
          subcategories: c.subcategories.map(s => s.id === editingId ? { ...s, name: editValue } : s)
        };
      }
      return c;
    }));
    
    setEditingId(null);
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Categories List */}
        <div className="lg:w-1/2 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Tags className="text-indigo-600" size={24} /> Categorias
              </h3>
            </div>

            <div className="flex gap-2 mb-6">
              <input 
                type="text" 
                placeholder="Nova categoria..."
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addCategory()}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
              <button 
                onClick={addCategory}
                className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                <Plus size={24} />
              </button>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {categories.map(cat => (
                <div 
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`group flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedCategoryId === cat.id 
                      ? 'bg-indigo-50 border-indigo-200 shadow-sm ring-1 ring-indigo-200' 
                      : 'bg-white border-slate-100 hover:border-indigo-100'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {editingId === cat.id ? (
                      <input 
                        autoFocus
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={() => saveEdit('cat')}
                        onKeyPress={e => e.key === 'Enter' && saveEdit('cat')}
                        className="bg-white border border-indigo-300 rounded px-2 py-1 w-full"
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <span className="font-bold text-slate-700">{cat.name}</span>
                    )}
                    <span className="text-xs text-slate-400 font-medium">({cat.subcategories.length})</span>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); startEditing(cat.id, cat.name); }}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeCategory(cat.id); }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                    <ChevronRight size={20} className="text-slate-300" />
                  </div>
                </div>
              ))}
              {categories.length === 0 && (
                <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                  Nenhuma categoria criada.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subcategories List */}
        <div className="lg:w-1/2">
          {selectedCategory ? (
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm animate-in slide-in-from-right-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Layout className="text-emerald-600" size={24} /> Subcategorias
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    Vinculadas a: <span className="text-indigo-600 font-bold">{selectedCategory.name}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  placeholder="Nova subcategoria..."
                  value={newSubcategoryName}
                  onChange={e => setNewSubcategoryName(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && addSubcategory()}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
                <button 
                  onClick={addSubcategory}
                  className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                >
                  <Plus size={24} />
                </button>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {selectedCategory.subcategories.map(sub => (
                  <div 
                    key={sub.id}
                    className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:border-emerald-200 hover:shadow-sm transition-all"
                  >
                    {editingId === sub.id ? (
                      <input 
                        autoFocus
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={() => saveEdit('sub')}
                        onKeyPress={e => e.key === 'Enter' && saveEdit('sub')}
                        className="bg-white border border-emerald-300 rounded px-2 py-1 flex-1 mr-2"
                      />
                    ) : (
                      <span className="font-bold text-slate-700 flex-1">{sub.name}</span>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => startEditing(sub.id, sub.name)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => removeSubcategory(sub.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {selectedCategory.subcategories.length === 0 && (
                  <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                    Adicione subcategorias para melhor organização.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 bg-white rounded-[2rem] border border-dashed border-slate-200 text-slate-400">
              <Tags size={48} className="mb-4 opacity-10" />
              <p className="text-center font-medium">Selecione uma categoria para gerenciar suas subcategorias.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
