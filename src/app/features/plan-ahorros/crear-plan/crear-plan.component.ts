import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-crear-plan',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="crear-plan-container">
      <h2>Crear Plan de Ahorros</h2>
      <p>Flujo conversacional (pendiente de implementación)</p>
    </div>
  `,
  styles: [`
    .crear-plan-container {
      padding: 2rem;
    }
  `]
})
export class CrearPlanComponent {}
