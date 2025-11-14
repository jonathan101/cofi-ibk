import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reward } from '../../../core/models/reward.interface';
import { RewardCardComponent } from '../reward-card/reward-card.component';

/**
 * Componente para mostrar una categoría de recompensas
 * Requirement 5: Mostrar categorías de beneficios
 */
@Component({
  selector: 'app-recompensa-category',
  standalone: true,
  imports: [CommonModule, RewardCardComponent],
  templateUrl: './recompensa-category.component.html',
  styleUrl: './recompensa-category.component.scss'
})
export class RecompensaCategoryComponent {
  @Input() category!: 'descuento' | 'promocion' | 'ampliacion-tc' | 'tipo-cambio';
  @Input() recompensas: Reward[] = [];
  @Input() collapsed = false;
  
  @Output() onRewardAction = new EventEmitter<string>();
  @Output() onToggle = new EventEmitter<void>();

  getCategoryTitle(): string {
    const titles = {
      'descuento': 'Descuentos',
      'promocion': 'Promociones',
      'ampliacion-tc': 'Ampliación de Tarjeta',
      'tipo-cambio': 'Tipo de Cambio Preferencial'
    };
    return titles[this.category];
  }

  getCategoryIcon(): string {
    const icons = {
      'descuento': '🏷️',
      'promocion': '🎁',
      'ampliacion-tc': '💳',
      'tipo-cambio': '💱'
    };
    return icons[this.category];
  }

  getCategoryDescription(): string {
    const descriptions = {
      'descuento': 'Aprovecha descuentos exclusivos en tus comercios favoritos',
      'promocion': 'Promociones especiales para clientes Interbank',
      'ampliacion-tc': 'Aumenta tu línea de crédito según tu comportamiento',
      'tipo-cambio': 'Accede a tipos de cambio preferenciales'
    };
    return descriptions[this.category];
  }

  toggle(): void {
    this.onToggle.emit();
  }

  handleRewardAction(rewardId: string): void {
    this.onRewardAction.emit(rewardId);
  }
}
