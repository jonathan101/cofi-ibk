import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-movimientos-caja-detalle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="movimientos-caja-detalle-container">
      <h2>Detalle Movimientos de Caja</h2>
      <p>Vista de detalle por tipo (pendiente de implementación)</p>
    </div>
  `,
  styles: [`
    .movimientos-caja-detalle-container {
      padding: 2rem;
    }
  `]
})
export class MovimientosCajaDetalleComponent {}
