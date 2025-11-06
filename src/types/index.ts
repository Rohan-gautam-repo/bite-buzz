import { Timestamp } from "firebase/firestore";

// User Types
export type UserRole = "user" | "admin";

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  createdAt: Timestamp;
}

export type CreateUserInput = Omit<User, "id" | "createdAt">;
export type UpdateUserInput = Partial<Omit<User, "id" | "createdAt">>;

// Category Types
export interface Category {
  id: string;
  name: string;
  emoji: string;
  displayOrder: number;
}

export type CreateCategoryInput = Omit<Category, "id">;
export type UpdateCategoryInput = Partial<Omit<Category, "id">>;

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stockQuantity: number;
  emoji: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;
export type UpdateProductInput = Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>;

// Cart Types
export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: Timestamp;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: Timestamp;
}

export type AddCartItemInput = Omit<CartItem, "addedAt">;
export type UpdateCartItemInput = Pick<CartItem, "productId" | "quantity">;

// Address Types
export type AddressType = "Home" | "Work" | "Other";

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pinCode: string;
  addressType: AddressType;
  isDefault: boolean;
}

export interface AddressBook {
  userId: string;
  addresses: Address[];
}

export type CreateAddressInput = Omit<Address, "id">;
export type UpdateAddressInput = Partial<Omit<Address, "id">>;

// Order Types
export type OrderStatus = "preparing" | "dispatched" | "delivered" | "cancelled";
export type PaymentMethod = "COD" | "UPI" | "Card";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  emoji: string;
}

export interface DeliveryPartner {
  name: string;
  phone: string;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  deliveryAddress: Address;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  deliveryPartner?: DeliveryPartner;
  orderDate: Timestamp;
  dispatchedAt?: Timestamp;
  deliveredAt?: Timestamp;
  cancelledAt?: Timestamp;
}

export type CreateOrderInput = Pick<Order, "userId" | "items" | "deliveryAddress" | "totalAmount">;
export type UpdateOrderInput = Partial<Pick<Order, "status" | "deliveryPartner" | "dispatchedAt" | "deliveredAt" | "cancelledAt">>;

// Utility Types for Frontend
export interface ProductWithDetails extends Product {
  categoryName?: string;
  categoryEmoji?: string;
}

export interface CartItemWithDetails extends CartItem {
  product: Product;
  subtotal: number;
}

export interface OrderWithDetails extends Order {
  itemCount: number;
  statusHistory: {
    status: OrderStatus;
    timestamp: Timestamp;
  }[];
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface AddressFormData extends Omit<Address, "id"> {}

export interface ProductFormData extends Omit<Product, "id" | "createdAt" | "updatedAt"> {}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Filter and Sort Types
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  startDate?: Date;
  endDate?: Date;
  userId?: string;
}

export type SortOrder = "asc" | "desc";

export interface SortOptions {
  field: string;
  order: SortOrder;
}
