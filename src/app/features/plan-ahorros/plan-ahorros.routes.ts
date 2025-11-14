import { Routes } from '@angular/router';

/**
 * Plan de Ahorros Routes
 * 
 * SCROLL RESTORATION:
 * ===================
 * 
 * These routes inherit scroll restoration behavior from the parent route.
 * You can override it for specific routes by adding scroll configuration to the `data` property.
 * 
 * Example: Disable scroll restoration for detail views that should always start at top
 * {
 *   path: 'gastos/:tipo',
 *   loadComponent: () => import('./detalle-gastos/detalle-gastos.component'),
 *   data: {
 *     scrollRestoration: false  // Always scroll to top when viewing expense details
 *   }
 * }
 * 
 * Example: Add delay for routes with async data loading
 * {
 *   path: 'detalle/movimientos/:categoria',
 *   loadComponent: () => import('./lista-movimientos/lista-movimientos.component'),
 *   data: {
 *     scrollDelay: 100  // Wait for transaction list to load before restoring scroll
 *   }
 * }
 */
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
    path: 'gastos/:tipo',
    loadComponent: () => import('./detalle-gastos/detalle-gastos.component').then(m => m.DetalleGastosComponent)
  },
  {
    path: 'gastos/:tipo/:subcategoria',
    loadComponent: () => import('./detalle-subcategoria/detalle-subcategoria.component').then(m => m.DetalleSubcategoriaComponent)
  },
  {
    path: 'detalle/movimientos/:categoria',
    loadComponent: () => import('./lista-movimientos/lista-movimientos.component').then(m => m.ListaMovimientosComponent)
  },
  {
    path: 'detalle/movimientos-caja/:tipo',
    loadComponent: () => import('./movimientos-caja-detalle/movimientos-caja-detalle.component').then(m => m.MovimientosCajaDetalleComponent)
  },
  {
    path: 'movimientos-caja/:tipo/recategorizar/:operacionId',
    loadComponent: () => import('./seleccionar-categoria/seleccionar-categoria.component').then(m => m.SeleccionarCategoriaComponent)
  },
  {
    path: 'movimientos-caja/:tipo/confirmar/:operacionId',
    loadComponent: () => import('./confirmar-recategorizacion/confirmar-recategorizacion.component').then(m => m.ConfirmarRecategorizacionComponent)
  },
  // Nuevas rutas de configuración
  {
    path: 'configuracion',
    loadComponent: () => import('./settings/plan-settings.component').then(m => m.PlanSettingsComponent)
  },
  {
    path: 'configuracion/ingreso-neto',
    loadComponent: () => import('./settings/ingreso-neto-settings.component').then(m => m.IngresoNetoSettingsComponent)
  },
  {
    path: 'configuracion/meta-ahorro',
    loadComponent: () => import('./settings/meta-ahorro-settings.component').then(m => m.MetaAhorroSettingsComponent)
  },
  {
    path: 'configuracion/operaciones-recurrentes',
    loadComponent: () => import('./settings/operaciones-recurrentes-settings.component').then(m => m.OperacionesRecurrentesSettingsComponent)
  },
  {
    path: 'configuracion/chanchito',
    loadComponent: () => import('./settings/chanchito-settings.component').then(m => m.ChanchitoSettingsComponent)
  },
  {
    path: 'configuracion/gastos',
    loadComponent: () => import('./settings/configuracion-gastos-settings.component').then(m => m.ConfiguracionGastosSettingsComponent)
  },
  {
    path: 'configuracion/topes',
    loadComponent: () => import('./settings/topes-gastos-settings.component').then(m => m.TopesGastosSettingsComponent)
  }
];
