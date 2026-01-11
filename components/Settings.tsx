
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  User as UserIcon, 
  MessageSquare, 
  Users, 
  FileUp, 
  Shield, 
  ChevronRight,
  Upload,
  CheckCircle,
  AlertCircle,
  Download,
  FileSpreadsheet,
  ArrowRight,
  Table as TableIcon,
  X,
  History,
  Search,
  Monitor,
  Calendar,
  Filter,
  Lock,
  Eye,
  Edit2,
  MoreVertical,
  Check,
  FileText,
  Layers,
  Tags,
  Package,
  LogOut,
  Loader2,
  Building2,
  Globe,
  Instagram,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Building
} from 'lucide-react';
import { Product, Category, User, UserPermissions, PermissionLevel, Company } from '../types';
import { supabase } from '../supabase';

interface SettingsViewProps {
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  categories: Category[];
  currentUser: User;
  onUpdateCurrentUser: (user: User) => void;
  systemUsers: User[];
  setSystemUsers: React.Dispatch<React.SetStateAction<User[]>>;
  onLogout: () => void;
  onRefresh?: () => void;
  company: Company | null;
  onSaveCompany: (data: Partial<Company>) => Promise<void>;
}

interface AuditLog {
  id: string;
  user: string;
  action: string;
  module: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
  ip: string;
}

const mockLogs: AuditLog[] = [];

type MappingState = { [key: string]: number };
type ImportType = 'products' | 'categories' | 'subcategories';

const SettingsView: React.FC<SettingsViewProps> = ({ 
  setProducts, 
  setCategories, 
  categories, 
  currentUser, 
  onUpdateCurrentUser,
  systemUsers,
  setSystemUsers,
  onLogout,
  onRefresh,
  company,
  onSaveCompany
}) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | 'idle', message: string }>({ type: 'idle', message: '' });
  const [isImporting, setIsImporting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [logSearch, setLogSearch] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [companyFormData, setCompanyFormData] = useState<Partial<Company>>({});
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [isFetchingCEP, setIsFetchingCEP] = useState(false);
  const [companySuccess, setCompanySuccess] = useState(false);
  const companyLogoInputRef = useRef<HTMLInputElement>(null);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [showMapping, setShowMapping] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [currentImportType, setCurrentImportType] = useState<ImportType>('products');
  const [mapping, setMapping] = useState<MappingState>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (company) {
      setCompanyFormData(company);
    }
  }, [company]);

  const maskPhone = (value: string) => {
    if (!value) return '';
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const maskCPFCNPJ = (value: string) => {
    if (!value) return '';
    const val = value.replace(/\D/g, '');
    if (val.length <= 11) {
      return val
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    } else {
      return val
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    }
  };

  const maskCEP = (value: string) => {
    if (!value) return '';
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  };

  const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const maskedValue = maskCEP(rawValue);
    const cleanCEP = maskedValue.replace(/\D/g, '');
    
    setCompanyFormData(prev => ({ ...prev, zip_code: maskedValue }));

    if (cleanCEP.length === 8) {
      setIsFetchingCEP(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setCompanyFormData(prev => ({
            ...prev,
            address: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf
          }));
        }
      } catch (err) {
        console.error("Erro ao buscar CEP:", err);
      } finally {
        setIsFetchingCEP(false);
      }
    }
  };

  const filteredLogs = useMemo(() => {
    const search = logSearch.toLowerCase();
    return mockLogs.filter(log => {
      const action = (log.action || '').toLowerCase();
      const module = (log.module || '').toLowerCase();
      const user = (log.user || '').toLowerCase();
      return action.includes(search) || module.includes(search) || user.includes(search);
    });
  }, [logSearch]);

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setIsUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('users')
        .update({ photo: publicUrl })
        .eq('id', currentUser.id);

      if (updateError) throw updateError;

      onUpdateCurrentUser({ ...currentUser, photo: publicUrl });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
      
    } catch (err: any) {
      console.error('Erro no upload da imagem:', err);
      alert('Erro ao carregar imagem: ' + err.message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCompanyLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setIsSavingCompany(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `company-${currentUser.id}-${Math.random()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      setCompanyFormData(prev => ({ ...prev, logo_url: publicUrl }));
      
    } catch (err: any) {
      alert('Erro ao carregar logo: ' + err.message);
    } finally {
      setIsSavingCompany(false);
    }
  };

  const handleSaveProfile = () => {
    if (newPassword && newPassword !== confirmPassword) {
      alert("As novas senhas não coincidem!");
      return;
    }

    const updatedUser: User = { ...currentUser };
    if (newPassword) {
      updatedUser.password = newPassword;
    }
    
    onUpdateCurrentUser(updatedUser);
    setProfileSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCompany(true);
    try {
      await onSaveCompany(companyFormData);
      setCompanySuccess(true);
      setTimeout(() => setCompanySuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingCompany(false);
    }
  };

  const handleOpenUserModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
    } else {
      setEditingUser({
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        email: '',
        password: '123',
        role: 'editor',
        status: 'active',
        permissions: {
          dashboard: 'view',
          products: 'view',
          categories: 'view',
          catalogs: 'view',
          reports: 'none',
          settings: 'none'
        }
      });
    }
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setSystemUsers(prev => {
      const exists = prev.find(u => u.id === editingUser.id);
      if (exists) {
        return prev.map(u => u.id === editingUser.id ? editingUser : u);
      }
      return [...prev, editingUser];
    });
    setIsUserModalOpen(false);
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim() !== '');
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(h => (h || '').trim().toLowerCase());
        const rows = lines.slice(1).map(line => line.split(',').map(c => (c || '').trim()));
        setCsvHeaders(headers);
        setCsvRows(rows);
        setShowMapping(true);
      }
    };
    reader.readAsText(file);
  };

  const downloadCSVTemplate = (type: ImportType) => {
    let headers = '';
    let filename = '';

    switch (type) {
      case 'products':
        headers = 'nome,preço,sku,estoque,categoria,descrição,tags';
        filename = 'modelo_produtos.csv';
        break;
      case 'categories':
        headers = 'nome_categoria';
        filename = 'modelo_categorias.csv';
        break;
      case 'subcategories':
        headers = 'nome_subcategoria,nome_categoria_pai';
        filename = 'modelo_subcategorias.csv';
        break;
    }

    const blob = new Blob([headers], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFinalImport = async () => {
    if (csvRows.length === 0) return;
    
    setIsImporting(true);
    setImportStatus({ type: 'idle', message: 'Iniciando importação...' });

    try {
      if (currentImportType === 'products') {
        const productsToInsert = csvRows.map(row => {
          const categoryName = (row[4] || '').toLowerCase();
          const categoryObj = categories.find(c => (c.name || '').toLowerCase() === categoryName);

          return {
            name: row[0] || 'Sem Nome',
            price: parseFloat(row[1]) || 0,
            sku: row[2] || '',
            stock: parseInt(row[3]) || 0,
            category_id: categoryObj?.id || null,
            description: row[5] || '',
            tags: row[6] ? row[6].split(';') : [],
            status: 'active',
            user_id: currentUser.id,
            images: []
          };
        });

        const { error } = await supabase.from('products').insert(productsToInsert);
        if (error) throw error;
        setImportStatus({ type: 'success', message: `${productsToInsert.length} produtos importados com sucesso!` });
      } else {
        setImportStatus({ type: 'error', message: 'Tipo de importação não implementado ainda.' });
      }

      if (onRefresh) onRefresh();
      setShowMapping(false);
    } catch (err: any) {
      console.error('Erro na importação:', err);
      setImportStatus({ type: 'error', message: `Erro ao importar: ${err.message}` });
    } finally {
      setIsImporting(false);
      setTimeout(() => setImportStatus({ type: 'idle', message: '' }), 5000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500 pb-10">
      {/* Navegação de Configurações Responsiva */}
      <aside className="w-full lg:w-72 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide shrink-0 snap-x snap-mandatory">
        <h3 className="hidden lg:block text-[10px] font-black text-slate-400 px-4 mb-6 uppercase tracking-widest">Painel de Controle</h3>
        <SettingsTab icon={<UserIcon size={20} />} label="Perfil" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        <SettingsTab icon={<Building2 size={20} />} label="Empresa" active={activeTab === 'company'} onClick={() => setActiveTab('company')} />
        <SettingsTab icon={<Users size={20} />} label="Equipe" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
        <SettingsTab icon={<FileUp size={20} />} label="Importar" active={activeTab === 'import'} onClick={() => setActiveTab('import')} />
        <SettingsTab icon={<History size={20} />} label="Auditoria" active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} />
      </aside>

      <div className="flex-1 bg-white rounded-t-[2.5rem] lg:rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col relative">
        {activeTab === 'profile' && (
          <div className="p-6 lg:p-10 space-y-10 animate-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left">
               <div className="relative group">
                 <div className="w-32 h-32 rounded-[2.5rem] bg-slate-100 border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center">
                   {isUploadingImage ? (
                     <Loader2 className="animate-spin text-indigo-600" size={32} />
                   ) : (
                     <img 
                      src={currentUser.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=random&color=fff`} 
                      className="w-full h-full object-cover" 
                      alt="Avatar"
                     />
                   )}
                 </div>
                 <input type="file" ref={profileImageInputRef} onChange={handleProfileImageUpload} accept="image/*" className="hidden" />
                 <button onClick={() => profileImageInputRef.current?.click()} disabled={isUploadingImage} className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-xl hover:bg-indigo-700 transition-all border-4 border-white disabled:opacity-50"><Upload size={18} /></button>
               </div>
               <div className="space-y-2">
                 <h4 className="text-3xl font-black text-slate-800 tracking-tighter">{currentUser.name || 'Usuário'}</h4>
                 <p className="text-slate-500 font-medium">{currentUser.email}</p>
                 <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-2">
                   <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">{currentUser.role}</span>
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
              <div className="space-y-6">
                <h5 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><UserIcon size={16} className="text-indigo-600" /> Dados Pessoais</h5>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nome Completo</label>
                    <input type="text" defaultValue={currentUser.name} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">E-mail</label>
                    <input type="email" defaultValue={currentUser.email} readOnly className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none opacity-60" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h5 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><Lock size={16} className="text-amber-600" /> Segurança</h5>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nova Senha</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-50 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Confirmar Nova Senha</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-50 outline-none" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-100">
              <button onClick={handleSaveProfile} className="w-full sm:w-auto px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"><Check size={20} /> Salvar Alterações</button>
              <button onClick={onLogout} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-white border border-red-100 hover:bg-red-50 text-red-500 rounded-2xl font-black text-sm transition-all shadow-sm"><LogOut size={20} /> Encerrar Sessão</button>
            </div>
          </div>
        )}

        {activeTab === 'company' && (
          <div className="p-6 lg:p-10 space-y-10 animate-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left">
               <div className="relative group">
                 <div className="w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center">
                   {isSavingCompany ? (
                     <Loader2 className="animate-spin text-indigo-600" size={32} />
                   ) : companyFormData.logo_url ? (
                     <img src={companyFormData.logo_url} className="w-full h-full object-cover" alt="Logo" />
                   ) : (
                     <Building2 className="text-slate-300" size={48} />
                   )}
                 </div>
                 <input type="file" ref={companyLogoInputRef} onChange={handleCompanyLogoUpload} accept="image/*" className="hidden" />
                 <button onClick={() => companyLogoInputRef.current?.click()} className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-full shadow-xl border-4 border-white"><Upload size={18} /></button>
               </div>
               <div className="space-y-2">
                 <h4 className="text-3xl font-black text-slate-800 tracking-tight">Identidade da Empresa</h4>
                 <p className="text-slate-500 font-medium">Estes dados aparecerão nos seus orçamentos e catálogos.</p>
               </div>
            </div>

            <form onSubmit={handleCompanySubmit} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                <div className="space-y-6">
                  <h5 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><Building2 size={16} className="text-indigo-600" /> Identificação</h5>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Razão Social*</label>
                      <input required type="text" value={companyFormData.name || ''} onChange={e => setCompanyFormData({...companyFormData, name: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" placeholder="Ex: Minha Empresa LTDA" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">CNPJ / CPF</label>
                      <input type="text" value={companyFormData.document || ''} onChange={e => setCompanyFormData({...companyFormData, document: maskCPFCNPJ(e.target.value)})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" placeholder="00.000.000/0000-00" />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h5 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><MessageSquare size={16} className="text-emerald-600" /> Contato</h5>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">WhatsApp de Vendas</label>
                      <input type="text" value={companyFormData.whatsapp || ''} onChange={e => setCompanyFormData({...companyFormData, whatsapp: maskPhone(e.target.value)})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" placeholder="(11) 99999-9999" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Instagram (@)</label>
                      <input type="text" value={companyFormData.instagram || ''} onChange={e => setCompanyFormData({...companyFormData, instagram: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" placeholder="minhaloja" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-slate-100 relative overflow-hidden">
                {isFetchingCEP && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                  </div>
                )}
                <h5 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><MapPin size={16} className="text-red-500" /> Endereço</h5>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-3 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">CEP</label>
                    <input type="text" value={companyFormData.zip_code || ''} onChange={handleCEPChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" placeholder="00000-000" />
                  </div>
                  <div className="md:col-span-6 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Logradouro</label>
                    <input type="text" value={companyFormData.address || ''} onChange={e => setCompanyFormData({...companyFormData, address: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" />
                  </div>
                  <div className="md:col-span-3 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Cidade</label>
                    <input type="text" value={companyFormData.city || ''} onChange={e => setCompanyFormData({...companyFormData, city: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-10 border-t border-slate-100">
                <button type="submit" disabled={isSavingCompany} className="w-full sm:w-auto px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                  {isSavingCompany ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />} Salvar Dados da Empresa
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'import' && (
          <div className="p-6 lg:p-10 space-y-10 animate-in slide-in-from-right-4 duration-500">
            <div>
              <h4 className="text-2xl font-black text-slate-800 tracking-tight">Migração de Dados</h4>
              <p className="text-sm text-slate-500 font-medium">Importe seus dados via arquivo CSV.</p>
            </div>

            {!showMapping ? (
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ImportTypeCard title="Produtos" desc="Estoque e preços" icon={<Package className="text-indigo-600" size={24} />} active={currentImportType === 'products'} onClick={() => setCurrentImportType('products')} onDownload={() => downloadCSVTemplate('products')} />
                  <ImportTypeCard title="Categorias" desc="Estrutura principal" icon={<Tags className="text-emerald-600" size={24} />} active={currentImportType === 'categories'} onClick={() => setCurrentImportType('categories')} onDownload={() => downloadCSVTemplate('categories')} />
                </div>

                <div onClick={() => fileInputRef.current?.click()} className="group relative border-4 border-dashed border-slate-100 rounded-[3rem] p-16 flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-indigo-200 transition-all bg-slate-50/50">
                  <input type="file" ref={fileInputRef} onChange={handleFileSelection} accept=".csv" className="hidden" />
                  <FileUp size={48} className="text-indigo-600 group-hover:scale-110 transition-transform" />
                  <div className="text-center">
                    <p className="text-xl font-black text-slate-800">Clique para fazer upload</p>
                    <p className="text-sm text-slate-400 font-medium mt-1">Formato: .CSV</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-bottom-4">
                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
                  <div className="flex justify-between items-center mb-6">
                    <h5 className="font-black text-slate-800 uppercase tracking-widest text-xs flex items-center gap-2"><TableIcon size={16} /> Mapeamento ({currentImportType})</h5>
                    <button onClick={() => setShowMapping(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                  </div>
                  <p className="text-sm text-slate-500 font-medium mb-4">Detectamos {csvHeaders.length} colunas e {csvRows.length} registros.</p>
                </div>
                <div className="flex items-center gap-4 justify-end">
                   <button onClick={() => setShowMapping(false)} className="px-8 py-3 text-slate-400 font-black text-sm uppercase">Cancelar</button>
                   <button onClick={handleFinalImport} disabled={isImporting} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-3">
                     {isImporting && <Loader2 className="animate-spin" size={20} />} Confirmar Importação
                   </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const SettingsTab: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick: () => void; }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick} 
    className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all shrink-0 snap-center whitespace-nowrap ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg lg:w-full' 
        : 'bg-white lg:bg-transparent lg:w-full text-slate-500 hover:bg-slate-100'
    }`}
  >
    {icon}
    <span className="font-black text-[10px] uppercase tracking-widest">{label}</span>
  </button>
);

const ImportTypeCard: React.FC<{ title: string; desc: string; icon: React.ReactNode; active: boolean; onClick: () => void; onDownload: () => void; }> = ({ title, desc, icon, active, onClick, onDownload }) => (
  <div onClick={onClick} className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${active ? 'bg-white border-indigo-600 shadow-xl' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}>
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 rounded-2xl bg-white shadow-sm">{icon}</div>
      <button onClick={(e) => { e.stopPropagation(); onDownload(); }} className="p-2 text-slate-400 hover:text-indigo-600"><Download size={18} /></button>
    </div>
    <h5 className="font-black text-slate-800 uppercase tracking-tight text-sm">{title}</h5>
    <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-widest">{desc}</p>
  </div>
);

export default SettingsView;
