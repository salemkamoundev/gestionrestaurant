#!/bin/bash

# ==========================================
# SETUP: DISH EDIT MODE
# ==========================================

set -e

echo "🍽️ Activation de la modification des Plats..."

# 1. Mise à jour du StockService (Ajout de getDish)
echo "SERVICE: Updating StockService..."
cat <<'EOF' > src/app/core/services/stock.service.ts
import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, getDoc } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Product, Dish } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private firestore = inject(Firestore);
  private productsCollection = collection(this.firestore, 'products');
  private dishesCollection = collection(this.firestore, 'dishes');

  // --- PRODUCTS ---
  getProducts(): Observable<Product[]> {
    return collectionData(this.productsCollection, { idField: 'id' }) as Observable<Product[]>;
  }

  async addProduct(product: Omit<Product, 'id'>): Promise<void> {
    await addDoc(this.productsCollection, { ...product, updatedAt: new Date() });
  }

  async deleteProduct(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, `products/${id}`));
  }

  // --- DISHES ---
  getDishes(): Observable<Dish[]> {
    return collectionData(this.dishesCollection, { idField: 'id' }) as Observable<Dish[]>;
  }

  // NOUVEAU : Récupérer un seul plat
  getDish(id: string): Observable<Dish | undefined> {
    const docRef = doc(this.firestore, `dishes/${id}`);
    return from(getDoc(docRef)).pipe(
      map(snap => snap.exists() ? { id: snap.id, ...snap.data() } as Dish : undefined)
    );
  }

  async addDish(dish: Omit<Dish, 'id'>): Promise<void> {
    await addDoc(this.dishesCollection, dish);
  }

  // NOUVEAU : Mettre à jour un plat
  async updateDish(id: string, data: Partial<Dish>): Promise<void> {
    const docRef = doc(this.firestore, `dishes/${id}`);
    await updateDoc(docRef, data);
  }

  async deleteDish(id: string): Promise<void> {
    const docRef = doc(this.firestore, `dishes/${id}`);
    await deleteDoc(docRef);
  }
}
EOF

# 2. Mise à jour de DishListComponent (Bouton Modifier)
echo "COMPONENT: Updating DishListComponent..."
cat <<'EOF' > src/app/features/dishes/components/dish-list/dish-list.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StockService } from '../../../../core/services/stock.service';
import { Observable } from 'rxjs';
import { Dish } from '../../../../core/models/interfaces';

@Component({
  selector: 'app-dish-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6 bg-white rounded-lg shadow-md">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">🍽️ Gestion du Menu</h2>
        <a routerLink="/dishes/new" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow flex items-center gap-2">
          <span>+ Créer une recette</span>
        </a>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let dish of dishes$ | async" class="border rounded-lg p-4 shadow-sm hover:shadow-md transition bg-gray-50 flex flex-col justify-between">
          
          <div>
            <div class="flex justify-between items-start">
              <h3 class="text-lg font-bold text-gray-900">{{ dish.name }}</h3>
              <span [ngClass]="{'bg-green-100 text-green-800': dish.isAvailable, 'bg-red-100 text-red-800': !dish.isAvailable}" class="px-2 py-1 text-xs rounded-full">
                {{ dish.isAvailable ? 'En vente' : 'Indisponible' }}
              </span>
            </div>
            <p class="text-sm text-gray-500 mt-1 line-clamp-2">{{ dish.description || 'Pas de description' }}</p>
            <div class="mt-2 text-xs text-gray-400">
               {{ dish.ingredients ? dish.ingredients.length : 0 }} Ingrédient(s)
            </div>
          </div>

          <div class="mt-4 pt-4 border-t flex justify-between items-center">
            <span class="text-xl font-bold text-indigo-600">{{ dish.price | currency:'EUR' }}</span>
            
            <div class="flex gap-3">
              <a [routerLink]="['/dishes/edit', dish.id]" class="text-indigo-600 hover:text-indigo-900 font-medium text-sm flex items-center gap-1">
                ✏️ Modifier
              </a>
              <button (click)="deleteDish(dish.id)" class="text-red-500 hover:text-red-700 font-medium text-sm">
                🗑️
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class DishListComponent {
  stockService = inject(StockService);
  dishes$: Observable<Dish[]> = this.stockService.getDishes();

  deleteDish(id: string) {
    if(confirm('Voulez-vous vraiment supprimer ce plat du menu ?')) {
      this.stockService.deleteDish(id);
    }
  }
}
EOF

# 3. Mise à jour de DishFormComponent (Logique d'édition)
echo "COMPONENT: Updating DishFormComponent..."
cat <<'EOF' > src/app/features/dishes/components/dish-form/dish-form.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StockService } from '../../../../core/services/stock.service';
import { Observable } from 'rxjs';
import { Product, Dish } from '../../../../core/models/interfaces';

@Component({
  selector: 'app-dish-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">
          {{ isEditMode ? 'Modifier la recette' : 'Créer une nouvelle recette' }}
        </h2>
        <span *ngIf="isEditMode" class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Mode Édition</span>
      </div>
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nom du plat</label>
            <input formControlName="name" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Prix de vente (€)</label>
            <input formControlName="price" type="number" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
          </div>
        </div>

        <div>
           <label class="block text-sm font-medium text-gray-700">Catégorie</label>
           <select formControlName="category" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
             <option value="starter">Entrée</option>
             <option value="main">Plat principal</option>
             <option value="dessert">Dessert</option>
             <option value="drink">Boisson</option>
           </select>
        </div>

        <div>
           <label class="block text-sm font-medium text-gray-700">Description</label>
           <textarea formControlName="description" rows="2" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"></textarea>
        </div>
        
        <div class="border-t pt-4 mt-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Ingrédients (Stock)</h3>
            <button type="button" (click)="addIngredient()" class="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100">
              + Ajouter un ingrédient
            </button>
          </div>

          <div formArrayName="ingredients" class="space-y-3">
            <div *ngFor="let ingredient of ingredients.controls; let i=index" [formGroup]="getIngredientFormGroup(i)" class="flex gap-4 items-end bg-gray-50 p-3 rounded">
              
              <div class="flex-grow">
                <label class="block text-xs font-medium text-gray-500 mb-1">Produit</label>
                <select formControlName="productId" class="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border">
                  <option value="" disabled>Choisir...</option>
                  <option *ngFor="let p of products$ | async" [value]="p.id">
                    {{ p.name }} ({{ p.unit }})
                  </option>
                </select>
              </div>

              <div class="w-32">
                <label class="block text-xs font-medium text-gray-500 mb-1">Qté</label>
                <input formControlName="quantity" type="number" class="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border">
              </div>

              <button type="button" (click)="removeIngredient(i)" class="text-red-500 hover:text-red-700 p-2">
                🗑️
              </button>
            </div>
          </div>
          
          <div *ngIf="ingredients.length === 0" class="text-center text-gray-400 py-4 italic text-sm">
            Aucun ingrédient défini.
          </div>
        </div>

        <div class="flex items-center gap-2 bg-gray-50 p-3 rounded">
           <input type="checkbox" formControlName="isAvailable" id="avail" class="h-4 w-4 text-indigo-600 border-gray-300 rounded">
           <label for="avail" class="ml-2 block text-sm text-gray-900">Plat disponible à la vente</label>
        </div>

        <div class="flex justify-end pt-4 border-t gap-3">
          <button type="button" (click)="cancel()" class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
             Annuler
          </button>
          <button type="submit" [disabled]="form.invalid" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
             {{ isEditMode ? 'Mettre à jour' : 'Créer le plat' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class DishFormComponent implements OnInit {
  fb = inject(FormBuilder);
  stockService = inject(StockService);
  router = inject(Router);
  route = inject(ActivatedRoute); // Pour lire l'ID dans l'URL
  
  products$: Observable<Product[]> = this.stockService.getProducts();

  isEditMode = false;
  dishId: string | null = null;

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    category: ['main', Validators.required],
    ingredients: this.fb.array([]),
    isAvailable: [true]
  });

  get ingredients() {
    return this.form.get('ingredients') as FormArray;
  }

  getIngredientFormGroup(index: number): FormGroup {
    return this.ingredients.at(index) as FormGroup;
  }

  ngOnInit() {
    // Vérifier si on est en mode édition
    this.dishId = this.route.snapshot.paramMap.get('id');
    
    if (this.dishId) {
      this.isEditMode = true;
      this.loadDish(this.dishId);
    } else {
      // Mode création : on ajoute une ligne vide par défaut
      this.addIngredient();
    }
  }

  loadDish(id: string) {
    this.stockService.getDish(id).subscribe(dish => {
      if (dish) {
        // Patch des champs simples
        this.form.patchValue({
          name: dish.name,
          description: dish.description,
          price: dish.price,
          category: dish.category,
          isAvailable: dish.isAvailable
        });

        // Patch des ingrédients (Array)
        this.ingredients.clear(); // On vide d'abord
        if (dish.ingredients && dish.ingredients.length > 0) {
          dish.ingredients.forEach(ing => {
            this.addIngredient(ing.productId, ing.quantity);
          });
        }
      }
    });
  }

  addIngredient(productId = '', quantity = 1) {
    const ingredientGroup = this.fb.group({
      productId: [productId, Validators.required],
      quantity: [quantity, [Validators.required, Validators.min(0.01)]]
    });
    this.ingredients.push(ingredientGroup);
  }

  removeIngredient(index: number) {
    this.ingredients.removeAt(index);
  }

  async onSubmit() {
    if (this.form.valid) {
      const dishData = this.form.value as any;
      
      if (this.isEditMode && this.dishId) {
        await this.stockService.updateDish(this.dishId, dishData);
      } else {
        await this.stockService.addDish(dishData);
      }
      
      this.router.navigate(['/dishes']);
    }
  }

  cancel() {
    this.router.navigate(['/dishes']);
  }
}
EOF

# 4. Mise à jour des Routes (app.routes.ts)
echo "ROUTING: Adding Edit Route..."
# On utilise une substitution simple avec sed pour ajouter la route edit avant la fin du tableau
# NOTE: Cette méthode est plus sûre que d'écraser tout le fichier si tu as fait des modifs manuelles,
# mais ici, par sécurité et cohérence, je réécris le bloc des routes 'dishes' complet.

cat <<'EOF' > src/app/app.routes.ts
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
EOF

echo "✅ Édition des Plats activée."
echo "👉 Instructions :"
echo "1. Lance 'ng serve'."
echo "2. Va dans 'Menu'."
echo "3. Clique sur 'Modifier' (icône crayon) sur un plat existant."