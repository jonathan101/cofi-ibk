import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clasificacion-gastos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="clasificacion-gastos-container">
      <h2>Clasificación de Gastos</h2>
      <p>Configuración de clasificación (pendiente de implementación)</p>
    </div>
  `,
  styles: [`
    .clasificacion-gastos-container {
      padding: 2rem;
    }
  `]
})
export class ClasificacionGastosComponent {}
