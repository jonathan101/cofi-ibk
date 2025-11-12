import { Routes } from '@angular/router';

export const PLAN_AHORROS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./plan-ahorros.component').then(m => m.PlanAhorrosComponent)
  },
  {
    path: 'crear',
    loadComponent: () => import('./crear-plan/crear-plan.component').then(m => m.CrearPlanComponent)
  },
  {
    path: 'configurar',
    loadComponent: () => import('./configurar-plan/configurar-plan.component').then(m => m.ConfigurarPlanComponent)
  },
  {
    path: 'configurar/topes-mensuales',
    loadComponent: () => import('./configurar-plan/topes-mensuales/topes-mensuales.component').then(m => m.TopesMensualesComponent)
  },
  {
    path: 'configurar/clasificacion-gastos',
    loadComponent: () => import('./configurar-plan/clasificacion-gastos/clasificacion-gastos.component').then(m => m.ClasificacionGastosComponent)
  },
  {
    path: 'operaciones-recurrentes',
    loadComponent: () => import('./operaciones-recurrentes/operaciones-recurrentes.component').then(m => m.OperacionesRecurrentesComponent)
  },
  {
    path: 'detalle/gastos',
    loadComponent: () => import('./detalle-gastos/detalle-gastos.component').then(m => m.DetalleGastosComponent)
  },
  {
    path: 'detalle/movimientos/:categoria',
    loadComponent: () => import('./lista-movimientos/lista-movimientos.component').then(m => m.ListaMovimientosComponent)
  },
  {
    path: 'detalle/movimientos-caja/:tipo',
    loadComponent: () => import('./movimientos-caja-detalle/movimientos-caja-detalle.component').then(m => m.MovimientosCajaDetalleComponent)
  }
];
