import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StockService } from '../../../../core/services/stock.service';
import { Observable } from 'rxjs';
import { Product } from '../../../../core/models/interfaces';

@Component({
  selector: 'app-dish-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Créer une nouvelle recette</h2>
      
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
        
        <div class="border-t pt-4 mt-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Ingrédients de la recette</h3>
            <button type="button" (click)="addIngredient()" class="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100">
              + Ajouter un ingrédient
            </button>
          </div>

          <div formArrayName="ingredients" class="space-y-3">
            <div *ngFor="let ingredient of ingredients.controls; let i=index" [formGroup]="getIngredientFormGroup(i)" class="flex gap-4 items-end bg-gray-50 p-3 rounded">
              
              <div class="flex-grow">
                <label class="block text-xs font-medium text-gray-500 mb-1">Produit (Stock)</label>
                <select formControlName="productId" class="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border">
                  <option value="" disabled>Choisir...</option>
                  <option *ngFor="let p of products$ | async" [value]="p.id">
                    {{ p.name }} ({{ p.unit }})
                  </option>
                </select>
              </div>

              <div class="w-32">
                <label class="block text-xs font-medium text-gray-500 mb-1">Qté requise</label>
                <input formControlName="quantity" type="number" class="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border">
              </div>

              <button type="button" (click)="removeIngredient(i)" class="text-red-500 hover:text-red-700 p-2">
                🗑️
              </button>
            </div>
          </div>
          
          <div *ngIf="ingredients.length === 0" class="text-center text-gray-400 py-4 italic text-sm">
            Aucun ingrédient ajouté pour le moment.
          </div>
        </div>

        <div class="flex items-center gap-2">
           <input type="checkbox" formControlName="isAvailable" id="avail" class="h-4 w-4 text-indigo-600 border-gray-300 rounded">
           <label for="avail" class="ml-2 block text-sm text-gray-900">Plat disponible immédiatement</label>
        </div>

        <div class="flex justify-end pt-4 border-t">
          <button type="button" (click)="cancel()" class="mr-3 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Annuler</button>
          <button type="submit" [disabled]="form.invalid" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">Créer le plat</button>
        </div>
      </form>
    </div>
  `
})
export class DishFormComponent implements OnInit {
  fb = inject(FormBuilder);
  stockService = inject(StockService);
  router = inject(Router);
  
  // Liste des produits pour le Select
  products$: Observable<Product[]> = this.stockService.getProducts();

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

  // Helper pour typer le FormGroup dans le template
  getIngredientFormGroup(index: number): FormGroup {
    return this.ingredients.at(index) as FormGroup;
  }

  ngOnInit() {
    // Ajout d'une ligne vide par défaut
    this.addIngredient();
  }

  addIngredient() {
    const ingredientGroup = this.fb.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.01)]]
    });
    this.ingredients.push(ingredientGroup);
  }

  removeIngredient(index: number) {
    this.ingredients.removeAt(index);
  }

  async onSubmit() {
    if (this.form.valid) {
      await this.stockService.addDish(this.form.value as any);
      this.router.navigate(['/dishes']);
    }
  }

  cancel() {
    this.router.navigate(['/dishes']);
  }
}
