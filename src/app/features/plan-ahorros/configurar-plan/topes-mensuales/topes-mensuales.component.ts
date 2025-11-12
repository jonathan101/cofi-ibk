import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-topes-mensuales',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="topes-mensuales-container">
      <h2>Topes Mensuales</h2>
      <p>Configuración de topes (pendiente de implementación)</p>
    </div>
  `,
  styles: [`
    .topes-mensuales-container {
      padding: 2rem;
    }
  `]
})
export class TopesMensualesComponent {}
