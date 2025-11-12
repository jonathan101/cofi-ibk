import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-configurar-plan',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="configurar-plan-container">
      <h2>Configurar Plan</h2>
      <p>Configuración manual (pendiente de implementación)</p>
    </div>
  `,
  styles: [`
    .configurar-plan-container {
      padding: 2rem;
    }
  `]
})
export class ConfigurarPlanComponent {}
