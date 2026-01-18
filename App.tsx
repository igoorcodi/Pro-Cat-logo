
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  BookOpen, 
  BarChart3, 
  Settings, 
  LogOut, 
  Plus, 
  Menu, 
  X, 
  User as UserIcon,
  Tags,
  FileText,
  Users,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ListChecks,
  History
} from 'lucide-react';
import { supabase } from './supabase';
import { AppView, User, Product, Catalog, Category, Quotation, Customer, Company, StockHistoryEntry, PaymentMethod } from './types';
import Dashboard from './components/Dashboard';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import StockAdjustment from './components/StockAdjustment';
import StockHistoryModal from './components/StockHistoryModal';
import CatalogList from './components/CatalogList';
import CatalogForm from './components/CatalogForm';
import CategoryManager from './components/CategoryManager';
import SettingsView from './components/Settings';
import Auth from './components/Auth';
import QuotationList from './components/QuotationList';
import QuotationForm from './components/QuotationForm';
import PublicCatalogView from './components/PublicCatalogView';
import ShareCatalogModal from './components/ShareCatalogModal';
import CustomerList from './components/CustomerList';
import CustomerForm from './components/CustomerForm';
import ConfirmationModal from './components/ConfirmationModal';

const viewTitles: Record<string, string> = {
  'dashboard': 'Dashboard',
  'products': 'Produtos',
  'product-form': 'Novo Produto',
  'stock-adjustment': 'Ajuste de Estoque',
  'categories': 'Categorias',
  'catalogs': 'Catálogos',
  'reports': 'Relatórios',
  'settings': 'Configurações',
  'help': 'Ajuda',
  'quotations': 'Orçamentos',
  'quotation-form': 'Novo Orçamento',
  'public-catalog': 'Vitrine Digital',
  'customers': 'Clientes',
  'customer-form': 'Gerenciar Cliente',
  'reset-password': 'Redefinir Senha'
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('login');
  const [isInitializing, setIsInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [systemUsers, setSystemUsers] = useState<User[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [publicProducts, setPublicProducts] = useState<Product[]>([]);
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [isCloning, setIsCloning] = useState(false);
  const [viewingStockHistory, setViewingStockHistory] = useState<Product | null>(null);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | undefined>(undefined);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);
  const [editingCatalog, setEditingCatalog] = useState<Catalog | null | 'new'>(null);
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);
  const [publicSeller, setPublicSeller] = useState<{ name: string; phone?: string } | null>(null);
  const [isSharingCatalog, setIsSharingCatalog] = useState<Catalog | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLogoutConfirmationOpen, setIsLogoutConfirmationOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [publicCatalogError, setPublicCatalogError] = useState<string | null>(null);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'product' | 'customer' | 'quotation' | 'catalog';
    id: number | string;
    title: string;
    message: string;
    requiredText?: string;
  }>({
    isOpen: false,
    type: 'product',
    id: '',
    title: '',
    message: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const sanitizePayload = (payload: any, isNew: boolean = true) => {
    const cleaned = { ...payload };
    
    // IMPORTANTE: Em inserções (isNew), removemos o ID para o Trigger do banco gerar o sequencial
    if (isNew) {
      delete cleaned.id;
    }
    
    delete cleaned.createdAt;
    delete cleaned.created_at;
    
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === undefined || cleaned[key] === null) {
        delete cleaned[key];
      }
      if (typeof cleaned[key] === 'string' && cleaned[key].trim() === '') {
        delete cleaned[key];
      }
    });
    
    return cleaned;
  };

  const safeReplaceState = (url: string) => {
    try {
      if (window.history && window.history.replaceState) {
        const cleanUrl = url || (window.location.origin + window.location.pathname);
        window.history.replaceState({}, '', cleanUrl);
      }
    } catch (e) {
      console.warn('Falha segura: O navegador impediu a atualização da URL via script.', e);
    }
  };

  const forceLogout = useCallback(() => {
    localStorage.removeItem('catalog_pro_session');
    setUser(null);
    setView('login');
    setProducts([]);
    setPublicProducts([]);
    setCatalogs([]);
    setCategories([]);
    setQuotations([]);
    setCustomers([]);
    setCompany(null);
    setPaymentMethods([]);
    setSidebarOpen(false);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const publicCatalogId = params.get('c');
    const isRecovery = hashParams.get('type') === 'recovery' || params.get('type') === 'recovery';
    
    const initialize = async () => {
      try {
        if (isRecovery) {
          setView('reset-password');
          setIsInitializing(false);
          return;
        }

        if (publicCatalogId) {
          setView('public-catalog');
          setIsInitializing(false);
          setIsLoadingData(true);
          setPublicCatalogError(null);
          
          const isNumeric = /^\d+$/.test(publicCatalogId);
          let query = supabase.from('catalogs').select('*').eq('status', 'active');
          
          if (isNumeric) {
            query = query.or(`id.eq.${publicCatalogId},slug.eq.${publicCatalogId}`);
          } else {
            query = query.eq('slug', publicCatalogId);
          }

          const { data: catalogData, error: catError } = await query.maybeSingle();

          if (catError || !catalogData) {
            setPublicCatalogError("O catálogo solicitado não foi encontrado.");
            setIsLoadingData(false);
            return;
          }

          const { data: catData } = await supabase
            .from('categories')
            .select('*, subcategories(*)')
            .eq('user_id', catalogData.user_id)
            .eq('status', 'active');
          
          if (catData) setCategories(catData.map(c => ({
            ...c,
            subcategories: (c.subcategories || []).filter((s: any) => s.status === 'active')
          })));

          const { data: sellerData } = await supabase
            .from('users')
            .select('id, name, phone')
            .eq('id', catalogData.user_id)
            .maybeSingle();

          if (sellerData) {
            setPublicSeller(sellerData);
            const { data: companyData } = await supabase
              .from('companies')
              .select('*')
              .eq('user_id', sellerData.id)
              .eq('status', 'active')
              .maybeSingle();
            
            if (companyData) setCompany(companyData);
          }

          const productIds = catalogData.product_ids || [];
          if (productIds.length > 0) {
            const { data: prodData } = await supabase
              .from('products')
              .select('*')
              .in('id', productIds)
              .eq('status', 'active');
            
            if (prodData) {
              setPublicProducts(prodData.map(p => ({ 
                ...p, 
                subcategoryIds: p.subcategory_ids || [],
                category: catData?.find(c => c.id === p.category_id)?.name || 'Sem Categoria',
                createdAt: p.created_at 
              })));
            }
          }

          setSelectedCatalog({
            ...catalogData,
            productIds: catalogData.product_ids || [],
            coverImage: catalogData.cover_image,
            logoUrl: catalogData.logo_url,
            primaryColor: catalogData.primary_color,
            createdAt: catalogData.created_at
          });
          setIsLoadingData(false);
        } else {
          const session = localStorage.getItem('catalog_pro_session');
          if (session) {
            try {
              const parsed = JSON.parse(session);
              if (parsed && parsed.id) {
                setUser(parsed);
                setView('dashboard');
              }
            } catch (e) {
              localStorage.removeItem('catalog_pro_session');
              setView('login');
            }
          } else {
            setView('login');
          }
          setIsInitializing(false);
        }
      } catch (err) {
        setIsInitializing(false);
        setView('login');
      }
    };

    initialize();
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoadingData(true);
    
    try {
      const fetchCategories = async () => {
        try {
          const { data, error } = await supabase
            .from('categories')
            .select('*, subcategories(*)')
            .eq('user_id', user.id)
            .eq('status', 'active');
          if (error) throw error;
          
          return (data || []).map(cat => ({
            ...cat,
            subcategories: (cat.subcategories || []).filter((s: any) => s.status === 'active')
          }));
        } catch (e) { return []; }
      };

      const fetchProducts = async (catData: any[]) => {
        try {
          const { data, error } = await supabase.from('products').select('*').eq('user_id', user.id).eq('status', 'active').order('created_at', { ascending: false });
          if (error) throw error;
          if (data) {
            setProducts(data.map(p => ({ 
              ...p, 
              categoryId: p.category_id, 
              subcategoryIds: p.subcategory_ids || [],
              category: catData?.find(c => c.id === p.category_id)?.name || 'Sem Categoria', 
              createdAt: p.created_at 
            })));
          }
        } catch (e) {}
      };

      const fetchCatalogs = async () => {
        try {
          const { data, error } = await supabase
            .from('catalogs')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false });
          if (error) throw error;
          if (data) setCatalogs(data.map(c => ({ 
            ...c, 
            productIds: c.product_ids || [], 
            coverImage: c.cover_image, 
            logoUrl: c.logo_url, 
            primaryColor: c.primary_color,
            createdAt: c.created_at 
          })));
        } catch (e) {}
      };

      const fetchQuotations = async () => {
        try {
          const { data, error } = await supabase
            .from('quotations')
            .select('*')
            .eq('user_id', user.id)
            .neq('status', 'inactive')
            .order('created_at', { ascending: false });
          if (error) throw error;
          if (data) setQuotations(data.map(q => ({ 
            ...q, 
            clientName: q.client_name, 
            clientPhone: q.client_phone, 
            sellerName: q.seller_name, 
            quotationDate: q.quotation_date, 
            createdAt: q.created_at,
            paymentMethodId: q.payment_method_id
          })));
        } catch (e) {}
      };

      const fetchCustomers = async () => {
        try {
          const { data, error } = await supabase.from('customers').select('*').eq('user_id', user.id).eq('status', 'active').order('created_at', { ascending: false });
          if (error) throw error;
          if (data) setCustomers(data.map(c => ({ ...c, zipCode: c.zip_code, createdAt: c.created_at })));
        } catch (e) {}
      };

      const fetchCompany = async () => {
        try {
          const { data, error } = await supabase
            .from('companies')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle();
          if (error) throw error;
          if (data) setCompany(data);
        } catch (e) {}
      };

      const fetchPaymentMethods = async () => {
        try {
          const { data, error } = await supabase
            .from('payment_methods')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active');
          if (error) throw error;
          if (data) setPaymentMethods(data);
        } catch (e) {}
      };

      const categoriesData = await fetchCategories();
      setCategories(categoriesData);
      
      await Promise.all([
        fetchProducts(categoriesData),
        fetchCatalogs(),
        fetchQuotations(),
        fetchCustomers(),
        fetchCompany(),
        fetchPaymentMethods()
      ]);

    } catch (error) {
    } finally {
      setIsLoadingData(false);
    }
  }, [user]);

  useEffect(() => { if (user) fetchData(); }, [user, fetchData]);

  const handleLogin = (userData: User) => { 
    setUser(userData); 
    localStorage.setItem('catalog_pro_session', JSON.stringify(userData)); 
    setView('dashboard'); 
  };

  const triggerLogout = useCallback(() => {
    setIsLogoutConfirmationOpen(false);
    setIsLoggingOut(true); 
    setTimeout(() => { forceLogout(); setIsLoggingOut(false); }, 1000); 
  }, [forceLogout]);

  const handleLogoutRequest = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsLogoutConfirmationOpen(true);
  };

  const navigateTo = (newView: AppView) => { setView(newView); setSidebarOpen(false); };

  const handleOpenPublicCatalog = (catalog: Catalog) => {
    setSelectedCatalog(catalog);
    setPublicProducts(products.filter(p => catalog.productIds.includes(p.id)));
    if (user) setPublicSeller({ name: user.name, phone: user.phone });
    setView('public-catalog');
  };

  const handleSaveCustomer = async (customer: Partial<Customer>) => {
    if (!user) return;
    const id = customer.id;
    const isNew = !id;
    const dataToSave: any = sanitizePayload({ 
      ...customer, 
      user_id: user.id,
      zip_code: customer.zipCode 
    }, isNew);
    delete dataToSave.zipCode;

    const { error } = isNew 
      ? await supabase.from('customers').insert(dataToSave)
      : await supabase.from('customers').update(dataToSave).eq('id', id).eq('user_id', user.id);

    if (error) alert(error.message); else { fetchData(); setView('customers'); }
  };

  const handleSaveProduct = async (product: Partial<Product>, stockNote?: string) => {
    if (!user) return;
    const id = product.id;
    const isActuallyNew = !id || isCloning;
    
    const existing = isActuallyNew ? null : products.find(p => String(p.id) === String(id));
    const currentHistory = existing?.stock_history || [];
    const prevStockValue = existing?.stock || 0;

    const historyEntries: StockHistoryEntry[] = [...currentHistory];
    
    if (isActuallyNew) {
      historyEntries.push({
        id: crypto.randomUUID(),
        product_id: 'initial', 
        previous_stock: 0,
        new_stock: product.stock || 0,
        change_amount: product.stock || 0,
        reason: 'initial_stock',
        notes: stockNote || 'Cadastro inicial',
        created_at: new Date().toISOString(),
        user_name: user.name
      });
    } else if (product.stock !== undefined && product.stock !== prevStockValue) {
      historyEntries.push({
        id: crypto.randomUUID(),
        product_id: String(id), 
        previous_stock: prevStockValue,
        new_stock: product.stock,
        change_amount: product.stock - prevStockValue,
        reason: 'manual_adjustment',
        notes: stockNote || 'Alterado via formulário',
        created_at: new Date().toISOString(),
        user_name: user.name
      });
    }

    const dataToSave: any = sanitizePayload({
      ...product,
      user_id: user.id,
      category_id: product.categoryId || null,
      subcategory_ids: product.subcategoryIds || [],
      stock_history: historyEntries 
    }, isActuallyNew);
    
    delete dataToSave.categoryId;
    delete dataToSave.subcategoryId;
    delete dataToSave.subcategoryIds;
    delete dataToSave.category;

    const { data, error } = isActuallyNew 
      ? await supabase.from('products').insert(dataToSave).select()
      : await supabase.from('products').update(dataToSave).eq('id', id).eq('user_id', user.id).select();

    if (error) {
      console.error("Erro Supabase:", error);
      alert("Erro ao salvar produto: " + error.message);
    } else if (isActuallyNew && data?.[0]) {
      const realId = data[0].id;
      const updatedHistory = historyEntries.map(h => h.product_id === 'initial' ? { ...h, product_id: realId } : h);
      await supabase.from('products').update({ stock_history: updatedHistory }).eq('id', realId).eq('user_id', user.id);
      fetchData(); 
      setView('products');
    } else {
      fetchData(); 
      setView('products');
    }
  };

  const handleSaveBatchStock = async (updates: { id: string | number, newStock: number, notes?: string }[]) => {
    if (!user || !updates.length) return;
    
    try {
      for (const update of updates) {
        const existing = products.find(p => String(p.id) === String(update.id));
        if (!existing) continue;

        const prevStockValue = existing.stock || 0;
        const currentHistory = existing.stock_history || [];

        const newEntry: StockHistoryEntry = {
          id: crypto.randomUUID(),
          product_id: String(update.id), 
          previous_stock: prevStockValue,
          new_stock: update.newStock,
          change_amount: update.newStock - prevStockValue,
          reason: 'manual_adjustment',
          notes: update.notes || 'Ajuste em massa no painel',
          created_at: new Date().toISOString(),
          user_name: user.name
        };

        await supabase
          .from('products')
          .update({ 
            stock: update.newStock,
            stock_history: [...currentHistory, newEntry]
          })
          .eq('id', update.id)
          .eq('user_id', user.id);
      }
      fetchData();
      setView('products');
    } catch (err: any) {
      alert("Erro ao salvar ajustes: " + err.message);
    }
  };

  const handleSaveCatalog = async (catalog: Partial<Catalog>) => {
    if (!user) return;
    const id = catalog.id;
    const isNew = !id;
    const dataToSave: any = sanitizePayload({
      ...catalog,
      user_id: user.id,
      cover_image: catalog.coverImage,
      logo_url: catalog.logoUrl,
      primary_color: catalog.primaryColor,
      product_ids: catalog.productIds
    }, isNew);
    delete dataToSave.coverImage;
    delete dataToSave.logoUrl;
    delete dataToSave.primaryColor;
    delete dataToSave.productIds;

    const { error } = isNew 
      ? await supabase.from('catalogs').insert(dataToSave)
      : await supabase.from('catalogs').update(dataToSave).eq('id', id).eq('user_id', user.id);

    if (error) alert(error.message); else { fetchData(); setEditingCatalog(null); }
  };

  const handleSaveQuotation = async (quotation: Partial<Quotation>) => {
    if (!user) return;
    const id = quotation.id;
    const isNew = !id;
    
    let previousStatus = '';
    if (!isNew) {
      const { data: currentQ } = await supabase.from('quotations').select('status').eq('id', id).eq('user_id', user.id).maybeSingle();
      previousStatus = currentQ?.status || '';
    }

    const dataToSave: any = sanitizePayload({
      ...quotation,
      user_id: user.id,
      client_name: quotation.clientName,
      client_phone: quotation.clientPhone,
      seller_name: quotation.sellerName,
      quotation_date: quotation.quotationDate,
      payment_method_id: quotation.paymentMethodId
    }, isNew);
    delete dataToSave.clientName;
    delete dataToSave.clientPhone;
    delete dataToSave.sellerName;
    delete dataToSave.quotationDate;
    delete dataToSave.paymentMethodId;

    const { data: savedQuotation, error } = isNew 
      ? await supabase.from('quotations').insert(dataToSave).select()
      : await supabase.from('quotations').update(dataToSave).eq('id', id).eq('user_id', user.id).select();

    if (error) {
      alert('Erro ao salvar orçamento: ' + error.message);
      return;
    }

    if (quotation.status === 'delivered' && previousStatus !== 'delivered') {
      try {
        if (quotation.items && quotation.items.length > 0) {
          for (const item of quotation.items) {
            const { data: prod } = await supabase.from('products').select('*').eq('id', item.productId).eq('user_id', user.id).maybeSingle();
            if (prod) {
              const prevStockValue = prod.stock || 0;
              const newStockValue = Math.max(0, prevStockValue - (item.quantity || 0));
              const currentHistory = prod.stock_history || [];
              
              const newEntry: StockHistoryEntry = {
                id: crypto.randomUUID(),
                product_id: String(item.productId), 
                previous_stock: prevStockValue,
                new_stock: newStockValue,
                change_amount: -(item.quantity || 0),
                reason: 'sale_delivery',
                reference_id: String(id || savedQuotation?.[0]?.id),
                notes: `Venda para ${quotation.clientName}`,
                created_at: new Date().toISOString(),
                user_name: user.name
              };
              
              await supabase.from('products').update({ 
                stock: newStockValue,
                stock_history: [...currentHistory, newEntry]
              }).eq('id', item.productId).eq('user_id', user.id);
            }
          }
        }
      } catch (err) {
        console.error("Erro ao processar baixa de estoque:", err);
      }
    }

    fetchData(); 
    setView('quotations'); 
  };

  const handleSaveCompany = async (companyData: Partial<Company>) => {
    if (!user) return;
    const dataToSave = sanitizePayload({ ...companyData }, false);
    
    const { error } = await supabase
      .from('companies')
      .upsert({
        ...dataToSave,
        user_id: user.id
      }, { onConflict: 'user_id' });
      
    if (error) {
      alert('Erro ao salvar dados da empresa: ' + error.message);
    } else {
      fetchData();
    }
  };

  const openDeleteConfirmation = (type: 'product' | 'customer' | 'quotation' | 'catalog', id: number | string, name: string) => {
    setDeleteModal({ 
      isOpen: true, 
      type, 
      id, 
      title: type === 'catalog' ? 'Excluir Vitrine' : 'Excluir Item', 
      message: `Deseja realmente excluir "${name}"? Esta ação não pode ser desfeita.`,
      requiredText: type === 'catalog' ? name : undefined
    });
  };

  const processDeletion = async () => {
    if (!user) return;
    const { type, id } = deleteModal;
    setIsDeleting(true);
    try {
      let table = '';
      switch (type) {
        case 'product': table = 'products'; break;
        case 'customer': table = 'customers'; break;
        case 'quotation': table = 'quotations'; break;
        case 'catalog': table = 'catalogs'; break;
      }

      // Agora a deleção exige ID e USER_ID para garantir segurança com a nova PK composta
      const { error } = await supabase.from(table).delete().eq('id', id).eq('user_id', user.id);

      if (error) throw error;
      
      await fetchData();
      if (type === 'catalog') setEditingCatalog(null);
      setDeleteModal(prev => ({ ...prev, isOpen: false }));
    } catch (err: any) { 
      alert(err.message); 
    } finally { 
      setIsDeleting(false); 
    }
  };

  if (isInitializing) {
    return (
      <div className="h-screen w-screen bg-slate-50 flex flex-col items-center justify-center gap-6">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (view === 'public-catalog') {
    return (
      <PublicCatalogView 
        catalog={selectedCatalog} 
        products={publicProducts} 
        seller={publicSeller}
        company={company}
        isLoading={isLoadingData}
        error={publicCatalogError}
        categories={categories}
        onBack={() => {
          if (user) setView('catalogs'); else setView('login');
          safeReplaceState('');
        }} 
      />
    );
  }

  if (['login', 'register', 'onboarding', 'reset-password'].includes(view) && !user) {
    return <Auth view={view} setView={setView} onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden relative">
      {isLoggingOut && (
        <div className="fixed inset-0 z-[999] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center">
          <Loader2 className="animate-spin text-white" size={48} />
        </div>
      )}
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[45] lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col`}>
        <div className="flex items-center justify-between p-6 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center"><Package className="text-white" size={20} /></div>
            <span className="font-black text-xl text-white tracking-tighter uppercase">Pro Catálogo</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2"><X size={24} /></button>
        </div>
        <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={view === 'dashboard'} onClick={() => navigateTo('dashboard')} />
          <NavItem icon={<Users size={20} />} label="Clientes" active={view === 'customers'} onClick={() => navigateTo('customers')} />
          <NavItem icon={<Package size={20} />} label="Produtos" active={view === 'products' || view === 'stock-adjustment'} onClick={() => navigateTo('products')} />
          <NavItem icon={<Tags size={20} />} label="Categorias" active={view === 'categories'} onClick={() => navigateTo('categories')} />
          <NavItem icon={<BookOpen size={20} />} label="Catálogos" active={view === 'catalogs'} onClick={() => navigateTo('catalogs')} />
          <NavItem icon={<FileText size={20} />} label="Orçamentos" active={view === 'quotations'} onClick={() => navigateTo('quotations')} />
          <div className="pt-6 mt-6 border-t border-slate-800">
            <NavItem icon={<Settings size={20} />} label="Configurações" active={view === 'settings'} onClick={() => navigateTo('settings')} />
          </div>
        </nav>
        <div className="p-4 bg-slate-950/50">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center"><UserIcon className="text-indigo-400" size={20} /></div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white truncate uppercase tracking-widest">{user?.name}</p>
            </div>
            <button onClick={() => handleLogoutRequest()} className="p-3 bg-slate-800/50 hover:bg-red-600/20 rounded-xl text-slate-400 hover:text-red-400 transition-all">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 lg:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-10 shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 bg-slate-100 rounded-lg"><Menu size={20} /></button>
            <h2 className="text-lg lg:text-xl font-black text-slate-800 tracking-tight">{viewTitles[view]}</h2>
          </div>
          <div className="flex items-center gap-3">
            {['products'].includes(view) && (
              <div className="flex items-center gap-2">
                <button onClick={() => setView('stock-adjustment')} className="hidden sm:flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all">
                  <ListChecks size={18} /> Ajuste de Estoque
                </button>
                <button onClick={() => {
                  setEditingProduct(undefined); setIsCloning(false); setView('product-form');
                }} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 lg:px-6 py-2.5 rounded-xl font-black text-sm transition-all shadow-lg">
                  <Plus size={18} /><span className="hidden sm:inline uppercase tracking-widest text-[10px]">Adicionar</span>
                </button>
              </div>
            )}
            {['customers', 'quotations'].includes(view) && (
              <button onClick={() => {
                if (view === 'customers') { setEditingCustomer(undefined); setView('customer-form'); }
                else if (view === 'quotations') { setEditingQuotation(undefined); setView('quotation-form'); }
              }} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 lg:px-6 py-2.5 rounded-xl font-black text-sm transition-all shadow-lg">
                <Plus size={18} /><span className="hidden sm:inline uppercase tracking-widest text-[10px]">Adicionar</span>
              </button>
            )}
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 lg:p-10 custom-scrollbar">
          {view === 'dashboard' && <Dashboard products={products} catalogs={catalogs} quotations={quotations} />}
          {view === 'customers' && <CustomerList customers={customers} onEdit={(c) => { setEditingCustomer(c); setView('customer-form'); }} onDelete={(id, name) => openDeleteConfirmation('customer', id, name)} onAdd={() => { setEditingCustomer(undefined); setView('customer-form'); }} />}
          {view === 'customer-form' && <CustomerForm initialData={editingCustomer} onSave={handleSaveCustomer} onCancel={() => setView('customers')} />}
          {view === 'products' && (
            <ProductList 
              products={products} 
              onEdit={(p) => { setEditingProduct(p); setIsCloning(false); setView('product-form'); }} 
              onDelete={(id) => openDeleteConfirmation('product', id, 'Produto')} 
              onDuplicate={(p) => { setEditingProduct(p); setIsCloning(true); setView('product-form'); }} 
              onShowHistory={(p) => setViewingStockHistory(p)}
            />
          )}
          {view === 'product-form' && (
            <ProductForm 
              initialData={editingProduct} 
              categories={categories} 
              isClone={isCloning} 
              onSave={handleSaveProduct} 
              onCancel={() => setView('products')} 
              onShowHistory={(p) => setViewingStockHistory(p)}
            />
          )}
          {view === 'stock-adjustment' && <StockAdjustment products={products} onSave={handleSaveBatchStock} onCancel={() => setView('products')} />}
          {view === 'categories' && user && <CategoryManager categories={categories} user={user} onRefresh={fetchData} />}
          {view === 'catalogs' && <CatalogList catalogs={catalogs} products={products} onOpenPublic={handleOpenPublicCatalog} onEditCatalog={setEditingCatalog} onShareCatalog={setIsSharingCatalog} />}
          {view === 'quotations' && <QuotationList quotations={quotations} company={company} customers={customers} onEdit={(q) => { setEditingQuotation(q); setView('quotation-form'); }} onDelete={(id) => openDeleteConfirmation('quotation', id, 'Orçamento')} />}
          {view === 'quotation-form' && <QuotationForm initialData={editingQuotation} products={products} customers={customers} paymentMethods={paymentMethods} onSave={handleSaveQuotation} onCancel={() => setView('quotations')} />}
          {view === 'settings' && user && <SettingsView setProducts={setProducts} setCategories={setCategories} categories={categories} currentUser={user} onUpdateCurrentUser={setUser} systemUsers={systemUsers} setSystemUsers={setSystemUsers} onLogout={() => handleLogoutRequest()} onRefresh={fetchData} company={company} onSaveCompany={handleSaveCompany} />}
        </div>
      </main>
      
      {viewingStockHistory && <StockHistoryModal product={viewingStockHistory} onClose={() => setViewingStockHistory(null)} />}
      
      {editingCatalog && (
        <CatalogForm 
          initialData={editingCatalog === 'new' ? undefined : editingCatalog} 
          products={products} 
          onClose={() => setEditingCatalog(null)} 
          onSave={handleSaveCatalog} 
          onDelete={(id) => {
            const name = editingCatalog !== 'new' ? editingCatalog?.name || 'Catálogo' : 'Catálogo';
            openDeleteConfirmation('catalog', id, name);
          }} 
        />
      )}
      {isSharingCatalog && <ShareCatalogModal catalog={isSharingCatalog} onClose={() => setIsSharingCatalog(null)} />}
      <ConfirmationModal 
        isOpen={deleteModal.isOpen} 
        title={deleteModal.title} 
        message={deleteModal.message} 
        onConfirm={processDeletion} 
        onCancel={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))} 
        isLoading={isDeleting} 
        requireTextInput={deleteModal.requiredText}
        textInputPlaceholder="Digite o nome da vitrine para confirmar"
      />
      <ConfirmationModal isOpen={isLogoutConfirmationOpen} title="Sair do Sistema" message="Deseja realmente encerrar sua sessão?" confirmLabel="Sair" cancelLabel="Voltar" onConfirm={triggerLogout} onCancel={() => setIsLogoutConfirmationOpen(false)} variant="info" />
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick: () => void; }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${active ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'}`}>
    {icon}<span className="font-black text-[10px] uppercase tracking-widest">{label}</span>
  </button>
);

export default App;
