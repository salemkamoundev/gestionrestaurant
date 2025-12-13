import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HrService } from '../../../../core/services/hr.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-white rounded-lg shadow-md">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">👥 Liste des Employés</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div *ngFor="let emp of employees$ | async" class="flex items-center p-4 border rounded-lg hover:shadow-md transition">
          <div class="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl mr-4">
            {{ emp.displayName?.charAt(0) || 'U' }}
          </div>
          <div>
            <h3 class="font-bold text-gray-900">{{ emp.displayName }}</h3>
            <p class="text-sm text-gray-500">{{ emp.email }}</p>
            <span class="inline-block mt-1 px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-800 uppercase font-semibold">
              {{ emp.role }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EmployeeListComponent {
  hrService = inject(HrService);
  employees$ = this.hrService.getEmployees();
}
