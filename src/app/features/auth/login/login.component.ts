import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Gestion Restaurant
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Connectez-vous pour accéder à votre espace
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          
          <div *ngIf="errorMessage" class="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative">
            <span class="block sm:inline">{{ errorMessage }}</span>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" formControlName="email" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Mot de passe</label>
              <input type="password" formControlName="password" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
            </div>

            <button type="submit" [disabled]="isLoading"
                    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
              {{ isLoading ? 'Connexion en cours...' : 'Se connecter' }}
            </button>
          </form>
          
          <div class="mt-6 text-xs text-center text-gray-500">
            <p>Admin Auto-Promotion activée pour :</p>
            <p class="font-bold">admin@gmail.com</p>
          </div>

        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  errorMessage: string | null = null;
  isLoading = false;

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;
      const { email, password } = this.loginForm.getRawValue();

      try {
        // La méthode login() de AuthService contient maintenant la logique 
        // qui détecte 'admin@gmail.com' et le passe Super Admin automatiquement.
        await this.authService.login(email, password);
        
        this.router.navigate(['/dashboard']);
      } catch (error: any) {
        console.error(error);
        this.isLoading = false;
        this.errorMessage = "Email ou mot de passe incorrect.";
      }
    }
  }
}
