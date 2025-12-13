import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
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

  async updateProduct(id: string, data: Partial<Product>): Promise<void> {
    const docRef = doc(this.firestore, `products/${id}`);
    await updateDoc(docRef, { ...data, updatedAt: new Date() });
  }

  async deleteProduct(id: string): Promise<void> {
    const docRef = doc(this.firestore, `products/${id}`);
    await deleteDoc(docRef);
  }

  // --- DISHES ---
  getDishes(): Observable<Dish[]> {
    return collectionData(this.dishesCollection, { idField: 'id' }) as Observable<Dish[]>;
  }

  async addDish(dish: Omit<Dish, 'id'>): Promise<void> {
    await addDoc(this.dishesCollection, dish);
  }

  async updateDish(id: string, data: Partial<Dish>): Promise<void> {
    const docRef = doc(this.firestore, `dishes/${id}`);
    await updateDoc(docRef, data);
  }

  async deleteDish(id: string): Promise<void> {
    const docRef = doc(this.firestore, `dishes/${id}`);
    await deleteDoc(docRef);
  }
}
