#!/bin/bash

# ==========================================
# SETUP: GLOBAL LAYOUT & HEADER
# ==========================================

set -e

echo "🎨 Création du Header et du Layout Global..."

# 1. Création des dossiers
mkdir -p src/app/layout/header
mkdir -p src/app/layout/main-layout

# ------------------------------------------------------------------------------
# 2. HeaderComponent
# Une barre de navigation responsive avec gestion de la déconnexion
# ------------------------------------------------------------------------------
echo "COMPONENT: HeaderComponent..."
cat <<'EOF' > src/app/layout/header/header.component.ts
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
EOF

# ------------------------------------------------------------------------------
# 3. MainLayoutComponent
# Le conteneur qui affiche le Header + le contenu de la page (RouterOutlet)
# ------------------------------------------------------------------------------
echo "COMPONENT: MainLayoutComponent..."
cat <<'EOF' > src/app/layout/main-layout/main-layout.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <app-header></app-header>

      <main class="flex-1 container mx-auto p-4 md:p-6">
        <router-outlet></router-outlet>
      </main>

      <footer class="bg-white border-t p-4 text-center text-gray-400 text-sm">
        &copy; 2025 Gestion Restaurant - v1.0
      </footer>
    </div>
  `
})
export class MainLayoutComponent {}
EOF

# ------------------------------------------------------------------------------
# 4. Mise à jour des Routes (app.routes.ts)
# On imbrique toutes les routes "App" dans le MainLayout
# ------------------------------------------------------------------------------
echo "ROUTING: Réorganisation avec Layout..."
cat <<'EOF' > src/app/app.routes.ts
import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';

// Layouts
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { LoginComponent } from './features/auth/login/login.component';

// Components
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { StockListComponent } from './features/stock/components/stock-list/stock-list.component';
import { ProductFormComponent } from './features/stock/components/product-form/product-form.component';
import { DishListComponent } from './features/dishes/components/dish-list/dish-list.component';
import { DishFormComponent } from './features/dishes/components/dish-form/dish-form.component';
import { TableGridComponent } from './features/pos/components/table-grid/table-grid.component';
import { OrderInterfaceComponent } from './features/pos/components/order-interface/order-interface.component';
import { EmployeeListComponent } from './features/hr/components/employee-list/employee-list.component';
import { PlanningComponent } from './features/hr/components/planning/planning.component';
import { ShiftClosingComponent } from './features/hr/components/shift-closing/shift-closing.component';
import { ExpenseListComponent } from './features/finance/components/expense-list/expense-list.component';

export const routes: Routes = [
  // 1. Route Login (SANS Layout, prend tout l'écran)
  { path: 'login', component: LoginComponent },

  // 2. Routes de l'Application (AVEC Layout: Header + Contenu)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [roleGuard], // Protection globale : il faut être connecté
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      
      { 
        path: 'dashboard', 
        component: DashboardComponent, 
        data: { roles: ['super_admin', 'admin', 'server'] } 
      },

      // STOCK
      { path: 'stock', component: StockListComponent, data: { roles: ['super_admin', 'admin'] } },
      { path: 'stock/new', component: ProductFormComponent, data: { roles: ['super_admin', 'admin'] } },
      { path: 'dishes', component: DishListComponent, data: { roles: ['super_admin', 'admin'] } },
      { path: 'dishes/new', component: DishFormComponent, data: { roles: ['super_admin', 'admin'] } },

      // POS
      { path: 'pos/tables', component: TableGridComponent, data: { roles: ['super_admin', 'admin', 'server'] } },
      { path: 'pos/order', component: OrderInterfaceComponent, data: { roles: ['super_admin', 'admin', 'server'] } },

      // HR
      { path: 'hr/employees', component: EmployeeListComponent, data: { roles: ['super_admin', 'admin'] } },
      { path: 'hr/planning', component: PlanningComponent, data: { roles: ['super_admin', 'admin', 'server'] } },
      { path: 'hr/closing', component: ShiftClosingComponent, data: { roles: ['super_admin', 'admin', 'server'] } },

      // FINANCE
      { path: 'finance/expenses', component: ExpenseListComponent, data: { roles: ['super_admin', 'admin'] } },
    ]
  },

  // Redirection 404
  { path: '**', redirectTo: 'dashboard' }
];
EOF

echo "✅ Menu et Layout installés sur toutes les pages !"
echo "👉 Lance 'ng serve' : Le login sera plein écran, les autres pages auront le menu."