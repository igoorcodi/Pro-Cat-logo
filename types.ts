
export type UserStatus = 'active' | 'inactive';
export type ProductStatus = 'active' | 'inactive' | 'archived';
export type PermissionLevel = 'none' | 'view' | 'edit' | 'admin';
export type QuotationStatus = 'waiting' | 'in_progress' | 'finished' | 'delivered';
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
  id: string;
  name: string;
  email: string;
  password?: string;
  photo?: string;
  role: 'admin' | 'editor' | 'viewer';
  status: UserStatus;
  permissions: UserPermissions;
}

export interface Customer {
  id: string;
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
  user_id: string;
}

export interface Subcategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sku: string;
  images: string[];
  stock: number;
  status: ProductStatus;
  category: string; 
  categoryId?: string;
  subcategoryId?: string;
  tags: string[];
  createdAt: string;
}

export interface QuotationItem {
  productId: string;
  name: string;
  quantity: number;
  price: number; 
  discount: number;
}

export interface Quotation {
  id: string;
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
  id: string;
  name: string;
  description: string;
  coverImage: string;
  productIds: string[];
  createdAt: string;
}

// Added MessageTemplate to fix the import error in components/WhatsAppModal.tsx
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
  | 'customer-form';
