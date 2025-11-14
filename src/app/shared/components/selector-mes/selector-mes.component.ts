import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-selector-mes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="selector-mes">
      <button 
        class="btn-nav" 
        [disabled]="!canGoPrevious()"
        (click)="navigatePrevious()">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"/>
        </svg>
      </button>
      
      <div class="mes-actual">
        <span class="mes-nombre">{{ mesActual }}</span>
        <span class="mes-indicador" *ngIf="isCurrentMonth()">Actual</span>
      </div>
      
      <button 
        class="btn-nav" 
        [disabled]="!canGoNext()"
        (click)="navigateNext()">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/>
        </svg>
      </button>
    </div>
  `,
  styles: [`
    .selector-mes {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      background-color: var(--color-bg-primary, #FFFFFF);
      border-bottom: 1px solid var(--color-border-light, #E0E0E0);
    }

    .btn-nav {
      background: none;
      border: none;
      padding: 0.5rem;
      cursor: pointer;
      color: var(--color-primary, #00A651);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background-color 0.2s ease;
    }

    .btn-nav:hover:not(:disabled) {
      background-color: var(--color-bg-secondary, #F5F5F5);
    }

    .btn-nav:disabled {
      color: var(--color-text-disabled, #CCCCCC);
      cursor: not-allowed;
    }

    .mes-actual {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }

    .mes-nombre {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-text-primary, #333333);
    }

    .mes-indicador {
      font-size: 0.75rem;
      color: var(--color-primary, #00A651);
      font-weight: 500;
    }
  `]
})
export class SelectorMesComponent {
  @Input() mesActual: string = 'Noviembre 2024';
  @Input() mesesDisponibles: string[] = ['Agosto 2024', 'Septiembre 2024', 'Octubre 2024', 'Noviembre 2024'];
  
  @Output() onMesChange = new EventEmitter<string>();

  canGoPrevious(): boolean {
    const currentIndex = this.mesesDisponibles.indexOf(this.mesActual);
    return currentIndex > 0;
  }

  canGoNext(): boolean {
    const currentIndex = this.mesesDisponibles.indexOf(this.mesActual);
    return currentIndex < this.mesesDisponibles.length - 1;
  }

  navigatePrevious(): void {
    if (this.canGoPrevious()) {
      const currentIndex = this.mesesDisponibles.indexOf(this.mesActual);
      const newMes = this.mesesDisponibles[currentIndex - 1];
      this.onMesChange.emit(newMes);
    }
  }

  navigateNext(): void {
    if (this.canGoNext()) {
      const currentIndex = this.mesesDisponibles.indexOf(this.mesActual);
      const newMes = this.mesesDisponibles[currentIndex + 1];
      this.onMesChange.emit(newMes);
    }
  }

  isCurrentMonth(): boolean {
    return this.mesActual === 'Noviembre 2024';
  }
}
