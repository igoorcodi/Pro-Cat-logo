
import React, { useState, useMemo, useEffect } from 'react';
import { Catalog, Product, Company, Category, Subcategory, CartItem } from '../types';
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
  Check,
  Plus,
  Minus,
  Trash2,
  Share2,
  Phone,
  Globe,
  CreditCard
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
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [selectedSubForOrder, setSelectedSubForOrder] = useState<Subcategory | null>(null);

  // Tema personalizado
  const primaryColor = catalog?.primaryColor || '#4f46e5';

  // Inicializar carrinho da URL ou LocalStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cartData = params.get('cart');
    if (cartData) {
      try {
        const decoded = JSON.parse(atob(cartData));
        setCart(decoded);
      } catch (e) {
        const saved = localStorage.getItem(`cart_${catalog?.id}`);
        if (saved) setCart(JSON.parse(saved));
      }
    } else {
      const saved = localStorage.getItem(`cart_${catalog?.id}`);
      if (saved) setCart(JSON.parse(saved));
    }
  }, [catalog?.id]);

  // Sincronizar carrinho com LocalStorage e URL para compartilhamento
  useEffect(() => {
    if (catalog?.id) {
      localStorage.setItem(`cart_${catalog.id}`, JSON.stringify(cart));
      
      try {
        const params = new URLSearchParams(window.location.search);
        if (cart.length > 0) {
          params.set('cart', btoa(JSON.stringify(cart)));
        } else {
          params.delete('cart');
        }
        
        const searchString = params.toString();
        const newUrl = searchString ? `?${searchString}` : window.location.pathname;
        
        if (window.history && window.history.replaceState) {
          window.history.replaceState({}, '', newUrl);
        }
      } catch (e) {
        console.warn('Falha segura: O navegador impediu a atualização da URL via script.');
      }
    }
  }, [cart, catalog?.id]);

  useEffect(() => {
    setSelectedSubForOrder(null);
  }, [viewingProduct]);

  const availableCategoryNames = useMemo(() => ['Todos', ...new Set(products.map(p => p.category).filter(Boolean))], [products]);

  const currentSubcategories = useMemo(() => {
    if (selectedCategoryName === 'Todos') return [];
    const cat = categories.find(c => c.name === selectedCategoryName);
    return cat?.subcategories || [];
  }, [selectedCategoryName, categories]);

  const viewingProductSubs = useMemo(() => {
    if (!viewingProduct || !viewingProduct.subcategoryIds) return [];
    const allSubsInSystem = categories.flatMap(c => c.subcategories || []);
    return allSubsInSystem.filter(sub => viewingProduct.subcategoryIds?.includes(sub.id));
  }, [viewingProduct, categories]);

  const filteredProducts = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return products.filter(p => {
      const name = p.name || '';
      const category = p.category || '';
      
      const matchesSearch = name.toLowerCase().includes(search);
      const matchesCategory = selectedCategoryName === 'Todos' || category === selectedCategoryName;
      const matchesSubcategory = selectedSubcategoryId === 'Todas' || 
                               (p.subcategoryIds && p.subcategoryIds.includes(selectedSubcategoryId));
      
      return matchesSearch && matchesCategory && matchesSubcategory;
    });
  }, [products, searchTerm, selectedCategoryName, selectedSubcategoryId]);

  const addToCart = (product: Product, sub: Subcategory | null = null) => {
    const cartId = `${product.id}_${sub?.id || 'none'}`;
    setCart(prev => {
      const existing = prev.find(item => item.id === cartId);
      if (existing) {
        return prev.map(item => item.id === cartId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, {
        id: cartId,
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: 1,
        image: product.images?.[0],
        selectedSub: sub
      }];
    });
    setViewingProduct(null);
    setIsCartOpen(true);
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);

  const handleSendOrder = () => {
    const sellerPhone = (company?.whatsapp || seller?.phone || '').replace(/\D/g, '');
    if (!sellerPhone || cart.length === 0) return;

    let message = `*NOVO PEDIDO - ${catalog?.name || 'VITRINE'}*\n`;
    message += `----------------------------\n\n`;

    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.productName}*\n`;
      if (item.selectedSub) message += `   Opção: ${item.selectedSub.name}\n`;
      message += `   Qtd: ${item.quantity} x R$ ${item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
      message += `   Subtotal: R$ ${(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\n`;
    });

    message += `----------------------------\n`;
    message += `*TOTAL DO PEDIDO: R$ ${cartTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n\n`;
    message += `Aguardando sua confirmação! 😊`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${sellerPhone}?text=${encoded}`, '_blank');
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
    <div className="bg-slate-50 min-h-screen selection:bg-indigo-100 flex flex-col relative overflow-x-hidden">
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
              <ShoppingCart style={{ color: primaryColor }} size={20} />
            )}
            <span className="font-bold text-slate-800 text-sm truncate max-w-[100px] sm:max-w-none">{company?.trading_name || company?.name || catalog?.name}</span>
          </div>
          <div className="flex items-center gap-3 flex-1 max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Buscar..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-full text-xs focus:ring-2 outline-none" 
                style={{ '--tw-ring-color': primaryColor + '40' } as React.CSSProperties}
              />
            </div>
            <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm transition-all active:scale-90">
                <ShoppingCart size={20} />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg animate-in zoom-in" style={{ backgroundColor: primaryColor }}>
                    {cart.reduce((a, b) => a + b.quantity, 0)}
                  </span>
                )}
            </button>
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
          <h1 className="text-2xl sm:text-4xl font-black text-white drop-shadow-lg">{catalog?.name || 'Catálogo Virtual'}</h1>
          <p className="text-white/90 text-xs sm:text-sm mt-2 max-w-md line-clamp-2">{catalog?.description}</p>
        </div>
      </div>

      <div className="shrink-0 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-4 overflow-x-auto no-scrollbar flex items-center gap-2">
          {availableCategoryNames.map(cat => (
            <button 
              key={cat} 
              onClick={() => handleCategoryChange(cat)} 
              className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest shrink-0 transition-all ${selectedCategoryName === cat ? 'text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              style={selectedCategoryName === cat ? { backgroundColor: primaryColor } : {}}
            >
              {cat}
            </button>
          ))}
        </div>

        {currentSubcategories.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 pb-4 overflow-x-auto no-scrollbar flex items-center gap-2 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">
              <Filter size={12} /> Filtro:
            </div>
            <button 
              onClick={() => setSelectedSubcategoryId('Todas')} 
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all ${selectedSubcategoryId === 'Todas' ? 'bg-indigo-50' : 'bg-white border border-slate-200 text-slate-400'}`}
              style={selectedSubcategoryId === 'Todas' ? { backgroundColor: primaryColor + '15', color: primaryColor } : {}}
            >
              Todas
            </button>
            {currentSubcategories.map(sub => (
              <button 
                key={sub.id} 
                onClick={() => setSelectedSubcategoryId(sub.id)} 
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all ${selectedSubcategoryId === sub.id ? '' : 'bg-white border border-slate-200 text-slate-400'}`}
                style={selectedSubcategoryId === sub.id ? { backgroundColor: primaryColor + '15', color: primaryColor } : {}}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 my-8 mb-24 lg:mb-16">
        {isLoading ? (
          <div className="col-span-full py-20 flex justify-center"><Loader2 className="animate-spin" style={{ color: primaryColor }} size={32} /></div>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div key={product.id} onClick={() => setViewingProduct(product)} className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-100 flex flex-col cursor-pointer h-full">
              <div className="aspect-square bg-slate-50 overflow-hidden relative shrink-0">
                {product.images && product.images.length > 0 ? (
                  <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={product.name} />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2 p-4">
                    <ImageOff size={32} strokeWidth={1} />
                    <span className="text-xs font-black uppercase tracking-tighter text-center">Imagem Indisponível</span>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                    <span className="bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-xl shadow-lg border border-white/10">
                      #{String(product.id).substring(0, 8)}
                    </span>
                </div>
                <div className="absolute top-4 right-4 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                      className="p-3 bg-white rounded-2xl shadow-xl shadow-black/5 hover:brightness-110 transition-all active:scale-90"
                      style={{ color: primaryColor }}
                    >
                      <Plus size={20} strokeWidth={3} />
                    </button>
                </div>
              </div>
              <div className="p-6 sm:p-7 flex flex-col flex-1 justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest line-clamp-1" style={{ color: primaryColor }}>{product.category || 'Geral'}</span>
                  <h3 className="font-bold text-slate-800 text-lg leading-tight line-clamp-2 mb-3 mt-1.5">{product.name || 'Sem nome'}</h3>
                  <p className="font-black text-xl" style={{ color: primaryColor }}>R$ {(product.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <button 
                  className="mt-6 w-full py-3.5 bg-slate-50 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-transparent group-hover:text-white group-hover:shadow-xl"
                  style={{ '--btn-color': primaryColor } as any}
                  onClick={(e) => {
                    // Simula efeito hover dinâmico via style
                    const target = e.currentTarget;
                    target.style.backgroundColor = primaryColor;
                    target.style.borderColor = primaryColor;
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = primaryColor;
                    e.currentTarget.style.borderColor = primaryColor;
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '';
                    e.currentTarget.style.borderColor = '';
                    e.currentTarget.style.color = primaryColor;
                  }}
                >
                  <span style={{ color: 'inherit' }}>Ver Detalhes</span> <ArrowRight size={14}/>
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

      <footer className="bg-white border-t border-slate-200 py-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {displayLogoUrl ? (
                <img src={displayLogoUrl} className="w-10 h-10 rounded-xl object-cover shadow-sm" alt="Logo" />
              ) : (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                  <Building2 size={24} />
                </div>
              )}
              <h4 className="font-black text-slate-900 uppercase tracking-tighter">{company?.trading_name || company?.name || catalog?.name}</h4>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Sua vitrine digital profissional. Confira nossos produtos e entre em contato para fazer seu pedido diretamente pelo WhatsApp.
            </p>
            {company?.document && (
              <div className="flex items-center gap-2 text-slate-400">
                <CreditCard size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">CNPJ/CPF: {company.document}</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Canais de Contato</h5>
            <ul className="space-y-3">
              {company?.whatsapp && (
                <li>
                  <a 
                    href={`https://wa.me/${company.whatsapp.replace(/\D/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-slate-600 hover:brightness-90 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:brightness-110 transition-all" style={{ backgroundColor: primaryColor + '10', color: primaryColor }}>
                      <Phone size={16} />
                    </div>
                    <span className="text-sm font-bold">{company.whatsapp}</span>
                  </a>
                </li>
              )}
              {company?.email && (
                <li>
                  <a 
                    href={`mailto:${company.email}`} 
                    className="flex items-center gap-3 text-slate-600 hover:brightness-90 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:brightness-110 transition-all" style={{ backgroundColor: primaryColor + '10', color: primaryColor }}>
                      <Mail size={16} />
                    </div>
                    <span className="text-sm font-bold">{company.email}</span>
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div className="space-y-4">
            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Onde Estamos</h5>
            {company?.address ? (
              <div className="flex items-start gap-3 text-slate-600 group">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                  <MapPin size={16} />
                </div>
                <div className="text-sm font-medium leading-tight">
                  <p className="font-bold">{company.address}, {company.number || 'S/N'}</p>
                  <p className="text-slate-400 text-xs">{company.neighborhood}</p>
                  <p className="text-slate-400 text-xs">{company.city} - {company.state}</p>
                  {company.zip_code && <p className="text-slate-400 text-[10px] mt-1">CEP: {company.zip_code}</p>}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">Vendas exclusivamente online.</p>
            )}
          </div>

          <div className="space-y-4">
            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Siga-nos</h5>
            <div className="flex gap-3">
              {company?.instagram && (
                <a 
                  href={`https://instagram.com/${company.instagram.replace('@', '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-95"
                >
                  <Instagram size={20} />
                </a>
              )}
              {!company?.instagram && (
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center">
                  <Globe size={20} />
                </div>
              )}
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-4">
              Acompanhe nossas novidades diariamente nas redes sociais.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
          <div className="flex items-center gap-2">
            <ShoppingCart size={14} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Vitrine protegida por Catálogo Pro</p>
          </div>
          <p className="text-[10px] font-bold">© {new Date().getFullYear()} {company?.name || 'Sistema de Gestão'}</p>
        </div>
      </footer>

      {cart.length > 0 && !isCartOpen && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-5 text-white rounded-full shadow-2xl lg:hidden animate-bounce flex items-center justify-center"
          style={{ backgroundColor: primaryColor, shadowColor: primaryColor + '40' }}
        >
          <ShoppingCart size={24} />
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg">
            {cart.reduce((a, b) => a + b.quantity, 0)}
          </span>
        </button>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingCart style={{ color: primaryColor }} size={24} />
                <h3 className="font-black text-slate-800 uppercase tracking-tight">Seu Carrinho</h3>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-all"><X size={24}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length > 0 ? (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4 p-4 bg-slate-50 rounded-3xl border border-slate-100 group animate-in slide-in-from-bottom-2">
                    <div className="w-20 h-20 bg-white rounded-2xl overflow-hidden border border-slate-100 shrink-0">
                      {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageOff size={24}/></div>}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">#{String(item.productId).substring(0, 8)}</p>
                        <h4 className="font-bold text-slate-800 text-sm truncate">{item.productName}</h4>
                        {item.selectedSub && <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: primaryColor }}>{item.selectedSub.name}</p>}
                        <p className="text-xs font-black text-slate-400 mt-1">R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-2 py-1">
                          <button onClick={() => updateCartQuantity(item.id, -1)} className="p-1 text-slate-400 hover:brightness-75 transition-all" style={{ color: primaryColor }}><Minus size={14}/></button>
                          <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.id, 1)} className="p-1 text-slate-400 hover:brightness-75 transition-all" style={{ color: primaryColor }}><Plus size={14}/></button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                  <ShoppingCart size={64} className="text-slate-300" />
                  <div>
                    <p className="font-black text-slate-800 uppercase tracking-widest text-sm">Carrinho Vazio</p>
                    <p className="text-xs font-bold text-slate-400 mt-1">Selecione produtos para continuar.</p>
                  </div>
                  <button onClick={() => setIsCartOpen(false)} className="px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest" style={{ backgroundColor: primaryColor + '10', color: primaryColor }}>Explorar Produtos</button>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 bg-slate-900 text-white space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Total Geral</span>
                  <span className="text-3xl font-black" style={{ color: primaryColor }}>R$ {cartTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    <button 
                      onClick={handleSendOrder}
                      className="w-full py-5 text-white rounded-2xl font-black uppercase text-sm tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 hover:brightness-110"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <MessageCircle size={20} /> Enviar Pedido
                    </button>
                    <button 
                      onClick={() => {
                        try {
                          const url = window.location.href;
                          navigator.clipboard.writeText(url);
                          alert("Link do catálogo (com carrinho) copiado!");
                        } catch (e) {
                          alert("Erro ao copiar link.");
                        }
                      }}
                      className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                    >
                      <Share2 size={14} /> Compartilhar Carrinho
                    </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
              <div className="absolute top-4 left-4">
                  <span className="bg-slate-900/90 backdrop-blur-md text-white text-[12px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl shadow-2xl border border-white/20">
                    Cód: #{String(viewingProduct.id).substring(0, 8)}
                  </span>
              </div>
              <button onClick={() => setViewingProduct(null)} className="absolute top-4 right-4 p-2 bg-slate-900/40 backdrop-blur-md text-white rounded-full sm:hidden transition-transform active:scale-90"><X size={24} /></button>
            </div>
            <div className="w-full sm:w-1/2 p-6 sm:p-10 flex flex-col overflow-y-auto">
              <div className="hidden sm:flex justify-end mb-4"><button onClick={() => setViewingProduct(null)} className="p-2 bg-slate-100 text-slate-400 rounded-full hover:bg-slate-200 transition-all"><X size={20} /></button></div>
              <div className="mb-6">
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: primaryColor }}>{viewingProduct.category || 'Geral'}</span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight mt-1">{viewingProduct.name || 'Sem nome'}</h2>
              </div>
              
              <div className="flex-1 space-y-6">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sobre este item</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{viewingProduct.description || 'Nenhuma descrição fornecida.'}</p>
                </div>

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
                                ? 'text-white shadow-md scale-105' 
                                : 'bg-slate-50 border-slate-100 text-slate-500 hover:brightness-95 active:scale-95'
                            }`}
                            style={isSelected ? { backgroundColor: primaryColor, borderColor: primaryColor, boxShadow: `0 10px 15px -3px ${primaryColor}20` } : {}}
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
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preço Unitário</p>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">R$ {(viewingProduct.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                
                <button 
                  onClick={() => addToCart(viewingProduct, selectedSubForOrder)} 
                  disabled={viewingProductSubs.length > 0 && !selectedSubForOrder}
                  className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 ${
                    viewingProductSubs.length > 0 && !selectedSubForOrder
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      : 'text-white hover:brightness-110'
                  }`}
                  style={!(viewingProductSubs.length > 0 && !selectedSubForOrder) ? { backgroundColor: primaryColor, boxShadow: `0 10px 20px -5px ${primaryColor}40` } : {}}
                >
                  <Plus size={20} strokeWidth={3} /> Adicionar ao Carrinho
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
