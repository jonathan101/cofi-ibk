import { Component, HostListener, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mobile-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mobile-container.component.html',
  styleUrl: './mobile-container.component.scss'
})
export class MobileContainerComponent {
  isMobile = false;

  @HostBinding('class.mobile-mode')
  get mobileMode() {
    return this.isMobile;
  }

  constructor() {
    this.detectDevice();
  }

  @HostListener('window:resize')
  onResize() {
    this.detectDevice();
  }

  private detectDevice(): void {
    // Detectar si es móvil basado en ancho de pantalla
    // Consideramos móvil si el ancho es menor o igual a 768px
    this.isMobile = window.innerWidth <= 768;
  }
}
