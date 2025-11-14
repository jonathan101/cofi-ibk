import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PlanAhorrosService } from '../../../core/services/plan-ahorros.service';
import { OperacionFinanciera } from '../../../core/models/operacion-financiera.interface';

/**
 * Componente para mostrar detalle de operaciones de una subcategoría
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */
@Component({
  selector: 'app-detalle-subcategoria',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-subcategoria.component.html',
  styleUrls: ['./detalle-subcategoria.component.scss']
})
export class DetalleSubcategoriaComponent implements OnInit {
  tipoGasto: string = '';
  subcategoria: string = '';
  operaciones: OperacionFinanciera[] = [];
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
      this.subcategoria = params['subcategoria'];
      this.cargarOperaciones();
    });
  }

  /**
   * Carga las operaciones de la subcategoría
   */
  cargarOperaciones(): void {
    this.loading = true;
    
    // Convertir slug a nombre de subcategoría
    const subcatNombre = this.subcategoria.replace(/-/g, ' ');
    
    this.planService.getOperacionesPorSubcategoria(this.mesActual, this.tipoGasto, subcatNombre).subscribe({
      next: (operaciones) => {
        this.operaciones = operaciones;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando operaciones:', error);
        this.loading = false;
      }
    });
  }

  /**
   * Calcula el total de las operaciones
   */
  getTotalMonto(): number {
    return this.operaciones.reduce((sum, op) => sum + Math.abs(op.monto), 0);
  }

  /**
   * Formatea el monto como moneda
   */
  formatearMonto(monto: number): string {
    return `S/ ${Math.abs(monto).toFixed(2)}`;
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
   * Capitaliza el nombre de la subcategoría
   */
  getNombreSubcategoria(): string {
    return this.subcategoria
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Navega de regreso al detalle del tipo de gasto
   */
  volver(): void {
    this.router.navigate(['/plan-ahorros/gastos', this.tipoGasto]);
  }
}
