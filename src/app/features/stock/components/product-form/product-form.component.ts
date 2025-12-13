import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StockService } from '../../../../core/services/stock.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Ajouter un produit</h2>
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Nom du produit</label>
          <input formControlName="name" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500">
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Catégorie</label>
            <select formControlName="category" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
              <option value="vegetable">Légumes</option>
              <option value="meat">Viande</option>
              <option value="dairy">Produits Laitiers</option>
              <option value="dry">Épicerie sèche</option>
              <option value="liquid">Boissons/Liquides</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Unité</label>
            <select formControlName="unit" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
              <option value="kg">Kg</option>
              <option value="l">Litre</option>
              <option value="piece">Pièce</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Coût unitaire (€)</label>
            <input formControlName="costPrice" type="number" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Quantité Initiale</label>
            <input formControlName="quantity" type="number" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Seuil d'alerte</label>
            <input formControlName="minThreshold" type="number" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
          </div>
        </div>

        <div class="flex justify-end pt-4">
          <button type="button" (click)="cancel()" class="mr-3 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Annuler</button>
          <button type="submit" [disabled]="form.invalid" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">Enregistrer</button>
        </div>
      </form>
    </div>
  `
})
export class ProductFormComponent {
  fb = inject(FormBuilder);
  stockService = inject(StockService);
  router = inject(Router);

  form = this.fb.group({
    name: ['', Validators.required],
    category: ['vegetable', Validators.required],
    unit: ['kg', Validators.required],
    costPrice: [0, [Validators.required, Validators.min(0)]],
    quantity: [0, [Validators.required, Validators.min(0)]],
    minThreshold: [5, [Validators.required, Validators.min(0)]],
  });

  async onSubmit() {
    if (this.form.valid) {
      await this.stockService.addProduct(this.form.value as any);
      this.router.navigate(['/stock']);
    }
  }

  cancel() {
    this.router.navigate(['/stock']);
  }
}
