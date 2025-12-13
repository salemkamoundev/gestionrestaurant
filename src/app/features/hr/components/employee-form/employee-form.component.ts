import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HrService } from '../../../../core/services/hr.service';
import { UserProfile } from '../../../../core/models/interfaces';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">
        {{ isEditMode ? 'Modifier la fiche employé' : 'Nouveau membre du personnel' }}
      </h2>
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nom Complet</label>
            <input formControlName="displayName" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Email (Connexion)</label>
            <input formControlName="email" type="email" [readonly]="isEditMode" [class.bg-gray-100]="isEditMode" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
          </div>
        </div>

        <div *ngIf="!isEditMode">
            <label class="block text-sm font-medium text-gray-700">Mot de passe provisoire</label>
            <input formControlName="password" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-yellow-50" placeholder="Minimum 6 caractères">
            <p class="text-xs text-gray-500 mt-1">Donnez ce mot de passe à l'employé.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
            <label class="block text-sm font-medium text-gray-700">Téléphone</label>
            <input formControlName="phone" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
          </div>
           <div>
              <label class="block text-sm font-medium text-gray-700">Rôle Système</label>
              <select formControlName="role" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white">
                  <option value="staff">Staff (Pas d'accès ou limité)</option>
                  <option value="server">Serveur (Accès POS)</option>
                  <option value="admin">Admin (Gestion)</option>
                  <option value="super_admin">Super Admin (Tout)</option>
              </select>
          </div>
        </div>

        <div class="flex justify-end pt-4 border-t gap-3">
          <button type="button" (click)="cancel()" class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
             Annuler
          </button>
          <button type="submit" [disabled]="form.invalid || isLoading" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
             {{ isLoading ? 'Enregistrement...' : (isEditMode ? 'Mettre à jour' : 'Créer le compte') }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class EmployeeFormComponent implements OnInit {
  fb = inject(FormBuilder);
  hrService = inject(HrService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  isEditMode = false;
  employeeId: string | null = null;
  isLoading = false;

  form = this.fb.group({
    displayName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: [''], 
    phone: [''],
    // jobTitle supprimé
    role: ['staff', Validators.required]
  });

  ngOnInit() {
    this.employeeId = this.route.snapshot.paramMap.get('id');
    
    if (this.employeeId) {
      this.isEditMode = true;
      this.form.get('password')?.disable();
      this.form.get('email')?.disable();
      this.loadEmployee(this.employeeId);
    } else {
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
  }

  loadEmployee(id: string) {
    this.hrService.getEmployee(id).subscribe(emp => {
      if (emp) {
        this.form.patchValue({
          displayName: emp.displayName,
          email: emp.email,
          phone: emp.phone,
          // jobTitle supprimé
          role: emp.role || 'staff'
        });
      }
    });
  }

  async onSubmit() {
    if (this.form.valid) {
      this.isLoading = true;
      const formVal = this.form.getRawValue();

      const safeDisplayName = formVal.displayName || '';
      const safeEmail = formVal.email || '';
      const safePhone = formVal.phone || undefined; 
      const safeRole = (formVal.role || 'staff') as any;

      try {
        if (this.isEditMode && this.employeeId) {
          // UPDATE
          await this.hrService.updateEmployee(this.employeeId, {
            displayName: safeDisplayName,
            phone: safePhone,
            role: safeRole
          });
        } else {
          // CREATE
          await this.hrService.createEmployeeWithAuth({
              uid: '',
              email: safeEmail,
              displayName: safeDisplayName,
              phone: safePhone,
              role: safeRole,
              createdAt: new Date()
          }, formVal.password!); 
          
          alert(`Compte créé pour ${safeEmail} !`);
        }
        
        this.router.navigate(['/hr/employees']);
      } catch (e: any) {
        console.error(e);
        alert("Erreur : " + (e.message || e));
      } finally {
        this.isLoading = false;
      }
    }
  }

  cancel() {
    this.router.navigate(['/hr/employees']);
  }
}
