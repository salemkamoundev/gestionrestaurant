import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interface pour les articles de la commande (Détail)
interface OrderHistoryItem {
  name: string;
  quantity: number;
  price: number;
}

// Interface principale mise à jour
interface OrderHistory {
  id: string;
  date: Date;
  table: string;
  server: string;
  total: number;
  status: 'Payée' | 'En cours' | 'Annulée';
  itemsCount: number;
  items: OrderHistoryItem[]; // Nouveau champ pour les détails
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-4 md:p-8 pb-24">
      
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span>📜</span> Historique
          </h1>
          <p class="text-sm text-gray-500 mt-1">Cliquez sur une commande pour voir les détails.</p>
        </div>
        
        <div class="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm w-full md:w-auto flex justify-between md:justify-start">
          <span class="text-gray-500">Total affiché :</span>
          <span class="font-bold text-indigo-600 ml-2">{{ filteredOrders.length }}</span>
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1 uppercase">Du</label>
            <input type="date" [(ngModel)]="filterStartDate" (change)="applyFilters()" class="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5">
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1 uppercase">Au</label>
            <input type="date" [(ngModel)]="filterEndDate" (change)="applyFilters()" class="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5">
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1 uppercase">Table</label>
            <select [(ngModel)]="filterTable" (change)="applyFilters()" class="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5">
              <option value="">Toutes</option>
              <option *ngFor="let t of tables" [value]="t">Table {{ t }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1 uppercase">Serveur</label>
            <select [(ngModel)]="filterServer" (change)="applyFilters()" class="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5">
              <option value="">Tous</option>
              <option *ngFor="let s of servers" [value]="s">{{ s }}</option>
            </select>
          </div>

          <div class="sm:col-span-2 lg:col-span-1">
            <button (click)="resetFilters()" class="w-full text-gray-600 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors flex justify-center items-center gap-2">
              <span>🔄</span> <span class="hidden sm:inline lg:hidden">Réinitialiser</span><span class="sm:hidden lg:inline">Reset</span>
            </button>
          </div>

        </div>
      </div>

      <div class="md:hidden space-y-4">
        <div *ngFor="let order of filteredOrders" 
             (click)="openDetails(order)"
             class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 active:bg-gray-50 transition cursor-pointer">
          
          <div class="flex justify-between items-start mb-3">
            <div>
              <span class="font-bold text-gray-800 text-lg">#{{ order.id }}</span>
              <div class="text-xs text-gray-500">{{ order.date | date:'dd/MM/yyyy HH:mm' }}</div>
            </div>
            <span [class]="getStatusColor(order.status) + ' px-2 py-1 rounded-full text-xs font-bold border'">
              {{ order.status }}
            </span>
          </div>

          <div class="flex justify-between items-center text-sm text-gray-600 mb-3 bg-gray-50 p-2 rounded">
             <div class="flex items-center gap-2">
               <span>🍽️ T-{{ order.table }}</span>
               <span class="text-gray-300">|</span>
               <span>👤 {{ order.server }}</span>
             </div>
             <div>{{ order.itemsCount }} articles</div>
          </div>

          <div class="flex justify-between items-center pt-2 border-t border-gray-100">
            <span class="text-xs font-semibold text-gray-400 uppercase">Total</span>
            <div class="flex items-center gap-2">
              <span class="font-extrabold text-xl text-indigo-700">{{ order.total | currency:'EUR' }}</span>
              <span class="text-gray-400 text-lg">›</span>
            </div>
          </div>

        </div>

        <div *ngIf="filteredOrders.length === 0" class="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed">
           <div class="text-4xl mb-2">🔍</div>
           <p>Aucune commande trouvée.</p>
        </div>
      </div>


      <div class="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left text-gray-500">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th scope="col" class="px-6 py-3">Réf</th>
                <th scope="col" class="px-6 py-3">Date</th>
                <th scope="col" class="px-6 py-3">Table</th>
                <th scope="col" class="px-6 py-3">Serveur</th>
                <th scope="col" class="px-6 py-3 text-center">Articles</th>
                <th scope="col" class="px-6 py-3 text-right">Total</th>
                <th scope="col" class="px-6 py-3 text-center">Statut</th>
                <th scope="col" class="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let order of filteredOrders" 
                  (click)="openDetails(order)"
                  class="bg-white border-b hover:bg-blue-50 cursor-pointer transition-colors group">
                <td class="px-6 py-4 font-medium text-gray-900 group-hover:text-blue-700">{{ order.id }}</td>
                <td class="px-6 py-4">
                  {{ order.date | date:'dd/MM/yyyy' }} <span class="text-gray-400 ml-1 text-xs">{{ order.date | date:'HH:mm' }}</span>
                </td>
                <td class="px-6 py-4 font-bold text-gray-800">{{ order.table }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold border">
                      {{ order.server.charAt(0) }}
                    </div>
                    {{ order.server }}
                  </div>
                </td>
                <td class="px-6 py-4 text-center">{{ order.itemsCount }}</td>
                <td class="px-6 py-4 font-bold text-gray-900 text-right">{{ order.total | currency:'EUR' }}</td>
                <td class="px-6 py-4 text-center">
                  <span [class]="getStatusColor(order.status) + ' px-2.5 py-0.5 rounded-full text-xs font-medium border'">
                    {{ order.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right text-gray-400 group-hover:text-blue-500">
                  👁️ Détails
                </td>
              </tr>
              
              <tr *ngIf="filteredOrders.length === 0">
                <td colspan="8" class="px-6 py-10 text-center text-gray-400">
                  Aucune commande trouvée.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div *ngIf="selectedOrder" class="fixed inset-0 z-50 overflow-y-auto px-4 py-6 md:py-10 flex items-center justify-center">
        <div class="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm" (click)="closeDetails()"></div>
        
        <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
            
            <div class="bg-indigo-900 px-6 py-4 flex justify-between items-center shrink-0">
              <div>
                <h3 class="text-xl font-bold text-white flex items-center gap-2">
                   Commande #{{ selectedOrder.id }}
                </h3>
                <p class="text-indigo-200 text-xs mt-1">
                   {{ selectedOrder.date | date:'dd MMMM yyyy à HH:mm' }}
                </p>
              </div>
              <button (click)="closeDetails()" class="text-indigo-200 hover:text-white text-3xl leading-none">&times;</button>
            </div>

            <div class="p-6 overflow-y-auto">
               
               <div class="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
                  <div class="text-sm">
                    <span class="block text-gray-500 text-xs uppercase font-bold">Table</span>
                    <span class="font-bold text-gray-800 text-lg">{{ selectedOrder.table }}</span>
                  </div>
                  <div class="text-sm text-right">
                    <span class="block text-gray-500 text-xs uppercase font-bold">Serveur</span>
                    <span class="font-bold text-gray-800">{{ selectedOrder.server }}</span>
                  </div>
                  <div class="text-sm text-right">
                    <span class="block text-gray-500 text-xs uppercase font-bold">Statut</span>
                    <span [class]="getStatusColor(selectedOrder.status) + ' px-2 py-0.5 rounded text-xs font-bold'">
                      {{ selectedOrder.status }}
                    </span>
                  </div>
               </div>

               <h4 class="font-bold text-gray-700 mb-3 border-b pb-2">Détail des articles</h4>
               
               <div class="space-y-3 mb-6">
                  <div *ngFor="let item of selectedOrder.items" class="flex justify-between items-center">
                     <div class="flex items-center gap-3">
                        <span class="bg-indigo-100 text-indigo-700 font-bold w-6 h-6 flex items-center justify-center rounded text-xs">
                          {{ item.quantity }}
                        </span>
                        <span class="text-gray-800 font-medium">{{ item.name }}</span>
                     </div>
                     <div class="text-gray-600 font-medium">
                        {{ item.price * item.quantity | currency:'EUR' }}
                     </div>
                  </div>
               </div>

               <div class="flex justify-between items-center pt-4 border-t border-gray-200 mt-4">
                  <span class="text-lg font-bold text-gray-800">Total</span>
                  <span class="text-2xl font-extrabold text-indigo-700">{{ selectedOrder.total | currency:'EUR' }}</span>
               </div>

            </div>

            <div class="bg-gray-50 px-6 py-4 flex justify-end shrink-0 border-t border-gray-200">
               <button (click)="closeDetails()" class="bg-white border border-gray-300 text-gray-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-100 transition">
                 Fermer
               </button>
            </div>
        </div>
      </div>

    </div>
  `
})
export class HistoryComponent implements OnInit {
  
  // Données simulées AVEC DÉTAILS (items)
  allOrders: OrderHistory[] = [
    { 
      id: 'CMD-001', 
      date: new Date('2023-12-14T12:30:00'), 
      table: '12', 
      server: 'Ali', 
      total: 45.500, 
      status: 'Payée', 
      itemsCount: 4,
      items: [
        { name: 'Pizza 4 Fromages', quantity: 2, price: 18.0 },
        { name: 'Coca-Cola', quantity: 2, price: 3.5 },
        { name: 'Eau', quantity: 1, price: 2.5 }
      ]
    },
    { 
      id: 'CMD-002', 
      date: new Date('2023-12-14T12:45:00'), 
      table: '05', 
      server: 'Sarra', 
      total: 12.000, 
      status: 'En cours', 
      itemsCount: 2,
      items: [
        { name: 'Salade César', quantity: 1, price: 12.0 }
      ]
    },
    { 
      id: 'CMD-003', 
      date: new Date('2023-12-14T13:10:00'), 
      table: '08', 
      server: 'Mohamed', 
      total: 85.000, 
      status: 'Payée', 
      itemsCount: 8,
      items: [
        { name: 'Entrecôte Grillée', quantity: 2, price: 25.0 },
        { name: 'Vin Rouge', quantity: 1, price: 25.0 },
        { name: 'Tiramisu', quantity: 2, price: 5.0 }
      ]
    },
    { 
      id: 'CMD-004', 
      date: new Date('2023-12-13T13:15:00'), 
      table: '12', 
      server: 'Ali', 
      total: 0.000, 
      status: 'Annulée', 
      itemsCount: 0,
      items: []
    },
    { 
      id: 'CMD-005', 
      date: new Date('2023-12-13T13:30:00'), 
      table: 'Terrasse-1', 
      server: 'Sarra', 
      total: 22.500, 
      status: 'En cours', 
      itemsCount: 3,
      items: [
         { name: 'Ojja', quantity: 1, price: 15.0 },
         { name: 'Thé', quantity: 2, price: 3.75 }
      ]
    },
    { 
      id: 'CMD-006', 
      date: new Date('2023-12-12T19:00:00'), 
      table: 'VIP-2', 
      server: 'Mohamed', 
      total: 120.000, 
      status: 'Payée', 
      itemsCount: 12,
      items: [
        { name: 'Plateau Fruits de Mer', quantity: 1, price: 80.0 },
        { name: 'Vin Blanc', quantity: 1, price: 40.0 }
      ]
    },
  ];

  filteredOrders: OrderHistory[] = [];
  tables: string[] = [];
  servers: string[] = [];

  // Filtres
  filterTable: string = '';
  filterServer: string = '';
  filterStartDate: string = '';
  filterEndDate: string = '';

  // État de la modale
  selectedOrder: OrderHistory | null = null;

  ngOnInit(): void {
    this.filteredOrders = this.allOrders;
    this.tables = [...new Set(this.allOrders.map(o => o.table))].sort();
    this.servers = [...new Set(this.allOrders.map(o => o.server))].sort();
  }

  // --- ACTIONS MODALE ---
  openDetails(order: OrderHistory) {
    this.selectedOrder = order;
  }

  closeDetails() {
    this.selectedOrder = null;
  }

  // --- FILTRES ---
  applyFilters() {
    this.filteredOrders = this.allOrders.filter(order => {
      const matchTable = this.filterTable ? order.table === this.filterTable : true;
      const matchServer = this.filterServer ? order.server === this.filterServer : true;
      
      let matchDate = true;
      const orderDateStr = order.date.toISOString().split('T')[0];
      
      if (this.filterStartDate && orderDateStr < this.filterStartDate) matchDate = false;
      if (this.filterEndDate && orderDateStr > this.filterEndDate) matchDate = false;

      return matchTable && matchServer && matchDate;
    });
  }

  resetFilters() {
    this.filterTable = '';
    this.filterServer = '';
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.applyFilters();
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'Payée': return 'bg-green-100 text-green-800 border-green-200';
      case 'En cours': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Annulée': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
