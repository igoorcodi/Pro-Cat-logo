
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
  ChevronDown,
  Ticket,
  AlertCircle,
  Copy,
  Info,
  User as UserIcon,
  LogIn,
  LogOut,
  Lock,
  UserPlus,
  UserCircle,
  Layers,
  ShieldCheck
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
  const [selectedSubForModal, setSelectedSubForModal] = useState<Subcategory | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [cardImageIndexes, setCardImageIndexes] = useState<Record<string | number, number>>({});
  
  const [loggedCustomer, setLoggedCustomer] = useState<Customer | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register' | 'profile'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [usedPromotionIds, setUsedPromotionIds] = useState<(string | number)[]>([]);

  const [authForm, setAuthForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [couponInput, setCouponInput] = useState('');
  const [appliedPromotion, setAppliedPromotion] = useState<Promotion | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [isSendingOrder, setIsSendingOrder] = useState(false);

  const primaryColor = catalog?.primaryColor || '#4f46e5';

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

  useEffect(() => {
    if (!viewingProduct) {
      setSelectedSubForModal(null);
      setCurrentImageIndex(0);
    }
  }, [viewingProduct]);

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
          if (rError.message.includes('unique')) setAuthError('Este e-mail já está em uso nesta loja.');
          else setAuthError('Erro ao cadastrar. Tente novamente.');
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
    setIsAuthModalOpen(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCoupon(text);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

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
      setAuthError('Você precisa entrar ou se cadastrar para utilizar cupons.');
      setIsAuthModalOpen(true);
      return;
    }

    const targetCode = code || couponInput;
    setCouponError(null);
    const promo = promotions.find(p => p.code.toUpperCase() === targetCode.toUpperCase() && p.status === 'active');

    if (!promo) { setCouponError('Cupom inválido.'); return; }
    if (usedPromotionIds.includes(promo.id)) { setCouponError('Você já utilizou este cupom.'); return; }
    if (promo.expiry_date && new Date(promo.expiry_date) < new Date()) { setCouponError('Cupom expirado.'); return; }
    if (promo.usage_limit > 0 && promo.usage_count >= promo.usage_limit) { setCouponError('Cupom esgotado.'); return; }

    if (promo.min_order_value > cartSubtotal) {
      setCouponError(`Mínimo de R$ ${promo.min_order_value.toLocaleString('pt-BR')}`);
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

    setIsSendingOrder(true);

    try {
      // REGISTRO AUTOMÁTICO NA TABELA showcase_orders
      // Somente se houver um cliente logado
      if (loggedCustomer && catalog?.user_id) {
        const { error: orderError } = await supabase
          .from('showcase_orders')
          .insert({
            user_id: catalog.user_id,
            customer_id: loggedCustomer.id,
            client_name: loggedCustomer.name,
            client_phone: loggedCustomer.phone,
            items: cart,
            total: cartTotal,
            coupon_code: appliedPromotion?.code || null,
            status: 'waiting'
          });

        if (orderError) {
          console.error("Erro ao registrar pedido no sistema:", orderError);
          // Opcional: alertar o cliente ou apenas prosseguir para o WhatsApp
        }

        if (appliedPromotion) {
          await supabase.from('customer_coupon_usage').insert({
              customer_id: loggedCustomer.id,
              promotion_id: appliedPromotion.id,
              user_id: catalog.user_id
          });
        }
      }

      // MONTAGEM DA MENSAGEM DO WHATSAPP
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

      const encoded = encodeURIComponent(message);
      window.open(`https://wa.me/${sellerPhone}?text=${encoded}`, '_blank');
      
      // Limpar carrinho após sucesso? (Opcional, geralmente bom manter até o cliente confirmar no whats)
      // setCart([]); 
    } catch (err) {
      console.error("Falha ao processar pedido:", err);
    } finally {
      setIsSendingOrder(false);
    }
  };

  const addToCart = (product: Product, sub: Subcategory | null = null) => {
    const cartId = `${product.id}_${sub?.id || 'none'}`;
    setCart(prev => {
      const existing = prev.find(item => item.id === cartId);
      if (existing) return prev.map(item => item.id === cartId ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { id: cartId, productId: product.id, productName: product.name, price: product.price, quantity: 1, image: product.images?.[0], selectedSub: sub }];
    });
    setViewingProduct(null);
    setIsCartOpen(true);
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  };

  const removeFromCart = (id: string) => { setCart(prev => prev.filter(item => item.id !== id)); };

  const handleCategoryChange = (cat: string) => { setSelectedCategoryName(cat); setSelectedSubcategoryId('Todas'); };

  const getCardActiveImage = (productId: string | number) => cardImageIndexes[productId] || 0;
  
  const handlePrevCardImage = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const imgs = product.images || [];
    if (imgs.length <= 1) return;
    const current = getCardActiveImage(product.id);
    const next = current === 0 ? imgs.length - 1 : current - 1;
    setCardImageIndexes(prev => ({ ...prev, [product.id]: next }));
  };

  const handleNextCardImage = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const imgs = product.images || [];
    if (imgs.length <= 1) return;
    const current = getCardActiveImage(product.id);
    const next = (current + 1) % imgs.length;
    setCardImageIndexes(prev => ({ ...prev, [product.id]: next }));
  };

  const getProductSubcategories = (product: Product) => {
    const ids = product.subcategoryIds || product.subcategory_ids || [];
    if (ids.length === 0) return [];

    const result: Subcategory[] = [];
    categories.forEach(cat => {
      cat.subcategories?.forEach(sub => {
        if (ids.includes(sub.id)) {
          result.push(sub);
        }
      });
    });
    return result;
  };

  const displayLogoUrl = catalog?.logoUrl || company?.logo_url;

  const titleFontSizeClasses = {
    sm: 'text-2xl sm:text-3xl',
    md: 'text-3xl sm:text-5xl',
    lg: 'text-4xl sm:text-6xl',
    xl: 'text-5xl sm:text-7xl'
  };

  const subtitleFontSizeClasses = {
    sm: 'text-xs sm:text-sm',
    md: 'text-sm sm:text-lg',
    lg: 'text-lg sm:text-2xl'
  };

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

            {loggedCustomer ? (
               <button 
                onClick={() => { setAuthTab('profile'); setIsAuthModalOpen(true); }}
                className="flex items-center gap-2 bg-slate-100 pl-3 pr-1 py-1 rounded-full border border-slate-200 hover:bg-slate-200 transition-all"
               >
                  <span className="text-[10px] font-black text-slate-700 uppercase truncate max-w-[80px]">Olá, {loggedCustomer.name.split(' ')[0]}</span>
                  <div className="w-8 h-8 bg-white text-indigo-600 rounded-full flex items-center justify-center shadow-sm"><UserCircle size={18}/></div>
               </button>
            ) : (
              <button onClick={() => { setAuthTab('login'); setIsAuthModalOpen(true); }} className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition-all active:scale-90 flex items-center gap-2">
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

      <div className="shrink-0 relative h-96 sm:h-[32rem] lg:h-[60vh] overflow-hidden bg-slate-900">
        {catalog?.coverImage ? (
          <img src={catalog.coverImage} className="w-full h-full object-cover" alt="Capa" />
        ) : (
          <div className="w-full h-full bg-slate-800" />
        )}
        <div className="absolute inset-0 bg-black/50 bg-gradient-to-t from-black/80 via-black/40 to-black/30 flex flex-col items-center justify-center text-center p-6 sm:p-12">
          <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {catalog?.coverTitle ? (
              <h1 className={`${titleFontSizeClasses[catalog.titleFontSize || 'lg']} font-black text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] leading-tight mb-4 uppercase tracking-tighter`}>
                {catalog.coverTitle}
              </h1>
            ) : (
              <h1 className="text-3xl sm:text-5xl font-black text-white drop-shadow-lg mb-4">{catalog?.name || 'Catálogo Virtual'}</h1>
            )}
            
            {catalog?.coverSubtitle && (
              <p className={`${subtitleFontSizeClasses[catalog.subtitleFontSize || 'md']} text-white/90 font-bold uppercase tracking-widest drop-shadow-md mb-6 max-w-2xl mx-auto leading-relaxed`}>
                {catalog.coverSubtitle}
              </p>
            )}

            {!catalog?.coverTitle && catalog?.description && (
              <p className="text-white/90 text-xs sm:text-sm mt-2 max-w-md line-clamp-3 font-medium">{catalog?.description}</p>
            )}
            
            <div className="mt-12 animate-bounce opacity-50">
              <ChevronDown className="text-white" size={32} />
            </div>
          </div>
        </div>
      </div>

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
                              {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `R$ ${promo.discount_value} OFF`}
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
                          <p className="text-[9px] font-medium text-indigo-200/80 italic flex items-center gap-1">
                             <Info size={10} /> O uso será validado ao enviar o pedido pelo WhatsApp.
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

      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-4 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 my-6 sm:my-8 mb-24 lg:mb-16">
        {isLoading ? (
          <div className="col-span-full py-20 flex justify-center"><Loader2 className="animate-spin" style={{ color: primaryColor }} size={32} /></div>
        ) : products.filter(p => !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? (
          products.filter(p => !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(product => {
            const productSubs = getProductSubcategories(product);
            const activeImgIdx = getCardActiveImage(product.id);
            const imgs = product.images || [];
            const hasMultipleImgs = imgs.length > 1;

            return (
              <div key={product.id} onClick={() => setViewingProduct(product)} className="group bg-white rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 flex flex-col cursor-pointer h-full relative">
                <div className="aspect-square bg-slate-50 overflow-hidden relative shrink-0">
                  {imgs.length > 0 ? (
                    <img 
                      key={`${product.id}-${activeImgIdx}`}
                      src={imgs[activeImgIdx]} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 animate-in fade-in" 
                      alt={product.name} 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300"><ImageOff size={32} /></div>
                  )}
                  
                  {hasMultipleImgs && (
                    <>
                      <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                          onClick={(e) => handlePrevCardImage(e, product)}
                          className="p-1.5 bg-white/80 backdrop-blur-md text-slate-800 rounded-full shadow-lg hover:bg-white active:scale-90 transition-all"
                         >
                           <ChevronLeft size={16} />
                         </button>
                         <button 
                          onClick={(e) => handleNextCardImage(e, product)}
                          className="p-1.5 bg-white/80 backdrop-blur-md text-slate-800 rounded-full shadow-lg hover:bg-white active:scale-90 transition-all"
                         >
                           <ChevronRight size={16} />
                         </button>
                      </div>
                      
                      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                        {imgs.map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-1 h-1 rounded-full transition-all ${i === activeImgIdx ? 'w-3 bg-white' : 'bg-white/40'}`} 
                          />
                        ))}
                      </div>
                    </>
                  )}

                  <div className="absolute top-2 left-2 flex flex-wrap gap-1 sm:hidden">
                    <span className="bg-black/20 backdrop-blur-md text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full">
                      {product.category || 'Geral'}
                    </span>
                  </div>
                </div>
                
                <div className="p-3 sm:p-4 flex flex-col flex-1">
                  <div className="flex-1">
                    <div className="hidden sm:flex flex-wrap items-center gap-1.5 mb-1.5">
                       <span className="text-[8px] font-black uppercase text-slate-400">{product.category || 'Geral'}</span>
                       {productSubs.length > 0 && (
                         <>
                           <span className="text-slate-200 text-[8px]">•</span>
                           <span className="text-[7px] font-bold text-indigo-400 bg-indigo-50 px-1.5 py-0.5 rounded-full uppercase truncate max-w-[80px]">
                             {productSubs.map(s => s.name).join(', ')}
                           </span>
                         </>
                       )}
                    </div>
                    <h3 className="font-bold text-slate-800 text-[11px] sm:text-sm leading-tight line-clamp-2 min-h-[2.5em] sm:min-h-0">{product.name}</h3>
                    <div className="mt-2 flex items-center gap-2">
                       <p className="font-black text-xs sm:text-base bg-indigo-50/50 sm:bg-transparent px-2 py-1 sm:p-0 rounded-lg" style={{ color: primaryColor }}>
                         R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                       </p>
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-4 flex gap-1.5 sm:gap-2">
                     <button
                       onClick={(e) => { e.stopPropagation(); setViewingProduct(product); }}
                       className="flex-1 py-2 sm:py-3 px-1.5 sm:px-2 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-tighter sm:tracking-widest border-2 border-slate-100 text-slate-500 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all active:scale-95 flex items-center justify-center gap-1 sm:gap-1.5"
                     >
                       <Info size={12} className="shrink-0 sm:size-3.5" />
                       <span className="truncate">Ver Detalhes</span>
                     </button>
                     <button 
                       onClick={(e) => { e.stopPropagation(); addToCart(product); }} 
                       className="p-2 sm:p-3 rounded-xl sm:rounded-2xl text-white shadow-lg active:scale-90 transition-all hover:brightness-110 flex items-center justify-center shrink-0"
                       style={{ backgroundColor: primaryColor }}
                     >
                       <ShoppingCart size={16} className="sm:size-[18px]" />
                     </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center opacity-40"><Package className="mx-auto mb-4" size={48} /><p className="font-black uppercase tracking-widest text-sm">Nenhum produto encontrado</p></div>
        )}
      </main>

      {company && (
        <footer className="bg-white border-t border-slate-200 mt-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {displayLogoUrl ? (
                    <img src={displayLogoUrl} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt="Logo" />
                  ) : (
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                      <Building2 size={24} />
                    </div>
                  )}
                  <div>
                    <h4 className="font-black text-slate-800 uppercase tracking-tight leading-tight">
                      {company.trading_name || company.name}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {company.name}
                    </p>
                  </div>
                </div>
                <p className="text-slate-500 text-sm font-medium max-w-xs leading-relaxed">
                  Confira nossas coleções exclusivas e faça seu pedido direto pelo WhatsApp. Qualidade e confiança em cada item.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-800">
                  <MapPin size={18} style={{ color: primaryColor }} />
                  <h5 className="text-[10px] font-black uppercase tracking-[0.2em]">Onde Estamos</h5>
                </div>
                <div className="text-slate-500 text-sm font-medium space-y-1">
                  <p>{company.address || 'Endereço não informado'}{company.number ? `, ${company.number}` : ''}</p>
                  <p>{company.neighborhood}{company.neighborhood && company.city ? ' • ' : ''}{company.city}{company.state ? `/${company.state}` : ''}</p>
                  {company.zip_code && <p className="text-xs font-black text-slate-400 mt-2">CEP: {company.zip_code}</p>}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 text-slate-800">
                  <Globe size={18} style={{ color: primaryColor }} />
                  <h5 className="text-[10px] font-black uppercase tracking-[0.2em]">Canais de Venda</h5>
                </div>
                <div className="flex flex-col gap-3">
                  {company.whatsapp && (
                    <a 
                      href={`https://wa.me/${company.whatsapp.replace(/\D/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 hover:bg-emerald-100 transition-all font-bold text-xs"
                    >
                      <MessageCircle size={18} /> 
                      <span>{company.whatsapp}</span>
                    </a>
                  )}
                  {company.instagram && (
                    <a 
                      href={`https://instagram.com/${company.instagram.replace('@', '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-pink-50 text-pink-700 rounded-2xl border border-pink-100 hover:bg-pink-100 transition-all font-bold text-xs"
                    >
                      <Instagram size={18} />
                      <span>@{company.instagram.replace('@', '')}</span>
                    </a>
                  )}
                  {company.email && (
                    <div className="flex items-center gap-3 p-3 text-slate-500 font-bold text-xs">
                      <Mail size={18} className="opacity-40" />
                      <span>{company.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-400">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {company.document ? `CNPJ/CPF: ${company.document}` : 'Documento não informado'}
                </span>
              </div>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] flex items-center gap-2">
                <Package size={12} /> Pro Catálogo © {new Date().getFullYear()} • Vitrine Digital
              </p>
            </div>
          </div>
        </footer>
      )}

      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            {authTab === 'profile' && loggedCustomer ? (
              <div className="flex flex-col h-full max-h-[85vh]">
                 <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"><UserCircle size={28} /></div>
                      <div>
                        <h3 className="font-black text-sm uppercase">Sua Conta</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Portal do Cliente</p>
                      </div>
                    </div>
                    <button onClick={() => setIsAuthModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={24}/></button>
                 </div>
                 <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Completo</p>
                       <p className="font-bold text-slate-800">{loggedCustomer.name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail</p>
                          <p className="text-xs font-bold text-slate-600 truncate">{loggedCustomer.email}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp</p>
                          <p className="text-xs font-bold text-slate-600">{loggedCustomer.phone}</p>
                       </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 space-y-4">
                       <div className="flex items-center gap-2 text-indigo-600">
                         <Ticket size={16} />
                         <h4 className="text-[10px] font-black uppercase tracking-widest">Cupons Utilizados ({usedPromotionIds.length})</h4>
                       </div>
                       
                       <div className="space-y-2">
                          {usedPromotionIds.length > 0 ? (
                            promotions.filter(p => usedPromotionIds.includes(p.id)).map(promo => (
                              <div key={promo.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                 <span className="font-black text-[10px] text-slate-600 uppercase tracking-widest">{promo.code}</span>
                                 <span className="text-[9px] font-bold text-emerald-600 uppercase">Utilizado ✅</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-center py-6 text-xs text-slate-400 font-medium italic">Nenhum cupom utilizado ainda.</p>
                          )}
                       </div>
                    </div>

                    <button onClick={handleLogout} className="w-full py-4 mt-4 bg-red-50 text-red-500 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white">
                      <LogOut size={16}/> Sair da Conta
                    </button>
                 </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg"><UserIcon size={20} /></div>
                    <div>
                      <h3 className="font-black uppercase tracking-tight text-sm">{authTab === 'login' ? 'Entrar na Vitrine' : 'Criar minha conta'}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Acesso Exclusivo</p>
                    </div>
                  </div>
                  <button onClick={() => setIsAuthModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={24}/></button>
                </div>

                <div className="p-8 space-y-6">
                  <div className="flex bg-slate-100 p-1 rounded-2xl">
                    <button onClick={() => setAuthTab('login')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${authTab === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Login</button>
                    <button onClick={() => setAuthTab('register')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${authTab === 'register' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Cadastro</button>
                  </div>

                  {authError && <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 animate-in shake"><AlertCircle size={18} className="shrink-0 mt-0.5" /><span className="text-xs font-bold leading-tight">{authError}</span></div>}

                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                    {authTab === 'register' && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nome Completo</label>
                        <div className="relative"><UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/><input required type="text" value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2" placeholder="Ex: João Silva" /></div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">E-mail</label>
                      <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/><input required type="email" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2" placeholder="seu@email.com" /></div>
                    </div>
                    {authTab === 'register' && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">WhatsApp</label>
                        <div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/><input required type="tel" value={authForm.phone} onChange={e => setAuthForm({...authForm, phone: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2" placeholder="(11) 99999-9999" /></div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Senha (Mín. 6 chars)</label>
                      <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/><input required minLength={6} type="password" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2" placeholder="••••••••" /></div>
                    </div>

                    <button type="submit" disabled={authLoading} className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-lg active:scale-95 disabled:opacity-70">
                      {authLoading ? <Loader2 className="animate-spin" size={20} /> : (authTab === 'login' ? <LogIn size={20}/> : <UserPlus size={20}/>)}
                      {authTab === 'login' ? 'Entrar agora' : 'Confirmar Cadastro'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.id} className="flex gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 group">
                        <div className="w-16 h-16 bg-white rounded-xl overflow-hidden border shrink-0">{item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageOff size={20}/></div>}</div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div className="flex flex-col">
                            <h4 className="font-bold text-slate-800 text-xs truncate">{item.productName}</h4>
                            {item.selectedSub && <span className="text-[9px] font-black text-indigo-500 uppercase">Opção: {item.selectedSub.name}</span>}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-black text-indigo-600">R$ {item.price.toLocaleString('pt-BR')}</p>
                            <div className="flex items-center gap-2 bg-white border rounded-lg px-1 py-0.5">
                              <button onClick={() => updateCartQuantity(item.id, -1)} className="p-1"><Minus size={10}/></button>
                              <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                              <button onClick={() => updateCartQuantity(item.id, 1)} className="p-1"><Plus size={10}/></button>
                              <button onClick={() => removeFromCart(item.id)} className="ml-1 p-1 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={12}/></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Ticket size={14} className="text-indigo-500" /> Cupom de Desconto
                      </div>
                      {!loggedCustomer && <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Login Obrigatório</span>}
                    </div>
                    {appliedPromotion ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-3 rounded-2xl animate-in zoom-in">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center"><Check size={18} /></div>
                            <div><p className="text-xs font-black text-emerald-700 uppercase">{appliedPromotion.code}</p><p className="text-[9px] font-bold text-emerald-600">Cupom aplicado com sucesso!</p></div>
                          </div>
                          <button onClick={() => setAppliedPromotion(null)} className="p-1.5 text-emerald-400 hover:text-red-500"><X size={18}/></button>
                        </div>
                        <p className="text-[9px] font-medium text-slate-400 italic flex items-center gap-1 px-1">
                           <Info size={10} /> O cupom será registrado ao enviar o pedido pelo WhatsApp.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <input type="text" placeholder={loggedCustomer ? "Digite o cupom..." : "Faça login para usar"} disabled={!loggedCustomer} value={couponInput} onChange={e => setCouponInput(e.target.value.toUpperCase())} className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase outline-none focus:ring-2 disabled:opacity-50" />
                          <button onClick={() => loggedCustomer ? handleApplyCoupon() : setIsAuthModalOpen(true)} className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">
                            {loggedCustomer ? 'Aplicar' : 'Entrar'}
                          </button>
                        </div>
                        <p className="text-[9px] font-medium text-slate-400 italic flex items-center gap-1 px-1">
                           <Info size={10} /> Descontos são validados na etapa final (WhatsApp).
                        </p>
                      </div>
                    )}
                    {couponError && <p className="text-[9px] font-bold text-red-500 flex items-center gap-1 px-1 animate-in shake"><AlertCircle size={10}/> {couponError}</p>}
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40"><ShoppingCart size={64} className="text-slate-300" /><p className="font-black text-slate-800 uppercase tracking-widest text-sm">Carrinho Vazio</p></div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 bg-slate-900 text-white space-y-6 shrink-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-slate-400"><span className="text-[10px] font-black uppercase tracking-widest">Subtotal</span><span className="text-sm font-bold">R$ {cartSubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                  {appliedPromotion && <div className="flex items-center justify-between text-emerald-400"><span className="text-[10px] font-black uppercase tracking-widest">Desconto</span><span className="text-sm font-bold">- R$ {discountValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between"><span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Total Geral</span><span className="text-3xl font-black" style={{ color: primaryColor }}>R$ {cartTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                </div>
                <button 
                  onClick={handleSendOrder} 
                  disabled={isSendingOrder}
                  className="w-full py-5 text-white rounded-2xl font-black uppercase text-sm tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 hover:brightness-110 disabled:opacity-70" 
                  style={{ backgroundColor: primaryColor }}
                >
                  {isSendingOrder ? <Loader2 className="animate-spin" size={20} /> : <MessageCircle size={20} />} 
                  {isSendingOrder ? 'Processando...' : 'Enviar Pedido'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {viewingProduct && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-5xl rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 flex flex-col sm:flex-row max-h-[90vh]">
            <div className="w-full sm:w-1/2 bg-slate-100 relative h-[40vh] sm:h-auto shrink-0 flex flex-col">
              <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-slate-50">
                {viewingProduct.images && viewingProduct.images.length > 0 ? (
                  <>
                    <img 
                      key={currentImageIndex}
                      src={viewingProduct.images[currentImageIndex]} 
                      className="w-full h-full object-cover animate-in fade-in duration-500" 
                      alt={viewingProduct.name}
                    />
                    
                    {viewingProduct.images.length > 1 && (
                      <>
                        <button 
                          onClick={() => setCurrentImageIndex(prev => (prev === 0 ? viewingProduct.images!.length - 1 : prev - 1))}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/50 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-all active:scale-90"
                        >
                          <ChevronLeft size={24} />
                        </button>
                        <button 
                          onClick={() => setCurrentImageIndex(prev => (prev + 1) % viewingProduct.images!.length)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/50 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-all active:scale-90"
                        >
                          <ChevronRight size={24} />
                        </button>
                        
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                          {viewingProduct.images.map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === currentImageIndex ? 'w-6 bg-white shadow-sm' : 'bg-white/40'}`} />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageOff size={48}/></div>
                )}
                <button onClick={() => setViewingProduct(null)} className="absolute top-4 right-4 p-2 bg-slate-900/40 backdrop-blur-md text-white rounded-full sm:hidden transition-transform active:scale-90"><X size={24} /></button>
              </div>

              {viewingProduct.images && viewingProduct.images.length > 1 && (
                <div className="bg-white p-3 border-t border-slate-100 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
                   {viewingProduct.images.map((img, i) => (
                     <button 
                       key={i} 
                       onClick={() => setCurrentImageIndex(i)}
                       className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${i === currentImageIndex ? 'border-indigo-600 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                     >
                       <img src={img} className="w-full h-full object-cover" alt="" />
                     </button>
                   ))}
                </div>
              )}
            </div>

            <div className="w-full sm:w-1/2 p-6 sm:p-10 flex flex-col overflow-y-auto">
              <div className="hidden sm:flex justify-end mb-4"><button onClick={() => setViewingProduct(null)} className="p-2 bg-slate-100 text-slate-400 rounded-full hover:bg-slate-200 transition-all"><X size={20} /></button></div>
              <div className="mb-6">
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: primaryColor }}>{viewingProduct.category || 'Geral'}</span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight mt-1">{viewingProduct.name}</h2>
              </div>
              <div className="flex-1 space-y-8">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sobre este item</h4>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{viewingProduct.description || 'Sem descrição.'}</p>
                </div>

                {(() => {
                  const productSubs = getProductSubcategories(viewingProduct);
                  if (productSubs.length === 0) return null;
                  return (
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Layers size={14}/> Selecione uma Opção
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {productSubs.map(sub => {
                          const subStock = viewingProduct.subcategory_stock?.[String(sub.id)] ?? 0;
                          const isOutOfStock = subStock <= 0;
                          
                          return (
                            <button 
                              key={sub.id}
                              disabled={isOutOfStock}
                              onClick={() => setSelectedSubForModal(sub)}
                              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-2 flex items-center gap-2 ${
                                selectedSubForModal?.id === sub.id 
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                                  : isOutOfStock 
                                    ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed opacity-50'
                                    : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-indigo-200'
                              }`}
                            >
                              {sub.name}
                              {isOutOfStock && <span className="text-[8px] bg-red-100 text-red-500 px-1 rounded ml-1">Esgotado</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col gap-4">
                <div className="flex items-baseline justify-between">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preço Unitário</p>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">R$ {viewingProduct.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                
                {(() => {
                  const subcategories = getProductSubcategories(viewingProduct);
                  const hasSubs = subcategories.length > 0;
                  
                  const canAdd = !hasSubs || (selectedSubForModal && (viewingProduct.subcategory_stock?.[String(selectedSubForModal.id)] ?? 0) > 0);
                  
                  const isGlobalOutOfStock = !hasSubs && (viewingProduct.stock <= 0);

                  return (
                    <button 
                      onClick={() => addToCart(viewingProduct, selectedSubForModal)} 
                      disabled={!canAdd || isGlobalOutOfStock}
                      className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 text-white hover:brightness-110 disabled:opacity-50 disabled:grayscale disabled:active:scale-100`}
                      style={{ backgroundColor: isGlobalOutOfStock ? '#94a3b8' : primaryColor }}
                    >
                      <ShoppingCart size={20}/> 
                      {isGlobalOutOfStock ? 'Produto Esgotado' : (canAdd ? 'Adicionar ao Carrinho' : 'Escolha uma opção disponível')}
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicCatalogView;
