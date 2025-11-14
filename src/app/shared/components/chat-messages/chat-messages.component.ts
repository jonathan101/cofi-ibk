import { Component, Input, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MensajeUnificado } from '../../../core/models/mensaje-unificado.interface';
import { ChatMessageComponent } from '../chat-message/chat-message.component';

@Component({
  selector: 'app-chat-messages',
  standalone: true,
  imports: [CommonModule, ChatMessageComponent],
  templateUrl: './chat-messages.component.html',
  styleUrl: './chat-messages.component.scss'
})
export class ChatMessagesComponent implements AfterViewChecked {
  @Input() messages: MensajeUnificado[] = [];
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  private shouldScrollToBottom = false;

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnChanges(): void {
    // Scroll cuando cambien los mensajes
    this.shouldScrollToBottom = true;
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = 
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error al hacer scroll:', err);
    }
  }

  trackByMessageId(index: number, message: MensajeUnificado): string {
    return message.id;
  }
}
