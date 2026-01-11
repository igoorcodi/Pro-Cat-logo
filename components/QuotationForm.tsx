
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
  ChevronDown
} from 'lucide-react';
import { Product, Quotation, QuotationItem, QuotationStatus, Customer } from '../types';

interface QuotationFormProps {
  initialData?: Quotation;
  products: Product[];
  customers: Customer[];
  onSave: (quotation: Partial<Quotation>) => void;
  onCancel: () => void;
}

const QuotationForm: React.FC<QuotationFormProps> = ({ initialData, products, customers, onSave, onCancel }) => {
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
    createdAt: new Date().toISOString()
  });

  const [productSearch, setProductSearch] = useState('');
  const [showProductList, setShowProductList] = useState(false);
  
  const [customerSearch, setCustomerSearch] = useState(initialData?.clientName || '');
  const [showCustomerList, setShowCustomerList] = useState(false);
  const customerListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newTotal = formData.items?.reduce((acc, curr) => {
      const price = curr.price || 0;
      const qty = curr.quantity || 0;
      const discount = curr.discount || 0;
      const subtotal = (price * qty) - discount;
      return acc + subtotal;
    }, 0) || 0;
    
    if (newTotal !== formData.total) {
      setFormData(prev => ({ ...prev, total: newTotal }));
    }
  }, [formData.items, formData.total]);

  // Click outside to close dropdowns
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
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-indigo-600 mb-2">
            <UserIcon size={24} />
            <h3 className="font-black text-lg uppercase tracking-tight">Informações Básicas</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2 relative" ref={customerListRef}>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
                <Search size={12} /> Nome do Cliente*
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
                placeholder="Pesquisar cliente..."
              />
              {showCustomerList && filteredCustomers.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[60] max-h-60 overflow-y-auto overflow-x-hidden animate-in fade-in zoom-in-95 duration-200">
                  {filteredCustomers.map(c => (
                    <button 
                      key={c.id}
                      type="button"
                      onClick={() => selectCustomer(c)}
                      className="w-full flex items-center gap-3 p-4 hover:bg-indigo-50 text-left transition-all border-b last:border-0 border-slate-50"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 font-black text-xs uppercase">
                        {(c.name || '?')[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-800 truncate">{c.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{c.phone || 'S/ Tel'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">WhatsApp / Telefone*</label>
              <input 
                required
                type="text" 
                value={formData.clientPhone}
                onChange={e => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none font-bold"
                placeholder="Ex: 55 11 99999-9999"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
                <UserIcon size={12} className="text-indigo-400" /> Vendedor*
              </label>
              <input 
                required
                type="text" 
                value={formData.sellerName}
                onChange={e => setFormData(prev => ({ ...prev, sellerName: e.target.value }))}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none font-bold"
                placeholder="Nome do Vendedor"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
                <CalendarIcon size={12} className="text-indigo-400" /> Data Orçamento*
              </label>
              <input 
                required
                type="date" 
                value={formData.quotationDate}
                onChange={e => setFormData(prev => ({ ...prev, quotationDate: e.target.value }))}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
                <Tag size={12} className="text-indigo-400" /> Referência / Código
              </label>
              <input 
                type="text" 
                value={formData.keyword}
                onChange={e => setFormData(prev => ({ ...prev, keyword: e.target.value }))}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none font-bold uppercase"
                placeholder="Ex: PED-101"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
                <Info size={12} className="text-indigo-400" /> Situação do Orçamento*
              </label>
              <div className="relative">
                <select 
                  required
                  value={formData.status}
                  onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as QuotationStatus }))}
                  className={`w-full px-5 py-4 border rounded-2xl focus:ring-4 outline-none font-black appearance-none transition-all ${getStatusColor(formData.status as QuotationStatus)}`}
                >
                  <option value="waiting">⏳ Em espera</option>
                  <option value="in_progress">⚙️ Em execução</option>
                  <option value="finished">✅ Finalizada</option>
                  <option value="delivered">📦 Entregue</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                   <ChevronDown size={16} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-3 text-emerald-600">
              <ShoppingCart size={24} />
              <h3 className="font-black text-lg uppercase tracking-tight">Carrinho de Itens</h3>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Pesquisar produto no estoque..."
                value={productSearch}
                onChange={e => { setProductSearch(e.target.value); setShowProductList(true); }}
                onFocus={() => setShowProductList(true)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-emerald-50 outline-none"
              />
              {showProductList && productSearch && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto">
                  {filteredProducts.map(p => (
                    <button 
                      key={p.id}
                      type="button"
                      onClick={() => addItem(p)}
                      className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 text-left transition-all border-b last:border-0 border-slate-50"
                    >
                      {p.images && p.images.length > 0 ? (
                        <img src={p.images[0]} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                          <ImageOff size={14} />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-slate-800">{(p.name || '').toUpperCase()}</p>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">R$ {(p.price || 0).toLocaleString('pt-BR')}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="hidden lg:grid grid-cols-12 gap-4 px-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">
              <div className="col-span-4">Item / Produto</div>
              <div className="col-span-2 text-center">Preço UN.</div>
              <div className="col-span-2 text-center">QTD.</div>
              <div className="col-span-2 text-center">Desconto (R$)</div>
              <div className="col-span-2 text-right">Subtotal</div>
            </div>

            {formData.items?.map(item => (
              <div key={item.productId} className="flex flex-col lg:grid lg:grid-cols-12 items-start lg:items-center gap-4 p-5 bg-slate-50 rounded-3xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md relative">
                <div className="col-span-4 w-full">
                  <p className="text-sm font-black text-slate-800 tracking-tight">{(item.name || 'Sem nome').toUpperCase()}</p>
                </div>

                <div className="col-span-2 w-full lg:text-center">
                  <label className="lg:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Preço UN.</label>
                  <div className="relative">
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px]">R$</div>
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      value={item.price}
                      onChange={e => updateItem(item.productId, { price: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black outline-none text-center"
                    />
                  </div>
                </div>

                <div className="col-span-2 w-full lg:text-center">
                  <label className="lg:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">QTD.</label>
                  <input 
                    type="number" 
                    min="1"
                    value={item.quantity}
                    onChange={e => updateItem(item.productId, { quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black outline-none text-center"
                  />
                </div>

                <div className="col-span-2 w-full lg:text-center">
                  <label className="lg:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Desconto</label>
                  <div className="relative">
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-red-400 font-bold text-[10px]">R$</div>
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      value={item.discount}
                      onChange={e => updateItem(item.productId, { discount: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black outline-none text-red-500 text-center"
                    />
                  </div>
                </div>

                <div className="col-span-2 w-full text-right flex items-center justify-end gap-3">
                  <div className="space-y-1 text-right">
                    <label className="lg:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest block">Subtotal</label>
                    <p className="text-sm font-black text-indigo-600 tracking-tighter">
                      R$ {(((item.price || 0) * (item.quantity || 0)) - (item.discount || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <button type="button" onClick={() => removeItem(item.productId)} className="p-2 text-slate-300 hover:text-red-500 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            {(!formData.items || formData.items.length === 0) && (
              <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/30">
                <ShoppingCart size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">O carrinho está vazio</p>
              </div>
            )}
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex-1 w-full max-w-md">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-2">Observações Adicionais</label>
              <textarea 
                rows={3}
                value={formData.notes}
                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none font-medium resize-none text-sm"
                placeholder="Ex: Entrega agendada para sábado..."
              />
            </div>
            <div className="bg-slate-900 p-8 rounded-[2rem] text-white min-w-[280px] text-right shadow-2xl">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Total do Orçamento</p>
              <p className="text-4xl font-black text-indigo-400 tracking-tighter">
                R$ {(formData.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-end gap-4">
          <button type="button" onClick={onCancel} className="px-8 py-4 text-slate-500 font-black uppercase tracking-widest text-xs">Cancelar</button>
          <button 
            type="submit" 
            className="flex items-center gap-3 px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 active:scale-95"
          >
            <Save size={20} /> Salvar Orçamento
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuotationForm;
