import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Import des Composants
import { AppComponent } from './app.component';
import { StockComponent } from './stock/stock.component';
import { OrderComponent } from './pos/order/order.component';
import { HistoryComponent } from './pos/history/history.component';

const routes: Routes = [
  { path: '', component: AppComponent }, // Dashboard par défaut (ou changer selon besoin)
  { path: 'dashboard', component: AppComponent }, 
  { path: 'stock', component: StockComponent },
  { path: 'pos/order', component: OrderComponent },
  { path: 'pos/history', component: HistoryComponent }, // ✅ Route Historique
  { path: '**', redirectTo: '' }
];

@NgModule({
  declarations: [
    AppComponent,
    StockComponent,
    OrderComponent,
    HistoryComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    RouterModule.forRoot(routes, { 
      useHash: true, 
      scrollPositionRestoration: 'enabled'
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
