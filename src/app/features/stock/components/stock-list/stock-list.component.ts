import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StockService } from '../../../../core/services/stock.service';
import { Observable } from 'rxjs';
import { Product } from '../../../../core/models/interfaces';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6 bg-white rounded-lg shadow-md">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">📦 Gestion du Stock</h2>
        <a routerLink="/stock/new" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow flex items-center gap-2">
          <span>+ Nouveau Produit</span>
        </a>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coût</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let product of products$ | async">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {{ product.category }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span [ngClass]="{'text-red-600 font-bold': product.quantity <= product.minThreshold, 'text-green-600': product.quantity > product.minThreshold}">
                  {{ product.quantity }} {{ product.unit }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ product.costPrice | currency:'EUR' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button (click)="deleteProduct(product.id)" class="text-red-600 hover:text-red-900 ml-4">Supprimer</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class StockListComponent {
  stockService = inject(StockService);
  products$: Observable<Product[]> = this.stockService.getProducts();

  deleteProduct(id: string) {
    if(confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.stockService.deleteProduct(id);
    }
  }
}
