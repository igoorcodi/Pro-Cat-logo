
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
  HelpCircle,
  Search,
  User as UserIcon,
  ArrowLeft,
  Tags,
  Share2,
  Check,
  Copy
} from 'lucide-react';
import { AppView, User, Product, Catalog, Category, UserPermissions } from './types';
import Dashboard from './components/Dashboard';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import CatalogList from './components/CatalogList';
import CatalogForm from './components/CatalogForm';
import CategoryManager from './components/CategoryManager';
import SettingsView from './components/Settings';
import Auth from './components/Auth';
import PublicCatalogView from './components/PublicCatalogView';
import { mockProducts, mockCatalogs, mockCategories } from './services/mockData';

const viewTitles: Record<string, string> = {
  'dashboard': 'Dashboard',
  'products': 'Produtos',
  'product-form': 'Novo Produto',
  'categories': 'Categorias',
  'catalogs': 'Catálogos',
  'reports': 'Relatórios',
  'settings': 'Configurações',
  'help': 'Ajuda'
};

const defaultPermissions: UserPermissions = {
  dashboard: 'admin',
  products: 'admin',
  categories: 'admin',
  catalogs: 'admin',
  reports: 'admin',
  settings: 'admin'
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('login');
  const [user, setUser] = useState<User | null>(null);
  const [systemUsers, setSystemUsers] = useState<User[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [catalogs, setCatalogs] = useState<Catalog[]>(mockCatalogs);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [isCloning, setIsCloning] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);
  
  const [editingCatalog, setEditingCatalog] = useState<Catalog | null | 'new'>(null);
  const [sharingCatalog, setSharingCatalog] = useState<Catalog | null>(null);
  const [copied, setCopied] = useState(false);

  // Load initial system user
  useEffect(() => {
    const admin: User = {
      id: 'admin-1',
      name: 'Administrador Pro',
      email: 'admin@catalogo.pro',
      password: 'admin',
      role: 'admin',
      status: 'active',
      permissions: defaultPermissions
    };
    setSystemUsers([admin]);
  }, []);

  // Close sidebar on resize if screen becomes large
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setView('dashboard');
  };

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      setUser(null);
      setView('login');
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(undefined);
    setIsCloning(false);
    setView('product-form');
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsCloning(false);
    setView('product-form');
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const handleDuplicateProduct = (product: Product) => {
    const newProduct: Product = {
      ...product,
      id: Math.random().toString(36).substr(2, 9),
      name: `${product.name} (Cópia)`,
      sku: `${product.sku}-COPY`,
      createdAt: new Date().toISOString()
    };
    
    setProducts(prev => [newProduct, ...prev]);
    setEditingProduct(newProduct);
    setIsCloning(true);
    setView('product-form');
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const navigateTo = (newView: AppView) => {
    setView(newView);
    setSidebarOpen(false);
  };

  const openPublicCatalog = (catalog: Catalog) => {
    setSelectedCatalog(catalog);
    setView('public-catalog');
  };

  const handleSaveCatalog = (catalog: Catalog) => {
    setCatalogs(prev => {
      const exists = prev.find(c => c.id === catalog.id);
      if (exists) {
        return prev.map(c => c.id === catalog.id ? catalog : c);
      }
      return [catalog, ...prev];
    });
    setEditingCatalog(null);
  };

  const handleDeleteCatalog = (id: string) => {
    setCatalogs(prev => prev.filter(c => c.id !== id));
    setEditingCatalog(null);
  };

  const handleCopyLink = (catalog: Catalog) => {
    const link = `https://catalogo.pro/c/${catalog.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (view === 'login' || view === 'register' || view === 'onboarding') {
    return <Auth view={view} setView={setView} onLogin={handleLogin} />;
  }

  if (view === 'public-catalog' && selectedCatalog) {
    return (
      <div className="min-h-screen bg-white">
        {user && (
          <div className="bg-slate-900 text-white px-4 py-3 flex justify-between items-center text-[10px] font-black uppercase tracking-widest sticky top-0 z-50">
            <span>Modo Visualização</span>
            <button onClick={() => setView('catalogs')} className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-all">
              <ArrowLeft size={12} /> Voltar ao Painel
            </button>
          </div>
        )}
        <PublicCatalogView 
          catalog={selectedCatalog} 
          products={products.filter(p => selectedCatalog.productIds.includes(p.id))} 
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden relative">
      {/* Sidebar Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[45] lg:hidden animate-in fade-in duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col shadow-2xl lg:shadow-none`}
      >
        <div className="flex items-center justify-between p-6 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/20">
              <Package className="text-white" size={20} />
            </div>
            <span className="font-black text-xl text-white tracking-tighter uppercase">Pro Catálogo</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto custom-scrollbar">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={view === 'dashboard'} onClick={() => navigateTo('dashboard')} />
          <NavItem icon={<Package size={20} />} label="Produtos" active={view === 'products' || view === 'product-form'} onClick={() => navigateTo('products')} />
          <NavItem icon={<Tags size={20} />} label="Categorias" active={view === 'categories'} onClick={() => navigateTo('categories')} />
          <NavItem icon={<BookOpen size={20} />} label="Catálogos" active={view === 'catalogs'} onClick={() => navigateTo('catalogs')} />
          <NavItem icon={<BarChart3 size={20} />} label="Relatórios" active={view === 'reports'} onClick={() => navigateTo('reports')} />
          <div className="pt-6 mt-6 border-t border-slate-800">
            <NavItem icon={<Settings size={20} />} label="Configurações" active={view === 'settings'} onClick={() => navigateTo('settings')} />
            <NavItem icon={<HelpCircle size={20} />} label="Ajuda" active={view === 'help'} onClick={() => navigateTo('help')} />
          </div>
        </nav>

        <div className="p-4 bg-slate-950/50">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <UserIcon className="text-indigo-400" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white truncate uppercase tracking-widest">{user?.name}</p>
              <p className="text-[10px] text-slate-500 truncate font-bold">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-400 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 lg:h-24 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-3 bg-slate-100 rounded-xl text-slate-600 active:scale-95 transition-all shadow-sm"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight">
              {viewTitles[view] || view.replace('-', ' ')}
            </h2>
          </div>
          
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="relative hidden xl:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Busca inteligente..." className="pl-12 pr-6 py-3 bg-slate-100 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-50 w-72 transition-all" />
            </div>
            <button 
              onClick={handleAddProduct} 
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 lg:px-6 py-3 rounded-xl lg:rounded-2xl font-black text-sm transition-all shadow-xl shadow-indigo-100 active:scale-95"
            >
              <Plus size={20} />
              <span className="hidden sm:inline uppercase tracking-widest text-xs">Adicionar</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-10 custom-scrollbar scroll-smooth">
          {view === 'dashboard' && <Dashboard products={products} catalogs={catalogs} />}
          {view === 'products' && (
            <ProductList 
              products={products} 
              onEdit={handleEditProduct} 
              onDelete={(id) => setProducts(p => p.filter(x => x.id !== id))} 
              onDuplicate={handleDuplicateProduct} 
            />
          )}
          {view === 'product-form' && (
            <ProductForm 
              initialData={editingProduct} 
              categories={categories} 
              isClone={isCloning}
              onSave={(p) => { 
                if (editingProduct && !isCloning) {
                  setProducts(prev => prev.map(x => x.id === p.id ? p : x));
                } else {
                  setProducts(prev => [p, ...prev]);
                }
                setView('products'); 
                setIsCloning(false);
              }} 
              onCancel={() => {
                setView('products');
                setIsCloning(false);
              }} 
            />
          )}
          {view === 'categories' && <CategoryManager categories={categories} setCategories={setCategories} />}
          {view === 'catalogs' && <CatalogList catalogs={catalogs} products={products} onOpenPublic={openPublicCatalog} onEditCatalog={setEditingCatalog} onShareCatalog={setSharingCatalog} />}
          {view === 'settings' && <SettingsView setProducts={setProducts} setCategories={setCategories} categories={categories} currentUser={user!} onUpdateCurrentUser={setUser} systemUsers={systemUsers} setSystemUsers={setSystemUsers} />}
        </div>
      </main>

      {/* MODALS RENDERED AT ROOT TO COVER EVERYTHING INCLUDING SIDEBAR */}
      {editingCatalog && (
        <CatalogForm 
          initialData={editingCatalog === 'new' ? undefined : editingCatalog}
          products={products}
          onClose={() => setEditingCatalog(null)}
          onSave={handleSaveCatalog}
          onDelete={handleDeleteCatalog}
        />
      )}

      {sharingCatalog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8 lg:p-10 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Compartilhar</h3>
              <button onClick={() => setSharingCatalog(null)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
            </div>
            <p className="text-sm text-slate-500 mb-8 font-medium">Seus clientes poderão visualizar todos os produtos e fazer pedidos via WhatsApp.</p>
            <div className="relative mb-8">
              <input readOnly type="text" value={`https://catalogo.pro/c/${sharingCatalog.id}`} className="w-full pl-5 pr-14 py-4 bg-slate-100 border-none rounded-2xl text-xs font-bold text-slate-600" />
              <button onClick={() => handleCopyLink(sharingCatalog)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-white text-indigo-600 rounded-xl shadow-lg border border-slate-200 hover:bg-indigo-50 transition-all">
                {copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <button onClick={() => { const msg = encodeURIComponent(`Olá! Veja nosso novo catálogo: ${sharingCatalog.name}\nhttps://catalogo.pro/c/${sharingCatalog.id}`); window.open(`https://wa.me/?text=${msg}`, '_blank'); }} className="w-full flex items-center justify-center gap-3 py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"><Share2 size={22} />Enviar WhatsApp</button>
              <button onClick={() => setSharingCatalog(null)} className="w-full py-4 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-800 transition-colors">Voltar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick: () => void; }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/20' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'}`}>
    <span className={`${active ? 'scale-110' : ''} transition-transform`}>{icon}</span>
    <span className="font-black text-xs uppercase tracking-widest">{label}</span>
  </button>
);

export default App;
