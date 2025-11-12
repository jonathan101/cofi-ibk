import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lista-movimientos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="lista-movimientos-container">
      <h2>Lista de Movimientos</h2>
      <p>Lista cronológica con recategorización (pendiente de implementación)</p>
    </div>
  `,
  styles: [`
    .lista-movimientos-container {
      padding: 2rem;
    }
  `]
})
export class ListaMovimientosComponent {}
