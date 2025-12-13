import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';

import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { LoginComponent } from './features/auth/login/login.component';
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
  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [roleGuard],
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
      
      // DISHES (Updated)
      { path: 'dishes', component: DishListComponent, data: { roles: ['super_admin', 'admin'] } },
      { path: 'dishes/new', component: DishFormComponent, data: { roles: ['super_admin', 'admin'] } },
      // ROUTE EDITION AJOUTÉE :
      { path: 'dishes/edit/:id', component: DishFormComponent, data: { roles: ['super_admin', 'admin'] } },

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
  { path: '**', redirectTo: 'dashboard' }
];
