import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PlanAhorrosService } from '../../../core/services/plan-ahorros.service';
import { OperacionVinculable, RecategorizacionRequest } from '../../../core/models/recategorizacion.interface';

/**
 * Componente para confirmar la recategorización de un movimiento
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
@Component({
  selector: 'app-confirmar-recategorizacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmar-recategorizacion.component.html',
  styleUrls: ['./confirmar-recategorizacion.component.scss']
})
export class ConfirmarRecategorizacionComponent implements OnInit {
  tipoMovimiento: string = '';
  operacionId: string = '';
  categoria: string = '';
  operacionSeleccionada: string | null = null;
  operacionesVinculables: OperacionVinculable[] = [];
  loading = false;
  procesando = false;
  mesActual = 'Noviembre 2024'; // TODO: Obtener del servicio o estado global

  // Datos del movimiento (mock - en producción se cargaría del servicio)
  movimiento = {
    descripcion: 'Transferencia a cuenta externa',
    monto: -500.00,
    fecha: new Date()
  };

  constructor(
    private planService: PlanAhorrosService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.tipoMovimiento = params['tipo'];
      this.operacionId = params['operacionId'];
    });

    this.route.queryParams.subscribe(params => {
      this.categoria = params['categoria'];
      this.cargarOperacionesVinculables();
    });
  }

  /**
   * Carga las operaciones vinculables según la categoría
   */
  cargarOperacionesVinculables(): void {
    // Solo cargar si la categoría requiere vinculación
    if (this.categoria === 'operaciones_recurrentes') {
      this.loading = true;
      this.planService.getOperacionesRecurrentesVinculables().subscribe({
        next: (operaciones) => {
          this.operacionesVinculables = operaciones;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando operaciones vinculables:', error);
          this.loading = false;
        }
      });
    } else if (this.categoria === 'pagos_financieros') {
      this.loading = true;
      this.planService.getPagosFinancierosVinculables().subscribe({
        next: (operaciones) => {
          this.operacionesVinculables = operaciones;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando pagos vinculables:', error);
          this.loading = false;
        }
      });
    }
  }

  /**
   * Selecciona una operación para vincular
   */
  seleccionarOperacion(operacionId: string): void {
    this.operacionSeleccionada = operacionId;
  }

  /**
   * Confirma la recategorización
   */
  confirmar(): void {
    // Para ingresos no se requiere selección de operación
    if (this.categoria !== 'ingresos' && !this.operacionSeleccionada && this.operacionesVinculables.length > 0) {
      return;
    }

    this.procesando = true;

    const request: RecategorizacionRequest = {
      operacionId: this.operacionId,
      nuevaCategoria: this.categoria as any,
      operacionVinculadaId: this.operacionSeleccionada || undefined,
      mes: this.mesActual
    };

    this.planService.recategorizarMovimiento(request).subscribe({
      next: (response) => {
        if (response.success) {
          // Navegar de regreso al detalle de movimientos
          this.router.navigate(['/plan-ahorros/detalle/movimientos-caja', this.tipoMovimiento]);
        } else {
          console.error('Error en recategorización:', response.message);
          this.procesando = false;
        }
      },
      error: (error) => {
        console.error('Error recategorizando movimiento:', error);
        this.procesando = false;
      }
    });
  }

  /**
   * Obtiene el nombre de la categoría
   */
  getNombreCategoria(): string {
    const nombres: { [key: string]: string } = {
      'ingresos': 'Ingresos',
      'operaciones_recurrentes': 'Operaciones Recurrentes',
      'pagos_financieros': 'Pagos Financieros'
    };
    return nombres[this.categoria] || this.categoria;
  }

  /**
   * Verifica si se requiere selección de operación
   */
  requiereSeleccion(): boolean {
    return this.operacionesVinculables.length > 0;
  }

  /**
   * Formatea el monto como moneda
   */
  formatearMonto(monto: number): string {
    const signo = monto >= 0 ? '+' : '';
    return `${signo} S/ ${Math.abs(monto).toFixed(2)}`;
  }

  /**
   * Formatea la fecha
   */
  formatearFecha(fecha: Date): string {
    const opciones: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    };
    return new Date(fecha).toLocaleDateString('es-PE', opciones);
  }

  /**
   * Vuelve a la selección de categoría
   */
  volver(): void {
    this.router.navigate(['/plan-ahorros/movimientos-caja', this.tipoMovimiento, 'recategorizar', this.operacionId]);
  }

  /**
   * Cierra y vuelve al detalle de movimientos
   */
  cerrar(): void {
    this.router.navigate(['/plan-ahorros/detalle/movimientos-caja', this.tipoMovimiento]);
  }
}
