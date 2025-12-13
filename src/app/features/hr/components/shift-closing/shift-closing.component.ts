import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HrService, ClosingReport } from '../../../../core/services/hr.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-shift-closing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold text-gray-800">🔐 Clôture de Caisse</h2>
        <p class="text-gray-500">Fin de service pour {{ userName }}</p>
      </div>

      <div *ngIf="isLoading" class="text-center py-4">Calcul en cours...</div>

      <form *ngIf="!isLoading" [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        
        <div class="bg-indigo-50 p-4 rounded-lg text-center">
          <span class="block text-sm text-indigo-600 font-semibold uppercase">Recette Théorique (Système)</span>
          <span class="block text-3xl font-bold text-indigo-900">{{ theoreticalAmount | currency:'EUR' }}</span>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Montant réel en caisse</label>
          <div class="relative rounded-md shadow-sm">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span class="text-gray-500 sm:text-sm">€</span>
            </div>
            <input formControlName="declaredAmount" type="number" 
                   class="block w-full rounded-md border-gray-300 pl-7 py-3 text-lg focus:border-indigo-500 focus:ring-indigo-500 border shadow-sm">
          </div>
        </div>

        <div *ngIf="form.get('declaredAmount')?.value !== null" class="p-3 rounded-lg text-center"
             [ngClass]="{
               'bg-green-100 text-green-800': gap === 0,
               'bg-red-100 text-red-800': gap !== 0
             }">
          <span class="text-sm font-bold">Écart : {{ gap | currency:'EUR' }}</span>
        </div>

        <div>
           <label class="block text-sm font-medium text-gray-700">Commentaire (si écart)</label>
           <textarea formControlName="comment" rows="2" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"></textarea>
        </div>

        <button type="submit" [disabled]="form.invalid" 
                class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
          Valider la clôture
        </button>
      </form>
    </div>
  `
})
export class ShiftClosingComponent implements OnInit {
  fb = inject(FormBuilder);
  hrService = inject(HrService);
  authService = inject(AuthService);
  router = inject(Router);

  userName = '';
  userId = '';
  theoreticalAmount = 0;
  isLoading = true;

  form = this.fb.group({
    declaredAmount: [null as number | null, [Validators.required, Validators.min(0)]],
    comment: ['']
  });

  async ngOnInit() {
    const user = await this.authService.getUserProfile();
    if (user) {
      this.userName = user.displayName || 'Utilisateur';
      this.userId = user.uid;
      this.theoreticalAmount = await this.hrService.calculateDailyRevenue(this.userName);
      this.isLoading = false;
    }
  }

  get gap(): number {
    const declared = this.form.get('declaredAmount')?.value || 0;
    return declared - this.theoreticalAmount;
  }

  async onSubmit() {
    if (this.form.valid) {
      // CORRECTION ICI : Gestion du null pour le commentaire
      const commentValue = this.form.get('comment')?.value;

      const report: ClosingReport = {
        userId: this.userId,
        userName: this.userName,
        date: new Date(),
        theoreticalAmount: this.theoreticalAmount,
        declaredAmount: this.form.get('declaredAmount')?.value || 0,
        difference: this.gap,
        // Si commentValue est null, on passe undefined, sinon la string
        comment: commentValue ?? undefined 
      };

      await this.hrService.submitClosingReport(report);
      alert('Clôture enregistrée avec succès !');
      this.router.navigate(['/']);
    }
  }
}
