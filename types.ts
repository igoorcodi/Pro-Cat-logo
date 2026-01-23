
export type UserStatus = 'active' | 'inactive';
export type ProductStatus = 'active' | 'inactive' | 'archived';
export type PermissionLevel = 'none' | 'view' | 'edit' | 'admin';
export type QuotationStatus = 'waiting' | 'in_progress' | 'finished' | 'delivered' | 'inactive';
export type UserRole = 'admin' | 'editor' | 'viewer';
export type CustomerStatus = 'active' | 'inactive';
export type StockChangeReason = 'manual_adjustment' | 'sale_delivery' | 'return' | 'initial_stock';

/* Application view states used for navigation */
export type AppView = 
  | 'dashboard'
  | 'products'
  | 'product-form'
  | 'stock-adjustment'
  | 'categories'
  | 'catalogs'
  | 'reports'
  | 'settings'
  | 'help'
  | 'quotations'
  | 'quotation-form'
  | 'public-catalog'
  | 'customers'
  | 'customer-form'
  | 'promotions'
  | 'reset-password'
  | 'login'
  | 'register'
  | 'onboarding';

/* Promotion/Coupon interface */
export interface Promotion {
  id: string | number;
  user_id: string | number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  max_discount_value: number; // Novo campo
  usage_limit: number;        // Novo campo
  usage_count: number;        // Novo campo
  expiry_date?: string;
  status: 'active' | 'inactive';
  created_at?: string;
}

/* System User interface */
export interface User {
  id: string | number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  photo?: string;
  phone?: string;
}

/* Individual entry for stock movement audit */
export interface StockHistoryEntry {
  id: string;
  product_id: string;
  previous_stock: number;
  new_stock: number;
  change_amount: number;
  reason: StockChangeReason;
  notes?: string;
  created_at: string;
  user_name: string;
  reference_id?: string;
}

/* Main product interface with support for DB fields and app state mapping */
export interface Product {
  id: string | number;
  user_id: string | number;
  name: string;
  description: string;
  price: number;
  sku: string;
  stock: number;
  status: ProductStatus;
  category_id?: string | number;
  categoryId?: string | number;
  subcategory_ids?: (string | number)[];
  subcategoryIds?: (string | number)[];
  tags?: string[];
  images?: string[];
  stock_history?: StockHistoryEntry[];
  category: string;
  createdAt?: string;
  created_at?: string;
}

/* Subcategory definition */
export interface Subcategory {
  id: string | number;
  name: string;
  category_id: string | number;
  user_id: string | number;
  status: 'active' | 'inactive';
}

/* Category definition with optional nested subcategories */
export interface Category {
  id: string | number;
  name: string;
  user_id: string | number;
  status: 'active' | 'inactive';
  subcategories?: Subcategory[];
}

/* Catalog/Digital Vitrine configuration */
export interface Catalog {
  id: string | number;
  user_id: string | number;
  name: string;
  slug: string;
  description: string;
  cover_image?: string;
  coverImage?: string;
  logo_url?: string;
  logoUrl?: string;
  primary_color?: string;
  primaryColor?: string;
  product_ids: (string | number)[];
  productIds: (string | number)[];
  createdAt?: string;
  created_at?: string;
  status: 'active' | 'inactive';
}

/* Item within a quotation/order */
export interface QuotationItem {
  productId: string | number;
  name: string;
  quantity: number;
  price: number;
  discount: number;
}

/* Quotation/Order management */
export interface Quotation {
  id: string | number;
  user_id: string | number;
  client_name?: string;
  clientName?: string;
  client_phone?: string;
  clientPhone?: string;
  seller_name?: string;
  sellerName?: string;
  quotation_date?: string;
  quotationDate?: string;
  keyword?: string;
  items: QuotationItem[];
  total: number;
  status: QuotationStatus;
  notes?: string;
  payment_method_id?: string | number;
  paymentMethodId?: string | number;
  createdAt?: string;
  created_at?: string;
}

/* Customer/Client management */
export interface Customer {
  id: string | number;
  user_id: string | number;
  name: string;
  email: string;
  phone: string;
  document: string;
  zip_code?: string;
  zipCode?: string;
  address: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  status: CustomerStatus;
  notes: string;
  createdAt?: string;
  created_at?: string;
}

/* Company/Business profile */
export interface Company {
  id?: string | number;
  user_id: string | number;
  name: string;
  trading_name?: string;
  document: string;
  whatsapp: string;
  instagram?: string;
  email?: string;
  zip_code?: string;
  address?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  logo_url?: string;
  status: 'active' | 'inactive';
}

/* Payment method configuration */
export interface PaymentMethod {
  id: string | number;
  user_id: string | number;
  name: string;
  fee_percentage: number;
  fixed_fee: number;
  status: 'active' | 'inactive';
}

/* Message template for sharing */
export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
}

/* Shopping cart item for public vitrine */
export interface CartItem {
  id: string;
  productId: string | number;
  productName: string;
  price: number;
  quantity: number;
  image?: string;
  selectedSub: Subcategory | null;
}

/* General system audit log */
export interface AuditLog {
  id: number | string;
  user_id: number | string;
  table_name: string;
  record_id: number | string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_data: any;
  new_data: any;
  created_at: string;
}
