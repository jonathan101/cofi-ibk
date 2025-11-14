import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../core/services/chat.service';
import { ChatConfig } from '../../../core/models/mensaje-unificado.interface';

/**
 * Modal de configuración del chat
 * Permite filtrar tipos de comunicación: alertas, recompensas, conversaciones
 * Requirement 5
 */
@Component({
  selector: 'app-chat-config-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-config-modal.component.html',
  styleUrl: './chat-config-modal.component.scss'
})
export class ChatConfigModalComponent implements OnInit {
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<void>();

  config: ChatConfig = {
    showAlerts: true,
    showRewards: true,
    showConversations: true
  };

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    // Cargar configuración actual
    this.chatService.getChatConfig().subscribe(config => {
      this.config = { ...config };
    });
  }

  handleClose(): void {
    this.onClose.emit();
  }

  handleSave(): void {
    // Guardar configuración en el servicio
    this.chatService.updateChatConfig(this.config);
    this.onSave.emit();
  }

  handleBackdropClick(event: MouseEvent): void {
    // Cerrar modal si se hace clic en el backdrop
    if (event.target === event.currentTarget) {
      this.handleClose();
    }
  }
}
