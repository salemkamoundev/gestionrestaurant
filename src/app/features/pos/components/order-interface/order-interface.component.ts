import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StockService } from '../../../../core/services/stock.service';
import { OrderService } from '../../../../core/services/order.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Dish, OrderItem } from '../../../../core/models/interfaces';

@Component({
  selector: 'app-order-interface',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col md:flex-row h-screen overflow-hidden bg-gray-50 relative">
      
      <div class="w-full md:w-2/3 flex flex-col border-r border-gray-200 h-full">
        
        <div class="md:hidden bg-white p-3 flex justify-between items-center shadow-sm z-10">
           <button (click)="cancelOrder()" class="text-gray-500 text-sm">← Retour</button>
           <span class="font-bold text-gray-800">
             {{ tableNumber ? 'Table ' + tableNumber : 'À emporter' }}
           </span>
           <div class="w-10"></div> 
        </div>

        <div class="bg-white p-2 md:p-3 shadow-sm z-10 border-b border-gray-100">
          <div class="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
            <button *ngFor="let cat of categories" 
                    (click)="setCategory(cat.id)"
                    [ngClass]="{
                      'bg-indigo-600 text-white shadow-md transform scale-105': (activeCategory$ | async) === cat.id,
                      'bg-gray-100 text-gray-600 hover:bg-gray-200': (activeCategory$ | async) !== cat.id
                    }"
                    class="flex-shrink-0 px-4 py-2 md:px-6 md:py-3 rounded-full font-bold text-xs md:text-sm transition-all duration-200 border border-transparent whitespace-nowrap">
              {{ cat.label }}
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-2 md:p-4 bg-gray-100 pb-24 md:pb-4"> 
          <div *ngIf="filteredDishes$ | async as dishes; else loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            
            <button *ngFor="let dish of dishes"
                    (click)="addToCart(dish)"
                    [disabled]="!dish.isAvailable"
                    class="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-100 h-28 md:h-32 flex flex-col justify-between items-start text-left active:scale-95 transition-transform hover:shadow-md disabled:opacity-50 disabled:bg-gray-50 relative overflow-hidden">
              
              <div class="w-full relative z-10">
                <div class="flex justify-between items-start">
                  <span class="font-bold text-gray-800 text-sm md:text-lg leading-tight line-clamp-2 pr-2">{{ dish.name }}</span>
                </div>
                <p class="hidden sm:block text-xs text-gray-400 mt-1 line-clamp-1">{{ dish.description }}</p>
              </div>

              <div class="flex justify-between items-end w-full relative z-10 mt-2">
                 <span [ngClass]="dish.isAvailable ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'" class="text-[10px] px-1 rounded uppercase font-bold tracking-wide">
                    {{ dish.isAvailable ? 'Dispo' : 'Épuisé' }}
                 </span>
                 <span class="text-indigo-600 font-extrabold text-lg md:text-xl bg-indigo-50 px-2 py-0.5 rounded">
                    {{ dish.price | currency:'EUR' }}
                 </span>
              </div>
            </button>

            <div *ngIf="dishes.length === 0" class="col-span-full flex flex-col items-center justify-center text-gray-400 py-10">
              <span class="text-4xl mb-2">🍽️</span>
              <p>Aucun plat ici.</p>
            </div>

          </div>
          
          <ng-template #loading>
            <div class="flex justify-center items-center h-full">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          </ng-template>
        </div>
      </div>

      <div *ngIf="cartItems.length > 0" 
           class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20 flex justify-between items-center safe-area-bottom">
        <div class="flex flex-col">
          <span class="text-xs text-gray-500">{{ cartItems.length }} articles {{ isEditing ? '(En modification)' : '' }}</span>
          <span class="font-bold text-xl text-indigo-700">{{ totalAmount | currency:'EUR' }}</span>
        </div>
        <button (click)="openMobileCart()" 
                class="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg active:scale-95 transition-transform flex items-center gap-2">
          <span>Voir Panier</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div [ngClass]="{
             'translate-y-full': !isMobileCartOpen, 
             'translate-y-0': isMobileCartOpen
           }"
           class="fixed inset-0 z-30 bg-white transition-transform duration-300 md:translate-y-0 md:static md:w-1/3 md:flex md:flex-col shadow-2xl md:shadow-none flex flex-col h-full">
         
        <div class="p-4 bg-indigo-900 text-white flex justify-between items-center shadow-lg shrink-0">
          <button (click)="closeMobileCart()" class="md:hidden mr-3 p-1 rounded-full hover:bg-white/20">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
             </svg>
          </button>

          <div class="flex-1">
            <h2 class="font-bold text-xl">{{ isEditing ? 'Modifier Commande' : 'Nouvelle Commande' }}</h2>
            <p class="text-indigo-200 text-xs uppercase tracking-wider font-semibold hidden md:block">
              {{ tableNumber ? 'Table ' + tableNumber : 'À emporter' }}
            </p>
          </div>
          <button (click)="cancelOrder()" class="bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-xs transition">
            Annuler
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-50">
          
          <div *ngFor="let item of cartItems; let i = index" class="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
            <div class="flex-1">
              <div class="font-bold text-gray-800 text-sm">{{ item.dishName }}</div>
              <div class="text-xs text-gray-500">{{ item.price | currency:'EUR' }}</div>
            </div>
            <div class="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-200">
              <button (click)="decrementQty(i)" class="w-8 h-8 rounded-md bg-white text-gray-600 shadow-sm border border-gray-200 font-bold hover:bg-red-50 hover:text-red-600 transition flex items-center justify-center">-</button>
              <span class="font-bold w-6 text-center text-sm">{{ item.quantity }}</span>
              <button (click)="incrementQty(i)" class="w-8 h-8 rounded-md bg-indigo-600 text-white shadow-md font-bold hover:bg-indigo-700 transition flex items-center justify-center">+</button>
            </div>
          </div>
          
          <div *ngIf="cartItems.length === 0" class="h-full flex flex-col items-center justify-center text-gray-300">
            <span class="text-6xl mb-4 opacity-50">🛒</span>
            <p class="font-medium">Panier vide</p>
          </div>
        </div>

        <div class="p-4 bg-white border-t border-gray-200 shrink-0 safe-area-bottom">
          <div class="flex justify-between items-center mb-4 text-gray-800">
            <span class="text-lg">Total</span>
            <span class="text-3xl font-extrabold text-indigo-700">{{ totalAmount | currency:'EUR' }}</span>
          </div>
          
          <button (click)="validateOrder()" 
                  [disabled]="cartItems.length === 0"
                  class="w-full bg-green-600 hover:bg-green-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform flex justify-center items-center gap-2">
            <span>{{ isEditing ? '💾 Mettre à jour' : '✅ Valider' }}</span>
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

  categories = [
    { id: 'all', label: 'Tout' },
    { id: 'starter', label: 'Entrées' },
    { id: 'main', label: 'Plats' },
    { id: 'dessert', label: 'Desserts' },
    { id: 'drink', label: 'Boissons' }
  ];

  activeCategory$ = new BehaviorSubject<string>('all');
  
  filteredDishes$: Observable<Dish[]> = combineLatest([
    this.stockService.getDishes(),
    this.activeCategory$
  ]).pipe(
    map(([dishes, category]) => {
      if (category === 'all') return dishes;
      return dishes.filter(d => d.category === category);
    })
  );

  tableId: string | null = null;
  tableNumber: string | null = null;
  cartItems: OrderItem[] = [];
  serverName = 'Serveur';
  
  isMobileCartOpen = false;
  
  // Variables pour l'édition
  isEditing = false;
  currentOrderId: string | null = null;

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.tableId = params['tableId'] || 'takeaway';
      this.tableNumber = params['tableNumber'];
      this.loadExistingOrder(); // Tenter de charger une commande existante
    });

    const user = await this.authService.getUserProfile();
    if(user) this.serverName = user.displayName || 'Staff';
  }

  // LOGIQUE DE RECUPERATION DE COMMANDE
  async loadExistingOrder() {
    if (this.tableId && this.tableId !== 'takeaway') {
      const table = await this.orderService.getTable(this.tableId);
      
      // Si la table est occupée et a un ID de commande en cours
      if (table && table.status === 'occupied' && table.currentOrderId) {
        const order = await this.orderService.getOrder(table.currentOrderId);
        
        if (order && order.status === 'open') {
          console.log('📦 Commande existante trouvée :', order);
          this.isEditing = true;
          this.currentOrderId = order.id;
          this.cartItems = order.items; // Ceci va déclencher l'affichage du footer "Voir Panier"
        }
      }
    }
  }

  setCategory(catId: string) {
    this.activeCategory$.next(catId);
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
      if (this.cartItems.length === 0) {
        this.isMobileCartOpen = false;
      }
    }
  }

  get totalAmount() {
    return this.cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }

  async validateOrder() {
    if (this.cartItems.length === 0) return;

    const orderData: any = {
      tableId: this.tableId || 'takeaway',
      serverName: this.serverName,
      items: this.cartItems,
      totalAmount: this.totalAmount,
      status: 'open' 
    };

    try {
      if (this.isEditing && this.currentOrderId) {
        // MISE A JOUR
        await this.orderService.updateOrder(this.currentOrderId, orderData);
        alert('Commande mise à jour !');
      } else {
        // CREATION
        await this.orderService.createOrder(orderData);
        alert('Nouvelle commande validée !');
      }
      
      this.router.navigate(['/pos/tables']);
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la validation');
    }
  }

  cancelOrder() {
    this.router.navigate(['/pos/tables']);
  }

  openMobileCart() {
    this.isMobileCartOpen = true;
  }

  closeMobileCart() {
    this.isMobileCartOpen = false;
  }
}
