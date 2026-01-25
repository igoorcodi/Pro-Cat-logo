
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
  CheckCircle2,
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
  List as ListIcon,
  ChevronDown,
  Info,
  ArrowLeftRight,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  EyeOff,
  ArrowLeft,
  Settings2,
  FileJson,
  Code
} from 'lucide-react';
import { Product, Category, User, Company, PaymentMethod, AuditLog, UserPermissions, PermissionLevel, Customer, Subcategory } from '../types';
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

const DEFAULT_PERMISSIONS: UserPermissions = {
  products: 'edit',
  customers: 'edit',
  categories: 'edit',
  promotions: 'edit',
  catalogs: 'edit',
  quotations: 'edit'
};

const PRODUCT_FIELDS = [
  { id: 'name', label: 'Nome do Produto' },
  { id: 'sku', label: 'SKU / Código' },
  { id: 'price', label: 'Preço' },
  { id: 'stock', label: 'Estoque' },
  { id: 'category', label: 'Categoria' },
  { id: 'subcategories', label: 'Subcategorias (separadas por vírgula)' },
  { id: 'description', label: 'Descrição' },
  { id: 'status', label: 'Status (active/inactive)' }
];

const CUSTOMER_FIELDS = [
  { id: 'name', label: 'Nome Completo' },
  { id: 'email', label: 'E-mail' },
  { id: 'phone', label: 'Telefone / WhatsApp' },
  { id: 'document', label: 'CPF / CNPJ' },
  { id: 'zip_code', label: 'CEP' },
  { id: 'address', label: 'Endereço' },
  { id: 'number', label: 'Número' },
  { id: 'neighborhood', label: 'Bairro' },
  { id: 'city', label: 'Cidade' },
  { id: 'state', label: 'Estado (UF)' },
  { id: 'notes', label: 'Observações' }
];

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
  const [isFetchingPayments, setIsFetchingPayments] = useState(false);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Partial<PaymentMethod> | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isFetchingAudit, setIsFetchingAudit] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditTableFilter, setAuditTableFilter] = useState('all');
  const [viewingLog, setViewingLog] = useState<AuditLog | null>(null);
  const [auditModalTab, setAuditModalTab] = useState<'visual' | 'json'>('visual');

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Partial<User> | null>(null);
  const [isSavingMember, setIsSavingMember] = useState(false);
  const [memberPassword, setMemberPassword] = useState('');
  const [isFetchingTeam, setIsFetchingTeam] = useState(false);

  const [isDeletePaymentModalOpen, setIsDeletePaymentModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<{id: number | string, name: string} | null>(null);
  const [isDeletingPayment, setIsDeletingPayment] = useState(false);

  // Estados de Importação Avançada
  const [importWizard, setImportWizard] = useState<{
    isOpen: boolean;
    type: 'products' | 'customers' | null;
    step: 'config' | 'preview' | 'processing' | 'result';
    rawLines: string[][];
    headers: string[];
    mapping: Record<string, string>;
    startRow: number;
    progress: number;
    results: { success: number; errors: string[] } | null;
  }>({
    isOpen: false,
    type: null,
    step: 'config',
    rawLines: [],
    headers: [],
    mapping: {},
    startRow: 1,
    progress: 0,
    results: null
  });

  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const companyLogoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (company) setCompanyFormData(company);
  }, [company]);

  useEffect(() => {
    if (activeTab === 'payments') fetchPaymentMethods();
    if (activeTab === 'audit') fetchAuditLogs();
    if (activeTab === 'users') fetchTeamMembers();
  }, [activeTab]);

  const fetchTeamMembers = async () => {
    if (currentUser.role !== 'admin') return;
    setIsFetchingTeam(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('owner_id', currentUser.owner_id)
        .order('name', { ascending: true });
      
      if (error) throw error;
      setSystemUsers(data || []);
    } catch (err) {
      console.error("Erro ao buscar equipe:", err);
    } finally {
      setIsFetchingTeam(false);
    }
  };

  const fetchAuditLogs = async () => {
    setIsFetchingAudit(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      setAuditLogs(data || []);
    } catch (err) {
      console.error("Erro ao carregar auditoria:", err);
    } finally {
      setIsFetchingAudit(false);
    }
  };

  const fetchPaymentMethods = async () => {
    setIsFetchingPayments(true);
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', currentUser.owner_id)
        .order('name', { ascending: true });
      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (err) {
      console.error("Erro ao buscar pagamentos:", err);
    } finally {
      setIsFetchingPayments(false);
    }
  };

  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesSearch = auditSearch === '' || 
        log.table_name.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
        String(log.record_id).includes(auditSearch);
      
      const matchesTable = auditTableFilter === 'all' || log.table_name === auditTableFilter;
      
      return matchesSearch && matchesTable;
    });
  }, [auditLogs, auditSearch, auditTableFilter]);

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
      const targetId = currentUser.owner_id;
      const payload = {
        name: editingPayment.name,
        fee_percentage: parseFloat(String(editingPayment.fee_percentage || 0)),
        fixed_fee: parseFloat(String(editingPayment.fixed_fee || 0)),
        show_in_cart: editingPayment.show_in_cart ?? true,
        user_id: targetId,
        status: 'active'
      };

      let error;
      if (!editingPayment.id) {
        const { error: insertError } = await supabase.from('payment_methods').insert(payload);
        error = insertError;
      } else {
        const { error: updateError } = await supabase.from('payment_methods').update(payload).eq('id', editingPayment.id).eq('user_id', targetId);
        error = updateError;
      }

      if (error) throw error;

      await fetchPaymentMethods();
      setIsPaymentModalOpen(false);
      setEditingPayment(null);
    } catch (err: any) {
      alert("Erro ao salvar: " + (err.message || "Erro desconhecido"));
    } finally {
      setIsSavingPayment(false);
    }
  };

  const handleDeletePaymentClick = (id: number | string, name: string) => {
    setPaymentToDelete({ id, name });
    setIsDeletePaymentModalOpen(true);
  };

  const executeDeletePayment = async () => {
    if (!paymentToDelete) return;
    setIsDeletingPayment(true);
    try {
      const targetId = currentUser.owner_id;
      const { error } = await supabase
        .from('payment_methods')
        .update({ status: 'inactive' })
        .eq('id', paymentToDelete.id)
        .eq('user_id', targetId);
      
      if (error) throw error;
      await fetchPaymentMethods();
      setIsDeletePaymentModalOpen(false);
      setPaymentToDelete(null);
    } catch (err: any) {
      alert("Erro ao desativar: " + (err.message || "Erro inesperado"));
    } finally {
      setIsDeletingPayment(false);
    }
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember?.name || !editingMember?.email) return;
    
    setIsSavingMember(true);
    try {
      const perms = editingMember.permissions || DEFAULT_PERMISSIONS;
      
      if (editingMember.id) {
        const { error } = await supabase
          .from('users')
          .update({
            name: editingMember.name,
            permissions: perms,
            status: editingMember.status
          })
          .eq('id', editingMember.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.rpc('create_team_member', {
          p_name: editingMember.name,
          p_email: editingMember.email.toLowerCase().trim(),
          p_password: memberPassword,
          p_admin_id: currentUser.id,
          p_permissions: perms
        });
        if (error) throw error;
      }

      await fetchTeamMembers();
      setIsMemberModalOpen(false);
      setEditingMember(null);
      setMemberPassword('');
    } catch (err: any) {
      alert("Erro ao salvar membro: " + (err.message || "Erro inesperado"));
    } finally {
      setIsSavingMember(false);
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

  // Funções de Importação Avançada
  const parseCSVLine = (line: string) => {
    const result = [];
    let cur = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const handleInitialFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'products' | 'customers') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length < 1) {
        alert("O arquivo está vazio.");
        return;
      }

      const rawLines = lines.map(line => parseCSVLine(line));
      const headers = rawLines[0];

      const fields = type === 'products' ? PRODUCT_FIELDS : CUSTOMER_FIELDS;
      const initialMapping: Record<string, string> = {};
      fields.forEach(f => {
        const found = headers.find(h => h.toLowerCase().includes(f.label.toLowerCase()) || h.toLowerCase() === f.id.toLowerCase());
        if (found) initialMapping[f.id] = found;
      });

      setImportWizard({
        isOpen: true,
        type,
        step: 'config',
        rawLines,
        headers,
        mapping: initialMapping,
        startRow: 1,
        progress: 0,
        results: null
      });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const startProcessingImport = async () => {
    setImportWizard(prev => ({ ...prev, step: 'processing', progress: 0 }));
    const { type, rawLines, mapping, startRow } = importWizard;
    const dataLines = rawLines.slice(startRow);
    let successCount = 0;
    const errorLog: string[] = [];
    const targetUserId = currentUser.owner_id || currentUser.id;

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      const data: any = {};
      importWizard.headers.forEach((h, idx) => {
        data[h] = line[idx] || '';
      });

      try {
        if (type === 'products') {
          const mappedName = data[mapping['name']] || 'Produto Importado';
          const mappedSku = data[mapping['sku']] || '';
          const mappedPrice = parseFloat(String(data[mapping['price']] || 0).replace(',', '.'));
          const mappedStock = parseInt(data[mapping['stock']] || 0);
          const mappedCategory = data[mapping['category']];
          const mappedSubcategories = data[mapping['subcategories']];
          const mappedDesc = data[mapping['description']] || '';
          const mappedStatus = data[mapping['status']] || 'active';

          let categoryId = null;
          if (mappedCategory) {
            const { data: catData } = await supabase.from('categories').select('id').eq('name', mappedCategory).eq('user_id', targetUserId).maybeSingle();
            if (catData) {
              categoryId = catData.id;
            } else {
              const { data: newCat } = await supabase.from('categories').insert({ name: mappedCategory, user_id: targetUserId }).select('id').single();
              categoryId = newCat?.id;
            }
          }

          const subIds: (number | string)[] = [];
          const subStock: Record<string, number> = {};
          if (mappedSubcategories && categoryId) {
            const subNames = String(mappedSubcategories).split(',').map(s => s.trim()).filter(Boolean);
            for (const sName of subNames) {
              const { data: subData } = await supabase.from('subcategories').select('id').eq('name', sName).eq('category_id', categoryId).eq('user_id', targetUserId).maybeSingle();
              if (subData) {
                subIds.push(subData.id);
                subStock[String(subData.id)] = 0;
              } else {
                const { data: newSub } = await supabase.from('subcategories').insert({ name: sName, category_id: categoryId, user_id: targetUserId }).select('id').single();
                if (newSub) {
                  subIds.push(newSub.id);
                  subStock[String(newSub.id)] = 0;
                }
              }
            }
          }

          const { error } = await supabase.from('products').insert({
            name: mappedName,
            sku: mappedSku,
            price: mappedPrice,
            stock: mappedStock,
            description: mappedDesc,
            status: mappedStatus,
            category_id: categoryId,
            subcategory_ids: subIds,
            subcategory_stock: subStock,
            user_id: targetUserId
          });
          if (error) throw error;
        } else {
          const { error } = await supabase.from('customers').insert({
            name: data[mapping['name']] || 'Cliente Importado',
            email: data[mapping['email']] || '',
            phone: data[mapping['phone']] || '',
            document: data[mapping['document']] || '',
            zip_code: data[mapping['zip_code']] || '',
            address: data[mapping['address']] || '',
            number: data[mapping['number']] || '',
            neighborhood: data[mapping['neighborhood']] || '',
            city: data[mapping['city']] || '',
            state: data[mapping['state']] || '',
            notes: data[mapping['notes']] || '',
            status: 'active',
            user_id: targetUserId
          });
          if (error) throw error;
        }
        successCount++;
      } catch (err: any) {
        errorLog.push(`Linha ${i + startRow + 1}: ${err.message}`);
      }
      setImportWizard(prev => ({ ...prev, progress: Math.round(((i + 1) / dataLines.length) * 100) }));
    }

    setImportWizard(prev => ({
      ...prev,
      step: 'result',
      results: { success: successCount, errors: errorLog }
    }));
    if (onRefresh) onRefresh();
  };

  const downloadModel = (type: 'products' | 'customers') => {
    let headers = '';
    let sample = '';
    if (type === 'products') {
      headers = 'Nome,SKU,Preco,Estoque,Categoria,Subcategorias,Descricao,Status';
      sample = 'Tênis Esportivo Pro,SKU123,299.90,50,Calçados,"Corrida, Academia, Casual",O melhor tênis para seu treino,active';
    } else {
      headers = 'Nome,Email,Telefone,Documento,CEP,Endereco,Numero,Bairro,Cidade,Estado,Status,Notas';
      sample = 'João Silva,joao@exemplo.com,11999999999,123.456.789-00,01001-000,Praça da Sé,100,Centro,São Paulo,SP,active,Cliente prefere entrega de manhã';
    }
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers + "\n" + sample;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `modelo_importacao_${type}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTableNameFriendly = (table: string) => {
    const map: Record<string, string> = {
      'products': 'Produto',
      'customers': 'Cliente',
      'catalogs': 'Catálogo',
      'quotations': 'Orçamento',
      'categories': 'Categoria',
      'subcategories': 'Subcategoria',
      'payment_methods': 'Forma Pagto',
      'companies': 'Empresa'
    };
    return map[table] || table;
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'INSERT': return { label: 'CRIADO', color: 'bg-emerald-50 text-emerald-600', icon: <Plus size={12}/> };
      case 'UPDATE': return { label: 'EDITADO', color: 'bg-indigo-50 text-indigo-600', icon: <Edit2 size={12}/> };
      case 'DELETE': return { label: 'EXCLUÍDO', color: 'bg-red-50 text-red-600', icon: <Trash2 size={12}/> };
      default: return { label: action, color: 'bg-slate-100 text-slate-600', icon: <Info size={12}/> };
    }
  };

  const getAuditDiff = (oldData: any, newData: any) => {
    const diffs: { field: string; oldVal: any; newVal: any }[] = [];
    const keys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);
    const ignoreFields = ['updated_at', 'created_at', 'user_id', 'id', 'stock_history'];

    keys.forEach(key => {
      if (ignoreFields.includes(key)) return;
      if (JSON.stringify(oldData?.[key]) !== JSON.stringify(newData?.[key])) {
        diffs.push({ field: key, oldVal: oldData?.[key], newVal: newData?.[key] });
      }
    });
    return diffs;
  };

  const formatDiffValue = (val: any) => {
    if (val === null || val === undefined) return <span className="text-slate-300 italic">Vazio</span>;
    if (typeof val === 'boolean') return val ? 'Sim' : 'Não';
    if (Array.isArray(val)) return `Lista (${val.length} itens)`;
    if (typeof val === 'object') return 'Dados complexos';
    const str = String(val);
    if (str.startsWith('data:image')) return 'Imagem (Base64)';
    return str;
  };

  const updateMemberPermission = (module: keyof UserPermissions, level: PermissionLevel) => {
    if (!editingMember) return;
    const currentPerms = editingMember.permissions || DEFAULT_PERMISSIONS;
    setEditingMember({
      ...editingMember,
      permissions: { ...currentPerms, [module]: level }
    });
  };

  const getModuleLabel = (module: keyof UserPermissions) => {
    const map: Record<keyof UserPermissions, string> = {
      products: 'Produtos',
      customers: 'Clientes',
      categories: 'Categorias',
      promotions: 'Promoções',
      catalogs: 'Catálogos',
      quotations: 'Orçamentos'
    };
    return map[module];
  };

  const SettingsTab: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick: () => void; }> = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all shrink-0 snap-center whitespace-nowrap ${active ? 'bg-indigo-600 text-white shadow-lg lg:w-full' : 'bg-white lg:bg-transparent lg:w-full text-slate-500 hover:bg-slate-100'}`}>
      {icon}<span className="font-black text-[10px] uppercase tracking-widest">{label}</span>
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500 pb-10">
      <aside className="w-full lg:w-72 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide shrink-0 snap-x snap-mandatory">
        <h3 className="hidden lg:block text-[10px] font-black text-slate-400 px-4 mb-6 uppercase tracking-widest">Painel de Controle</h3>
        <SettingsTab icon={<UserIcon size={20} />} label="Perfil" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        {currentUser.role === 'admin' && (
          <>
            <SettingsTab icon={<Building2 size={20} />} label="Empresa" active={activeTab === 'company'} onClick={() => setActiveTab('company')} />
            <SettingsTab icon={<Wallet size={20} />} label="Pagamentos" active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} />
            <SettingsTab icon={<Users size={20} />} label="Equipe" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
          </>
        )}
        <SettingsTab icon={<FileUp size={20} />} label="Importar" active={activeTab === 'import'} onClick={() => setActiveTab('import')} />
        <SettingsTab icon={<Shield size={20} />} label="Auditoria" active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} />
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
                   <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">{currentUser.role === 'admin' ? 'Administrador' : 'Equipe'}</span>
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
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">E-mail Comercial</label>
                      <input type="email" value={companyFormData.email || ''} onChange={e => setCompanyFormData({...companyFormData, email: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" placeholder="contato@empresa.com" />
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
                <p className="text-slate-500 font-medium">Configure as opções de pagamento aceitas e suas taxas.</p>
              </div>
              <button 
                onClick={() => { setEditingPayment({ show_in_cart: true }); setIsPaymentModalOpen(true); }}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-100"
              >
                <Plus size={18} /> Novo Método
              </button>
            </div>

            {isFetchingPayments ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>
            ) : paymentMethods.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentMethods.filter(pm => pm.status === 'active').map(pm => (
                  <div key={pm.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 hover:shadow-xl transition-all group relative overflow-hidden">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingPayment(pm); setIsPaymentModalOpen(true); }} className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm"><Edit2 size={16}/></button>
                        <button onClick={() => handleDeletePaymentClick(pm.id, pm.name)} className="p-2 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"><Trash2 size={16}/></button>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0"><Wallet size={28} /></div>
                      <div className="min-w-0">
                        <h5 className="text-lg font-black text-slate-800 uppercase tracking-tight truncate">{pm.name}</h5>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${pm.show_in_cart ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            {pm.show_in_cart ? 'Visível na Vitrine' : 'Oculto na Vitrine'}
                          </span>
                        </div>
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
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40">
                <Wallet size={64} className="text-slate-300" />
                <p className="font-black text-slate-800 uppercase tracking-widest text-sm">Nenhum método cadastrado</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="p-6 lg:p-10 space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h4 className="text-3xl font-black text-slate-800 tracking-tight">Equipe</h4>
                <p className="text-slate-500 font-medium">Membros vinculados à sua empresa.</p>
              </div>
              <button 
                onClick={() => { setEditingMember({ permissions: DEFAULT_PERMISSIONS, status: 'active', role: 'editor' }); setIsMemberModalOpen(true); }}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-100"
              >
                <UserPlus size={18} /> Convidar Membro
              </button>
            </div>

            {isFetchingTeam ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>
            ) : systemUsers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {systemUsers.map(member => (
                  <div key={member.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 hover:shadow-xl transition-all group relative overflow-hidden">
                    <div className="absolute top-4 right-4">
                       <button onClick={() => { setEditingMember(member); setIsMemberModalOpen(true); }} className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm"><Edit2 size={16}/></button>
                    </div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shrink-0 overflow-hidden">
                        {member.photo ? <img src={member.photo} className="w-full h-full object-cover" /> : <UserIcon size={28} />}
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-lg font-black text-slate-800 uppercase tracking-tight truncate">{member.name}</h5>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-50">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${member.role === 'admin' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                        {member.role === 'admin' ? 'Administrador' : 'Editor'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${member.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        {member.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40">
                <Users size={64} className="text-slate-300" />
                <p className="font-black text-slate-800 uppercase tracking-widest text-sm">Nenhum membro cadastrado</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="p-6 lg:p-10 space-y-8 animate-in slide-in-from-right-4 duration-500 flex flex-col h-full">
            <div>
              <h4 className="text-3xl font-black text-slate-800 tracking-tight">Auditoria de Dados</h4>
              <p className="text-slate-500 font-medium">Histórico completo de alterações no sistema.</p>
            </div>

            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                value={auditSearch}
                onChange={e => setAuditSearch(e.target.value)}
                placeholder="Pesquisar por ação, tabela ou ID..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
              />
            </div>

            <div className="flex-1 overflow-y-auto min-h-[400px] pr-2 custom-scrollbar">
              {isFetchingAudit ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                  <Loader2 className="animate-spin text-indigo-600" size={40} />
                  <p className="font-black uppercase text-[10px] tracking-widest">Sincronizando registros...</p>
                </div>
              ) : filteredAuditLogs.length > 0 ? (
                <div className="space-y-3">
                  {filteredAuditLogs.map(log => {
                    const action = getActionLabel(log.action);
                    return (
                      <div 
                        key={log.id} 
                        onClick={() => { setViewingLog(log); setAuditModalTab('visual'); }}
                        className="group bg-white border border-slate-100 rounded-3xl p-5 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center gap-5 min-w-0">
                          <div className={`w-12 h-12 rounded-2xl ${action.color} flex items-center justify-center shadow-inner shrink-0 group-hover:scale-110 transition-transform`}>
                            {action.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{getTableNameFriendly(log.table_name)}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-[10px] font-black text-slate-500 bg-slate-50 px-2 py-0.5 rounded uppercase">Cód: #{log.record_id}</span>
                            </div>
                            <h5 className="font-bold text-slate-800 text-sm truncate uppercase">
                               {log.action === 'INSERT' ? `Novo(a) ${getTableNameFriendly(log.table_name)}` : 
                                log.action === 'UPDATE' ? `Alteração em ${getTableNameFriendly(log.table_name)}` : 
                                `Remoção de ${getTableNameFriendly(log.table_name)}`}
                            </h5>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 shrink-0">
                          <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-black text-slate-800 uppercase mb-0.5">{new Date(log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(log.created_at).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <ChevronRight className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" size={20} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40">
                  <Shield size={64} className="text-slate-300" />
                  <p className="font-black text-slate-800 uppercase tracking-widest text-sm">Nenhum registro de auditoria encontrado</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'import' && (
          <div className="p-6 lg:p-10 space-y-10 animate-in slide-in-from-right-4 duration-500">
             <div>
                <h4 className="text-3xl font-black text-slate-800 tracking-tight">Importação Inteligente</h4>
                <p className="text-slate-500 font-medium">Importe seus registros em massa com assistente de validação.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between h-full">
                   <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center shadow-inner shrink-0">
                           <Package size={32} />
                        </div>
                        <div>
                           <h5 className="text-xl font-black uppercase tracking-tight text-slate-800">Produtos</h5>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Catálogo e Estoque</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        Envie uma planilha de produtos. Você poderá mapear as colunas e revisar os dados antes da carga final.
                      </p>
                   </div>
                   <div className="mt-10 space-y-4">
                      <button onClick={() => downloadModel('products')} className="w-full flex items-center justify-center gap-2 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                         <Download size={18} /> Baixar Modelo
                      </button>
                      <label className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-xl active:scale-95">
                         <FileSpreadsheet size={18} /> Selecionar Planilha
                         <input type="file" accept=".csv" onChange={(e) => handleInitialFileSelect(e, 'products')} className="hidden" />
                      </label>
                   </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between h-full">
                   <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center shadow-inner shrink-0">
                           <Users size={32} />
                        </div>
                        <div>
                           <h5 className="text-xl font-black uppercase tracking-tight text-slate-800">Clientes</h5>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base de Contatos</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        Mapeie seus contatos de forma flexível. Suporta colunas personalizadas de endereço e identificação.
                      </p>
                   </div>
                   <div className="mt-10 space-y-4">
                      <button onClick={() => downloadModel('customers')} className="w-full flex items-center justify-center gap-2 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                         <Download size={18} /> Baixar Modelo
                      </button>
                      <label className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-xl active:scale-95">
                         <FileSpreadsheet size={18} /> Selecionar Planilha
                         <input type="file" accept=".csv" onChange={(e) => handleInitialFileSelect(e, 'customers')} className="hidden" />
                      </label>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Modais Restaurados e Aprimorados */}
      {viewingLog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${getActionLabel(viewingLog.action).color}`}>
                    {getActionLabel(viewingLog.action).icon}
                 </div>
                 <div>
                    <h3 className="font-black uppercase tracking-tight text-sm">Detalhamento de Auditoria</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{getTableNameFriendly(viewingLog.table_name)} #{viewingLog.record_id}</p>
                 </div>
              </div>
              <button onClick={() => setViewingLog(null)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={24}/></button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50/30 custom-scrollbar">
               {/* Menu de Tabs do Modal */}
               <div className="flex bg-white border-b border-slate-100 px-8 py-2">
                  <button 
                    onClick={() => setAuditModalTab('visual')}
                    className={`flex items-center gap-2 px-6 py-3 text-[11px] font-black uppercase tracking-widest transition-all border-b-4 ${auditModalTab === 'visual' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                  >
                    <LayoutGrid size={14} /> Comparativo Visual
                  </button>
                  <button 
                    onClick={() => setAuditModalTab('json')}
                    className={`flex items-center gap-2 px-6 py-3 text-[11px] font-black uppercase tracking-widest transition-all border-b-4 ${auditModalTab === 'json' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                  >
                    <Code size={14} /> Dados Técnicos (JSON)
                  </button>
               </div>

               <div className="p-8 space-y-8">
                  {auditModalTab === 'visual' ? (
                    <div className="animate-in fade-in slide-in-from-top-2">
                       <div className="grid grid-cols-2 gap-4 mb-8">
                          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Ação Realizada</p>
                            <p className="text-xs font-black text-slate-800 uppercase flex items-center gap-2">
                               {getActionLabel(viewingLog.action).icon}
                               {viewingLog.action === 'UPDATE' ? 'Atualização de Registro' : viewingLog.action === 'INSERT' ? 'Novo Registro' : 'Remoção de Registro'}
                            </p>
                          </div>
                          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Data e Hora</p>
                            <p className="text-xs font-black text-slate-800 flex items-center gap-2">
                              <Calendar size={12} className="text-indigo-500" />
                              {new Date(viewingLog.created_at).toLocaleString('pt-BR')}
                            </p>
                          </div>
                       </div>

                       {viewingLog.action === 'UPDATE' ? (
                         <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                              <p className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                <ArrowLeftRight size={14} /> Comparativo de Campos
                              </p>
                              <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded">Apenas Alterações</span>
                            </div>
                            
                            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                              <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                  <tr>
                                    <th className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest w-1/4">Atributo</th>
                                    <th className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Valor Anterior</th>
                                    <th className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Novo Valor</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                  {getAuditDiff(viewingLog.old_data, viewingLog.new_data).map(diff => (
                                    <tr key={diff.field} className="hover:bg-slate-50/50 transition-colors">
                                      <td className="px-5 py-4">
                                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-tight">{diff.field}</span>
                                      </td>
                                      <td className="px-5 py-4">
                                        <span className="text-xs font-bold text-red-500/70 line-through decoration-red-300">
                                          {formatDiffValue(diff.oldVal)}
                                        </span>
                                      </td>
                                      <td className="px-5 py-4">
                                        <span className="text-xs font-black text-emerald-600">
                                          {formatDiffValue(diff.newVal)}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                  {getAuditDiff(viewingLog.old_data, viewingLog.new_data).length === 0 && (
                                    <tr>
                                      <td colSpan={3} className="px-5 py-10 text-center text-slate-400 italic text-xs">Nenhuma mudança de valor detectada.</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                         </div>
                       ) : (
                         <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                            <p className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-6">Estado Completo do Registro</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                               {Object.entries((viewingLog.action === 'INSERT' ? viewingLog.new_data : viewingLog.old_data) || {}).map(([key, value]) => {
                                 if (['stock_history', 'user_id', 'id'].includes(key)) return null;
                                 return (
                                   <div key={key} className="space-y-1">
                                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{key}</p>
                                     <p className="text-xs font-bold text-slate-700 truncate">{formatDiffValue(value)}</p>
                                   </div>
                                 );
                               })}
                            </div>
                         </div>
                       )}
                    </div>
                  ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <div className="flex items-center gap-2 text-slate-400 mb-2">
                                <FileJson size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Dados Anteriores (Old)</span>
                             </div>
                             <div className="bg-slate-900 rounded-2xl p-4 overflow-hidden border border-white/5">
                                <pre className="text-[11px] font-mono text-indigo-300 overflow-x-auto custom-scrollbar max-h-96">
                                   {JSON.stringify(viewingLog.old_data, null, 2) || "// Sem dados"}
                                </pre>
                             </div>
                          </div>
                          <div className="space-y-2">
                             <div className="flex items-center gap-2 text-emerald-500 mb-2">
                                <FileJson size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Novos Dados (New)</span>
                             </div>
                             <div className="bg-slate-900 rounded-2xl p-4 overflow-hidden border border-white/5">
                                <pre className="text-[11px] font-mono text-emerald-300 overflow-x-auto custom-scrollbar max-h-96">
                                   {JSON.stringify(viewingLog.new_data, null, 2) || "// Sem dados"}
                                </pre>
                             </div>
                          </div>
                       </div>
                    </div>
                  )}
               </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
               <button onClick={() => setViewingLog(null)} className="px-10 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm hover:bg-slate-100 transition-all">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in">
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
                    <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                 <button type="button" onClick={() => setEditingPayment({...editingPayment, show_in_cart: !(editingPayment?.show_in_cart ?? true)})}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${editingPayment?.show_in_cart ?? true ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                 >
                    <div className="flex items-center gap-3">{editingPayment?.show_in_cart ?? true ? <Eye size={18}/> : <EyeOff size={18}/>} <span className="font-black text-[10px] uppercase tracking-widest">Exibir no carrinho</span></div>
                    <div className={`w-10 h-6 rounded-full relative transition-colors ${editingPayment?.show_in_cart ?? true ? 'bg-emerald-500' : 'bg-slate-300'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editingPayment?.show_in_cart ?? true ? 'right-1' : 'left-1'}`} /></div>
                 </button>
              </div>
              <button type="submit" disabled={isSavingPayment} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-95">
                {isSavingPayment ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />} Salvar Configuração
              </button>
            </form>
          </div>
        </div>
      )}

      {isMemberModalOpen && editingMember && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-2xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[90vh]">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <h3 className="font-black uppercase tracking-widest text-sm">{editingMember.id ? 'Editar Membro' : 'Novo Membro'}</h3>
              <button onClick={() => setIsMemberModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={24}/></button>
            </div>
            <form onSubmit={handleSaveMember} className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/30">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nome Completo*</label>
                    <input required type="text" value={editingMember.name || ''} onChange={e => setEditingMember({...editingMember, name: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-bold outline-none" placeholder="Ex: João Vendedor" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">E-mail de Acesso*</label>
                    <input required type="email" disabled={!!editingMember.id} value={editingMember.email || ''} onChange={e => setEditingMember({...editingMember, email: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-bold outline-none disabled:opacity-50" placeholder="joao@empresa.com" />
                  </div>
                  {!editingMember.id && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Senha Inicial*</label>
                      <input required type="password" value={memberPassword} onChange={e => setMemberPassword(e.target.value)} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-bold outline-none" placeholder="••••••••" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Status da Conta</label>
                    <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200">
                       <button type="button" onClick={() => setEditingMember({...editingMember, status: 'active'})} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${editingMember.status === 'active' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400'}`}>Ativo</button>
                       <button type="button" onClick={() => setEditingMember({...editingMember, status: 'inactive'})} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${editingMember.status === 'inactive' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400'}`}>Inativo</button>
                    </div>
                  </div>
               </div>

               <div className="space-y-4 pt-6 border-t border-slate-200">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-2">Controle de Permissões</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(Object.keys(DEFAULT_PERMISSIONS) as Array<keyof UserPermissions>).map(module => (
                      <div key={module} className="bg-white border border-slate-200 p-4 rounded-[1.5rem] space-y-3">
                         <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{getModuleLabel(module)}</span>
                            <div className={`p-1.5 rounded-lg ${(editingMember.permissions || DEFAULT_PERMISSIONS)[module] === 'edit' ? 'bg-emerald-50 text-emerald-600' : (editingMember.permissions || DEFAULT_PERMISSIONS)[module] === 'view' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                              {(editingMember.permissions || DEFAULT_PERMISSIONS)[module] === 'edit' ? <ShieldCheck size={14}/> : (editingMember.permissions || DEFAULT_PERMISSIONS)[module] === 'view' ? <Eye size={14}/> : <ShieldAlert size={14}/>}
                            </div>
                         </div>
                         <div className="flex gap-1 bg-slate-50 p-1 rounded-xl">
                            {(['none', 'view', 'edit'] as PermissionLevel[]).map(level => (
                              <button key={level} type="button" onClick={() => updateMemberPermission(module, level)}
                                className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${(editingMember.permissions || DEFAULT_PERMISSIONS)[module] === level ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100' : 'text-slate-400'}`}>
                                {level === 'none' ? 'Bloquear' : level === 'view' ? 'Ver' : 'Editar'}
                              </button>
                            ))}
                         </div>
                      </div>
                    ))}
                  </div>
               </div>

               <button type="submit" disabled={isSavingMember} className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl transition-all flex items-center justify-center gap-3">
                 {isSavingMember ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />} {editingMember.id ? 'Salvar Membro' : 'Concluir Convite'}
               </button>
            </form>
          </div>
        </div>
      )}

      {importWizard.isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-5xl h-full sm:h-auto sm:max-h-[90vh] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center"><Settings2 size={24} /></div>
                  <div><h3 className="text-xl font-black uppercase tracking-tight">Assistente de Importação</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{importWizard.type === 'products' ? 'Importando Produtos' : 'Importando Clientes'} • Passo {importWizard.step === 'config' ? '1: Configuração' : importWizard.step === 'preview' ? '2: Pré-visualização' : '3: Conclusão'}</p></div>
               </div>
               <button onClick={() => setImportWizard(prev => ({ ...prev, isOpen: false }))} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24}/></button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
               {importWizard.step === 'config' && (
                 <div className="p-8 space-y-10">
                    <div className="p-6 bg-white border border-slate-100 rounded-3xl space-y-4 shadow-sm">
                       <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><ArrowRight size={16} className="text-indigo-600"/> Início dos Dados</h4>
                       <div className="flex items-center gap-4"><div className="flex-1"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Linha onde começam os dados (ignorar cabeçalhos extras)</p><div className="flex items-center gap-3"><input type="number" min="1" value={importWizard.startRow + 1} onChange={e => setImportWizard({...importWizard, startRow: Math.max(0, parseInt(e.target.value) - 1)})} className="w-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-indigo-600 outline-none" /><span className="text-xs font-bold text-slate-500">Ex: Se a linha 1 for o título da coluna, os dados começam na linha 2.</span></div></div></div>
                    </div>
                    <div className="space-y-6">
                       <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 px-1"><Layers size={16} className="text-indigo-600"/> Mapeamento de Colunas</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(importWizard.type === 'products' ? PRODUCT_FIELDS : CUSTOMER_FIELDS).map(field => (
                            <div key={field.id} className="p-5 bg-white border border-slate-100 rounded-3xl flex items-center justify-between shadow-sm group hover:border-indigo-200 transition-all">
                               <div className="min-w-0"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{field.label}</p><p className="text-xs font-bold text-slate-800">{field.id === 'name' ? 'Obrigatório' : 'Opcional'}</p></div>
                               <select value={importWizard.mapping[field.id] || ''} onChange={e => setImportWizard({ ...importWizard, mapping: { ...importWizard.mapping, [field.id]: e.target.value } })} className="ml-4 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 transition-all cursor-pointer">
                                  <option value="">Ignorar Coluna</option>
                                  {importWizard.headers.map(h => (<option key={h} value={h}>{h}</option>))}
                               </select>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
               )}
               {importWizard.step === 'preview' && (
                 <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between px-1"><h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><Eye size={18} className="text-indigo-600"/> Pré-visualização</h4></div>
                    <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-xl overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-900 text-white"><tr>{(importWizard.type === 'products' ? PRODUCT_FIELDS : CUSTOMER_FIELDS).map(f => (<th key={f.id} className="px-6 py-4 text-[9px] font-black uppercase whitespace-nowrap">{f.label}</th>))}</tr></thead><tbody className="divide-y divide-slate-50">{importWizard.rawLines.slice(importWizard.startRow, importWizard.startRow + 5).map((line, idx) => { const rowData: any = {}; importWizard.headers.forEach((h, i) => rowData[h] = line[i]); return (<tr key={idx} className="hover:bg-slate-50 transition-colors">{(importWizard.type === 'products' ? PRODUCT_FIELDS : CUSTOMER_FIELDS).map(f => { const colName = importWizard.mapping[f.id]; return <td key={f.id} className="px-6 py-4 text-xs font-bold text-slate-600 max-w-[200px] truncate">{colName ? rowData[colName] : '-'}</td>; })}</tr>); })}</tbody></table></div>
                 </div>
               )}
               {importWizard.step === 'processing' && (
                 <div className="p-20 text-center space-y-8"><Loader2 className="animate-spin mx-auto text-indigo-600" size={48} /><h4 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Importando Registros</h4><div className="max-w-md mx-auto space-y-4"><div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${importWizard.progress}%` }} /></div><p className="text-2xl font-black text-indigo-600">{importWizard.progress}%</p></div></div>
               )}
               {importWizard.step === 'result' && (
                 <div className="p-10 space-y-8 flex flex-col items-center"><CheckCircle2 className="text-emerald-600" size={48} /><h4 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Carga Concluída</h4><p className="text-lg font-black text-emerald-600">{importWizard.results?.success} registros importados!</p></div>
               )}
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
               {importWizard.step === 'config' && (<><button onClick={() => setImportWizard(prev => ({ ...prev, isOpen: false }))} className="px-8 py-3 text-slate-400 font-black uppercase text-[10px]">Cancelar</button><button onClick={() => setImportWizard(prev => ({ ...prev, step: 'preview' }))} disabled={!importWizard.mapping['name']} className="flex items-center gap-2 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl disabled:opacity-50">Continuar <ArrowRight size={18}/></button></>)}
               {importWizard.step === 'preview' && (<><button onClick={() => setImportWizard(prev => ({ ...prev, step: 'config' }))} className="flex items-center gap-2 px-8 py-3 text-slate-500 font-black uppercase text-[10px]"><ArrowLeft size={16}/> Voltar</button><button onClick={startProcessingImport} className="flex items-center gap-3 px-12 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-emerald-100"><CheckCircle size={20}/> Importar Agora</button></>)}
               {importWizard.step === 'result' && (<button onClick={() => setImportWizard(prev => ({ ...prev, isOpen: false }))} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs">Fechar</button>)}
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal isOpen={isDeletePaymentModalOpen} title="Desativar Pagamento" message={`Deseja realmente desativar "${paymentToDelete?.name}"? Esta ação ocultará a opção mas manterá o histórico antigo.`} confirmLabel="Desativar" cancelLabel="Voltar" onConfirm={executeDeletePayment} onCancel={() => { setIsDeletePaymentModalOpen(false); setPaymentToDelete(null); }} isLoading={isDeletingPayment} />
    </div>
  );
};

export default SettingsView;
