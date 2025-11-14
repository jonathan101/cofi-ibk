import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OperacionesRecurrentesService } from '../../../core/services/operaciones-recurrentes.service';
import { OperacionRecurrenteProgramada } from '../../../core/models/operacion-recurrente.interface';

/**
 * Componente para gestionar operaciones recurrentes programadas
 * Requirement 37: CRUD de operaciones recurrentes con generación automática
 */
@Component({
  selector: 'app-operaciones-recurrentes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './operaciones-recurrentes.component.html',
  styleUrls: ['./operaciones-recurrentes.component.scss']
})
export class OperacionesRecurrentesComponent implements OnInit {
  operaciones: OperacionRecurrenteProgramada[] = [];
  loading = false;
  error: string | null = null;
  
  // Estado del formulario
  showForm = false;
  editingId: string | null = null;
  formData: Partial<OperacionRecurrenteProgramada> = this.getEmptyForm();
  
  // Validación
  formErrors: { [key: string]: string } = {};

  constructor(
    private operacionesService: OperacionesRecurrentesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarOperaciones();
  }

  /**
   * Carga la lista de operaciones recurrentes
   */
  cargarOperaciones(): void {
    this.loading = true;
    this.error = null;
    
    this.operacionesService.getOperacionesRecurrentes().subscribe({
      next: (operaciones) => {
        this.operaciones = operaciones;
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
   * Muestra el formulario para crear nueva operación
   */
  mostrarFormularioNuevo(): void {
    this.showForm = true;
    this.editingId = null;
    this.formData = this.getEmptyForm();
    this.formErrors = {};
  }

  /**
   * Muestra el formulario para editar operación existente
   */
  editarOperacion(operacion: OperacionRecurrenteProgramada): void {
    this.showForm = true;
    this.editingId = operacion.id;
    this.formData = {
      titulo: operacion.titulo,
      monto: operacion.monto,
      fechaInicio: operacion.fechaInicio,
      fechaFin: operacion.fechaFin,
      diaDelMes: operacion.diaDelMes,
      activa: operacion.activa
    };
    this.formErrors = {};
  }

  /**
   * Cancela la edición y oculta el formulario
   */
  cancelarEdicion(): void {
    this.showForm = false;
    this.editingId = null;
    this.formData = this.getEmptyForm();
    this.formErrors = {};
  }

  /**
   * Guarda la operación (crear o actualizar)
   */
  guardarOperacion(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.loading = true;
    
    const data: Partial<OperacionRecurrenteProgramada> = {
      titulo: this.formData.titulo,
      monto: Number(this.formData.monto),
      fechaInicio: new Date(this.formData.fechaInicio as any),
      fechaFin: new Date(this.formData.fechaFin as any),
      diaDelMes: this.formData.diaDelMes === 'fin_de_mes' ? 'fin_de_mes' : Number(this.formData.diaDelMes),
      activa: this.formData.activa !== undefined ? this.formData.activa : true
    };

    const operacion$ = this.editingId
      ? this.operacionesService.actualizarOperacionRecurrente(this.editingId, data)
      : this.operacionesService.crearOperacionRecurrente(data);

    operacion$.subscribe({
      next: () => {
        this.cargarOperaciones();
        this.cancelarEdicion();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al guardar operación';
        this.loading = false;
        console.error(err);
      }
    });
  }

  /**
   * Elimina una operación recurrente
   */
  eliminarOperacion(id: string): void {
    if (!confirm('¿Estás seguro de eliminar esta operación recurrente?')) {
      return;
    }

    this.loading = true;
    
    this.operacionesService.eliminarOperacionRecurrente(id).subscribe({
      next: () => {
        this.cargarOperaciones();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al eliminar operación';
        this.loading = false;
        console.error(err);
      }
    });
  }

  /**
   * Activa o desactiva una operación recurrente
   */
  toggleActivar(operacion: OperacionRecurrenteProgramada): void {
    this.loading = true;
    
    this.operacionesService.activarDesactivarOperacionRecurrente(operacion.id, !operacion.activa).subscribe({
      next: () => {
        this.cargarOperaciones();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cambiar estado de operación';
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

    if (!this.formData.titulo || this.formData.titulo.trim() === '') {
      this.formErrors['titulo'] = 'El título es requerido';
      isValid = false;
    }

    if (!this.formData.monto || this.formData.monto <= 0) {
      this.formErrors['monto'] = 'El monto debe ser mayor a 0';
      isValid = false;
    }

    if (!this.formData.fechaInicio) {
      this.formErrors['fechaInicio'] = 'La fecha de inicio es requerida';
      isValid = false;
    }

    if (!this.formData.fechaFin) {
      this.formErrors['fechaFin'] = 'La fecha de fin es requerida';
      isValid = false;
    }

    if (this.formData.fechaInicio && this.formData.fechaFin) {
      const inicio = new Date(this.formData.fechaInicio as any);
      const fin = new Date(this.formData.fechaFin as any);
      
      if (fin < inicio) {
        this.formErrors['fechaFin'] = 'La fecha de fin debe ser posterior a la fecha de inicio';
        isValid = false;
      }
    }

    if (!this.formData.diaDelMes) {
      this.formErrors['diaDelMes'] = 'El día del mes es requerido';
      isValid = false;
    } else if (this.formData.diaDelMes !== 'fin_de_mes') {
      const dia = Number(this.formData.diaDelMes);
      if (dia < 1 || dia > 31) {
        this.formErrors['diaDelMes'] = 'El día debe estar entre 1 y 31';
        isValid = false;
      }
    }

    return isValid;
  }

  /**
   * Retorna un formulario vacío
   */
  private getEmptyForm(): Partial<OperacionRecurrenteProgramada> {
    return {
      titulo: '',
      monto: 0,
      fechaInicio: undefined,
      fechaFin: undefined,
      diaDelMes: 1,
      activa: true
    };
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
   * Cuenta operaciones generadas
   */
  contarOperacionesGeneradas(operacion: OperacionRecurrenteProgramada): number {
    return operacion.operacionesGeneradas.length;
  }

  /**
   * Cuenta operaciones vinculadas
   */
  contarOperacionesVinculadas(operacion: OperacionRecurrenteProgramada): number {
    return operacion.operacionesGeneradas.filter((og: { mes: string; operacionId: string; vinculada: boolean }) => og.vinculada).length;
  }

  /**
   * Navega de regreso al plan de ahorros
   */
  volverAlPlan(): void {
    this.router.navigate(['/plan-ahorros']);
  }
}
