import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChanchitoAhorro, TransferenciaAhorro } from '../../../core/models/chanchito-ahorro.interface';
import { PlanAhorrosService } from '../../../core/services/plan-ahorros.service';

/**
 * Modal para transferir dinero a chanchitos de ahorro
 * Requirement 29, 44: Transferencias internas sin crear operación visible
 */
@Component({
  selector: 'app-transferencia-ahorro-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transferencia-ahorro-modal.component.html',
  styleUrls: ['./transferencia-ahorro-modal.component.scss']
})
export class TransferenciaAhorroModalComponent implements OnInit {
  @Input() show = false;
  @Input() saldoDisponible: number = 0; // Saldo inicial disponible para transferir
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<TransferenciaAhorro>();

  chanchitos: ChanchitoAhorro[] = [];
  loading = false;
  error: string | null = null;
  success = false;

  // Datos del formulario
  monto: number = 0;
  chanchitoSeleccionado: string = '';

  // Validación
  formErrors: { [key: string]: string } = {};

  constructor(private planService: PlanAhorrosService) {}

  ngOnInit(): void {
    this.cargarChanchitos();
  }

  /**
   * Carga la lista de chanchitos de ahorro
   */
  cargarChanchitos(): void {
    this.loading = true;
    
    this.planService.getChanchitosAhorro().subscribe({
      next: (chanchitos) => {
        this.chanchitos = chanchitos;
        if (chanchitos.length > 0) {
          this.chanchitoSeleccionado = chanchitos[0].id;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar chanchitos de ahorro';
        this.loading = false;
        console.error(err);
      }
    });
  }

  /**
   * Cierra el modal
   */
  cerrarModal(): void {
    this.resetForm();
    this.close.emit();
  }

  /**
   * Confirma la transferencia
   */
  confirmarTransferencia(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.loading = true;
    this.error = null;

    const transferencia: TransferenciaAhorro = {
      monto: this.monto,
      chanchitoId: this.chanchitoSeleccionado,
      fecha: new Date()
    };

    this.planService.transferirAChanchito(transferencia).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        
        // Emitir evento de confirmación
        this.confirm.emit(transferencia);
        
        // Cerrar modal después de 2 segundos
        setTimeout(() => {
          this.cerrarModal();
        }, 2000);
      },
      error: (err) => {
        this.error = 'Error al realizar la transferencia';
        this.loading = false;
        console.error(err);
      }
    });
  }

  /**
   * Valida el formulario
   */
  private validarFormulario(): boolean {
    this.formErrors = {};
    let isValid = true;

    if (!this.monto || this.monto <= 0) {
      this.formErrors['monto'] = 'El monto debe ser mayor a 0';
      isValid = false;
    }

    if (this.monto > this.saldoDisponible) {
      this.formErrors['monto'] = `El monto no puede ser mayor a S/ ${this.saldoDisponible.toFixed(2)}`;
      isValid = false;
    }

    if (!this.chanchitoSeleccionado) {
      this.formErrors['chanchito'] = 'Debes seleccionar un chanchito';
      isValid = false;
    }

    return isValid;
  }

  /**
   * Maneja el cambio del slider
   */
  onSliderChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.monto = parseFloat(target.value);
  }

  /**
   * Formatea el monto como moneda
   */
  formatCurrency(value: number): string {
    return `S/ ${value.toFixed(2)}`;
  }

  /**
   * Calcula el porcentaje de progreso del slider
   */
  getSliderProgress(): number {
    if (!this.saldoDisponible) return 0;
    return (this.monto / this.saldoDisponible) * 100;
  }

  /**
   * Resetea el formulario
   */
  private resetForm(): void {
    this.monto = 0;
    if (this.chanchitos.length > 0) {
      this.chanchitoSeleccionado = this.chanchitos[0].id;
    }
    this.formErrors = {};
    this.error = null;
    this.success = false;
  }

  /**
   * Obtiene el chanchito seleccionado
   */
  getChanchitoSeleccionado(): ChanchitoAhorro | undefined {
    return this.chanchitos.find(ch => ch.id === this.chanchitoSeleccionado);
  }

  /**
   * Calcula el porcentaje de progreso del chanchito
   */
  calcularProgreso(chanchito: ChanchitoAhorro): number {
    return (chanchito.montoActual / chanchito.metaMonto) * 100;
  }

  /**
   * Calcula el nuevo progreso después de la transferencia
   */
  calcularNuevoProgreso(): number {
    const chanchito = this.getChanchitoSeleccionado();
    if (!chanchito || !this.monto) return 0;
    
    const nuevoMonto = chanchito.montoActual + this.monto;
    return (nuevoMonto / chanchito.metaMonto) * 100;
  }
}
