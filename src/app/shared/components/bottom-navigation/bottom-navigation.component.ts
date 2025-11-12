import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

/**
 * Componente de navegación inferior
 * Requirement 18: Navegación entre secciones de la aplicación
 */
@Component({
  selector: 'app-bottom-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bottom-navigation.component.html',
  styleUrl: './bottom-navigation.component.scss'
})
export class BottomNavigationComponent {
  navigationItems = [
    {
      label: 'Inicio',
      icon: 'home',
      route: '/home',
      active: true
    },
    {
      label: 'Plan',
      icon: 'savings',
      route: '/plan-ahorros',
      active: false
    },
    {
      label: 'Recompensas',
      icon: 'gift',
      route: '/recompensas',
      active: false
    },
    {
      label: 'Alertas',
      icon: 'notifications',
      route: '/alertas',
      active: false
    }
  ];

  constructor(private router: Router) {}

  isActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }
}
