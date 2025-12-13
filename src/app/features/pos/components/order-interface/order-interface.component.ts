import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StockService } from '../../../../core/services/stock.service';
import { OrderService } from '../../../../core/services/order.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Observable } from 'rxjs';
import { Dish, OrderItem, Order } from '../../../../core/models/interfaces';

@Component({
  selector: 'app-order-interface',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex h-screen overflow-hidden bg-gray-50">
      
      <div class="w-2/3 flex flex-col border-r border-gray-200">
        <div class="flex overflow-x-auto bg-white p-2 shadow-sm gap-2 no-scrollbar">
          <button *ngFor="let cat of categories" 
                  (click)="activeCategory = cat.id"
                  [ngClass]="{'bg-indigo-600 text-white': activeCategory === cat.id, 'bg-gray-100 text-gray-600': activeCategory !== cat.id}"
                  class="flex-shrink-0 px-6 py-4 rounded-lg font-bold text-lg transition-colors">
            {{ cat.label }}
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 bg-gray-100">
          <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <ng-container *ngFor="let dish of dishes$ | async">
              <button *ngIf="dish.category === activeCategory"
                      (click)="addToCart(dish)"
                      [disabled]="!dish.isAvailable"
                      class="bg-white p-4 rounded-xl shadow h-32 flex flex-col justify-between items-start text-left active:scale-95 transition-transform disabled:opacity-50 disabled:bg-gray-200">
                <span class="font-bold text-gray-800 text-lg leading-tight">{{ dish.name }}</span>
                <span class="text-indigo-600 font-bold text-xl">{{ dish.price | currency:'EUR' }}</span>
              </button>
            </ng-container>
          </div>
        </div>
      </div>

      <div class="w-1/3 flex flex-col bg-white shadow-xl z-10">
        <div class="p-4 bg-indigo-900 text-white flex justify-between items-center">
          <div>
            <h2 class="font-bold text-xl">Commande</h2>
            <p class="text-indigo-200 text-sm">
              {{ tableNumber ? 'Table ' + tableNumber : 'À emporter' }}
            </p>
          </div>
          <button (click)="cancelOrder()" class="text-red-300 hover:text-white text-sm">Annuler</button>
        </div>

        <div class="flex-1 overflow-y-auto p-2">
          <div *ngFor="let item of cartItems; let i = index" class="flex justify-between items-center p-3 border-b border-gray-100">
            <div class="flex-1">
              <div class="font-bold text-gray-800">{{ item.dishName }}</div>
              <div class="text-xs text-gray-500">{{ item.price | currency:'EUR' }} x {{ item.quantity }}</div>
            </div>
            <div class="flex items-center gap-3">
              <button (click)="decrementQty(i)" class="w-8 h-8 rounded-full bg-gray-200 text-xl font-bold flex items-center justify-center">-</button>
              <span class="font-bold w-4 text-center">{{ item.quantity }}</span>
              <button (click)="incrementQty(i)" class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-xl font-bold flex items-center justify-center">+</button>
            </div>
          </div>
          
          <div *ngIf="cartItems.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400">
            <span class="text-4xl mb-2">🛒</span>
            <p>Panier vide</p>
          </div>
        </div>

        <div class="p-4 bg-gray-50 border-t border-gray-200">
          <div class="flex justify-between items-center mb-4 text-2xl font-bold text-gray-800">
            <span>Total</span>
            <span>{{ totalAmount | currency:'EUR' }}</span>
          </div>
          
          <button (click)="validateOrder()" 
                  [disabled]="cartItems.length === 0"
                  class="w-full bg-green-600 hover:bg-green-700 text-white text-xl font-bold py-4 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform flex justify-center items-center gap-2">
            <span>✅ Valider & Payer</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class OrderInterfaceComponent implements OnInit {
  stockService = inject(StockService);
  orderService = inject(OrderService);
  authService = inject(AuthService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  dishes$: Observable<Dish[]> = this.stockService.getDishes();
  
  categories = [
    { id: 'starter', label: 'Entrées' },
    { id: 'main', label: 'Plats' },
    { id: 'dessert', label: 'Desserts' },
    { id: 'drink', label: 'Boissons' }
  ];
  activeCategory = 'main';

  tableId: string | null = null;
  tableNumber: string | null = null;
  cartItems: OrderItem[] = [];
  serverName = 'Serveur'; // Idéalement récupéré via AuthService

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.tableId = params['tableId'] || 'takeaway';
      this.tableNumber = params['tableNumber'];
    });
    
    this.authService.getUserProfile().then(user => {
      if(user) this.serverName = user.displayName || 'Staff';
    });
  }

  addToCart(dish: Dish) {
    const existingItem = this.cartItems.find(i => i.dishId === dish.id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cartItems.push({
        dishId: dish.id,
        dishName: dish.name,
        quantity: 1,
        price: dish.price,
        status: 'pending'
      });
    }
  }

  incrementQty(index: number) {
    this.cartItems[index].quantity++;
  }

  decrementQty(index: number) {
    if (this.cartItems[index].quantity > 1) {
      this.cartItems[index].quantity--;
    } else {
      this.cartItems.splice(index, 1);
    }
  }

  get totalAmount() {
    return this.cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }

  async validateOrder() {
    if (this.cartItems.length === 0) return;

    const order: any = {
      tableId: this.tableId || 'takeaway',
      serverName: this.serverName,
      items: this.cartItems,
      totalAmount: this.totalAmount,
      status: 'closed' // On valide directement pour l'exemple
    };

    try {
      // 1. Création de la commande
      const orderId = await this.orderService.createOrder(order);
      
      // 2. Validation et déduction du stock (Logique demandée)
      await this.orderService.validateOrder(orderId, order);
      
      alert('Commande validée !');
      this.router.navigate(['/pos/tables']);
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la commande');
    }
  }

  cancelOrder() {
    this.router.navigate(['/pos/tables']);
  }
}
