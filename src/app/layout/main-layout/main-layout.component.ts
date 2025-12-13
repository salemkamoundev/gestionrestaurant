import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  template: `
    <div class="flex h-screen bg-gray-100 overflow-hidden">
      
      <app-header 
        [isOpen]="isSidebarOpen" 
        (closeMenu)="closeSidebar()">
      </app-header>

      <div class="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        
        <div class="md:hidden bg-white shadow-sm h-16 flex items-center justify-between px-4 z-10 sticky top-0">
          
          <div class="flex items-center gap-3">
            <button (click)="toggleSidebar()" class="text-gray-600 focus:outline-none hover:text-indigo-600 p-2 rounded-md">
              <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span class="font-bold text-xl text-gray-800">RestoManager</span>
          </div>
          
          <div class="h-8 w-8 bg-indigo-100 rounded-full border border-indigo-200"></div>
        </div>

        <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-8">
          <router-outlet></router-outlet>
        </main>
      
      </div>
    </div>
  `
})
export class MainLayoutComponent {
  isSidebarOpen = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }
}
