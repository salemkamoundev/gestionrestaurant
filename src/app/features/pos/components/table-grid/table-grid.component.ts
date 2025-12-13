import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService } from '../../../../core/services/order.service';
import { Observable } from 'rxjs';
import { Table } from '../../../../core/models/interfaces';

@Component({
  selector: 'app-table-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-100 p-4">
      <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">Salle & Tables</h1>
      
      <div class="flex justify-center gap-4 mb-8">
        <div class="flex items-center gap-2"><div class="w-4 h-4 bg-green-500 rounded"></div> Libre</div>
        <div class="flex items-center gap-2"><div class="w-4 h-4 bg-red-500 rounded"></div> Occupé</div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        <div (click)="openTakeaway()" 
             class="aspect-square bg-indigo-600 text-white rounded-xl shadow-lg flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform">
           <span class="text-4xl mb-2">🛍️</span>
           <span class="font-bold text-lg">À emporter</span>
        </div>

        <div *ngFor="let table of tables$ | async" 
             (click)="selectTable(table)"
             [ngClass]="{
               'bg-white border-green-500 text-gray-800': table.status === 'available',
               'bg-red-50 border-red-500 text-red-800': table.status === 'occupied',
               'bg-yellow-50 border-yellow-500': table.status === 'reserved'
             }"
             class="aspect-square border-4 rounded-xl shadow-md flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform relative">
             
             <span class="text-3xl font-bold mb-1">{{ table.number }}</span>
             <span class="text-sm">{{ table.capacity }} pers.</span>
             
             <div *ngIf="table.status === 'occupied'" class="absolute top-2 right-2 text-red-600 animate-pulse">
               ●
             </div>
        </div>
      </div>
    </div>
  `
})
export class TableGridComponent {
  orderService = inject(OrderService);
  router = inject(Router);
  tables$: Observable<Table[]> = this.orderService.getTables();

  selectTable(table: Table) {
    if (table.status === 'occupied' && table.currentOrderId) {
      // Reprendre la commande existante (TODO: Logique de reprise)
      // Pour l'instant, on redirige juste vers l'interface
      this.router.navigate(['/pos/order'], { queryParams: { tableId: table.id } });
    } else {
      // Nouvelle commande
      this.router.navigate(['/pos/order'], { queryParams: { tableId: table.id, tableNumber: table.number } });
    }
  }

  openTakeaway() {
    this.router.navigate(['/pos/order'], { queryParams: { type: 'takeaway' } });
  }
}
