import { Component, inject } from '@angular/core';
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
    <header class="bg-indigo-700 text-white shadow-md">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          
          <div class="flex items-center gap-2">
            <span class="text-2xl">👨‍🍳</span>
            <span class="font-bold text-xl tracking-tight">RestoManager</span>
          </div>

          <nav class="hidden md:flex space-x-1">
            <a routerLink="/dashboard" routerLinkActive="bg-indigo-800" class="px-3 py-2 rounded hover:bg-indigo-600 transition">📊 Dashboard</a>
            <a routerLink="/pos/tables" routerLinkActive="bg-indigo-800" class="px-3 py-2 rounded hover:bg-indigo-600 transition">📱 Caisse</a>
            <a routerLink="/stock" routerLinkActive="bg-indigo-800" class="px-3 py-2 rounded hover:bg-indigo-600 transition">📦 Stocks</a>
            <a routerLink="/dishes" routerLinkActive="bg-indigo-800" class="px-3 py-2 rounded hover:bg-indigo-600 transition">🍽️ Menu</a>
            <a routerLink="/hr/planning" routerLinkActive="bg-indigo-800" class="px-3 py-2 rounded hover:bg-indigo-600 transition">📅 RH</a>
            <a routerLink="/finance/expenses" routerLinkActive="bg-indigo-800" class="px-3 py-2 rounded hover:bg-indigo-600 transition">💰 Finance</a>
          </nav>

          <div class="flex items-center gap-4">
            <div *ngIf="user$ | async as user" class="hidden sm:flex flex-col text-right">
              <span class="text-sm font-bold">{{ user.displayName }}</span>
              <span class="text-xs text-indigo-200 uppercase">{{ user.role }}</span>
            </div>
            <button (click)="logout()" class="bg-indigo-800 hover:bg-red-600 px-3 py-1 rounded text-sm transition flex items-center gap-1">
              <span>🚪</span> <span class="hidden sm:inline">Déco.</span>
            </button>
          </div>

        </div>
      </div>
      
      <div class="md:hidden flex overflow-x-auto bg-indigo-800 p-2 gap-2 text-sm no-scrollbar">
         <a routerLink="/dashboard" routerLinkActive="bg-indigo-600" class="px-3 py-1 rounded whitespace-nowrap">Dashboard</a>
         <a routerLink="/pos/tables" routerLinkActive="bg-indigo-600" class="px-3 py-1 rounded whitespace-nowrap">Caisse</a>
         <a routerLink="/stock" routerLinkActive="bg-indigo-600" class="px-3 py-1 rounded whitespace-nowrap">Stocks</a>
         <a routerLink="/hr/planning" routerLinkActive="bg-indigo-600" class="px-3 py-1 rounded whitespace-nowrap">RH</a>
      </div>
    </header>
  `
})
export class HeaderComponent {
  authService = inject(AuthService);
  user$: Observable<UserProfile | null> = this.authService.user$;

  logout() {
    this.authService.logout();
  }
}
