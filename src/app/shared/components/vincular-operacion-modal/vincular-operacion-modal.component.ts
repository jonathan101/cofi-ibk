import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperacionFinanciera } from '../../../core/models/operacion-financiera.interface';
import { OperacionRecurrenteProgramada } from '../../../core/models/operacion-recurrente.interface';
import { OperacionesRecurrentesService } from '../../../core/services/operaciones-recurrentes.service';
import { PlanAhorrosService } from '../../../core/services/plan-ahorros.service';

/**
 * Modal para vincular operación real con operación recurrente programada
 * Requirement 38: Vincular operaciones con recurrentes
 */
@Component({
  selector: 'app-vincular-operacion-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vincular-operacion-modal.component.html',
  styleUrls: ['./vincular-operacion-modal.component.scss']
})
export class VincularOperacionModalComponent implements OnInit {
  @Input() show = false;
  @Input() operacion: OperacionFinanciera | null = null;
  @Input() mes = 'Noviembre 2024'; // Mes actual por defecto
  @Output() close = new EventEmitter<void>();
  @Output() vincular = new EventEmitter<{ operacionId: string; recurrenteId: string }>();

  operacionesRecurrentes: OperacionRecurrenteProgramada[] = [];
  recurrenteSeleccionada: string | null = null;
  loading = false;
  error: string | null = null;
  showConfirmation = false;

  constructor(
    private operacionesService: OperacionesRecurrentesService,
    private planService: PlanAhorrosService
  ) {}

  ngOnInit(): void {
    this.cargarOperacionesRecurrentes();
  }

  /**
   * Carga la lista de operaciones recurrentes activas
   */
  cargarOperacionesRecurrentes(): void {
    this.loading = true;
    this.error = null;

    this.operacionesService.getOperacionesActivas().subscribe({
      next: (operaciones) => {
        this.operacionesRecurrentes = operaciones;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar operaciones recurrentes';
        this.loading = false;
        console.error(err);
      }
    });
  }

  /**
   * Selecciona una operación recurrente
   */
  seleccionarRecurrente(id: string): void {
    this.recurrenteSeleccionada = id;
  }

  /**
   * Muestra la confirmación antes de vincular
   */
  mostrarConfirmacion(): void {
    if (!this.recurrenteSeleccionada) {
      this.error = 'Debes seleccionar una operación recurrente';
      return;
    }
    this.showConfirmation = true;
  }

  /**
   * Cancela la confirmación
   */
  cancelarConfirmacion(): void {
    this.showConfirmation = false;
  }

  /**
   * Confirma la vinculación
   */
  confirmarVinculacion(): void {
    if (!this.operacion || !this.recurrenteSeleccionada) {
      return;
    }

    this.loading = true;
    this.error = null;

    // Vincular operación con recurrente
    this.planService.vincularOperacionConRecurrente(
      this.operacion.id,
      this.recurrenteSeleccionada,
      this.mes
    ).subscribe({
      next: () => {
        // Marcar operación como generada en la recurrente
        this.operacionesService.marcarOperacionComoGenerada(
          this.recurrenteSeleccionada!,
          this.operacion!.id,
          this.mes
        ).subscribe({
          next: () => {
            this.loading = false;
            this.vincular.emit({
              operacionId: this.operacion!.id,
              recurrenteId: this.recurrenteSeleccionada!
            });
            this.cerrarModal();
          },
          error: (err) => {
            this.error = 'Error al marcar operación como generada';
            this.loading = false;
            console.error(err);
          }
        });
      },
      error: (err) => {
        this.error = 'Error al vincular operación';
        this.loading = false;
        console.error(err);
      }
    });
  }

  /**
   * Cierra el modal
   */
  cerrarModal(): void {
    this.recurrenteSeleccionada = null;
    this.showConfirmation = false;
    this.error = null;
    this.close.emit();
  }

  /**
   * Obtiene la operación recurrente seleccionada
   */
  getRecurrenteSeleccionada(): OperacionRecurrenteProgramada | undefined {
    return this.operacionesRecurrentes.find(op => op.id === this.recurrenteSeleccionada);
  }

  /**
   * Formatea una fecha para mostrar
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Formatea el día del mes para mostrar
   */
  formatDiaDelMes(dia: number | 'fin_de_mes'): string {
    return dia === 'fin_de_mes' ? 'Fin de mes' : `Día ${dia}`;
  }

  /**
   * Verifica si la operación ya está vinculada
   */
  isOperacionVinculada(): boolean {
    return this.operacion?.vinculadaARecurrente === true;
  }
}
