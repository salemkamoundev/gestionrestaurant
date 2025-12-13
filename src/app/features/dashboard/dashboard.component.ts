import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FinanceService } from '../../core/services/finance.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">📊 Tableau de Bord</h1>

      <div *ngIf="stats$ | async as stats; else loading" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm font-medium uppercase">Chiffre d'Affaires Total</p>
              <p class="text-3xl font-bold text-gray-900 mt-1">{{ stats.totalRevenue | currency:'EUR' }}</p>
            </div>
            <div class="bg-green-100 p-3 rounded-full text-green-600 text-2xl">💰</div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm font-medium uppercase">Plat le plus vendu</p>
              <p class="text-2xl font-bold text-indigo-900 mt-1 truncate max-w-[150px]" [title]="stats.bestSeller.name">
                {{ stats.bestSeller.name }}
              </p>
              <p class="text-xs text-indigo-400 mt-1">{{ stats.bestSeller.count }} ventes</p>
            </div>
            <div class="bg-indigo-100 p-3 rounded-full text-indigo-600 text-2xl">🏆</div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
          <div class="flex items-center justify-between mb-2">
            <p class="text-gray-500 text-sm font-medium uppercase">Alertes Stock</p>
            <div class="bg-red-100 p-2 rounded-full text-red-600 text-lg">⚠️</div>
          </div>
          
          <div *ngIf="stats.lowStockProducts.length > 0; else noAlert" class="space-y-2 max-h-24 overflow-y-auto">
            <div *ngFor="let p of stats.lowStockProducts" class="text-sm flex justify-between bg-red-50 p-1 rounded">
              <span class="text-red-900 font-medium">{{ p.name }}</span>
              <span class="text-red-600 font-bold">{{ p.quantity }} {{ p.unit }}</span>
            </div>
          </div>
          <ng-template #noAlert>
            <p class="text-sm text-green-600 font-medium">Tout est OK !</p>
          </ng-template>
        </div>

      </div>

      <ng-template #loading>
        <div class="text-center py-10 text-gray-500">Chargement des données...</div>
      </ng-template>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <a routerLink="/pos/tables" class="p-4 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 text-center font-bold">
          📱 Prise de Commande
        </a>
        <a routerLink="/stock" class="p-4 bg-white text-gray-700 rounded-lg shadow hover:bg-gray-50 text-center font-bold border">
          📦 Stocks
        </a>
        <a routerLink="/hr/planning" class="p-4 bg-white text-gray-700 rounded-lg shadow hover:bg-gray-50 text-center font-bold border">
          📅 Planning
        </a>
        <a routerLink="/finance/expenses" class="p-4 bg-white text-gray-700 rounded-lg shadow hover:bg-gray-50 text-center font-bold border">
          💸 Dépenses
        </a>
      </div>
    </div>
  `
})
export class DashboardComponent {
  financeService = inject(FinanceService);
  stats$ = this.financeService.getDashboardStats();
}
