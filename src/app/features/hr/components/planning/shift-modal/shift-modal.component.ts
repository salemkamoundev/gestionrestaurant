import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormArray, Validators } from '@angular/forms';

// CORRECTION : 5 niveaux de remontée (../../../../../)
import { UserProfile } from '../../../../../core/models/interfaces';
import { Shift } from '../../../../../core/services/hr.service';

@Component({
  selector: 'app-shift-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" (click)="close()"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          
          <div class="bg-indigo-700 px-4 py-3 sm:px-6">
            <h3 class="text-lg leading-6 font-medium text-white">
              {{ isEditMode ? 'Modifier le service' : 'Planifier un service' }}
            </h3>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">Employé</label>
              <select formControlName="userId" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white">
                <option *ngFor="let emp of employees" [value]="emp.uid">{{ emp.displayName }}</option>
              </select>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">Date</label>
              <input type="date" formControlName="date" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
            </div>

            <div class="mb-4">
              <div class="flex justify-between items-center mb-2">
                <label class="block text-sm font-medium text-gray-700">Horaires</label>
                <button *ngIf="!isEditMode" type="button" (click)="addSlot()" class="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200">
                  + Ajouter plage
                </button>
              </div>

              <div formArrayName="slots" class="space-y-2">
                <div *ngFor="let slot of slots.controls; let i=index" [formGroup]="getSlotGroup(i)" class="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200">
                  <div class="flex-1">
                    <span class="text-xs text-gray-500 block">Début</span>
                    <input type="time" formControlName="start" class="block w-full text-sm rounded border-gray-300 p-1">
                  </div>
                  <div class="flex-1">
                    <span class="text-xs text-gray-500 block">Fin</span>
                    <input type="time" formControlName="end" class="block w-full text-sm rounded border-gray-300 p-1">
                  </div>
                  <button type="button" (click)="removeSlot(i)" *ngIf="slots.length > 1 && !isEditMode" class="text-red-500 hover:text-red-700">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
            
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse -mx-6 -mb-4">
              <button type="submit" [disabled]="form.invalid" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                {{ isEditMode ? 'Mettre à jour' : 'Enregistrer' }}
              </button>
              <button type="button" (click)="close()" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ShiftModalComponent implements OnInit {
  @Input() employees: UserProfile[] = [];
  @Input() initialDate: Date = new Date();
  @Input() initialUserId: string = '';
  @Input() shiftToEdit: Shift | null = null;
  
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  fb = inject(FormBuilder);
  isEditMode = false;

  form = this.fb.group({
    userId: ['', Validators.required],
    date: ['', Validators.required],
    slots: this.fb.array([])
  });

  ngOnInit() {
    if (this.shiftToEdit) {
      this.isEditMode = true;
      const start = new Date(this.shiftToEdit.start);
      const end = new Date(this.shiftToEdit.end);

      // Helper pour le format HH:mm compatible input time
      const formatTime = (date: Date) => {
        const h = date.getHours().toString().padStart(2, '0');
        const m = date.getMinutes().toString().padStart(2, '0');
        return `${h}:${m}`; // Utilisation des backticks protégés si besoin, mais ici simple string
      };

      this.form.patchValue({
        userId: this.shiftToEdit.userId,
        date: start.toISOString().split('T')[0]
      });

      this.addSlot(formatTime(start), formatTime(end));

    } else {
      this.isEditMode = false;
      this.form.patchValue({
        userId: this.initialUserId,
        date: this.initialDate.toISOString().split('T')[0]
      });
      this.addSlot('10:00', '14:00');
    }
  }

  get slots() {
    return this.form.get('slots') as FormArray;
  }

  getSlotGroup(index: number) {
    return this.slots.at(index) as any;
  }

  addSlot(start = '18:00', end = '23:00') {
    const slotGroup = this.fb.group({
      start: [start, Validators.required],
      end: [end, Validators.required]
    });
    this.slots.push(slotGroup);
  }

  removeSlot(index: number) {
    this.slots.removeAt(index);
  }

  close() {
    this.cancel.emit();
  }

  onSubmit() {
    if (this.form.valid) {
      this.save.emit({ ...this.form.value, isEdit: this.isEditMode, originalId: this.shiftToEdit?.id });
    }
  }
}
