
import React, { useState, useMemo } from 'react';
import { Catalog, Product } from '../types';
import { 
  Smartphone, 
  ShoppingCart, 
  MessageCircle, 
  Search, 
  X, 
  Info,
  Tag,
  ArrowRight,
  Filter
} from 'lucide-react';

interface PublicCatalogViewProps {
  catalog: Catalog;
  products: Product[];
}

const PublicCatalogView: React.FC<PublicCatalogViewProps> = ({ catalog, products }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // Categorias únicas dos produtos deste catálogo
  const categories = useMemo(() => {
    const cats = ['Todos', ...new Set(products.map(p => p.category))];
    return cats;
  }, [products]);

  // Filtragem em tempo real
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleOrder = (product: Product) => {
    const message = encodeURIComponent(
      `Olá! Tenho interesse no produto:\n\n*${product.name}*\nRef (SKU): ${product.sku}\nPreço: R$ ${product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\nVi no catálogo: ${catalog.name}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans selection:bg-indigo-100">
      {/* Top Banner & Search */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <ShoppingCart size={18} />
            </div>
            <span className="font-bold text-slate-800 truncate max-w-[120px] sm:max-w-none">{catalog.name}</span>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar no catálogo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <img src={catalog.coverImage} alt={catalog.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-slate-900/40 flex flex-col items-center justify-center text-center p-6 backdrop-brightness-75">
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-2 drop-shadow-md">{catalog.name}</h1>
          <p className="text-white/90 max-w-xl text-sm sm:text-base font-medium drop-shadow-sm">{catalog.description}</p>
        </div>
      </div>

      {/* Category Tabs */}
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

      {/* Product Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                onClick={() => setViewingProduct(product)}
                className="bg-white rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-100 flex flex-col group"
              >
                <div className="aspect-square relative overflow-hidden bg-slate-50">
                  <img 
                    src={product.images[0]} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  {product.stock <= 5 && product.stock > 0 && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500 text-white text-[8px] font-black uppercase rounded-md">
                      Últimas unidades
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
            <p className="text-slate-500 font-medium">Nenhum produto encontrado nesta categoria.</p>
          </div>
        )}
      </main>

      {/* Product Detail Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col sm:flex-row max-h-[90vh] sm:max-h-[80vh] animate-in slide-in-from-bottom-10 duration-500">
            
            {/* Image Side */}
            <div className="w-full sm:w-1/2 bg-slate-100 relative h-72 sm:h-auto">
              <img src={viewingProduct.images[0]} alt="" className="w-full h-full object-cover" />
              <button 
                onClick={() => setViewingProduct(null)}
                className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white sm:hidden"
              >
                <X size={24} />
              </button>
            </div>

            {/* Info Side */}
            <div className="w-full sm:w-1/2 p-6 sm:p-10 flex flex-col overflow-y-auto">
              <div className="hidden sm:flex justify-end mb-4">
                <button onClick={() => setViewingProduct(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase rounded-md">
                    {viewingProduct.category}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">REF: {viewingProduct.sku}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">{viewingProduct.name}</h2>
              </div>

              <div className="flex-1 space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Info size={14} /> Descrição
                  </h4>
                  <p className="text-slate-600 leading-relaxed">{viewingProduct.description}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {viewingProduct.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold flex items-center gap-1">
                      <Tag size={10} /> {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-black text-slate-900">
                    R$ {viewingProduct.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  {viewingProduct.stock > 0 ? (
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase">Disponível</p>
                      <p className="text-xs text-slate-400">{viewingProduct.stock} em estoque</p>
                    </div>
                  ) : (
                    <p className="text-xs font-bold text-red-500 uppercase">Indisponível</p>
                  )}
                </div>

                <button 
                  onClick={() => handleOrder(viewingProduct)}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-emerald-100"
                >
                  <MessageCircle size={24} />
                  Fazer Pedido no WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Contact Bar (Sticky) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md">
        <div className="bg-slate-900 text-white px-6 py-4 rounded-[2rem] shadow-2xl flex items-center justify-between border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center animate-pulse">
              <Smartphone size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">Atendimento</p>
              <p className="text-sm font-bold">Dúvidas? Fale conosco</p>
            </div>
          </div>
          <button 
            onClick={() => window.open('https://wa.me/', '_blank')}
            className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg"
          >
            <MessageCircle size={24} />
          </button>
        </div>
      </div>

      <footer className="mt-20 py-12 text-center border-t border-slate-200 bg-white">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Catálogo Pro &copy; 2024</p>
        <div className="flex justify-center gap-4 text-slate-300">
          <Smartphone size={20} />
          <ShoppingCart size={20} />
          <Filter size={20} />
        </div>
      </footer>
    </div>
  );
};

export default PublicCatalogView;
