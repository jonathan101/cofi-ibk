import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recompensas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="recompensas-container">
      <h1>Recompensas</h1>
      <p>Vista de recompensas y beneficios (pendiente de implementación)</p>
    </div>
  `,
  styles: [`
    .recompensas-container {
      padding: 2rem;
      text-align: center;
    }
  `]
})
export class RecompensasComponent {}
