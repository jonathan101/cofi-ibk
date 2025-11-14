import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PlanAhorrosService } from '../../../core/services/plan-ahorros.service';
import { MovimientoCaja } from '../../../core/models/plan-ahorros.interface';

/**
 * Componente para mostrar detalle de movimientos de caja por tipo
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */
@Component({
  selector: 'app-movimientos-caja-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movimientos-caja-detalle.component.html',
  styleUrls: ['./movimientos-caja-detalle.component.scss']
})
export class MovimientosCajaDetalleComponent implements OnInit {
  tipoMovimiento: string = '';
  movimientos: MovimientoCaja[] = [];
  movimientosFiltrados: MovimientoCaja[] = [];
  filtroActivo: 'todos' | 'entradas' | 'salidas' = 'todos';
  loading = false;
  mesActual = 'Noviembre 2024'; // TODO: Obtener del servicio o estado global

  constructor(
    private planService: PlanAhorrosService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.tipoMovimiento = params['tipo'];
      this.cargarMovimientos();
    });
  }

  /**
   * Carga los movimientos del tipo seleccionado
   */
  cargarMovimientos(): void {
    this.loading = true;
    
    this.planService.getMovimientosCajaPorTipo(this.mesActual, this.tipoMovimiento).subscribe({
      next: (movimientos) => {
        this.movimientos = movimientos;
        this.aplicarFiltro(this.filtroActivo);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando movimientos:', error);
        this.loading = false;
      }
    });
  }

  /**
   * Aplica el filtro seleccionado
   */
  aplicarFiltro(filtro: 'todos' | 'entradas' | 'salidas'): void {
    this.filtroActivo = filtro;
    
    if (filtro === 'todos') {
      this.movimientosFiltrados = [...this.movimientos];
    } else if (filtro === 'entradas') {
      this.movimientosFiltrados = this.movimientos.filter(m => m.monto > 0);
    } else if (filtro === 'salidas') {
      this.movimientosFiltrados = this.movimientos.filter(m => m.monto < 0);
    }
  }

  /**
   * Navega a la vista de recategorización
   */
  recategorizar(movimiento: MovimientoCaja): void {
    this.router.navigate(['/plan-ahorros/movimientos-caja', this.tipoMovimiento, 'recategorizar', movimiento.id]);
  }

  /**
   * Calcula el total de los movimientos filtrados
   */
  getTotalMonto(): number {
    return this.movimientosFiltrados.reduce((sum, m) => sum + m.monto, 0);
  }

  /**
   * Formatea el monto como moneda
   */
  formatearMonto(monto: number): string {
    const signo = monto >= 0 ? '+' : '';
    return `${signo} S/ ${Math.abs(monto).toFixed(2)}`;
  }

  /**
   * Formatea el monto total (sin signo +)
   */
  formatearMontoTotal(monto: number): string {
    return `S/ ${monto < 0 ? '-' : ''}${Math.abs(monto).toFixed(2)}`;
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
   * Obtiene el título según el tipo de movimiento
   */
  getTitulo(): string {
    const titulos: { [key: string]: string } = {
      'transferencias': 'Transferencias',
      'retiros': 'Retiros',
      'depositos': 'Depósitos',
      'otros': 'Otros Movimientos'
    };
    return titulos[this.tipoMovimiento] || 'Movimientos de Caja';
  }

  /**
   * Obtiene el icono según el tipo de movimiento
   */
  getIcono(): string {
    const iconos: { [key: string]: string } = {
      'transferencias': 'swap_horiz',
      'retiros': 'arrow_upward',
      'depositos': 'arrow_downward',
      'otros': 'more_horiz'
    };
    return iconos[this.tipoMovimiento] || 'account_balance_wallet';
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
