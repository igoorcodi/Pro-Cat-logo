
import React, { useState, useMemo } from 'react';
import { Catalog, Product, Company } from '../types';
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
  Home,
  Instagram,
  MapPin,
  Building2,
  Mail,
  Phone,
  ImageOff
} from 'lucide-react';

interface PublicCatalogViewProps {
  catalog: Catalog | null;
  products: Product[];
  seller?: { name: string; phone?: string } | null;
  company?: Company | null;
  isLoading?: boolean;
  error?: string | null;
  onBack?: () => void;
}

const PublicCatalogView: React.FC<PublicCatalogViewProps> = ({ catalog, products, seller, company, isLoading, error, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const categories = useMemo(() => ['Todos', ...new Set(products.map(p => p.category))], [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleOrder = (product: Product) => {
    const sellerPhone = company?.whatsapp?.replace(/\D/g, '') || seller?.phone?.replace(/\D/g, '') || '';
    const message = encodeURIComponent(`Olá! Tenho interesse no item: *${product.name}* (Ref: ${product.sku || 'N/A'})\nVi no catálogo: *${catalog?.name}*`);
    window.open(`https://wa.me/${sellerPhone}?text=${message}`, '_blank');
  };

  // Prioriza o logo do catálogo
  const displayLogoUrl = catalog?.logoUrl || company?.logo_url;

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="text-red-500 mb-4" size={48} />
        <h1 className="text-2xl font-black text-slate-900 mb-2">Ops! Vitrine indisponível.</h1>
        <p className="text-slate-500 mb-8">{error}</p>
        <button onClick={() => window.location.href = window.location.origin} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest"><Home size={18} className="inline mr-2"/> Voltar</button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen selection:bg-indigo-100 flex flex-col">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-slate-200 shrink-0">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            {onBack && <button onClick={onBack} className="p-2 bg-slate-100 rounded-xl"><ArrowLeft size={18} /></button>}
            {displayLogoUrl ? (
              <img src={displayLogoUrl} className="w-8 h-8 rounded-lg object-cover" alt="Logo" />
            ) : (
              <ShoppingCart className="text-indigo-600" size={20} />
            )}
            <span className="font-bold text-slate-800 text-sm truncate max-w-[100px] sm:max-w-none">{company?.trading_name || company?.name || catalog?.name}</span>
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-full text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
        </div>
      </header>

      <div className="shrink-0 relative h-48 sm:h-64 overflow-hidden">
        {catalog?.coverImage && <img src={catalog.coverImage} className="w-full h-full object-cover brightness-75" />}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <h1 className="text-2xl sm:text-4xl font-black text-white drop-shadow-lg">{catalog?.name}</h1>
          <p className="text-white/90 text-xs sm:text-sm mt-2 max-w-md line-clamp-2">{catalog?.description}</p>
        </div>
      </div>

      <div className="shrink-0 max-w-7xl mx-auto px-4 py-4 overflow-x-auto no-scrollbar flex items-center gap-2">
        {categories.map(cat => (
          <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shrink-0 transition-all ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200'}`}>{cat}</button>
        ))}
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 mb-16">
        {isLoading ? (
          <div className="col-span-full py-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
        ) : filteredProducts.map(product => (
          <div key={product.id} onClick={() => setViewingProduct(product)} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-slate-100 flex flex-col cursor-pointer">
            <div className="aspect-square bg-slate-50 overflow-hidden relative">
              {product.images && product.images.length > 0 ? (
                <img src={product.images[0]} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                  <ImageOff size={24} strokeWidth={1} />
                  <span className="text-[8px] font-black uppercase tracking-tighter">Imagem indisponível</span>
                </div>
              )}
            </div>
            <div className="p-3 flex flex-col flex-1 justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-xs line-clamp-2 mb-1">{product.name}</h3>
                <p className="text-indigo-600 font-black text-sm">R$ {product.price.toLocaleString('pt-BR')}</p>
              </div>
              <button className="mt-2 w-full py-1.5 bg-slate-50 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1">Ver Detalhes <ArrowRight size={10}/></button>
            </div>
          </div>
        ))}
      </main>

      {/* RODAPÉ INSTITUCIONAL */}
      <footer className="bg-white border-t border-slate-200 mt-auto pt-12 pb-24 lg:pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            
            {/* Coluna 1: Sobre */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {displayLogoUrl ? (
                  <img src={displayLogoUrl} className="w-10 h-10 rounded-xl object-cover" alt="Logo" />
                ) : (
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                    <Building2 size={24} />
                  </div>
                )}
                <div>
                  <h4 className="font-black text-slate-800 uppercase tracking-tight">{company?.trading_name || company?.name || "Nossa Loja"}</h4>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Catálogo Oficial</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs italic">
                {catalog?.description || "Qualidade e compromisso em cada produto selecionado para você."}
              </p>
            </div>

            {/* Coluna 2: Contato & Social */}
            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Contato & Redes</h5>
              <div className="space-y-3">
                {company?.whatsapp && (
                  <a href={`https://wa.me/${company.whatsapp.replace(/\D/g, '')}`} target="_blank" className="flex items-center gap-3 text-slate-600 hover:text-emerald-600 transition-colors">
                    <MessageCircle size={18} className="text-emerald-500" />
                    <span className="text-xs font-bold">{company.whatsapp}</span>
                  </a>
                )}
                {company?.instagram && (
                  <a href={`https://instagram.com/${company.instagram.replace('@', '')}`} target="_blank" className="flex items-center gap-3 text-slate-600 hover:text-pink-600 transition-colors">
                    <Instagram size={18} className="text-pink-500" />
                    <span className="text-xs font-bold">@{company.instagram.replace('@', '')}</span>
                  </a>
                )}
                {company?.email && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <Mail size={18} className="text-indigo-400" />
                    <span className="text-xs font-bold">{company.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Coluna 3: Endereço */}
            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Onde Estamos</h5>
              <div className="flex items-start gap-3 text-slate-600">
                <MapPin size={18} className="text-red-500 shrink-0 mt-0.5" />
                <div className="text-xs font-bold leading-relaxed">
                  {company?.address ? (
                    <>
                      {company.address}, {company.number}<br />
                      {company.neighborhood}<br />
                      {company.city} - {company.state}<br />
                      CEP: {company.zip_code}
                    </>
                  ) : (
                    "Loja Online com entrega em todo Brasil."
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Barra Final: CNPJ e Direitos */}
          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">
            <div className="flex items-center gap-4">
              <span>© {new Date().getFullYear()} {company?.name || "Todos os direitos reservados"}</span>
              {company?.document && <span>| CNPJ: {company.document}</span>}
            </div>
            <div className="flex items-center gap-2">
              <span>Desenvolvido por</span>
              <span className="text-indigo-400">Pro Catálogo</span>
            </div>
          </div>
        </div>
      </footer>

      {viewingProduct && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 duration-500 flex flex-col sm:flex-row max-h-[90vh] sm:max-h-[80vh]">
            <div className="w-full sm:w-1/2 bg-slate-100 relative h-64 sm:h-auto shrink-0">
              {viewingProduct.images && viewingProduct.images.length > 0 ? (
                <img src={viewingProduct.images[0]} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100 gap-3">
                   <ImageOff size={48} strokeWidth={1} />
                   <p className="text-[10px] font-black uppercase tracking-widest">Imagem indisponível</p>
                </div>
              )}
              <button onClick={() => setViewingProduct(null)} className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white sm:hidden"><X size={24} /></button>
            </div>
            <div className="w-full sm:w-1/2 p-6 sm:p-10 flex flex-col overflow-y-auto">
              <div className="hidden sm:flex justify-end mb-4"><button onClick={() => setViewingProduct(null)} className="p-2 bg-slate-100 text-slate-400 rounded-full"><X size={20} /></button></div>
              <div className="mb-6">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{viewingProduct.category}</span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight mt-1">{viewingProduct.name}</h2>
              </div>
              <div className="flex-1">
                <p className="text-slate-600 text-sm leading-relaxed mb-8">{viewingProduct.description}</p>
              </div>
              <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col gap-4">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">R$ {viewingProduct.price.toLocaleString('pt-BR')}</span>
                <button onClick={() => handleOrder(viewingProduct)} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl"><MessageCircle size={20} /> Pedir no WhatsApp</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicCatalogView;
