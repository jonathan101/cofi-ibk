# Design Document

## Overview

Este documento define el diseño técnico para completar la implementación de los componentes faltantes del Plan de Ahorros. Se crearán 8 nuevos componentes siguiendo los diseños de los HTMLs originales, manteniendo consistencia con la arquitectura existente de la aplicación.

## Architecture

### Component Structure

```
src/app/features/plan-ahorros/
├── plan-ahorros.component.ts/html/scss (✅ Ya existe)
├── settings/
│   ├── plan-settings.component.ts/html/scss (NUEVO)
│   ├── ingreso-neto-settings.component.ts/html/scss (NUEVO)
│   ├── meta-ahorro-settings.component.ts/html/scss (NUEVO)
│   ├── operaciones-recurrentes-settings.component.ts/html/scss (NUEVO)
│   ├── chanchito-settings.component.ts/html/scss (NUEVO)
│   ├── configuracion-gastos-settings.component.ts/html/scss (NUEVO)
│   └── topes-gastos-settings.component.ts/html/scss (NUEVO)
└── detalle/
    └── detalle-gastos.component.ts/html/scss (NUEVO)
```

### Routing Structure

```typescript
// app.routes.ts
{
  path: 'plan-ahorros',
  children: [
    { path: '', component: PlanAhorrosComponent },
    { path: 'configuracion', component: PlanSettingsComponent },
    { path: 'configuracion/ingreso-neto', component: IngresoNetoSettingsComponent },
    { path: 'configuracion/meta-ahorro', component: MetaAhorroSettingsComponent },
    { path: 'configuracion/operaciones-recurrentes', component: OperacionesRecurrentesSettingsComponent },
    { path: 'configuracion/chanchito', component: ChanchitoSettingsComponent },
    { path: 'configuracion/gastos', component: ConfiguracionGastosSettingsComponent },
    { path: 'configuracion/topes', component: TopesGastosSettingsComponent },
    { path: 'detalle/gastos', component: DetalleGastosComponent }
  ]
}
```

## Components and Interfaces

### 1. PlanSettingsComponent

**Propósito**: Vista principal de configuración del plan con lista de opciones

**Estructura HTML**:
- Pull-down handle
- Header con botón back y título "Configuración del Plan"
- Botón destacado: "Chatear con la IA para configurar tu plan"
- Lista de opciones en card:
  - Ingreso Mensual Neto (icono: payments)
  - Meta de Ahorro (icono: flag)
  - Chanchito Seleccionado (icono: savings filled)
  - Categorización de Gastos (icono: category)
  - Topes de Consumo (icono: trending_down)
  - Operaciones Recurrentes (icono: autorenew)

**Propiedades**:
```typescript
menuItems: ConfigMenuItem[] = [
  { icon: 'payments', label: 'Ingreso Mensual Neto', route: '/plan-ahorros/configuracion/ingreso-neto' },
  { icon: 'flag', label: 'Meta de Ahorro', route: '/plan-ahorros/configuracion/meta-ahorro' },
  { icon: 'savings', label: 'Chanchito Seleccionado', route: '/plan-ahorros/configuracion/chanchito', filled: true },
  { icon: 'category', label: 'Categorización de Gastos', route: '/plan-ahorros/configuracion/gastos' },
  { icon: 'trending_down', label: 'Topes de Consumo', route: '/plan-ahorros/configuracion/topes' },
  { icon: 'autorenew', label: 'Operaciones Recurrentes', route: '/plan-ahorros/configuracion/operaciones-recurrentes' }
];
```

**Métodos**:
- `onPullDown()`: Navega al home
- `navigateTo(route: string)`: Navega a la ruta especificada
- `openAIChat()`: Abre el chat con IA (placeholder)

### 2. IngresoNetoSettingsComponent

**Propósito**: Configurar el ingreso neto mensual del usuario

**Estructura HTML**:
- Pull-down handle
- Header con botón back y título "Ingreso Mensual"
- Título: "Tu Ingreso Mensual"
- Descripción: "Para crear tu plan, necesitamos saber cuál es tu ingreso neto mensual."
- Input numérico para el monto (placeholder: "S/ 0.00")
- Link: "¿Qué es el ingreso neto?"
- Footer sticky con botón "Guardar Ingreso"

**Propiedades**:
```typescript
ingresoNeto: number = 0;
configuracion: ConfiguracionPlan | null = null;
```

**Métodos**:
- `onPullDown()`: Navega al home
- `goBack()`: Vuelve a la vista anterior
- `guardarIngreso()`: Guarda el ingreso y actualiza la configuración
- `showInfoIngresoNeto()`: Muestra información sobre qué es el ingreso neto

### 3. MetaAhorroSettingsComponent

**Propósito**: Definir la meta de ahorro mensual

**Estructura HTML**:
- Pull-down handle
- Header con botón back y título "Define tu Meta de Ahorro"
- Card con información:
  - Tu Ingreso Neto Mensual: S/ X,XXX.XX
  - Tus Ingresos Libres: S/ X,XXX.XX
- Título: "Elige cuánto quieres ahorrar al mes"
- Monto grande en verde: S/ XXX.XX
- Slider para ajustar el monto (min: S/ 10, max: ingresos libres)
- Banner de advertencia si la meta es muy alta (>50% de ingresos libres)
- Footer sticky con botón "Establecer Meta"

**Propiedades**:
```typescript
ingresoNeto: number = 0;
ingresosLibres: number = 0;
metaAhorro: number = 0;
porcentajeAhorro: number = 0;
showWarning: boolean = false;
```

**Métodos**:
- `onPullDown()`: Navega al home
- `goBack()`: Vuelve a la vista anterior
- `onSliderChange(value: number)`: Actualiza la meta y calcula el porcentaje
- `calcularIngresosLibres()`: Calcula ingresos libres (ingreso neto - gastos fijos)
- `guardarMeta()`: Guarda la meta de ahorro
- `checkWarning()`: Verifica si mostrar advertencia

### 4. OperacionesRecurrentesSettingsComponent

**Propósito**: Gestionar operaciones recurrentes mensuales

**Estructura HTML**:
- Pull-down handle
- Header con botón back y título "Operaciones Recurrentes"
- Lista de operaciones recurrentes existentes:
  - Nombre de la operación
  - Monto
  - Frecuencia (mensual)
  - Botón editar/eliminar
- Botón flotante "+" para agregar nueva operación
- Modal para agregar/editar operación:
  - Nombre
  - Monto
  - Categoría
  - Día del mes
  - Tipo de producto (TD/TC)

**Propiedades**:
```typescript
operacionesRecurrentes: OperacionRecurrente[] = [];
showModal: boolean = false;
operacionEditando: OperacionRecurrente | null = null;
```

**Métodos**:
- `onPullDown()`: Navega al home
- `goBack()`: Vuelve a la vista anterior
- `cargarOperaciones()`: Carga las operaciones recurrentes
- `agregarOperacion()`: Abre modal para agregar
- `editarOperacion(op: OperacionRecurrente)`: Abre modal para editar
- `eliminarOperacion(id: string)`: Elimina una operación
- `guardarOperacion()`: Guarda la operación (nueva o editada)

### 5. ChanchitoSettingsComponent

**Propósito**: Seleccionar el chanchito principal para ahorros

**Estructura HTML**:
- Pull-down handle
- Header con botón back y título "Chanchito de Ahorro"
- Lista de chanchitos disponibles:
  - Icono de chanchito
  - Nombre del chanchito
  - Saldo actual
  - Radio button para seleccionar
- Footer sticky con botón "Guardar Selección"

**Propiedades**:
```typescript
chanchitos: Chanchito[] = [];
chanchitoSeleccionado: string | null = null;
```

**Métodos**:
- `onPullDown()`: Navega al home
- `goBack()`: Vuelve a la vista anterior
- `cargarChanchitos()`: Carga la lista de chanchitos
- `seleccionarChanchito(id: string)`: Marca un chanchito como seleccionado
- `guardarSeleccion()`: Guarda el chanchito seleccionado

### 6. ConfiguracionGastosSettingsComponent

**Propósito**: Configurar cómo se categorizan los gastos

**Estructura HTML**:
- Pull-down handle
- Header con botón back y título "Categorización de Gastos"
- Explicación: "Define los límites para clasificar tus gastos"
- Secciones:
  - **Gastos Hormiga**: Hasta S/ XX.XX
  - **Gastos Medios**: De S/ XX.XX a S/ XX.XX
  - **Gastos Excepcionales**: Más de S/ XX.XX
- Cada sección con:
  - Input para el monto límite
  - Ejemplos de gastos de esa categoría
- Footer sticky con botón "Guardar Configuración"

**Propiedades**:
```typescript
topeHormiga: number = 0;
topeMedio: number = 0;
configuracion: ConfiguracionPlan | null = null;
```

**Métodos**:
- `onPullDown()`: Navega al home
- `goBack()`: Vuelve a la vista anterior
- `cargarConfiguracion()`: Carga la configuración actual
- `validarTopes()`: Valida que los topes sean coherentes
- `guardarConfiguracion()`: Guarda la configuración

### 7. TopesGastosSettingsComponent

**Propósito**: Configurar topes mensuales para cada tipo de gasto

**Estructura HTML**:
- Pull-down handle
- Header con botón back y título "Topes de Consumo"
- Información del ingreso neto
- Lista de categorías con topes:
  - Cobros Automáticos
  - Gastos Hormiga
  - Gastos Medios
  - Gastos Excepcionales
  - Carga Financiera
- Cada categoría con:
  - Toggle: Porcentaje / Monto Fijo
  - Input para el valor
  - Indicador visual del monto calculado
- Footer sticky con botón "Guardar Topes"

**Propiedades**:
```typescript
ingresoNeto: number = 0;
topes: {
  cobrosAutomaticos: { tipo: 'porcentaje' | 'fijo', valor: number },
  gastosHormiga: { tipo: 'porcentaje' | 'fijo', valor: number },
  gastosMedios: { tipo: 'porcentaje' | 'fijo', valor: number },
  gastosExcepcionales: { tipo: 'porcentaje' | 'fijo', valor: number },
  cargaFinanciera: { tipo: 'porcentaje' | 'fijo', valor: number }
};
```

**Métodos**:
- `onPullDown()`: Navega al home
- `goBack()`: Vuelve a la vista anterior
- `cargarTopes()`: Carga los topes actuales
- `toggleTipo(categoria: string)`: Cambia entre porcentaje y monto fijo
- `calcularMontoTope(categoria: string)`: Calcula el monto según el tipo
- `guardarTopes()`: Guarda los topes configurados

### 8. DetalleGastosComponent

**Propósito**: Vista detallada de gastos con filtros y gráfico

**Estructura HTML**:
- Pull-down handle
- Header con botón back y título "Detalle de Gastos"
- Filtro de tipo de gasto:
  - Todos
  - Hormiga
  - Medio
  - Excepcional
- Gráfico de barras horizontales:
  - 9 categorías principales (Alimentación, Transporte, etc.)
  - Categoría "Otros" para el resto
  - Cada barra muestra el monto y porcentaje
- Lista cronológica de operaciones:
  - Fecha
  - Descripción
  - Categoría (pill)
  - Monto
  - Tipo de producto (TD/TC)
- Scroll infinito o paginación

**Propiedades**:
```typescript
filtroActivo: 'todos' | 'hormiga' | 'medio' | 'excepcional' = 'todos';
operaciones: OperacionFinanciera[] = [];
operacionesFiltradas: OperacionFinanciera[] = [];
datosGrafico: { categoria: string, monto: number, porcentaje: number }[] = [];
totalGastos: number = 0;
```

**Métodos**:
- `onPullDown()`: Navega al home
- `goBack()`: Vuelve a la vista anterior
- `cargarOperaciones()`: Carga las operaciones de gastos del mes
- `aplicarFiltro(filtro: string)`: Filtra las operaciones por tipo
- `generarDatosGrafico()`: Procesa las operaciones para el gráfico
- `verDetalleOperacion(op: OperacionFinanciera)`: Muestra detalle de una operación

## Data Models

### ConfigMenuItem
```typescript
interface ConfigMenuItem {
  icon: string;
  label: string;
  route: string;
  filled?: boolean; // Para iconos con fill
}
```

### OperacionRecurrente
```typescript
interface OperacionRecurrente {
  id: string;
  nombre: string;
  monto: number;
  categoria: string;
  diaDelMes: number;
  tipoProducto: 'TD' | 'TC';
  activa: boolean;
}
```

### Chanchito
```typescript
interface Chanchito {
  id: string;
  nombre: string;
  montoActual: number;
  metaMonto?: number;
  icono: string;
  color: string;
}
```

## Styling Guidelines

### Colores Consistentes
```scss
// Usar variables existentes
$color-primary: #00843d; // Verde Interbank
$color-blue: #0039a6; // Azul Interbank
$color-warning: #FFC107;
$color-danger: #e53e3e;
$color-bg-light: #f6f7f8;
$color-bg-dark: #101822;
```

### Componentes Reutilizables
- Usar `:host` para estilos del componente
- Mantener estructura flex con `height: 100%`
- Header con `flex-shrink: 0`
- Contenido con `flex: 1` y `overflow-y: auto`
- Footer sticky con `position: sticky` y `bottom: 0`

### Botones
- Primario: Verde (#00843d), texto blanco, altura 48-56px
- Secundario: Fondo gris claro, texto oscuro
- Iconos: Material Symbols Outlined

## Integration with Existing Services

### PlanAhorrosService
Agregar métodos:
```typescript
// Configuración
getConfiguracion(): Observable<ConfiguracionPlan>
updateConfiguracion(config: Partial<ConfiguracionPlan>): Observable<void>

// Operaciones Recurrentes
getOperacionesRecurrentes(): Observable<OperacionRecurrente[]>
addOperacionRecurrente(op: OperacionRecurrente): Observable<void>
updateOperacionRecurrente(id: string, op: Partial<OperacionRecurrente>): Observable<void>
deleteOperacionRecurrente(id: string): Observable<void>

// Chanchitos
getChanchitos(): Observable<Chanchito[]>
setChanchitoPrincipal(id: string): Observable<void>

// Detalle de Gastos
getOperacionesGastos(mes: string, filtro?: string): Observable<OperacionFinanciera[]>
getCategoriasGastos(mes: string): Observable<{ categoria: string, monto: number }[]>
```

## Error Handling

- Validación de formularios antes de guardar
- Mensajes de error claros y en español
- Loading states durante operaciones asíncronas
- Confirmación antes de eliminar operaciones recurrentes

## Testing Strategy

- Unit tests para cada componente
- Tests de integración para el flujo completo de configuración
- Tests de navegación entre vistas
- Tests de validación de formularios

