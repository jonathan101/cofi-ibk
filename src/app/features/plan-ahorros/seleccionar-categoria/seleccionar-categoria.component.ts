import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

/**
 * Componente para seleccionar la categoría de recategorización
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */
@Component({
  selector: 'app-seleccionar-categoria',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seleccionar-categoria.component.html',
  styleUrls: ['./seleccionar-categoria.component.scss']
})
export class SeleccionarCategoriaComponent implements OnInit {
  tipoMovimiento: string = '';
  operacionId: string = '';
  categoriaSeleccionada: string | null = null;

  categorias = [
    {
      id: 'ingresos',
      nombre: 'Ingresos',
      descripcion: 'Dinero que entra a tus cuentas',
      icono: 'trending_up'
    },
    {
      id: 'operaciones_recurrentes',
      nombre: 'Operaciones Recurrentes',
      descripcion: 'Gastos o ingresos que se repiten mensualmente',
      icono: 'repeat'
    },
    {
      id: 'pagos_financieros',
      nombre: 'Pagos Financieros',
      descripcion: 'Pagos de tarjetas, préstamos u otros productos',
      icono: 'credit_card'
    }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.tipoMovimiento = params['tipo'];
      this.operacionId = params['operacionId'];
    });
  }

  /**
   * Selecciona una categoría
   */
  seleccionarCategoria(categoriaId: string): void {
    this.categoriaSeleccionada = categoriaId;
  }

  /**
   * Confirma la selección y navega a la siguiente vista
   */
  confirmar(): void {
    if (!this.categoriaSeleccionada) return;

    // Navegar a la vista de confirmación con la categoría seleccionada
    this.router.navigate(
      ['/plan-ahorros/movimientos-caja', this.tipoMovimiento, 'confirmar', this.operacionId],
      { queryParams: { categoria: this.categoriaSeleccionada } }
    );
  }

  /**
   * Cierra la vista y vuelve al detalle de movimientos
   */
  cerrar(): void {
    this.router.navigate(['/plan-ahorros/detalle/movimientos-caja', this.tipoMovimiento]);
  }
}
