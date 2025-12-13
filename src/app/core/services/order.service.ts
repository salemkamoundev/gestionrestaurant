import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, updateDoc, doc, getDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
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
    // On trie les tables par numéro (approximatif via sort JS client-side pour simplifier)
    return (collectionData(this.tablesCollection, { idField: 'id' }) as Observable<Table[]>).pipe(
      map(tables => tables.sort((a, b) => {
        // Tri alphanumérique (1, 2, 10 au lieu de 1, 10, 2)
        return a.number.localeCompare(b.number, undefined, { numeric: true });
      }))
    );
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

  async validateOrder(orderId: string, orderData: any): Promise<void> {
    const docRef = doc(this.firestore, `orders/${orderId}`);
    await updateDoc(docRef, { ...orderData, status: 'confirmed' }); // Ou autre logique
  }
}
