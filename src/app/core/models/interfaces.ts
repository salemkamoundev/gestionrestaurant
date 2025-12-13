export type UserRole = 'super_admin' | 'admin' | 'server';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  unit: 'kg' | 'l' | 'piece';
  quantity: number;
  minThreshold: number; // Seuil d'alerte stock bas
  costPrice: number;    // Prix d'achat
  updatedAt: Date;
}

export interface Ingredient {
  productId: string; // Lien vers Product
  quantity: number;  // Quantité nécessaire pour la recette
}

export interface Dish {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category: 'starter' | 'main' | 'dessert' | 'drink';
  ingredients: Ingredient[]; // Pour la déduction automatique du stock
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
  tableId: string; // ou 'takeaway'
  serverName: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'open' | 'closed' | 'cancelled';
  createdAt: any; // Timestamp Firestore
  closedAt?: any;
}

export interface Table {
  id: string;
  number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  currentOrderId?: string;
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
