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
        <h2 class="text-2xl font-bold text-gray-800">🍽️ Gestion du Menu</h2>
        <a routerLink="/dishes/new" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow flex items-center gap-2">
          <span>+ Créer une recette</span>
        </a>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let dish of dishes$ | async" class="border rounded-lg p-4 shadow-sm hover:shadow-md transition bg-gray-50 flex flex-col justify-between">
          
          <div>
            <div class="flex justify-between items-start">
              <h3 class="text-lg font-bold text-gray-900">{{ dish.name }}</h3>
              <span [ngClass]="{'bg-green-100 text-green-800': dish.isAvailable, 'bg-red-100 text-red-800': !dish.isAvailable}" class="px-2 py-1 text-xs rounded-full">
                {{ dish.isAvailable ? 'En vente' : 'Indisponible' }}
              </span>
            </div>
            <p class="text-sm text-gray-500 mt-1 line-clamp-2">{{ dish.description || 'Pas de description' }}</p>
            <div class="mt-2 text-xs text-gray-400">
               {{ dish.ingredients ? dish.ingredients.length : 0 }} Ingrédient(s)
            </div>
          </div>

          <div class="mt-4 pt-4 border-t flex justify-between items-center">
            <span class="text-xl font-bold text-indigo-600">{{ dish.price | currency:'EUR' }}</span>
            
            <div class="flex gap-3">
              <a [routerLink]="['/dishes/edit', dish.id]" class="text-indigo-600 hover:text-indigo-900 font-medium text-sm flex items-center gap-1">
                ✏️ Modifier
              </a>
              <button (click)="deleteDish(dish.id)" class="text-red-500 hover:text-red-700 font-medium text-sm">
                🗑️
              </button>
            </div>
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
    if(confirm('Voulez-vous vraiment supprimer ce plat du menu ?')) {
      this.stockService.deleteDish(id);
    }
  }
}
