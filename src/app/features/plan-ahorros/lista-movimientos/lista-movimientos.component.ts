import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanAhorrosService } from '../../../core/services/plan-ahorros.service';
import { OperacionFinanciera } from '../../../core/models/operacion-financiera.interface';

/**
 * Componente para mostrar lista de movimientos con opciones de recategorización
 * Requirement 28: Lista cronológica con botones para recategorizar
 */
@Component({
  selector: 'app-lista-movimientos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-movimientos.component.html',
  styleUrls: ['./lista-movimientos.component.scss']
})
export class ListaMovimientosComponent implements OnInit {
  categoria: string = '';
  movimientos: OperacionFinanciera[] = [];
  loading = false;
  mesActual = 'Noviembre 2024'; // TODO: Obtener del servicio o estado global
  operacionSeleccionada: OperacionFinanciera | null = null;
  mostrarMenuRecategorizacion = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private planService: PlanAhorrosService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.categoria = params['categoria'];
      this.cargarMovimientos();
    });
  }

  /**
   * Carga los movimientos de la categoría
   */
  cargarMovimientos(): void {
    this.loading = true;

    // Mapear categoría a filtro
    let filtro: any = {
      vinculadaARecurrente: false
    };

    if (this.categoria === 'ingresos') {
      filtro.categoriaUsuario = 'ingreso';
    } else if (this.categoria === 'operaciones-regulares') {
      filtro.categoriaUsuario = 'operacion_recurrente';
    } else if (this.categoria === 'pagos-financieros') {
      filtro.categoriaUsuario = 'pago_financiero_otro_banco';
    }

    this.planService.getOperacionesPorFiltro(this.mesActual, filtro).subscribe({
      next: (operaciones) => {
        // Ordenar por fecha descendente
        this.movimientos = operaciones.sort((a, b) => 
          b.fecha.getTime() - a.fecha.getTime()
        );
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando movimientos:', error);
        this.loading = false;
      }
    });
  }

  /**
   * Abre el menú de recategorización para un movimiento
   */
  abrirMenuRecategorizacion(movimiento: OperacionFinanciera): void {
    this.operacionSeleccionada = movimiento;
    this.mostrarMenuRecategorizacion = true;
  }

  /**
   * Cierra el menú de recategorización
   */
  cerrarMenuRecategorizacion(): void {
    this.operacionSeleccionada = null;
    this.mostrarMenuRecategorizacion = false;
  }

  /**
   * Recategoriza un movimiento
   */
  recategorizar(nuevaCategoria: string): void {
    if (!this.operacionSeleccionada) return;

    // Actualizar la categoría del movimiento
    const movimiento = this.operacionSeleccionada;
    
    if (nuevaCategoria === 'pago_financiero_otro_banco') {
      movimiento.categoriaUsuario = 'no_aplica';
      movimiento.categoria = 'pago_financiero';
    } else if (nuevaCategoria === 'ingreso') {
      movimiento.categoriaUsuario = 'ingreso';
      movimiento.categoria = 'ingresos';
    } else if (nuevaCategoria === 'operacion_recurrente') {
      movimiento.categoriaUsuario = 'operacion_recurrente';
    }

    // TODO: Llamar al servicio para persistir el cambio
    console.log('Recategorizando movimiento:', movimiento.id, 'a', nuevaCategoria);

    // Recargar la lista
    this.cerrarMenuRecategorizacion();
    this.cargarMovimientos();
  }

  /**
   * Devuelve un movimiento a Movimientos de Caja
   */
  devolverACaja(subcategoria: 'transferencias' | 'retiros' | 'depositos' | 'otros'): void {
    if (!this.operacionSeleccionada) return;

    const movimiento = this.operacionSeleccionada;
    
    // Actualizar categoría a movimiento de caja
    movimiento.categoria = 'movimiento_caja';
    movimiento.categoriaUsuario = 'no_aplica';
    movimiento.tipoMovimiento = subcategoria === 'transferencias' ? 'transferencia' :
                                 subcategoria === 'retiros' ? 'retiro' :
                                 subcategoria === 'depositos' ? 'deposito' : 'otros';

    // TODO: Llamar al servicio para persistir el cambio
    console.log('Devolviendo movimiento a caja:', movimiento.id, 'subcategoría:', subcategoria);

    // Recargar la lista
    this.cerrarMenuRecategorizacion();
    this.cargarMovimientos();
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
   * Retorna el título de la categoría
   */
  getTituloCategoria(): string {
    const titulos: { [key: string]: string } = {
      'ingresos': 'Ingresos',
      'operaciones-regulares': 'Operaciones Regulares',
      'pagos-financieros': 'Pagos Financieros - Otros Bancos'
    };
    return titulos[this.categoria] || 'Movimientos';
  }

  /**
   * Retorna la clase CSS según el monto
   */
  getMontoClass(monto: number): string {
    return monto >= 0 ? 'monto-positivo' : 'monto-negativo';
  }

  /**
   * Navega de regreso al plan de ahorros
   */
  volver(): void {
    this.router.navigate(['/plan-ahorros']);
  }
}
