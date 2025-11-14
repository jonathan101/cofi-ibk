import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ConfigMenuItem } from '../../../core/models/config-menu-item.interface';

@Component({
  selector: 'app-plan-settings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './plan-settings.component.html',
  styleUrls: ['./plan-settings.component.scss']
})
export class PlanSettingsComponent {
  menuItems: ConfigMenuItem[] = [
    { 
      icon: 'payments', 
      label: 'Ingreso Mensual Neto', 
      route: '/plan-ahorros/configuracion/ingreso-neto' 
    },
    { 
      icon: 'flag', 
      label: 'Meta de Ahorro', 
      route: '/plan-ahorros/configuracion/meta-ahorro' 
    },
    { 
      icon: 'savings', 
      label: 'Chanchito Seleccionado', 
      route: '/plan-ahorros/configuracion/chanchito', 
      filled: true 
    },
    { 
      icon: 'category', 
      label: 'Categorización de Gastos', 
      route: '/plan-ahorros/configuracion/gastos' 
    },
    { 
      icon: 'trending_down', 
      label: 'Topes de Consumo', 
      route: '/plan-ahorros/configuracion/topes' 
    },
    { 
      icon: 'autorenew', 
      label: 'Operaciones Recurrentes', 
      route: '/plan-ahorros/configuracion/operaciones-recurrentes' 
    }
  ];

  constructor(private router: Router) {}

  /**
   * Navega a la ruta especificada
   */
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  /**
   * Abre el chat con IA para configurar el plan
   * TODO: Implementar integración con chat de IA
   */
  openAIChat(): void {
    // Placeholder: navegar al chat con contexto de configuración
    this.router.navigate(['/chat'], { 
      queryParams: { context: 'configuracion-plan' } 
    });
  }

  /**
   * Vuelve a la vista anterior
   */
  goBack(): void {
    this.router.navigate(['/plan-ahorros']);
  }
}
