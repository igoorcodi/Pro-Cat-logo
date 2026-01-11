
export type UserStatus = 'active' | 'inactive';
export type ProductStatus = 'active' | 'inactive' | 'archived';
export type PermissionLevel = 'none' | 'view' | 'edit' | 'admin';
export type QuotationStatus = 'waiting' | 'in_progress' | 'finished' | 'delivered';
export type UserRole = 'admin' | 'editor' | 'viewer';
export type CustomerStatus = 'active' | 'inactive';

export interface UserPermissions {
  dashboard: PermissionLevel;
  products: PermissionLevel;
  categories: PermissionLevel;
  catalogs: PermissionLevel;
  reports: PermissionLevel;
  settings: PermissionLevel;
}

export interface User {
  id: number | string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  photo?: string;
  role: UserRole;
  status: UserStatus;
  permissions: UserPermissions;
}

export interface Company {
  id?: number | string;
  user_id: number | string;
  name: string;
  trading_name?: string;
  document?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  logo_url?: string;
  zip_code?: string;
  address?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  createdAt?: string;
}

export interface Customer {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  document?: string;
  zipCode?: string;
  address?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  status: CustomerStatus;
  notes?: string;
  createdAt: string;
  user_id: number | string;
}

export interface Subcategory {
  id: number | string;
  name: string;
}

export interface Category {
  id: number | string;
  name: string;
  subcategories: Subcategory[];
}

export interface Product {
  id: number | string;
  name: string;
  description: string;
  price: number;
  sku: string;
  images: string[];
  stock: number;
  status: ProductStatus;
  category: string; 
  categoryId?: number | string;
  subcategoryId?: number | string;
  subcategoryIds?: (number | string)[]; // Novo campo para múltiplas subcategorias
  tags: string[];
  createdAt: string;
}

export interface CartItem {
  id: string; // unique id for cart entry (prodId + subId)
  productId: number | string;
  productName: string;
  price: number;
  quantity: number;
  image?: string;
  selectedSub?: Subcategory | null;
}

export interface QuotationItem {
  productId: number | string;
  name: string;
  quantity: number;
  price: number; 
  discount: number;
}

export interface Quotation {
  id: number | string;
  clientName: string;
  clientPhone: string;
  sellerName: string;
  quotationDate: string;
  keyword?: string;
  items: QuotationItem[];
  total: number;
  status: QuotationStatus;
  notes?: string;
  createdAt: string;
}

export interface Catalog {
  id: number | string;
  name: string;
  slug?: string;
  description: string;
  coverImage: string;
  logoUrl?: string;
  productIds: (number | string)[];
  publicUrl?: string;
  user_id?: number | string;
  createdAt: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
}

export type AppView = 
  | 'dashboard' 
  | 'products' 
  | 'product-form'
  | 'catalogs' 
  | 'categories'
  | 'catalog-detail'
  | 'public-catalog'
  | 'reports' 
  | 'settings' 
  | 'help'
  | 'login'
  | 'register'
  | 'onboarding'
  | 'quotations'
  | 'quotation-form'
  | 'customers'
  | 'customer-form'
  | 'reset-password';
