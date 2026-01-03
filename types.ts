
export type UserStatus = 'active' | 'inactive';
export type ProductStatus = 'active' | 'inactive' | 'archived';
export type PermissionLevel = 'none' | 'view' | 'edit' | 'admin';

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

export interface Catalog {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  productIds: string[];
  createdAt: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
}

export interface DashboardStats {
  totalProducts: number;
  lowStockCount: number;
  activeCatalogs: number;
  totalShares: number;
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
  | 'onboarding';
