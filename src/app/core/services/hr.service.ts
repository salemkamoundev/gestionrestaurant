import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, deleteDoc, updateDoc, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { FirebaseApp, initializeApp, deleteApp } from '@angular/fire/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Observable, from, map } from 'rxjs';
import { UserProfile } from '../models/interfaces';

export interface Shift {
  id?: string;
  userId: string;
  start: string; 
  end: string;   
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
  private app = inject(FirebaseApp); // Nécessaire pour l'astuce de création sans logout

  // --- EMPLOYES (USERS) ---
  
  getEmployees(): Observable<UserProfile[]> {
    const usersRef = collection(this.firestore, 'users');
    return collectionData(usersRef, { idField: 'uid' }) as Observable<UserProfile[]>;
  }

  getEmployee(uid: string): Observable<UserProfile | undefined> {
    const docRef = doc(this.firestore, `users/${uid}`);
    return from(getDoc(docRef)).pipe(
      map(snap => snap.exists() ? { uid: snap.id, ...snap.data() } as UserProfile : undefined)
    );
  }

  // CREATE: Auth + Profile (Sans déconnecter l'admin)
  async createEmployeeWithAuth(employee: UserProfile, password: string): Promise<void> {
    // 1. Astuce : Créer une instance Firebase secondaire
    // Cela permet de créer un user sans que l'Auth principal (celui de l'admin) ne bascule dessus
    const secondaryApp = initializeApp(this.app.options, 'Secondary');
    const secondaryAuth = getAuth(secondaryApp);

    try {
      // 2. Création du compte Auth
      const credential = await createUserWithEmailAndPassword(secondaryAuth, employee.email, password);
      const newUser = credential.user;

      // 3. Mise à jour du nom dans Auth
      await updateProfile(newUser, { displayName: employee.displayName });

      // 4. Création de la fiche Firestore avec le bon UID
      const userProfile: UserProfile = {
        ...employee,
        uid: newUser.uid, // On force l'UID généré par Auth
        createdAt: new Date()
      };

      await setDoc(doc(this.firestore, `users/${newUser.uid}`), userProfile);

    } catch (e) {
      throw e; // On renvoie l'erreur au composant
    } finally {
      // 5. Nettoyage de l'instance secondaire
      await deleteApp(secondaryApp);
    }
  }

  async updateEmployee(uid: string, data: Partial<UserProfile>): Promise<void> {
    const docRef = doc(this.firestore, `users/${uid}`);
    await updateDoc(docRef, data);
  }

  async deleteEmployee(uid: string): Promise<void> {
    const docRef = doc(this.firestore, `users/${uid}`);
    await deleteDoc(docRef);
  }

  // --- PLANNING ---
  getShifts(): Observable<Shift[]> {
    const shiftsRef = collection(this.firestore, 'shifts');
    return collectionData(shiftsRef, { idField: 'id' }) as Observable<Shift[]>;
  }

  async addShift(shift: Shift): Promise<void> {
    await addDoc(collection(this.firestore, 'shifts'), shift);
  }

  async updateShift(id: string, data: Partial<Shift>): Promise<void> {
    const docRef = doc(this.firestore, `shifts/${id}`);
    await updateDoc(docRef, data);
  }

  async deleteShift(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, `shifts/${id}`));
  }

  // --- CLOSING ---
  async calculateDailyRevenue(serverName: string): Promise<number> {
    return 0; 
  }

  async submitClosingReport(report: ClosingReport): Promise<void> {
    await addDoc(collection(this.firestore, 'closing-reports'), report);
  }
}
