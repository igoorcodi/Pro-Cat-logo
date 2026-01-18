
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
  Building,
  PartyPopper,
  Clock,
  UserCheck,
  Wallet,
  Plus,
  Trash2,
  Percent,
  DollarSign,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import { Product, Category, User, Company, PaymentMethod } from '../types';
import { supabase } from '../supabase';
import ConfirmationModal from './ConfirmationModal';

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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [companyFormData, setCompanyFormData] = useState<Partial<Company>>({});
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [isFetchingCEP, setIsFetchingCEP] = useState(false);
  const [companySuccess, setCompanySuccess] = useState(false);
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentSearchTerm, setPaymentSearchTerm] = useState('');
  const [paymentViewMode, setPaymentViewMode] = useState<'grid' | 'list'>('grid');
  const [isFetchingPayments, setIsFetchingPayments] = useState(false);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Partial<PaymentMethod> | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Estados para o modal de exclusão de pagamento
  const [isDeletePaymentModalOpen, setIsDeletePaymentModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<{id: number | string, name: string} | null>(null);
  const [isDeletingPayment, setIsDeletingPayment] = useState(false);

  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const companyLogoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (company) setCompanyFormData(company);
  }, [company]);

  useEffect(() => {
    if (activeTab === 'payments') fetchPaymentMethods();
  }, [activeTab]);

  const fetchPaymentMethods = async () => {
    setIsFetchingPayments(true);
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('name', { ascending: true });
      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (err) {
      console.error("Erro ao buscar pagamentos:", err);
    } finally {
      setIsFetchingPayments(false);
    }
  };

  const filteredPaymentMethods = useMemo(() => {
    const term = paymentSearchTerm.toLowerCase();
    return paymentMethods.filter(pm => 
      pm.name.toLowerCase().includes(term) && pm.status === 'active'
    );
  }, [paymentMethods, paymentSearchTerm]);

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment?.name) return;
    
    setIsSavingPayment(true);
    try {
      const userId = typeof currentUser.id === 'string' ? parseInt(currentUser.id) : currentUser.id;

      const payload = {
        name: editingPayment.name,
        fee_percentage: parseFloat(String(editingPayment.fee_percentage || 0)),
        fixed_fee: parseFloat(String(editingPayment.fixed_fee || 0)),
        user_id: userId,
        status: 'active'
      };

      let error;
      if (!editingPayment.id) {
        const { error: insertError } = await supabase.from('payment_methods').insert(payload);
        error = insertError;
      } else {
        const { error: updateError } = await supabase.from('payment_methods').update(payload).eq('id', editingPayment.id);
        error = updateError;
      }

      if (error) throw error;

      await fetchPaymentMethods();
      setIsPaymentModalOpen(false);
      setEditingPayment(null);
    } catch (err: any) {
      console.error("Erro completo ao salvar pagamento:", err);
      alert("Erro ao salvar: " + (err.message || "Erro desconhecido"));
    } finally {
      setIsSavingPayment(false);
    }
  };

  // Abre o aviso de exclusão
  const handleDeletePaymentClick = (id: number | string, name: string) => {
    setPaymentToDelete({ id, name });
    setIsDeletePaymentModalOpen(true);
  };

  // Executa o "soft delete" (alteração de status) no banco de dados
  const executeDeletePayment = async () => {
    if (!paymentToDelete) return;
    
    setIsDeletingPayment(true);
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({ status: 'inactive' })
        .eq('id', paymentToDelete.id);
      
      if (error) throw error;
      
      setPaymentMethods(prev => prev.map(pm => 
        pm.id === paymentToDelete.id ? { ...pm, status: 'inactive' } : pm
      ));
      
      setIsDeletePaymentModalOpen(false);
      setPaymentToDelete(null);
    } catch (err: any) {
      console.error("Erro ao desativar forma de pagamento:", err);
      alert("Erro ao desativar: " + (err.message || "Erro inesperado"));
    } finally {
      setIsDeletingPayment(false);
    }
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    setIsUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('profiles').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(filePath);
      const { error: updateError } = await supabase.from('users').update({ photo: publicUrl }).eq('id', currentUser.id);
      if (updateError) throw updateError;
      onUpdateCurrentUser({ ...currentUser, photo: publicUrl });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
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
      const { error: uploadError } = await supabase.storage.from('profiles').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(filePath);
      setCompanyFormData(prev => ({ ...prev, logo_url: publicUrl }));
    } catch (err: any) {
      alert('Erro ao carregar logo: ' + err.message);
    } finally {
      setIsSavingCompany(false);
    }
  };

  const handleSaveProfile = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      alert("As novas senhas não coincidem!");
      return;
    }
    setIsSavingProfile(true);
    try {
      const updateData: any = { 
        name: (document.getElementById('profile-name') as HTMLInputElement)?.value || currentUser.name 
      };
      if (newPassword) updateData.password = newPassword;
      const { error } = await supabase.from('users').update(updateData).eq('id', currentUser.id);
      if (error) throw error;
      onUpdateCurrentUser({ ...currentUser, ...updateData });
      setProfileSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setProfileSuccess(false), 4000);
    } catch (err: any) {
      alert('Erro ao atualizar perfil: ' + err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCompany(true);
    setCompanySuccess(false);
    try {
      await onSaveCompany(companyFormData);
      setCompanySuccess(true);
      setTimeout(() => setCompanySuccess(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingCompany(false);
    }
  };

  const maskPhone = (value: string) => {
    if (!value) return '';
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');
  };

  const maskCPFCNPJ = (value: string) => {
    if (!value) return '';
    const val = value.replace(/\D/g, '');
    if (val.length <= 11) return val.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
    else return val.replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d)/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
  };

  const maskCEP = (value: string) => {
    if (!value) return '';
    return value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{3})\d+?$/, '$1');
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
          setCompanyFormData(prev => ({ ...prev, address: data.logradouro, neighborhood: data.bairro, city: data.localidade, state: data.uf }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetchingCEP(false);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500 pb-10">
      <aside className="w-full lg:w-72 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide shrink-0 snap-x snap-mandatory">
        <h3 className="hidden lg:block text-[10px] font-black text-slate-400 px-4 mb-6 uppercase tracking-widest">Painel de Controle</h3>
        <SettingsTab icon={<UserIcon size={20} />} label="Perfil" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        <SettingsTab icon={<Building2 size={20} />} label="Empresa" active={activeTab === 'company'} onClick={() => setActiveTab('company')} />
        <SettingsTab icon={<Wallet size={20} />} label="Pagamentos" active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} />
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
                   {isUploadingImage ? <Loader2 className="animate-spin text-indigo-600" size={32} /> : <img src={currentUser.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=random&color=fff`} className="w-full h-full object-cover" alt="Avatar" />}
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
                    <input id="profile-name" type="text" defaultValue={currentUser.name} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" />
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
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <button onClick={handleSaveProfile} disabled={isSavingProfile} className="w-full sm:w-auto px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                  {isSavingProfile ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />} Salvar Alterações
                </button>
                {profileSuccess && (
                  <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest animate-in fade-in slide-in-from-top-1">
                    <CheckCircle size={14} /> Perfil atualizado com sucesso!
                  </div>
                )}
              </div>
              <button onClick={onLogout} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-white border border-red-100 hover:bg-red-50 text-red-500 rounded-2xl font-black text-sm transition-all shadow-sm"><LogOut size={20} /> Encerrar Sessão</button>
            </div>
          </div>
        )}

        {activeTab === 'company' && (
          <div className="p-6 lg:p-10 space-y-10 animate-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left">
               <div className="relative group">
                 <div className="w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center">
                   {isSavingCompany ? <Loader2 className="animate-spin text-indigo-600" size={32} /> : companyFormData.logo_url ? <img src={companyFormData.logo_url} className="w-full h-full object-cover" alt="Logo" /> : <Building2 className="text-slate-300" size={48} />}
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
                {isFetchingCEP && <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>}
                <h5 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><MapPin size={16} className="text-red-500" /> Endereço</h5>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-3 space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">CEP</label><input type="text" value={companyFormData.zip_code || ''} onChange={handleCEPChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" placeholder="00000-000" /></div>
                  <div className="md:col-span-6 space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Logradouro</label><input type="text" value={companyFormData.address || ''} onChange={e => setCompanyFormData({...companyFormData, address: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" /></div>
                  <div className="md:col-span-3 space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Número</label><input type="text" value={companyFormData.number || ''} onChange={e => setCompanyFormData({...companyFormData, number: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" placeholder="123" /></div>
                  <div className="md:col-span-4 space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Bairro</label><input type="text" value={companyFormData.neighborhood || ''} onChange={e => setCompanyFormData({...companyFormData, neighborhood: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" /></div>
                  <div className="md:col-span-5 space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Cidade</label><input type="text" value={companyFormData.city || ''} onChange={e => setCompanyFormData({...companyFormData, city: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" /></div>
                  <div className="md:col-span-3 space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">UF</label><input type="text" maxLength={2} value={companyFormData.state || ''} onChange={e => setCompanyFormData({...companyFormData, state: e.target.value.toUpperCase()})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none text-center" placeholder="SP" /></div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-10 border-t border-slate-100">
                <button type="submit" disabled={isSavingCompany} className="w-full sm:w-auto px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">{isSavingCompany ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />} Salvar Dados da Empresa</button>
                {companySuccess && <div className="flex items-center gap-3 px-6 py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest border border-emerald-100 animate-in fade-in slide-in-from-left-2 shadow-sm"><PartyPopper size={20} className="text-emerald-500" /> Alterações salvas com sucesso!</div>}
              </div>
            </form>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="p-6 lg:p-10 space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h4 className="text-3xl font-black text-slate-800 tracking-tight">Formas de Pagamento</h4>
                <p className="text-slate-500 font-medium">Configure taxas e métodos aceitos nas suas vendas.</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="bg-slate-100 rounded-2xl p-1 flex shadow-inner">
                  <button 
                    onClick={() => setPaymentViewMode('grid')} 
                    className={`p-2 rounded-xl transition-all ${paymentViewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                    title="Grade de Cards"
                  >
                    <LayoutGrid size={20} />
                  </button>
                  <button 
                    onClick={() => setPaymentViewMode('list')} 
                    className={`p-2 rounded-xl transition-all ${paymentViewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                    title="Modo Lista"
                  >
                    <ListIcon size={20} />
                  </button>
                </div>
                <button 
                  onClick={() => { setEditingPayment({}); setIsPaymentModalOpen(true); }} 
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 shrink-0"
                >
                  <Plus size={18} /> Novo Método
                </button>
              </div>
            </div>

            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input 
                type="text"
                placeholder="Pesquisar forma de pagamento..."
                value={paymentSearchTerm}
                onChange={e => setPaymentSearchTerm(e.target.value)}
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
              />
            </div>

            {isFetchingPayments ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>
            ) : filteredPaymentMethods.length > 0 ? (
              paymentViewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPaymentMethods.map(pm => (
                    <div key={pm.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 hover:shadow-xl transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <button onClick={() => { setEditingPayment(pm); setIsPaymentModalOpen(true); }} className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm"><Edit2 size={16}/></button>
                          <button onClick={() => handleDeletePaymentClick(pm.id, pm.name)} className="p-2.5 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"><Trash2 size={16}/></button>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner shrink-0"><Wallet size={28} /></div>
                        <div className="min-w-0">
                          <h5 className="text-lg font-black text-slate-800 uppercase tracking-tight truncate">{pm.name}</h5>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID #{String(pm.id).padStart(4, '0')}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                        <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Taxa (%)</p>
                          <p className="text-xs font-black text-indigo-600">{pm.fee_percentage}%</p>
                        </div>
                        <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Fixo (R$)</p>
                          <p className="text-xs font-black text-indigo-600">R$ {pm.fixed_fee?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Forma de Pagamento</th>
                          <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Taxa (%)</th>
                          <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Fixo (R$)</th>
                          <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredPaymentMethods.map(pm => (
                          <tr key={pm.id} className="group hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-sm uppercase shrink-0">
                                  <Wallet size={18} />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-800 text-sm truncate uppercase">{pm.name}</p>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID #{pm.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                                {pm.fee_percentage}%
                              </span>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <span className="text-xs font-black text-slate-700">
                                R$ {pm.fixed_fee?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button onClick={() => { setEditingPayment(pm); setIsPaymentModalOpen(true); }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 size={16}/></button>
                                <button onClick={() => handleDeletePaymentClick(pm.id, pm.name)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40">
                <Wallet size={64} className="text-slate-300" />
                <p className="font-black text-slate-800 uppercase tracking-widest text-sm">
                  {paymentSearchTerm ? 'Nenhuma forma de pagamento encontrada' : 'Nenhum método cadastrado'}
                </p>
                {!paymentSearchTerm && <button onClick={() => { setEditingPayment({}); setIsPaymentModalOpen(true); }} className="text-indigo-600 font-black text-xs uppercase underline">Cadastrar agora</button>}
              </div>
            )}
          </div>
        )}

        {(activeTab === 'users' || activeTab === 'audit') && (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center shadow-inner"><Clock size={40} /></div>
            <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Em Desenvolvimento</h4>
            <p className="text-slate-500 font-medium max-w-sm">Estamos trabalhando duro para trazer esta funcionalidade de {activeTab === 'users' ? 'gerenciamento de equipe' : 'auditoria de sistema'} em breve.</p>
          </div>
        )}

        {activeTab === 'import' && (
          <div className="p-6 lg:p-10 space-y-10 animate-in slide-in-from-right-4 duration-500">
            <div><h4 className="text-2xl font-black text-slate-800 tracking-tight">Migração de Dados</h4><p className="text-sm text-slate-500 font-medium">Importe seus dados via arquivo CSV.</p></div>
            <div onClick={() => fileInputRef.current?.click()} className="group relative border-4 border-dashed border-slate-100 rounded-[3rem] p-16 flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-indigo-200 transition-all bg-slate-50/50">
              <input type="file" ref={fileInputRef} className="hidden" />
              <FileUp size={48} className="text-indigo-600 group-hover:scale-110 transition-transform" />
              <div className="text-center"><p className="text-xl font-black text-slate-800">Clique para fazer upload</p><p className="text-sm text-slate-400 font-medium mt-1">Formato: .CSV</p></div>
            </div>
          </div>
        )}
      </div>

      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-black uppercase tracking-widest text-sm">{editingPayment?.id ? 'Editar Método' : 'Novo Método'}</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={24}/></button>
            </div>
            <form onSubmit={handleSavePayment} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nome do Método*</label>
                <input required type="text" value={editingPayment?.name || ''} onChange={e => setEditingPayment({...editingPayment, name: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" placeholder="Ex: Pix, Cartão Crédito" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Taxa (%)</label>
                  <div className="relative">
                    <input type="number" step="0.01" value={editingPayment?.fee_percentage || 0} onChange={e => setEditingPayment({...editingPayment, fee_percentage: parseFloat(e.target.value) || 0})} className="w-full pl-5 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" />
                    <Percent size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Valor Fixo (R$)</label>
                  <div className="relative">
                    <input type="number" step="0.01" value={editingPayment?.fixed_fee || 0} onChange={e => setEditingPayment({...editingPayment, fixed_fee: parseFloat(e.target.value) || 0})} className="w-full pl-5 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" />
                    <DollarSign size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>
              <button type="submit" disabled={isSavingPayment} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-95">
                {isSavingPayment ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />} Salvar Configuração
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal 
        isOpen={isDeletePaymentModalOpen}
        title="Desativar Pagamento"
        message={`Deseja realmente desativar "${paymentToDelete?.name}"? Esta ação ocultará a opção das suas configurações, mas manterá o histórico em orçamentos antigos.`}
        confirmLabel="Sim, Desativar"
        cancelLabel="Voltar"
        onConfirm={executeDeletePayment}
        onCancel={() => { setIsDeletePaymentModalOpen(false); setPaymentToDelete(null); }}
        isLoading={isDeletingPayment}
      />
    </div>
  );
};

const SettingsTab: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick: () => void; }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all shrink-0 snap-center whitespace-nowrap ${active ? 'bg-indigo-600 text-white shadow-lg lg:w-full' : 'bg-white lg:bg-transparent lg:w-full text-slate-500 hover:bg-slate-100'}`}>
    {icon}<span className="font-black text-[10px] uppercase tracking-widest">{label}</span>
  </button>
);

export default SettingsView;
