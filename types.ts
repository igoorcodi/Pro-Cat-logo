
export type UserStatus = 'active' | 'inactive';
export type ProductStatus = 'active' | 'inactive' | 'archived';
export type PermissionLevel = 'none' | 'view' | 'edit' | 'admin';
export type QuotationStatus = 'waiting' | 'in_progress' | 'finished' | 'delivered' | 'inactive';
export type UserRole = 'admin' | 'editor' | 'viewer';
export type CustomerStatus = 'active' | 'inactive';
export type StockChangeReason = 'manual_adjustment' | 'sale_delivery' | 'return' | 'initial_stock';

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

export interface Promotion {
  id: string | number;
  user_id: string | number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  max_discount_value: number; 
  usage_limit: number;        
  usage_count: number;        
  show_on_home: boolean;      
  expiry_date?: string;
  status: 'active' | 'inactive';
  created_at?: string;
}

export interface CustomerCouponUsage {
  id: string | number;
  user_id: string | number;
  customer_id: string | number;
  promotion_id: string | number;
  used_at: string;
  promotion?: Promotion; // Carregado via join se necessário
}

export interface User {
  id: string | number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  photo?: string;
  phone?: string;
}

// Added StockHistoryEntry to track stock movements
export interface StockHistoryEntry {
  id: string;
  product_id: string;
  previous_stock: number;
  new_stock: number;
  change_amount: number;
  reason: StockChangeReason;
  notes: string;
  created_at: string;
  user_name: string;
  reference_id?: string;
}

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
  category: string;
  createdAt?: string;
  created_at?: string;
  // Added stock_history field
  stock_history?: StockHistoryEntry[];
}

export interface Category { id: string | number; name: string; user_id: string | number; status: 'active' | 'inactive'; subcategories?: Subcategory[]; }
export interface Subcategory { id: string | number; name: string; category_id: string | number; user_id: string | number; status: 'active' | 'inactive'; }

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
  coverTitle?: string;
  cover_title?: string;
  coverSubtitle?: string;
  cover_subtitle?: string;
  titleFontSize?: 'sm' | 'md' | 'lg' | 'xl';
  title_font_size?: 'sm' | 'md' | 'lg' | 'xl';
  subtitleFontSize?: 'sm' | 'md' | 'lg';
  subtitle_font_size?: 'sm' | 'md' | 'lg';
}

export interface Customer {
  id: string | number;
  user_id: string | number;
  name: string;
  email: string;
  phone: string;
  password?: string; 
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

export interface Company { id?: string | number; user_id: string | number; name: string; trading_name?: string; document: string; whatsapp: string; instagram?: string; email?: string; zip_code?: string; address?: string; number?: string; neighborhood?: string; city?: string; state?: string; logo_url?: string; status: 'active' | 'inactive'; }
export interface PaymentMethod { id: string | number; user_id: string | number; name: string; fee_percentage: number; fixed_fee: number; status: 'active' | 'inactive'; }
export interface CartItem { id: string; productId: string | number; productName: string; price: number; quantity: number; image?: string; selectedSub: Subcategory | null; }

// Added Quotation and related types
export interface QuotationItem {
  productId: string | number;
  name: string;
  quantity: number;
  price: number;
  discount: number;
}

export interface Quotation {
  id: string | number;
  user_id: string | number;
  clientName: string;
  clientPhone: string;
  sellerName: string;
  quotationDate: string;
  keyword: string;
  items: QuotationItem[];
  total: number;
  status: QuotationStatus;
  notes: string;
  createdAt?: string;
  created_at?: string;
  paymentMethodId?: string | number;
}

// Added AuditLog for tracking changes
export interface AuditLog {
  id: string | number;
  user_id: string | number;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  table_name: string;
  record_id: string | number;
  old_data: any;
  new_data: any;
  created_at: string;
}

// Added MessageTemplate for sharing
export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
}
