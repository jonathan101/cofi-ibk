import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-operaciones-recurrentes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="operaciones-recurrentes-container">
      <h2>Operaciones Recurrentes</h2>
      <p>CRUD de operaciones recurrentes (pendiente de implementación)</p>
    </div>
  `,
  styles: [`
    .operaciones-recurrentes-container {
      padding: 2rem;
    }
  `]
})
export class OperacionesRecurrentesComponent {}
