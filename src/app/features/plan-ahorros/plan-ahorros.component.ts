import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-plan-ahorros',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="plan-ahorros-container">
      <h1>Plan de Ahorros</h1>
      <p>Vista principal del plan (pendiente de implementación)</p>
    </div>
  `,
  styles: [`
    .plan-ahorros-container {
      padding: 2rem;
      text-align: center;
    }
  `]
})
export class PlanAhorrosComponent {}
