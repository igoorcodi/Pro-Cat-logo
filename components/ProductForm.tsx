
import React, { useState, useMemo, useRef } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Eye, 
  Save, 
  ArrowLeft,
  Package,
  Tags,
  Layout,
  AlertTriangle
} from 'lucide-react';
import { Product, Category } from '../types';

interface ProductFormProps {
  initialData?: Product;
  categories: Category[];
  isClone?: boolean;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, categories, isClone, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Product>>(initialData || {
    name: '',
    description: '',
    price: 0,
    sku: '',
    stock: 0,
    status: 'active',
    category: '',
    categoryId: '',
    subcategoryId: '',
    tags: [],
    images: ['https://picsum.photos/seed/newproduct/600/600']
  });

  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCategory = useMemo(() => {
    return categories.find(c => c.id === formData.categoryId);
  }, [categories, formData.categoryId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      onSave({
        ...formData,
        id: (isClone ? Math.random().toString(36).substr(2, 9) : (initialData?.id || Math.random().toString(36).substr(2, 9))),
        createdAt: initialData?.createdAt || new Date().toISOString()
      } as Product);
      setIsSaving(false);
    }, 800);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificar limite de 5 imagens
    if ((formData.images?.length || 0) >= 5) {
      alert("Limite máximo de 5 imagens atingido.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), base64]
      }));
    };
    reader.readAsDataURL(file);
    
    // Resetar input para permitir selecionar a mesma imagem novamente se for apagada
    e.target.value = '';
  };

  const addTag = () => {
    if (tagInput && !formData.tags?.includes(tagInput)) {
      setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput] }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tag) }));
  };

  const handleCategoryChange = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    setFormData(prev => ({
      ...prev,
      categoryId: catId,
      category: cat ? cat.name : '',
      subcategoryId: '' // Reseta a subcategoria ao trocar a categoria pai
    }));
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in slide-in-from-right-4 duration-500">
      {isClone && (
        <div className="mb-8 p-6 bg-amber-50 border-2 border-amber-200 rounded-[2rem] flex flex-col sm:flex-row items-center gap-4 animate-in slide-in-from-top-4 duration-500">
          <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200 shrink-0">
            <AlertTriangle size={30} />
          </div>
          <div className="text-center sm:text-left">
            <h4 className="text-lg font-black text-amber-900 uppercase tracking-tight">Produto Clonado com Sucesso!</h4>
            <p className="text-sm font-bold text-amber-700">Por favor, revise e edite o nome, SKU e preço antes de salvar.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onCancel}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition-colors"
        >
          <ArrowLeft size={20} />
          Voltar para Lista
        </button>
        <h2 className="text-2xl font-bold text-slate-800">
          {isClone ? 'Revisar Cópia' : initialData ? 'Editar Produto' : 'Adicionar Novo Produto'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info Section */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6 text-slate-800">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Plus size={18} />
            </div>
            <h3 className="font-bold text-lg">Informações Básicas</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-semibold text-slate-700">Nome do Produto*</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none ${isClone ? 'border-amber-300 ring-2 ring-amber-50' : 'border-slate-200'}`}
                placeholder="Ex: Tênis Esportivo Pro"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <label className="text-sm font-semibold text-slate-700">Descrição</label>
              <textarea 
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all resize-none outline-none"
                placeholder="Detalhes sobre o produto, materiais, tamanhos..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Preço (R$)*</label>
              <input 
                required
                type="number" 
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none ${isClone ? 'border-amber-300 ring-2 ring-amber-50' : 'border-slate-200'}`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">SKU / Código Único</label>
              <input 
                type="text" 
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none ${isClone ? 'border-amber-300 ring-2 ring-amber-50' : 'border-slate-200'}`}
                placeholder="EX: TNS-001-BLK"
              />
            </div>
          </div>
        </section>

        {/* Inventory & Category Section */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6 text-slate-800">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Package size={18} />
            </div>
            <h3 className="font-bold text-lg">Estoque e Categorização</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Quantidade em Estoque</label>
              <input 
                type="number" 
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Tags size={14} className="text-indigo-600" /> Categoria Principal*
              </label>
              <select 
                required
                value={formData.categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none cursor-pointer"
              >
                <option value="">Selecionar...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="text-[10px] text-amber-600 font-bold uppercase mt-1">Nenhuma categoria cadastrada!</p>
              )}
            </div>

            {selectedCategory && selectedCategory.subcategories.length > 0 && (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Layout size={14} className="text-emerald-600" /> Subcategoria
                </label>
                <select 
                  value={formData.subcategoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, subcategoryId: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none cursor-pointer"
                >
                  <option value="">Nenhuma</option>
                  {selectedCategory.subcategories.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2 col-span-2">
              <label className="text-sm font-semibold text-slate-700">Tags / Etiquetas</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  placeholder="Ex: Novo, Oferta, Verão"
                />
                <button 
                  type="button"
                  onClick={addTag}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all"
                >
                  Adicionar
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags?.map(tag => (
                  <span key={tag} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-indigo-900">
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Images Section */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6 text-slate-800">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <ImageIcon size={18} />
            </div>
            <h3 className="font-bold text-lg">Imagens (Até 5)</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {formData.images?.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, images: prev.images?.filter((_, i) => i !== idx) }))}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {(formData.images?.length || 0) < 5 && (
              <div className="relative aspect-square">
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-full border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-400 transition-all bg-slate-50"
                >
                  <Upload size={24} />
                  <span className="text-[10px] font-bold mt-2 uppercase">Upload</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Actions */}
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 flex items-center justify-end gap-4 z-40">
          <button 
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 text-slate-600 font-bold hover:text-slate-900"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-10 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={20} />
            )}
            {isClone ? 'Criar Cópia' : 'Salvar Produto'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
