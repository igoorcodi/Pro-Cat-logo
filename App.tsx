
/**
 * COMANDO SQL PARA O BANCO DE DADOS (Execute no Editor SQL do Supabase):
 * 
 * -- Garantir status para Produtos
 * ALTER TABLE products ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
 * UPDATE products SET status = 'active' WHERE status IS NULL;
 * 
 * -- Garantir status para Clientes
 * ALTER TABLE customers ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
 * UPDATE customers SET status = 'active' WHERE status IS NULL;
 */

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
  Users
} from 'lucide-react';
import { supabase } from './supabase';
import { AppView, User, Product, Catalog, Category, Quotation, Customer } from './types';
import Dashboard from './components/Dashboard';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
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

const viewTitles: Record<string, string> = {
  'dashboard': 'Dashboard',
  'products': 'Produtos',
  'product-form': 'Novo Produto',
  'categories': 'Categorias',
  'catalogs': 'Catálogos',
  'reports': 'Relatórios',
  'settings': 'Configurações',
  'help': 'Ajuda',
  'quotations': 'Gestão de Orçamentos',
  'quotation-form': 'Novo Orçamento',
  'public-catalog': 'Vitrine Digital',
  'customers': 'Meus Clientes',
  'customer-form': 'Gerenciar Cliente'
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('login');
  const [user, setUser] = useState<User | null>(null);
  const [systemUsers, setSystemUsers] = useState<User[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [isCloning, setIsCloning] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | undefined>(undefined);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);
  const [editingCatalog, setEditingCatalog] = useState<Catalog | null | 'new'>(null);
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);
  const [isSharingCatalog, setIsSharingCatalog] = useState<Catalog | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const forceLogout = useCallback(() => {
    localStorage.removeItem('catalog_pro_session');
    setUser(null);
    setView('login');
    setProducts([]);
    setCatalogs([]);
    setCategories([]);
    setQuotations([]);
    setCustomers([]);
    setSidebarOpen(false);
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoadingData(true);
    try {
      const { data: userData } = await supabase.from('users').select('id').eq('id', user.id).single();
      if (!userData) { forceLogout(); return; }

      const [
        { data: prodData },
        { data: catData },
        { data: catalogData },
        { data: quotData },
        { data: custData }
      ] = await Promise.all([
        supabase.from('products').select('*').eq('user_id', user.id).eq('status', 'active').order('created_at', { ascending: false }),
        supabase.from('categories').select('*, subcategories(*)').eq('user_id', user.id),
        supabase.from('catalogs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('quotations').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('customers').select('*').eq('user_id', user.id).eq('status', 'active').order('created_at', { ascending: false })
      ]);

      if (catData) setCategories(catData);
      if (prodData) setProducts(prodData.map(p => ({ 
        ...p, 
        categoryId: p.category_id, 
        subcategoryId: p.subcategory_id, 
        category: catData?.find(c => c.id === p.category_id)?.name || 'Sem Categoria', 
        createdAt: p.created_at 
      })));
      
      if (catalogData) setCatalogs(catalogData.map(c => ({ 
        ...c, 
        productIds: c.product_ids, 
        coverImage: c.cover_image,
        createdAt: c.created_at 
      })));
      
      if (quotData) setQuotations(quotData.map(q => ({ ...q, clientName: q.client_name, clientPhone: q.client_phone, sellerName: q.seller_name, quotationDate: q.quotation_date, createdAt: q.created_at })));
      if (custData) setCustomers(custData.map(c => ({ ...c, zipCode: c.zip_code, createdAt: c.created_at })));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, [user, forceLogout]);

  useEffect(() => {
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
      }
    }
  }, []);

  useEffect(() => { if (user) fetchData(); }, [user, fetchData]);

  const handleLogin = (userData: User) => { 
    setUser(userData); 
    localStorage.setItem('catalog_pro_session', JSON.stringify(userData)); 
    setView('dashboard'); 
  };

  const handleLogout = useCallback((e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (window.confirm('Deseja realmente sair do sistema?')) { 
      setIsLoggingOut(true); 
      setTimeout(() => { forceLogout(); setIsLoggingOut(false); }, 600); 
    } 
  }, [forceLogout]);

  const navigateTo = (newView: AppView) => { setView(newView); setSidebarOpen(false); };

  const handleOpenPublicCatalog = (catalog: Catalog) => {
    setSelectedCatalog(catalog);
    setView('public-catalog');
  };

  const handleSaveCustomer = async (customer: Partial<Customer>) => {
    if (!user) return;
    const dataToSave: any = {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      document: customer.document,
      zip_code: customer.zipCode,
      address: customer.address,
      number: customer.number,
      neighborhood: customer.neighborhood,
      city: customer.city,
      state: customer.state,
      status: customer.status || 'active',
      notes: customer.notes,
      user_id: user.id
    };
    if (customer.id) dataToSave.id = customer.id;
    const { error } = await supabase.from('customers').upsert(dataToSave);
    if (error) alert(`Erro ao salvar cliente: ${error.message}`);
    else { fetchData(); setView('customers'); }
  };

  const handleSaveProduct = async (product: Partial<Product>) => {
    if (!user) return;
    const dataToSave: any = {
      name: product.name,
      description: product.description,
      price: product.price,
      sku: product.sku,
      stock: product.stock,
      category_id: product.categoryId || null,
      subcategory_id: product.subcategoryId || null,
      images: product.images,
      tags: product.tags,
      status: product.status || 'active',
      user_id: user.id
    };
    if (product.id && !isCloning) dataToSave.id = product.id;
    const { error } = await supabase.from('products').upsert(dataToSave);
    if (error) alert(`Erro ao salvar produto: ${error.message}`);
    else { fetchData(); setView('products'); }
  };

  const handleSaveCatalog = async (catalog: Partial<Catalog>) => {
    if (!user) return;
    const dataToSave: any = {
      name: catalog.name,
      description: catalog.description,
      cover_image: catalog.coverImage,
      product_ids: catalog.productIds,
      user_id: user.id
    };
    if (catalog.id) dataToSave.id = catalog.id;
    const { error } = await supabase.from('catalogs').upsert(dataToSave);
    if (error) alert(`Erro ao salvar catálogo: ${error.message}`);
    else { fetchData(); setEditingCatalog(null); }
  };

  const handleSaveQuotation = async (quotation: Partial<Quotation>) => {
    if (!user) return;
    const dataToSave: any = {
      client_name: quotation.clientName,
      client_phone: quotation.clientPhone,
      seller_name: quotation.sellerName,
      quotation_date: quotation.quotationDate,
      keyword: quotation.keyword,
      total: quotation.total,
      status: quotation.status,
      notes: quotation.notes,
      items: quotation.items,
      user_id: user.id
    };
    if (quotation.id) dataToSave.id = quotation.id;
    const { error } = await supabase.from('quotations').upsert(dataToSave);
    if (error) alert(`Erro ao salvar orçamento: ${error.message}`);
    else { fetchData(); setView('quotations'); }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Tem certeza que deseja desativar este produto?')) {
      try {
        const { error } = await supabase.from('products').update({ status: 'inactive' }).eq('id', id);
        if (error) alert(`Erro ao excluir produto: ${error.message}`);
        else setProducts(prev => prev.filter(p => p.id !== id));
      } catch (err) { alert('Ocorreu um erro inesperado.'); }
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (window.confirm('Tem certeza que deseja desativar este cliente?')) {
      try {
        const { error } = await supabase.from('customers').update({ status: 'inactive' }).eq('id', id);
        if (error) alert(`Erro ao desativar cliente: ${error.message}`);
        else setCustomers(prev => prev.filter(c => c.id !== id));
      } catch (err) { alert('Ocorreu um erro inesperado.'); }
    }
  };

  if (view === 'public-catalog' && selectedCatalog) {
    const catalogProducts = products.filter(p => selectedCatalog.productIds.includes(p.id));
    return <PublicCatalogView catalog={selectedCatalog} products={catalogProducts} onBack={() => setView('catalogs')} />;
  }

  if ((!user || view === 'login' || view === 'register' || view === 'onboarding') && !isLoggingOut) {
    return <Auth view={view} setView={setView} onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden relative">
      {isLoggingOut && (
        <div className="fixed inset-0 z-[999] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl flex flex-col items-center gap-6">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <div className="text-center">
              <p className="font-black text-slate-800 uppercase tracking-widest text-sm">Encerrando sessão</p>
            </div>
          </div>
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
          <NavItem icon={<Users size={20} />} label="Clientes" active={view === 'customers' || view === 'customer-form'} onClick={() => navigateTo('customers')} />
          <NavItem icon={<Package size={20} />} label="Produtos" active={view === 'products' || view === 'product-form'} onClick={() => navigateTo('products')} />
          <NavItem icon={<Tags size={20} />} label="Categorias" active={view === 'categories'} onClick={() => navigateTo('categories')} />
          <NavItem icon={<BookOpen size={20} />} label="Catálogos" active={view === 'catalogs'} onClick={() => navigateTo('catalogs')} />
          <NavItem icon={<FileText size={20} />} label="Orçamentos" active={view === 'quotations' || view === 'quotation-form'} onClick={() => navigateTo('quotations')} />
          <NavItem icon={<BarChart3 size={20} />} label="Relatórios" active={view === 'reports'} onClick={() => navigateTo('reports')} />
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
            <button 
              type="button" 
              onClick={(e) => handleLogout(e)} 
              className="p-3 bg-slate-800/50 hover:bg-red-600/20 border border-slate-700 rounded-xl text-slate-400 hover:text-red-400 hover:border-red-400/50 transition-all flex items-center justify-center group"
            >
              <LogOut size={18} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 lg:h-24 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-3 bg-slate-100 rounded-xl"><Menu size={24} /></button>
            <h2 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight">{isLoadingData ? 'Carregando...' : viewTitles[view]}</h2>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => {
              if (view === 'customers') { setEditingCustomer(undefined); setView('customer-form'); }
              else if (view === 'quotations') setView('quotation-form');
              else if (view === 'catalogs') setEditingCatalog('new');
              else { setEditingProduct(undefined); setIsCloning(false); setView('product-form'); }
            }} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 lg:px-6 py-3 rounded-xl font-black text-sm transition-all shadow-xl">
              <Plus size={20} /><span className="hidden sm:inline uppercase tracking-widest text-xs">Adicionar</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-10 custom-scrollbar">
          {view === 'dashboard' && <Dashboard products={products} catalogs={catalogs} />}
          {view === 'customers' && <CustomerList customers={customers} onEdit={(c) => { setEditingCustomer(c); setView('customer-form'); }} onDelete={handleDeleteCustomer} onAdd={() => { setEditingCustomer(undefined); setView('customer-form'); }} />}
          {view === 'customer-form' && <CustomerForm initialData={editingCustomer} onSave={handleSaveCustomer} onCancel={() => setView('customers')} />}
          {view === 'products' && <ProductList products={products} onEdit={(p) => { setEditingProduct(p); setIsCloning(false); setView('product-form'); }} onDelete={handleDeleteProduct} onDuplicate={(p) => { setEditingProduct(p); setIsCloning(true); setView('product-form'); }} />}
          {view === 'product-form' && <ProductForm initialData={editingProduct} categories={categories} isClone={isCloning} onSave={handleSaveProduct} onCancel={() => setView('products')} />}
          {view === 'categories' && user && <CategoryManager categories={categories} user={user} onRefresh={fetchData} />}
          {view === 'catalogs' && <CatalogList catalogs={catalogs} products={products} onOpenPublic={handleOpenPublicCatalog} onEditCatalog={setEditingCatalog} onShareCatalog={setIsSharingCatalog} />}
          {view === 'quotations' && <QuotationList quotations={quotations} onEdit={(q) => { setEditingQuotation(q); setView('quotation-form'); }} onDelete={async (id) => { if (confirm('Excluir orçamento?')) { await supabase.from('quotations').delete().eq('id', id); fetchData(); } }} />}
          {view === 'quotation-form' && <QuotationForm initialData={editingQuotation} products={products} onSave={handleSaveQuotation} onCancel={() => setView('quotations')} />}
          {view === 'settings' && user && <SettingsView setProducts={setProducts} setCategories={setCategories} categories={categories} currentUser={user} onUpdateCurrentUser={setUser} systemUsers={systemUsers} setSystemUsers={setSystemUsers} onLogout={handleLogout} onRefresh={fetchData} />}
        </div>
      </main>

      {editingCatalog && <CatalogForm initialData={editingCatalog === 'new' ? undefined : editingCatalog} products={products} onClose={() => setEditingCatalog(null)} onSave={handleSaveCatalog} onDelete={async (id) => { await supabase.from('catalogs').delete().eq('id', id); fetchData(); setEditingCatalog(null); }} />}
      {isSharingCatalog && <ShareCatalogModal catalog={isSharingCatalog} onClose={() => setIsSharingCatalog(null)} />}
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick: () => void; }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${active ? 'bg-indigo-600 text-white shadow-xl' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'}`}>
    {icon}<span className="font-black text-xs uppercase tracking-widest">{label}</span>
  </button>
);

export default App;
