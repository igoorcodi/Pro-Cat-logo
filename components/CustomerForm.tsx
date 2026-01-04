
import React, { useState } from 'react';
import { 
  X, 
  Save, 
  ArrowLeft, 
  User as UserIcon, 
  MapPin, 
  Info,
  Phone,
  Mail,
  CreditCard,
  Building
} from 'lucide-react';
import { Customer } from '../types';

interface CustomerFormProps {
  initialData?: Customer;
  onSave: (customer: Partial<Customer>) => void;
  onCancel: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Customer>>(initialData || {
    name: '',
    email: '',
    phone: '',
    document: '',
    zipCode: '',
    address: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    status: 'active',
    notes: '',
    createdAt: new Date().toISOString()
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("Nome e telefone são obrigatórios.");
      return;
    }
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onCancel} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-all">
          <ArrowLeft size={20} /> Voltar para Lista
        </button>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
          {initialData ? 'Editar Cliente' : 'Novo Cadastro de Cliente'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Seção Dados Pessoais */}
        <section className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
          <div className="flex items-center gap-3 text-indigo-600 mb-2">
            <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center">
              <UserIcon size={20} />
            </div>
            <h3 className="font-black text-lg uppercase tracking-tight">Dados Pessoais</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nome Completo*</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Pedro Alvares Cabral"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">WhatsApp / Celular*</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                <input 
                  required
                  type="text" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  placeholder="55 11 99999-9999"
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="cliente@exemplo.com"
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">CPF ou CNPJ</label>
              <div className="relative group">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                <input 
                  type="text" 
                  value={formData.document}
                  onChange={e => setFormData({...formData, document: e.target.value})}
                  placeholder="000.000.000-00"
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none font-bold"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Seção Endereço */}
        <section className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
          <div className="flex items-center gap-3 text-emerald-600 mb-2">
            <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center">
              <MapPin size={20} />
            </div>
            <h3 className="font-black text-lg uppercase tracking-tight">Endereço de Entrega</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-3 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">CEP</label>
              <input 
                type="text" 
                value={formData.zipCode}
                onChange={e => setFormData({...formData, zipCode: e.target.value})}
                placeholder="00000-000"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-50 outline-none font-bold"
              />
            </div>
            <div className="md:col-span-6 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Rua / Logradouro</label>
              <input 
                type="text" 
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                placeholder="Ex: Av. Brasil"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-50 outline-none font-bold"
              />
            </div>
            <div className="md:col-span-3 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Número</label>
              <input 
                type="text" 
                value={formData.number}
                onChange={e => setFormData({...formData, number: e.target.value})}
                placeholder="123"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-50 outline-none font-bold"
              />
            </div>

            <div className="md:col-span-4 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Bairro</label>
              <input 
                type="text" 
                value={formData.neighborhood}
                onChange={e => setFormData({...formData, neighborhood: e.target.value})}
                placeholder="Centro"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-50 outline-none font-bold"
              />
            </div>
            <div className="md:col-span-5 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Cidade</label>
              <div className="relative group">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                <input 
                  type="text" 
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  placeholder="São Paulo"
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-50 outline-none font-bold"
                />
              </div>
            </div>
            <div className="md:col-span-3 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Estado (UF)</label>
              <input 
                type="text" 
                maxLength={2}
                value={formData.state}
                onChange={e => setFormData({...formData, state: e.target.value.toUpperCase()})}
                placeholder="SP"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-50 outline-none font-bold text-center"
              />
            </div>
          </div>
        </section>

        {/* Observações */}
        <section className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
           <div className="flex items-center gap-3 text-slate-600 mb-2">
            <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center">
              <Info size={20} />
            </div>
            <h3 className="font-black text-lg uppercase tracking-tight">Observações Internas</h3>
          </div>
          <textarea 
            rows={4}
            value={formData.notes}
            onChange={e => setFormData({...formData, notes: e.target.value})}
            placeholder="Ex: Cliente prefere entregas no período da manhã..."
            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none font-bold resize-none"
          />
        </section>

        <div className="fixed bottom-0 left-0 lg:left-72 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 z-50 flex items-center justify-end gap-6">
           <button type="button" onClick={onCancel} className="px-8 py-3 text-slate-400 font-black uppercase tracking-widest text-[10px]">Cancelar</button>
           <button 
            type="submit" 
            disabled={isSaving}
            className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-3"
           >
             {isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={20}/>}
             Salvar Cliente
           </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;
