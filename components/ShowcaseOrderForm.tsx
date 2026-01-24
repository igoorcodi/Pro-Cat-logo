
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  X, 
  Save, 
  ArrowLeft, 
  User as UserIcon, 
  ShoppingCart, 
  Search, 
  Package, 
  Plus, 
  Minus, 
  Trash2, 
  Phone,
  Info,
  ImageOff,
  ChevronDown
} from 'lucide-react';
import { Product, Customer, ShowcaseOrder, CartItem } from '../types';

interface ShowcaseOrderFormProps {
  products: Product[];
  customers: Customer[];
  onSave: (order: Partial<ShowcaseOrder>) => void;
  onCancel: () => void;
}

const ShowcaseOrderForm: React.FC<ShowcaseOrderFormProps> = ({ products, customers, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<ShowcaseOrder>>({
    client_name: '',
    client_phone: '',
    status: 'waiting',
    items: [],
    total: 0
  });

  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [showProductList, setShowProductList] = useState(false);

  const customerListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const total = (formData.items || []).reduce((acc, item) => acc + (item.price * item.quantity), 0);
    if (total !== formData.total) setFormData(prev => ({ ...prev, total }));
  }, [formData.items]);

  const filteredCustomers = useMemo(() => {
    const term = customerSearch.toLowerCase();
    return customers.filter(c => c.name.toLowerCase().includes(term) || c.phone.includes(term));
  }, [customers, customerSearch]);

  const filteredProducts = useMemo(() => {
    const term = productSearch.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(term) || (p.sku && p.sku.toLowerCase().includes(term)));
  }, [products, productSearch]);

  const addItem = (product: Product) => {
    const newItem: CartItem = {
      id: `${product.id}_manual`,
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0],
      selectedSub: null
    };
    setFormData(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
    setProductSearch('');
    setShowProductList(false);
  };

  const removeItem = (id: string) => {
    setFormData(prev => ({ ...prev, items: (prev.items || []).filter(i => i.id !== id) }));
  };

  const updateQty = (id: string, delta: number) => {
    setFormData(prev => ({
      ...prev,
      items: (prev.items || []).map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i)
    }));
  };

  const selectCustomer = (c: Customer) => {
    setFormData(prev => ({ ...prev, client_name: c.name, client_phone: c.phone, customer_id: Number(c.id) }));
    setCustomerSearch(c.name);
    setShowCustomerList(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_name || !formData.client_phone || !formData.items?.length) {
      alert("Preencha o cliente e adicione pelo menos um produto.");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onCancel} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-all">
          <ArrowLeft size={20} /> Voltar
        </button>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Registro Manual de Pedido</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-indigo-600">
            <UserIcon size={24} />
            <h3 className="font-black text-lg uppercase tracking-tight">Dados do Cliente</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nome do Cliente*</label>
              <input 
                required
                type="text" 
                value={customerSearch}
                onChange={e => { setCustomerSearch(e.target.value); setFormData({...formData, client_name: e.target.value}); setShowCustomerList(true); }}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none font-bold"
                placeholder="Pesquisar ou digitar..."
              />
              {showCustomerList && filteredCustomers.length > 0 && customerSearch && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 max-h-48 overflow-y-auto">
                  {filteredCustomers.map(c => (
                    <button key={c.id} type="button" onClick={() => selectCustomer(c)} className="w-full p-4 text-left hover:bg-indigo-50 border-b last:border-0 border-slate-50 font-bold text-sm">
                      {c.name} <span className="text-[10px] text-slate-400 ml-2">{c.phone}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">WhatsApp / Telefone*</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input required type="text" value={formData.client_phone} onChange={e => setFormData({...formData, client_phone: e.target.value})} className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 outline-none font-bold" placeholder="55 11 99999-9999" />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div className="flex items-center gap-3 text-emerald-600">
               <ShoppingCart size={24} />
               <h3 className="font-black text-lg uppercase tracking-tight">Produtos Solicitados</h3>
             </div>
             <div className="relative w-full sm:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Adicionar produto..." value={productSearch} onChange={e => { setProductSearch(e.target.value); setShowProductList(true); }} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-emerald-50 outline-none" />
                {showProductList && productSearch && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto">
                    {filteredProducts.map(p => (
                      <button key={p.id} type="button" onClick={() => addItem(p)} className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 text-left border-b last:border-0 border-slate-50">
                        {p.images?.[0] ? <img src={p.images[0]} className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 bg-slate-100 rounded-lg shrink-0" />}
                        <div><p className="text-sm font-bold text-slate-800 uppercase">{p.name}</p><p className="text-[10px] font-black text-indigo-400 uppercase">R$ {p.price.toLocaleString('pt-BR')}</p></div>
                      </button>
                    ))}
                  </div>
                )}
             </div>
          </div>

          <div className="space-y-4">
            {formData.items?.map(item => (
              <div key={item.id} className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                  {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-white flex items-center justify-center text-slate-200"><ImageOff size={16}/></div>}
                </div>
                <div className="flex-1 min-w-0"><p className="font-black text-slate-800 text-sm uppercase truncate">{item.productName}</p><p className="text-[10px] font-bold text-indigo-600">R$ {item.price.toLocaleString('pt-BR')}</p></div>
                <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-slate-200">
                  <button type="button" onClick={() => updateQty(item.id, -1)} className="p-1.5 hover:bg-slate-50 rounded-lg transition-all"><Minus size={14}/></button>
                  <span className="w-6 text-center font-black text-sm">{item.quantity}</span>
                  <button type="button" onClick={() => updateQty(item.id, 1)} className="p-1.5 hover:bg-slate-50 rounded-lg transition-all"><Plus size={14}/></button>
                </div>
                <div className="text-right min-w-[100px]"><p className="text-sm font-black text-slate-900">R$ {(item.price * item.quantity).toLocaleString('pt-BR')}</p></div>
                <button type="button" onClick={() => removeItem(item.id)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
              </div>
            ))}
            {!formData.items?.length && <div className="py-16 text-center border-2 border-dashed border-slate-100 rounded-[2rem] opacity-30 flex flex-col items-center"><Package size={40} className="mb-2"/><p className="font-black uppercase tracking-widest text-[10px]">Nenhum item adicionado</p></div>}
          </div>
        </section>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 bg-slate-900 rounded-[2.5rem] text-white">
           <div className="text-center sm:text-left">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Inicial</p>
             <p className="text-sm font-black text-amber-400 uppercase">⏳ Aguardando Confirmação</p>
           </div>
           <div className="flex items-center gap-6">
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Valor Total</p>
                <p className="text-3xl font-black text-indigo-400 tracking-tighter">R$ {formData.total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
             </div>
             <button type="submit" className="flex items-center gap-3 px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 active:scale-95">
                <Save size={20} /> Registrar Pedido
             </button>
           </div>
        </div>
      </form>
    </div>
  );
};

export default ShowcaseOrderForm;
