import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reward } from '../../../core/models/reward.interface';

/**
 * Componente para mostrar promociones destacadas
 * Requirement 5: Mostrar promociones destacadas
 */
@Component({
  selector: 'app-promocion-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './promocion-card.component.html',
  styleUrl: './promocion-card.component.scss'
})
export class PromocionCardComponent {
  @Input() recompensa!: Reward;
  
  @Output() onAction = new EventEmitter<string>();

  handleAction(): void {
    this.onAction.emit(this.recompensa.id);
  }

  hasDiscount(): boolean {
    return !!this.recompensa.discount;
  }

  getDiscountText(): string {
    return this.recompensa.discount || '';
  }
}
