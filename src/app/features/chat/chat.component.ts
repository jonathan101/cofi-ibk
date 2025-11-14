import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ChatService } from '../../core/services/chat.service';
import { MensajeUnificado } from '../../core/models/mensaje-unificado.interface';
import { ChatHeaderComponent } from '../../shared/components/chat-header/chat-header.component';
import { ChatMessagesComponent } from '../../shared/components/chat-messages/chat-messages.component';
import { ChatInputComponent } from '../../shared/components/chat-input/chat-input.component';
import { ChatConfigModalComponent } from '../../shared/components/chat-config-modal/chat-config-modal.component';
import { SidebarMenuComponent } from '../../shared/components/sidebar-menu/sidebar-menu.component';
import { PullDownHandleComponent } from '../../shared/components/pull-down-handle/pull-down-handle.component';

export type FilterType = 'alerts' | 'rewards' | 'history';

/**
 * Componente principal del chat con Chicho
 * Requirements: 2, 3, 4
 */
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ChatHeaderComponent,
    ChatMessagesComponent,
    ChatInputComponent,
    ChatConfigModalComponent,
    SidebarMenuComponent,
    PullDownHandleComponent
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: MensajeUnificado[] = [];
  filteredMessages: MensajeUnificado[] = [];
  isLoading = false;
  showConfigModal = false;
  showSidebar = false;
  showFilterMenu = false;
  searchText = '';
  
  // Filtros múltiples - todos seleccionados por defecto
  activeFilters: Set<FilterType> = new Set(['alerts', 'rewards', 'history']);
  
  private destroy$ = new Subject<void>();

  constructor(
    private chatService: ChatService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMessages();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga la lista unificada de mensajes
   */
  loadMessages(): void {
    this.isLoading = true;
    this.chatService.getListaUnificada()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (messages) => {
          // Invertir el orden para mostrar más recientes al final
          this.messages = messages.reverse();
          // Aplicar filtros iniciales
          this.filteredMessages = this.applyFilter(this.messages);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error cargando mensajes:', error);
          this.isLoading = false;
        }
      });
  }

  /**
   * Filtra mensajes basado en el texto de búsqueda
   * Búsqueda sin orden y sin sensibilidad a mayúsculas/minúsculas
   */
  onSearchChange(): void {
    if (!this.searchText.trim()) {
      this.filteredMessages = this.applyFilter(this.messages);
      return;
    }

    const keywords = this.searchText.toLowerCase().split(' ').filter(k => k.length > 0);
    
    const filtered = this.messages.filter(message => {
      const content = (message.contenido || message.texto || '').toLowerCase();
      // Todos los keywords deben estar presentes (sin importar el orden)
      return keywords.every(keyword => content.includes(keyword));
    });

    this.filteredMessages = this.applyFilter(filtered);
  }

  /**
   * Aplica los filtros activos a los mensajes
   */
  private applyFilter(messages: MensajeUnificado[]): MensajeUnificado[] {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    // Si no hay filtros activos, mostrar solo chats de hoy
    if (this.activeFilters.size === 0) {
      return messages.filter(m => {
        if (m.tipo !== 'chat') return false;
        const messageDate = new Date(m.timestamp);
        messageDate.setHours(0, 0, 0, 0);
        return messageDate.getTime() >= today.getTime();
      });
    }

    return messages.filter(m => {
      let shouldShow = false;
      
      // Verificar si es una alerta y el filtro de alertas está activo
      if (m.tipo === 'alerta' && this.activeFilters.has('alerts')) {
        shouldShow = true;
      }
      
      // Verificar si es una recompensa y el filtro de recompensas está activo
      if (m.tipo === 'recompensa' && this.activeFilters.has('rewards')) {
        shouldShow = true;
      }
      
      // Para mensajes de chat
      if (m.tipo === 'chat') {
        const messageDate = new Date(m.timestamp);
        messageDate.setHours(0, 0, 0, 0);
        
        // Siempre mostrar mensajes de hoy o más recientes
        if (messageDate.getTime() >= today.getTime()) {
          shouldShow = true;
        }
        // Mostrar mensajes históricos (anteriores a hoy) solo si el filtro está activo
        else if (this.activeFilters.has('history') && messageDate < today) {
          shouldShow = true;
        }
      }
      
      return shouldShow;
    });
  }



  /**
   * Toggle de un filtro específico (selección múltiple)
   */
  toggleFilter(filter: FilterType): void {
    if (this.activeFilters.has(filter)) {
      this.activeFilters.delete(filter);
    } else {
      this.activeFilters.add(filter);
    }
    this.onSearchChange(); // Reaplica búsqueda con nuevos filtros
  }

  /**
   * Verifica si un filtro está activo
   */
  isFilterActive(filter: FilterType): boolean {
    return this.activeFilters.has(filter);
  }

  /**
   * Toggle del menú de filtros
   */
  toggleFilterMenu(): void {
    this.showFilterMenu = !this.showFilterMenu;
  }

  /**
   * Toggle del sidebar
   */
  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
  }

  /**
   * Cierra el sidebar
   */
  closeSidebar(): void {
    this.showSidebar = false;
  }

  /**
   * Maneja el envío de un mensaje del usuario
   */
  handleSendMessage(messageText: string): void {
    // Agregar mensaje del usuario
    const userMessage = this.chatService.addUserMessage(messageText);
    this.messages.push(userMessage);
    this.filteredMessages.push(userMessage);

    // Enviar mensaje y obtener respuesta
    this.isLoading = true;
    this.chatService.sendMessage(messageText)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.messages.push(response);
          this.filteredMessages.push(response);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error enviando mensaje:', error);
          this.isLoading = false;
        }
      });
  }

  /**
   * Cierra el chat y vuelve a la vista anterior
   */
  handleClose(): void {
    this.router.navigate(['/']);
  }

  /**
   * Abre el modal de configuración
   */
  handleOpenConfig(): void {
    this.showConfigModal = true;
  }

  /**
   * Cierra el modal de configuración
   */
  handleCloseConfig(): void {
    this.showConfigModal = false;
  }

  /**
   * Maneja el cambio de configuración y recarga mensajes
   */
  handleConfigChange(): void {
    this.showConfigModal = false;
    this.loadMessages();
  }

  /**
   * Maneja el evento de arrastrar hacia abajo para volver al home
   */
  onPullDown(): void {
    this.router.navigate(['/home']);
  }
}
