
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { Product, Catalog } from '../types';
import { Package, BookOpen, AlertCircle, Share2, TrendingUp, Clock } from 'lucide-react';

const Dashboard: React.FC<{ products: Product[]; catalogs: Catalog[] }> = ({ products, catalogs }) => {
  const lowStock = products.filter(p => p.stock <= 10);
  const totalStockValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

  const chartData = [
    { name: 'Jan', value: 400 },
    { name: 'Fev', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Abr', value: 800 },
    { name: 'Mai', value: 700 },
    { name: 'Jun', value: 900 },
  ];

  const categoryData = [
    { name: 'Eletrônicos', value: 40 },
    { name: 'Moda', value: 30 },
    { name: 'Casa', value: 20 },
    { name: 'Esporte', value: 10 },
  ];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Package className="text-indigo-600" />} 
          label="Total de Produtos" 
          value={products.length.toString()} 
          change="+12% esse mês" 
          color="indigo"
        />
        <StatCard 
          icon={<BookOpen className="text-emerald-600" />} 
          label="Catálogos Ativos" 
          value={catalogs.length.toString()} 
          change="0% esse mês"
          color="emerald"
        />
        <StatCard 
          icon={<AlertCircle className="text-amber-600" />} 
          label="Estoque Baixo" 
          value={lowStock.length.toString()} 
          change="Revisão necessária"
          color="amber"
          isWarning={lowStock.length > 0}
        />
        <StatCard 
          icon={<TrendingUp className="text-blue-600" />} 
          label="Valor do Estoque" 
          value={`R$ ${(totalStockValue / 1000).toFixed(1)}k`} 
          change="Atualizado agora"
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={18} /> Tendência de Compartilhamento
            </h3>
            <select className="text-xs font-medium border-slate-200 rounded-lg focus:ring-indigo-500">
              <Last7DaysOption />
              <Last30DaysOption />
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
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
          </div>
        </div>

        {/* Categories Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-6">Distribuição de Categorias</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {categoryData.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-slate-600">{entry.name}</span>
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
            <h3 className="font-bold text-slate-800">Produtos com Estoque Baixo</h3>
            <button className="text-indigo-600 text-sm font-semibold hover:underline">Ver todos</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-400 font-medium">
                <tr>
                  <th className="text-left py-3 font-medium">Produto</th>
                  <th className="text-right py-3 font-medium">Estoque</th>
                  <th className="text-right py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowStock.slice(0, 5).map(product => (
                  <tr key={product.id}>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <img src={product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <span className="font-medium text-slate-700">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <span className="font-bold text-amber-600">{product.stock}</span>
                    </td>
                    <td className="py-4 text-right">
                      <span className="px-2 py-1 bg-amber-50 text-amber-600 text-xs rounded-full font-medium">Crítico</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-6">Últimas Atividades</h3>
          <div className="space-y-6">
            <ActivityItem 
              icon={<Share2 size={16} className="text-indigo-500" />}
              title="Produto Compartilhado"
              desc="Camiseta Dry-Fit compartilhada via WhatsApp"
              time="há 5 min"
            />
            <ActivityItem 
              icon={<Clock size={16} className="text-emerald-500" />}
              title="Estoque Atualizado"
              desc="Smartwatch Série 5 teve estoque ajustado para 150"
              time="há 12 min"
            />
            <ActivityItem 
              icon={<BookOpen size={16} className="text-blue-500" />}
              title="Novo Catálogo"
              desc="Coleção Inverno 2024 criada com 15 itens"
              time="há 1 hora"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Last7DaysOption: React.FC = () => <option>Últimos 7 dias</option>;
const Last30DaysOption: React.FC = () => <option>Últimos 30 dias</option>;

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
      <div className={`p-3 rounded-xl bg-${color}-50 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
    </div>
    <div className="space-y-1">
      <h4 className="text-sm font-medium text-slate-500">{label}</h4>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className={`text-xs font-medium ${isWarning ? 'text-amber-600' : 'text-slate-400'}`}>
        {change}
      </p>
    </div>
  </div>
);

const ActivityItem: React.FC<{ icon: React.ReactNode; title: string; desc: string; time: string }> = ({ icon, title, desc, time }) => (
  <div className="flex gap-4">
    <div className="mt-1 w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div className="flex-1 space-y-0.5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <span className="text-[10px] text-slate-400 font-medium uppercase">{time}</span>
      </div>
      <p className="text-xs text-slate-500">{desc}</p>
    </div>
  </div>
);

export default Dashboard;
