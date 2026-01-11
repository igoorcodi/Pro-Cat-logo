
import React, { useState, useMemo, useEffect } from 'react';
import { Catalog, Product, Company, Category, Subcategory } from '../types';
import { 
  ShoppingCart, 
  MessageCircle, 
  Search, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Loader2, 
  AlertTriangle, 
  Home, 
  Instagram, 
  MapPin, 
  Building2, 
  Mail, 
  ImageOff, 
  Filter, 
  Package,
  Check
} from 'lucide-react';

interface PublicCatalogViewProps {
  catalog: Catalog | null;
  products: Product[];
  seller?: { name: string; phone?: string } | null;
  company?: Company | null;
  isLoading?: boolean;
  error?: string | null;
  categories?: Category[];
  onBack?: () => void;
}

const PublicCatalogView: React.FC<PublicCatalogViewProps> = ({ catalog, products, seller, company, isLoading, error, categories = [], onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('Todos');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | number>('Todas');
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  
  // Estado para a subcategoria que o cliente escolhe no modal de detalhes
  const [selectedSubForOrder, setSelectedSubForOrder] = useState<Subcategory | null>(null);

  // Limpa a seleção sempre que mudar o produto sendo visualizado
  useEffect(() => {
    setSelectedSubForOrder(null);
  }, [viewingProduct]);

  // Categorias únicas presentes nos produtos do catálogo
  const availableCategoryNames = useMemo(() => ['Todos', ...new Set(products.map(p => p.category))], [products]);

  // Subcategorias disponíveis para a categoria selecionada atualmente nos filtros da vitrine
  const currentSubcategories = useMemo(() => {
    if (selectedCategoryName === 'Todos') return [];
    const cat = categories.find(c => c.name === selectedCategoryName);
    return cat?.subcategories || [];
  }, [selectedCategoryName, categories]);

  // Subcategorias que o produto SENDO VISUALIZADO possui
  const viewingProductSubs = useMemo(() => {
    if (!viewingProduct || !viewingProduct.subcategoryIds) return [];
    
    // Coleta todas as subcategorias de todas as categorias do sistema para fazer o de-para
    const allSubsInSystem = categories.flatMap(c => c.subcategories || []);
    
    // Filtra apenas as que pertencem a este produto específico
    return allSubsInSystem.filter(sub => viewingProduct.subcategoryIds?.includes(sub.id));
  }, [viewingProduct, categories]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategoryName === 'Todos' || p.category === selectedCategoryName;
      const matchesSubcategory = selectedSubcategoryId === 'Todas' || 
                               (p.subcategoryIds && p.subcategoryIds.includes(selectedSubcategoryId));
      
      return matchesSearch && matchesCategory && matchesSubcategory;
    });
  }, [products, searchTerm, selectedCategoryName, selectedSubcategoryId]);

  const handleOrder = (product: Product) => {
    const sellerPhone = company?.whatsapp?.replace(/\D/g, '') || seller?.phone?.replace(/\D/g, '') || '';
    
    // Constrói a string da opção caso o cliente tenha selecionado uma
    const subOptionText = selectedSubForOrder ? `\n*Opção:* ${selectedSubForOrder.name}` : '';
    
    const message = encodeURIComponent(
      `Olá! Tenho interesse no item: *${product.name}* (Ref: ${product.sku || 'N/A'})${subOptionText}\n\nVi no catálogo: *${catalog?.name}*`
    );
    window.open(`https://wa.me/${sellerPhone}?text=${message}`, '_blank');
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategoryName(cat);
    setSelectedSubcategoryId('Todas');
  };

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
            {onBack && (
              <button onClick={onBack} className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition-all active:scale-90">
                <ArrowLeft size={20} />
              </button>
            )}
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
        {catalog?.coverImage ? (
          <img src={catalog.coverImage} className="w-full h-full object-cover brightness-75" alt="Capa" />
        ) : (
          <div className="w-full h-full bg-slate-900" />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <h1 className="text-2xl sm:text-4xl font-black text-white drop-shadow-lg">{catalog?.name}</h1>
          <p className="text-white/90 text-xs sm:text-sm mt-2 max-w-md line-clamp-2">{catalog?.description}</p>
        </div>
      </div>

      <div className="shrink-0 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-4 overflow-x-auto no-scrollbar flex items-center gap-2">
          {availableCategoryNames.map(cat => (
            <button key={cat} onClick={() => handleCategoryChange(cat)} className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest shrink-0 transition-all ${selectedCategoryName === cat ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              {cat}
            </button>
          ))}
        </div>

        {currentSubcategories.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 pb-4 overflow-x-auto no-scrollbar flex items-center gap-2 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">
              <Filter size={12} /> Filtro:
            </div>
            <button onClick={() => setSelectedSubcategoryId('Todas')} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all ${selectedSubcategoryId === 'Todas' ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-slate-200 text-slate-400'}`}>
              Todas
            </button>
            {currentSubcategories.map(sub => (
              <button key={sub.id} onClick={() => setSelectedSubcategoryId(sub.id)} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all ${selectedSubcategoryId === sub.id ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-slate-200 text-slate-400'}`}>
                {sub.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 my-8 mb-24 lg:mb-16">
        {isLoading ? (
          <div className="col-span-full py-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div key={product.id} onClick={() => setViewingProduct(product)} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 flex flex-col cursor-pointer">
              <div className="aspect-square bg-slate-50 overflow-hidden relative">
                {product.images && product.images.length > 0 ? (
                  <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={product.name} />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                    <ImageOff size={24} strokeWidth={1} />
                    <span className="text-[8px] font-black uppercase tracking-tighter">Imagem indisponível</span>
                  </div>
                )}
              </div>
              <div className="p-3 flex flex-col flex-1 justify-between">
                <div>
                  <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">{product.category}</span>
                  <h3 className="font-bold text-slate-800 text-xs line-clamp-2 mb-1 mt-0.5">{product.name}</h3>
                  <p className="text-indigo-600 font-black text-sm">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <button className="mt-3 w-full py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-md shadow-indigo-100 group-hover:bg-indigo-700 transition-all">
                  Ver Detalhes <ArrowRight size={12}/>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center opacity-40">
            <Package className="mx-auto mb-4" size={48} />
            <p className="font-black uppercase tracking-widest text-sm">Nenhum produto encontrado</p>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 mt-auto pt-12 pb-24 lg:pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
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
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs italic">{catalog?.description || "Qualidade e compromisso em cada produto selecionado para você."}</p>
            </div>
            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Contato & Redes</h5>
              <div className="space-y-3">
                {company?.whatsapp && (
                  <a href={`https://wa.me/${company.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-slate-600 hover:text-emerald-600 transition-colors">
                    <MessageCircle size={18} className="text-emerald-500" />
                    <span className="text-xs font-bold">{company.whatsapp}</span>
                  </a>
                )}
                {company?.instagram && (
                  <a href={`https://instagram.com/${company.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-slate-600 hover:text-pink-600 transition-colors">
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
            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Onde Estamos</h5>
              <div className="flex items-start gap-3 text-slate-600">
                <MapPin size={18} className="text-red-500 shrink-0 mt-0.5" />
                <div className="text-xs font-bold leading-relaxed">
                  {company?.address ? (
                    <>{company.address}, {company.number}<br />{company.neighborhood}<br />{company.city} - {company.state}<br />CEP: {company.zip_code}</>
                  ) : ("Loja Online com entrega em todo Brasil.")}
                </div>
              </div>
            </div>
          </div>
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
                <img src={viewingProduct.images[0]} className="w-full h-full object-cover" alt={viewingProduct.name} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100 gap-3">
                   <ImageOff size={48} strokeWidth={1} />
                   <p className="text-[10px] font-black uppercase tracking-widest">Imagem indisponível</p>
                </div>
              )}
              <button onClick={() => setViewingProduct(null)} className="absolute top-4 right-4 p-2 bg-slate-900 text-white rounded-full sm:hidden transition-transform active:scale-90"><X size={24} /></button>
            </div>
            <div className="w-full sm:w-1/2 p-6 sm:p-10 flex flex-col overflow-y-auto">
              <div className="hidden sm:flex justify-end mb-4"><button onClick={() => setViewingProduct(null)} className="p-2 bg-slate-100 text-slate-400 rounded-full hover:bg-slate-200 transition-all"><X size={20} /></button></div>
              <div className="mb-6">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{viewingProduct.category}</span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight mt-1">{viewingProduct.name}</h2>
              </div>
              
              <div className="flex-1 space-y-6">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sobre este item</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{viewingProduct.description}</p>
                </div>

                {/* SEÇÃO DE ESCOLHA DE OPÇÃO (SUB-CATEGORIAS) */}
                {viewingProductSubs.length > 0 && (
                  <div className="animate-in slide-in-from-top-2 duration-500">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        Escolha uma opção
                      </h4>
                      {viewingProductSubs.length > 0 && !selectedSubForOrder && (
                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-tight animate-pulse">Seleção necessária</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {viewingProductSubs.map(sub => {
                        const isSelected = selectedSubForOrder?.id === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => setSelectedSubForOrder(sub)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all border-2 ${
                              isSelected 
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100 scale-105' 
                                : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-indigo-200 active:scale-95'
                            }`}
                          >
                            {isSelected && <Check size={14} className="stroke-[4]" />}
                            {sub.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col gap-4">
                <div className="flex items-baseline justify-between">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor</p>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">R$ {viewingProduct.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                
                <button 
                  onClick={() => handleOrder(viewingProduct)} 
                  disabled={viewingProductSubs.length > 0 && !selectedSubForOrder}
                  className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 ${
                    viewingProductSubs.length > 0 && !selectedSubForOrder
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100'
                  }`}
                >
                  <MessageCircle size={20} /> Pedir no WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicCatalogView;
