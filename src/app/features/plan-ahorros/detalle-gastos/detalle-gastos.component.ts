import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detalle-gastos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="detalle-gastos-container">
      <h2>Detalle de Gastos</h2>
      <p>Vista con filtros y gráfico (pendiente de implementación)</p>
    </div>
  `,
  styles: [`
    .detalle-gastos-container {
      padding: 2rem;
    }
  `]
})
export class DetalleGastosComponent {}
