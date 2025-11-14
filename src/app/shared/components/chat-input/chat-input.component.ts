import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.scss'
})
export class ChatInputComponent {
  @Output() onSendMessage = new EventEmitter<string>();

  messageText = '';

  handleSend(): void {
    const trimmedMessage = this.messageText.trim();
    if (trimmedMessage) {
      this.onSendMessage.emit(trimmedMessage);
      this.messageText = '';
    }
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.handleSend();
    }
  }
}
