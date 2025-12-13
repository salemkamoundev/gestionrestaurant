import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StockService } from '../../../../core/services/stock.service';
import { Observable } from 'rxjs';
import { Dish } from '../../../../core/models/interfaces';

@Component({
  selector: 'app-dish-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6 bg-white rounded-lg shadow-md">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">🍽️ Gestion du Menu (Plats)</h2>
        <a routerLink="/dishes/new" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow flex items-center gap-2">
          <span>+ Créer une recette</span>
        </a>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let dish of dishes$ | async" class="border rounded-lg p-4 shadow-sm hover:shadow-md transition bg-gray-50">
          <div class="flex justify-between items-start">
            <h3 class="text-lg font-bold text-gray-900">{{ dish.name }}</h3>
            <span [ngClass]="{'bg-green-100 text-green-800': dish.isAvailable, 'bg-red-100 text-red-800': !dish.isAvailable}" class="px-2 py-1 text-xs rounded-full">
              {{ dish.isAvailable ? 'Disponible' : 'Indisponible' }}
            </span>
          </div>
          <p class="text-sm text-gray-500 mt-1">{{ dish.description }}</p>
          <div class="mt-4 flex justify-between items-center">
            <span class="text-xl font-bold text-indigo-600">{{ dish.price | currency:'EUR' }}</span>
            <button (click)="deleteDish(dish.id)" class="text-red-500 text-sm hover:underline">Supprimer</button>
          </div>
          <div class="mt-2 text-xs text-gray-400">
            Ingrédients: {{ dish.ingredients.length }}
          </div>
        </div>
      </div>
    </div>
  `
})
export class DishListComponent {
  stockService = inject(StockService);
  dishes$: Observable<Dish[]> = this.stockService.getDishes();

  deleteDish(id: string) {
    if(confirm('Supprimer ce plat ?')) {
      this.stockService.deleteDish(id);
    }
  }
}
