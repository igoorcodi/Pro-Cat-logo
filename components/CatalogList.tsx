
import React from 'react';
import { Plus, ChevronRight, Share2, ExternalLink, Layout } from 'lucide-react';
import { Catalog, Product } from '../types';

interface CatalogListProps {
  catalogs: Catalog[];
  products: Product[];
  onOpenPublic: (catalog: Catalog) => void;
  onEditCatalog: (catalog: Catalog | 'new') => void;
  onShareCatalog: (catalog: Catalog) => void;
}

const CatalogList: React.FC<CatalogListProps> = ({ catalogs, products, onOpenPublic, onEditCatalog, onShareCatalog }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Seus Catálogos</h3>
          <p className="text-sm text-slate-500">Agrupe produtos e compartilhe coleções completas.</p>
        </div>
        <button 
          onClick={() => onEditCatalog('new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus size={20} />
          Criar Catálogo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {catalogs.map(catalog => (
          <div key={catalog.id} className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col h-full">
            <div className="relative h-56 cursor-pointer overflow-hidden" onClick={() => onOpenPublic(catalog)}>
              <img 
                src={catalog.coverImage || 'https://via.placeholder.com/800x450?text=Sem+Imagem'} 
                alt={catalog.name} 
                className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                <span className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">
                  {catalog.productIds.length} PRODUTOS
                </span>
                <h4 className="text-2xl font-bold text-white leading-tight">{catalog.name}</h4>
              </div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white">
                  <ExternalLink size={20} />
                </div>
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1">{catalog.description || 'Nenhuma descrição informada.'}</p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => onOpenPublic(catalog)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  <Layout size={16} /> Ver Vitrine Digital
                </button>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onShareCatalog(catalog)}
                      className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                      title="Compartilhar"
                    >
                      <Share2 size={18} />
                    </button>
                    <button 
                      onClick={() => onEditCatalog(catalog)}
                      className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
                      title="Configurações"
                    >
                      <Layout size={18} />
                    </button>
                  </div>
                  <button 
                    onClick={() => onEditCatalog(catalog)}
                    className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    Gerenciar <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <button 
          onClick={() => onEditCatalog('new')}
          className="h-full min-h-[432px] border-4 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-400 hover:bg-slate-50/50 transition-all p-8"
        >
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 transition-colors">
            <Plus size={32} />
          </div>
          <span className="font-bold text-lg">Novo Catálogo</span>
          <span className="text-xs max-w-[200px] text-center mt-2">Personalize o nome, capa e adicione seus produtos favoritos.</span>
        </button>
      </div>
    </div>
  );
};

export default CatalogList;
