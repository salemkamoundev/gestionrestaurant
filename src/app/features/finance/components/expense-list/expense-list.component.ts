import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FinanceService } from '../../../../core/services/finance.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Observable } from 'rxjs';
import { Expense, UserProfile } from '../../../../core/models/interfaces';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-6 bg-white rounded-lg shadow-md">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">📉 Gestion des Dépenses</h2>

      <div *ngIf="isAdmin" class="bg-gray-50 p-4 rounded-lg mb-8 border border-gray-200">
        <h3 class="text-lg font-semibold mb-4 text-indigo-700">Ajouter une dépense</h3>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label class="block text-sm font-medium text-gray-700">Description</label>
            <input formControlName="description" type="text" class="w-full rounded border-gray-300 p-2 border">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Montant (€)</label>
            <input formControlName="amount" type="number" class="w-full rounded border-gray-300 p-2 border">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Catégorie</label>
            <select formControlName="category" class="w-full rounded border-gray-300 p-2 border">
              <option value="salary">Salaire</option>
              <option value="rent">Loyer</option>
              <option value="purchase">Achats MP</option>
              <option value="utilities">Factures</option>
              <option value="other">Autre</option>
            </select>
          </div>
          <button type="submit" [disabled]="form.invalid" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            Ajouter
          </button>
        </form>
      </div>

      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant</th>
            <th *ngIf="isAdmin" class="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr *ngFor="let expense of expenses$ | async">
            <td class="px-6 py-4 text-sm text-gray-500">{{ expense.date?.toDate() | date:'shortDate' }}</td>
            <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ expense.description }}</td>
            <td class="px-6 py-4 text-sm text-gray-500">
              <span class="px-2 py-1 text-xs rounded-full bg-gray-100">{{ expense.category }}</span>
            </td>
            <td class="px-6 py-4 text-sm text-right text-red-600 font-bold">- {{ expense.amount | currency:'EUR' }}</td>
            <td *ngIf="isAdmin" class="px-6 py-4 text-right">
              <button (click)="deleteExpense(expense.id)" class="text-red-400 hover:text-red-700">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class ExpenseListComponent implements OnInit {
  fb = inject(FormBuilder);
  financeService = inject(FinanceService);
  authService = inject(AuthService);

  expenses$ = this.financeService.getExpenses();
  currentUser: UserProfile | null = null;

  form = this.fb.group({
    description: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.1)]],
    category: ['purchase', Validators.required]
  });

  async ngOnInit() {
    this.currentUser = await this.authService.getUserProfile();
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'super_admin';
  }

  async onSubmit() {
    if (this.form.valid && this.currentUser) {
      const expense = {
        ...this.form.value,
        date: new Date(),
        createdBy: this.currentUser.uid
      } as any;
      
      await this.financeService.addExpense(expense);
      this.form.reset({ category: 'purchase' });
    }
  }

  deleteExpense(id: string) {
    if(confirm('Supprimer cette dépense ?')) {
      this.financeService.deleteExpense(id);
    }
  }
}
