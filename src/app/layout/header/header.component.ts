import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Observable } from 'rxjs';
import { UserProfile } from '../../core/models/interfaces';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div *ngIf="isOpen" (click)="closeMenu.emit()" 
         class="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden transition-opacity">
    </div>

    <aside class="fixed inset-y-0 left-0 z-30 w-64 bg-indigo-900 text-white transition-transform duration-300 ease-in-out transform flex flex-col shadow-2xl font-sans"
           [ngClass]="isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'">
      
      <div class="flex items-center justify-center h-16 bg-indigo-950 border-b border-indigo-800 shadow-sm shrink-0">
        <span class="text-3xl mr-2">👨‍🍳</span>
        <span class="text-xl font-bold tracking-wider">RestoManager</span>
      </div>

      <nav class="flex-1 overflow-y-auto py-4">
        
        <div class="px-4 mb-2 text-xs font-semibold text-indigo-300 uppercase tracking-wider">
          Service
        </div>

        <a routerLink="/dashboard" routerLinkActive="bg-indigo-800 border-r-4 border-indigo-400" 
           (click)="closeMenu.emit()"
           class="flex items-center px-4 py-2 text-sm font-medium hover:bg-indigo-800 transition-all mb-1">
           <span class="mr-3 text-xl">📊</span> Dashboard
        </a>

        <a routerLink="/pos/tables" routerLinkActive="bg-indigo-800 border-r-4 border-indigo-400" 
           (click)="closeMenu.emit()"
           class="flex items-center px-4 py-2 text-sm font-medium hover:bg-indigo-800 transition-all mb-1">
           <span class="mr-3 text-xl">🪑</span> Salle & Tables
        </a>

        <div class="px-4 mt-6 mb-2 text-xs font-semibold text-indigo-300 uppercase tracking-wider">
          Administration
        </div>

        <a routerLink="/hr/employees" routerLinkActive="bg-indigo-800 border-r-4 border-indigo-400" 
           (click)="closeMenu.emit()"
           class="flex items-center px-4 py-2 text-sm font-medium hover:bg-indigo-800 transition-all mb-1">
           <span class="mr-3 text-xl">👥</span> Personnel (CRUD)
        </a>

        <a routerLink="/hr/planning" routerLinkActive="bg-indigo-800 border-r-4 border-indigo-400" 
           (click)="closeMenu.emit()"
           class="flex items-center px-4 py-2 text-sm font-medium hover:bg-indigo-800 transition-all mb-1">
           <span class="mr-3 text-xl">📅</span> Planning
        </a>

        <a routerLink="/dishes" routerLinkActive="bg-indigo-800 border-r-4 border-indigo-400" 
           (click)="closeMenu.emit()"
           class="flex items-center px-4 py-2 text-sm font-medium hover:bg-indigo-800 transition-all mb-1">
           <span class="mr-3 text-xl">🍽️</span> Menu / Carte
        </a>

        <a routerLink="/stock" routerLinkActive="bg-indigo-800 border-r-4 border-indigo-400" 
           (click)="closeMenu.emit()"
           class="flex items-center px-4 py-2 text-sm font-medium hover:bg-indigo-800 transition-all mb-1">
           <span class="mr-3 text-xl">📦</span> Stocks
        </a>

        <a routerLink="/finance/expenses" routerLinkActive="bg-indigo-800 border-r-4 border-indigo-400" 
           (click)="closeMenu.emit()"
           class="flex items-center px-4 py-2 text-sm font-medium hover:bg-indigo-800 transition-all mb-1">
           <span class="mr-3 text-xl">💰</span> Finance
        </a>

      </nav>

      <div class="p-4 border-t border-indigo-800 bg-indigo-950 shrink-0">
        <div *ngIf="user$ | async as user" class="flex items-center gap-3 mb-3">
          <div class="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-lg">
            {{ user.displayName?.charAt(0) | uppercase }}
          </div>
          <div class="overflow-hidden">
            <p class="text-sm font-medium text-white truncate">{{ user.displayName }}</p>
            <p class="text-xs text-indigo-300 truncate">{{ user.role | uppercase }}</p>
          </div>
        </div>
        <button (click)="logout()" class="w-full flex justify-center items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition">
          <span>🚪</span> Déconnexion
        </button>
      </div>

    </aside>
  `
})
export class HeaderComponent {
  @Input() isOpen = false;
  @Output() closeMenu = new EventEmitter<void>();

  authService = inject(AuthService);
  user$: Observable<UserProfile | null> = this.authService.user$;

  logout() {
    this.authService.logout();
  }
}
