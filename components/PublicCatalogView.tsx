
import React, { useState, useMemo } from 'react';
import { Catalog, Product } from '../types';
import { 
  ShoppingCart, 
  MessageCircle, 
  Search, 
  X, 
  Info,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Package,
  AlertTriangle,
  Home
} from 'lucide-react';

interface PublicCatalogViewProps {
  catalog: Catalog | null;
  products: Product[];
  seller?: { name: string; phone?: string } | null;
  isLoading?: boolean;
  error?: string | null;
  onBack?: () => void;
}

const PublicCatalogView: React.FC<PublicCatalogViewProps> = ({ catalog, products, seller, isLoading, error, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const categories = useMemo(() => {
    const cats = ['Todos', ...new Set(products.map(p => p.category))];
    return cats;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleOrder = (product: Product) => {
    const sellerName = seller?.name || 'Vendedor';
    const sellerPhone = seller?.phone?.replace(/\D/g, '') || '';
    const catalogName = catalog?.name || 'Catálogo Digital';
    
    const message = encodeURIComponent(
      `Olá, *${sellerName}*! Tenho interesse no produto:\n\n*${product.name}*\nRef (SKU): ${product.sku || 'N/A'}\nPreço: R$ ${product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\nVi no catálogo: *${catalogName}*`
    );
    
    const url = sellerPhone 
      ? `https://wa.me/${sellerPhone}?text=${message}`
      : `https://wa.me/?text=${message}`;
      
    window.open(url, '_blank');
  };

  // Renderização de Erro (Catálogo não encontrado)
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl shadow-red-100/50">
          <AlertTriangle size={48} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Ops! Vitrine indisponível.</h1>
        <p className="text-slate-500 max-w-md mb-10 font-medium leading-relaxed">
          {error}
        </p>
        <button 
          onClick={() => window.location.href = window.location.origin}
          className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Home size={20} /> Ir para o Início
        </button>
      </div>
    );
  }

  // Fallback enquanto ainda não carregou o catálogo base
  if (!catalog && !isLoading) {
      return null;
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans selection:bg-indigo-100">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            {onBack && (
                <button onClick={onBack} className="p-2 mr-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all" title="Voltar">
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
            )}
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <ShoppingCart size={18} />
            </div>
            <span className="font-bold text-slate-800 truncate max-w-[120px] sm:max-w-none">{catalog?.name}</span>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar no catálogo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
          </div>
        </div>
      </header>

      <div className="relative h-64 sm:h-80 overflow-hidden bg-slate-200">
        {catalog?.coverImage && (
          <img 
              src={catalog.coverImage} 
              alt={catalog.name} 
              className="w-full h-full object-cover" 
          />
        )}
        <div className="absolute inset-0 bg-slate-900/40 flex flex-col items-center justify-center text-center p-6 backdrop-brightness-75">
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-2 drop-shadow-md">{catalog?.name}</h1>
          <p className="text-white/90 max-w-xl text-sm sm:text-base font-medium drop-shadow-sm line-clamp-2">
            {catalog?.description || 'Confira nossos produtos exclusivos.'}
          </p>
          {seller && (
            <span className="mt-4 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] text-white font-black uppercase tracking-widest border border-white/20">
              Por {seller.name}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 min-w-max">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                selectedCategory === cat 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-bold text-sm uppercase tracking-widest">Carregando itens...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8 animate-in fade-in duration-700">
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                onClick={() => setViewingProduct(product)}
                className="bg-white rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-100 flex flex-col group"
              >
                <div className="aspect-square relative overflow-hidden bg-slate-50">
                  {product.images?.[0] ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200 bg-slate-100">
                      <Package size={48} />
                    </div>
                  )}
                </div>
                
                <div className="p-3 sm:p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base line-clamp-1 mb-1">{product.name}</h3>
                  <p className="text-indigo-600 font-black text-lg sm:text-xl">
                    R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <button className="mt-3 w-full py-2 bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white text-slate-500 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2">
                    Ver detalhes <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <Search size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">Nenhum produto encontrado neste filtro.</p>
          </div>
        )}
      </main>

      {viewingProduct && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div 
            className="bg-white w-full max-w-4xl rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col sm:flex-row max-h-[90vh] sm:max-h-[80vh] animate-in slide-in-from-bottom-10 duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full sm:w-1/2 bg-slate-100 relative h-72 sm:h-auto overflow-hidden">
              <img src={viewingProduct.images?.[0] || 'https://via.placeholder.com/800'} alt="" className="w-full h-full object-cover" />
              <button 
                onClick={() => setViewingProduct(null)}
                className="absolute top-4 left-4 p-2 bg-black/20 backdrop-blur-md rounded-full text-white sm:hidden"
              >
                <X size={24} />
              </button>
            </div>

            <div className="w-full sm:w-1/2 p-6 sm:p-10 flex flex-col overflow-y-auto custom-scrollbar">
              <div className="hidden sm:flex justify-end mb-4">
                <button onClick={() => setViewingProduct(null)} className="p-2 bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase rounded-md">
                    {viewingProduct.category}
                  </span>
                  {viewingProduct.sku && <span className="text-[10px] font-medium text-slate-400">REF: {viewingProduct.sku}</span>}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">{viewingProduct.name}</h2>
              </div>

              <div className="flex-1 space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Info size={14} /> Descrição
                  </h4>
                  <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{viewingProduct.description || 'Nenhuma descrição detalhada disponível.'}</p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-black text-slate-900">
                    R$ {viewingProduct.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <button 
                  onClick={() => handleOrder(viewingProduct)}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-emerald-100 active:scale-95"
                >
                  <MessageCircle size={24} />
                  Pedir no WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-20 py-12 text-center border-t border-slate-200 bg-white">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
            <ShoppingCart size={16} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Catálogo Pro &copy; 2025</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicCatalogView;
