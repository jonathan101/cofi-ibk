# Requirements Document

## Introduction

Este documento especifica los requerimientos para implementar las vistas de detalle faltantes del Plan de Ahorros, incluyendo el detalle de gastos por subcategoría, detalle de movimientos de caja, y el flujo completo de recategorización de movimientos.

## Glossary

- **Sistema**: Aplicación web Angular del Plan de Ahorros
- **Usuario**: Persona que utiliza la aplicación para gestionar su plan de ahorros
- **Subcategoría de Gasto**: Clasificación específica de un gasto (ej: Viajes, Delivery, Restaurantes)
- **Movimiento de Caja**: Operación financiera de tipo transferencia, retiro, depósito u otros
- **Recategorización**: Proceso de cambiar la categoría de un movimiento de caja a Ingreso, Operación Recurrente o Pago Financiero
- **Operación Recurrente**: Gasto o pago que se repite mensualmente
- **Pago Financiero Otro Banco**: Pago de deuda o préstamo de otro banco
- **Vinculación**: Asociación de un movimiento con una operación recurrente o pago financiero previamente configurado

## Requirements

### Requirement 1: Vista de Detalle de Gastos por Tipo

**User Story:** Como usuario, quiero ver el detalle de mis gastos por tipo (Automáticos, Hormigas, Regulares, Excepcionales) para entender mejor en qué subcategorías estoy gastando.

#### Acceptance Criteria

1. WHEN el usuario hace clic en el título de un tipo de gasto en la vista principal, THE Sistema SHALL navegar a una vista de detalle mostrando las subcategorías de ese tipo
2. THE Sistema SHALL mostrar un resumen con el monto total del tipo de gasto y su porcentaje respecto al total
3. THE Sistema SHALL listar todas las subcategorías (Viajes, Delivery, Restaurantes, etc.) con su monto individual
4. THE Sistema SHALL mostrar un icono representativo para cada subcategoría
5. THE Sistema SHALL permitir al usuario regresar a la vista principal mediante un botón de retroceso

### Requirement 2: Vista de Operaciones por Subcategoría

**User Story:** Como usuario, quiero ver las operaciones individuales de una subcategoría específica para revisar cada transacción en detalle.

#### Acceptance Criteria

1. WHEN el usuario hace clic en una subcategoría, THE Sistema SHALL navegar a una vista mostrando todas las operaciones de esa subcategoría
2. THE Sistema SHALL mostrar para cada operación: nombre, fecha y monto
3. THE Sistema SHALL ordenar las operaciones por fecha descendente
4. THE Sistema SHALL mostrar el total de la subcategoría en un resumen superior
5. THE Sistema SHALL permitir al usuario regresar a la vista de subcategorías mediante un botón de retroceso

### Requirement 3: Vista de Detalle de Movimientos de Caja

**User Story:** Como usuario, quiero ver el detalle de mis movimientos de caja (transferencias, retiros, depósitos) para poder recategorizarlos si es necesario.

#### Acceptance Criteria

1. WHEN el usuario hace clic en "Ver más" en la sección de Movimientos de Caja, THE Sistema SHALL navegar a una vista de detalle
2. THE Sistema SHALL mostrar el tipo de movimiento seleccionado (Transferencias, Retiros, Depósitos, Otros) con su monto total
3. THE Sistema SHALL proporcionar filtros para: Entradas, Salidas, Todos
4. THE Sistema SHALL listar cada movimiento con: descripción, fecha, monto y botón "Recategorizar"
5. THE Sistema SHALL permitir al usuario regresar a la vista principal mediante un botón de retroceso

### Requirement 4: Selección de Tipo de Recategorización

**User Story:** Como usuario, quiero seleccionar a qué categoría deseo recategorizar un movimiento para organizarlo correctamente en mi plan.

#### Acceptance Criteria

1. WHEN el usuario hace clic en "Recategorizar" en un movimiento, THE Sistema SHALL mostrar una vista con las opciones de categorización
2. THE Sistema SHALL mostrar tres opciones: Ingresos, Operaciones Recurrentes, Pagos Financieros (Otro Banco)
3. WHEN el usuario selecciona "Ingresos", THE Sistema SHALL proceder directamente a la confirmación sin requerir vinculación
4. WHEN el usuario selecciona "Operaciones Recurrentes" o "Pagos Financieros", THE Sistema SHALL navegar a la vista de vinculación
5. THE Sistema SHALL deshabilitar el botón "Confirmar Categoría" hasta que el usuario seleccione una opción

### Requirement 5: Vinculación con Operaciones Configuradas

**User Story:** Como usuario, quiero vincular un movimiento recategorizado con una operación recurrente o pago financiero existente para que se asocie correctamente.

#### Acceptance Criteria

1. WHEN el usuario selecciona "Operaciones Recurrentes" o "Pagos Financieros", THE Sistema SHALL mostrar una lista de operaciones previamente configuradas
2. THE Sistema SHALL mostrar para cada operación: nombre y monto
3. THE Sistema SHALL permitir al usuario seleccionar una operación mediante radio buttons
4. THE Sistema SHALL habilitar el botón "Confirmar" solo cuando el usuario seleccione una operación
5. WHEN el usuario confirma, THE Sistema SHALL vincular el movimiento con la operación seleccionada

### Requirement 6: Confirmación de Recategorización

**User Story:** Como usuario, quiero confirmar la recategorización de un movimiento antes de que se aplique para evitar errores.

#### Acceptance Criteria

1. THE Sistema SHALL mostrar un resumen del movimiento a recategorizar: monto, descripción y fecha
2. IF la categoría es "Ingresos", THE Sistema SHALL mostrar un botón de confirmación directa
3. IF la categoría requiere vinculación, THE Sistema SHALL mostrar la lista de operaciones disponibles
4. WHEN el usuario confirma, THE Sistema SHALL aplicar la recategorización (preparar llamada API)
5. WHEN la recategorización se completa, THE Sistema SHALL navegar de regreso a la lista de movimientos

### Requirement 7: Navegación y Rutas

**User Story:** Como usuario, quiero que la navegación entre vistas sea fluida y pueda usar el botón de retroceso del navegador.

#### Acceptance Criteria

1. THE Sistema SHALL crear rutas independientes para cada vista de detalle
2. THE Sistema SHALL mantener el contexto de navegación (tipo de gasto, subcategoría, movimiento)
3. THE Sistema SHALL permitir navegación mediante el botón de retroceso del navegador
4. THE Sistema SHALL mantener el estado de filtros y selecciones al navegar entre vistas
5. THE Sistema SHALL mostrar indicadores de carga durante las transiciones de navegación

### Requirement 8: Persistencia de Datos (Preparación para API)

**User Story:** Como desarrollador, quiero preparar la estructura para persistir las recategorizaciones mediante API cuando esté disponible.

#### Acceptance Criteria

1. THE Sistema SHALL crear métodos en el servicio para recategorizar movimientos
2. THE Sistema SHALL estructurar los datos de recategorización en el formato esperado por la API
3. THE Sistema SHALL simular la llamada API con un delay y respuesta exitosa
4. THE Sistema SHALL manejar estados de carga durante la recategorización
5. THE Sistema SHALL preparar manejo de errores para cuando la API esté disponible
