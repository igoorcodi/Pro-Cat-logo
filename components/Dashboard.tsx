import React, { useState, useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { Product, Catalog, Quotation, ShowcaseOrder } from '../types';
import { 
  Package, 
  AlertCircle, 
  TrendingUp, 
  Clock, 
  ImageOff, 
  CheckCircle, 
  Calendar, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Check,
  DollarSign,
  Layers,
  ShoppingCart
} from 'lucide-react';

interface DashboardProps {
  products: Product[];
  catalogs: Catalog[];
  quotations: Quotation[];
  showcaseOrders: ShowcaseOrder[];
}

type FilterType = 'today' | '7days' | '30days' | 'custom';
type MetricType = 'totalItems' | 'totalValue';

const Dashboard: React.FC<DashboardProps> = ({ products, catalogs, quotations, showcaseOrders }) => {
  const [filterType, setFilterType] = useState<FilterType>('7days');
  const [activeMetric, setActiveMetric] = useState<MetricType>('totalValue');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  const lowStock = products.filter(p => p.stock <= 10);
  const totalStockValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  
  // Vendas de todas as fontes (Orçamentos e Vitrine)
  const deliveredQuotations = quotations.filter(q => q.status === 'delivered');
  const completedShowcaseOrders = showcaseOrders.filter(o => o.status === 'completed');

  // Cálculo do Faturamento do Dia (Unificado)
  const todayRevenue = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const quotRevenue = deliveredQuotations
      .filter(q => {
        const qDate = new Date(q.createdAt || q.quotationDate);
        return qDate >= today && qDate < tomorrow;
      })
      .reduce((sum, q) => sum + (q.total || 0), 0);

    const showcaseRevenue = completedShowcaseOrders
      .filter(o => {
        const oDate = new Date(o.created_at);
        return oDate >= today && oDate < tomorrow;
      })
      .reduce((sum, o) => sum + (o.total || 0), 0);

    return quotRevenue + showcaseRevenue;
  }, [deliveredQuotations, completedShowcaseOrders]);

  // Calcula dinamicamente a distribuição por categoria
  const categoryDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      counts[p.category || 'Sem Categoria'] = (counts[p.category || 'Sem Categoria'] || 0) + 1;
    });
    
    const total = products.length || 1;
    return Object.entries(counts).map(([name, count]) => ({
      name,
      value: Math.round((count / total) * 100)
    }));
  }, [products]);

  // Função auxiliar para criar data local (YYYY-MM-DD)
  const parseLocalDate = (dateStr: string) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Histórico Dinâmico Unificado (Quantidade e Valor)
  const chartData = useMemo(() => {
    const dataMap: Record<string, { totalItems: number, totalValue: number }> = {};
    let startDate = new Date();
    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    if (filterType === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (filterType === '7days') {
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
    } else if (filterType === '30days') {
      startDate.setDate(startDate.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
    } else if (filterType === 'custom') {
      const customStart = parseLocalDate(customRange.start);
      const customEnd = parseLocalDate(customRange.end);
      
      if (!customStart || !customEnd) return [];

      startDate = customStart;
      startDate.setHours(0, 0, 0, 0);
      endDate = customEnd;
      endDate.setHours(23, 59, 59, 999);
      
      if (startDate > endDate) {
        const temp = startDate;
        startDate = endDate;
        endDate = temp;
      }
    } else {
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
    }

    const current = new Date(startDate);
    const maxSafeLoop = 366; 
    let iterations = 0;
    
    while (current <= endDate && iterations < maxSafeLoop) {
      const dateStr = current.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      dataMap[dateStr] = { totalItems: 0, totalValue: 0 };
      current.setDate(current.getDate() + 1);
      iterations++;
    }

    // Processar Orçamentos
    deliveredQuotations.forEach(q => {
      const qDateStr = q.createdAt || q.quotationDate;
      if (!qDateStr) return;
      const qDate = new Date(qDateStr);
      if (qDate.getTime() >= startDate.getTime() && qDate.getTime() <= endDate.getTime()) {
        const dateStr = qDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        if (dataMap[dateStr] !== undefined) {
          dataMap[dateStr].totalValue += (q.total || 0);
          const itemsCount = q.items?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0;
          dataMap[dateStr].totalItems += itemsCount;
        }
      }
    });

    // Processar Pedidos Vitrine
    completedShowcaseOrders.forEach(o => {
      const oDate = new Date(o.created_at);
      if (oDate.getTime() >= startDate.getTime() && oDate.getTime() <= endDate.getTime()) {
        const dateStr = oDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        if (dataMap[dateStr] !== undefined) {
          dataMap[dateStr].totalValue += (o.total || 0);
          const itemsCount = o.items?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0;
          dataMap[dateStr].totalItems += itemsCount;
        }
      }
    });

    return Object.entries(dataMap).map(([name, data]) => ({ name, ...data }));
  }, [deliveredQuotations, completedShowcaseOrders, filterType, customRange]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const handleApplyCustomRange = (start: string, end: string) => {
    setCustomRange({ start, end });
    setFilterType('custom');
    setIsCalendarModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Package className="text-indigo-600" />} 
          label="Total de Produtos" 
          value={products.length.toString()} 
          change="Sincronizado" 
          color="indigo"
        />
        <StatCard 
          icon={<DollarSign className="text-emerald-600" />} 
          label="Faturamento Hoje" 
          value={`R$ ${todayRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          change="Vendas confirmadas hoje"
          color="emerald"
        />
        <StatCard 
          icon={<AlertCircle className="text-amber-600" />} 
          label="Estoque Baixo" 
          value={lowStock.length.toString()} 
          change={lowStock.length > 0 ? "Ação necessária" : "Tudo em dia"}
          color="amber"
          isWarning={lowStock.length > 0}
        />
        <StatCard 
          icon={<TrendingUp className="text-blue-600" />} 
          label="Valor do Estoque" 
          value={`R$ ${(totalStockValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          change="Valor real"
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight text-sm">
              <TrendingUp size={18} className="text-indigo-600" /> Desempenho de Vendas Unificado
            </h3>

            {/* Seletor de Métrica */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
              <button 
                onClick={() => setActiveMetric('totalValue')}
                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeMetric === 'totalValue' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
              >
                <DollarSign size={12} /> Valor
              </button>
              <button 
                onClick={() => setActiveMetric('totalItems')}
                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeMetric === 'totalItems' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
              >
                <Layers size={12} /> Itens
              </button>
            </div>

            {/* Filtros Temporais */}
            <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1.5 rounded-2xl">
              <FilterChip 
                active={filterType === 'today'} 
                onClick={() => setFilterType('today')} 
                label="Hoje" 
              />
              <FilterChip 
                active={filterType === '7days'} 
                onClick={() => setFilterType('7days')} 
                label="7 dias" 
              />
              <FilterChip 
                active={filterType === '30days'} 
                onClick={() => setFilterType('30days')} 
                label="30 dias" 
              />
              <FilterChip 
                active={filterType === 'custom'} 
                onClick={() => setIsCalendarModalOpen(true)} 
                label={customRange.start ? "Período Ativo" : "Período"} 
                icon={<Calendar size={12} />}
              />
            </div>
          </div>

          {/* Display do Período Personalizado */}
          {filterType === 'custom' && customRange.start && (
            <div className="mb-6 flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] font-black text-indigo-600 uppercase tracking-widest animate-in slide-in-from-top-2">
               <Calendar size={14} />
               <span>De {new Date(customRange.start).toLocaleDateString('pt-BR')} até {new Date(customRange.end).toLocaleDateString('pt-BR')}</span>
               <button onClick={() => setFilterType('7days')} className="ml-auto hover:text-indigo-800"><X size={14}/></button>
            </div>
          )}

          <div className="h-72 w-full relative mt-auto">
             {chartData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                 <AreaChart data={chartData}>
                   <defs>
                     <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor={activeMetric === 'totalValue' ? "#6366f1" : "#10b981"} stopOpacity={0.1}/>
                       <stop offset="95%" stopColor={activeMetric === 'totalValue' ? "#6366f1" : "#10b981"} stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                   <YAxis 
                    hide 
                    domain={['auto', 'auto']}
                   />
                   <Tooltip 
                     contentStyle={{ 
                       borderRadius: '20px', 
                       border: 'none', 
                       boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', 
                       padding: '12px'
                     }}
                     labelStyle={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}
                     formatter={(value: any, name: string) => {
                       if (name === 'totalValue') return [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Receita'];
                       if (name === 'totalItems') return [`${value} un.`, 'Itens'];
                       return [value, name];
                     }}
                   />
                   <Area 
                    type="monotone" 
                    dataKey={activeMetric} 
                    stroke={activeMetric === 'totalValue' ? "#6366f1" : "#10b981"} 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    animationDuration={1000}
                   />
                 </AreaChart>
               </ResponsiveContainer>
             ) : (
               <div className="h-full w-full flex flex-col items-center justify-center opacity-40">
                 <Clock size={40} className="mb-2 text-slate-300" />
                 <p className="text-slate-400 text-xs italic font-black uppercase tracking-widest text-center px-10">
                   {filterType === 'custom' && (!customRange.start || !customRange.end) 
                     ? "Selecione o período para visualizar o histórico" 
                     : "Sem vendas confirmadas no período"}
                 </p>
               </div>
             )}
          </div>
        </div>

        {/* Categories Chart */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <h3 className="font-black text-slate-800 mb-6 uppercase tracking-tight text-sm">Distribuição por Categoria</h3>
          <div className="h-64 w-full relative">
            {categoryDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <p className="text-slate-400 text-sm italic">Nenhum produto cadastrado</p>
              </div>
            )}
          </div>
          <div className="mt-4 space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
            {categoryDistribution.map(entry => (
              <div key={entry.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[categoryDistribution.indexOf(entry) % COLORS.length] }} />
                  <span className="text-slate-600 truncate max-w-[150px] font-bold text-xs uppercase tracking-tight">{entry.name}</span>
                </div>
                <span className="font-black text-xs">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CalendarModal 
        isOpen={isCalendarModalOpen} 
        onClose={() => setIsCalendarModalOpen(false)} 
        onApply={handleApplyCustomRange} 
      />
    </div>
  );
};

/* Componentes Auxiliares */

// Fixed: Defined missing StatCard component
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  color: 'indigo' | 'emerald' | 'amber' | 'blue';
  isWarning?: boolean;
}> = ({ icon, label, value, change, color, isWarning }) => {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
  };

  return (
    <div className={`bg-white p-6 rounded-[2rem] border-2 transition-all hover:shadow-xl ${isWarning ? 'border-amber-100' : 'border-slate-50'}`}>
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${colors[color]}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{label}</p>
          <p className="text-xl font-black text-slate-800 tracking-tight">{value}</p>
        </div>
      </div>
      <div className="pt-3 border-t border-slate-50">
        <p className={`text-[10px] font-black uppercase tracking-widest ${isWarning ? 'text-amber-500' : 'text-slate-400'}`}>
          {change}
        </p>
      </div>
    </div>
  );
};

// Fixed: Defined missing FilterChip component
const FilterChip: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}> = ({ active, onClick, label, icon }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
      active ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
    }`}
  >
    {icon}
    {label}
  </button>
);

// Fixed: Defined missing CalendarModal component
interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (start: string, end: string) => void;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose, onApply }) => {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden p-8 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Período Personalizado</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1"><X size={24} /></button>
        </div>
        <div className="space-y-4 mb-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Data Inicial</label>
            <input type="date" value={start} onChange={e => setStart(e.target.value)} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-50" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Data Final</label>
            <input type="date" value={end} onChange={e => setEnd(e.target.value)} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-50" />
          </div>
        </div>
        <button 
          onClick={() => onApply(start, end)}
          disabled={!start || !end}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-700 disabled:opacity-50"
        >
          Aplicar Filtro
        </button>
      </div>
    </div>
  );
};

// Fixed: Added default export
export default Dashboard;