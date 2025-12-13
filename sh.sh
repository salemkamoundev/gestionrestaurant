#!/bin/bash

# ==========================================
# UPDATE: TABLE STATUS & PAYMENT FLAGS
# ==========================================

set -e

echo "🚩 Ajout de la gestion Statut & Paiement sur les tables..."

# 1. Mise à jour de l'interface (Ajout de paymentStatus)
cat <<'EOF' > src/app/core/models/interfaces.ts
export type UserRole = 'super_admin' | 'admin' | 'server' | 'staff';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  jobTitle?: string;
  phone?: string;
  createdAt: Date | any;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  unit: 'kg' | 'l' | 'piece';
  quantity: number;
  minThreshold: number; 
  costPrice: number;    
  updatedAt: Date | any;
}

export interface Ingredient {
  productId: string; 
  quantity: number;  
}

export interface Dish {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category: 'starter' | 'main' | 'dessert' | 'drink';
  ingredients: Ingredient[]; 
  isAvailable: boolean;
}

export interface OrderItem {
  dishId: string;
  dishName: string;
  quantity: number;
  price: number;
  status: 'pending' | 'cooking' | 'served';
}

export interface Order {
  id: string;
  tableId: string; 
  serverName: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'open' | 'closed' | 'cancelled';
  createdAt: any; 
  closedAt?: any;
}

export interface Table {
  id: string;
  number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  currentOrderId?: string;
  paymentStatus?: 'pending' | 'paid'; // NOUVEAU CHAMP
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: 'salary' | 'rent' | 'purchase' | 'utilities' | 'other';
  date: any;
  createdBy: string;
}

export interface Invoice {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'check';
  date: any;
}
EOF

# 2. Mise à jour du TableGridComponent
# Ajout de la logique "Modale d'action" et des indicateurs visuels
cat <<'EOF' > src/app/features/pos/components/table-grid/table-grid.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrderService } from '../../../../core/services/order.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Observable, map } from 'rxjs';
import { Table, UserProfile } from '../../../../core/models/interfaces';

@Component({
  selector: 'app-table-grid',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-6 bg-gray-50 min-h-screen">
      
      <div class="flex justify-between items-center mb-8">
        <div>
          <h2 class="text-3xl font-bold text-gray-800">Salle & Tables</h2>
          <p class="text-gray-500">Gérez l'occupation et les paiements</p>
        </div>

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

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        
        <button *ngIf="isEditMode" (click)="openModal()" 
                class="h-40 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col justify-center items-center text-gray-400 hover:border-indigo-500 hover:text-indigo-500 hover:bg-white transition bg-gray-50">
           <span class="text-4xl mb-2">+</span>
           <span class="font-medium">Ajouter Table</span>
        </button>

        <div *ngFor="let table of tables$ | async" class="relative group">
          
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
              'bg-blue-500': table.status === 'occupied' && table.paymentStatus === 'paid',
              'bg-yellow-500': table.status === 'reserved'
            }" class="absolute top-4 left-4 w-3 h-3 rounded-full animate-pulse"></div>

            <div *ngIf="table.status === 'occupied' && table.paymentStatus === 'paid'" 
                 class="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg shadow-sm z-10">
               💰 PAYÉ
            </div>

             <div *ngIf="table.status === 'occupied' && (!table.paymentStatus || table.paymentStatus === 'pending')" 
                 class="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg shadow-sm z-10">
               ⏳ EN COURS
            </div>

            <span class="text-3xl font-extrabold text-gray-800">
               {{ table.number }}
            </span>
            
            <div class="flex items-center gap-1 mt-2 text-gray-400 text-sm">
               <span>👥</span>
               <span>{{ table.capacity }} pers.</span>
            </div>

          </button>
        </div>
      </div>

      <div *ngIf="!isEditMode" class="mt-12 border-t pt-8">
         <button (click)="goToTakeaway()" class="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl shadow-lg font-bold text-lg flex items-center justify-center gap-3">
            <span>🛍️</span> Commande à emporter
         </button>
      </div>

      <div *ngIf="actionTable" class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" (click)="closeActionModal()"></div>

          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

          <div class="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
            
            <div class="bg-gray-800 px-4 py-3 sm:px-6">
              <h3 class="text-xl font-bold text-white flex items-center gap-2">
                Table {{ actionTable.number }}
                <span class="text-xs font-normal bg-gray-600 px-2 py-1 rounded">{{ actionTable.status | uppercase }}</span>
              </h3>
            </div>

            <div class="p-6 space-y-3">
              
              <button (click)="goToOrder(actionTable)" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2">
                 📝 Voir / Modifier la commande
              </button>

              <div class="border-t my-2"></div>

              <button *ngIf="actionTable.status === 'occupied' && actionTable.paymentStatus !== 'paid'" 
                      (click)="markAsPaid(actionTable)" 
                      class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2">
                 💰 Marquer comme Payé
              </button>

              <button *ngIf="actionTable.status === 'occupied' && actionTable.paymentStatus === 'paid'" 
                      (click)="markAsPending(actionTable)" 
                      class="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2">
                 ↩️ Annuler paiement
              </button>

              <button (click)="freeTable(actionTable)" 
                      class="w-full bg-white border-2 border-red-500 text-red-600 hover:bg-red-50 font-bold py-3 rounded-lg flex justify-center items-center gap-2 mt-4">
                 🧹 Libérer la table (Terminer)
              </button>

            </div>

            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="button" (click)="closeActionModal()" class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:ml-3 sm:w-auto sm:text-sm">
                Fermer
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
                {{ editingTableId ? 'Modifier la table' : 'Nouvelle table' }}
              </h3>
            </div>
            <form [formGroup]="tableForm" (ngSubmit)="onSubmit()" class="px-4 pt-5 pb-4 sm:p-6">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Numéro</label>
                  <input type="text" formControlName="number" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                </div>
                <div>
                   <label class="block text-sm font-medium text-gray-700">Capacité</label>
                   <input type="number" formControlName="capacity" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                </div>
              </div>
              <div class="mt-6 flex justify-end gap-3">
                <button type="button" (click)="closeModal()" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Annuler</button>
                <button type="submit" [disabled]="tableForm.invalid" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      </div>

    </div>
  `
})
export class TableGridComponent {
  orderService = inject(OrderService);
  authService = inject(AuthService);
  router = inject(Router);
  fb = inject(FormBuilder);

  tables$: Observable<Table[]> = this.orderService.getTables();
  canEdit$: Observable<boolean> = this.authService.user$.pipe(map(u => u?.role === 'admin' || u?.role === 'super_admin'));

  isEditMode = false;
  showModal = false;
  editingTableId: string | null = null;
  
  // Table sélectionnée pour l'action (Occupée)
  actionTable: Table | null = null;

  tableForm = this.fb.group({
    number: ['', Validators.required],
    capacity: [4, [Validators.required, Validators.min(1)]]
  });

  toggleEditMode() { this.isEditMode = !this.isEditMode; }

  onTableClick(table: Table) {
    if (this.isEditMode) {
      // MODE EDITION
      this.editingTableId = table.id;
      this.tableForm.patchValue({ number: table.number, capacity: table.capacity });
      this.showModal = true;
    } else {
      // MODE SERVICE
      if (table.status === 'available') {
        // Nouvelle commande -> On va directement à la caisse
        this.goToOrder(table);
      } else {
        // Table occupée -> On ouvre la modale d'action (Payer / Libérer)
        this.actionTable = table;
      }
    }
  }

  // --- ACTIONS MODAL ---
  closeActionModal() { this.actionTable = null; }

  goToOrder(table: Table) {
    this.router.navigate(['/pos/order'], { queryParams: { tableId: table.id, tableNumber: table.number } });
    this.closeActionModal();
  }

  async markAsPaid(table: Table) {
    if(confirm('Marquer cette table comme PAYÉE ?')) {
      await this.orderService.updateTable(table.id, { paymentStatus: 'paid' });
      this.closeActionModal();
    }
  }

  async markAsPending(table: Table) {
    await this.orderService.updateTable(table.id, { paymentStatus: 'pending' });
    this.closeActionModal();
  }

  async freeTable(table: Table) {
    if(confirm('Libérer la table ? (Cela clôturera la session de table)')) {
      await this.orderService.updateTable(table.id, { 
        status: 'available', 
        paymentStatus: 'pending', // Reset
        currentOrderId: '' // Reset
      });
      this.closeActionModal();
    }
  }

  // --- CRUD TABLES ---
  openModal() {
    this.editingTableId = null;
    this.tableForm.reset({ capacity: 4 });
    this.showModal = true;
  }
  closeModal() { this.showModal = false; this.editingTableId = null; }
  
  async onSubmit() {
    if (this.tableForm.valid) {
      const data = this.tableForm.value as any;
      if (this.editingTableId) await this.orderService.updateTable(this.editingTableId, data);
      else await this.orderService.addTable({ ...data, status: 'available' });
      this.closeModal();
    }
  }
  async deleteTable(id: string) {
    if (confirm('Supprimer cette table ?')) await this.orderService.deleteTable(id);
  }
  goToTakeaway() {
    this.router.navigate(['/pos/order'], { queryParams: { tableId: 'takeaway' } });
  }
}
EOF

echo "✅ Gestion Statut & Paiement activée."
echo "👉 Instructions :"
echo "   1. Clique sur une table libre pour commander."
echo "   2. La table devient 'EN COURS' (Rouge)."
echo "   3. Clique sur la table occupée : Une modale s'ouvre."
echo "   4. Clique sur 'Marquer comme Payé' : Elle devient 'PAYÉ' (Verte avec drapeau)."
echo "   5. Quand les clients partent, clique sur 'Libérer la table'."