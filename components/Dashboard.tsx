
import React, { useState, useMemo, useRef } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { Product, Catalog, Quotation } from '../types';
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
  Layers
} from 'lucide-react';

interface DashboardProps {
  products: Product[];
  catalogs: Catalog[];
  quotations: Quotation[];
}

type FilterType = 'today' | '7days' | '30days' | 'custom';
type MetricType = 'totalItems' | 'totalValue';

const Dashboard: React.FC<DashboardProps> = ({ products, catalogs, quotations }) => {
  const [filterType, setFilterType] = useState<FilterType>('7days');
  const [activeMetric, setActiveMetric] = useState<MetricType>('totalValue');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  const lowStock = products.filter(p => p.stock <= 10);
  const totalStockValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const deliveredQuotations = quotations.filter(q => q.status === 'delivered');

  // Cálculo do Faturamento do Dia
  const todayRevenue = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return deliveredQuotations
      .filter(q => {
        const qDate = new Date(q.createdAt || q.quotationDate);
        return qDate >= today && qDate < tomorrow;
      })
      .reduce((sum, q) => sum + (q.total || 0), 0);
  }, [deliveredQuotations]);

  // Calcula dinamicamente a distribuição por categoria
  const categoryDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
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

  // Histórico Dinâmico de Pedidos Entregues (Quantidade e Valor)
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

    deliveredQuotations.forEach(q => {
      const qDateStr = q.createdAt || q.quotationDate;
      if (!qDateStr) return;
      const qDate = new Date(qDateStr);
      if (qDate.getTime() >= startDate.getTime() && qDate.getTime() <= endDate.getTime()) {
        const dateStr = qDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        if (dataMap[dateStr] !== undefined) {
          // Soma o total do orçamento
          dataMap[dateStr].totalValue += (q.total || 0);
          // Soma a quantidade total de itens dentro do orçamento
          const itemsCount = q.items?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0;
          dataMap[dateStr].totalItems += itemsCount;
        }
      }
    });

    return Object.entries(dataMap).map(([name, data]) => ({ name, ...data }));
  }, [deliveredQuotations, filterType, customRange]);

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
          change="Receita bruta diária"
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
              <TrendingUp size={18} className="text-indigo-600" /> Desempenho de Vendas
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
                     : "Sem entregas registradas no período"}
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
            {categoryDistribution.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-slate-600 truncate max-w-[150px] font-bold text-xs uppercase tracking-tight">{entry.name}</span>
                </div>
                <span className="font-black text-xs">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Table */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">Alertas de Estoque</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-400 font-medium">
                <tr>
                  <th className="text-left py-3 font-black text-[10px] uppercase tracking-widest">Produto</th>
                  <th className="text-right py-3 font-black text-[10px] uppercase tracking-widest">Estoque</th>
                  <th className="text-right py-3 font-black text-[10px] uppercase tracking-widest">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowStock.length > 0 ? (
                  lowStock.slice(0, 5).map(product => (
                    <tr key={product.id}>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          {product.images && product.images.length > 0 ? (
                            <img src={product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100">
                               <ImageOff size={14} />
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700 truncate max-w-[200px] text-xs uppercase">{product.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <span className="font-black text-amber-600">{product.stock}</span>
                      </td>
                      <td className="py-4 text-right">
                        <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[10px] rounded-lg font-black uppercase tracking-widest border border-amber-100">Repor</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400 italic font-bold uppercase text-[10px] tracking-widest">Sem alertas de estoque no momento</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200">
          <h3 className="font-black text-slate-800 mb-6 uppercase tracking-tight text-sm">Visão Geral</h3>
          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Catálogos</p>
                <p className="text-2xl font-black text-indigo-700 tracking-tighter">{catalogs.length}</p>
             </div>
             <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Entregas Totais</p>
                <p className="text-2xl font-black text-emerald-700 tracking-tighter">{deliveredQuotations.length}</p>
             </div>
          </div>
          <div className="flex flex-col items-center justify-center h-full py-10 opacity-20">
            <TrendingUp size={48} className="mb-4" />
            <p className="text-[10px] font-black text-center uppercase tracking-widest">Evolução contínua do negócio</p>
          </div>
        </div>
      </div>

      {/* Modal de Calendário */}
      <CalendarModal 
        isOpen={isCalendarModalOpen} 
        onClose={() => setIsCalendarModalOpen(false)} 
        onApply={handleApplyCustomRange}
        initialStart={customRange.start}
        initialEnd={customRange.end}
      />
    </div>
  );
};

// Subcomponente de Modal de Calendário
const CalendarModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onApply: (start: string, end: string) => void;
  initialStart: string;
  initialEnd: string;
}> = ({ isOpen, onClose, onApply, initialStart, initialEnd }) => {
  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  const [viewDate, setViewDate] = useState(new Date());

  if (!isOpen) return null;

  const handleDayClick = (dateStr: string) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(dateStr);
      setEndDate('');
    } else {
      const start = new Date(startDate);
      const end = new Date(dateStr);
      if (end < start) {
        setStartDate(dateStr);
        setEndDate(startDate);
      } else {
        setEndDate(dateStr);
      }
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const days = getDaysInMonth(currentYear, currentMonth);
  const monthName = viewDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  const formatDate = (date: Date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col">
        <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calendar size={20} />
            <h3 className="font-black text-sm uppercase tracking-widest">Selecionar Período</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))} className="p-2 hover:bg-slate-100 rounded-xl"><ChevronLeft size={20} /></button>
            <span className="font-black text-xs uppercase tracking-widest text-slate-800">{monthName}</span>
            <button onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))} className="p-2 hover:bg-slate-100 rounded-xl"><ChevronRight size={20} /></button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
              <span key={d} className="text-[10px] font-black text-slate-400">{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array(days[0].getDay()).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
            {days.map(day => {
              const dStr = formatDate(day);
              const isStart = dStr === startDate;
              const isEnd = dStr === endDate;
              const isInRange = startDate && endDate && dStr > startDate && dStr < endDate;
              
              return (
                <button 
                  key={dStr}
                  onClick={() => handleDayClick(dStr)}
                  className={`aspect-square flex items-center justify-center text-[10px] font-bold rounded-lg transition-all ${
                    isStart || isEnd 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : isInRange 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Início</p>
                <p className="text-xs font-bold text-slate-800">{startDate ? new Date(startDate).toLocaleDateString('pt-BR') : '---'}</p>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
              <div className="space-y-1 text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fim</p>
                <p className="text-xs font-bold text-slate-800">{endDate ? new Date(endDate).toLocaleDateString('pt-BR') : '---'}</p>
              </div>
            </div>

            <button 
              disabled={!startDate || !endDate}
              onClick={() => onApply(startDate, endDate)}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
            >
              <Check size={18} /> Aplicar Filtro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterChip: React.FC<{ active: boolean, onClick: () => void, label: string, icon?: React.ReactNode }> = ({ active, onClick, label, icon }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
      active 
        ? 'bg-white text-indigo-600 shadow-sm' 
        : 'text-slate-400 hover:text-slate-600'
    }`}
  >
    {icon}
    {label}
  </button>
);

const StatCard: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  change: string; 
  color: string;
  isWarning?: boolean;
}> = ({ icon, label, value, change, color, isWarning }) => (
  <div className={`bg-white p-6 rounded-[2rem] shadow-sm border ${isWarning ? 'border-amber-200 bg-amber-50/10' : 'border-slate-100'} transition-all hover:shadow-xl group`}>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl bg-slate-50 group-hover:scale-110 group-hover:bg-white transition-all shadow-sm`}>
        {icon}
      </div>
    </div>
    <div className="space-y-1">
      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</h4>
      <p className="text-2xl font-black text-slate-800 tracking-tighter">{value}</p>
      <div className="flex items-center gap-1">
        <div className={`w-1 h-1 rounded-full ${isWarning ? 'bg-amber-500' : 'bg-indigo-500'}`} />
        <p className={`text-[9px] font-black uppercase tracking-widest ${isWarning ? 'text-amber-600' : 'text-slate-400'}`}>
          {change}
        </p>
      </div>
    </div>
  </div>
);

export default Dashboard;
