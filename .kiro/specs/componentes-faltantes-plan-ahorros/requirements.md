# Requirements Document

## Introduction

Este documento define los requisitos para completar la implementación de los componentes faltantes del Plan de Ahorros en la aplicación Chicho. Se deben crear las pantallas de configuración del plan, las vistas de detalle de gastos, y agregar las operaciones en cada sección según los HTMLs originales y los requerimientos ya trabajados.

## Glossary

- **Sistema Angular**: La aplicación web desarrollada en Angular framework
- **Plan de Ahorros**: El módulo que muestra el resumen financiero mensual del usuario
- **Configuración del Plan**: Las pantallas donde el usuario configura su ingreso neto, meta de ahorro, operaciones recurrentes, etc.
- **Vista de Detalle de Gastos**: La pantalla que muestra el desglose completo de gastos por categoría
- **Operaciones**: Los movimientos financieros (ingresos, gastos, pagos) del usuario
- **HTMLs Originales**: Los archivos HTML en la carpeta OriginalHTMLs que sirven como referencia de diseño
- **Sección Colapsable**: Una sección del plan que se puede expandir/colapsar para mostrar/ocultar operaciones

## Requirements

### Requirement 1

**User Story:** Como usuario, quiero acceder a la configuración del plan de ahorros, para ajustar mis parámetros financieros

#### Acceptance Criteria

1. THE Sistema Angular SHALL crear un componente `PlanSettingsComponent` para la vista principal de configuración
2. THE vista de configuración SHALL mostrar opciones para: Ingreso Neto, Meta de Ahorro, Operaciones Recurrentes, Chanchito de Ahorro, Configuración de Gastos, y Topes de Gastos
3. WHEN un usuario hace clic en "Configuración" desde el plan de ahorros, THE Sistema Angular SHALL navegar a `/plan-ahorros/configuracion`
4. THE vista SHALL seguir el diseño del archivo `plan-settings.html`
5. THE vista SHALL incluir el pull-down handle para volver al home

### Requirement 2

**User Story:** Como usuario, quiero configurar mi ingreso neto mensual, para que el sistema calcule correctamente mis gastos disponibles

#### Acceptance Criteria

1. THE Sistema Angular SHALL crear un componente `IngresoNetoSettingsComponent`
2. THE vista SHALL permitir ingresar el monto del ingreso neto mensual
3. THE vista SHALL preguntar si el ingreso es fijo o variable
4. THE vista SHALL preguntar si contribuye a AFP
5. THE vista SHALL seguir el diseño del archivo `plan-settings-ingresoneto`
6. WHEN un usuario guarda, THE Sistema Angular SHALL actualizar la configuración del plan

### Requirement 3

**User Story:** Como usuario, quiero configurar mi meta de ahorro mensual, para tener un objetivo claro de cuánto ahorrar

#### Acceptance Criteria

1. THE Sistema Angular SHALL crear un componente `MetaAhorroSettingsComponent`
2. THE vista SHALL permitir ingresar la meta de ahorro como porcentaje o monto fijo
3. THE vista SHALL mostrar cuánto dinero queda disponible para gastos después de la meta
4. THE vista SHALL seguir el diseño del archivo `plan-settings-ahorro`
5. WHEN un usuario guarda, THE Sistema Angular SHALL actualizar la configuración del plan

### Requirement 4

**User Story:** Como usuario, quiero configurar operaciones recurrentes, para no tener que registrar manualmente pagos que se repiten cada mes

#### Acceptance Criteria

1. THE Sistema Angular SHALL crear un componente `OperacionesRecurrentesSettingsComponent`
2. THE vista SHALL mostrar una lista de operaciones recurrentes existentes
3. THE vista SHALL permitir agregar nuevas operaciones recurrentes
4. THE vista SHALL permitir editar o eliminar operaciones existentes
5. THE vista SHALL seguir el diseño del archivo `plan-settings-recurrentes.html`
6. WHEN un usuario guarda, THE Sistema Angular SHALL actualizar la lista de operaciones recurrentes

### Requirement 5

**User Story:** Como usuario, quiero seleccionar mi chanchito de ahorro principal, para que el sistema sepa dónde enviar mis ahorros

#### Acceptance Criteria

1. THE Sistema Angular SHALL crear un componente `ChanchitoSettingsComponent`
2. THE vista SHALL mostrar una lista de chanchitos disponibles
3. THE vista SHALL permitir seleccionar un chanchito como principal
4. THE vista SHALL seguir el diseño del archivo `plan-settings-chanchito.html`
5. WHEN un usuario selecciona un chanchito, THE Sistema Angular SHALL actualizar la configuración

### Requirement 6

**User Story:** Como usuario, quiero configurar cómo se categorizan mis gastos, para tener un mejor control de mis finanzas

#### Acceptance Criteria

1. THE Sistema Angular SHALL crear un componente `ConfiguracionGastosSettingsComponent`
2. THE vista SHALL permitir configurar los topes para clasificar gastos como hormiga, medio o excepcional
3. THE vista SHALL mostrar ejemplos de cada categoría
4. THE vista SHALL seguir el diseño del archivo `plan-settings-confgastos.html`
5. WHEN un usuario guarda, THE Sistema Angular SHALL actualizar la configuración de clasificación

### Requirement 7

**User Story:** Como usuario, quiero configurar topes mensuales para cada tipo de gasto, para controlar mejor mis finanzas

#### Acceptance Criteria

1. THE Sistema Angular SHALL crear un componente `TopesGastosSettingsComponent`
2. THE vista SHALL permitir configurar topes para: Cobros Automáticos, Gastos Hormiga, Gastos Medios, Gastos Excepcionales, Carga Financiera
3. THE vista SHALL permitir configurar cada tope como porcentaje del ingreso o monto fijo
4. THE vista SHALL seguir el diseño del archivo `plan-settings-topegastos.html`
5. WHEN un usuario guarda, THE Sistema Angular SHALL actualizar los topes mensuales

### Requirement 8

**User Story:** Como usuario, quiero ver el detalle completo de mis gastos del mes, para analizar en qué estoy gastando

#### Acceptance Criteria

1. THE Sistema Angular SHALL crear un componente `DetalleGastosComponent`
2. THE vista SHALL mostrar un filtro con opciones: Todos, Hormiga, Medio, Excepcional
3. THE vista SHALL mostrar un gráfico de barras horizontales con los 9 tipos de consumo principales + Otros
4. THE vista SHALL mostrar una lista cronológica de todas las operaciones de gastos
5. THE vista SHALL permitir hacer clic en una operación para ver más detalles
6. WHEN un usuario hace clic en "Ver más" desde la sección de Gastos, THE Sistema Angular SHALL navegar a `/plan-ahorros/detalle/gastos`

### Requirement 9

**User Story:** Como usuario, quiero ver las operaciones dentro de cada sección del plan, para entender el detalle de mis finanzas

#### Acceptance Criteria

1. THE sección de Ingresos SHALL mostrar la lista de operaciones de tipo ingreso cuando está expandida
2. THE sección de Operaciones Recurrentes SHALL mostrar las operaciones recurrentes del mes cuando está expandida
3. THE sección de Gastos SHALL mostrar las subsecciones (Automáticos, Hormiga, Medios, Excepcionales) con sus operaciones
4. THE sección de Movimientos de Caja SHALL mostrar las operaciones de transferencias, retiros, depósitos cuando está expandida
5. THE sección de Carga Financiera SHALL mostrar los pagos financieros cuando está expandida
6. WHEN una sección está colapsada, THE Sistema Angular SHALL mostrar solo el título y el total
7. WHEN una sección está expandida, THE Sistema Angular SHALL mostrar la lista de operaciones con descripción, fecha y monto

### Requirement 10

**User Story:** Como usuario, quiero que las operaciones se carguen desde el servicio, para ver datos reales de mis finanzas

#### Acceptance Criteria

1. THE Sistema Angular SHALL usar el servicio `PlanAhorrosService` para cargar las operaciones de cada sección
2. THE servicio SHALL filtrar las operaciones según la categoría y el mes seleccionado
3. THE servicio SHALL calcular los totales de cada sección sumando las operaciones correspondientes
4. THE servicio SHALL aplicar los filtros definidos en los requerimientos originales (tipoProducto, estado, vinculadaARecurrente, etc.)
5. WHEN no hay operaciones en una sección, THE Sistema Angular SHALL mostrar un mensaje "No hay operaciones"

