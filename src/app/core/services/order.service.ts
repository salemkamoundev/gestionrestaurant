import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, getDoc, increment, collectionData } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Order, Dish, Table } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private firestore = inject(Firestore);
  private router = inject(Router);
  
  private ordersCollection = collection(this.firestore, 'orders');
  private tablesCollection = collection(this.firestore, 'tables');

  // Récupérer les tables
  getTables(): Observable<Table[]> {
    return collectionData(this.tablesCollection, { idField: 'id' }) as Observable<Table[]>;
  }

  // Créer une commande (statut: open)
  async createOrder(order: Omit<Order, 'id'>): Promise<string> {
    const docRef = await addDoc(this.ordersCollection, {
      ...order,
      createdAt: new Date(),
      status: 'open'
    });
    
    // Mettre à jour le statut de la table
    if (order.tableId && order.tableId !== 'takeaway') {
      const tableRef = doc(this.firestore, `tables/${order.tableId}`);
      await updateDoc(tableRef, { status: 'occupied', currentOrderId: docRef.id });
    }
    
    return docRef.id;
  }

  // ---------------------------------------------------------------------------
  // LOGIQUE CRITIQUE : VALIDATION & DÉCRÉMENTATION STOCK
  // ---------------------------------------------------------------------------
  async validateOrder(orderId: string, order: Order): Promise<void> {
    // 1. Marquer la commande comme payée/fermée
    const orderRef = doc(this.firestore, `orders/${orderId}`);
    await updateDoc(orderRef, { 
      status: 'closed', 
      closedAt: new Date() 
    });

    // 2. Libérer la table
    if (order.tableId && order.tableId !== 'takeaway') {
      const tableRef = doc(this.firestore, `tables/${order.tableId}`);
      await updateDoc(tableRef, { status: 'available', currentOrderId: null });
    }

    // 3. Boucle sur les plats pour décrémenter le stock
    console.log('🔄 Traitement des stocks pour la commande:', orderId);
    
    for (const item of order.items) {
      // a. Récupérer la recette du plat (Dish) pour connaître les ingrédients
      const dishRef = doc(this.firestore, `dishes/${item.dishId}`);
      const dishSnap = await getDoc(dishRef);
      
      if (dishSnap.exists()) {
        const dish = dishSnap.data() as Dish;

        // b. Pour chaque ingrédient, décrémenter le produit correspondant
        if (dish.ingredients && dish.ingredients.length > 0) {
          for (const ingredient of dish.ingredients) {
            const productRef = doc(this.firestore, `products/${ingredient.productId}`);
            
            // Calcul de la quantité totale à retirer (Qté ingrédient * Nbr de plats commandés)
            const totalQtyToDeduct = ingredient.quantity * item.quantity;

            // c. Utilisation de 'increment(-value)' pour une décrémentation atomique
            await updateDoc(productRef, {
              quantity: increment(-totalQtyToDeduct)
            });
            console.log(`📉 Stock: -${totalQtyToDeduct} sur produit ${ingredient.productId}`);
          }
        }
      }
    }
  }
}
