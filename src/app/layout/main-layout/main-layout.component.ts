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
