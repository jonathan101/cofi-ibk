import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-floating-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './floating-button.component.html',
  styleUrl: './floating-button.component.scss'
})
export class FloatingButtonComponent {
  @Input() notificationCount = 0;
  @Output() onClick = new EventEmitter<void>();

  handleClick(): void {
    this.onClick.emit();
  }
}
