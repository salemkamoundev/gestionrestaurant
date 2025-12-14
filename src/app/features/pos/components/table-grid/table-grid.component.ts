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
  template: `
    <div class="p-4 md:p-6 bg-gray-50 min-h-screen">
      
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 class="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <span *ngIf="!selectedZone" class="text-3xl">🏢</span>
            <span *ngIf="selectedZone" (click)="clearZoneSelection()" class="cursor-pointer hover:text-indigo-600 transition">
               🏢
            </span>
            <span *ngIf="selectedZone" class="text-gray-400 mx-1">/</span>
            <span *ngIf="selectedZone" class="text-indigo-600 truncate max-w-[200px]">{{ selectedZone }}</span>
          </h2>
          <p class="text-sm text-gray-500 mt-1">
            {{ selectedZone ? 'Tables de cet espace' : 'Sélectionnez une salle' }}
          </p>
        </div>

        <div class="flex flex-wrap gap-2 w-full md:w-auto">
          <button *ngIf="selectedZone" (click)="clearZoneSelection()" 
                  class="flex-1 md:flex-none bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 font-medium">
            ⬅ Retour
          </button>

          <div *ngIf="canEdit$ | async" class="flex-1 md:flex-none flex items-center justify-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm border min-w-[160px]">
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

      <div *ngIf="!selectedZone" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-fadeIn">
        <button *ngIf="isEditMode" (click)="openZoneModal()" 
                class="h-40 md:h-48 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col justify-center items-center text-gray-400 hover:border-indigo-500 hover:text-indigo-500 hover:bg-white transition bg-gray-50 group">
           <span class="text-4xl md:text-5xl mb-3 group-hover:scale-110 transition-transform">🏗️</span>
           <span class="font-medium">Créer Salle</span>
        </button>

        <div *ngFor="let zone of zones$ | async" 
             (click)="selectZone(zone.name)"
             class="bg-white h-40 md:h-48 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer flex flex-col items-center justify-center relative overflow-hidden group active:scale-95">
          <div class="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span class="text-5xl md:text-6xl mb-3 md:mb-4 relative z-10">🛋️</span>
          <h3 class="text-lg md:text-xl font-bold text-gray-800 relative z-10">{{ zone.name }}</h3>
          <span class="text-sm text-gray-500 relative z-10 mt-1">{{ zone.count }} table(s)</span>
          <div *ngIf="zone.occupied > 0" class="absolute top-3 right-3 bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full border border-orange-200">
             {{ zone.occupied }}
          </div>
        </div>
      </div>

      <div *ngIf="selectedZone" class="animate-fadeIn pb-20">
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          <button *ngIf="isEditMode" (click)="openTableModal(selectedZone)" 
                  class="h-32 md:h-40 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col justify-center items-center text-gray-400 hover:border-indigo-500 hover:text-indigo-500 hover:bg-white transition bg-gray-50">
             <span class="text-3xl md:text-4xl mb-2">+</span>
             <span class="font-medium text-sm">Ajouter</span>
          </button>

          <div *ngFor="let table of currentTables$ | async" class="relative group">
            <button *ngIf="isEditMode" (click)="deleteTable(table.id)"
                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md z-10 hover:bg-red-600 transform hover:scale-110 transition">
               🗑️
            </button>

            <button (click)="onTableClick(table)"
                    [ngClass]="{
                      'bg-white border-gray-200 hover:border-indigo-500 hover:shadow-md': table.status === 'available',
                      'bg-red-50 border-red-200': table.status === 'occupied' && (!table.paymentStatus || table.paymentStatus === 'pending'),
                      'bg-green-50 border-green-200': table.status === 'occupied' && table.paymentStatus === 'paid',
                      'ring-2 ring-indigo-500 ring-offset-2': isEditMode
                    }"
                    class="w-full h-32 md:h-40 rounded-2xl border-2 flex flex-col justify-center items-center shadow-sm transition-all duration-200 relative overflow-hidden active:scale-95">
              
              <div [ngClass]="{
                'bg-green-500': table.status === 'available',
                'bg-red-500': table.status === 'occupied' && (!table.paymentStatus || table.paymentStatus === 'pending'),
                'bg-blue-500': table.status === 'occupied' && table.paymentStatus === 'paid'
              }" class="absolute top-3 left-3 w-2.5 h-2.5 rounded-full animate-pulse"></div>

              <div *ngIf="table.status === 'occupied' && table.paymentStatus === 'paid'" class="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg shadow-sm z-10">PAYÉ</div>
              <div *ngIf="table.status === 'occupied' && (!table.paymentStatus || table.paymentStatus === 'pending')" class="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg shadow-sm z-10">EN COURS</div>

              <span class="text-2xl md:text-3xl font-extrabold text-gray-800">{{ table.number }}</span>
              <div class="flex items-center gap-1 mt-1 text-gray-400 text-xs">
                 <span>👥</span><span>{{ table.capacity }}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="actionTable" class="fixed inset-0 z-50 overflow-y-auto px-4 py-6 md:py-10 flex items-center justify-center">
        <div class="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm" (click)="closeActionModal()"></div>
        <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div class="bg-indigo-900 px-6 py-4 flex justify-between items-center">
              <h3 class="text-xl font-bold text-white flex items-center gap-2">🍽️ Table {{ actionTable.number }}</h3>
              <button (click)="closeActionModal()" class="text-indigo-200 hover:text-white text-3xl leading-none">&times;</button>
            </div>
            <div class="p-6 space-y-3">
              <button (click)="goToOrder(actionTable)" class="w-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold py-3 rounded-xl flex items-center px-4 gap-3">
                 <span class="text-xl">📝</span> <div class="text-left"><div>Modifier</div><div class="text-xs font-normal">Ajouter des plats</div></div>
              </button>
              <button *ngIf="actionTable.status === 'occupied' && actionTable.paymentStatus !== 'paid'" (click)="markAsPaid(actionTable)" class="w-full bg-green-50 text-green-700 border border-green-200 font-bold py-3 rounded-xl flex items-center px-4 gap-3">
                 <span class="text-xl">💰</span> <div class="text-left"><div>Encaisser</div><div class="text-xs font-normal">Marquer comme payé</div></div>
              </button>
              <button (click)="freeTable(actionTable)" class="w-full bg-red-50 text-red-700 border border-red-200 font-bold py-3 rounded-xl flex items-center px-4 gap-3 mt-2">
                 <span class="text-xl">🏁</span> <div class="text-left"><div>Terminer</div><div class="text-xs font-normal">Libérer la table</div></div>
              </button>
            </div>
        </div>
      </div>

      <div *ngIf="showModal" class="fixed inset-0 z-50 overflow-y-auto px-4 py-6 flex items-center justify-center">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75" (click)="closeModal()"></div>
        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div class="bg-indigo-700 px-4 py-3"><h3 class="text-lg font-bold text-white">{{ isZoneMode ? 'Nouvelle Salle' : 'Gestion Table' }}</h3></div>
            <form [formGroup]="tableForm" (ngSubmit)="onSubmit()" class="p-6 space-y-4">
              
              <div>
                 <label class="block text-sm font-medium text-gray-700 mb-1">Salle</label>
                 
                 <input *ngIf="isZoneMode" type="text" formControlName="zone" class="w-full border-gray-300 rounded-lg p-2.5 border" placeholder="Nom de la salle">
                 
                 <div *ngIf="!isZoneMode">
                    <select formControlName="zone" class="w-full border-gray-300 rounded-lg p-2.5 border bg-white">
                      <option value="" disabled>-- Choisir une salle --</option>
                      <option *ngFor="let z of existingZoneNames" [value]="z">{{ z }}</option>
                    </select>
                 </div>
              </div>

              <div *ngIf="!isZoneMode" class="grid grid-cols-2 gap-4">
                <div><label class="block text-sm font-medium text-gray-700">N°</label><input type="text" formControlName="number" class="w-full border-gray-300 rounded-lg p-2 border"></div>
                <div><label class="block text-sm font-medium text-gray-700">Capacité</label><input type="number" formControlName="capacity" class="w-full border-gray-300 rounded-lg p-2 border"></div>
              </div>
              
              <div class="flex justify-end gap-3 pt-2">
                <button type="button" (click)="closeModal()" class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">Annuler</button>
                <button type="submit" [disabled]="tableForm.invalid" class="px-4 py-2 bg-indigo-600 text-white rounded-lg">Valider</button>
              </div>
            </form>
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

  allTables$: Observable<Table[]> = this.orderService.getTables();
  canEdit$: Observable<boolean> = this.authService.user$.pipe(map(u => u?.role === 'admin' || u?.role === 'super_admin'));

  isEditMode = false;
  showModal = false;
  isZoneMode = false;
  
  editingTableId: string | null = null;
  selectedZone: string | null = null;
  selectedZoneSubject = new BehaviorSubject<string | null>(null);
  existingZoneNames: string[] = [];
  
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

  onTableClick(table: Table) {
    if (this.isEditMode) {
      this.isZoneMode = false;
      this.editingTableId = table.id;
      this.tableForm.patchValue({ number: table.number, capacity: table.capacity, zone: table.zone || 'Salle Principale' });
      this.showModal = true;
    } else {
      if (table.status === 'available') {
        this.goToOrder(table);
      } else {
        this.actionTable = table;
      }
    }
  }

  closeActionModal() { this.actionTable = null; }

  goToOrder(table: Table) {
    this.router.navigate(['/pos/order'], { queryParams: { tableId: table.id, tableNumber: table.number } });
    this.closeActionModal();
  }

  async markAsPaid(table: Table) {
    await this.orderService.updateTable(table.id, { paymentStatus: 'paid' });
    this.closeActionModal();
  }

  async freeTable(table: Table) {
    if(confirm('Confirmez-vous que la table est débarrassée et le client parti ?')) {
      if (table.currentOrderId) {
        await this.orderService.updateOrder(table.currentOrderId, { status: 'closed', closedAt: new Date() });
      }
      await this.orderService.updateTable(table.id, { status: 'available', paymentStatus: 'pending', currentOrderId: '' });
      this.closeActionModal();
    }
  }

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
