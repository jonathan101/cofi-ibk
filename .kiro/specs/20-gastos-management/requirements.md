# Requirements: Gastos Management

## Introduction

Sistema completo para gestionar y visualizar gastos del mes, clasificados en automáticos, hormiga, medios y excepcionales. Incluye visualización de subcategorías, detalle de operaciones, y navegación drill-down.

## Glossary

- **Gasto**: Operación financiera con monto negativo
- **Gasto Automático**: Cobro recurrente automático (Netflix, Spotify, etc.)
- **Gasto Hormiga**: Gasto pequeño frecuente (< 20% ingreso diario)
- **Gasto Medio**: Gasto regular (20-50% ingreso diario)
- **Gasto Excepcional**: Gasto grande poco frecuente (> 50% ingreso diario)
- **Subcategoría**: Clasificación específica del gasto (transporte, comida, etc.)
- **Drill-down**: Navegación desde resumen → tipo → subcategoría → operaciones

## Requirements

### Requirement 1: Visualización de Resumen de Gastos

**User Story:** Como usuario, quiero ver un resumen de mis gastos por tipo, para entender cómo estoy gastando mi dinero.

#### Acceptance Criteria

1. THE System SHALL mostrar 4 tipos de gastos: Automáticos, Hormiga, Medios, Excepcionales
2. WHEN se muestra un tipo de gasto, THE System SHALL mostrar el monto total
3. WHEN se muestra un tipo de gasto, THE System SHALL mostrar el desglose TD/TC
4. WHEN es el mes actual, THE System SHALL mostrar el disponible restante
5. WHEN es un mes pasado, THE System SHALL mostrar el porcentaje utilizado

### Requirement 2: Navegación Drill-down

**User Story:** Como usuario, quiero navegar desde el resumen hasta operaciones individuales, para ver el detalle de mis gastos.

#### Acceptance Criteria

1. WHEN el usuario hace clic en un tipo de gasto, THE System SHALL navegar a la vista de detalle del tipo
2. WHEN se muestra el detalle de tipo, THE System SHALL mostrar subcategorías con gráfico de barras
3. WHEN el usuario hace clic en una subcategoría, THE System SHALL navegar a la lista de operaciones
4. THE System SHALL mantener el contexto de navegación (breadcrumbs)

### Requirement 3: Detalle de Tipo de Gasto

**User Story:** Como usuario, quiero ver las subcategorías de un tipo de gasto, para identificar en qué estoy gastando más.

#### Acceptance Criteria

1. THE System SHALL mostrar el título del tipo de gasto
2. THE System SHALL mostrar el monto total y porcentaje
3. THE System SHALL listar subcategorías ordenadas por monto descendente
4. WHEN se muestra una subcategoría, THE System SHALL mostrar: nombre, icono, monto, porcentaje, barra de progreso
5. THE System SHALL mostrar el número de operaciones por subcategoría

### Requirement 4: Detalle de Subcategoría

**User Story:** Como usuario, quiero ver todas las operaciones de una subcategoría, para revisar gastos específicos.

#### Acceptance Criteria

1. THE System SHALL mostrar el nombre de la subcategoría
2. THE System SHALL mostrar el monto total de la subcategoría
3. THE System SHALL listar todas las operaciones con: descripción, fecha, monto
4. THE System SHALL ordenar operaciones por fecha descendente
5. THE System SHALL permitir scroll cuando hay muchas operaciones

### Requirement 5: Indicadores Visuales

**User Story:** Como usuario, quiero indicadores visuales de mi consumo, para saber si estoy dentro del presupuesto.

#### Acceptance Criteria

1. WHEN el disponible es positivo, THE System SHALL mostrar el monto en verde
2. WHEN el disponible está entre 0 y -10%, THE System SHALL mostrar el monto en amarillo
3. WHEN el disponible es menor a -10%, THE System SHALL mostrar el monto en rojo
4. THE System SHALL usar barras de progreso con colores según el porcentaje usado
5. THE System SHALL mostrar iconos representativos para cada subcategoría
