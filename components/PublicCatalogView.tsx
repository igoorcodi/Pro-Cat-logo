
import React, { useState, useMemo, useEffect } from 'react';
import { Catalog, Product, Company, Category, Subcategory, CartItem, Promotion, Customer } from '../types';
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
  CheckCircle2,
  Plus,
  Minus,
  Trash2,
  Share2,
  Phone,
  Globe,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Ticket,
  AlertCircle,
  Copy,
  Info,
  User as UserIcon,
  LogIn,
  LogOut,
  Lock,
  UserPlus
} from 'lucide-react';
import { supabase } from '../supabase';

interface PublicCatalogViewProps {
  catalog: Catalog | null;
  products: Product[];
  seller?: { name: string; phone?: string } | null;
  company?: Company | null;
  isLoading?: boolean;
  error?: string | null;
  categories?: Category[];
  promotions?: Promotion[];
  onBack?: () => void;
}

const PublicCatalogView: React.FC<PublicCatalogViewProps> = ({ catalog, products, seller, company, isLoading, error, categories = [], promotions = [], onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('Todos');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | number>('Todas');
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Autenticação do Cliente da Vitrine
  const [loggedCustomer, setLoggedCustomer] = useState<Customer | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [usedPromotionIds, setUsedPromotionIds] = useState<(string | number)[]>([]);

  // Estados do Formulário de Auth
  const [authForm, setAuthForm] = useState({ name: '', email: '', phone: '', password: '' });

  const [selectedSubForOrder, setSelectedSubForOrder] = useState<Subcategory | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Estados do Cupom
  const [couponInput, setCouponInput] = useState('');
  const [appliedPromotion, setAppliedPromotion] = useState<Promotion | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  const primaryColor = catalog?.primaryColor || '#4f46e5';

  // Inicializar Sessão do Cliente
  useEffect(() => {
    const saved = localStorage.getItem(`customer_session_${catalog?.id}`);
    if (saved) {
      try {
        const customer = JSON.parse(saved);
        setLoggedCustomer(customer);
        fetchUsedCoupons(customer.id);
      } catch (e) {
        localStorage.removeItem(`customer_session_${catalog?.id}`);
      }
    }
  }, [catalog?.id]);

  const fetchUsedCoupons = async (customerId: string | number) => {
    if (!catalog?.user_id) return;
    const { data } = await supabase
      .from('customer_coupon_usage')
      .select('promotion_id')
      .eq('customer_id', customerId)
      .eq('user_id', catalog.user_id);
    
    if (data) setUsedPromotionIds(data.map(d => d.promotion_id));
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catalog?.user_id) return;
    setAuthError('');
    setAuthLoading(true);

    try {
      if (authTab === 'login') {
        const { data, error: lError } = await supabase.rpc('login_showcase_customer', {
          p_email: authForm.email.toLowerCase().trim(),
          p_password: authForm.password,
          p_owner_id: catalog.user_id
        });

        if (lError || !data || data.length === 0) {
          setAuthError('E-mail ou senha incorretos.');
        } else {
          const customer = data[0];
          setLoggedCustomer(customer);
          localStorage.setItem(`customer_session_${catalog.id}`, JSON.stringify(customer));
          setIsAuthModalOpen(false);
          fetchUsedCoupons(customer.id);
        }
      } else {
        // Cadastro
        if (authForm.password.length < 6) {
          setAuthError('A senha deve ter no mínimo 6 caracteres.');
          setAuthLoading(false);
          return;
        }

        const { data, error: rError } = await supabase
          .from('customers')
          .insert({
            name: authForm.name,
            email: authForm.email.toLowerCase().trim(),
            phone: authForm.phone,
            password: authForm.password,
            user_id: catalog.user_id,
            status: 'active',
            address: '', city: '', state: '', neighborhood: '', document: '', number: '', notes: ''
          })
          .select();

        if (rError) {
          if (rError.message.includes('unique')) setAuthError('Este e-mail já está cadastrado.');
          else setAuthError('Erro ao realizar cadastro. Tente novamente.');
        } else {
          const customer = data[0];
          setLoggedCustomer(customer);
          localStorage.setItem(`customer_session_${catalog.id}`, JSON.stringify(customer));
          setIsAuthModalOpen(false);
        }
      }
    } catch (err) {
      setAuthError('Falha na comunicação com o servidor.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(`customer_session_${catalog?.id}`);
    setLoggedCustomer(null);
    setUsedPromotionIds([]);
    setAppliedPromotion(null);
  };

  // Fix: Implement missing copyToClipboard function used in the promotions section.
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCoupon(text);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  const availableCategoryNames = useMemo(() => ['Todos', ...new Set(products.map(p => p.category).filter(Boolean))], [products]);

  const currentSubcategories = useMemo(() => {
    if (selectedCategoryName === 'Todos') return [];
    const cat = categories.find(c => c.name === selectedCategoryName);
    return cat?.subcategories || [];
  }, [selectedCategoryName, categories]);

  const filteredProducts = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return products.filter(p => {
      const name = p.name || '';
      const category = p.category || '';
      const matchesSearch = name.toLowerCase().includes(search);
      const matchesCategory = selectedCategoryName === 'Todos' || category === selectedCategoryName;
      const matchesSubcategory = selectedSubcategoryId === 'Todas' || (p.subcategoryIds && p.subcategoryIds.includes(selectedSubcategoryId));
      return matchesSearch && matchesCategory && matchesSubcategory;
    });
  }, [products, searchTerm, selectedCategoryName, selectedSubcategoryId]);

  const featuredPromotions = useMemo(() => {
    const now = new Date();
    return promotions.filter(p => 
      p.status === 'active' && 
      p.show_on_home && 
      (!p.expiry_date || new Date(p.expiry_date) > now) &&
      (p.usage_limit === 0 || p.usage_count < p.usage_limit)
    );
  }, [promotions]);

  const cartSubtotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);

  const discountValue = useMemo(() => {
    if (!appliedPromotion) return 0;
    if (appliedPromotion.min_order_value > cartSubtotal) return 0;

    let totalDiscount = 0;
    if (appliedPromotion.discount_type === 'fixed') {
      totalDiscount = Math.min(appliedPromotion.discount_value, cartSubtotal);
    } else {
      totalDiscount = (cartSubtotal * appliedPromotion.discount_value) / 100;
      if (appliedPromotion.max_discount_value > 0 && totalDiscount > appliedPromotion.max_discount_value) {
        totalDiscount = appliedPromotion.max_discount_value;
      }
    }
    return totalDiscount;
  }, [appliedPromotion, cartSubtotal]);

  const cartTotal = cartSubtotal - discountValue;

  const handleApplyCoupon = (code?: string) => {
    if (!loggedCustomer) {
      setAuthTab('login');
      setIsAuthModalOpen(true);
      setAuthError('Você precisa entrar ou se cadastrar para utilizar cupons.');
      return;
    }

    const targetCode = code || couponInput;
    setCouponError(null);
    const promo = promotions.find(p => p.code.toUpperCase() === targetCode.toUpperCase() && p.status === 'active');

    if (!promo) {
      setCouponError('Cupom inválido ou pausado.');
      return;
    }

    if (usedPromotionIds.includes(promo.id)) {
      setCouponError('Você já utilizou este cupom anteriormente.');
      return;
    }

    if (promo.expiry_date && new Date(promo.expiry_date) < new Date()) {
      setCouponError('Este cupom já expirou.');
      return;
    }

    if (promo.usage_limit > 0 && promo.usage_count >= promo.usage_limit) {
      setCouponError('Este cupom atingiu o limite de utilizações.');
      return;
    }

    if (promo.min_order_value > cartSubtotal) {
      setCouponError(`Valor mínimo de R$ ${promo.min_order_value.toLocaleString('pt-BR')}`);
      if (code) { setAppliedPromotion(promo); setIsCartOpen(true); }
      return;
    }

    setAppliedPromotion(promo);
    setCouponInput('');
    if (code) setIsCartOpen(true);
  };

  const handleSendOrder = async () => {
    const sellerPhone = (company?.whatsapp || seller?.phone || '').replace(/\D/g, '');
    if (!sellerPhone || cart.length === 0) return;

    // Se houver cupom, registramos o uso no banco para o cliente não usar de novo
    if (appliedPromotion && loggedCustomer && catalog?.user_id) {
       await supabase.from('customer_coupon_usage').insert({
          customer_id: loggedCustomer.id,
          promotion_id: appliedPromotion.id,
          user_id: catalog.user_id
       });
    }

    let message = `*NOVO PEDIDO - ${catalog?.name || 'VITRINE'}*\n`;
    message += `*Cliente:* ${loggedCustomer?.name || 'Visitante'}\n`;
    message += `----------------------------\n\n`;

    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.productName}*\n`;
      if (item.selectedSub) message += `   Opção: ${item.selectedSub.name}\n`;
      message += `   Qtd: ${item.quantity} x R$ ${item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
      message += `   Subtotal: R$ ${(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\n`;
    });

    message += `----------------------------\n`;
    message += `*Subtotal: R$ ${cartSubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n`;
    if (appliedPromotion) {
      message += `*Cupom Aplicado: ${appliedPromotion.code}*\n`;
      message += `*Desconto: -R$ ${discountValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n`;
    }
    message += `*TOTAL DO PEDIDO: R$ ${cartTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n\n`;
    message += `Aguardando sua confirmação! 😊`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${sellerPhone}?text=${encoded}`, '_blank');
  };

  const addToCart = (product: Product, sub: Subcategory | null = null) => {
    const cartId = `${product.id}_${sub?.id || 'none'}`;
    setCart(prev => {
      const existing = prev.find(item => item.id === cartId);
      if (existing) {
        return prev.map(item => item.id === cartId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { id: cartId, productId: product.id, productName: product.name, price: product.price, quantity: 1, image: product.images?.[0], selectedSub: sub }];
    });
    setViewingProduct(null);
    setIsCartOpen(true);
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
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

          <div className="flex items-center gap-2 flex-1 max-w-lg justify-end">
            <div className="relative hidden sm:block w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-full text-xs focus:ring-2 outline-none" style={{ '--tw-ring-color': primaryColor + '40' } as React.CSSProperties} />
            </div>

            {/* User Profile / Login */}
            {loggedCustomer ? (
               <div className="flex items-center gap-2 bg-slate-100 pl-3 pr-1 py-1 rounded-full border border-slate-200">
                  <span className="text-[10px] font-black text-slate-700 uppercase truncate max-w-[80px]">{loggedCustomer.name.split(' ')[0]}</span>
                  <button onClick={handleLogout} className="p-1.5 bg-white text-slate-400 hover:text-red-500 rounded-full shadow-sm transition-all"><LogOut size={14}/></button>
               </div>
            ) : (
              <button onClick={() => setIsAuthModalOpen(true)} className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition-all active:scale-90 flex items-center gap-2">
                <LogIn size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest hidden xs:block">Entrar</span>
              </button>
            )}

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

      {/* Destaque de Cupons na Home */}
      {!searchTerm && featuredPromotions.length > 0 && (
        <div className="shrink-0 bg-white border-b border-slate-100 py-6 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-2 mb-4 px-2">
              <Ticket className="text-indigo-600" size={18} />
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Ofertas e Cupons</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-2">
              {featuredPromotions.map(promo => {
                const isUsed = usedPromotionIds.includes(promo.id);
                return (
                  <div 
                    key={promo.id} 
                    className={`shrink-0 w-[280px] sm:w-[320px] bg-gradient-to-br rounded-3xl p-5 text-white shadow-xl flex flex-col justify-between relative overflow-hidden transition-all ${isUsed ? 'from-slate-400 to-slate-500 opacity-80' : 'from-indigo-600 to-indigo-800 shadow-indigo-100'}`}
                  >
                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                    <div className="relative z-10">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">{isUsed ? 'VOCÊ JÁ USOU' : 'GANHE AGORA'}</p>
                            <h3 className="text-2xl font-black tracking-tighter">
                              {promo.discount_type === 'percentage' ? `${promo.discount_value}% OFF` : `R$ ${promo.discount_value} OFF`}
                            </h3>
                          </div>
                          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                            {isUsed ? <Check size={20} /> : <Ticket size={20} />}
                          </div>
                        </div>
                        
                        <div className="mt-4 space-y-1">
                          <p className="text-[11px] font-bold text-indigo-100 flex items-center gap-1.5">
                             <CheckCircle2 size={12} className={isUsed ? 'text-white' : 'text-emerald-400'} />
                             Válido acima de R$ {promo.min_order_value}
                          </p>
                        </div>
                    </div>

                    <div className="relative z-10 mt-6 flex items-center gap-2">
                        {isUsed ? (
                           <div className="w-full text-center py-3 bg-black/10 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                             Cupom Utilizado ✅
                           </div>
                        ) : (
                          <>
                            <div onClick={() => { if(!loggedCustomer) setIsAuthModalOpen(true); else copyToClipboard(promo.code); }} className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all active:scale-95">
                               <span className="font-black text-xs uppercase tracking-widest">{promo.code}</span>
                               {copiedCoupon === promo.code ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="opacity-60" />}
                            </div>
                            <button onClick={() => handleApplyCoupon(promo.code)} className="bg-white text-indigo-600 px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                              {loggedCustomer ? 'Aplicar' : 'Entrar'}
                            </button>
                          </>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Grid de Produtos e demais seções (resumido para foco na mudança) */}
      <div className="shrink-0 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-4 overflow-x-auto no-scrollbar flex items-center gap-2">
          {availableCategoryNames.map(cat => (
            <button key={cat} onClick={() => handleCategoryChange(cat)} className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest shrink-0 transition-all ${selectedCategoryName === cat ? 'text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`} style={selectedCategoryName === cat ? { backgroundColor: primaryColor } : {}}>{cat}</button>
          ))}
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8 my-8 mb-24 lg:mb-16">
        {isLoading ? (
          <div className="col-span-full py-20 flex justify-center"><Loader2 className="animate-spin" style={{ color: primaryColor }} size={32} /></div>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div key={product.id} onClick={() => setViewingProduct(product)} className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-100 flex flex-col cursor-pointer h-full">
              <div className="aspect-square bg-slate-50 overflow-hidden relative shrink-0">
                {product.images && product.images.length > 0 ? (
                  <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={product.name} />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2 p-4"><ImageOff size={32} strokeWidth={1} /><span className="text-xs font-black uppercase tracking-tighter text-center">Sem foto</span></div>
                )}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4"><span className="bg-slate-900/80 backdrop-blur-md text-white text-[9px] sm:text-[11px] font-black uppercase tracking-wider px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg shadow-lg border border-white/10">#{String(product.id).substring(0, 6)}</span></div>
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); addToCart(product); }} className="p-2 sm:p-3 bg-white rounded-xl sm:rounded-2xl shadow-xl shadow-black/5 hover:brightness-110 transition-all active:scale-90" style={{ color: primaryColor }}><Plus size={18} sm:size={20} strokeWidth={3} /></button>
                </div>
              </div>
              <div className="p-4 sm:p-6 lg:p-7 flex flex-col flex-1 justify-between">
                <div>
                  <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest line-clamp-1 opacity-60" style={{ color: primaryColor }}>{product.category || 'Geral'}</span>
                  <h3 className="font-bold text-slate-800 text-sm sm:text-lg leading-tight line-clamp-2 mb-2 sm:mb-3 mt-1">{product.name || 'Sem nome'}</h3>
                  <p className="font-black text-base sm:text-xl" style={{ color: primaryColor }}>R$ {(product.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <button className="mt-4 sm:mt-6 w-full py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-transparent text-white" style={{ backgroundColor: primaryColor, borderColor: primaryColor }}>Ver Detalhes <ArrowRight size={12} sm:size={14}/></button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center opacity-40"><Package className="mx-auto mb-4" size={48} /><p className="font-black uppercase tracking-widest text-sm">Nenhum produto encontrado</p></div>
        )}
      </main>

      {/* Auth Modal (Login/Cadastro) */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg"><UserIcon size={20} /></div>
                 <div>
                   <h3 className="font-black uppercase tracking-tight text-sm">{authTab === 'login' ? 'Entrar na Vitrine' : 'Criar minha conta'}</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Portal do Cliente</p>
                 </div>
               </div>
               <button onClick={() => setIsAuthModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={24}/></button>
            </div>

            <div className="p-8 space-y-6">
               <div className="flex bg-slate-100 p-1 rounded-2xl">
                 <button onClick={() => setAuthTab('login')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${authTab === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Login</button>
                 <button onClick={() => setAuthTab('register')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${authTab === 'register' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Cadastro</button>
               </div>

               {authError && <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in shake duration-300"><AlertCircle size={20} /><span className="text-xs font-bold">{authError}</span></div>}

               <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {authTab === 'register' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nome Completo</label>
                      <div className="relative"><UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/><input required type="text" value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" placeholder="Ex: João Silva" /></div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">E-mail</label>
                    <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/><input required type="email" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" placeholder="seu@email.com" /></div>
                  </div>
                  {authTab === 'register' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">WhatsApp</label>
                      <div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/><input required type="tel" value={authForm.phone} onChange={e => setAuthForm({...authForm, phone: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" placeholder="(11) 99999-9999" /></div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Senha (Mín. 6 chars)</label>
                    <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/><input required minLength={6} type="password" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" placeholder="••••••••" /></div>
                  </div>

                  <button type="submit" disabled={authLoading} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-95">
                    {authLoading ? <Loader2 className="animate-spin" size={20} /> : (authTab === 'login' ? <LogIn size={20}/> : <UserPlus size={20}/>)}
                    {authTab === 'login' ? 'Entrar agora' : 'Confirmar Cadastro'}
                  </button>
               </form>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3"><ShoppingCart style={{ color: primaryColor }} size={24} /><h3 className="font-black text-slate-800 uppercase tracking-tight">Seu Carrinho</h3></div>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-all"><X size={24}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length > 0 ? (
                <>
                  <div className="space-y-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex gap-4 p-4 bg-slate-50 rounded-3xl border border-slate-100 group animate-in slide-in-from-bottom-2">
                        <div className="w-20 h-20 bg-white rounded-2xl overflow-hidden border border-slate-100 shrink-0">{item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageOff size={24}/></div>}</div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm truncate">{item.productName}</h4>
                            <p className="text-xs font-black text-slate-400 mt-1">R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-2 py-1"><button onClick={() => updateCartQuantity(item.id, -1)} className="p-1 text-slate-400 hover:brightness-75" style={{ color: primaryColor }}><Minus size={14}/></button><span className="text-xs font-black w-4 text-center">{item.quantity}</span><button onClick={() => updateCartQuantity(item.id, 1)} className="p-1 text-slate-400 hover:brightness-75" style={{ color: primaryColor }}><Plus size={14}/></button></div>
                            <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                      <Ticket size={14} className="text-indigo-500" /> Cupom de Desconto
                    </div>
                    {appliedPromotion ? (
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-3 rounded-2xl animate-in zoom-in">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center"><Check size={18} /></div>
                          <div><p className="text-xs font-black text-emerald-700 uppercase">{appliedPromotion.code}</p><p className="text-[9px] font-bold text-emerald-600">Desconto aplicado com sucesso!</p></div>
                        </div>
                        <button onClick={() => setAppliedPromotion(null)} className="p-1.5 text-emerald-400 hover:text-red-500"><X size={18}/></button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input type="text" placeholder={loggedCustomer ? "Digite o cupom..." : "Faça login para usar cupons"} disabled={!loggedCustomer} value={couponInput} onChange={e => setCouponInput(e.target.value.toUpperCase())} className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase outline-none focus:ring-2 disabled:opacity-50" style={{ '--tw-ring-color': primaryColor + '30' } as any} />
                        <button onClick={() => loggedCustomer ? handleApplyCoupon() : setIsAuthModalOpen(true)} className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">
                          {loggedCustomer ? 'Aplicar' : 'Entrar'}
                        </button>
                      </div>
                    )}
                    {couponError && <p className="text-[9px] font-bold text-red-500 flex items-center gap-1 px-1 animate-in shake duration-300"><AlertCircle size={10}/> {couponError}</p>}
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40"><ShoppingCart size={64} className="text-slate-300" /><p className="font-black text-slate-800 uppercase tracking-widest text-sm">Carrinho Vazio</p></div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 bg-slate-900 text-white space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-slate-400"><span className="text-[10px] font-black uppercase tracking-widest">Subtotal</span><span className="text-sm font-bold">R$ {cartSubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                  {appliedPromotion && <div className="flex items-center justify-between text-emerald-400"><span className="text-[10px] font-black uppercase tracking-widest">Desconto</span><span className="text-sm font-bold">- R$ {discountValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between"><span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Total Geral</span><span className="text-3xl font-black" style={{ color: primaryColor }}>R$ {cartTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                </div>
                <button onClick={handleSendOrder} className="w-full py-5 text-white rounded-2xl font-black uppercase text-sm tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 hover:brightness-110" style={{ backgroundColor: primaryColor }}><MessageCircle size={20} /> Enviar Pedido</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Restante do componente permanece o mesmo... */}
    </div>
  );
};

export default PublicCatalogView;
