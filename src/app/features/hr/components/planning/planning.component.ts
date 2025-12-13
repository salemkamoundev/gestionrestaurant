import { Component, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HrService, Shift } from '../../../../core/services/hr.service';
import { ShiftModalComponent } from './shift-modal/shift-modal.component';
import { DataSet } from 'vis-data'; 
import { Timeline } from 'vis-timeline';
import { firstValueFrom } from 'rxjs';
import { UserProfile } from '../../../../core/models/interfaces';

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule, ShiftModalComponent],
  template: `
    <div class="p-6 bg-white rounded-lg shadow-md h-[calc(100vh-100px)] flex flex-col relative">
      
      <div class="flex justify-between items-center mb-4">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">📅 Planning Interactif</h2>
          <div class="text-sm text-gray-500 flex gap-4 mt-1">
             <span class="flex items-center gap-1">👀 Vue par défaut : <b>2 Semaines</b></span>
             <span class="flex items-center gap-1">🖱️ <b>Scroll</b> pour zoomer/dézoomer</span>
          </div>
        </div>
        <div class="flex gap-2">
           <button (click)="openModal()" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 shadow flex items-center gap-2">
             <span>+ Nouveau Shift</span>
           </button>
           <button (click)="loadData()" class="text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded border">Rafraîchir</button>
        </div>
      </div>
      
      <div #timelineContainer class="flex-1 border rounded bg-gray-50 w-full"></div>

      <app-shift-modal 
        *ngIf="showModal"
        [employees]="employees"
        [initialDate]="selectedDate"
        [initialUserId]="selectedUserId"
        [shiftToEdit]="selectedShiftToEdit"
        (save)="onSaveShift($event)"
        (cancel)="closeModal()">
      </app-shift-modal>
    </div>
  `
})
export class PlanningComponent implements AfterViewInit {
  @ViewChild('timelineContainer') container!: ElementRef;
  
  hrService = inject(HrService);
  timeline: any;
  
  employees: UserProfile[] = [];
  shifts: Shift[] = [];

  showModal = false;
  selectedDate = new Date();
  selectedUserId = '';
  selectedShiftToEdit: Shift | null = null;

  async ngAfterViewInit() {
    setTimeout(() => this.loadData(), 100);
  }

  async loadData() {
    this.employees = await firstValueFrom(this.hrService.getEmployees());
    const shiftsData = await firstValueFrom(this.hrService.getShifts());
    this.shifts = shiftsData;

    const groups = new DataSet(
      this.employees.map(emp => ({ 
        id: emp.uid, 
        content: `<span class="font-bold">${emp.displayName}</span>`
      }))
    );

    const items = new DataSet(
      this.shifts.map(shift => ({
        id: shift.id,
        group: shift.userId,
        start: shift.start,
        end: shift.end,
        content: shift.role,
        type: 'range',
        style: 'background-color: #e0e7ff; border-color: #4338ca; color: #3730a3; border-radius: 4px; cursor: move;'
      }))
    );

    // CONFIGURATION DES DATES (C'est ici qu'on change la vue)
    const today = new Date();
    // On commence à minuit aujourd'hui pour être propre
    today.setHours(0,0,0,0);
    
    const twoWeeksLater = new Date(today.getTime() + 1000 * 60 * 60 * 24 * 14); // +14 Jours

    const options = {
      stack: false,
      start: today,       // Début : Aujourd'hui
      end: twoWeeksLater, // Fin : Dans 2 semaines
      
      editable: {
        add: false,
        remove: true,
        updateTime: true,
        updateGroup: true
      },
      orientation: 'top',
      locale: 'fr',
      
      // CONFIGURATION DU ZOOM
      zoomMin: 1000 * 60 * 60 * 12,    // Zoom min : 12 heures (pour voir le détail)
      zoomMax: 1000 * 60 * 60 * 24 * 31, // Zoom max : 31 jours (pour dézoomer assez large)
      
      onAdd: (item: any, callback: any) => { callback(null); },

      onMove: async (item: any, callback: any) => {
        const updatedShift = {
            start: new Date(item.start).toISOString(),
            end: new Date(item.end).toISOString(),
            userId: item.group
        };
        await this.hrService.updateShift(item.id, updatedShift);
        callback(item);
      },

      onRemove: async (item: any, callback: any) => {
        if(confirm('Supprimer ce créneau ?')) {
          await this.hrService.deleteShift(item.id);
          callback(item);
        } else {
          callback(null);
        }
      }
    };

    if (this.timeline) {
      this.timeline.setOptions(options); // Mise à jour des options si existe déjà
      this.timeline.setData({ groups, items });
      // Force le cadrage sur la fenêtre demandée
      this.timeline.setWindow(today, twoWeeksLater);
    } else {
      this.timeline = new Timeline(this.container.nativeElement as HTMLElement, items, groups, options);
      
      this.timeline.on('doubleClick', (props: any) => {
        if (props.item) {
          const shift = this.shifts.find(s => s.id === props.item);
          if (shift) {
            this.selectedShiftToEdit = shift;
            this.showModal = true;
          }
        } 
        else if (props.what === 'background' || props.what === 'group-label') {
          this.selectedDate = props.snappedTime;
          this.selectedUserId = props.group;
          this.selectedShiftToEdit = null;
          this.showModal = true;
        }
      });
    }
  }

  openModal() {
    this.selectedDate = new Date();
    this.selectedUserId = this.employees[0]?.uid || '';
    this.selectedShiftToEdit = null;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedShiftToEdit = null;
  }

  async onSaveShift(formData: any) {
    this.showModal = false;
    const baseDateStr = formData.date;

    if (formData.isEdit && formData.originalId) {
        const slot = formData.slots[0];
        const startDateTime = new Date(`${baseDateStr}T${slot.start}:00`);
        const endDateTime = new Date(`${baseDateStr}T${slot.end}:00`);
        
        await this.hrService.updateShift(formData.originalId, {
            userId: formData.userId,
            start: startDateTime.toISOString(),
            end: endDateTime.toISOString()
        });
    } 
    else {
        for (const slot of formData.slots) {
            const startDateTime = new Date(`${baseDateStr}T${slot.start}:00`);
            const endDateTime = new Date(`${baseDateStr}T${slot.end}:00`);

            const shift: any = {
                userId: formData.userId,
                start: startDateTime.toISOString(),
                end: endDateTime.toISOString(),
                role: 'Service', 
            };
            await this.hrService.addShift(shift);
        }
    }
    
    await this.loadData();
  }
}
