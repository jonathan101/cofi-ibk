import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

/**
 * Componente para crear un nuevo plan de ahorros
 * Basado en: OriginalHTMLs/plan-sin-config.html
 */
@Component({
  selector: 'app-crear-plan',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="crear-plan-container">
      <header class="header">
        <button class="icon-button" (click)="volver()" aria-label="Volver">
          <span class="material-symbols-outlined">menu</span>
        </button>
      </header>

      <main class="main-content">
        <div class="empty-state-card">
          <div class="icon-wrapper">
            <span class="material-symbols-outlined icon-main">savings</span>
            <span class="material-symbols-outlined icon-settings">settings</span>
          </div>
          
          <p class="message">
            Aún no has configurado tu Plan de Ahorros. ¡Empieza ahora a alcanzar tus metas!
          </p>
          
          <button class="btn-configurar" (click)="iniciarConfiguracion()">
            Configurar mi plan
          </button>
        </div>
      </main>
    </div>
  `,
  styles: [`
    @import '../../../../styles/variables';
    @import '../../../../styles/mixins';

    .crear-plan-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: #F2F4F5;

      @include dark-mode {
        background-color: var(--color-bg-dark);
      }
    }

    .header {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: $spacing-4 $spacing-6;
    }

    .icon-button {
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      color: #1C2D3A;
      cursor: pointer;

      @include dark-mode {
        color: #f6f7f8;
      }

      .material-symbols-outlined {
        font-size: 30px;
      }
    }

    .main-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: $spacing-6;
    }

    .empty-state-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: $spacing-6;
      max-width: 400px;
      width: 100%;
      padding: $spacing-8;
      background-color: var(--color-white);
      border-radius: $border-radius-xl;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

      @include dark-mode {
        background-color: #374151;
      }
    }

    .icon-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 128px;
      height: 128px;
    }

    .icon-main {
      font-size: 100px;
      color: #6B7B8B;

      @include dark-mode {
        color: #a0aec0;
      }
    }

    .icon-settings {
      position: absolute;
      bottom: -4px;
      right: -4px;
      padding: 4px;
      border-radius: 50%;
      background-color: var(--color-white);
      font-size: 36px;
      color: #6B7B8B;

      @include dark-mode {
        background-color: #374151;
        color: #a0aec0;
      }
    }

    .message {
      font-size: $font-size-lg;
      font-weight: $font-weight-medium;
      line-height: 1.5;
      text-align: center;
      color: #1C2D3A;
      margin: 0;

      @include dark-mode {
        color: #f6f7f8;
      }
    }

    .btn-configurar {
      width: 100%;
      padding: $spacing-4 $spacing-8;
      border: none;
      border-radius: $border-radius-full;
      background-color: #05be50;
      color: var(--color-white);
      font-size: $font-size-lg;
      font-weight: $font-weight-bold;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(5, 190, 80, 0.3);
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(5, 190, 80, 0.4);
      }

      &:active {
        transform: scale(1);
      }
    }
  `]
})
export class CrearPlanComponent {
  constructor(private router: Router) {}

  volver(): void {
    this.router.navigate(['/']);
  }

  iniciarConfiguracion(): void {
    // TODO: Navegar al flujo conversacional de configuración
    console.log('Iniciar configuración del plan');
    this.router.navigate(['/plan-ahorros/configurar']);
  }
}
