import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperacionFinanciera } from '../../../core/models/operacion-financiera.interface';

@Component({
  selector: 'app-categorizar-movimiento-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categorizar-movimiento-modal.component.html',
  styleUrls: ['./categorizar-movimiento-modal.component.scss']
})
export class CategorizarMovimientoModalComponent {
  @Input() movimientos: OperacionFinanciera[] = [];
  @Input() isOpen: boolean = false;
  
  @Output() onCategorize = new EventEmitter<{ id: string; categoria: string }>();
  @Output() onClose = new EventEmitter<void>();

  // Categorías disponibles
  categorias = [
    { value: 'ingreso', label: 'Ingresos', icon: '💰' },
    { value: 'operacion_recurrente', label: 'Operaciones Regulares', icon: '🔄' },
    { value: 'pago_financiero_otro_banco', label: 'Pagos Financieros (Otros Bancos)', icon: '🏦' }
  ];

  // Movimiento seleccionado para categorizar
  movimientoSeleccionado: OperacionFinanciera | null = null;
  categoriaSeleccionada: string = '';

  /**
   * Cierra el modal
   */
  cerrarModal(): void {
    this.movimientoSeleccionado = null;
    this.categoriaSeleccionada = '';
    this.onClose.emit();
  }

  /**
   * Selecciona un movimiento para categorizar
   */
  seleccionarMovimiento(movimiento: OperacionFinanciera): void {
    this.movimientoSeleccionado = movimiento;
    this.categoriaSeleccionada = '';
  }

  /**
   * Selecciona una categoría
   */
  seleccionarCategoria(categoria: string): void {
    this.categoriaSeleccionada = categoria;
  }

  /**
   * Guarda la categorización
   */
  guardarCategorizacion(): void {
    if (!this.movimientoSeleccionado || !this.categoriaSeleccionada) {
      return;
    }

    this.onCategorize.emit({
      id: this.movimientoSeleccionado.id,
      categoria: this.categoriaSeleccionada
    });

    // Limpiar selección
    this.movimientoSeleccionado = null;
    this.categoriaSeleccionada = '';
  }

  /**
   * Cancela la categorización actual
   */
  cancelarCategorizacion(): void {
    this.movimientoSeleccionado = null;
    this.categoriaSeleccionada = '';
  }

  /**
   * Formatea un número como moneda
   */
  formatCurrency(value: number): string {
    return `S/ ${Math.abs(value).toFixed(2)}`;
  }

  /**
   * Formatea una fecha
   */
  formatDate(date: Date): string {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Obtiene el label de una categoría
   */
  getCategoriaLabel(value: string): string {
    const cat = this.categorias.find(c => c.value === value);
    return cat ? cat.label : value;
  }

  /**
   * Previene el cierre del modal al hacer clic dentro del contenido
   */
  onContentClick(event: Event): void {
    event.stopPropagation();
  }
}
