# Implementation Plan

## Task 1: Crear Modelos e Interfaces

- [ ] 1.1 Crear interface RecategorizacionRequest en `src/app/core/models/recategorizacion.interface.ts`
  - Definir estructura para solicitud de recategorización
  - Incluir validaciones de tipos
  - _Requirements: 5.5, 6.4_

- [ ] 1.2 Crear interface RecategorizacionResponse
  - Definir estructura de respuesta de API
  - _Requirements: 6.4_

- [ ] 1.3 Extender interface SubcategoriaGasto en `src/app/core/models/plan-ahorros.interface.ts`
  - Agregar campo `operaciones: OperacionFinanciera[]` si no existe
  - Agregar campo `icono: string` para Material Icons
  - _Requirements: 1.3, 2.1_

- [ ] 1.4 Crear interface TipoGastoDetalle en `src/app/core/models/plan-ahorros.interface.ts`
  - Definir estructura para tipo de gasto completo con subcategorías
  - _Requirements: 1.2_

- [ ] 1.5 Crear interface OperacionVinculable en `src/app/core/models/recategorizacion.interface.ts`
  - Definir estructura para operaciones que pueden vincularse
  - _Requirements: 5.2_

## Task 2: Extender PlanAhorrosService

- [ ] 2.1 Implementar método `getDetalleGastosPorTipo(mes: string, tipo: string): Observable<TipoGastoDetalle>`
  - Obtener operaciones del mes usando `getOperacionesPorFiltro`
  - Filtrar por tipo de gasto ('automaticos', 'hormigas', 'medios', 'excepcionales')
  - Agrupar por subcategoría
  - Calcular totales y porcentajes
  - Agregar iconos a cada subcategoría
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2.2 Implementar método `getOperacionesPorSubcategoria(mes: string, tipo: string, subcategoria: string): Observable<OperacionFinanciera[]>`
  - Filtrar operaciones por tipo y subcategoría
  - Ordenar por fecha descendente
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 2.3 Implementar método `getMovimientosCajaPorTipo(mes: string, tipoMovimiento: string): Observable<MovimientoCaja[]>`
  - Obtener movimientos de caja del mes usando filtro `categoria: 'movimiento_caja'`
  - Filtrar por tipoMovimiento ('transferencia', 'retiro', 'deposito', 'otros')
  - Marcar cuáles pueden recategorizarse
  - _Requirements: 3.1, 3.2, 3.4_

- [ ] 2.4 Implementar método `getOperacionesRecurrentesVinculables(): Observable<OperacionVinculable[]>`
  - Usar método existente `getOperacionesRecurrentes()`
  - Transformar a formato OperacionVinculable
  - _Requirements: 5.1, 5.2_

- [ ] 2.5 Implementar método `getPagosFinancierosVinculables(): Observable<OperacionVinculable[]>`
  - Obtener pagos financieros de la configuración
  - Transformar a formato OperacionVinculable
  - _Requirements: 5.1, 5.2_

- [ ] 2.6 Implementar método `recategorizarMovimiento(request: RecategorizacionRequest): Observable<RecategorizacionResponse>`
  - Simular llamada API con delay
  - Actualizar operación en caché de operaciones
  - Retornar respuesta exitosa
  - _Requirements: 6.4, 8.2, 8.3_

## Task 3: Refactorizar Componente DetalleGastosComponent para Tipos de Gasto

NOTA: Ya existen dos componentes detalle-gastos. Usar `src/app/features/plan-ahorros/detalle-gastos/` como base.

- [ ] 3.1 Actualizar ruta en `plan-ahorros.routes.ts`
  - Cambiar ruta de `detalle/gastos` a `gastos/:tipo`
  - Agregar parámetro de ruta para tipo de gasto
  - _Requirements: 1.1, 7.1_

- [ ] 3.2 Refactorizar lógica del componente TypeScript
  - Obtener parámetro 'tipo' de la ruta ('automaticos', 'hormigas', 'medios', 'excepcionales')
  - Usar nuevo método `getDetalleGastosPorTipo` del servicio
  - Implementar navegación a subcategoría
  - Mantener funcionalidad de botón de retroceso
  - _Requirements: 1.1, 1.5, 2.1_

- [ ] 3.3 Actualizar template HTML basado en diseño original
  - Header con botón de retroceso y título dinámico según tipo
  - Título del tipo de gasto (H2)
  - Card de resumen con monto total y porcentaje
  - Lista de subcategorías con iconos Material y montos
  - Hacer subcategorías clickeables para navegar a detalle
  - _Requirements: 1.2, 1.3, 1.4_

- [ ] 3.4 Actualizar estilos SCSS
  - Adaptar estilos del HTML original `plan-gastos-detalle.html`
  - Mantener consistencia con diseño Interbank
  - Responsive design
  - _Requirements: 1.1_

## Task 4: Crear Componente DetalleSubcategoriaComponent

- [ ] 4.1 Generar componente con Angular CLI
  - Ejecutar: `ng generate component features/plan-ahorros/detalle-subcategoria --standalone`
  - _Requirements: 2.1_

- [ ] 4.2 Agregar ruta en `plan-ahorros.routes.ts`
  - Agregar ruta `gastos/:tipo/:subcategoria`
  - _Requirements: 2.1, 7.1_

- [ ] 4.3 Implementar lógica del componente TypeScript
  - Inyectar PlanAhorrosService, Router, ActivatedRoute
  - Obtener parámetros 'tipo' y 'subcategoria' de la ruta
  - Cargar operaciones usando `getOperacionesPorSubcategoria`
  - Formatear fechas
  - Implementar botón de retroceso
  - _Requirements: 2.1, 2.2, 2.3, 2.5_

- [ ] 4.4 Crear template HTML
  - Header con botón de retroceso y título
  - Título de la subcategoría
  - Card de resumen con total
  - Lista de operaciones (descripción, fecha, monto)
  - _Requirements: 2.2, 2.4_

- [ ] 4.5 Crear estilos SCSS
  - Estilos consistentes con el resto de la app
  - Usar diseño similar a lista-movimientos
  - _Requirements: 2.1_

## Task 5: Refactorizar Componente MovimientosCajaDetalleComponent

NOTA: Ya existe componente stub en `src/app/features/plan-ahorros/movimientos-caja-detalle/`

- [ ] 5.1 Actualizar ruta en `plan-ahorros.routes.ts`
  - La ruta ya existe: `detalle/movimientos-caja/:tipo`
  - Verificar que el parámetro sea 'tipo' no 'tipoMovimiento'
  - _Requirements: 3.1, 7.1_

- [ ] 5.2 Implementar lógica del componente TypeScript
  - Inyectar PlanAhorrosService, Router, ActivatedRoute
  - Obtener parámetro 'tipo' de la ruta ('transferencias', 'retiros', 'depositos', 'otros')
  - Cargar movimientos usando `getMovimientosCajaPorTipo`
  - Implementar filtros (Entradas, Salidas, Todos)
  - Implementar navegación a recategorización
  - Implementar botón de retroceso
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 5.3 Crear template HTML basado en diseño original
  - Header con botón de retroceso y título
  - Sección con icono Material y monto total del tipo
  - Filtros (chips/pills para Entradas, Salidas, Todos)
  - Lista de movimientos con botón "Recategorizar"
  - _Requirements: 3.2, 3.3, 3.4_

- [ ] 5.4 Crear estilos SCSS
  - Adaptar estilos del HTML original `plan-movimientoCaja-detalle.html`
  - Estilos para filtros activos/inactivos
  - _Requirements: 3.1_

## Task 6: Crear Componente SeleccionarCategoriaComponent

- [ ] 6.1 Generar componente con Angular CLI
  - Ejecutar: `ng generate component features/plan-ahorros/seleccionar-categoria --standalone`
  - _Requirements: 4.1_

- [ ] 6.2 Agregar ruta en `plan-ahorros.routes.ts`
  - Agregar ruta `movimientos-caja/:tipo/recategorizar/:operacionId`
  - _Requirements: 4.1, 7.1_

- [ ] 6.3 Implementar lógica del componente TypeScript
  - Inyectar Router, ActivatedRoute
  - Obtener parámetros 'tipo' y 'operacionId' de la ruta
  - Definir opciones de categoría (Ingresos, Operaciones Recurrentes, Pagos Financieros)
  - Manejar selección de categoría con radio buttons
  - Implementar lógica de navegación según categoría seleccionada
  - Habilitar/deshabilitar botón de confirmar
  - _Requirements: 4.2, 4.3, 4.4, 4.5_

- [ ] 6.4 Crear template HTML basado en diseño original
  - Header con botón cerrar y título
  - Texto descriptivo
  - Lista de opciones de categoría con iconos Material
  - Botón de confirmar (disabled por defecto)
  - _Requirements: 4.2, 4.5_

- [ ] 6.5 Crear estilos SCSS
  - Adaptar estilos del HTML original `plan-movimientoCaja-detalle-tipoRecategorizacion.html`
  - Estados hover y seleccionado
  - _Requirements: 4.1_

## Task 7: Crear Componente ConfirmarRecategorizacionComponent

- [ ] 7.1 Generar componente con Angular CLI
  - Ejecutar: `ng generate component features/plan-ahorros/confirmar-recategorizacion --standalone`
  - _Requirements: 6.1_

- [ ] 7.2 Agregar ruta en `plan-ahorros.routes.ts`
  - Agregar ruta `movimientos-caja/:tipo/confirmar/:operacionId`
  - Usar query params para pasar categoría seleccionada
  - _Requirements: 6.1, 7.1_

- [ ] 7.3 Implementar lógica del componente TypeScript
  - Inyectar PlanAhorrosService, Router, ActivatedRoute
  - Obtener parámetros de la ruta y query params (categoria)
  - Cargar datos del movimiento desde el servicio
  - Cargar operaciones vinculables si aplica usando `getOperacionesRecurrentesVinculables` o `getPagosFinancierosVinculables`
  - Manejar selección de operación (radio buttons)
  - Implementar confirmación usando `recategorizarMovimiento`
  - Manejar estados de carga
  - Navegar de regreso a lista de movimientos
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 7.4 Crear template HTML basado en diseño original
  - Header con botón de retroceso y cerrar
  - Resumen del movimiento a recategorizar (monto, descripción, fecha)
  - Lista de operaciones vinculables (si aplica) con radio buttons
  - Botón de confirmar (sticky footer)
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 7.5 Crear estilos SCSS
  - Adaptar estilos del HTML original `plan-movimientoCaja-detalle-recategorizacion-confirmacion.html`
  - Estilos para radio buttons personalizados
  - Sticky footer
  - _Requirements: 6.1_

## Task 8: Verificar y Consolidar Rutas

NOTA: Las rutas se agregan en cada tarea de componente. Esta tarea es para verificación final.

- [ ] 8.1 Verificar todas las rutas en `plan-ahorros.routes.ts`
  - Verificar ruta `gastos/:tipo` para DetalleGastosComponent
  - Verificar ruta `gastos/:tipo/:subcategoria` para DetalleSubcategoriaComponent
  - Verificar ruta `detalle/movimientos-caja/:tipo` para MovimientosCajaDetalleComponent
  - Verificar ruta `movimientos-caja/:tipo/recategorizar/:operacionId` para SeleccionarCategoriaComponent
  - Verificar ruta `movimientos-caja/:tipo/confirmar/:operacionId` para ConfirmarRecategorizacionComponent
  - _Requirements: 7.1, 7.2_

## Task 9: Actualizar Componente Principal PlanAhorrosComponent

- [ ] 9.1 Actualizar plan-ahorros.component.ts
  - Agregar métodos de navegación a detalle de gastos por tipo
  - Agregar métodos de navegación a detalle de movimientos de caja por tipo
  - _Requirements: 1.1, 3.1_

- [ ] 9.2 Actualizar plan-ahorros.component.html
  - Hacer títulos de tipos de gasto clickeables (Cobros Automáticos, Gastos Hormiga, Gastos Medios, Gastos Excepcionales)
  - Actualizar botones "Ver más" de gastos para navegar a `/plan-ahorros/gastos/:tipo`
  - Actualizar botones "Ver más" de movimientos de caja para navegar a `/plan-ahorros/detalle/movimientos-caja/:tipo`
  - _Requirements: 1.1, 3.1_

## Task 10: Testing

- [ ] 10.1 Escribir unit tests para DetalleGastosComponent
  - Test de renderizado
  - Test de navegación
  - Test de carga de datos
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 10.2 Escribir unit tests para DetalleSubcategoriaComponent
  - Test de renderizado
  - Test de formateo de fechas
  - _Requirements: 2.1, 2.2_

- [ ] 10.3 Escribir unit tests para DetalleMovimientosComponent
  - Test de filtros
  - Test de navegación a recategorización
  - _Requirements: 3.3, 3.4_

- [ ] 10.4 Escribir unit tests para SeleccionarCategoriaComponent
  - Test de selección de categoría
  - Test de habilitación de botón
  - _Requirements: 4.3, 4.5_

- [ ] 10.5 Escribir unit tests para ConfirmarRecategorizacionComponent
  - Test de selección de operación
  - Test de confirmación
  - _Requirements: 6.3, 6.4_

- [ ] 10.6 Escribir unit tests para nuevos métodos del servicio
  - Test de getDetalleGastosPorTipo
  - Test de recategorizarMovimiento
  - _Requirements: 8.2, 8.3_


