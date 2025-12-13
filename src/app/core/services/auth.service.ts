import { Injectable, inject } from '@angular/core';
import { Auth, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc, docData, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { UserProfile, UserRole } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  // Observable du profil utilisateur courant
  readonly user$: Observable<UserProfile | null> = authState(this.auth).pipe(
    switchMap(user => {
      if (user) {
        const userDoc = doc(this.firestore, `users/${user.uid}`);
        return docData(userDoc, { idField: 'uid' }) as Observable<UserProfile>;
      } else {
        return of(null);
      }
    })
  );

  async login(email: string, pass: string): Promise<void> {
    // 1. Connexion Auth
    const credential = await signInWithEmailAndPassword(this.auth, email, pass);
    const user = credential.user;

    // 2. CHECK MAGIQUE : Si c'est admin@gmail.com, on le force SUPER_ADMIN
    if (user.email === 'admin@gmail.com') {
        console.log("👑 DÉTECTION DU SUPER ADMIN : Mise à jour des droits...");
        await this.forceSuperAdmin(user);
    }
  }

  // Fonction privée pour forcer les droits
  private async forceSuperAdmin(user: User): Promise<void> {
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Super Admin',
      role: 'super_admin', // <--- C'EST ICI QUE LA MAGIE OPERE
      createdAt: new Date()
    };
    
    // On utilise setDoc avec {merge: true} pour ne pas écraser la date de création si elle existe déjà
    await setDoc(doc(this.firestore, `users/${user.uid}`), userProfile, { merge: true });
  }

  // Inscription standard
  async register(email: string, pass: string, name: string, role: UserRole = 'server'): Promise<void> {
    const credential = await createUserWithEmailAndPassword(this.auth, email, pass);
    const user = credential.user;
    await updateProfile(user, { displayName: name });

    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: name,
      role: role,
      createdAt: new Date()
    };

    await setDoc(doc(this.firestore, `users/${user.uid}`), userProfile);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }

  async getUserProfile(): Promise<UserProfile | null> {
    const user = this.auth.currentUser;
    if (!user) return null;
    
    const snap = await getDoc(doc(this.firestore, `users/${user.uid}`));
    return snap.exists() ? (snap.data() as UserProfile) : null;
  }
}
