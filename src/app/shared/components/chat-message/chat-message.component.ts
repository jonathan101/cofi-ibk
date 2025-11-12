import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MensajeUnificado } from '../../../core/models/mensaje-unificado.interface';
import { AlertCardComponent } from '../alert-card/alert-card.component';
import { RewardCardComponent } from '../reward-card/reward-card.component';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule, AlertCardComponent, RewardCardComponent],
  templateUrl: './chat-message.component.html',
  styleUrl: './chat-message.component.scss'
})
export class ChatMessageComponent {
  @Input() message!: MensajeUnificado;
}
