import { Component, OnInit } from '@angular/core';

interface Product {
  id: number;
  name: string;
  category: string;
  quantity: number;
  price: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

@Component({
  selector: 'app-stock',
  standalone: false,  // <--- AJOUT CRUCIAL ICI
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class StockComponent implements OnInit {
  products: Product[] = [
    { id: 1, name: 'MacBook Pro M2', category: 'Electronics', quantity: 12, price: 4500, status: 'In Stock' },
    { id: 2, name: 'Iphone 15', category: 'Phone', quantity: 4, price: 3200, status: 'Low Stock' },
    { id: 3, name: 'Samsung S24', category: 'Phone', quantity: 0, price: 2800, status: 'Out of Stock' },
    { id: 4, name: 'Dell XPS 15', category: 'Electronics', quantity: 8, price: 3800, status: 'In Stock' },
    { id: 5, name: 'Sony WH-1000XM5', category: 'Audio', quantity: 15, price: 900, status: 'In Stock' },
  ];

  constructor() { }

  ngOnInit(): void { }

  getStatusColor(status: string): string {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-800';
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
