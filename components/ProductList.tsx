
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
  ImageOff
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

  const categories = useMemo(() => ['all', ...new Set(products.map(p => p.category))], [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
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
  }, [products, searchTerm, categoryFilter, sortBy]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar produtos..."
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
              </div>
            )}
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {filteredAndSortedProducts.map(product => (
            <div key={product.id} onClick={() => onEdit(product)} className="group bg-white rounded-[1.5rem] border border-slate-100 transition-all hover:shadow-xl overflow-hidden cursor-pointer flex flex-col">
              <div className="aspect-square overflow-hidden bg-slate-50 relative shrink-0">
                {product.images && product.images.length > 0 ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-2 p-4 text-center">
                    <ImageOff size={32} strokeWidth={1.5} />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-tight">Sem Imagem<br/>Clique p/ inserir</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 transform lg:translate-y-2 lg:group-hover:translate-y-0">
                   <button onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); setIsShareModalOpen(true); }} className="p-2.5 bg-white/95 backdrop-blur-sm text-emerald-600 rounded-xl shadow-lg border border-slate-100 active:scale-90 transition-transform"><Smartphone size={18}/></button>
                   <button onClick={(e) => { e.stopPropagation(); onDuplicate(product); }} className="p-2.5 bg-white/95 backdrop-blur-sm text-indigo-600 rounded-xl shadow-lg border border-slate-100 active:scale-90 transition-transform"><Copy size={18}/></button>
                </div>
              </div>
              <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{product.category}</span>
                  <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-tight line-clamp-2 mt-1">{product.name}</h4>
                </div>
                <div className="flex items-center justify-between pt-3">
                  <p className="text-base sm:text-xl font-black text-indigo-600 tracking-tight">R$ {product.price.toLocaleString('pt-BR')}</p>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(product.id); }} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[1.5rem] border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Produto</th>
                  <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Estoque</th>
                  <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Preço</th>
                  <th className="px-4 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAndSortedProducts.map(product => (
                  <tr key={product.id} onClick={() => onEdit(product)} className="hover:bg-slate-50 transition-all cursor-pointer">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.images && product.images.length > 0 ? (
                          <img src={product.images[0]} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                            <ImageOff size={14} />
                          </div>
                        )}
                        <span className="font-bold text-slate-800 text-xs line-clamp-1">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-slate-600">{product.stock} un.</td>
                    <td className="px-4 py-3 font-black text-indigo-600 text-xs">R$ {product.price.toLocaleString('pt-BR')}</td>
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
      )}

      {isShareModalOpen && selectedProduct && <WhatsAppModal product={selectedProduct} onClose={() => setIsShareModalOpen(false)} />}
    </div>
  );
};

const SortItem: React.FC<{ active: boolean, onClick: () => void, label: string }> = ({ active, onClick, label }) => (
  <button onClick={onClick} className={`w-full text-left px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}>{label}</button>
);

export default ProductList;
