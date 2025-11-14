import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PullDownHandleComponent } from '../../../shared/components/pull-down-handle/pull-down-handle.component';
import { OperacionFinanciera } from '../../../core/models/operacion-financiera.interface';
import { PlanAhorrosService } from '../../../core/services/plan-ahorros.service';

@Component({
  selector: 'app-detalle-gastos',
  standalone: true,
  imports: [CommonModule, PullDownHandleComponent],
  templateUrl: './detalle-gastos.component.html',
  styleUrls: ['./detalle-gastos.component.scss']
})
export class DetalleGastosComponent implements OnInit {
  filtroActivo: 'todos' | 'hormiga' | 'medio' | 'excepcional' = 'todos';
  operaciones: OperacionFinanciera[] = [];
  operacionesFiltradas: OperacionFinanciera[] = [];
  datosGrafico: { categoria: string; monto: number; porcentaje: number }[] = [];
  totalGastos: number = 0;
  mesActual: string = 'Noviembre 2024';
  
  // Expose Math for template
  Math = Math;

  constructor(
    private router: Router,
    private planAhorrosService: PlanAhorrosService
  ) {}

  ngOnInit(): void {
    this.cargarOperaciones();
  }

  /**
   * Maneja el evento de pull-down para volver al home
   */
  onPullDown(): void {
    this.router.navigate(['/home']);
  }

  /**
   * Vuelve a la vista anterior
   */
  goBack(): void {
    this.router.navigate(['/plan-ahorros']);
  }

  /**
   * Carga las operaciones de gastos del mes
   * Requirement 8: Cargar operaciones de gastos
   */
  cargarOperaciones(): void {
    this.planAhorrosService.getOperacionesGastos(this.mesActual).subscribe({
      next: (operaciones) => {
        this.operaciones = operaciones;
        this.aplicarFiltro(this.filtroActivo);
        this.generarDatosGrafico();
      },
      error: (error) => {
        console.error('Error cargando operaciones de gastos:', error);
        this.operaciones = [];
        this.operacionesFiltradas = [];
        this.datosGrafico = [];
      }
    });
  }

  /**
   * Filtra las operaciones por tipo de gasto
   * Requirement 8: Filtrar operaciones por tipo
   */
  aplicarFiltro(filtro: 'todos' | 'hormiga' | 'medio' | 'excepcional'): void {
    this.filtroActivo = filtro;
    
    if (filtro === 'todos') {
      this.operacionesFiltradas = [...this.operaciones];
    } else {
      this.operacionesFiltradas = this.operaciones.filter(op => op.tipoGasto === filtro);
    }
    
    // Ordenar por fecha descendente (más reciente primero)
    this.operacionesFiltradas.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
    
    // Regenerar gráfico con datos filtrados
    this.generarDatosGrafico();
  }

  /**
   * Procesa las operaciones para generar datos del gráfico
   * Requirement 8: Generar gráfico de barras por categoría
   */
  generarDatosGrafico(): void {
    // Agrupar operaciones por subcategoría
    const grupos = new Map<string, number>();
    
    this.operacionesFiltradas.forEach(op => {
      const subcategoria = op.subcategoria || 'otros';
      const montoAbsoluto = Math.abs(op.monto);
      grupos.set(subcategoria, (grupos.get(subcategoria) || 0) + montoAbsoluto);
    });
    
    // Calcular total para porcentajes
    this.totalGastos = Array.from(grupos.values()).reduce((sum, monto) => sum + monto, 0);
    
    // Convertir a array y ordenar por monto descendente
    const datosOrdenados = Array.from(grupos.entries())
      .map(([categoria, monto]) => ({
        categoria: this.capitalizarCategoria(categoria),
        monto,
        porcentaje: this.totalGastos > 0 ? (monto / this.totalGastos) * 100 : 0
      }))
      .sort((a, b) => b.monto - a.monto);
    
    // Tomar las 9 categorías principales
    const top9 = datosOrdenados.slice(0, 9);
    
    // Si hay más de 9 categorías, agrupar el resto en "Otros"
    if (datosOrdenados.length > 9) {
      const otros = datosOrdenados.slice(9);
      const montoOtros = otros.reduce((sum, item) => sum + item.monto, 0);
      const porcentajeOtros = this.totalGastos > 0 ? (montoOtros / this.totalGastos) * 100 : 0;
      
      top9.push({
        categoria: 'Otros',
        monto: montoOtros,
        porcentaje: porcentajeOtros
      });
    }
    
    this.datosGrafico = top9;
  }

  /**
   * Capitaliza el nombre de la categoría
   */
  private capitalizarCategoria(categoria: string): string {
    const nombres: { [key: string]: string } = {
      'transporte': 'Transporte',
      'delivery': 'Delivery',
      'restaurantes': 'Restaurantes',
      'supermercado': 'Supermercado',
      'entretenimiento': 'Entretenimiento',
      'salud': 'Salud',
      'educacion': 'Educación',
      'compras': 'Compras',
      'servicios': 'Servicios',
      'otros': 'Otros'
    };
    return nombres[categoria] || categoria.charAt(0).toUpperCase() + categoria.slice(1);
  }

  /**
   * Muestra el detalle de una operación
   * Requirement 8: Navegar al detalle de operación
   */
  verDetalleOperacion(operacion: OperacionFinanciera): void {
    // TODO: Implementar navegación al detalle de operación cuando esté disponible
    // Por ahora, solo mostramos un log
    console.log('Ver detalle de operación:', operacion);
    
    // En el futuro, esto navegará a una vista de detalle:
    // this.router.navigate(['/plan-ahorros/operacion', operacion.id]);
  }
}
