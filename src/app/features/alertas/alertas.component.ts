import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AlertasService } from '../../core/services/alertas.service';
import { Alert } from '../../core/models/alert.interface';
import { AlertaDetailComponent } from '../../shared/components/alerta-detail/alerta-detail.component';
import { SidebarMenuComponent } from '../../shared/components/sidebar-menu/sidebar-menu.component';
import { PullDownHandleComponent } from '../../shared/components/pull-down-handle/pull-down-handle.component';

/**
 * Componente principal de Alertas
 * Requirement 3: Vista de alertas financieras con filtros por severidad
 */
@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule, AlertaDetailComponent, SidebarMenuComponent, PullDownHandleComponent],
  templateUrl: './alertas.component.html',
  styleUrl: './alertas.component.scss'
})
export class AlertasComponent implements OnInit {
  alertas: Alert[] = [];
  alertasFiltradas: Alert[] = [];
  filtroActivo: 'todas' | 'warning' | 'danger' | 'info' = 'todas';
  expandedAlertId: string | null = null;
  loading = true;
  unreadCount = 0;
  showSidebar = false;

  constructor(
    private alertasService: AlertasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarAlertas();
  }

  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
  }

  closeSidebar(): void {
    this.showSidebar = false;
  }

  cargarAlertas(): void {
    this.loading = true;
    this.alertasService.getAlertas().subscribe({
      next: (alertas) => {
        this.alertas = alertas;
        this.aplicarFiltro();
        this.actualizarContadorNoLeidas();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando alertas:', error);
        this.loading = false;
      }
    });
  }

  aplicarFiltro(): void {
    if (this.filtroActivo === 'todas') {
      this.alertasFiltradas = [...this.alertas];
    } else {
      this.alertasFiltradas = this.alertas.filter(
        a => a.severity === this.filtroActivo
      );
    }
    
    // Ordenar por fecha (más recientes primero) y no leídas primero
    this.alertasFiltradas.sort((a, b) => {
      if (a.isRead !== b.isRead) {
        return a.isRead ? 1 : -1;
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  cambiarFiltro(filtro: 'todas' | 'warning' | 'danger' | 'info'): void {
    this.filtroActivo = filtro;
    this.aplicarFiltro();
  }

  toggleExpanded(alertId: string): void {
    this.expandedAlertId = this.expandedAlertId === alertId ? null : alertId;
  }

  isExpanded(alertId: string): boolean {
    return this.expandedAlertId === alertId;
  }

  marcarComoLeida(alertId: string): void {
    this.alertasService.markAsRead(alertId).subscribe({
      next: () => {
        const alerta = this.alertas.find(a => a.id === alertId);
        if (alerta) {
          alerta.isRead = true;
          this.actualizarContadorNoLeidas();
        }
      },
      error: (error) => {
        console.error('Error marcando alerta como leída:', error);
      }
    });
  }

  descartarAlerta(alertId: string): void {
    this.alertasService.dismissAlert(alertId).subscribe({
      next: () => {
        this.alertas = this.alertas.filter(a => a.id !== alertId);
        this.aplicarFiltro();
        this.actualizarContadorNoLeidas();
        if (this.expandedAlertId === alertId) {
          this.expandedAlertId = null;
        }
      },
      error: (error) => {
        console.error('Error descartando alerta:', error);
      }
    });
  }

  ejecutarAccion(alertId: string): void {
    const alerta = this.alertas.find(a => a.id === alertId);
    if (alerta?.actionUrl) {
      // TODO: Navegar a la URL de acción o ejecutar acción específica
      console.log('Ejecutando acción para alerta:', alertId, alerta.actionUrl);
    }
    
    // Marcar como leída al ejecutar acción
    this.marcarComoLeida(alertId);
  }

  marcarTodasComoLeidas(): void {
    this.alertasService.markAllAsRead().subscribe({
      next: () => {
        this.alertas.forEach(a => a.isRead = true);
        this.actualizarContadorNoLeidas();
      },
      error: (error) => {
        console.error('Error marcando todas como leídas:', error);
      }
    });
  }

  actualizarContadorNoLeidas(): void {
    this.unreadCount = this.alertas.filter(a => !a.isRead).length;
  }

  refrescar(): void {
    this.cargarAlertas();
  }

  getContadorPorSeveridad(severity: 'warning' | 'danger' | 'info'): number {
    return this.alertas.filter(a => a.severity === severity).length;
  }

  getFiltroLabel(filtro: 'todas' | 'warning' | 'danger' | 'info'): string {
    const labels = {
      'todas': 'Todas',
      'warning': 'Advertencias',
      'danger': 'Urgentes',
      'info': 'Informativas'
    };
    return labels[filtro];
  }

  /**
   * Maneja el evento de arrastrar hacia abajo para volver al home
   */
  onPullDown(): void {
    this.router.navigate(['/home']);
  }
}
