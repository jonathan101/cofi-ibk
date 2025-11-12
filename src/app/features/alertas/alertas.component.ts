import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="alertas-container">
      <h1>Alertas</h1>
      <p>Vista de alertas financieras (pendiente de implementación)</p>
    </div>
  `,
  styles: [`
    .alertas-container {
      padding: 2rem;
      text-align: center;
    }
  `]
})
export class AlertasComponent {}
