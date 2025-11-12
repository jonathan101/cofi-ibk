import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chat-container">
      <h1>Chat con Chicho</h1>
      <p>Vista de chat (pendiente de implementación)</p>
    </div>
  `,
  styles: [`
    .chat-container {
      padding: 2rem;
      text-align: center;
    }
  `]
})
export class ChatComponent {}
