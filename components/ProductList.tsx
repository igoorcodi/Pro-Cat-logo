
import React, { useState, useMemo } from 'react';
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
  X,
  ImageOff,
  Hash,
  ChevronUp
} from 'lucide-react';
import { Product } from '../types';
import WhatsAppModal from './WhatsAppModal';

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string | number) => void;
  onDuplicate: (product: Product) => void;
}

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'newest' | 'id-asc' | 'id-desc';
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

  const categories = useMemo(() => ['all', ...new Set(products.map(p => p.category).filter(Boolean))], [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter(p => {
      const name = p.name || '';
      const sku = p.sku || '';
      const id = String(p.id || '');
      const category = p.category || '';
      const search = searchTerm.toLowerCase();
      
      const matchesSearch = 
        name.toLowerCase().includes(search) || 
        sku.toLowerCase().includes(search) || 
        id.toLowerCase().includes(search);
        
      const matchesCategory = categoryFilter === 'all' || category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc': return (a.name || '').localeCompare(b.name || '');
        case 'name-desc': return (b.name || '').localeCompare(a.name || '');
        case 'price-asc': return (a.price || 0) - (b.price || 0);
        case 'price-desc': return (b.price || 0) - (a.price || 0);
        case 'id-asc': {
          const idA = typeof a.id === 'number' ? a.id : parseInt(String(a.id)) || 0;
          const idB = typeof b.id === 'number' ? b.id : parseInt(String(b.id)) || 0;
          return idA - idB;
        }
        case 'id-desc': {
          const idA = typeof a.id === 'number' ? a.id : parseInt(String(a.id)) || 0;
          const idB = typeof b.id === 'number' ? b.id : parseInt(String(b.id)) || 0;
          return idB - idA;
        }
        case 'newest': return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default: return 0;
      }
    });
    return result;
  }, [products, searchTerm, categoryFilter, sortBy]);

  const handleToggleIdSort = () => {
    if (sortBy === 'id-asc') {
      setSortBy('id-desc');
    } else {
      setSortBy('id-asc');
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome, SKU ou Código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-50 outline-none shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="bg-white border border-slate-200 rounded-2xl p-1 flex shadow-sm shrink-0">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}><LayoutGrid size={18} /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}><List size={18} /></button>
          </div>

          <div className="relative flex-1 md:flex-none">
            <button onClick={() => { setIsFilterOpen(!isFilterOpen); setIsSortOpen(false); }} className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-sm ${categoryFilter !== 'all' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'}`}>
              <Filter size={16} /> Filtros
            </button>
            {isFilterOpen && (
              <div className="absolute top-full right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Categoria</label>
                <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setIsFilterOpen(false); }} className="w-full p-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none">
                  {categories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? 'Todas' : cat}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="relative flex-1 md:flex-none">
            <button onClick={() => { setIsSortOpen(!isSortOpen); setIsFilterOpen(false); }} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 shadow-sm">
              <ArrowUpDown size={16} /> Ordenar
            </button>
            {isSortOpen && (
              <div className="absolute top-full right-0 mt-3 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50">
                <SortItem active={sortBy === 'newest'} onClick={() => {setSortBy('newest'); setIsSortOpen(false);}} label="Recentes" />
                <SortItem active={sortBy === 'price-asc'} onClick={() => {setSortBy('price-asc'); setIsSortOpen(false);}} label="Menor Preço" />
                <SortItem active={sortBy === 'price-desc'} onClick={() => {setSortBy('price-desc'); setIsSortOpen(false);}} label="Maior Preço" />
                <SortItem active={sortBy === 'id-asc'} onClick={() => {setSortBy('id-asc'); setIsSortOpen(false);}} label="Código (Menor)" />
                <SortItem active={sortBy === 'id-desc'} onClick={() => {setSortBy('id-desc'); setIsSortOpen(false);}} label="Código (Maior)" />
              </div>
            )}
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {filteredAndSortedProducts.map(product => (
            <div key={product.id} onClick={() => onEdit(product)} className="group bg-white rounded-[1.25rem] border border-slate-100 transition-all hover:shadow-lg overflow-hidden cursor-pointer flex flex-col h-full">
              <div className="aspect-square overflow-hidden bg-slate-50 relative shrink-0">
                {product.images && product.images.length > 0 ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-300 gap-1 p-2 text-center">
                    <ImageOff size={24} strokeWidth={1.5} />
                    <span className="text-[8px] font-black uppercase tracking-widest leading-tight">Sem Imagem</span>
                  </div>
                )}
                
                <div className="absolute top-1.5 left-1.5 flex flex-col gap-0.5 pointer-events-none">
                  <span className="bg-slate-900/80 backdrop-blur-md text-white text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md">
                    #{String(product.id).substring(0, 5)}
                  </span>
                  {product.sku && (
                    <span className="bg-indigo-600/80 backdrop-blur-md text-white text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md">
                      {product.sku}
                    </span>
                  )}
                </div>

                <div className="absolute bottom-1.5 right-1.5 flex gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 transform lg:translate-y-1 lg:group-hover:translate-y-0">
                   <button onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); setIsShareModalOpen(true); }} className="p-1.5 bg-white/95 backdrop-blur-sm text-emerald-600 rounded-lg shadow-md border border-slate-100 active:scale-90 transition-transform"><Smartphone size={14}/></button>
                   <button onClick={(e) => { e.stopPropagation(); onDuplicate(product); }} className="p-1.5 bg-white/95 backdrop-blur-sm text-indigo-600 rounded-lg shadow-md border border-slate-100 active:scale-90 transition-transform"><Copy size={14}/></button>
                </div>
              </div>
              <div className="p-3 flex flex-col flex-1">
                <div className="mb-2 flex-1">
                  <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest line-clamp-1">{product.category || 'Geral'}</span>
                  <h4 className="font-bold text-slate-800 text-xs leading-snug line-clamp-2 mt-0.5">{product.name}</h4>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                  <p className="text-sm font-black text-indigo-600 tracking-tight">R$ {(product.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(product.id); }} className="p-1 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={12}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Mobile List View (Hidden on MD) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredAndSortedProducts.map(product => (
              <div key={product.id} onClick={() => onEdit(product)} className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center gap-3 active:scale-[0.98] transition-all">
                <div className="w-16 h-16 rounded-xl bg-slate-50 overflow-hidden shrink-0 border border-slate-100 flex items-center justify-center">
                   {product.images && product.images.length > 0 ? (
                      <img src={product.images[0]} className="w-full h-full object-cover" alt="" />
                   ) : (
                      <ImageOff size={20} className="text-slate-300" />
                   )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black text-slate-400 uppercase bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">#{String(product.id).substring(0, 5)}</span>
                    <span className="text-[8px] font-black text-indigo-400 uppercase truncate">{product.category || 'Geral'}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-xs truncate mt-0.5">{product.name}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <p className="font-black text-indigo-600 text-[11px]">R$ {(product.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${product.stock <= 10 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {product.stock} un.
                    </span>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onDelete(product.id); }} className="p-2 text-slate-300 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Desktop Table View (Hidden on Mobile) */}
          <div className="hidden md:block bg-white rounded-[1.5rem] border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-4 text-left">
                      <button 
                        onClick={handleToggleIdSort}
                        className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors group"
                      >
                        Código
                        <div className="flex flex-col">
                          <ChevronUp size={10} className={`-mb-0.5 transition-opacity ${sortBy === 'id-asc' ? 'opacity-100 text-indigo-600' : 'opacity-30 group-hover:opacity-60'}`} />
                          <ChevronDown size={10} className={`transition-opacity ${sortBy === 'id-desc' ? 'opacity-100 text-indigo-600' : 'opacity-30 group-hover:opacity-60'}`} />
                        </div>
                      </button>
                    </th>
                    <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Produto</th>
                    <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU</th>
                    <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Estoque</th>
                    <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Preço</th>
                    <th className="px-4 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredAndSortedProducts.map(product => (
                    <tr key={product.id} onClick={() => onEdit(product)} className="hover:bg-slate-50 transition-all cursor-pointer">
                      <td className="px-4 py-3">
                        <span className="font-mono text-[10px] font-black text-slate-400">#{product.id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {product.images && product.images.length > 0 ? (
                            <img src={product.images[0]} className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                              <ImageOff size={14} />
                            </div>
                          )}
                          <span className="font-bold text-slate-800 text-sm truncate max-w-[200px]">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200">
                          {product.sku || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-slate-600">{product.stock || 0} un.</td>
                      <td className="px-4 py-3 font-black text-indigo-600 text-xs">R$ {(product.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={(e) => { e.stopPropagation(); onEdit(product); }} className="p-1.5 text-slate-400 hover:text-indigo-600"><Edit2 size={14}/></button>
                          <button onClick={(e) => { e.stopPropagation(); onDelete(product.id); }} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {isShareModalOpen && selectedProduct && <WhatsAppModal product={selectedProduct} onClose={() => setIsShareModalOpen(false)} />}
    </div>
  );
};

const SortItem: React.FC<{ active: boolean, onClick: () => void, label: string }> = ({ active, onClick, label }) => (
  <button onClick={onClick} className={`w-full text-left px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}>{label}</button>
);

export default ProductList;
