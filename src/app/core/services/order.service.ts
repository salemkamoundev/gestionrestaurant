import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, updateDoc, doc, getDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable, map, from } from 'rxjs';
import { Order, Table } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private firestore = inject(Firestore);
  private ordersCollection = collection(this.firestore, 'orders');
  private tablesCollection = collection(this.firestore, 'tables');

  // --- TABLES ---
  getTables(): Observable<Table[]> {
    return (collectionData(this.tablesCollection, { idField: 'id' }) as Observable<Table[]>).pipe(
      map(tables => tables.sort((a, b) => {
        return a.number.localeCompare(b.number, undefined, { numeric: true });
      }))
    );
  }

  // NOUVEAU : Récupérer une seule table (pour vérifier le currentOrderId)
  async getTable(id: string): Promise<Table | undefined> {
    const docRef = doc(this.firestore, `tables/${id}`);
    const snap = await getDoc(docRef);
    return snap.exists() ? { id: snap.id, ...snap.data() } as Table : undefined;
  }

  async addTable(table: Omit<Table, 'id'>): Promise<void> {
    await addDoc(this.tablesCollection, table);
  }

  async updateTable(id: string, data: Partial<Table>): Promise<void> {
    const docRef = doc(this.firestore, `tables/${id}`);
    await updateDoc(docRef, data);
  }

  async deleteTable(id: string): Promise<void> {
    const docRef = doc(this.firestore, `tables/${id}`);
    await deleteDoc(docRef);
  }

  // --- ORDERS ---
  
  // NOUVEAU : Récupérer une commande spécifique
  async getOrder(id: string): Promise<Order | undefined> {
    const docRef = doc(this.firestore, `orders/${id}`);
    const snap = await getDoc(docRef);
    return snap.exists() ? { id: snap.id, ...snap.data() } as Order : undefined;
  }

  async createOrder(order: any): Promise<string> {
    const docRef = await addDoc(this.ordersCollection, {
      ...order,
      createdAt: new Date(),
      status: 'open'
    });

    // Mettre à jour le statut de la table
    if (order.tableId && order.tableId !== 'takeaway') {
      await this.updateTable(order.tableId, { 
        status: 'occupied', 
        currentOrderId: docRef.id 
      });
    }
    
    return docRef.id;
  }

  // NOUVEAU : Mettre à jour une commande existante (sans créer de doublon)
  async updateOrder(orderId: string, orderData: any): Promise<void> {
    const docRef = doc(this.firestore, `orders/${orderId}`);
    await updateDoc(docRef, { 
      ...orderData,
      // On ne touche pas au createdAt
    });
  }

  async validateOrder(orderId: string, orderData: any): Promise<void> {
    const docRef = doc(this.firestore, `orders/${orderId}`);
    await updateDoc(docRef, { ...orderData, status: 'confirmed' });
  }
}
