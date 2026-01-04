
import React, { useState, useRef, useMemo } from 'react';
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
  LogOut
} from 'lucide-react';
import { Product, Category, User, UserPermissions, PermissionLevel } from '../types';

interface SettingsViewProps {
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  categories: Category[];
  currentUser: User;
  onUpdateCurrentUser: (user: User) => void;
  systemUsers: User[];
  setSystemUsers: React.Dispatch<React.SetStateAction<User[]>>;
  onLogout: () => void;
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
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | 'idle', message: string }>({ type: 'idle', message: '' });
  const [isImporting, setIsImporting] = useState(false);
  const [logSearch, setLogSearch] = useState('');
  
  // Profile States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // User Management States
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Mapping States for Import
  const [showMapping, setShowMapping] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [currentImportType, setCurrentImportType] = useState<ImportType>('products');
  const [mapping, setMapping] = useState<MappingState>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredLogs = useMemo(() => {
    return mockLogs.filter(log => 
      log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.module.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.user.toLowerCase().includes(logSearch.toLowerCase())
    );
  }, [logSearch]);

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

  // --- Import Logic ---
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim() !== '');
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(h => h.trim());
        const rows = lines.slice(1).map(line => line.split(',').map(c => c.trim()));
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

  const handleFinalImport = () => {
    setIsImporting(true);
    // Simular processamento
    setTimeout(() => {
      setIsImporting(false);
      setShowMapping(false);
      setImportStatus({ type: 'success', message: `Importação de ${currentImportType} concluída com sucesso!` });
      setTimeout(() => setImportStatus({ type: 'idle', message: '' }), 5000);
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500 pb-10">
      <aside className="w-full lg:w-72 space-y-2 overflow-x-auto lg:overflow-visible flex lg:flex-col pb-4 lg:pb-0 scrollbar-hide">
        <h3 className="hidden lg:block text-[10px] font-black text-slate-400 px-4 mb-6 uppercase tracking-widest">Painel de Controle</h3>
        <SettingsTab icon={<UserIcon size={20} />} label="Perfil & Segurança" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        <SettingsTab icon={<Users size={20} />} label="Usuários do Sistema" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
        <SettingsTab icon={<FileUp size={20} />} label="Importação" active={activeTab === 'import'} onClick={() => setActiveTab('import')} />
        <SettingsTab icon={<History size={20} />} label="Logs & Auditoria" active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} />
      </aside>

      <div className="flex-1 bg-white rounded-[2rem] lg:rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col relative">
        
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="p-6 lg:p-10 space-y-10 animate-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left">
               <div className="relative group">
                 <div className="w-32 h-32 rounded-[2.5rem] bg-slate-100 border-4 border-white shadow-2xl overflow-hidden">
                   <img src={`https://picsum.photos/seed/${currentUser.id}/200`} className="w-full h-full object-cover" />
                 </div>
                 <button className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-xl hover:bg-indigo-700 transition-all border-4 border-white">
                   <Upload size={18} />
                 </button>
               </div>
               <div className="space-y-2">
                 <h4 className="text-3xl font-black text-slate-800">{currentUser.name}</h4>
                 <p className="text-slate-500 font-medium">{currentUser.email}</p>
                 <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-2">
                   <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">{currentUser.role}</span>
                   <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">Sessão Ativa</span>
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
              <div className="space-y-6">
                <h5 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <UserIcon size={16} className="text-indigo-600" /> Dados Pessoais
                </h5>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nome Completo</label>
                    <input type="text" defaultValue={currentUser.name} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-50 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">E-mail</label>
                    <input type="email" defaultValue={currentUser.email} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-50 outline-none transition-all" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h5 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <Lock size={16} className="text-amber-600" /> Segurança & Senha
                </h5>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Senha Atual</label>
                    <input 
                      type="password" 
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-50 outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nova Senha</label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-50 outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Confirmar Nova Senha</label>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repita a nova senha"
                      className={`w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold focus:ring-4 outline-none transition-all ${newPassword && confirmPassword && newPassword !== confirmPassword ? 'border-red-300 ring-red-50' : 'border-slate-100 focus:ring-indigo-50'}`}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleSaveProfile}
                  className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-3"
                >
                  <Check size={20} /> Salvar Alterações
                </button>
                {profileSuccess && (
                  <span className="text-emerald-600 font-bold text-sm animate-in fade-in slide-in-from-left-2 flex items-center gap-2">
                    <CheckCircle size={18} /> Alterações salvas!
                  </span>
                )}
              </div>

              <button 
                onClick={onLogout}
                className="flex items-center gap-2 px-6 py-4 bg-white border border-red-100 hover:bg-red-50 text-red-500 rounded-2xl font-black text-sm transition-all shadow-sm"
              >
                <LogOut size={20} /> Encerrar Sessão
              </button>
            </div>
          </div>
        )}

        {/* Import Tab */}
        {activeTab === 'import' && (
          <div className="p-6 lg:p-10 space-y-10 animate-in slide-in-from-right-4 duration-500">
            <div>
              <h4 className="text-2xl font-black text-slate-800 tracking-tight">Migração de Dados</h4>
              <p className="text-sm text-slate-500 font-medium">Importe seus dados via arquivo CSV ou Excel de forma massiva.</p>
            </div>

            {importStatus.type !== 'idle' && (
              <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in zoom-in-95 duration-300 ${importStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                {importStatus.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <span className="text-sm font-bold">{importStatus.message}</span>
              </div>
            )}

            {!showMapping ? (
              <div className="space-y-10">
                {/* Type Selection Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ImportTypeCard 
                    title="Produtos"
                    desc="Importe estoque e preços"
                    icon={<Package className="text-indigo-600" size={24} />}
                    active={currentImportType === 'products'}
                    onClick={() => setCurrentImportType('products')}
                    onDownload={() => downloadCSVTemplate('products')}
                  />
                  <ImportTypeCard 
                    title="Categorias"
                    desc="Estrutura principal"
                    icon={<Tags className="text-emerald-600" size={24} />}
                    active={currentImportType === 'categories'}
                    onClick={() => setCurrentImportType('categories')}
                    onDownload={() => downloadCSVTemplate('categories')}
                  />
                  <ImportTypeCard 
                    title="Subcategorias"
                    desc="Hierarquia detalhada"
                    icon={<Layers className="text-amber-600" size={24} />}
                    active={currentImportType === 'subcategories'}
                    onClick={() => setCurrentImportType('subcategories')}
                    onDownload={() => downloadCSVTemplate('subcategories')}
                  />
                </div>

                {/* Upload Area */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative border-4 border-dashed border-slate-100 rounded-[3rem] p-16 flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-indigo-200 hover:bg-slate-50/50 transition-all"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelection} 
                    accept=".csv" 
                    className="hidden" 
                  />
                  <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-500">
                    <FileUp size={48} />
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-black text-slate-800">Clique para fazer upload</p>
                    <p className="text-sm text-slate-400 font-medium mt-1">Formatos suportados: .CSV (Codificação UTF-8)</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <Monitor size={14} /> Importação segura
                  </div>
                </div>

                <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 flex gap-4">
                  <AlertCircle className="text-amber-600 shrink-0" size={24} />
                  <div className="space-y-1">
                    <p className="text-sm font-black text-amber-900 uppercase tracking-tight">Instruções Importantes</p>
                    <ul className="text-xs text-amber-700 space-y-1 font-medium list-disc pl-4">
                      <li>Use sempre o modelo baixado para evitar erros de colunas.</li>
                      <li>Para categorias e subcategorias, nomes duplicados serão ignorados.</li>
                      <li>Imagens devem ser enviadas posteriormente ou via URL no CSV.</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-bottom-4">
                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
                  <div className="flex justify-between items-center mb-6">
                    <h5 className="font-black text-slate-800 uppercase tracking-widest text-xs flex items-center gap-2">
                      <TableIcon size={16} /> Mapeamento de Colunas ({currentImportType})
                    </h5>
                    <button onClick={() => setShowMapping(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-sm text-slate-500 font-medium">Detectamos {csvHeaders.length} colunas e {csvRows.length} registros. Revise o mapeamento antes de confirmar.</p>
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            {csvHeaders.map((h, i) => (
                              <th key={i} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {csvRows.slice(0, 3).map((row, i) => (
                            <tr key={i} className="border-b border-slate-50 last:border-0">
                              {row.map((cell, j) => (
                                <td key={j} className="px-6 py-4 text-xs font-bold text-slate-600 truncate max-w-[150px]">{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 justify-end">
                   <button onClick={() => setShowMapping(false)} className="px-8 py-3 text-slate-400 font-black text-sm uppercase tracking-widest">Cancelar</button>
                   <button 
                    onClick={handleFinalImport}
                    disabled={isImporting}
                    className="flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                   >
                     {isImporting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle size={20} />}
                     Confirmar Importação
                   </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users Management Tab */}
        {activeTab === 'users' && (
          <div className="p-6 lg:p-10 space-y-8 flex-1 flex flex-col animate-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-2xl font-black text-slate-800">Usuários do Sistema</h4>
                <p className="text-sm text-slate-500 font-medium">Controle quem pode acessar e o que pode editar.</p>
              </div>
              <button 
                onClick={() => handleOpenUserModal()}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-xl shadow-indigo-100"
              >
                <Users size={18} /> Novo Usuário
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {systemUsers.map(u => (
                <div key={u.id} className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 hover:shadow-xl hover:bg-white transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner">
                        {u.name[0]}
                      </div>
                      <div>
                        <h5 className="font-black text-slate-800 text-lg leading-tight">{u.name}</h5>
                        <p className="text-xs text-slate-400 font-medium">{u.email}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleOpenUserModal(u)}
                      className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Permissões Ativas</span>
                      <span className="text-indigo-600">{Object.values(u.permissions).filter(p => p !== 'none').length} Módulos</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(u.permissions).map(([module, level]) => (
                        level !== 'none' && (
                          <span key={module} className="px-2 py-1 bg-white border border-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                             <div className={`w-1.5 h-1.5 rounded-full ${level === 'admin' ? 'bg-indigo-500' : 'bg-emerald-400'}`} />
                             {module}
                          </span>
                        )
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${u.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {u.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{u.role}</span>
                  </div>
                </div>
              ))}
            </div>
            {systemUsers.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-20">
                <Users size={64} />
                <p className="mt-4 font-black uppercase tracking-widest">Nenhum usuário cadastrado</p>
              </div>
            )}
          </div>
        )}

        {/* Audit Tab */}
        {activeTab === 'audit' && (
          <div className="p-6 lg:p-10 space-y-8 flex-1 flex flex-col animate-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-2xl font-black text-slate-800">Auditoria</h4>
                <p className="text-sm text-slate-500 font-medium">Histórico completo de modificações no sistema.</p>
              </div>
            </div>
            {filteredLogs.length > 0 ? (
              <div className="border border-slate-100 rounded-[2rem] overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data / Usuário</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ação</th>
                        <th className="px-6 py-5 text-right px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredLogs.map(log => (
                        <tr key={log.id}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-[10px] font-black">{log.user[0]}</div>
                                <div>
                                  <p className="text-sm font-bold text-slate-800">{log.user}</p>
                                  <p className="text-[10px] text-slate-400 font-medium">{log.timestamp}</p>
                                </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-slate-600">{log.action}</p>
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{log.module}</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${log.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                </table>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-20">
                <History size={64} />
                <p className="mt-4 font-black uppercase tracking-widest">Sem logs registrados</p>
              </div>
            )}
          </div>
        )}

        {/* User Modal */}
        {isUserModalOpen && editingUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[90vh] lg:h-auto animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                 <div>
                   <h3 className="text-2xl font-black text-slate-800">Gerenciar Usuário</h3>
                   <p className="text-sm text-slate-500 font-medium">Defina os acessos deste integrante à plataforma.</p>
                 </div>
                 <button onClick={() => setIsUserModalOpen(false)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-600 transition-all"><X size={24} /></button>
              </div>

              <form onSubmit={handleSaveUser} className="p-8 space-y-8 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nome Completo</label>
                    <input 
                      required
                      type="text" 
                      value={editingUser.name}
                      onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-50 outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">E-mail</label>
                    <input 
                      required
                      type="email" 
                      value={editingUser.email}
                      onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-50 outline-none transition-all" 
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                    <Shield size={14} /> Matriz de Permissões
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(editingUser.permissions).map(([module, level]) => (
                      <div key={module} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                        <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest block">{module.replace('dashboard', 'Painel')}</label>
                        <select 
                          value={level}
                          onChange={e => setEditingUser({
                            ...editingUser, 
                            permissions: { ...editingUser.permissions, [module]: e.target.value as PermissionLevel }
                          })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                        >
                          <option value="none">Sem Acesso</option>
                          <option value="view">Visualizar</option>
                          <option value="edit">Editar</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
                   <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-8 py-3 text-slate-400 font-black text-sm hover:text-slate-800 transition-all">Descartar</button>
                   <button type="submit" className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">Salvar Usuário</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SettingsTab: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all whitespace-nowrap lg:w-full ${
      active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 border-none' : 'hover:bg-slate-100 text-slate-500 border border-transparent'
    }`}
  >
    <div className="flex items-center gap-3 font-black text-xs uppercase tracking-widest">
      {icon} <span className="hidden lg:block">{label}</span>
    </div>
    <ChevronRight size={16} className={`hidden lg:block transition-transform ${active ? 'rotate-90 opacity-100' : 'opacity-0'}`} />
  </button>
);

const ImportTypeCard: React.FC<{ title: string; desc: string; icon: React.ReactNode; active: boolean; onClick: () => void; onDownload: () => void }> = ({ title, desc, icon, active, onClick, onDownload }) => (
  <div 
    onClick={onClick}
    className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex flex-col justify-between h-full ${
      active ? 'bg-white border-indigo-600 shadow-xl shadow-indigo-50 scale-105 z-10' : 'bg-slate-50 border-slate-100 hover:border-slate-200'
    }`}
  >
    <div>
      <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 border border-slate-100">
        {icon}
      </div>
      <h5 className="font-black text-slate-800 text-sm uppercase tracking-widest">{title}</h5>
      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{desc}</p>
    </div>
    <button 
      onClick={(e) => { e.stopPropagation(); onDownload(); }}
      className="mt-6 flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:translate-x-1 transition-transform"
    >
      <Download size={14} /> Baixar Modelo
    </button>
  </div>
);

export default SettingsView;
