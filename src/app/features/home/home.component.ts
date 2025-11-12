import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MobileContainerComponent } from '../../shared/components/mobile-container/mobile-container.component';
import { FloatingButtonComponent } from '../../shared/components/floating-button/floating-button.component';
import { BottomNavigationComponent } from '../../shared/components/bottom-navigation/bottom-navigation.component';
import { ChatService } from '../../core/services/chat.service';

/**
 * Componente principal de la vista Home
 * Requirements: 1, 18
 * - Mostrar productos bancarios del usuario
 * - Integrar botón flotante de Chicho con badge de notificaciones
 * - Navegación inferior
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MobileContainerComponent,
    FloatingButtonComponent,
    BottomNavigationComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  notificationCount = 0;
  userName = 'Usuario';
  
  // Productos bancarios del usuario
  cuentas = [
    {
      tipo: 'Cuenta de Ahorros',
      numero: '****1234',
      saldo: 5420.50,
      moneda: 'S/'
    },
    {
      tipo: 'Cuenta Corriente',
      numero: '****5678',
      saldo: 12350.00,
      moneda: 'S/'
    }
  ];

  tarjetas = [
    {
      tipo: 'Tarjeta de Crédito',
      numero: '****9012',
      disponible: 8500.00,
      limite: 10000.00,
      moneda: 'S/'
    },
    {
      tipo: 'Tarjeta de Débito',
      numero: '****1234',
      vinculada: 'Cuenta de Ahorros',
      moneda: 'S/'
    }
  ];

  tipoCambio = {
    compra: 3.72,
    venta: 3.75
  };

  constructor(
    private chatService: ChatService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Cargar número de notificaciones pendientes
    this.chatService.getUnreadCount().subscribe(count => {
      this.notificationCount = count;
    });
  }

  onFloatingButtonClick(): void {
    // Navegar al chat
    this.router.navigate(['/chat']);
  }

  formatCurrency(amount: number): string {
    return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  getProgressPercentage(disponible: number, limite: number): number {
    return ((limite - disponible) / limite) * 100;
  }
}
