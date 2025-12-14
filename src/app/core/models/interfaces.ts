export type UserRole = 'super_admin' | 'admin' | 'server' | 'staff';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  jobTitle?: string;
  phone?: string;
  createdAt: Date | any;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  unit: 'kg' | 'l' | 'piece';
  quantity: number;
  minThreshold: number; 
  costPrice: number;    
  updatedAt: Date | any;
}

export interface Ingredient {
  productId: string; 
  quantity: number;
}

export interface Dish {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category: 'starter' | 'main' | 'dessert' | 'drink';
  ingredients: Ingredient[]; 
  isAvailable: boolean;
}

export interface OrderItem {
  dishId: string;
  dishName: string;
  quantity: number;
  price: number;
  status: 'pending' | 'cooking' | 'served';
}

export interface Order {
  id: string;
  tableId: string; 
  serverName: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'open' | 'closed' | 'cancelled';
  createdAt: any; 
  closedAt?: any;
}

export interface Table {
  id: string;
  number: string;
  zone: string;  // NOUVEAU CHAMP
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  currentOrderId?: string;
  paymentStatus?: 'pending' | 'paid';
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: 'salary' | 'rent' | 'purchase' | 'utilities' | 'other';
  date: any;
  createdBy: string;
}

export interface Invoice {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'check';
  date: any;
}
