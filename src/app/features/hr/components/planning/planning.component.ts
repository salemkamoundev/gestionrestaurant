import { Component, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HrService } from '../../../../core/services/hr.service';
import { DataSet } from 'vis-data'; 
import { Timeline } from 'vis-timeline';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-white rounded-lg shadow-md h-screen flex flex-col">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-gray-800">📅 Planning Hebdomadaire</h2>
        <button (click)="loadData()" class="text-indigo-600 hover:underline">Rafraîchir</button>
      </div>
      
      <div #timelineContainer class="flex-1 border rounded bg-gray-50 w-full"></div>
    </div>
  `
})
export class PlanningComponent implements AfterViewInit {
  @ViewChild('timelineContainer') container!: ElementRef;
  
  hrService = inject(HrService);
  timeline: any;

  async ngAfterViewInit() {
    // Petit délai pour s'assurer que le DOM est prêt
    setTimeout(() => this.loadData(), 100);
  }

  async loadData() {
    const employees = await firstValueFrom(this.hrService.getEmployees());
    const groups = new DataSet(
      employees.map(emp => ({ id: emp.uid, content: emp.displayName || emp.email }))
    );

    const shifts = await firstValueFrom(this.hrService.getShifts());
    const items = new DataSet(
      shifts.map(shift => ({
        id: shift.id,
        group: shift.userId,
        start: shift.start,
        end: shift.end,
        content: shift.role,
        type: 'range'
      }))
    );

    const options = {
      stack: false,
      start: new Date(),
      end: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7),
      editable: true,
      orientation: 'top',
      locale: 'fr'
    };

    if (this.timeline) {
      this.timeline.setData({ groups, items });
    } else {
      // Cast explicite du conteneur pour éviter les erreurs de type HTML
      this.timeline = new Timeline(this.container.nativeElement as HTMLElement, items, groups, options);
    }
  }
}
