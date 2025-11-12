import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert-card.component.html',
  styleUrl: './alert-card.component.scss'
})
export class AlertCardComponent {
  @Input() titulo = '';
  @Input() subtitulo = '';
  @Input() icono = '';
  @Input() textoBoton = '';
  @Input() severidad: 'warning' | 'danger' | 'info' = 'info';
  
  @Output() onAction = new EventEmitter<void>();

  handleAction(): void {
    this.onAction.emit();
  }

  getSeverityIcon(): string {
    switch (this.severidad) {
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
}
