import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MobileContainerComponent } from '../../shared/components/mobile-container/mobile-container.component';
import { FloatingButtonComponent } from '../../shared/components/floating-button/floating-button.component';
import { BottomNavigationComponent } from '../../shared/components/bottom-navigation/bottom-navigation.component';
import { SidebarMenuComponent } from '../../shared/components/sidebar-menu/sidebar-menu.component';
import { ChatService } from '../../core/services/chat.service';

interface ProductoBancario {
  nombre: string;
  tipo: 'cuenta' | 'tarjeta';
  icono: string;
  iconoColor: string;
  descripcion: string;
  saldoOculto: boolean;
}

interface ContactoPlin {
  nombre: string;
  avatar?: string;
  esNuevo: boolean;
}

/**
 * Componente principal de la vista Home
 * Requirements: 1, 18
 * - Mostrar productos bancarios del usuario
 * - Integrar botón flotante de Chicho con badge de notificaciones
 * - Navegación inferior
 * - Sidebar menu
 * - Sección de Plin
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MobileContainerComponent,
    FloatingButtonComponent,
    BottomNavigationComponent,
    SidebarMenuComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  notificationCount = 3;
  showSidebar = false;
  
  // Contactos Plin
  contactosPlin: ContactoPlin[] = [
    { nombre: 'Plinear a celular', esNuevo: false },
    { nombre: 'Agregar contacto', esNuevo: true },
    { nombre: 'Agregar contacto', esNuevo: true },
    { nombre: 'Agregar contacto', esNuevo: true },
    { nombre: 'Agregar contacto', esNuevo: true }
  ];

  // Productos bancarios del usuario
  productos: ProductoBancario[] = [
    {
      nombre: 'Personal',
      tipo: 'cuenta',
      icono: 'savings',
      iconoColor: '#f44883',
      descripcion: 'Saldo disponible',
      saldoOculto: true
    },
    {
      nombre: 'Esenciales',
      tipo: 'cuenta',
      icono: 'savings',
      iconoColor: '#f44883',
      descripcion: 'Saldo disponible',
      saldoOculto: true
    },
    {
      nombre: 'Mascotas',
      tipo: 'cuenta',
      icono: 'savings',
      iconoColor: '#f44883',
      descripcion: 'Saldo disponible',
      saldoOculto: true
    },
    {
      nombre: 'Cuenta Simple Dólares',
      tipo: 'cuenta',
      icono: 'savings',
      iconoColor: '#f44883',
      descripcion: 'Saldo disponible',
      saldoOculto: true
    },
    {
      nombre: 'The Platinum Card',
      tipo: 'tarjeta',
      icono: 'credit_card',
      iconoColor: '#05be50',
      descripcion: 'Línea disponible',
      saldoOculto: true
    }
  ];

  tipoCambio = {
    compra: 3.36,
    venta: 3.39
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

  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
  }

  closeSidebar(): void {
    this.showSidebar = false;
  }

  onFloatingButtonClick(): void {
    // Navegar al chat
    this.router.navigate(['/chat']);
  }

  onChatButtonClick(): void {
    // Navegar al chat
    this.router.navigate(['/chat']);
  }

  onPlinearClick(): void {
    console.log('Plinear a celular');
  }

  onAgregarContactoClick(): void {
    console.log('Agregar contacto Plin');
  }

  onProductoClick(producto: ProductoBancario): void {
    console.log('Producto seleccionado:', producto.nombre);
  }

  onEditarProductosClick(): void {
    console.log('Editar productos');
  }
}
