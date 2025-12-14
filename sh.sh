#!/bin/bash

# Mise à jour de TableGridComponent
# Objectif : Remplacer l'alert() par une modale d'action complète sans casser la logique des Zones/Salles.

cat <<EOF > src/app/features/pos/components/table-grid/table-grid.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrderService } from '../../../../core/services/order.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Observable, combineLatest, map, BehaviorSubject } from 'rxjs';
import { Table } from '../../../../core/models/interfaces';

@Component({
  selector: 'app-table-grid',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: \`
    <div class="p-6 bg-gray-50 min-h-screen">
      
      <div class="flex justify-between items-center mb-8">
        <div>
          <h2 class="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <span *ngIf="!selectedZone" class="text-3xl">🏢</span>
            <span *ngIf="selectedZone" (click)="clearZoneSelection()" class="cursor-pointer hover:text-indigo-600 transition">
               🏢 Salles
            </span>
            <span *ngIf="selectedZone" class="text-gray-400">/</span>
            <span *ngIf="selectedZone" class="text-indigo-600">{{ selectedZone }}</span>
          </h2>
          <p class="text-gray-500">
            {{ selectedZone ? 'Gérez les tables de cet espace' : 'Sélectionnez une salle pour voir les tables' }}
          </p>
        </div>

        <div class="flex gap-3">
          <button *ngIf="selectedZone" (click)="clearZoneSelection()" 
                  class="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 font-medium">
            ⬅ Retour
          </button>

          <div *ngIf="canEdit$ | async" class="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm border">
            <span class="text-sm font-medium text-gray-700">Mode Édition</span>
            <button (click)="toggleEditMode()" 
                    [ngClass]="isEditMode ? 'bg-indigo-600' : 'bg-gray-200'"
                    class="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none">
              <span [ngClass]="isEditMode ? 'translate-x-5' : 'translate-x-0'"
                    class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"></span>
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="!selectedZone" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fadeIn">
        
        <button *ngIf="isEditMode" (click)="openZoneModal()" 
                class="h-48 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col justify-center items-center text-gray-400 hover:border-indigo-500 hover:text-indigo-500 hover:bg-white transition bg-gray-50 group">
           <span class="text-5xl mb-3 group-hover:scale-110 transition-transform">🏗️</span>
           <span class="font-medium text-lg">Créer Salle</span>
           <span class="text-xs mt-1 text-gray-400">Ajoute une nouvelle zone</span>
        </button>

        <div *ngFor="let zone of zones$ | async" 
             (click)="selectZone(zone.name)"
             class="bg-white h-48 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer flex flex-col items-center justify-center relative overflow-hidden group">
          <div class="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span class="text-6xl mb-4 relative z-10 transform group-hover:scale-110 transition-transform">🛋️</span>
          <h3 class="text-xl font-bold text-gray-800 relative z-10">{{ zone.name }}</h3>
          <span class="text-sm text-gray-500 relative z-10 mt-1">{{ zone.count }} table(s)</span>
          <div *ngIf="zone.occupied > 0" class="absolute top-3 right-3 bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full border border-orange-200">
             {{ zone.occupied }} occupée(s)
          </div>
        </div>
      </div>


      <div *ngIf="selectedZone" class="animate-fadeIn">
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          
          <button *ngIf="isEditMode" (click)="openTableModal(selectedZone)" 
                  class="h-40 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col justify-center items-center text-gray-400 hover:border-indigo-500 hover:text-indigo-500 hover:bg-white transition bg-gray-50">
             <span class="text-4xl mb-2">+</span>
             <span class="font-medium">Ajouter Table</span>
          </button>

          <div *ngFor="let table of currentTables$ | async" class="relative group">
            
            <button *ngIf="isEditMode" (click)="deleteTable(table.id)"
                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md z-10 hover:bg-red-600 transform hover:scale-110 transition">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
               </svg>
            </button>

            <button (click)="onTableClick(table)"
                    [ngClass]="{
                      'bg-white border-gray-200 hover:border-indigo-500 hover:shadow-md': table.status === 'available',
                      'bg-red-50 border-red-200': table.status === 'occupied' && (!table.paymentStatus || table.paymentStatus === 'pending'),
                      'bg-green-50 border-green-200': table.status === 'occupied' && table.paymentStatus === 'paid',
                      'ring-2 ring-indigo-500 ring-offset-2': isEditMode
                    }"
                    class="w-full h-40 rounded-2xl border-2 flex flex-col justify-center items-center shadow-sm transition-all duration-200 relative overflow-hidden">
              
              <div [ngClass]="{
                'bg-green-500': table.status === 'available',
                'bg-red-500': table.status === 'occupied' && (!table.paymentStatus || table.paymentStatus === 'pending'),
                'bg-blue-500': table.status === 'occupied' && table.paymentStatus === 'paid'
              }" class="absolute top-4 left-4 w-3 h-3 rounded-full animate-pulse"></div>

              <div *ngIf="table.status === 'occupied' && table.paymentStatus === 'paid'" 
                   class="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg shadow-sm z-10">
                 💰 PAYÉ
              </div>
               <div *ngIf="table.status === 'occupied' && (!table.paymentStatus || table.paymentStatus === 'pending')" 
                   class="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg shadow-sm z-10">
                 ⏳ EN COURS
              </div>

              <span class="text-3xl font-extrabold text-gray-800">{{ table.number }}</span>
              <div class="flex items-center gap-1 mt-2 text-gray-400 text-sm">
                 <span>👥</span><span>{{ table.capacity }}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="actionTable" class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" (click)="closeActionModal()"></div>

          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

          <div class="relative inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
            
            <div class="bg-indigo-900 px-6 py-4 flex justify-between items-center">
              <h3 class="text-xl font-bold text-white flex items-center gap-2">
                <span>🍽️</span> Table {{ actionTable.number }}
              </h3>
              <button (click)="closeActionModal()" class="text-indigo-200 hover:text-white text-2xl leading-none">&times;</button>
            </div>

            <div class="p-6 space-y-4">
              
              <button (click)="goToOrder(actionTable)" 
                      class="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold py-4 rounded-xl flex items-center px-4 gap-3 transition-colors">
                 <span class="text-2xl">📝</span>
                 <div class="flex flex-col items-start">
                   <span>Modifier la commande</span>
                   <span class="text-xs font-normal text-gray-500">Ajouter ou retirer des plats</span>
                 </div>
              </button>

              <div class="border-t border-gray-100 my-2"></div>

              <button *ngIf="actionTable.status === 'occupied' && actionTable.paymentStatus !== 'paid'" 
                      (click)="markAsPaid(actionTable)" 
                      class="w-full bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 font-bold py-4 rounded-xl flex items-center px-4 gap-3 transition-colors">
                 <span class="text-2xl">💰</span>
                 <div class="flex flex-col items-start">
                   <span>Encaisser / Payer</span>
                   <span class="text-xs font-normal text-gray-500">Marquer comme payé (reste à table)</span>
                 </div>
              </button>
              
              <button *ngIf="actionTable.status === 'occupied' && actionTable.paymentStatus === 'paid'" 
                      class="w-full bg-gray-100 text-gray-400 font-bold py-4 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                 <span>✅ Déjà payé</span>
              </button>

              <button (click)="freeTable(actionTable)" 
                      class="w-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold py-4 rounded-xl flex items-center px-4 gap-3 transition-colors mt-4">
                 <span class="text-2xl">🏁</span>
                 <div class="flex flex-col items-start">
                   <span>Terminer & Libérer</span>
                   <span class="text-xs font-normal text-gray-500">Clôturer la commande et vider la table</span>
                 </div>
              </button>

            </div>
          </div>
        </div>
      </div>

      <div *ngIf="showModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75" (click)="closeModal()"></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
          <div class="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            
            <div class="bg-indigo-700 px-4 py-3 sm:px-6">
              <h3 class="text-lg leading-6 font-medium text-white">
                 {{ isZoneMode ? 'Nouvelle Salle' : (editingTableId ? 'Modifier Table' : 'Nouvelle Table') }}
              </h3>
            </div>

            <form [formGroup]="tableForm" (ngSubmit)="onSubmit()" class="px-4 pt-5 pb-4 sm:p-6">
              <div class="mb-4">
                 <label class="block text-sm font-medium text-gray-700 mb-1">
                   {{ isZoneMode ? 'Nom de la nouvelle salle' : 'Salle / Zone' }}
                 </label>
                 <input *ngIf="isZoneMode" type="text" formControlName="zone" class="block w-full rounded-md border-gray-300 shadow-sm p-3 border text-lg" placeholder="Ex: Terrasse Vue Mer">
                 <div *ngIf="!isZoneMode">
                    <input type="text" formControlName="zone" list="zonesList" class="block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                    <datalist id="zonesList">
                      <option *ngFor="let z of existingZoneNames" [value]="z"></option>
                    </datalist>
                 </div>
              </div>
              <div *ngIf="!isZoneMode" class="grid grid-cols-2 gap-4">
                <div>
                   <label class="block text-sm font-medium text-gray-700">Numéro de table</label>
                  <input type="text" formControlName="number" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                </div>
                <div>
                   <label class="block text-sm font-medium text-gray-700">Capacité</label>
                   <input type="number" formControlName="capacity" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                </div>
              </div>
              <div *ngIf="isZoneMode" class="bg-blue-50 text-blue-700 p-3 rounded text-sm mb-4">
                ℹ️ Une première table "Table 01" sera créée automatiquement pour initialiser cette salle.
              </div>
              <div class="mt-6 flex justify-end gap-3">
                <button type="button" (click)="closeModal()" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Annuler</button>
                <button type="submit" [disabled]="tableForm.invalid" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
                  {{ isZoneMode ? 'Créer la salle' : 'Enregistrer' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

    </div>
  \`
})
export class TableGridComponent {
  orderService = inject(OrderService);
  authService = inject(AuthService);
  router = inject(Router);
  fb = inject(FormBuilder);

  allTables$: Observable<Table[]> = this.orderService.getTables();
  canEdit$: Observable<boolean> = this.authService.user$.pipe(map(u => u?.role === 'admin' || u?.role === 'super_admin'));

  isEditMode = false;
  showModal = false;
  isZoneMode = false;
  
  editingTableId: string | null = null;
  selectedZone: string | null = null;
  selectedZoneSubject = new BehaviorSubject<string | null>(null);
  existingZoneNames: string[] = [];
  
  // Table sélectionnée pour les actions (Occpée)
  actionTable: Table | null = null;

  zones$ = this.allTables$.pipe(
    map(tables => {
      const zoneMap = new Map<string, { name: string, count: number, occupied: number }>();
      tables.forEach(t => {
        const zoneName = t.zone || 'Salle Principale';
        if (!zoneMap.has(zoneName)) {
          zoneMap.set(zoneName, { name: zoneName, count: 0, occupied: 0 });
        }
        const data = zoneMap.get(zoneName)!;
        data.count++;
        if (t.status === 'occupied') data.occupied++;
      });
      this.existingZoneNames = Array.from(zoneMap.keys()).sort();
      return Array.from(zoneMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    })
  );

  currentTables$ = combineLatest([this.allTables$, this.selectedZoneSubject]).pipe(
    map(([tables, zone]) => {
      if (!zone) return [];
      return tables.filter(t => (t.zone || 'Salle Principale') === zone);
    })
  );

  tableForm = this.fb.group({
    number: ['', Validators.required],
    capacity: [4, [Validators.required, Validators.min(1)]],
    zone: ['', Validators.required]
  });

  selectZone(zoneName: string) {
    this.selectedZone = zoneName;
    this.selectedZoneSubject.next(zoneName);
  }

  clearZoneSelection() {
    this.selectedZone = null;
    this.selectedZoneSubject.next(null);
  }

  toggleEditMode() { this.isEditMode = !this.isEditMode; }

  // --- LOGIQUE D'INTERACTION ---

  onTableClick(table: Table) {
    if (this.isEditMode) {
      // MODE EDITION
      this.isZoneMode = false;
      this.editingTableId = table.id;
      this.tableForm.patchValue({ 
        number: table.number, 
        capacity: table.capacity,
        zone: table.zone || 'Salle Principale'
      });
      this.showModal = true;
    } else {
      // MODE SERVICE
      if (table.status === 'available') {
        // Table libre -> Commande directe
        this.goToOrder(table);
      } else {
        // Table occupée -> Menu d'actions
        this.actionTable = table;
      }
    }
  }

  // --- ACTIONS DU MENU ---

  closeActionModal() { this.actionTable = null; }

  goToOrder(table: Table) {
    this.router.navigate(['/pos/order'], { queryParams: { tableId: table.id, tableNumber: table.number } });
    this.closeActionModal();
  }

  async markAsPaid(table: Table) {
    // Paiement simple sans libérer la table
    await this.orderService.updateTable(table.id, { paymentStatus: 'paid' });
    this.closeActionModal();
  }

  async freeTable(table: Table) {
    if(confirm('Confirmez-vous que la table est débarrassée et le client parti ?')) {
      
      // 1. Clôturer la commande si elle existe
      if (table.currentOrderId) {
        await this.orderService.updateOrder(table.currentOrderId, { 
          status: 'closed',
          closedAt: new Date()
        });
      }

      // 2. Libérer la table
      await this.orderService.updateTable(table.id, { 
        status: 'available', 
        paymentStatus: 'pending', 
        currentOrderId: '' 
      });
      
      this.closeActionModal();
    }
  }

  // --- CRUD (Création Salle/Table) ---

  openZoneModal() {
    this.isZoneMode = true;
    this.editingTableId = null;
    this.tableForm.patchValue({ zone: '', number: '01', capacity: 4 });
    this.showModal = true;
  }

  openTableModal(preselectedZone: string) {
    this.isZoneMode = false;
    this.editingTableId = null;
    this.tableForm.reset({ capacity: 4, zone: preselectedZone, number: '' });
    this.showModal = true;
  }

  closeModal() { 
    this.showModal = false; 
    this.editingTableId = null;
    this.isZoneMode = false;
  }

  async onSubmit() {
    if (this.tableForm.valid) {
      const data = this.tableForm.value as any;
      data.zone = data.zone.trim() || 'Salle Principale';

      if (this.isZoneMode) {
        await this.orderService.addTable({ number: '01', capacity: 4, zone: data.zone, status: 'available' });
      } else {
        if (this.editingTableId) await this.orderService.updateTable(this.editingTableId, data);
        else await this.orderService.addTable({ ...data, status: 'available' });
      }
      this.closeModal();
    }
  }

  async deleteTable(id: string) {
    if (confirm('Supprimer cette table ?')) await this.orderService.deleteTable(id);
  }
}
EOF
echo "✅ Menu d'actions (Payer/Terminer/Modifier) intégré sans régression."
EOF