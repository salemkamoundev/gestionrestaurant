import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
}

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

@Component({
  selector: 'app-pos-order',
  standalone: false,
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {
  tableId: string | null = null;
  tableNumber: string | null = null;
  isCartOpen: boolean = false; 

  // Données du Menu
  menuProducts: Product[] = [
    { id: 1, name: 'Pizza 4 Fromages', price: 18.0, category: 'Plats', image: '🍕' },
    { id: 2, name: 'Burger Chef', price: 14.5, category: 'Plats', image: '🍔' },
    { id: 3, name: 'Ojja Merguez', price: 12.0, category: 'Plats', image: '🥘' },
    { id: 4, name: 'Coca-Cola', price: 3.5, category: 'Boissons', image: '🥤' },
    { id: 5, name: 'Thé à la menthe', price: 2.0, category: 'Boissons', image: '🍵' },
    { id: 6, name: 'Tiramisu', price: 7.0, category: 'Dessert', image: '🍰' },
    { id: 7, name: 'Eau Minérale', price: 2.5, category: 'Boissons', image: '💧' },
    { id: 8, name: 'Salade César', price: 12.0, category: 'Entrées', image: '🥗' },
  ];

  cart: CartItem[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.tableId = params['tableId'];
      this.tableNumber = params['tableNumber'];

      // --- LOGIQUE DE DÉTECTION ---
      // Si un ID est présent, on considère que la table est "EN COURS"
      // On simule la récupération de la commande depuis la base de données
      if (this.tableId && this.tableId.length > 0) {
        console.log("⚡ Table détectée (" + this.tableId + ") -> Récupération de la commande...");
        this.recoverExistingOrder();
      }
    });
  }

  // Simule une commande déjà existante pour cette table
  recoverExistingOrder() {
    this.cart = [
      { productId: 1, name: 'Pizza 4 Fromages', price: 18.0, quantity: 1 },
      { productId: 4, name: 'Coca-Cola', price: 3.5, quantity: 2 },
      { productId: 6, name: 'Tiramisu', price: 7.0, quantity: 1 }
    ];
  }

  addToCart(product: Product) {
    const existing = this.cart.find(item => item.productId === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.cart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      });
    }
  }

  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
  }

  get totalItems(): number {
    return this.cart.reduce((acc, item) => acc + item.quantity, 0);
  }

  get totalPrice(): number {
    return this.cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }
}
