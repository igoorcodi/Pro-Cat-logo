
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Copy, 
  Share2, 
  Smartphone,
  CheckCircle2,
  Package,
  LayoutGrid,
  List,
  ArrowUpDown,
  X
} from 'lucide-react';
import { Product } from '../types';
import WhatsAppModal from './WhatsAppModal';

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onDuplicate: (product: Product) => void;
}

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'newest';
type ViewMode = 'grid' | 'list';

const ProductList: React.FC<ProductListProps> = ({ products, onEdit, onDelete, onDuplicate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<{min: string, max: string}>({min: '', max: ''});

  const categories = useMemo(() => {
    return ['all', ...new Set(products.map(p => p.category))];
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      
      const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0;
      const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;
      const matchesPrice = p.price >= minPrice && p.price <= maxPrice;

      return matchesSearch && matchesCategory && matchesPrice;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default: return 0;
      }
    });

    return result;
  }, [products, searchTerm, categoryFilter, priceRange, sortBy]);

  const handleShare = (product: Product) => {
    setSelectedProduct(product);
    setIsShareModalOpen(true);
  };

  const resetFilters = () => {
    setCategoryFilter('all');
    setPriceRange({min: '', max: ''});
    setIsFilterOpen(false);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
        <div className="relative w-full xl:w-1/3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome, SKU ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-50 transition-all outline-none shadow-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="bg-white border border-slate-200 rounded-2xl p-1 flex shadow-sm">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grade"
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              title="Lista"
            >
              <List size={20} />
            </button>
          </div>

          <div className="relative flex-1 md:flex-none">
            <button 
              onClick={() => { setIsFilterOpen(!isFilterOpen); setIsSortOpen(false); }}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-sm ${
                categoryFilter !== 'all' || priceRange.min || priceRange.max
                ? 'bg-indigo-50 border-2 border-indigo-500 text-indigo-700'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Filter size={18} />
              Filtros
            </button>
            
            {isFilterOpen && (
              <div className="absolute top-full right-0 mt-3 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 z-50 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Filtros Avançados</h4>
                  <button onClick={() => setIsFilterOpen(false)} className="text-slate-400"><X size={16}/></button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Categoria</label>
                    <select 
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat === 'all' ? 'Todas as categorias' : cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={resetFilters} className="flex-1 py-3 text-xs font-black text-slate-400 uppercase hover:text-slate-600">Limpar</button>
                    <button onClick={() => setIsFilterOpen(false)} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-indigo-100">Aplicar</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative flex-1 md:flex-none">
            <button 
              onClick={() => { setIsSortOpen(!isSortOpen); setIsFilterOpen(false); }}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
              <ArrowUpDown size={18} />
              Ordenar
            </button>
            
            {isSortOpen && (
              <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-in zoom-in-95 duration-200">
                <SortItem active={sortBy === 'newest'} onClick={() => {setSortBy('newest'); setIsSortOpen(false);}} label="Mais Recentes" />
                <SortItem active={sortBy === 'price-asc'} onClick={() => {setSortBy('price-asc'); setIsSortOpen(false);}} label="Menor Preço" />
                <SortItem active={sortBy === 'price-desc'} onClick={() => {setSortBy('price-desc'); setIsSortOpen(false);}} label="Maior Preço" />
                <SortItem active={sortBy === 'name-asc'} onClick={() => {setSortBy('name-asc'); setIsSortOpen(false);}} label="Nome (A-Z)" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedProducts.map(product => (
            <div 
              key={product.id}
              onClick={() => onEdit(product)}
              className="group relative bg-white rounded-3xl border-2 border-slate-100 transition-all hover:shadow-2xl overflow-hidden cursor-pointer"
            >
              {/* Overlay Actions */}
              <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all flex flex-col gap-2 scale-90 group-hover:scale-100">
                <button 
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); onEdit(product); }}
                  className="p-3 bg-white text-slate-600 rounded-2xl shadow-xl hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleShare(product); }}
                  className="p-3 bg-white text-slate-600 rounded-2xl shadow-xl hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                >
                  <Smartphone size={18} />
                </button>
              </div>

              <div className="h-56 overflow-hidden bg-slate-50 relative">
                <img 
                  src={product.images[0] || 'https://via.placeholder.com/400'} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                />
                <div className="absolute bottom-4 left-4">
                  <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg backdrop-blur-md ${
                    product.stock > 10 ? 'bg-emerald-600/90 text-white' : 'bg-amber-600/90 text-white'
                  }`}>
                    {product.stock} em estoque
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{product.category}</span>
                  <span className="text-[10px] font-black text-slate-400 tracking-widest bg-slate-100 px-2 py-1 rounded-md uppercase">SKU: {product.sku || 'N/A'}</span>
                </div>
                <h4 className="font-black text-slate-800 text-lg leading-tight line-clamp-1">{product.name}</h4>
                <div className="flex items-center justify-between pt-2">
                  <p className="text-2xl font-black text-indigo-600 tracking-tight">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        e.preventDefault(); 
                        onDuplicate(product); 
                      }}
                      className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-indigo-600 hover:border-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center shadow-sm"
                      title="Duplicar"
                    >
                      <Copy size={18} />
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        e.preventDefault(); 
                        onDelete(product.id); 
                      }}
                      className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-red-500 hover:border-red-500 hover:bg-red-50 transition-all flex items-center justify-center shadow-sm"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View Mode */
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm animate-in slide-in-from-right-4 duration-500">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Produto</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Estoque</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Preço</th>
                  <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAndSortedProducts.map(product => (
                  <tr key={product.id} onClick={() => onEdit(product)} className="group hover:bg-slate-50/80 transition-all cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm shrink-0">
                          <img src={product.images[0] || 'https://via.placeholder.com/100'} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold text-slate-800 text-sm line-clamp-1">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-slate-400 font-bold">{product.sku || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-600">{product.stock} un.</td>
                    <td className="px-6 py-4">
                      <span className="font-black text-indigo-600 text-base">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <ActionIconButton onClick={(e) => { e.stopPropagation(); onEdit(product); }} icon={<Edit2 size={16} />} title="Editar" hoverColor="indigo" />
                        <ActionIconButton onClick={(e) => { e.stopPropagation(); onDelete(product.id); }} icon={<Trash2 size={16} />} title="Excluir" hoverColor="red" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredAndSortedProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-slate-400">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <Package size={48} className="opacity-20" />
          </div>
          <p className="text-xl font-black text-slate-800 uppercase tracking-widest">Nenhum produto</p>
          <p className="text-sm font-bold mt-2">Nenhum produto encontrado com os filtros atuais.</p>
        </div>
      )}

      {isShareModalOpen && selectedProduct && (
        <WhatsAppModal product={selectedProduct} onClose={() => setIsShareModalOpen(false)} />
      )}
    </div>
  );
};

const ActionIconButton: React.FC<{ onClick: (e: React.MouseEvent) => void, icon: React.ReactNode, title: string, hoverColor: string }> = ({ onClick, icon, title, hoverColor }) => {
  const colors: Record<string, string> = {
    indigo: 'hover:text-indigo-600 hover:bg-indigo-50 border-slate-100',
    red: 'hover:text-red-600 hover:bg-red-50 border-slate-100'
  };
  
  return (
    <button 
      onClick={onClick}
      className={`p-2.5 bg-white border text-slate-400 rounded-xl transition-all shadow-sm ${colors[hoverColor]}`}
      title={title}
    >
      {icon}
    </button>
  );
};

const SortItem: React.FC<{ active: boolean, onClick: () => void, label: string }> = ({ active, onClick, label }) => (
  <button 
    onClick={onClick}
    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${
      active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'
    }`}
  >
    {label}
  </button>
);

export default ProductList;
