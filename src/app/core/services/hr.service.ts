import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, deleteDoc, updateDoc, doc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { UserProfile } from '../models/interfaces';

export interface Shift {
  id?: string;
  userId: string;
  start: string; // ISO String
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

  // NOUVELLE METHODE UPDATE
  async updateShift(id: string, data: Partial<Shift>): Promise<void> {
    const docRef = doc(this.firestore, `shifts/${id}`);
    await updateDoc(docRef, data);
  }

  async deleteShift(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, `shifts/${id}`));
  }

  // --- CLOSING ---
  async calculateDailyRevenue(serverName: string): Promise<number> {
    return 0; // Stub
  }

  async submitClosingReport(report: ClosingReport): Promise<void> {
    await addDoc(collection(this.firestore, 'closing-reports'), report);
  }
}
