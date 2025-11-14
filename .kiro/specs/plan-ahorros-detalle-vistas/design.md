# Design Document

## Overview

Este documento describe el diseño técnico para implementar las vistas de detalle del Plan de Ahorros, incluyendo la arquitectura de componentes, modelos de datos, servicios y flujos de navegación.

## Architecture

### Component Structure

```
plan-ahorros/
├── plan-ahorros.component.ts (existente)
├── detalle-gastos/
│   ├── detalle-gastos.component.ts
│   ├── detalle-gastos.component.html
│   └── detalle-gastos.component.scss
├── detalle-subcategoria/
│   ├── detalle-subcategoria.component.ts
│   ├── detalle-subcategoria.component.html
│   └── detalle-subcategoria.component.scss
├── detalle-movimientos/
│   ├── detalle-movimientos.component.ts
│   ├── detalle-movimientos.component.html
│   └── detalle-movimientos.component.scss
├── seleccionar-categoria/
│   ├── seleccionar-categoria.component.ts
│   ├── seleccionar-categoria.component.html
│   └── seleccionar-categoria.component.scss
└── confirmar-recategorizacion/
    ├── confirmar-recategorizacion.component.ts
    ├── confirmar-recategorizacion.component.html
    └── confirmar-recategorizacion.component.scss
```

### Routing Structure

```typescript
{
  path: 'plan-ahorros',
  children: [
    { path: '', component: PlanAhorrosComponent },
    { path: 'gastos/:tipo', component: DetalleGastosComponent },
    { path: 'gastos/:tipo/:subcategoria', component: DetalleSubcategoriaComponent },
    { path: 'movimientos/:tipoMovimiento', component: DetalleMovimientosComponent },
    { path: 'movimientos/:tipoMovimiento/recategorizar/:operacionId', component: SeleccionarCategoriaComponent },
    { path: 'movimientos/:tipoMovimiento/confirmar/:operacionId', component: ConfirmarRecategorizacionComponent }
  ]
}
```

## Components and Interfaces

### 1. DetalleGastosComponent

**Purpose**: Mostrar las subcategorías de un tipo de gasto específico

**Inputs**:
- `tipo`: string (desde route params) - 'automaticos' | 'hormigas' | 'medios' | 'excepcionales'

**Data Structure**:
```typescript
interface SubcategoriaGasto {
  nombre: string;
  icono: string; // Material Icon name
  monto: number;
  operaciones: OperacionFinanciera[];
}

interface ResumenTipoGasto {
  tipo: string;
  montoTotal: number;
  porcentajeTotal: number;
  subcategorias: SubcategoriaGasto[];
}
```

**Key Methods**:
- `cargarDetalleGastos(tipo: string): void` - Carga las subcategorías del tipo
- `navegarASubcategoria(subcategoria: string): void` - Navega al detalle de subcategoría
- `volver(): void` - Regresa a la vista principal

### 2. DetalleSubcategoriaComponent

**Purpose**: Mostrar las operaciones individuales de una subcategoría

**Inputs**:
- `tipo`: string (desde route params)
- `subcategoria`: string (desde route params)

**Data Structure**:
```typescript
interface OperacionDetalle {
  id: string;
  descripcion: string;
  fecha: Date;
  monto: number;
  tipoProducto: 'TD' | 'TC';
}
```

**Key Methods**:
- `cargarOperaciones(tipo: string, subcategoria: string): void`
- `formatearFecha(fecha: Date): string`
- `volver(): void`

### 3. DetalleMovimientosComponent

**Purpose**: Mostrar los movimientos de caja con opción de recategorizar

**Inputs**:
- `tipoMovimiento`: string (desde route params) - 'transferencia' | 'retiro' | 'deposito' | 'otros'

**Data Structure**:
```typescript
interface MovimientoCaja {
  id: string;
  descripcion: string;
  fecha: Date;
  monto: number;
  tipoMovimiento: string;
  categoriaActual: string;
  puedeRecategorizar: boolean;
}

type FiltroMovimiento = 'entradas' | 'salidas' | 'todos';
```

**Key Methods**:
- `cargarMovimientos(tipo: string): void`
- `aplicarFiltro(filtro: FiltroMovimiento): void`
- `iniciarRecategorizacion(movimiento: MovimientoCaja): void`
- `volver(): void`

### 4. SeleccionarCategoriaComponent

**Purpose**: Permitir al usuario seleccionar el tipo de categoría para recategorizar

**Inputs**:
- `tipoMovimiento`: string (desde route params)
- `operacionId`: string (desde route params)

**Data Structure**:
```typescript
interface OpcionCategoria {
  id: 'ingresos' | 'operaciones_recurrentes' | 'pagos_financieros';
  nombre: string;
  icono: string;
  requiereVinculacion: boolean;
}
```

**Key Methods**:
- `seleccionarCategoria(categoria: OpcionCategoria): void`
- `confirmarCategoria(): void`
- `cancelar(): void`

### 5. ConfirmarRecategorizacionComponent

**Purpose**: Confirmar la recategorización y vincular con operación si es necesario

**Inputs**:
- `tipoMovimiento`: string (desde route params)
- `operacionId`: string (desde route params)
- `categoria`: string (desde query params)

**Data Structure**:
```typescript
interface RecategorizacionData {
  movimiento: MovimientoCaja;
  categoriaDestino: string;
  operacionVinculada?: OperacionRecurrente | PagoFinanciero;
}

interface OperacionVinculable {
  id: string;
  nombre: string;
  monto: number;
  tipo: 'recurrente' | 'pago_financiero';
}
```

**Key Methods**:
- `cargarDatosRecategorizacion(): void`
- `cargarOperacionesVinculables(): void`
- `seleccionarOperacion(operacion: OperacionVinculable): void`
- `confirmarRecategorizacion(): void`
- `cancelar(): void`

## Data Models

### Nuevas Interfaces

```typescript
// src/app/core/models/recategorizacion.interface.ts
export interface RecategorizacionRequest {
  operacionId: string;
  categoriaDestino: 'ingresos' | 'operacion_recurrente' | 'pago_financiero';
  operacionVinculadaId?: string;
  mes: string;
}

export interface RecategorizacionResponse {
  success: boolean;
  operacionActualizada: OperacionFinanciera;
  mensaje: string;
}

// src/app/core/models/subcategoria-gasto.interface.ts
export interface SubcategoriaGastoDetalle {
  nombre: string;
  icono: string;
  monto: number;
  cantidad: number;
  operaciones: OperacionFinanciera[];
}

export interface TipoGastoDetalle {
  tipo: 'automaticos' | 'hormigas' | 'medios' | 'excepcionales';
  nombreDisplay: string;
  montoTotal: number;
  porcentajeTotal: number;
  subcategorias: SubcategoriaGastoDetalle[];
}
```

## Service Methods

### PlanAhorrosService - Nuevos Métodos

```typescript
/**
 * Obtiene el detalle de un tipo de gasto con sus subcategorías
 */
getDetalleGastosPorTipo(mes: string, tipo: string): Observable<TipoGastoDetalle>

/**
 * Obtiene las operaciones de una subcategoría específica
 */
getOperacionesPorSubcategoria(mes: string, tipo: string, subcategoria: string): Observable<OperacionFinanciera[]>

/**
 * Obtiene los movimientos de caja por tipo
 */
getMovimientosCajaPorTipo(mes: string, tipoMovimiento: string): Observable<MovimientoCaja[]>

/**
 * Obtiene las operaciones recurrentes disponibles para vincular
 */
getOperacionesRecurrentesVinculables(): Observable<OperacionRecurrente[]>

/**
 * Obtiene los pagos financieros disponibles para vincular
 */
getPagosFinancierosVinculables(): Observable<PagoFinanciero[]>

/**
 * Recategoriza un movimiento de caja
 */
recategorizarMovimiento(request: RecategorizacionRequest): Observable<RecategorizacionResponse>
```

## Error Handling

### Error States

1. **Datos no encontrados**: Mostrar mensaje "No hay datos disponibles"
2. **Error de carga**: Mostrar mensaje de error con opción de reintentar
3. **Error de recategorización**: Mostrar mensaje de error y mantener en la vista actual
4. **Navegación inválida**: Redirigir a la vista principal

### Loading States

- Skeleton loaders durante carga inicial
- Spinner en botones durante acciones (confirmar recategorización)
- Indicador de progreso en navegación entre vistas

## Testing Strategy

### Unit Tests

1. **Componentes**:
   - Renderizado correcto de datos
   - Navegación entre vistas
   - Manejo de eventos de usuario
   - Estados de carga y error

2. **Servicios**:
   - Métodos de obtención de datos
   - Filtrado y agrupación de operaciones
   - Recategorización de movimientos

### Integration Tests

1. Flujo completo de navegación desde vista principal hasta detalle
2. Flujo completo de recategorización
3. Persistencia de estado durante navegación

### E2E Tests

1. Usuario navega a detalle de gastos y ve subcategorías
2. Usuario recategoriza un movimiento como ingreso
3. Usuario recategoriza un movimiento vinculándolo a operación recurrente

## Performance Considerations

1. **Lazy Loading**: Cargar componentes de detalle solo cuando se necesiten
2. **Caching**: Cachear datos de subcategorías y operaciones vinculables
3. **Virtual Scrolling**: Implementar si las listas de operaciones son muy largas
4. **Optimistic Updates**: Actualizar UI inmediatamente al recategorizar

## Accessibility

1. Navegación por teclado en todas las vistas
2. ARIA labels en botones y elementos interactivos
3. Anuncios de cambios de estado para lectores de pantalla
4. Contraste adecuado en todos los elementos

## Mobile Considerations

1. Diseño responsive para todos los componentes
2. Touch targets de mínimo 44x44px
3. Gestos de swipe para navegación (opcional)
4. Optimización de rendimiento para dispositivos móviles
