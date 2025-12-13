import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, getDoc } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Product, Dish } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private firestore = inject(Firestore);
  private productsCollection = collection(this.firestore, 'products');
  private dishesCollection = collection(this.firestore, 'dishes');

  // --- PRODUCTS ---
  getProducts(): Observable<Product[]> {
    return collectionData(this.productsCollection, { idField: 'id' }) as Observable<Product[]>;
  }

  async addProduct(product: Omit<Product, 'id'>): Promise<void> {
    await addDoc(this.productsCollection, { ...product, updatedAt: new Date() });
  }

  async deleteProduct(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, `products/${id}`));
  }

  // --- DISHES ---
  getDishes(): Observable<Dish[]> {
    return collectionData(this.dishesCollection, { idField: 'id' }) as Observable<Dish[]>;
  }

  // NOUVEAU : Récupérer un seul plat
  getDish(id: string): Observable<Dish | undefined> {
    const docRef = doc(this.firestore, `dishes/${id}`);
    return from(getDoc(docRef)).pipe(
      map(snap => snap.exists() ? { id: snap.id, ...snap.data() } as Dish : undefined)
    );
  }

  async addDish(dish: Omit<Dish, 'id'>): Promise<void> {
    await addDoc(this.dishesCollection, dish);
  }

  // NOUVEAU : Mettre à jour un plat
  async updateDish(id: string, data: Partial<Dish>): Promise<void> {
    const docRef = doc(this.firestore, `dishes/${id}`);
    await updateDoc(docRef, data);
  }

  async deleteDish(id: string): Promise<void> {
    const docRef = doc(this.firestore, `dishes/${id}`);
    await deleteDoc(docRef);
  }
}
