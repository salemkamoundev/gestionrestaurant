import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HrService } from '../../../../core/services/hr.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-4 md:p-6 bg-white rounded-lg shadow-md">
      
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 class="text-2xl font-bold text-gray-800">👥 Personnel & Accès</h2>
        <a routerLink="/hr/employees/new" class="w-full sm:w-auto text-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow flex items-center justify-center gap-2">
          <span>+ Ajouter un employé</span>
        </a>
      </div>

      <div class="md:hidden space-y-4">
        <div *ngFor="let emp of employees$ | async" class="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm relative">
            
            <div class="flex items-center gap-4 mb-3">
               <div class="flex-shrink-0 h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg border border-indigo-200">
                  {{ emp.displayName?.charAt(0) | uppercase }}
               </div>
               <div>
                  <h3 class="font-bold text-gray-900 text-lg leading-tight">{{ emp.displayName }}</h3>
                  <p class="text-sm text-gray-500 break-all">{{ emp.email }}</p>
               </div>
            </div>

            <div class="flex justify-between items-center mb-4 text-sm">
                <span [ngClass]="{
                  'bg-purple-100 text-purple-800': emp.role === 'super_admin',
                  'bg-blue-100 text-blue-800': emp.role === 'admin',
                  'bg-green-100 text-green-800': emp.role === 'server',
                  'bg-gray-100 text-gray-600': emp.role === 'staff'
                }" class="px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {{ emp.role }}
                </span>
                <span class="text-gray-500">{{ emp.phone || 'Aucun tél.' }}</span>
            </div>

            <div class="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
               <a [routerLink]="['/hr/employees/edit', emp.uid]" class="text-center bg-white border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50 font-medium text-sm">
                 ✏️ Modifier
               </a>
               <button (click)="deleteEmployee(emp.uid)" class="text-center bg-red-50 border border-red-200 text-red-600 py-2 rounded hover:bg-red-100 font-medium text-sm">
                 🗑️ Supprimer
               </button>
            </div>
        </div>
      </div>

      <div class="hidden md:block overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employé</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle Système</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let emp of employees$ | async">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                    {{ emp.displayName?.charAt(0) | uppercase }}
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ emp.displayName }}</div>
                    <div class="text-sm text-gray-500">{{ emp.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span [ngClass]="{
                  'bg-purple-100 text-purple-800': emp.role === 'super_admin',
                  'bg-blue-100 text-blue-800': emp.role === 'admin',
                  'bg-green-100 text-green-800': emp.role === 'server',
                  'bg-gray-100 text-gray-600': emp.role === 'staff'
                }" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full uppercase">
                  {{ emp.role }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ emp.phone || 'Non renseigné' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <a [routerLink]="['/hr/employees/edit', emp.uid]" class="text-indigo-600 hover:text-indigo-900 mr-4">Modifier</a>
                <button (click)="deleteEmployee(emp.uid)" class="text-red-600 hover:text-red-900">Supprimer</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class EmployeeListComponent {
  hrService = inject(HrService);
  employees$ = this.hrService.getEmployees();

  deleteEmployee(id: string) {
    if(confirm('Supprimer cette fiche employé ?')) {
      this.hrService.deleteEmployee(id);
    }
  }
}
