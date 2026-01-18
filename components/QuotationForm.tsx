
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Save, 
  Trash2, 
  Search, 
  User as UserIcon, 
  ShoppingCart,
  Check,
  ArrowLeft,
  Calculator,
  Tag,
  Info,
  DollarSign,
  Percent,
  Calendar as CalendarIcon,
  Clock,
  Play,
  CheckCircle,
  PackageCheck,
  ImageOff,
  UserCheck,
  ChevronDown,
  Wallet,
  ArrowRight
} from 'lucide-react';
import { Product, Quotation, QuotationItem, QuotationStatus, Customer, PaymentMethod } from '../types';

interface QuotationFormProps {
  initialData?: Quotation;
  products: Product[];
  customers: Customer[];
  paymentMethods: PaymentMethod[];
  onSave: (quotation: Partial<Quotation>) => void;
  onCancel: () => void;
}

const QuotationForm: React.FC<QuotationFormProps> = ({ initialData, products, customers, paymentMethods, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Quotation>>(initialData || {
    clientName: '',
    clientPhone: '',
    sellerName: '',
    quotationDate: new Date().toISOString().split('T')[0],
    keyword: '',
    items: [],
    total: 0,
    status: 'waiting',
    notes: '',
    createdAt: new Date().toISOString(),
    paymentMethodId: ''
  });

  const [productSearch, setProductSearch] = useState('');
  const [showProductList, setShowProductList] = useState(false);
  
  const [customerSearch, setCustomerSearch] = useState(initialData?.clientName || '');
  const [showCustomerList, setShowCustomerList] = useState(false);
  const customerListRef = useRef<HTMLDivElement>(null);

  // Seleciona o método de pagamento atual
  const selectedPaymentMethod = useMemo(() => {
    return paymentMethods.find(pm => String(pm.id) === String(formData.paymentMethodId));
  }, [paymentMethods, formData.paymentMethodId]);

  // Cálculo do Total - AGORA APENAS ITENS E DESCONTOS
  useEffect(() => {
    const itemsTotal = formData.items?.reduce((acc, curr) => {
      const price = curr.price || 0;
      const qty = curr.quantity || 0;
      const discount = curr.discount || 0;
      return acc + ((price * qty) - discount);
    }, 0) || 0;

    // A taxa da forma de pagamento não é mais aplicada ao valor final
    const finalTotal = itemsTotal;
    
    if (finalTotal !== formData.total) {
      setFormData(prev => ({ ...prev, total: finalTotal }));
    }
  }, [formData.items, formData.total]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerListRef.current && !customerListRef.current.contains(event.target as Node)) {
        setShowCustomerList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProducts = useMemo(() => {
    const search = (productSearch || '').toLowerCase();
    return products.filter(p => {
      const name = (p.name || '').toLowerCase();
      const sku = (p.sku || '').toLowerCase();
      return name.includes(search) || sku.includes(search);
    });
  }, [products, productSearch]);

  const filteredCustomers = useMemo(() => {
    const search = (customerSearch || '').toLowerCase();
    return customers.filter(c => {
      const name = (c.name || '').toLowerCase();
      const phone = (c.phone || '').toLowerCase();
      return name.includes(search) || phone.includes(search);
    });
  }, [customers, customerSearch]);

  const selectCustomer = (customer: Customer) => {
    setFormData(prev => ({
      ...prev,
      clientName: customer.name,
      clientPhone: customer.phone
    }));
    setCustomerSearch(customer.name);
    setShowCustomerList(false);
  };

  const addItem = (product: Product) => {
    const existing = formData.items?.find(i => i.productId === product.id);
    if (existing) {
      updateItem(product.id, { quantity: (existing.quantity || 0) + 1 });
    } else {
      const newItem: QuotationItem = {
        productId: product.id,
        name: product.name || 'Sem nome',
        quantity: 1,
        price: product.price || 0,
        discount: 0
      };
      setFormData(prev => ({ 
        ...prev, 
        items: [...(prev.items || []), newItem]
      }));
    }
    setProductSearch('');
    setShowProductList(false);
  };

  const updateItem = (productId: string | number, updates: Partial<QuotationItem>) => {
    const updatedItems = formData.items?.map(item => {
      if (item.productId === productId) {
        const updated = { ...item, ...updates };
        if (updated.quantity < 1) updated.quantity = 1;
        if (updated.price < 0) updated.price = 0;
        if (updated.discount < 0) updated.discount = 0;
        return updated;
      }
      return item;
    }) || [];
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const removeItem = (productId: string | number) => {
    const updatedItems = formData.items?.filter(i => i.productId !== productId) || [];
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.items?.length || !formData.sellerName) {
      alert("Por favor, preencha o cliente, vendedor e adicione pelo menos um item.");
      return;
    }
    onSave(formData);
  };

  const getStatusColor = (status: QuotationStatus) => {
    switch (status) {
      case 'delivered': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'finished': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'in_progress': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  const itemsTotal = useMemo(() => {
    return formData.items?.reduce((acc, curr) => acc + (((curr.price || 0) * (curr.quantity || 0)) - (curr.discount || 0)), 0) || 0;
  }, [formData.items]);

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onCancel} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-all">
          <ArrowLeft size={20} /> Voltar
        </button>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
          {initialData ? 'Editar Orçamento' : 'Novo Orçamento'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informações do Cliente */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-indigo-600 mb-2">
            <UserIcon size={24} />
            <h3 className="font-black text-lg uppercase tracking-tight">Dados do Cliente</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2 relative" ref={customerListRef}>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
                <Search size={12} /> Cliente*
              </label>
              <input 
                required
                type="text" 
                value={customerSearch}
                onChange={e => {
                  setCustomerSearch(e.target.value);
                  setFormData(prev => ({ ...prev, clientName: e.target.value }));
                  setShowCustomerList(true);
                }}
                onFocus={() => setShowCustomerList(true)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none font-bold"
                placeholder="Pesquisar..."
              />
              {showCustomerList && filteredCustomers.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[60] max-h-60 overflow-y-auto">
                  {filteredCustomers.map(c => (
                    <button key={c.id} type="button" onClick={() => selectCustomer(c)} className="w-full flex items-center gap-3 p-4 hover:bg-indigo-50 text-left transition-all border-b border-slate-50">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 font-black text-xs uppercase">{(c.name || '?')[0]}</div>
                      <div className="min-w-0"><p className="text-sm font-black text-slate-800 truncate">{c.name}</p><p className="text-[10px] font-bold text-slate-400 uppercase">{c.phone || 'S/ Tel'}</p></div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">WhatsApp / Telefone*</label>
              <input required type="text" value={formData.clientPhone} onChange={e => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none font-bold" placeholder="55 11 99999-9999" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Situação*</label>
              <div className="relative">
                <select required value={formData.status} onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as QuotationStatus }))} className={`w-full px-5 py-4 border rounded-2xl focus:ring-4 outline-none font-black appearance-none transition-all ${getStatusColor(formData.status as QuotationStatus)}`}>
                  <option value="waiting">⏳ Em espera</option>
                  <option value="in_progress">⚙️ Em execução</option>
                  <option value="finished">✅ Finalizada</option>
                  <option value="delivered">📦 Entregue</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"><ChevronDown size={16} /></div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Vendedor*</label>
              <input required type="text" value={formData.sellerName} onChange={e => setFormData(prev => ({ ...prev, sellerName: e.target.value }))} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none font-bold" placeholder="Nome" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Data*</label>
              <input required type="date" value={formData.quotationDate} onChange={e => setFormData(prev => ({ ...prev, quotationDate: e.target.value }))} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none font-bold" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">REF / Código</label>
              <input type="text" value={formData.keyword} onChange={e => setFormData(prev => ({ ...prev, keyword: e.target.value }))} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none font-bold uppercase" placeholder="PED-000" />
            </div>
          </div>
        </section>

        {/* Carrinho de Itens */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-3 text-emerald-600">
              <ShoppingCart size={24} />
              <h3 className="font-black text-lg uppercase tracking-tight">Carrinho de Itens</h3>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Pesquisar produto..." value={productSearch} onChange={e => { setProductSearch(e.target.value); setShowProductList(true); }} onFocus={() => setShowProductList(true)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-emerald-50 outline-none" />
              {showProductList && productSearch && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto">
                  {filteredProducts.map(p => (
                    <button key={p.id} type="button" onClick={() => addItem(p)} className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 text-left border-b last:border-0 border-slate-50">
                      {p.images?.[0] ? <img src={p.images[0]} className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400"><ImageOff size={14}/></div>}
                      <div><p className="text-sm font-bold text-slate-800 uppercase">{p.name}</p><p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">R$ {p.price.toLocaleString('pt-BR')}</p></div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="hidden lg:grid grid-cols-12 gap-4 px-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">
              <div className="col-span-4">Descrição</div>
              <div className="col-span-2 text-center">Preço UN.</div>
              <div className="col-span-2 text-center">QTD.</div>
              <div className="col-span-2 text-center">Desconto</div>
              <div className="col-span-2 text-right">Subtotal</div>
            </div>

            {formData.items?.map(item => (
              <div key={item.productId} className="flex flex-col lg:grid lg:grid-cols-12 items-start lg:items-center gap-4 p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-md transition-all relative">
                <div className="col-span-4 w-full"><p className="text-sm font-black text-slate-800 uppercase tracking-tight">{item.name}</p></div>
                <div className="col-span-2 w-full"><input type="number" step="0.01" value={item.price} onChange={e => updateItem(item.productId, { price: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black outline-none text-center" /></div>
                <div className="col-span-2 w-full"><input type="number" min="1" value={item.quantity} onChange={e => updateItem(item.productId, { quantity: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black outline-none text-center" /></div>
                <div className="col-span-2 w-full"><input type="number" step="0.01" value={item.discount} onChange={e => updateItem(item.productId, { discount: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black outline-none text-red-500 text-center" /></div>
                <div className="col-span-2 w-full text-right flex items-center justify-end gap-3"><p className="text-sm font-black text-indigo-600">R$ {(((item.price || 0) * (item.quantity || 0)) - (item.discount || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p><button type="button" onClick={() => removeItem(item.productId)} className="p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={16}/></button></div>
              </div>
            ))}

            {(!formData.items || formData.items.length === 0) && <div className="py-16 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem] opacity-30"><ShoppingCart size={40} className="mx-auto mb-2" /><p className="font-black uppercase tracking-widest text-[10px]">O carrinho está vazio</p></div>}
          </div>

          <div className="pt-8 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              {/* Seleção de Forma de Pagamento */}
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-4">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Wallet size={18} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest">Condição de Pagamento</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Método Escolhido</label>
                    <div className="relative">
                      <select 
                        value={formData.paymentMethodId} 
                        onChange={e => setFormData({...formData, paymentMethodId: e.target.value})}
                        className="w-full pl-5 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl font-black text-xs appearance-none outline-none focus:ring-4 focus:ring-indigo-50"
                      >
                        <option value="">Nenhum / Dinheiro</option>
                        {paymentMethods.map(pm => (
                          <option key={pm.id} value={pm.id}>{pm.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                  {selectedPaymentMethod && (
                    <div className="flex items-center gap-4 animate-in slide-in-from-left-2">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Taxas Referenciais</span>
                        <div className="flex gap-2 mt-1">
                          <span className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black">{selectedPaymentMethod.fee_percentage}%</span>
                          <span className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black">R$ {selectedPaymentMethod.fixed_fee?.toLocaleString('pt-BR')}</span>
                        </div>
                        <p className="text-[8px] text-slate-400 mt-1 font-bold">*Informação interna, não altera o total.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Observações do Orçamento</label>
                <textarea rows={3} value={formData.notes} onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none font-medium resize-none text-sm" placeholder="Ex: Entrega agendada..." />
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-[10px] font-black uppercase tracking-widest">Subtotal dos Itens</span>
                    <span className="text-sm font-bold">R$ {itemsTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="h-px bg-slate-800 w-full" />
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Valor Final</span>
                    <span className="text-3xl font-black tracking-tighter">R$ {(formData.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
                   <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400"><Wallet size={20}/></div>
                   <div className="min-w-0">
                     <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Forma de Pagamento</p>
                     <p className="text-xs font-bold truncate">{selectedPaymentMethod?.name || 'Não selecionado'}</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-end gap-6">
          <button type="button" onClick={onCancel} className="px-8 py-3 text-slate-400 font-black uppercase tracking-widest text-[10px]">Cancelar</button>
          <button type="submit" className="flex items-center gap-3 px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 active:scale-95">
            <Save size={20} /> Salvar Orçamento
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuotationForm;
