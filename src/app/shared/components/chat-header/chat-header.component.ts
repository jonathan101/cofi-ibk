import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-header.component.html',
  styleUrl: './chat-header.component.scss'
})
export class ChatHeaderComponent {
  @Output() onClose = new EventEmitter<void>();
  @Output() onConfig = new EventEmitter<void>();

  handleClose(): void {
    this.onClose.emit();
  }

  handleConfig(): void {
    this.onConfig.emit();
  }
}
