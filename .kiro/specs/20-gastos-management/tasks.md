# Implementation Plan: Gastos Management

- [ ] 1. Crear modelos y tipos
  - Crear `gasto.model.ts` con tipos y interfaces
  - Crear enums para TipoGasto
  - Crear interfaces para ResumenGastosPorTipo, DetalleConsumo, etc.
  - _Requirements: All_

- [ ] 2. Implementar GastosService
- [ ] 2.1 Crear servicio base
  - Crear `gastos.service.ts`
  - Inyectar dependencias (ApiService, Store)
  - _Requirements: 1.1, 2.1_

- [ ] 2.2 Implementar cálculo de resumen
  - Método `getResumenGastos()`
  - Agrupar operaciones por tipo
  - Calcular totales TD/TC
  - Calcular disponible y porcentaje usado
  - _Requirements: 1.2, 1.3, 1.4, 1.5_

- [ ] 2.3 Implementar agrupación por subcategoría
  - Método `getDetalleGastosPorTipo()`
  - Agrupar operaciones por subcategoría
  - Calcular porcentajes
  - Ordenar por monto descendente
  - _Requirements: 3.3, 3.4, 3.5_

- [ ] 2.4 Implementar filtrado de operaciones
  - Método `getOperacionesPorSubcategoria()`
  - Filtrar por tipo y subcategoría
  - Ordenar por fecha descendente
  - _Requirements: 4.3, 4.4_

- [ ]* 2.5 Escribir tests del servicio
  - Tests para cálculo de resumen
  - Tests para agrupación
  - Tests para filtrado
  - _Requirements: All_

- [ ] 3. Implementar componentes de UI
- [ ] 3.1 Crear GastoTipoCard
  - Crear componente con inputs
  - Implementar template con header, content, button
  - Implementar estilos
  - Agregar lógica de colores según estado
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 5.1, 5.2, 5.3_

- [ ] 3.2 Crear SubcategoriaCard
  - Crear componente con inputs
  - Implementar template con icono, nombre, monto
  - Implementar barra de progreso
  - Agregar evento de click
  - _Requirements: 3.4, 3.5, 5.4, 5.5_

- [ ] 3.3 Crear OperacionItem
  - Crear componente con input
  - Implementar template simple
  - Implementar estilos
  - _Requirements: 4.3_

- [ ]* 3.4 Escribir tests de componentes
  - Tests de renderizado
  - Tests de eventos
  - Tests de estilos condicionales
  - _Requirements: All_

- [ ] 4. Implementar páginas
- [ ] 4.1 Actualizar PlanAhorrosPage
  - Agregar sección de gastos
  - Integrar GastoTipoCard
  - Implementar navegación a detalle
  - _Requirements: 1.1, 2.1_

- [ ] 4.2 Crear DetalleGastosPage
  - Crear componente de página
  - Usar BaseLayoutComponent
  - Cargar datos del tipo seleccionado
  - Renderizar lista de SubcategoriaCard
  - Implementar navegación a subcategoría
  - _Requirements: 2.2, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 4.3 Crear DetalleSubcategoriaPage
  - Crear componente de página
  - Usar BaseLayoutComponent
  - Cargar operaciones de la subcategoría
  - Renderizar lista de OperacionItem
  - Implementar scroll correcto
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 5. Configurar routing
  - Agregar ruta `/plan-ahorros/gastos/:tipo`
  - Agregar ruta `/plan-ahorros/gastos/:tipo/:subcategoria`
  - Configurar guards si es necesario
  - _Requirements: 2.1, 2.4_

- [ ] 6. Implementar indicadores visuales
  - Crear función para determinar color según disponible
  - Crear función para determinar color según porcentaje
  - Aplicar clases CSS dinámicamente
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ]* 7. Escribir tests de integración
  - Test de navegación drill-down completa
  - Test de cálculos end-to-end
  - Test de estados de error
  - _Requirements: All_

- [ ]* 8. Escribir tests E2E
  - Test de flujo completo de usuario
  - Test de diferentes tipos de gastos
  - Test de empty states
  - _Requirements: All_

- [ ] 9. Documentación
  - Actualizar docs/features/gastos-management.md
  - Agregar ejemplos de uso
  - Documentar decisiones de diseño
  - _Requirements: All_
