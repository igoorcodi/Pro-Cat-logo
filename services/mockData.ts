
import { Product, Catalog, Category } from '../types';

export const mockCategories: Category[] = [
  {
    id: 'cat1',
    name: 'Eletrônicos',
    subcategories: [
      { id: 'sub1', name: 'Smartphones' },
      { id: 'sub2', name: 'Smartwatches' },
      { id: 'sub3', name: 'Áudio' }
    ]
  },
  {
    id: 'cat2',
    name: 'Moda',
    subcategories: [
      { id: 'sub4', name: 'Masculino' },
      { id: 'sub5', name: 'Feminino' },
      { id: 'sub6', name: 'Calçados' }
    ]
  },
  {
    id: 'cat3',
    name: 'Casa',
    subcategories: [
      { id: 'sub7', name: 'Móveis' },
      { id: 'sub8', name: 'Decoração' }
    ]
  },
  {
    id: 'cat4',
    name: 'Esporte',
    subcategories: [
      { id: 'sub9', name: 'Academia' },
      { id: 'sub10', name: 'Corrida' }
    ]
  }
];

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Tênis Esportivo UltraBoost 2024',
    description: 'Tênis de alta performance com amortecimento em gel e cabedal respirável. Ideal para corridas de longa distância.',
    price: 899.90,
    sku: 'TS-UB-24-RED',
    images: ['https://picsum.photos/seed/shoes1/600/600', 'https://picsum.photos/seed/shoes1-2/600/600'],
    stock: 45,
    status: 'active',
    category: 'Esporte',
    categoryId: 'cat4',
    subcategoryId: 'sub10',
    tags: ['Corrida', 'Lançamento', 'Conforto'],
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Smartphone Nexus Pro 15',
    description: 'Camera tripla de 108MP, tela OLED de 6.7 polegadas e bateria de longa duração.',
    price: 5499.00,
    sku: 'PH-NP-15-TIT',
    images: ['https://picsum.photos/seed/phone1/600/600'],
    stock: 8,
    status: 'active',
    category: 'Eletrônicos',
    categoryId: 'cat1',
    subcategoryId: 'sub1',
    tags: ['Tecnologia', 'Premium', 'Trabalho'],
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Cadeira Gamer Ergonomic-Z',
    description: 'Ajustes 4D, couro sintético de alta qualidade e estrutura em aço reforçado.',
    price: 1249.90,
    sku: 'CH-ERZ-BLK',
    images: ['https://picsum.photos/seed/chair1/600/600'],
    stock: 12,
    status: 'active',
    category: 'Casa',
    categoryId: 'cat3',
    subcategoryId: 'sub7',
    tags: ['Gamer', 'Ergonomia', 'Setup'],
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Smartwatch V8 Health Tracker',
    description: 'Monitoramento cardíaco, GPS integrado e à prova d\'água até 50 metros.',
    price: 349.00,
    sku: 'SW-V8-BLU',
    images: ['https://picsum.photos/seed/watch1/600/600'],
    stock: 5,
    status: 'active',
    category: 'Eletrônicos',
    categoryId: 'cat1',
    subcategoryId: 'sub2',
    tags: ['Saúde', 'Smart', 'Oferta'],
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Fone Bluetooth AirSync Pro',
    description: 'Cancelamento de ruído ativo e 30 horas de bateria com o estojo.',
    price: 199.90,
    sku: 'HS-AS-PRO',
    images: ['https://picsum.photos/seed/headset1/600/600'],
    stock: 150,
    status: 'active',
    category: 'Eletrônicos',
    categoryId: 'cat1',
    subcategoryId: 'sub3',
    tags: ['Áudio', 'Bluetooth', 'Viagem'],
    createdAt: new Date().toISOString()
  }
];

export const mockCatalogs: Catalog[] = [
  {
    id: 'c1',
    name: 'Coleção Inverno 2024',
    description: 'Os melhores produtos para se manter aquecido e estiloso nesta estação.',
    coverImage: 'https://picsum.photos/seed/winter/800/600',
    productIds: ['1', '3', '5'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'c2',
    name: 'Eletrônicos em Oferta',
    description: 'Os gadgets mais desejados com descontos de até 30% por tempo limitado.',
    coverImage: 'https://picsum.photos/seed/tech/800/600',
    productIds: ['2', '4', '5'],
    createdAt: new Date().toISOString()
  }
];
