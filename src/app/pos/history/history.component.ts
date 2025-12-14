import { Component, OnInit } from '@angular/core';

interface OrderHistory {
  id: string;
  date: Date;
  table: string;
  server: string;
  total: number;
  status: 'Payée' | 'En cours' | 'Annulée';
  itemsCount: number;
}

@Component({
  selector: 'app-history',
  standalone: false,
  templateUrl: './history.component.html',
  styles: []
})
export class HistoryComponent implements OnInit {
  
  // Données brutes (Simulation Base de données)
  allOrders: OrderHistory[] = [
    { id: 'CMD-001', date: new Date('2025-12-14T12:30:00'), table: '12', server: 'Ali', total: 45.500, status: 'Payée', itemsCount: 4 },
    { id: 'CMD-002', date: new Date('2025-12-14T12:45:00'), table: '05', server: 'Sarra', total: 12.000, status: 'En cours', itemsCount: 2 },
    { id: 'CMD-003', date: new Date('2025-12-14T13:10:00'), table: '08', server: 'Mohamed', total: 85.000, status: 'Payée', itemsCount: 8 },
    { id: 'CMD-004', date: new Date('2025-12-14T13:15:00'), table: '12', server: 'Ali', total: 0.000, status: 'Annulée', itemsCount: 0 },
    { id: 'CMD-005', date: new Date('2025-12-14T13:30:00'), table: 'Terrasse-1', server: 'Sarra', total: 22.500, status: 'En cours', itemsCount: 3 },
    { id: 'CMD-006', date: new Date('2025-12-13T19:00:00'), table: 'VIP-2', server: 'Mohamed', total: 120.000, status: 'Payée', itemsCount: 12 },
    { id: 'CMD-007', date: new Date('2025-12-13T20:15:00'), table: '05', server: 'Ali', total: 34.000, status: 'Payée', itemsCount: 5 },
  ];

  // Données filtrées affichées
  filteredOrders: OrderHistory[] = [];

  // Listes pour les menus déroulants (Select)
  tables: string[] = [];
  servers: string[] = [];
  statuses: string[] = ['Payée', 'En cours', 'Annulée'];

  // Valeurs sélectionnées pour les filtres
  filterTable: string = '';
  filterServer: string = '';
  filterStatus: string = '';

  constructor() {}

  ngOnInit(): void {
    // Initialisation
    this.filteredOrders = this.allOrders;
    
    // Extraction des valeurs uniques pour les filtres
    this.tables = [...new Set(this.allOrders.map(o => o.table))].sort();
    this.servers = [...new Set(this.allOrders.map(o => o.server))].sort();
  }

  // Fonction de filtrage
  applyFilters() {
    this.filteredOrders = this.allOrders.filter(order => {
      const matchTable = this.filterTable ? order.table === this.filterTable : true;
      const matchServer = this.filterServer ? order.server === this.filterServer : true;
      const matchStatus = this.filterStatus ? order.status === this.filterStatus : true;
      
      return matchTable && matchServer && matchStatus;
    });
  }

  // Helper pour les couleurs de badges
  getStatusColor(status: string): string {
    switch(status) {
      case 'Payée': return 'bg-green-100 text-green-800 border-green-200';
      case 'En cours': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Annulée': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  resetFilters() {
    this.filterTable = '';
    this.filterServer = '';
    this.filterStatus = '';
    this.applyFilters();
  }
}
