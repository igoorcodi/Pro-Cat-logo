
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, ChevronRight, Tags, Layout, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { Category, Subcategory, User } from '../types';
import { supabase } from '../supabase';

interface CategoryManagerProps {
  categories: Category[];
  user: User;
  onRefresh: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, user, onRefresh }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  // Garante que haja uma categoria selecionada se a lista mudar
  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  // Função robusta para formatar mensagens de erro do Supabase
  const formatErrorMessage = (error: any): string => {
    if (!error) return 'Erro desconhecido';
    
    // Se for uma string, retorna direto
    if (typeof error === 'string') return error;
    
    // Tenta extrair propriedades comuns de erro do Supabase/PostgreSQL
    const message = error.message || error.msg || error.error_description;
    const details = error.details || error.hint;
    const code = error.code;

    if (message) {
      let fullMsg = `Mensagem: ${message}`;
      if (code) fullMsg += ` (Código: ${code})`;
      if (details) fullMsg += `\nDetalhes: ${details}`;
      
      // Tratamento específico para erro de chave estrangeira (sessão expirada/banco resetado)
      if (code === '23503') {
        fullMsg = "⚠️ ERRO DE VÍNCULO: O usuário da sua sessão não existe mais no banco (isso ocorre se o banco foi resetado).\n\nAção necessária: Saia (Logout) e entre novamente.";
      }
      return fullMsg;
    }

    // Se falhar em encontrar propriedades conhecidas, tenta stringify de forma segura
    try {
      const stringified = JSON.stringify(error, null, 2);
      return stringified === '{}' ? String(error) : stringified;
    } catch (e) {
      return "Erro complexo: " + String(error);
    }
  };

  const addCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    if (!user || !user.id) {
        alert("Sessão inválida. Por favor, saia e faça login novamente.");
        return;
    }
    
    setIsBusy(true);
    
    try {
      const { error } = await supabase
        .from('categories')
        .insert({ 
          name,
          user_id: user.id 
        });

      if (error) {
        console.error('Erro Supabase (Categoria):', error);
        alert(`Erro ao adicionar categoria:\n${formatErrorMessage(error)}`);
      } else {
        setNewCategoryName('');
        onRefresh(); 
      }
    } catch (err: any) {
      console.error('Exceção capturada:', err);
      alert(`Erro inesperado:\n${err.message || 'Falha na comunicação com o servidor'}`);
    } finally {
      setIsBusy(false);
    }
  };

  const removeCategory = async (id: string) => {
    if (!window.confirm('Excluir esta categoria e todas as suas subcategorias?')) return;
    
    setIsBusy(true);
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      
      if (error) {
        alert(`Erro ao excluir categoria:\n${formatErrorMessage(error)}`);
      } else {
        if (selectedCategoryId === id) setSelectedCategoryId(null);
        onRefresh();
      }
    } catch (err: any) {
      alert(`Erro inesperado ao excluir:\n${err.message}`);
    } finally {
      setIsBusy(false);
    }
  };

  const addSubcategory = async () => {
    const name = newSubcategoryName.trim();
    if (!name || !selectedCategoryId) return;
    if (!user || !user.id) return;
    
    setIsBusy(true);
    try {
      const { error } = await supabase.from('subcategories').insert({ 
        name,
        category_id: selectedCategoryId,
        user_id: user.id
      });

      if (error) {
        alert(`Erro ao adicionar subcategoria:\n${formatErrorMessage(error)}`);
      } else {
        setNewSubcategoryName('');
        onRefresh();
      }
    } catch (err: any) {
      alert(`Erro inesperado na subcategoria:\n${err.message}`);
    } finally {
      setIsBusy(false);
    }
  };

  const removeSubcategory = async (subId: string) => {
    setIsBusy(true);
    try {
      const { error } = await supabase.from('subcategories').delete().eq('id', subId);
      if (error) {
        alert(`Erro ao excluir subcategoria:\n${formatErrorMessage(error)}`);
      } else {
        onRefresh();
      }
    } catch (err: any) {
      alert(`Erro inesperado:\n${err.message}`);
    } finally {
      setIsBusy(false);
    }
  };

  const startEditing = (id: string, currentName: string) => {
    setEditingId(id);
    setEditValue(currentName);
  };

  const saveEdit = async (type: 'cat' | 'sub') => {
    const value = editValue.trim();
    if (!editingId || !value) {
      setEditingId(null);
      return;
    }
    
    setIsBusy(true);
    try {
      const table = type === 'cat' ? 'categories' : 'subcategories';
      const { error } = await supabase.from(table).update({ name: value }).eq('id', editingId);
      
      if (error) {
        alert(`Erro ao atualizar:\n${formatErrorMessage(error)}`);
      } else {
        setEditingId(null);
        onRefresh();
      }
    } catch (err: any) {
      alert(`Erro inesperado ao salvar:\n${err.message}`);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 relative pb-20">
      {isBusy && (
        <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-[2px] z-[100] flex items-center justify-center pointer-events-none">
          <div className="bg-white p-6 rounded-3xl shadow-2xl flex items-center gap-4 border border-slate-100 animate-in zoom-in-95">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
            <span className="font-black text-slate-800 uppercase tracking-widest text-xs">Processando...</span>
          </div>
        </div>
      )}

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
                placeholder="Nome da categoria..."
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addCategory()}
                className="flex-1 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold"
              />
              <button 
                onClick={addCategory}
                disabled={isBusy || !newCategoryName.trim()}
                className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 active:scale-95"
              >
                <Plus size={24} />
              </button>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {categories.map(cat => (
                <div 
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`group flex items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedCategoryId === cat.id 
                      ? 'bg-indigo-50 border-indigo-500 shadow-md ring-1 ring-indigo-500/20' 
                      : 'bg-white border-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {editingId === cat.id ? (
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <input 
                          autoFocus
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyPress={e => e.key === 'Enter' && saveEdit('cat')}
                          className="bg-white border border-indigo-300 rounded-xl px-3 py-2 w-full font-bold outline-none"
                        />
                        <button onClick={() => saveEdit('cat')} className="p-2 text-emerald-600"><Check size={20}/></button>
                        <button onClick={() => setEditingId(null)} className="p-2 text-slate-400"><X size={20}/></button>
                      </div>
                    ) : (
                      <>
                        <span className="font-black text-slate-800 truncate">{cat.name}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded-md ml-2">
                          {cat.subcategories?.length || 0}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); startEditing(cat.id, cat.name); }}
                      className="p-2 text-slate-400 hover:text-indigo-600"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeCategory(cat.id); }}
                      className="p-2 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                    <ChevronRight size={18} className="text-slate-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subcategories List */}
        <div className="lg:w-1/2 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Layout className="text-emerald-600" size={24} /> Subcategorias
              </h3>
            </div>

            {selectedCategory ? (
              <>
                <div className="flex gap-2 mb-6">
                  <input 
                    type="text" 
                    placeholder={`Nova subcategoria em ${selectedCategory.name}...`}
                    value={newSubcategoryName}
                    onChange={e => setNewSubcategoryName(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && addSubcategory()}
                    className="flex-1 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold"
                  />
                  <button 
                    onClick={addSubcategory}
                    disabled={isBusy || !newSubcategoryName.trim()}
                    className="p-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 disabled:opacity-50 active:scale-95"
                  >
                    <Plus size={24} />
                  </button>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {selectedCategory.subcategories?.map(sub => (
                    <div 
                      key={sub.id}
                      className="group flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-slate-200 transition-all"
                    >
                      <div className="flex-1">
                        {editingId === sub.id ? (
                          <div className="flex items-center gap-1">
                            <input 
                              autoFocus
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              onKeyPress={e => e.key === 'Enter' && saveEdit('sub')}
                              className="bg-white border border-indigo-300 rounded-xl px-3 py-2 w-full font-bold outline-none"
                            />
                            <button onClick={() => saveEdit('sub')} className="p-2 text-emerald-600"><Check size={20}/></button>
                            <button onClick={() => setEditingId(null)} className="p-2 text-slate-400"><X size={20}/></button>
                          </div>
                        ) : (
                          <span className="font-bold text-slate-700">{sub.name}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => startEditing(sub.id, sub.name)}
                          className="p-2 text-slate-400 hover:text-indigo-600"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => removeSubcategory(sub.id)}
                          className="p-2 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!selectedCategory.subcategories || selectedCategory.subcategories.length === 0) && (
                    <div className="py-10 text-center text-slate-400 italic">
                      Nenhuma subcategoria nesta categoria.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">
                <AlertCircle size={48} className="opacity-20 mb-4" />
                <p className="font-black uppercase tracking-widest text-xs">Selecione uma categoria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
