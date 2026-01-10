
import React, { useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { Product, Catalog } from '../types';
import { Package, BookOpen, AlertCircle, TrendingUp, Clock, Share2, ImageOff } from 'lucide-react';

const Dashboard: React.FC<{ products: Product[]; catalogs: Catalog[] }> = ({ products, catalogs }) => {
  const lowStock = products.filter(p => p.stock <= 10);
  const totalStockValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

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

  // Placeholder para dados de tendência (seriam populados por histórico real no DB)
  const chartData = [
    { name: 'Semana 1', value: 0 },
    { name: 'Semana 2', value: 0 },
    { name: 'Semana 3', value: 0 },
    { name: 'Semana 4', value: 0 },
  ];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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
          icon={<BookOpen className="text-emerald-600" />} 
          label="Catálogos Ativos" 
          value={catalogs.length.toString()} 
          change="Sincronizado"
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
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={18} /> Histórico de Pedidos
            </h3>
          </div>
          <div className="h-72 w-full relative">
             {products.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                 <AreaChart data={chartData}>
                   <defs>
                     <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                       <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                   <YAxis hide />
                   <Tooltip 
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                   />
                   <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                 </AreaChart>
               </ResponsiveContainer>
             ) : (
               <div className="h-full w-full flex items-center justify-center">
                 <p className="text-slate-400 text-sm italic">Aguardando dados reais...</p>
               </div>
             )}
          </div>
        </div>

        {/* Categories Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <h3 className="font-bold text-slate-800 mb-6">Distribuição por Categoria</h3>
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
                  <span className="text-slate-600 truncate max-w-[150px]">{entry.name}</span>
                </div>
                <span className="font-semibold">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Table */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Alertas de Estoque</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-400 font-medium">
                <tr>
                  <th className="text-left py-3 font-medium">Produto</th>
                  <th className="text-right py-3 font-medium">Estoque</th>
                  <th className="text-right py-3 font-medium">Ação</th>
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
                            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-amber-500 border border-amber-100">
                               <ImageOff size={14} />
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-700 truncate max-w-[200px]">{product.name}</span>
                            {(!product.images || product.images.length === 0) && (
                              <span className="text-[8px] font-black uppercase text-amber-500 tracking-widest mt-0.5">Sem imagem</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <span className="font-bold text-amber-600">{product.stock}</span>
                      </td>
                      <td className="py-4 text-right">
                        <span className="px-2 py-1 bg-amber-50 text-amber-600 text-xs rounded-full font-medium">Repor</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400 italic">Sem alertas de estoque no momento</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-6">Atividades do Systema</h3>
          <div className="flex flex-col items-center justify-center h-full py-10 opacity-40">
            <Clock size={40} className="mb-4" />
            <p className="text-sm font-medium text-center">O histórico de atividades será preenchido automaticamente.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  change: string; 
  color: string;
  isWarning?: boolean;
}> = ({ icon, label, value, change, color, isWarning }) => (
  <div className={`bg-white p-6 rounded-2xl shadow-sm border ${isWarning ? 'border-amber-200 bg-amber-50/10' : 'border-slate-200'} transition-all hover:shadow-md group`}>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-slate-50 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
    </div>
    <div className="space-y-1">
      <h4 className="text-sm font-medium text-slate-500">{label}</h4>
      <p className="text-2xl font-bold text-slate-800 tracking-tight">{value}</p>
      <p className={`text-xs font-medium ${isWarning ? 'text-amber-600' : 'text-slate-400'}`}>
        {change}
      </p>
    </div>
  </div>
);

export default Dashboard;
