import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reward-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reward-card.component.html',
  styleUrl: './reward-card.component.scss'
})
export class RewardCardComponent {
  @Input() titulo = '';
  @Input() subtitulo = '';
  @Input() icono = '';
  @Input() imagen = '';
  @Input() textoBoton = '';
  
  @Output() onAction = new EventEmitter<void>();

  handleAction(): void {
    this.onAction.emit();
  }
}
