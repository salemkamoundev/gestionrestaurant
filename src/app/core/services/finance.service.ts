import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, where, getDocs, orderBy, deleteDoc, doc } from '@angular/fire/firestore';
import { Observable, combineLatest, map, from } from 'rxjs';
import { Expense, Product, Order } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private firestore = inject(Firestore);

  // --- DEPENSES (EXPENSES) ---
  getExpenses(): Observable<Expense[]> {
    const ref = collection(this.firestore, 'expenses');
    const q = query(ref, orderBy('date', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Expense[]>;
  }

  async addExpense(expense: Omit<Expense, 'id'>): Promise<void> {
    await addDoc(collection(this.firestore, 'expenses'), expense);
  }

  async deleteExpense(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, `expenses/${id}`));
  }

  // --- DASHBOARD DATA ---
  // Récupère les stats agrégées (C'est lourd à faire côté client, mais OK pour un MVP)
  getDashboardStats(): Observable<any> {
    const productsRef = collection(this.firestore, 'products');
    const ordersRef = collection(this.firestore, 'orders');

    const products$ = collectionData(productsRef, { idField: 'id' }) as Observable<Product[]>;
    const orders$ = collectionData(query(ordersRef, where('status', '==', 'closed')), { idField: 'id' }) as Observable<Order[]>;

    return combineLatest([products$, orders$]).pipe(
      map(([products, orders]) => {
        // 1. Chiffre d'affaires total
        const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

        // 2. Alertes Stock (Produits sous le seuil)
        const lowStockProducts = products.filter(p => p.quantity <= p.minThreshold);

        // 3. Plat le plus vendu
        const dishCount: Record<string, number> = {};
        orders.forEach(order => {
          order.items.forEach(item => {
            dishCount[item.dishName] = (dishCount[item.dishName] || 0) + item.quantity;
          });
        });
        
        // Trouver le max
        let bestSellerName = 'Aucun';
        let maxSold = 0;
        Object.entries(dishCount).forEach(([name, count]) => {
          if (count > maxSold) {
            maxSold = count;
            bestSellerName = name;
          }
        });

        return {
          totalRevenue,
          lowStockProducts,
          bestSeller: { name: bestSellerName, count: maxSold }
        };
      })
    );
  }
}
