import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PlanAhorrosService } from '../../../core/services/plan-ahorros.service';
import { TipoGastoDetalle, SubcategoriaGastoDetalle } from '../../../core/models/plan-ahorros.interface';

/**
 * Componente para mostrar detalle de gastos por tipo
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */
@Component({
  selector: 'app-detalle-gastos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-gastos.component.html',
  styleUrls: ['./detalle-gastos.component.scss']
})
export class DetalleGastosComponent implements OnInit {
  tipoGasto: string = '';
  detalleGastos: TipoGastoDetalle | null = null;
  loading = false;
  mesActual = 'Noviembre 2024'; // TODO: Obtener del servicio o estado global

  constructor(
    private planService: PlanAhorrosService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.tipoGasto = params['tipo'];
      this.cargarDetalleGastos();
    });
  }

  /**
   * Carga el detalle de gastos del tipo seleccionado
   */
  cargarDetalleGastos(): void {
    this.loading = true;
    
    this.planService.getDetalleGastosPorTipo(this.mesActual, this.tipoGasto).subscribe({
      next: (detalle) => {
        this.detalleGastos = detalle;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando detalle de gastos:', error);
        this.loading = false;
      }
    });
  }

  /**
   * Navega al detalle de una subcategoría
   */
  verDetalleSubcategoria(subcategoria: SubcategoriaGastoDetalle): void {
    const subcatSlug = subcategoria.nombre.toLowerCase().replace(/\s+/g, '-');
    this.router.navigate(['/plan-ahorros/gastos', this.tipoGasto, subcatSlug]);
  }

  /**
   * Retorna el ancho de la barra en porcentaje
   */
  getBarWidth(subcategoria: SubcategoriaGastoDetalle): number {
    if (!this.detalleGastos || this.detalleGastos.subcategorias.length === 0) {
      return 0;
    }
    
    const maxMonto = Math.max(...this.detalleGastos.subcategorias.map(s => s.monto));
    return (subcategoria.monto / maxMonto) * 100;
  }

  /**
   * Formatea el monto como moneda
   */
  formatearMonto(monto: number): string {
    return `S/ ${Math.abs(monto).toFixed(2)}`;
  }

  /**
   * Navega de regreso al plan de ahorros
   */
  volver(): void {
    this.router.navigate(['/plan-ahorros']);
  }
}
