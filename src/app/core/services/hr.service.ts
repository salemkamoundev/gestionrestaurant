import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, query, where, getDocs, addDoc, Timestamp } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { UserProfile, Order } from '../models/interfaces';

export interface Shift {
  id?: string;
  userId: string;
  userName: string;
  start: string; // ISO String pour vis-timeline
  end: string;   // ISO String
  role: string;
}

export interface ClosingReport {
  userId: string;
  userName: string;
  date: any;
  theoreticalAmount: number;
  declaredAmount: number;
  difference: number;
  comment?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HrService {
  private firestore = inject(Firestore);

  // --- EMPLOYES ---
  getEmployees(): Observable<UserProfile[]> {
    const usersRef = collection(this.firestore, 'users');
    return collectionData(usersRef, { idField: 'uid' }) as Observable<UserProfile[]>;
  }

  // --- PLANNING / SHIFTS ---
  getShifts(): Observable<Shift[]> {
    const shiftsRef = collection(this.firestore, 'shifts');
    return collectionData(shiftsRef, { idField: 'id' }) as Observable<Shift[]>;
  }

  async addShift(shift: Shift): Promise<void> {
    await addDoc(collection(this.firestore, 'shifts'), shift);
  }

  // --- CLOSING (CALCUL RECETTE) ---
  // Calcule le total des commandes fermées par le serveur depuis le début de la journée
  async calculateDailyRevenue(serverName: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Timestamp.fromDate(today);

    const ordersRef = collection(this.firestore, 'orders');
    // Note: Idéalement, il faut un index composite sur Firestore pour cette requête
    const q = query(
      ordersRef, 
      where('serverName', '==', serverName),
      where('status', '==', 'closed'),
      where('createdAt', '>=', todayTimestamp)
    );

    const snapshot = await getDocs(q);
    let total = 0;
    snapshot.forEach(doc => {
      const order = doc.data() as Order;
      total += order.totalAmount;
    });
    
    return total;
  }

  async submitClosingReport(report: ClosingReport): Promise<void> {
    await addDoc(collection(this.firestore, 'closing-reports'), report);
  }
}
