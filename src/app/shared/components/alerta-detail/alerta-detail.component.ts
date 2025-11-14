import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Alert } from '../../../core/models/alert.interface';

/**
 * Componente para mostrar el detalle de una alerta
 * Requirement 3: Mostrar detalle de alertas con acciones sugeridas
 */
@Component({
  selector: 'app-alerta-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alerta-detail.component.html',
  styleUrl: './alerta-detail.component.scss'
})
export class AlertaDetailComponent {
  @Input() alert!: Alert;
  @Input() expanded = false;
  
  @Output() onMarkAsRead = new EventEmitter<string>();
  @Output() onDismiss = new EventEmitter<string>();
  @Output() onAction = new EventEmitter<string>();
  @Output() onToggle = new EventEmitter<void>();

  markAsRead(): void {
    this.onMarkAsRead.emit(this.alert.id);
  }

  dismiss(): void {
    this.onDismiss.emit(this.alert.id);
  }

  executeAction(): void {
    this.onAction.emit(this.alert.id);
  }

  toggle(): void {
    this.onToggle.emit();
  }

  getSeverityClass(): string {
    return `severity-${this.alert.severity}`;
  }

  getSeverityIcon(): string {
    switch (this.alert.severity) {
      case 'warning':
        return '⚠️';
      case 'danger':
        return '🚨';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    
    return new Date(date).toLocaleDateString('es-PE', { 
      day: 'numeric', 
      month: 'short' 
    });
  }

  formatAmount(amount?: number): string {
    if (!amount) return '';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  }
}
