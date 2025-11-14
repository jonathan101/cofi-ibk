import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente de gesto drag-to-save para transferir al ahorro
 * Requirement 29: Gesto intuitivo de arrastre para ahorro
 */
@Component({
  selector: 'app-drag-to-save',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './drag-to-save.component.html',
  styleUrls: ['./drag-to-save.component.scss']
})
export class DragToSaveComponent implements OnInit, OnDestroy {
  @Input() mesActual = false; // Solo se muestra en mes actual
  @Output() dragComplete = new EventEmitter<void>();

  // Estado del drag
  isDragging = false;
  dragStartX = 0;
  dragStartY = 0;
  currentX = 0;
  currentY = 0;
  translateX = 0;
  translateY = 0;

  // Posiciones de elementos
  moneyIconRect: DOMRect | null = null;
  piggyBankRect: DOMRect | null = null;

  // Threshold para considerar drag completo (en píxeles)
  private readonly DRAG_THRESHOLD = 100;

  ngOnInit(): void {
    // Inicializar posiciones después de que el DOM esté listo
    setTimeout(() => {
      this.updatePositions();
    }, 100);
  }

  ngOnDestroy(): void {
    // Limpiar event listeners si existen
    this.stopDragging();
  }

  /**
   * Inicia el arrastre (mouse o touch)
   */
  startDragging(event: MouseEvent | TouchEvent): void {
    if (!this.mesActual) return;

    this.isDragging = true;
    this.updatePositions();

    const clientX = this.getClientX(event);
    const clientY = this.getClientY(event);

    this.dragStartX = clientX;
    this.dragStartY = clientY;
    this.currentX = clientX;
    this.currentY = clientY;

    // Prevenir scroll en móvil
    event.preventDefault();

    // Agregar event listeners para el movimiento
    if (event instanceof MouseEvent) {
      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup', this.onMouseUp);
    } else {
      document.addEventListener('touchmove', this.onTouchMove, { passive: false });
      document.addEventListener('touchend', this.onTouchEnd);
    }
  }

  /**
   * Maneja el movimiento del mouse
   */
  private onMouseMove = (event: MouseEvent): void => {
    if (!this.isDragging) return;

    this.currentX = event.clientX;
    this.currentY = event.clientY;
    this.updateTranslation();
  };

  /**
   * Maneja el movimiento del touch
   */
  private onTouchMove = (event: TouchEvent): void => {
    if (!this.isDragging) return;

    event.preventDefault();
    this.currentX = event.touches[0].clientX;
    this.currentY = event.touches[0].clientY;
    this.updateTranslation();
  };

  /**
   * Maneja el fin del arrastre (mouse)
   */
  private onMouseUp = (): void => {
    this.stopDragging();
  };

  /**
   * Maneja el fin del arrastre (touch)
   */
  private onTouchEnd = (): void => {
    this.stopDragging();
  };

  /**
   * Detiene el arrastre y verifica si se completó
   */
  private stopDragging(): void {
    if (!this.isDragging) return;

    // Verificar si el drag fue exitoso
    if (this.checkDragSuccess()) {
      this.dragComplete.emit();
    }

    // Reset estado
    this.isDragging = false;
    this.translateX = 0;
    this.translateY = 0;

    // Remover event listeners
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('touchmove', this.onTouchMove);
    document.removeEventListener('touchend', this.onTouchEnd);
  }

  /**
   * Actualiza la traducción del icono de dinero
   */
  private updateTranslation(): void {
    this.translateX = this.currentX - this.dragStartX;
    this.translateY = this.currentY - this.dragStartY;
  }

  /**
   * Verifica si el drag fue exitoso (llegó al chanchito)
   */
  private checkDragSuccess(): boolean {
    if (!this.moneyIconRect || !this.piggyBankRect) {
      return false;
    }

    // Calcular posición actual del icono de dinero
    const moneyX = this.moneyIconRect.left + this.translateX + this.moneyIconRect.width / 2;
    const moneyY = this.moneyIconRect.top + this.translateY + this.moneyIconRect.height / 2;

    // Verificar si está dentro del área del chanchito
    const isInPiggyBank = 
      moneyX >= this.piggyBankRect.left &&
      moneyX <= this.piggyBankRect.right &&
      moneyY >= this.piggyBankRect.top &&
      moneyY <= this.piggyBankRect.bottom;

    return isInPiggyBank;
  }

  /**
   * Actualiza las posiciones de los elementos
   */
  private updatePositions(): void {
    const moneyIcon = document.querySelector('.money-icon') as HTMLElement;
    const piggyBank = document.querySelector('.piggy-bank-target') as HTMLElement;

    if (moneyIcon) {
      this.moneyIconRect = moneyIcon.getBoundingClientRect();
    }

    if (piggyBank) {
      this.piggyBankRect = piggyBank.getBoundingClientRect();
    }
  }

  /**
   * Obtiene la coordenada X del evento
   */
  private getClientX(event: MouseEvent | TouchEvent): number {
    return event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
  }

  /**
   * Obtiene la coordenada Y del evento
   */
  private getClientY(event: MouseEvent | TouchEvent): number {
    return event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
  }

  /**
   * Obtiene el estilo de transformación para el icono de dinero
   */
  getMoneyIconTransform(): string {
    if (!this.isDragging) {
      return 'translate(0, 0)';
    }
    return `translate(${this.translateX}px, ${this.translateY}px)`;
  }

  /**
   * Verifica si el icono está cerca del chanchito
   */
  isNearPiggyBank(): boolean {
    if (!this.isDragging || !this.moneyIconRect || !this.piggyBankRect) {
      return false;
    }

    const moneyX = this.moneyIconRect.left + this.translateX + this.moneyIconRect.width / 2;
    const moneyY = this.moneyIconRect.top + this.translateY + this.moneyIconRect.height / 2;

    const piggyX = this.piggyBankRect.left + this.piggyBankRect.width / 2;
    const piggyY = this.piggyBankRect.top + this.piggyBankRect.height / 2;

    const distance = Math.sqrt(
      Math.pow(moneyX - piggyX, 2) + Math.pow(moneyY - piggyY, 2)
    );

    return distance < this.DRAG_THRESHOLD;
  }
}
