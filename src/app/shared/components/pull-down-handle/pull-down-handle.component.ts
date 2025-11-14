import { Component, Output, EventEmitter, HostListener, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente de handle para arrastrar hacia abajo y minimizar vistas
 * Permite al usuario volver al home arrastrando hacia abajo
 * Transiciona toda la vista, no solo el handle
 */
@Component({
  selector: 'app-pull-down-handle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pull-down-handle.component.html',
  styleUrls: ['./pull-down-handle.component.scss']
})
export class PullDownHandleComponent {
  @Output() pullDown = new EventEmitter<void>();

  private startY = 0;
  private currentY = 0;
  private isDragging = false;
  readonly THRESHOLD = 150; // Distancia mínima para activar el cierre (público para el template)
  private containerElement: HTMLElement | null = null;

  pullDistance = 0;
  isTransitioning = false;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit(): void {
    // Obtener el contenedor padre (la vista completa)
    this.containerElement = this.elementRef.nativeElement.closest('.plan-ahorros-container, .chat-container, .alertas-container, .recompensas-container');
  }

  onTouchStart(event: TouchEvent): void {
    if (this.isTransitioning) return;
    this.startY = event.touches[0].clientY;
    this.isDragging = true;
    
    // Deshabilitar transición durante el arrastre
    if (this.containerElement) {
      this.renderer.setStyle(this.containerElement, 'transition', 'none');
    }
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.isDragging || this.isTransitioning) return;

    this.currentY = event.touches[0].clientY;
    this.pullDistance = Math.max(0, this.currentY - this.startY);

    // Aplicar transformación a todo el contenedor
    if (this.containerElement && this.pullDistance > 0) {
      this.renderer.setStyle(this.containerElement, 'transform', `translateY(${this.pullDistance}px)`);
      event.preventDefault();
    }
  }

  onTouchEnd(): void {
    if (!this.isDragging || this.isTransitioning) return;

    this.isDragging = false;

    if (this.containerElement) {
      // Habilitar transición para la animación de retorno
      this.renderer.setStyle(this.containerElement, 'transition', 'transform 0.3s ease-out');

      if (this.pullDistance >= this.THRESHOLD) {
        // Animar hacia abajo y luego navegar
        this.isTransitioning = true;
        this.renderer.setStyle(this.containerElement, 'transform', 'translateY(100%)');
        
        setTimeout(() => {
          this.pullDown.emit();
          this.isTransitioning = false;
        }, 300);
      } else {
        // Volver a la posición original
        this.renderer.setStyle(this.containerElement, 'transform', 'translateY(0)');
      }
    }

    // Reset
    this.pullDistance = 0;
  }

  onMouseDown(event: MouseEvent): void {
    if (this.isTransitioning) return;
    this.startY = event.clientY;
    this.isDragging = true;
    
    // Deshabilitar transición durante el arrastre
    if (this.containerElement) {
      this.renderer.setStyle(this.containerElement, 'transition', 'none');
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging || this.isTransitioning) return;

    this.currentY = event.clientY;
    this.pullDistance = Math.max(0, this.currentY - this.startY);

    // Aplicar transformación a todo el contenedor
    if (this.containerElement && this.pullDistance > 0) {
      this.renderer.setStyle(this.containerElement, 'transform', `translateY(${this.pullDistance}px)`);
    }
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    if (!this.isDragging || this.isTransitioning) return;

    this.isDragging = false;

    if (this.containerElement) {
      // Habilitar transición para la animación de retorno
      this.renderer.setStyle(this.containerElement, 'transition', 'transform 0.3s ease-out');

      if (this.pullDistance >= this.THRESHOLD) {
        // Animar hacia abajo y luego navegar
        this.isTransitioning = true;
        this.renderer.setStyle(this.containerElement, 'transform', 'translateY(100%)');
        
        setTimeout(() => {
          this.pullDown.emit();
          this.isTransitioning = false;
        }, 300);
      } else {
        // Volver a la posición original
        this.renderer.setStyle(this.containerElement, 'transform', 'translateY(0)');
      }
    }

    // Reset
    this.pullDistance = 0;
  }

  getHandleStyle(): any {
    const opacity = this.pullDistance > 0 ? 1 - Math.min(this.pullDistance / this.THRESHOLD, 0.5) : 1;
    return {
      opacity
    };
  }

  getProgressPercentage(): number {
    return Math.min((this.pullDistance / this.THRESHOLD) * 100, 100);
  }
}
