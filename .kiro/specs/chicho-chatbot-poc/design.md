# Design Document

## Overview

Este documento define el diseño técnico de la aplicación Angular "Chicho - Chanchito Inteligente del Ahorro". La aplicación es una PoC que prioriza simplicidad, legibilidad y facilidad de mantenimiento sobre arquitecturas complejas. El proyecto se estructura para generar automáticamente componentes Angular a partir de HTMLs existentes en el folder OriginalHTMLs, manteniendo una arquitectura base completa con routing, servicios con fallback a datos mock, y variables SCSS parametrizadas.

## Architecture

### Project Structure

```
chicho-chatbot-poc/
├── src/
│   ├── app/
│   │   ├── core/                    # Servicios singleton y configuración
│   │   │   ├── services/
│   │   │   │   ├── api.service.ts
│   │   │   │   ├── chat.service.ts
│   │   │   │   ├── alertas.service.ts
│   │   │   │   ├── recompensas.service.ts
│   │   │   │   └── plan-ahorros.service.ts
│   │   │   ├── guards/
│   │   │   └── interceptors/
│   │   ├── shared/                  # Componentes reutilizables
│   │   │   ├── components/
│   │   │   │   ├── mobile-container/
│   │   │   │   ├── floating-button/
│   │   │   │   ├── chat-message/
│   │   │   │   ├── alert-card/
│   │   │   │   └── reward-card/
│   │   │   └── pipes/
│   │   ├── features/                # Módulos de funcionalidad
│   │   │   ├── home/
│   │   │   ├── chat/
│   │   │   ├── plan-ahorros/
│   │   │   ├── recompensas/
│   │   │   └── alertas/
│   │   ├── app.component.ts
│   │   ├── app.routes.ts
│   │   └── app.config.ts
│   ├── assets/
│   │   ├── icons/                   # SVG icons - fácil de reemplazar
│   │   ├── images/                  # Imágenes y avatares
│   │   └── data/                    # JSON con datos mock
│   ├── styles/
│   │   ├── _variables.scss          # Variables de diseño Interbank
│   │   ├── _mixins.scss
│   │   └── styles.scss
│   └── environments/
├── OriginalHTMLs/                   # HTMLs de Stitch sin modificar
└── vercel.json
```


### Technology Stack

- **Framework**: Angular 17+ (standalone components)
- **Styling**: SCSS con variables parametrizadas
- **Routing**: Angular Router con lazy loading opcional
- **State Management**: Servicios con RxJS (sin NgRx para simplicidad)
- **HTTP**: HttpClient con interceptores para fallback
- **Deployment**: Vercel con configuración estática

### Design Principles

1. **Simplicidad sobre complejidad**: Código directo y fácil de entender
2. **Legibilidad**: Nombres descriptivos en español cuando sea apropiado
3. **Modularidad**: Componentes pequeños y reutilizables
4. **Preparado para APIs**: Servicios con fallback automático a datos mock
5. **Fácil mantenimiento**: Assets organizados y documentados para reemplazo sencillo

## Components and Interfaces

### Core Components

#### 0. PlanAhorrosComponent (Actualizado)
**Propósito**: Vista principal del plan de ahorros con cálculos financieros, navegación entre meses y secciones colapsables

**Responsabilidades**:
- Mostrar selector de mes para navegar entre Agosto-Noviembre
- Cargar datos del mes seleccionado
- Calcular saldo actual dinámicamente: saldoInicial + ingresos + operacionesRegulares + gastos + movimientosCaja + cargaFinanciera
- Calcular "Por Pagar": suma de operaciones pendientes + operaciones atrasadas
- Mostrar secciones "Pagos Financieros Atrasados" y "Operaciones Recurrentes Atrasadas" si existen
- **Mostrar subsecciones de Gastos**: Cobros Automáticos, Gastos Hormiga, Gastos Medios, Gastos Excepcionales
- **Para cada subsección de gastos mostrar**:
  - Consumo Débito (TD) - **TEXTO NORMAL** (sin pill)
  - Consumo TC - **TEXTO NORMAL** (sin pill)
  - Total (TD + TC) - **CON PILL DE COLOR** según porcentaje usado:
    - Normal (< 90%): texto normal sin pill
    - Ámbar (90-100%): pill amarillo
    - Rojo (> 100%): pill rojo
- **Mostrar sección de Carga Financiera**:
  - Total - **CON PILL DE COLOR** según porcentaje usado (misma lógica que gastos)
- **Botón "Ver más"**: Solo existe en la sección general de "Gastos" (NO en cada subsección individual)
  - Al hacer clic, navega a `/plan-ahorros/detalle/gastos`
  - Muestra vista con filtro (Todos, Hormiga, Medio, Excepcional)
  - Muestra gráfico de barras horizontales con 9 tipos de consumo + Otros
  - Muestra lista cronológica de operaciones
- **IMPORTANTE**: Los pills de alerta se aplican a:
  - Total de cada subsección de Gastos (Cobros Automáticos, Gastos Hormiga, Gastos Medios, Gastos Excepcionales)
  - Total de Carga Financiera
  - NO se aplican a los valores individuales de TD y TC
- Calcular total de cada sección sumando operaciones de la categoría
- Permitir filtrar operaciones por estado (pagado/pendiente) para cálculos
- Gestionar estado de colapso de cada sección
- Botón global para colapsar/descolapsar todas las secciones
- Aplicar transiciones smooth al colapsar/descolapsar (siguiendo prácticas de apps móviles modernas)
- Implementar pull-to-refresh
- Implementar drag-to-save al chanchito (solo mes actual)
- Permitir vincular operaciones con operaciones recurrentes programadas

**Inputs**: Ninguno

**Outputs**:
- `onRefresh: EventEmitter<void>` - Pull-to-refresh activado
- `onDragToSave: EventEmitter<void>` - Drag-to-save completado
- `onMesChange: EventEmitter<string>` - Mes seleccionado cambió

**Cálculos clave usando el sistema de filtros**:
```typescript
// Función helper para obtener categoría efectiva
function getCategoriaEfectiva(op: OperacionFinanciera): string {
  // Prioridad: categoriaUsuario > categoria
  return op.categoriaUsuario || op.categoria;
}

// Saldo Actual (excluye operaciones vinculadas a recurrentes para evitar duplicados)
const operacionesParaSaldo = operaciones.filter(op => !op.vinculadaARecurrente);

const ingresos = await this.planService.sumarOperaciones({ 
  categoriaUsuario: 'ingreso',
  vinculadaARecurrente: false 
});

const operacionesReg = await this.planService.sumarOperaciones({ 
  categoriaUsuario: 'operacion_recurrente',
  vinculadaARecurrente: false 
});

const gastos = await this.planService.sumarOperaciones({ 
  categoria: 'gastos',
  vinculadaARecurrente: false 
});

// Movimientos de caja: solo si NO tienen categoriaUsuario
const movCaja = await this.planService.sumarOperaciones({ 
  categoria: ['transferencia', 'retiro', 'deposito', 'otros'],
  categoriaUsuario: null,
  vinculadaARecurrente: false 
});

const cargaFin = await this.planService.sumarOperaciones({ 
  categoriaUsuario: 'pago_financiero_otro_banco',
  estado: 'pagado',
  vinculadaARecurrente: false 
});

saldoActual = saldoInicial + ingresos + operacionesReg + gastos + movCaja + cargaFin;

// Por Pagar (incluye atrasadas)
porPagar = await this.planService.sumarOperaciones({ 
  categoriaUsuario: ['pago_financiero_otro_banco', 'operacion_recurrente'], 
  estado: 'pendiente',
  vinculadaARecurrente: false 
});

// Saldo a mostrar (NO incluye chanchitos)
saldoAMostrar = saldoActual; // Los chanchitos se muestran aparte
```

#### 1. MobileContainerComponent
**Propósito**: Wrapper que simula un dispositivo móvil en desktop

**Responsabilidades**:
- Detectar tipo de dispositivo (desktop vs móvil)
- Renderizar marco de celular en desktop
- Ajustar dimensiones responsivamente
- Aplicar estilos de sombra y bordes

**Inputs**: Ninguno
**Outputs**: Ninguno

**Estilos clave**:
```scss
.mobile-container {
  width: 100%;
  max-width: 480px;
  min-width: 360px;
  min-height: 640px;
  margin: 0 auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  border-radius: 40px;
  
  @media (max-width: 768px) {
    max-width: 100%;
    border-radius: 0;
    box-shadow: none;
  }
}
```

#### 2. FloatingButtonComponent
**Propósito**: Botón flotante de Chicho con badge de notificaciones

**Responsabilidades**:
- Mostrar icono de Chicho
- Mostrar badge con número de notificaciones pendientes
- Emitir evento al hacer clic
- Mantener posición fija durante scroll

**Inputs**:
- `notificationCount: number` - Número de notificaciones pendientes

**Outputs**:
- `onClick: EventEmitter<void>` - Evento al hacer clic


#### 3. ChatMessageComponent
**Propósito**: Componente reutilizable para mensajes del chat que renderiza diferentes tipos

**Responsabilidades**:
- Renderizar mensaje según tipo: chat, alerta o recompensa
- Mostrar componente específico según el tipo
- Aplicar estilos según si es IA o usuario
- Mostrar avatar cuando corresponda

**Inputs**:
- `message: ChatMessage` - Objeto con contenido del mensaje

**Outputs**: Ninguno

**Lógica de renderizado**:
```typescript
// Si tipo === 'chat'
<div class="mensaje-chat" [class.es-ia]="message.esIA">
  <p>{{ message.texto }}</p>
</div>

// Si tipo === 'alerta'
<app-alert-card 
  [titulo]="message.titulo"
  [subtitulo]="message.subtitulo"
  [icono]="message.icono"
  [textoBoton]="message.textoBoton">
</app-alert-card>

// Si tipo === 'recompensa'
<app-reward-card 
  [titulo]="message.tituloRecompensa"
  [subtitulo]="message.subtituloRecompensa"
  [icono]="message.iconoRecompensa"
  [imagen]="message.imagenRecompensa"
  [textoBoton]="message.textoBotonRecompensa">
</app-reward-card>
```

#### 4. AlertCardComponent
**Propósito**: Card para mostrar alertas financieras

**Responsabilidades**:
- Mostrar información de la alerta
- Aplicar color según severidad (amarillo, rojo)
- Mostrar timestamp relativo
- Emitir eventos de acción (marcar como leída, descartar)

**Inputs**:
- `alert: Alert` - Objeto con datos de la alerta
- `severity: 'warning' | 'danger' | 'info'` - Nivel de severidad

**Outputs**:
- `onMarkAsRead: EventEmitter<string>` - ID de alerta marcada como leída
- `onDismiss: EventEmitter<string>` - ID de alerta descartada

#### 5. RewardCardComponent
**Propósito**: Card para mostrar recompensas y beneficios

**Responsabilidades**:
- Mostrar información del beneficio
- Renderizar icono o imagen
- Mostrar botón de acción
- Aplicar estilos de marca Interbank

**Inputs**:
- `reward: Reward` - Objeto con datos de la recompensa
- `category: string` - Categoría del beneficio

**Outputs**:
- `onAction: EventEmitter<string>` - ID de recompensa seleccionada

#### 6. ConfigurarPlanComponent
**Propósito**: Vista principal de configuración con navegación a sub-configuraciones

**Responsabilidades**:
- Mostrar fecha de vigencia automática (mes actual)
- Permitir editar ingreso neto mensual
- Configurar metas de ahorro
- Configurar tiempo de espera de alerta ante compras altas en TC/TD
- Permitir seleccionar cuentas excluidas del saldo inicial
- **Link a "Topes Mensuales"** → Abre vista de topes mensuales
- **Link a "Clasificación de Gastos"** → Abre vista de clasificación
- Link a "Operaciones Recurrentes"
- Mostrar advertencia clara de que solo afecta meses futuros
- Mostrar botón para volver a hablar con Chicho

**Inputs**: Ninguno (carga datos del plan actual)

**Outputs**:
- `onSave: EventEmitter<ConfiguracionPlan>` - Configuración guardada
- `onChatWithChicho: EventEmitter<void>` - Usuario quiere ayuda de Chicho

#### 6a. TopesMensualesComponent
**Propósito**: Configurar topes mensuales para todas las secciones

**Responsabilidades**:
- Mostrar topes mensuales para: Cobros Automáticos, Gastos Hormiga, Gastos Medios, Gastos Excepcionales, Carga Financiera, Movimientos de Caja, Operaciones Recurrentes
- Para cada tope permitir elegir: Porcentaje del ingreso, Monto Fijo, o Sin Tope
- Si existe monto fijo, usar ese (prioridad)
- Mostrar monto calculado si se usa porcentaje
- Si no tiene tope (null), no se mostrarán pills de alerta
- Guardar configuración

**Inputs**: Ninguno

**Outputs**:
- `onSave: EventEmitter<TopesMensuales>` - Topes guardados

**UI Example**:
```
Carga Financiera (con tope por defecto)
● Porcentaje: [30]% = S/ 1,200
○ Monto Fijo: S/ [___]
○ Sin Tope

Cobros Automáticos (con tope por defecto)
● Porcentaje: [10]% = S/ 400
○ Monto Fijo: S/ [___]
○ Sin Tope

Movimientos de Caja (sin tope por defecto)
○ Porcentaje: [__]% = S/ ___
○ Monto Fijo: S/ [___]
● Sin Tope
```

**Topes por defecto**:
- Carga Financiera: 30%
- Cobros Automáticos: 10%
- Gastos Hormiga: 10%
- Gastos Medios: 10%
- Gastos Excepcionales: 10%
- Movimientos de Caja: Sin tope
- Operaciones Recurrentes: Sin tope

#### 6b. ClasificacionGastosComponent
**Propósito**: Configurar topes para clasificar gastos individuales

**Responsabilidades**:
- Configurar tope para clasificar un gasto como "Hormiga"
- Configurar tope para clasificar un gasto como "Medio"
- Para cada tope permitir elegir: Automático (fórmula) o Manual
- Si automático, mostrar monto calculado
- Guardar configuración

**Inputs**: Ninguno

**Outputs**:
- `onSave: EventEmitter<ClasificacionGastos>` - Clasificación guardada

**UI Example**:
```
Tope para clasificar como Hormiga
● Automático (20% ingreso diario = S/ 20)
○ Manual: S/ [___]

Tope para clasificar como Medio
○ Automático (50% ingreso diario = S/ 60)
● Manual: S/ [500]
```

#### 7. CategorizarMovimientoModalComponent
**Propósito**: Modal para categorizar movimientos sin categorizar

**Responsabilidades**:
- Mostrar lista de movimientos sin categorizar
- Permitir seleccionar categoría: Ingresos, Operaciones Regulares, Pagos Financieros (Otros Bancos)
- Guardar categorización
- Cerrar modal

**Inputs**:
- `movimientos: MovimientoSinCategorizar[]` - Lista de movimientos

**Outputs**:
- `onCategorize: EventEmitter<{id: string, categoria: string}>` - Movimiento categorizado
- `onClose: EventEmitter<void>` - Modal cerrado

#### 8. DetalleGastosComponent
**Propósito**: Vista detallada de TODOS los gastos (accesible desde botón "Ver más" de la sección general de Gastos)

**Responsabilidades**:
- Mostrar filtro con opciones: Todos, Gastos Hormiga, Gastos Medios, Gastos Excepcionales
- Renderizar gráfico de barras horizontales con 9 tipos de consumo + Otros (color azul configurable)
- Mostrar lista cronológica de operaciones debajo del gráfico con monto y fecha
- Actualizar gráfico y lista según filtro seleccionado
- Mostrar comentario resumen generado por IA
- Permitir navegación de regreso a `/plan-ahorros`

**Inputs**: Ninguno (carga datos del servicio)

**Outputs**:
- `onFilterChange: EventEmitter<string>` - Filtro seleccionado

**Subcategorías de consumo** (9 tipos + Otros):
1. Viajes
2. Transporte
3. Delivery
4. Restaurantes
5. Entretenimiento
6. Salud
7. Educación
8. Compras
9. Servicios
10. Otros (restante)

**Nota**: Este componente muestra TODOS los gastos del mes, no solo una subsección específica. El filtro permite ver solo Hormiga, Medio o Excepcional si se desea.

#### 9. ListaMovimientosComponent
**Propósito**: Lista cronológica de movimientos con opciones de recategorización

**Responsabilidades**:
- Mostrar lista de movimientos en orden cronológico
- Mostrar nombre, monto y fecha de cada movimiento
- Incluir botones por movimiento para:
  - Recategorizar en: "Pago Financiero - Otro Banco", "Ingresos", "Operaciones Regulares"
  - Devolver a Movimientos de Caja (subcategorías: Transferencias, Retiros, Depósitos, Otros)
- Actualizar lista al categorizar

**Inputs**:
- `categoria: string` - Categoría actual (desde route params)

**Outputs**:
- `onRecategorize: EventEmitter<{id: string, categoria: string}>` - Movimiento recategorizado
- `onDevolverACaja: EventEmitter<{id: string, subcategoria: string}>` - Movimiento devuelto a caja

#### 10. MovimientosCajaDetalleComponent
**Propósito**: Vista de detalle de un tipo específico de Movimiento de Caja

**Responsabilidades**:
- Mostrar título del tipo seleccionado (Transferencias, Retiros, Depósitos u Otros)
- Mostrar lista cronológica de operaciones con nombre, monto y fecha
- Incluir botones para recategorizar en: "Pago Financiero - Otro Banco", "Ingresos", "Operaciones Regulares"
- Actualizar lista al categorizar
- Permitir navegación de regreso

**Inputs**:
- `tipo: string` - Tipo de movimiento (desde route params)

**Outputs**:
- `onCategorize: EventEmitter<{id: string, categoria: string}>` - Movimiento categorizado

#### 11. TransferenciaAhorroModalComponent
**Propósito**: Modal para transferir dinero al chanchito de ahorro

**Responsabilidades**:
- Mostrar campo para ingresar monto
- Mostrar selector de chanchito de ahorro (Primer depa, Primer carro, Viaje, etc.)
- Validar monto ingresado
- Mostrar botón de confirmación
- Actualizar `ahorroChanchitosDelMes` del mes actual (sin crear operación visible)
- Actualizar `saldoChanchitos` y `montoActual` del chanchito
- Mostrar mensaje de éxito
- Emitir evento al confirmar
- Cerrar modal

**Inputs**: Ninguno

**Outputs**:
- `onConfirm: EventEmitter<{monto: number, chanchitoId: string}>` - Transferencia confirmada
- `onClose: EventEmitter<void>` - Modal cerrado

**Nota**: La transferencia NO crea una operación visible en la lista. Es una operación interna que solo actualiza contadores.

#### 12. DragToSaveComponent
**Propósito**: Componente de icono deslizable para transferir al ahorro

**Responsabilidades**:
- Mostrar icono circular de dinero
- Mostrar icono de chanchito como destino
- Detectar gesto de arrastre (drag)
- Validar que el arrastre llegue al chanchito
- Emitir evento al completar arrastre exitoso
- Animar transición

**Inputs**: Ninguno

**Outputs**:
- `onDragComplete: EventEmitter<void>` - Arrastre completado exitosamente

#### 13. OperacionesRecurrentesComponent
**Propósito**: Vista CRUD para gestionar operaciones recurrentes programadas

**Responsabilidades**:
- Listar todas las operaciones recurrentes programadas
- Permitir crear nueva operación recurrente (título, monto, fecha inicio, fecha fin, día del mes)
- Permitir editar operación recurrente existente
- Permitir eliminar operación recurrente
- Permitir activar/desactivar operación recurrente
- Mostrar operaciones generadas por cada recurrente
- Generar automáticamente operaciones mensuales al crear/editar

**Inputs**: Ninguno

**Outputs**:
- `onCreate: EventEmitter<OperacionRecurrenteProgramada>` - Nueva operación creada
- `onUpdate: EventEmitter<OperacionRecurrenteProgramada>` - Operación actualizada
- `onDelete: EventEmitter<string>` - ID de operación eliminada

#### 14. SelectorMesComponent
**Propósito**: Selector de mes en header para navegar entre meses

**Responsabilidades**:
- Mostrar mes actual seleccionado
- Permitir navegar a meses anteriores (Agosto, Septiembre, Octubre)
- Permitir navegar a mes actual (Noviembre)
- Emitir evento al cambiar mes
- Indicar visualmente el mes actual

**Inputs**:
- `mesActual: string` - Mes actualmente seleccionado
- `mesesDisponibles: string[]` - Lista de meses disponibles

**Outputs**:
- `onMesChange: EventEmitter<string>` - Mes seleccionado

#### 15. VincularOperacionModalComponent
**Propósito**: Modal para vincular operación real con operación recurrente programada

**Responsabilidades**:
- Mostrar lista de operaciones recurrentes programadas activas
- Permitir seleccionar una operación recurrente
- Mostrar confirmación antes de vincular
- Actualizar categoriaUsuario de la operación
- Eliminar operación de lista programada al vincular
- Cerrar modal

**Inputs**:
- `operacion: OperacionFinanciera` - Operación a vincular

**Outputs**:
- `onVincular: EventEmitter<{operacionId: string, recurrenteId: string}>` - Vinculación confirmada
- `onClose: EventEmitter<void>` - Modal cerrado

### Feature Modules

#### HomeModule
**Rutas**: `/`, `/home`

**Componentes**:
- `HomeComponent` - Vista principal con productos bancarios
- `ProductCardComponent` - Card de producto bancario
- `BottomNavigationComponent` - Navegación inferior

**Funcionalidad**:
- Mostrar productos bancarios del usuario
- Mostrar botón flotante de Chicho
- Navegación a otras secciones
- Mostrar tipo de cambio


#### ChatModule
**Rutas**: `/chat`

**Componentes**:
- `ChatComponent` - Contenedor principal del chat
- `ChatHeaderComponent` - Header con avatar de Chicho y configuración
- `ChatMessagesComponent` - Lista de mensajes
- `ChatInputComponent` - Input de texto y botón enviar
- `ChatConfigModalComponent` - Modal con checklist de filtros

**Funcionalidad**:
- Mostrar conversación con Chicho
- Enviar mensajes y recibir respuestas mock
- Filtrar tipos de comunicación (alertas, recompensas, conversaciones)
- Búsqueda en el historial
- Scroll automático a último mensaje

#### PlanAhorrosModule
**Rutas**: 
- `/plan-ahorros` - Vista principal del plan
- `/plan-ahorros/crear` - Flujo conversacional para crear plan
- `/plan-ahorros/configurar` - Configuración manual del plan
- `/plan-ahorros/detalle/:categoria` - Detalle de gastos por categoría

**Componentes**:
- `PlanAhorrosComponent` - Vista de resumen del plan con pull-to-refresh, drag-to-save, secciones colapsables y cálculo de saldo actual
- `PlanEmptyStateComponent` - Estado sin plan configurado
- `CrearPlanComponent` - Flujo conversacional para crear plan con Chicho (usa configuración JSON)
- `ConfigurarPlanComponent` - Configuración manual de parámetros
- `DistribucionGastosComponent` - Gráfico de distribución (colores configurables en SCSS)
- `CategorizarMovimientoModalComponent` - Modal para categorizar movimientos sin categorizar
- `DetalleGastosComponent` - Vista con filtro, gráfico de barras y lista cronológica de operaciones
- `ListaMovimientosComponent` - Lista cronológica de movimientos con opciones de recategorización
- `MovimientosCajaDetalleComponent` - Vista de detalle de un tipo específico de Movimiento de Caja
- `TransferenciaAhorroModalComponent` - Modal para transferir dinero al chanchito de ahorro
- `DragToSaveComponent` - Componente de icono deslizable para transferir al ahorro
- `OperacionesRecurrentesComponent` - Vista CRUD para gestionar operaciones recurrentes programadas
- `SelectorMesComponent` - Selector de mes en header para navegar entre Agosto-Noviembre
- `VincularOperacionModalComponent` - Modal para vincular operación real con operación recurrente programada

**Funcionalidad**:
- Mostrar resumen financiero con saldo actual calculado dinámicamente
- Calcular saldo actual: saldoInicial + ingresos + operacionesRegulares + gastos + movimientosCaja + cargaFinanciera
- Mostrar "Por Pagar": suma de operaciones pendientes de Carga Financiera y Operaciones Regulares
- Cada sección muestra total calculado sumando operaciones de la categoría
- Secciones colapsables con icono y transiciones smooth
- Botón global para colapsar/descolapsar todas las secciones
- Visualizar distribución de gastos con gráfico de barras (colores configurables)
- Flujo conversacional para crear plan con Chicho
- Configuración manual: ingreso neto, metas de ahorro, topes de gastos, tiempo de alerta
- Botón para volver a hablar con Chicho desde configuración manual
- Categorizar movimientos sin categorizar en: Ingresos, Operaciones Regulares, Pagos Financieros
- Ver detalle de gastos (9 tipos + Otros) con barras azules configurables y filtros
- Ver detalle de Movimientos de Caja por tipo: Transferencias, Retiros, Depósitos, Otros
- Recategorizar movimientos desde listas de Ingresos, Operaciones Regulares, Pagos Financieros
- Devolver movimientos a Movimientos de Caja
- Comentario resumen generado por IA en vista de detalle de gastos
- Pull-to-refresh para recargar datos
- Drag-to-save para transferir al chanchito

#### RecompensasModule
**Rutas**: `/recompensas`

**Componentes**:
- `RecompensasComponent` - Lista de recompensas
- `RecompensaCategoryComponent` - Sección por categoría
- `PromocionCardComponent` - Card de promoción destacada

**Funcionalidad**:
- Mostrar categorías de beneficios
- Listar descuentos, promociones, ampliación TC
- Acciones para solicitar beneficios

#### AlertasModule
**Rutas**: `/alertas`

**Componentes**:
- `AlertasComponent` - Lista de alertas
- `AlertaDetailComponent` - Detalle de alerta específica

**Funcionalidad**:
- Listar alertas por severidad
- Marcar como leídas
- Mostrar acciones sugeridas (pagar en cuotas, etc.)

## Data Models

### Interfaces TypeScript

```typescript
// Mensaje Unificado del Chat
interface MensajeUnificado {
  id: string;
  tipo: 'chat' | 'alerta' | 'recompensa';
  timestamp: Date;
  leido: boolean; // Para badge de notificaciones
  
  // Si tipo === 'chat'
  texto?: string;
  esIA?: boolean;
  
  // Si tipo === 'alerta'
  titulo?: string;
  subtitulo?: string;
  icono?: string;
  textoBoton?: string;
  severidad?: 'warning' | 'danger' | 'info';
  
  // Si tipo === 'recompensa'
  tituloRecompensa?: string;
  subtituloRecompensa?: string;
  iconoRecompensa?: string;
  imagenRecompensa?: string;
  textoBotonRecompensa?: string;
}

interface ChatConfig {
  showAlerts: boolean;
  showRewards: boolean;
  showConversations: boolean;
}

// Respuesta estática del chat (solo una para la PoC)
interface RespuestaEstatica {
  respuestaIA: string; // Respuesta que se muestra siempre, sin importar lo que escriba el usuario
}
```


```typescript
// Alertas
interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'warning' | 'danger' | 'info';
  amount?: number;
  date: Date;
  category: string;
  isRead: boolean;
  actionLabel?: string;
  actionUrl?: string;
}

// Recompensas
interface Reward {
  id: string;
  title: string;
  description: string;
  category: 'descuento' | 'promocion' | 'ampliacion-tc' | 'tipo-cambio';
  discount?: string;
  conditions: string;
  imageUrl?: string;
  iconName?: string;
  actionLabel: string;
}

// Plan de Ahorros
interface PlanAhorros {
  id: string;
  saldoInicial: number;
  saldoActual: number; // Calculado: saldoInicial + ingresos + operacionesRegulares + gastos + movimientosCaja + cargaFinanciera
  ingresoNeto: number;
  metaAhorro: number;
  metaPorcentaje: number;
  distribucionGastos: GastoDistribucion[];
  fechaCreacion: Date;
  activo: boolean;
}

interface GastoDistribucion {
  categoria: string;
  porcentaje: number;
  monto: number; // Suma de operaciones de la categoría
  color: string;
  colapsado: boolean; // Estado de colapso de la sección
}

// Resumen Financiero
interface ResumenFinanciero {
  saldoInicial: number;
  ingresos: number; // Suma de operaciones de Ingresos (positivo)
  operacionesRegulares: number; // Suma de operaciones Regulares (positivo/negativo)
  gastosMes: number; // Suma de operaciones de Gastos (negativo)
  movimientosCaja: number; // Suma de operaciones de Movimientos de Caja (positivo/negativo)
  cargaFinanciera: number; // Suma de operaciones de Carga Financiera con estado "Pagado" (negativo)
  porPagar: number; // Suma de operaciones de Carga Financiera y Operaciones Regulares con estado "Pendiente"
  saldoActual: number; // Calculado
}

// Resumen de Gastos por Tipo (para subsecciones)
interface ResumenGastosPorTipo {
  cobrosAutomaticos: DetalleConsumo;
  gastosHormiga: DetalleConsumo;
  gastosMedios: DetalleConsumo;
  gastosExcepcionales: DetalleConsumo;
  cargaFinanciera: DetalleConsumo; // También tiene pill de alerta
}

interface DetalleConsumo {
  consumoDebito: number; // Suma de operaciones con tipoProducto='TD' - Se muestra como TEXTO NORMAL
  consumoTC: number; // Suma de operaciones con tipoProducto='TC' - Se muestra como TEXTO NORMAL
  total: number; // consumoDebito + consumoTC - SOLO ESTE VALOR LLEVA PILL DE COLOR
  topeMensual: number; // Tope configurado para este tipo (null si no tiene tope)
  porcentajeUsado: number; // (total / topeMensual) * 100
  estadoAlerta: 'normal' | 'warning' | 'danger'; // normal: <90%, warning: 90-100%, danger: >100%
  // IMPORTANTE: Los pills de alerta SOLO se aplican al campo "total"
  // Los valores de consumoDebito y consumoTC se muestran como texto normal sin pills
  // Si topeMensual es null, no se muestra pill (categorías sin tope)
}

// Operación Financiera
interface OperacionFinanciera {
  id: string;
  fecha: Date; // Fecha de operación (si pagado) o fecha máxima de pago (si pendiente)
  operacion: string; // Descripción
  monto: number;
  categoria: 'cobro_automatico' | 'transferencia' | 'retiro' | 'deposito' | 'pago_financiero' | 'otros' | 'gastos';
  categoriaUsuario?: 'operacion_recurrente' | 'ingreso' | 'pago_financiero_otro_banco' | 'no_aplica';
  subcategoria?: string; // Solo para gastos: restaurantes, experiencia, delivery, etc.
  tipoProducto: 'TC' | 'TD'; // Tarjeta de Crédito o Tarjeta de Débito
  automatico?: boolean; // true para cobros automáticos
  estado?: 'pagado' | 'pendiente'; // Solo para Operaciones Recurrentes y Pagos Financieros
  fechaPagoMaxima?: Date; // Solo para Operaciones Recurrentes y Pagos Financieros
  tipoGasto?: 'hormiga' | 'medio' | 'excepcional'; // Calculado automáticamente para gastos
  operacionRecurrenteId?: string; // ID de la operación recurrente programada a la que pertenece
  vinculadaARecurrente?: boolean; // true si está vinculada, no aparece en categoría original
  esAtrasada?: boolean; // true si es un pago atrasado del mes anterior
  notas?: string; // Notas del usuario
  etiquetas?: string[]; // Tags personalizados
  historialCambios?: {
    fecha: Date;
    campo: string;
    valorAnterior: any;
    valorNuevo: any;
  }[];
}

// Operación Recurrente Programada
interface OperacionRecurrenteProgramada {
  id: string;
  titulo: string;
  monto: number;
  fechaInicio: Date;
  fechaFin: Date;
  diaDelMes: number | 'fin_de_mes'; // Ej: 5 para día 5, o 'fin_de_mes'
  activa: boolean;
  operacionesGeneradas: {
    mes: string; // "Agosto 2024"
    operacionId: string;
    vinculada: boolean;
  }[];
}

// Productos Bancarios
interface ProductoBancario {
  id: string;
  nombre: string;
  tipo: 'cuenta' | 'tarjeta' | 'prestamo';
  saldoDisponible?: number;
  lineaDisponible?: number;
  iconName: string;
}

// Configuración del Plan
interface ConfiguracionPlan {
  ingresoNetoMensual: number;
  metaAhorro: number; // Puede ser porcentaje o monto fijo
  tiempoAlertaCompraAlta: number; // en minutos
  cuentasExcluidas: string[]; // IDs de cuentas excluidas del saldo inicial
  
  // ============================================
  // CLASIFICACIÓN DE GASTOS INDIVIDUALES
  // Topes para clasificar UN gasto como hormiga/medio/excepcional
  // ============================================
  clasificacionGastos: {
    topeHormiga: {
      automatico: boolean; // Si true, usar fórmula (20% ingreso diario)
      montoManual?: number; // Si automatico=false, usar este monto
    };
    topeMedio: {
      automatico: boolean; // Si true, usar fórmula (50% ingreso diario)
      montoManual?: number; // Si automatico=false, usar este monto
    };
  };
  
  // ============================================
  // TOPES MENSUALES (SUMA DE TODOS LOS GASTOS DEL MES)
  // Para todas las secciones del plan
  // ============================================
  topesMensuales: {
    // Gastos
    cobrosAutomaticos: {
      porcentaje?: number; // % del ingreso neto mensual
      montoFijo?: number; // Monto fijo, prioridad si existe
    };
    gastosHormiga: {
      porcentaje?: number;
      montoFijo?: number;
    };
    gastosMedios: {
      porcentaje?: number;
      montoFijo?: number;
    };
    gastosExcepcionales: {
      porcentaje?: number;
      montoFijo?: number;
    };
    // Otras secciones
    cargaFinanciera: {
      porcentaje?: number;
      montoFijo?: number;
    };
    movimientosCaja: {
      porcentaje?: number;
      montoFijo?: number;
    };
    operacionesRecurrentes: {
      porcentaje?: number;
      montoFijo?: number;
    };
  };
  
  // Configuración histórica
  fechaVigencia: Date; // Desde cuándo aplica esta configuración
  aplicaAMesesAnteriores: boolean; // Si false, meses anteriores mantienen su config
}

// Movimientos sin categorizar
interface MovimientoSinCategorizar {
  id: string;
  descripcion: string;
  monto: number;
  fecha: Date;
  tipo: 'ingreso' | 'egreso';
  categoriaActual?: string;
}

// Movimientos de Caja
interface MovimientoCaja {
  id: string;
  descripcion: string;
  monto: number;
  fecha: Date;
  subcategoria: 'transferencias' | 'retiros' | 'depositos' | 'otros';
}

// Detalle de gastos por categoría
interface DetalleGastoCategoria {
  categoria: string;
  subcategorias: SubcategoriaGasto[];
  comentarioIA: string;
  totalMonto: number;
  totalPorcentaje: number;
}

interface SubcategoriaGasto {
  nombre: string; // Viajes, Transporte, Delivery, etc.
  monto: number;
  porcentaje: number;
  color: string;
}

// Flujo conversacional para crear plan
interface PasoFlujo {
  id: string;
  pregunta: string;
  tipoRespuesta: 'texto-libre' | 'opciones';
  opciones?: OpcionRespuesta[];
  validacion?: string;
  campoDestino: string;
  siguientePaso: string | 'fin';
  respuestaAPI?: string; // Respuesta procesada por el API
  avanzarSiguientePaso: boolean; // Si el API determina que se puede avanzar
}

interface OpcionRespuesta {
  texto: string;
  valor: string;
}

interface ContextoFlujoPlan {
  ingresoNetoMensual?: number;
  fuenteIngreso?: string;
  contribuyeAFP?: string;
  metaAhorroPorcentaje?: number;
  metaAhorroMonto?: number;
  gastosDisponibles?: number;
  confirmacion?: string;
}

// Datos del Cliente
interface DatosCliente {
  nombre: string;
  correo: string;
}

// Datos de Saldo por Mes
interface DatosSaldoMes {
  mes: string; // Ej: "Agosto 2024"
  saldoInicial: number; // Suma de cuentas en soles (excluye chanchitos)
  saldoFinal: number; // Calculado con operaciones
  saldoChanchitos: number; // Suma de todos los chanchitos
  ahorroChanchitosDelMes: number; // Cuánto se ahorró en chanchitos este mes
  metaAhorro: number;
  operaciones: OperacionFinanciera[];
  operacionesAtrasadas?: {
    pagosFinancieros: string[]; // Solo IDs
    operacionesRecurrentes: string[]; // Solo IDs
  };
}

// Datos Multi-Mes
interface DatosMultiMes {
  meses: DatosSaldoMes[]; // Agosto, Septiembre, Octubre, Noviembre
  mesActual: string; // "Noviembre 2024"
  validacionSaldos: {
    valido: boolean;
    errores: string[]; // Ej: "Saldo inicial Sept no coincide con saldo final Agosto"
  };
}

// Chanchito de Ahorro
interface ChanchitoAhorro {
  id: string;
  nombre: string; // Primer depa, Primer carro, Viaje, etc.
  montoActual: number;
  metaMonto: number;
  icono: string;
}

// Transferencia al Ahorro
interface TransferenciaAhorro {
  monto: number;
  chanchitoId: string;
  fecha: Date;
}

// Filtro de Gastos
type FiltroGastos = 'todos' | 'gastos-hormiga' | 'gastos-medios' | 'gastos-excepcionales';

// Sistema de Filtros Flexible (Tipo Query Builder)
interface FiltroOperacion {
  categoria?: string | string[];           // Ej: 'ingresos' o ['ingresos', 'gastos']
  categoriaUsuario?: string | string[] | null; // null para "sin categoría usuario"
  estado?: 'pagado' | 'pendiente' | 'todos';
  tipo?: 'ingreso' | 'egreso' | 'todos';
  fechaDesde?: Date;
  fechaHasta?: Date;
  montoMin?: number;
  montoMax?: number;
  descripcionContiene?: string;
  vinculadaARecurrente?: boolean;         // true/false para filtrar vinculadas
  condiciones?: CondicionCustom[];        // Para condiciones personalizadas
}

interface CondicionCustom {
  campo: string;                          // Nombre del campo a evaluar
  operador: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'in' | 'not_in';
  valor: any;
}
```

### Ejemplos de Uso del Sistema de Filtros

```typescript
// Ejemplo 1: Carga Financiera pagada
const filtro1: FiltroOperacion = {
  categoria: 'cargaFinanciera',
  estado: 'pagado'
};
const total1 = await this.planService.sumarOperaciones(filtro1);

// Ejemplo 2: Operaciones pendientes de múltiples categorías (Por Pagar)
const filtro2: FiltroOperacion = {
  categoria: ['cargaFinanciera', 'operacionesRegulares'],
  estado: 'pendiente'
};
const porPagar = await this.planService.sumarOperaciones(filtro2);

// Ejemplo 3: Gastos del mes actual mayores a 100
const filtro3: FiltroOperacion = {
  categoria: 'gastos',
  fechaDesde: new Date('2024-05-01'),
  fechaHasta: new Date('2024-05-31'),
  montoMin: 100
};
const gastosGrandes = await this.planService.sumarOperaciones(filtro3);

// Ejemplo 4: Ingresos que contengan "Sueldo" en la descripción
const filtro4: FiltroOperacion = {
  categoria: 'ingresos',
  descripcionContiene: 'Sueldo'
};
const sueldos = await this.planService.sumarOperaciones(filtro4);

// Ejemplo 5: Condiciones personalizadas complejas
const filtro5: FiltroOperacion = {
  categoria: 'gastos',
  condiciones: [
    { campo: 'subcategoria', operador: 'in', valor: ['transporte', 'delivery'] },
    { campo: 'monto', operador: '>', valor: -50 }
  ]
};
const gastosTransporteYDelivery = await this.planService.sumarOperaciones(filtro5);

// Ejemplo 6: Todas las operaciones de egreso
const filtro6: FiltroOperacion = {
  tipo: 'egreso'
};
const totalEgresos = await this.planService.sumarOperaciones(filtro6);
```

### Lógica de Clasificación de Tipo de Gasto

```typescript
// plan-ahorros.service.ts
clasificarTipoGasto(operacion: OperacionFinanciera, config: ConfiguracionPlan): 'hormiga' | 'medio' | 'excepcional' {
  // Solo aplica para gastos no automáticos
  if (operacion.categoria !== 'gastos' || operacion.automatico) {
    return null;
  }
  
  const montoAbsoluto = Math.abs(operacion.monto);
  const ingresoNetoMensual = config.ingresoNetoMensual;
  const ingresoDiario = ingresoNetoMensual / 30;
  
  // Calcular topes con fórmula (redondeo a decena hacia abajo)
  const topeHormiga = config.montoMaximoHormiga || Math.floor(ingresoDiario * 0.20 / 10) * 10;
  const topeMedio = config.montoMaximoMedio || Math.floor(ingresoDiario * 0.50 / 10) * 10;
  
  // Clasificar según rangos
  // Hormiga: 0% - 20% del ingreso diario
  // Medio: 20% - 50% del ingreso diario
  // Excepcional: > 50% del ingreso diario
  
  if (montoAbsoluto <= topeHormiga) {
    return 'hormiga';
  } else if (montoAbsoluto <= topeMedio) {
    return 'medio';
  } else {
    return 'excepcional';
  }
}
```

**Ejemplo de cálculo:**
- Ingreso neto mensual: S/ 4,000
- Ingreso diario: 4,000 / 30 = 133.33
- Tope hormiga (20%): 133.33 * 0.20 = 26.66 → 26 → 20 (redondeado a decena)
- Tope medio (50%): 133.33 * 0.50 = 66.66 → 66 → 60 (redondeado a decena)

**Rangos resultantes:**
- **Gastos Hormiga**: S/ 0 - S/ 20 (0% - 20% del ingreso diario)
- **Gastos Medios**: S/ 21 - S/ 60 (20% - 50% del ingreso diario)
- **Gastos Excepcionales**: S/ 61+ (más del 50% del ingreso diario)

**Nota**: El usuario solo ve los montos tope (S/ 20 y S/ 60), no los porcentajes internos.

Si hay `montoMaximoHormiga` o `montoMaximoMedio` configurados, usar esos en lugar de la fórmula.

### Implementación del Servicio

```typescript
// plan-ahorros.service.ts
sumarOperaciones(filtros: FiltroOperacion): Observable<number> {
  return this.getTodasOperaciones().pipe(
    map(operaciones => {
      // Aplicar filtros
      let operacionesFiltradas = operaciones;
      
      // Filtro por categoría
      if (filtros.categoria) {
        if (Array.isArray(filtros.categoria)) {
          operacionesFiltradas = operacionesFiltradas.filter(op => 
            filtros.categoria.includes(op.categoria)
          );
        } else {
          operacionesFiltradas = operacionesFiltradas.filter(op => 
            op.categoria === filtros.categoria
          );
        }
      }
      
      // Filtro por estado
      if (filtros.estado && filtros.estado !== 'todos') {
        operacionesFiltradas = operacionesFiltradas.filter(op => 
          op.estado === filtros.estado
        );
      }
      
      // Filtro por tipo
      if (filtros.tipo && filtros.tipo !== 'todos') {
        operacionesFiltradas = operacionesFiltradas.filter(op => 
          op.tipo === filtros.tipo
        );
      }
      
      // Filtro por rango de fechas
      if (filtros.fechaDesde) {
        operacionesFiltradas = operacionesFiltradas.filter(op => 
          new Date(op.fecha) >= filtros.fechaDesde
        );
      }
      if (filtros.fechaHasta) {
        operacionesFiltradas = operacionesFiltradas.filter(op => 
          new Date(op.fecha) <= filtros.fechaHasta
        );
      }
      
      // Filtro por rango de montos
      if (filtros.montoMin !== undefined) {
        operacionesFiltradas = operacionesFiltradas.filter(op => 
          Math.abs(op.monto) >= filtros.montoMin
        );
      }
      if (filtros.montoMax !== undefined) {
        operacionesFiltradas = operacionesFiltradas.filter(op => 
          Math.abs(op.monto) <= filtros.montoMax
        );
      }
      
      // Filtro por descripción
      if (filtros.descripcionContiene) {
        operacionesFiltradas = operacionesFiltradas.filter(op => 
          op.descripcion.toLowerCase().includes(filtros.descripcionContiene.toLowerCase())
        );
      }
      
      // Condiciones personalizadas
      if (filtros.condiciones && filtros.condiciones.length > 0) {
        operacionesFiltradas = operacionesFiltradas.filter(op => 
          this.evaluarCondiciones(op, filtros.condiciones)
        );
      }
      
      // Sumar montos
      return operacionesFiltradas.reduce((sum, op) => sum + op.monto, 0);
    })
  );
}

private evaluarCondiciones(operacion: OperacionFinanciera, condiciones: CondicionCustom[]): boolean {
  return condiciones.every(condicion => {
    const valorCampo = operacion[condicion.campo];
    
    switch (condicion.operador) {
      case '=':
        return valorCampo === condicion.valor;
      case '!=':
        return valorCampo !== condicion.valor;
      case '>':
        return valorCampo > condicion.valor;
      case '<':
        return valorCampo < condicion.valor;
      case '>=':
        return valorCampo >= condicion.valor;
      case '<=':
        return valorCampo <= condicion.valor;
      case 'contains':
        return String(valorCampo).toLowerCase().includes(String(condicion.valor).toLowerCase());
      case 'in':
        return Array.isArray(condicion.valor) && condicion.valor.includes(valorCampo);
      case 'not_in':
        return Array.isArray(condicion.valor) && !condicion.valor.includes(valorCampo);
      default:
        return true;
    }
  });
}
```

## Routing Configuration

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'chat',
    component: ChatComponent
  },
  {
    path: 'plan-ahorros',
    children: [
      { path: '', component: PlanAhorrosComponent },
      { path: 'crear', component: CrearPlanComponent },
      { path: 'configurar', component: ConfigurarPlanComponent },
      { path: 'configurar/topes-mensuales', component: TopesMensualesComponent },
      { path: 'configurar/clasificacion-gastos', component: ClasificacionGastosComponent },
      { path: 'operaciones-recurrentes', component: OperacionesRecurrentesComponent },
      { path: 'detalle/gastos', component: DetalleGastosComponent },
      { path: 'lista/:categoria', component: ListaMovimientosComponent },
      { path: 'movimientos-caja/:tipo', component: MovimientosCajaDetalleComponent }
    ]
  },
  {
    path: 'recompensas',
    component: RecompensasComponent
  },
  {
    path: 'alertas',
    component: AlertasComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
```


## Services Architecture

### API Service Pattern

Todos los servicios siguen el mismo patrón con fallback automático a datos mock:

```typescript
@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiUrl = environment.apiUrl;
  private useMockData = environment.useMockData;

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<ChatMessage> {
    if (this.useMockData || !this.apiUrl) {
      return this.getMockResponse(message);
    }
    
    // TODO: Reemplazar con URL real de API
    return this.http.post<ChatMessage>(`${this.apiUrl}/chat`, { message })
      .pipe(
        catchError(() => this.getMockResponse(message))
      );
  }

  private getMockResponse(message: string): Observable<ChatMessage> {
    // Lógica de respuestas estáticas basadas en keywords
    const response = this.generateMockResponse(message);
    return of(response).pipe(delay(500));
  }

  private generateMockResponse(userMessage: string): ChatMessage {
    // Respuestas predefinidas según contexto
    if (userMessage.toLowerCase().includes('gasto')) {
      return MOCK_RESPONSES.gastos;
    }
    // ... más respuestas contextuales
    return MOCK_RESPONSES.default;
  }
}
```

### Service List

#### ChatService
**Responsabilidades**:
- Enviar mensajes del usuario (siempre retorna respuesta estática)
- Mantener historial de conversación unificado (chat, alertas, recompensas)
- Filtrar mensajes según configuración (mostrar/ocultar alertas, recompensas, chat)
- Gestionar configuración de filtros
- Gestionar flujo conversacional para crear plan (basado en chat-plan-config.json)

**Métodos principales**:
- `sendMessage(message: string): Observable<ChatMessage>` - Siempre retorna respuesta estática configurada
- `getConversationHistory(filtros?: ChatConfig): Observable<ChatMessage[]>` - Retorna lista unificada filtrada
- `updateChatConfig(config: ChatConfig): void`
- `getChatConfig(): Observable<ChatConfig>`
- `getListaUnificada(): Observable<ChatMessage[]>` - Combina listaConversacion, listaAlertas y listaRecompensas
- `iniciarFlujoPlan(): Observable<PasoFlujo>` - Inicia flujo conversacional para crear plan
- `procesarRespuestaFlujoPlan(pasoId: string, respuesta: string): Observable<PasoFlujo>` - Procesa respuesta y retorna siguiente paso
- `finalizarFlujoPlan(): Observable<PlanAhorros>` - Finaliza flujo y crea el plan

**Lógica de lista unificada**:
```typescript
getListaUnificada(): Observable<ChatMessage[]> {
  const config = this.getChatConfig();
  let mensajes: ChatMessage[] = [];
  
  // Añadir según configuración
  if (config.showConversations) {
    mensajes = [...mensajes, ...listaConversacion];
  }
  if (config.showAlerts) {
    mensajes = [...mensajes, ...listaAlertas];
  }
  if (config.showRewards) {
    mensajes = [...mensajes, ...listaRecompensas];
  }
  
  // Ordenar por timestamp
  return mensajes.sort((a, b) => a.timestamp - b.timestamp);
}
```

#### AlertasService
**Responsabilidades**:
- Obtener lista de alertas
- Marcar alertas como leídas
- Descartar alertas
- Contar alertas no leídas

**Métodos principales**:
- `getAlertas(): Observable<Alert[]>`
- `markAsRead(alertId: string): Observable<void>`
- `dismissAlert(alertId: string): Observable<void>`
- `getUnreadCount(): Observable<number>`


#### RecompensasService
**Responsabilidades**:
- Obtener lista de recompensas
- Filtrar por categoría
- Solicitar beneficios

**Métodos principales**:
- `getRecompensas(): Observable<Reward[]>`
- `getRecompensasByCategory(category: string): Observable<Reward[]>`
- `solicitarBeneficio(rewardId: string): Observable<void>`

#### PlanAhorrosService
**Responsabilidades**:
- Obtener plan de ahorros actual
- Crear nuevo plan
- Actualizar plan existente
- Calcular distribución de gastos
- Calcular saldo actual y resumen financiero
- Gestionar configuración manual del plan
- Obtener movimientos sin categorizar
- Categorizar movimientos
- Obtener detalle de gastos por categoría
- Generar comentario IA para resumen de gastos
- Gestionar operaciones financieras con filtros flexibles

**Métodos principales**:
- `getPlanActual(): Observable<PlanAhorros | null>`
- `crearPlan(data: Partial<PlanAhorros>): Observable<PlanAhorros>`
- `actualizarPlan(planId: string, data: Partial<PlanAhorros>): Observable<PlanAhorros>`
- `calcularDistribucion(ingresoNeto: number): Observable<GastoDistribucion[]>`
- `calcularSaldoActual(): Observable<number>` - Calcula saldo actual dinámicamente
- `calcularPorPagar(): Observable<number>` - Calcula total por pagar
- `getResumenFinanciero(): Observable<ResumenFinanciero>` - Retorna resumen completo
- `getOperacionesPorCategoria(categoria: string, filtros?: FiltroOperacion): Observable<OperacionFinanciera[]>`
- `sumarOperaciones(filtros: FiltroOperacion): Observable<number>` - Suma con filtros flexibles
- `getConfiguracion(): Observable<ConfiguracionPlan>`
- `actualizarConfiguracion(config: ConfiguracionPlan): Observable<void>`
- `getMovimientosSinCategorizar(): Observable<MovimientoSinCategorizar[]>`
- `categorizarMovimiento(id: string, categoria: string): Observable<void>`
- `devolverMovimientoACaja(id: string, subcategoria: string): Observable<void>`
- `getMovimientosPorCategoria(categoria: string): Observable<MovimientoSinCategorizar[]>`
- `getMovimientosCajaPorTipo(tipo: string): Observable<MovimientoCaja[]>`
- `getDetalleGastos(filtro: FiltroGastos): Observable<DetalleGastoCategoria>`
- `getOperacionesGastos(filtro: FiltroGastos): Observable<{descripcion: string, monto: number, fecha: Date}[]>`
- `generarComentarioIA(filtro: FiltroGastos): Observable<string>`
- `getChanchitosAhorro(): Observable<ChanchitoAhorro[]>`
- `transferirAChanchito(transferencia: TransferenciaAhorro): Observable<void>`
- `refreshPlanAhorros(): Observable<PlanAhorros>` - Para pull-to-refresh
- `getDatosMes(mes: string): Observable<DatosSaldoMes>` - Obtener datos de un mes específico
- `getMesesDisponibles(): Observable<string[]>` - Obtener lista de meses disponibles
- `getOperacionesAtrasadas(mes: string): Observable<{pagosFinancieros: OperacionFinanciera[], operacionesRecurrentes: OperacionFinanciera[]}>` - Obtener operaciones atrasadas del mes anterior
- `vincularOperacionConRecurrente(operacionId: string, recurrenteId: string): Observable<void>` - Vincular operación con recurrente programada

#### OperacionesRecurrentesService
**Responsabilidades**:
- Gestionar CRUD de operaciones recurrentes programadas
- Generar operaciones mensuales automáticamente
- Validar fechas y rangos
- Actualizar lista de operaciones generadas

**Métodos principales**:
- `getOperacionesRecurrentes(): Observable<OperacionRecurrenteProgramada[]>`
- `crearOperacionRecurrente(data: Partial<OperacionRecurrenteProgramada>): Observable<OperacionRecurrenteProgramada>`
- `actualizarOperacionRecurrente(id: string, data: Partial<OperacionRecurrenteProgramada>): Observable<OperacionRecurrenteProgramada>`
- `eliminarOperacionRecurrente(id: string): Observable<void>`
- `activarDesactivarOperacionRecurrente(id: string, activa: boolean): Observable<void>`
- `generarOperacionesMensuales(recurrente: OperacionRecurrenteProgramada): OperacionFinanciera[]` - Genera operaciones entre fechaInicio y fechaFin
- `marcarOperacionComoGenerada(recurrenteId: string, operacionId: string): Observable<void>`

## SCSS Variables and Theme

### Variables de Diseño Interbank

```scss
// _variables.scss

// Colores principales
$color-primary: #00D97E;           // Verde Interbank principal
$color-primary-dark: #00A19B;      // Verde oscuro
$color-primary-light: #D4F4E7;     // Verde menta claro

// Colores de alerta
$color-warning: #FFD93D;           // Amarillo
$color-danger: #E63946;            // Rojo
$color-info: #3B82F6;              // Azul

// Colores de texto
$color-text-primary: #1F2937;      // Texto principal
$color-text-secondary: #6B7280;    // Texto secundario
$color-text-light: #9CA3AF;        // Texto claro

// Colores de fondo
$color-bg-primary: #FFFFFF;        // Fondo principal
$color-bg-secondary: #F9FAFB;      // Fondo secundario
$color-bg-tertiary: #F3F4F6;       // Fondo terciario

// ============================================
// COLORES DE DISTRIBUCIÓN DE GASTOS
// Modificar estos colores para cambiar el gráfico circular del plan de ahorros
// ============================================
$color-gastos-pagos-crediticios: #3B82F6;      // Azul - Pagos crediticios
$color-gastos-recurrentes: #8B5CF6;            // Púrpura - Gastos Recurrentes
$color-gastos-movimientos-caja: #F97316;       // Naranja - Movimientos de Caja
$color-gastos-cobros-automaticos: #14B8A6;     // Turquesa - Cobros Automáticos
$color-gastos-hormiga: #EC4899;                // Rosa - Gastos Hormiga
$color-gastos-excepcionales: #EF4444;          // Rojo - Gastos Excepcionales
$color-gastos-medios: #84CC16;                 // Verde lima - Gastos Medios
$color-gastos-ahorro: #00D97E;                 // Verde Interbank - Ahorro

// ============================================
// COLOR PARA BARRAS DE DETALLE DE GASTOS
// Modificar este color para cambiar las barras horizontales de 9 tipos de consumo
// ============================================
$color-barra-detalle-gastos: #3B82F6;          // Azul para barras de detalle

// ============================================
// IMAGEN DE CHICHO
// Modificar esta ruta para cambiar la imagen/avatar de Chicho en toda la aplicación
// ============================================
$chicho-avatar-path: '/assets/images/avatar-chicho.png';
$chicho-icon-path: '/assets/icons/chicho.svg';

// Tipografía
$font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
$font-size-xs: 0.75rem;    // 12px
$font-size-sm: 0.875rem;   // 14px
$font-size-base: 1rem;     // 16px
$font-size-lg: 1.125rem;   // 18px
$font-size-xl: 1.25rem;    // 20px
$font-size-2xl: 1.5rem;    // 24px

// Espaciados
$spacing-xs: 0.25rem;   // 4px
$spacing-sm: 0.5rem;    // 8px
$spacing-md: 1rem;      // 16px
$spacing-lg: 1.5rem;    // 24px
$spacing-xl: 2rem;      // 32px
$spacing-2xl: 3rem;     // 48px

// Bordes
$border-radius-sm: 8px;
$border-radius-md: 12px;
$border-radius-sm: 16px;
$border-radius-xl: 24px;
$border-radius-full: 9999px;

// Sombras
$shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
$shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);

// Breakpoints
$breakpoint-mobile: 480px;
$breakpoint-tablet: 768px;
$breakpoint-desktop: 1024px;

// ============================================
// TRANSICIONES SMOOTH (Apps Móviles Modernas)
// Modificar estos valores para ajustar velocidad y suavidad de animaciones
// ============================================
$transition-fast: 200ms ease-out;         // Transiciones rápidas (hover, click)
$transition-normal: 300ms ease-in-out;    // Transiciones normales (colapsar/descolapsar)
$transition-slow: 500ms ease-in-out;      // Transiciones lentas (modales, slides)
$transition-spring: cubic-bezier(0.68, -0.55, 0.265, 1.55); // Efecto spring/bounce
```


### Mixins Reutilizables

```scss
// _mixins.scss

// Botón principal Interbank
@mixin button-primary {
  background-color: $color-primary;
  color: white;
  border: none;
  border-radius: $border-radius-sm;
  padding: $spacing-md $spacing-lg;
  font-weight: 600;
  font-size: $font-size-base;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: darken($color-primary, 5%);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
}

// Card estándar
@mixin card {
  background-color: $color-bg-primary;
  border-radius: $border-radius-md;
  padding: $spacing-lg;
  box-shadow: $shadow-md;
}

// Sección colapsable con transición smooth
@mixin seccion-colapsable {
  overflow: hidden;
  transition: max-height $transition-normal, opacity $transition-normal;
  
  &.colapsada {
    max-height: 0;
    opacity: 0;
  }
  
  &.expandida {
    max-height: 1000px; // Ajustar según contenido máximo
    opacity: 1;
  }
}

// Responsive mobile-first
@mixin mobile-only {
  @media (max-width: $breakpoint-mobile) {
    @content;
  }
}

@mixin tablet-up {
  @media (min-width: $breakpoint-tablet) {
    @content;
  }
}

@mixin desktop-up {
  @media (min-width: $breakpoint-desktop) {
    @content;
  }
}
```

## Assets Organization

### Estructura de Data Estática

```
DataEstatica/
├── cliente.json                    # Datos del cliente
├── configuracion-plan.json         # Configuración del plan
├── chanchitos-ahorro.json          # Chanchitos de ahorro
├── operaciones-recurrentes.json    # Operaciones recurrentes programadas
├── chat/
│   ├── respuestas-estaticas.json   # Respuestas del chat
│   ├── lista-conversacion.json     # Mensajes de chat
│   ├── lista-alertas.json          # Alertas
│   └── lista-recompensas.json      # Recompensas
└── operaciones/
    ├── agosto-2024.json            # 100 operaciones
    ├── septiembre-2024.json        # 100 operaciones
    ├── octubre-2024.json           # 100 operaciones
    └── noviembre-2024.json         # 50 operaciones (hasta 14-Nov)
```

### Estructura de Assets

```
assets/
├── icons/
│   ├── chicho.svg              # Icono principal de Chicho
│   ├── alert-warning.svg       # Icono de alerta amarilla
│   ├── alert-danger.svg        # Icono de alerta roja
│   ├── alert-info.svg          # Icono de alerta azul
│   ├── reward.svg              # Icono de recompensa
│   ├── piggy-bank.svg          # Icono de chanchito
│   ├── home.svg                # Icono de inicio
│   ├── chat.svg                # Icono de chat
│   ├── menu.svg                # Icono de menú hamburguesa
│   ├── close.svg               # Icono de cerrar
│   ├── send.svg                # Icono de enviar
│   ├── search.svg              # Icono de búsqueda
│   ├── filter.svg              # Icono de filtro
│   ├── check.svg               # Icono de check
│   ├── arrow-right.svg         # Icono de flecha
│   ├── settings.svg            # Icono de configuración
│   ├── plus.svg                # Icono de más/añadir
│   ├── back.svg                # Icono de regresar
│   └── edit.svg                # Icono de editar
├── images/
│   ├── avatar-chicho.png       # Avatar de Chicho para chat
│   ├── empty-state-plan.svg    # Ilustración estado sin plan
│   └── gradient-promo.png      # Gradiente para cards de promoción
└── data/
    ├── mock-alerts.json        # Datos mock de alertas
    ├── mock-rewards.json       # Datos mock de recompensas
    ├── mock-plan.json          # Datos mock de plan de ahorros (incluye configuración, transferencias y detalle)
    ├── mock-chat-responses.json # Respuestas predefinidas del chat
    └── chat-plan-config.json   # Configuración del flujo conversacional para crear plan
```

### Documentación de Assets

Cada carpeta de assets incluirá un `README.md` con:

1. **Descripción del asset**
2. **Dimensiones recomendadas**
3. **Formato esperado**
4. **Cómo reemplazar**

Ejemplo `assets/icons/README.md`:
```markdown
# Iconos

## Formato
- Todos los iconos deben ser SVG
- Tamaño base: 24x24px
- Color: usar currentColor para heredar color del texto

## Reemplazo
Para reemplazar un icono:
1. Coloca el nuevo SVG en esta carpeta
2. Usa el mismo nombre de archivo
3. Asegúrate de que el viewBox sea "0 0 24 24"
```

Ejemplo `assets/images/README.md`:
```markdown
# Imágenes

## Avatar de Chicho

### Ubicación
- Avatar para chat: `avatar-chicho.png`
- Icono para botón flotante: `../icons/chicho.svg`

### Configuración
Las rutas de las imágenes de Chicho están configuradas en `styles/_variables.scss`:
```scss
$chicho-avatar-path: '/assets/images/avatar-chicho.png';
$chicho-icon-path: '/assets/icons/chicho.svg';
```

### Reemplazo Rápido
**Opción 1: Reemplazar archivo**
1. Coloca tu nueva imagen con el mismo nombre: `avatar-chicho.png`
2. Mantén dimensiones: 80x80px (mínimo)
3. Formato: PNG con fondo transparente

**Opción 2: Cambiar ruta en variables**
1. Abre `src/styles/_variables.scss`
2. Busca la sección "IMAGEN DE CHICHO"
3. Modifica las rutas:
   ```scss
   $chicho-avatar-path: '/assets/images/tu-nueva-imagen.png';
   $chicho-icon-path: '/assets/icons/tu-nuevo-icono.svg';
   ```
4. Guarda y recarga la aplicación

### Especificaciones
- **Avatar (PNG)**: 80x80px mínimo, fondo transparente
- **Icono (SVG)**: 40x40px, viewBox "0 0 40 40"
- **Formato**: PNG para avatar, SVG para icono
- **Peso**: Máximo 50KB por imagen
```


## Mock Data Strategy

### Datos Estáticos

Los datos mock se organizan en archivos JSON separados en la carpeta `DataEstatica/` para facilitar su edición y mantenimiento.

### Lógica de Generación de Operaciones

**Distribución por Mes:**
- Agosto, Septiembre, Octubre: 100 operaciones cada uno
- Noviembre: 50 operaciones (solo hasta 14-Nov)

**Distribución TD/TC:**
- 60% Tarjeta de Débito (TD)
- 40% Tarjeta de Crédito (TC)

**Reglas de Tipo de Producto por Categoría:**

| Categoría | Tipo Producto | Ejemplos |
|-----------|---------------|----------|
| Transferencia | TD | Transferencias a terceros, pagos de servicios |
| Retiro | TD | Retiros en ATM |
| Depósito | TD | Depósitos en cuenta |
| Cobro Automático | TC | Netflix, Spotify, Gimnasio |
| Gastos - Supermercado | TD/TC (mix) | Wong, Plaza Vea, Metro |
| Gastos - Restaurante | TC | Restaurantes, delivery |
| Gastos - Tienda Física | TD | Tiendas de barrio, mercados |
| Gastos - Online | TC | Amazon, Mercado Libre |
| Gastos - Gasolina | TD/TC (mix) | Grifos |
| Pago Financiero | TD | Pagos de préstamos, tarjetas |

### Datos Estáticos - Archivos JSON:

#### mock-alerts.json
```json
{
  "alerts": [
    {
      "id": "alert-1",
      "title": "Detectamos que tus gastos se están saliendo de tu plan de ahorros",
      "description": "Revisa tus últimas transacciones para ajustar tu presupuesto.",
      "severity": "warning",
      "date": "2024-05-10T10:00:00Z",
      "category": "presupuesto",
      "isRead": false
    },
    {
      "id": "alert-2",
      "title": "Tus gastos hormiga han incrementado...",
      "description": "Pequeños gastos suman. Identifícalos para mantener el control.",
      "severity": "warning",
      "date": "2024-05-09T14:30:00Z",
      "category": "gastos-hormiga",
      "isRead": false
    },
    {
      "id": "alert-3",
      "title": "Hay un gasto inusual en tu Tarjeta de Crédito...",
      "description": "Monto: S/ 450.00 en 'Tienda Online'. ¿Reconoces esta compra?",
      "severity": "info",
      "amount": 450.00,
      "date": "2024-05-08T18:45:00Z",
      "category": "tarjeta-credito",
      "isRead": false,
      "actionLabel": "Pagar en cuotas"
    },
    {
      "id": "alert-4",
      "title": "Has superado tu presupuesto. Gastos en punto de no retorno.",
      "description": "Es crucial revisar tus finanzas para evitar mayores inconvenientes.",
      "severity": "danger",
      "date": "2024-05-07T09:15:00Z",
      "category": "presupuesto-excedido",
      "isRead": false
    }
  ]
}
```

#### mock-rewards.json
```json
{
  "rewards": [
    {
      "id": "reward-1",
      "title": "Descuentos/Promociones por Ahorro",
      "description": "Descubre beneficios exclusivos por ahorrar con nosotros.",
      "category": "descuento",
      "conditions": "Válido para clientes con plan de ahorro activo",
      "iconName": "reward",
      "actionLabel": "Ver promoción"
    },
    {
      "id": "reward-2",
      "title": "Préstamos Personales",
      "description": "Accede a un préstamo con tasas preferenciales.",
      "category": "promocion",
      "discount": "Tasa desde 9.9%",
      "conditions": "Sujeto a evaluación crediticia",
      "iconName": "money",
      "actionLabel": "Solicitar ahora"
    },
    {
      "id": "reward-3",
      "title": "Ampliación de Línea de Crédito",
      "description": "Aumenta tu línea de crédito de forma rápida y segura.",
      "category": "ampliacion-tc",
      "conditions": "Para clientes con buen historial crediticio",
      "iconName": "credit-card",
      "actionLabel": "Ampliar ahora"
    }
  ]
}
```


#### mock-chat-responses.json
```json
{
  "responses": {
    "gastos": {
      "keywords": ["gasto", "gasté", "compra", "supermercado"],
      "response": "Tu último gasto en un supermercado fue de S/ 150.80 en Wong el 25 de mayo."
    },
    "ahorro": {
      "keywords": ["ahorro", "ahorrar", "meta"],
      "response": "Tu meta de ahorro actual es S/ 800 (20% de tu ingreso). Vas muy bien, llevas S/ 600 ahorrados este mes."
    },
    "plan": {
      "keywords": ["plan", "presupuesto"],
      "response": "Tu plan de ahorros está activo. Ingreso neto: S/ 4,000. Meta de ahorro: S/ 800 (20%)."
    },
    "default": {
      "keywords": [],
      "response": "Estoy aquí para ayudarte con tus finanzas. Puedes preguntarme sobre tus gastos, ahorros o plan financiero."
    }
  }
}
```

#### chat-plan-config.json
```json
{
  "flujoCrearPlan": {
    "descripcion": "Configuración del flujo conversacional para crear plan de ahorros con Chicho",
    "pasos": [
      {
        "id": "paso-1",
        "pregunta": "¡Hola! Estoy aquí para ayudarte a crear tu Plan de Ahorros. Para empezar, ¿cuál es tu ingreso mensual constante antes de descuentos?",
        "tipoRespuesta": "texto-libre",
        "validacion": "numero-positivo",
        "campoDestino": "ingresoNetoMensual",
        "siguientePaso": "paso-2"
      },
      {
        "id": "paso-2",
        "pregunta": "Gracias. ¿Cuál es la principal fuente de este ingreso?",
        "tipoRespuesta": "opciones",
        "opciones": [
          {
            "texto": "Planilla",
            "valor": "planilla"
          },
          {
            "texto": "Recibo por honorarios",
            "valor": "honorarios"
          },
          {
            "texto": "Otro tipo",
            "valor": "otro"
          }
        ],
        "campoDestino": "fuenteIngreso",
        "siguientePaso": "paso-3"
      },
      {
        "id": "paso-3",
        "pregunta": "Entendido. Considerando que estás en {fuenteIngreso}, ¿contribuyes a una AFP (Administradora de Fondos de Pensiones) u otro sistema de pensiones?",
        "tipoRespuesta": "opciones",
        "opciones": [
          {
            "texto": "Sí",
            "valor": "si"
          },
          {
            "texto": "No",
            "valor": "no"
          }
        ],
        "campoDestino": "contribuyeAFP",
        "siguientePaso": "paso-4"
      },
      {
        "id": "paso-4",
        "pregunta": "Perfecto. Ahora, ¿qué porcentaje de tu ingreso te gustaría ahorrar cada mes? Te recomiendo entre 10% y 20%.",
        "tipoRespuesta": "texto-libre",
        "validacion": "numero-porcentaje",
        "campoDestino": "metaAhorroPorcentaje",
        "siguientePaso": "paso-5"
      },
      {
        "id": "paso-5",
        "pregunta": "Excelente. Basándome en tu ingreso de S/ {ingresoNetoMensual} y tu meta de ahorro del {metaAhorroPorcentaje}%, tu distribución sugerida es:\n\n- Ahorro: S/ {metaAhorroMonto}\n- Gastos disponibles: S/ {gastosDisponibles}\n\n¿Te parece bien esta distribución?",
        "tipoRespuesta": "opciones",
        "opciones": [
          {
            "texto": "Sí, confirmar",
            "valor": "confirmar"
          },
          {
            "texto": "No, modificar",
            "valor": "modificar"
          }
        ],
        "campoDestino": "confirmacion",
        "siguientePaso": "fin"
      }
    ],
    "mensajeFinal": "¡Genial! Tu Plan de Ahorros ha sido creado exitosamente. Puedes verlo en la sección de Plan de Ahorros.",
    "notas": [
      "El servicio API debe procesar cada respuesta y determinar si avanza al siguiente paso",
      "El API debe calcular valores dinámicos como {metaAhorroMonto} y {gastosDisponibles}",
      "Si el usuario elige 'modificar', el API debe permitir ajustar los valores",
      "Las variables entre {} se reemplazan con valores reales del contexto"
    ]
  }
}
```

#### DataEstatica/cliente.json
```json
{
  "nombre": "Eduardo Martínez",
  "correo": "eduardo.martinez@email.com"
}
```

#### DataEstatica/configuracion-plan.json
```json
{
  "ingresoNetoMensual": 4000,
  "metaAhorro": 800,
  "tiempoAlertaCompraAlta": 5,
  "cuentasExcluidas": [],
  "clasificacionGastos": {
    "topeHormiga": {
      "automatico": false,
      "montoManual": 500
    },
    "topeMedio": {
      "automatico": true
    }
  },
  "topesMensuales": {
    "cobrosAutomaticos": {
      "porcentaje": 5,
      "montoFijo": 250
    },
    "gastosHormiga": {
      "porcentaje": 8
    },
    "gastosMedios": {
      "montoFijo": 640
    },
    "gastosExcepcionales": {
      "porcentaje": 10
    },
    "cargaFinanciera": {
      "porcentaje": 20
    },
    "movimientosCaja": {
      "porcentaje": 12
    },
    "operacionesRecurrentes": {
      "porcentaje": 16
    }
  },
  "fechaVigencia": "2024-08-01T00:00:00Z",
  "aplicaAMesesAnteriores": false
}
```

#### DataEstatica/chanchitos-ahorro.json
```json
{
  "chanchitos": [
    {
      "id": "chanchito-1",
      "nombre": "Primer Depa",
      "montoActual": 5000,
      "metaMonto": 20000,
      "icono": "home"
    },
    {
      "id": "chanchito-2",
      "nombre": "Primer Carro",
      "montoActual": 3000,
      "metaMonto": 15000,
      "icono": "car"
    },
    {
      "id": "chanchito-3",
      "nombre": "Viaje a Europa",
      "montoActual": 1500,
      "metaMonto": 8000,
      "icono": "plane"
    }
  ]
}
```

#### DataEstatica/datos-multi-mes.json
```json
{
  "mesActual": "Noviembre 2024",
  "meses": [
    {
      "mes": "Agosto 2024",
      "saldoInicial": 1000,
      "saldoFinal": 2630,
      "saldoChanchitos": 5000,
      "ahorroChanchitosDelMes": 0,
      "metaAhorro": 800,
      "operacionesAtrasadas": null
    },
    {
      "mes": "Septiembre 2024",
      "saldoInicial": 2630,
      "saldoFinal": 5760,
      "saldoChanchitos": 5000,
      "ahorroChanchitosDelMes": 0,
      "metaAhorro": 800,
      "operacionesAtrasadas": {
        "operacionesRecurrentes": ["ago-op-luz"],
        "pagosFinancieros": []
      }
    },
    {
      "mes": "Octubre 2024",
      "saldoInicial": 5760,
      "saldoFinal": 8200,
      "saldoChanchitos": 5000,
      "ahorroChanchitosDelMes": 0,
      "metaAhorro": 800,
      "operacionesAtrasadas": null
    },
    {
      "mes": "Noviembre 2024",
      "saldoInicial": 8200,
      "saldoFinal": 9500,
      "saldoChanchitos": 5000,
      "ahorroChanchitosDelMes": 0,
      "metaAhorro": 800,
      "operacionesAtrasadas": null
    }
  ],
  "validacionSaldos": {
    "valido": true,
    "errores": []
  }
}
```

#### DataEstatica/operaciones/agosto-2024.json (Ejemplo con primeras 10 operaciones)
```json
{
  "mes": "Agosto 2024",
  "operaciones": [
    {
      "id": "ago-op-1",
      "fecha": "2024-08-01T00:00:00Z",
      "operacion": "Sueldo Agosto",
      "monto": 4000,
      "categoria": "otros",
      "categoriaUsuario": "ingreso",
      "tipoProducto": "TD"
    },
    {
      "id": "ago-op-2",
      "fecha": "2024-08-01T10:30:00Z",
      "operacion": "Transferencia Alquiler",
      "monto": -800,
      "categoria": "transferencia",
      "categoriaUsuario": "operacion_recurrente",
      "tipoProducto": "TD",
      "estado": "pagado",
      "fechaPagoMaxima": "2024-08-05T00:00:00Z",
      "operacionRecurrenteId": "rec-prog-1",
      "vinculadaARecurrente": true
    },
    {
      "id": "ago-op-3",
      "fecha": "2024-08-02T14:20:00Z",
      "operacion": "Wong - Supermercado",
      "monto": -150.80,
      "categoria": "gastos",
      "subcategoria": "supermercado",
      "tipoProducto": "TD",
      "tipoGasto": "medio"
    },
    {
      "id": "ago-op-4",
      "fecha": "2024-08-02T20:15:00Z",
      "operacion": "Rappi - Cena",
      "monto": -45.50,
      "categoria": "gastos",
      "subcategoria": "delivery",
      "tipoProducto": "TC",
      "tipoGasto": "medio"
    },
    {
      "id": "ago-op-5",
      "fecha": "2024-08-03T09:00:00Z",
      "operacion": "Starbucks",
      "monto": -15.00,
      "categoria": "gastos",
      "subcategoria": "cafeteria",
      "tipoProducto": "TC",
      "tipoGasto": "hormiga"
    },
    {
      "id": "ago-op-6",
      "fecha": "2024-08-03T18:30:00Z",
      "operacion": "Uber",
      "monto": -25.00,
      "categoria": "gastos",
      "subcategoria": "transporte",
      "tipoProducto": "TC",
      "tipoGasto": "hormiga"
    },
    {
      "id": "ago-op-7",
      "fecha": "2024-08-04T12:00:00Z",
      "operacion": "Retiro ATM Interbank",
      "monto": -300.00,
      "categoria": "retiro",
      "tipoProducto": "TD"
    },
    {
      "id": "ago-op-8",
      "fecha": "2024-08-05T08:00:00Z",
      "operacion": "Netflix",
      "monto": -44.90,
      "categoria": "cobro_automatico",
      "categoriaUsuario": "operacion_recurrente",
      "tipoProducto": "TC",
      "automatico": true,
      "estado": "pagado",
      "fechaPagoMaxima": "2024-08-05T00:00:00Z"
    },
    {
      "id": "ago-op-9",
      "fecha": "2024-08-05T19:45:00Z",
      "operacion": "La Bistecca - Cena",
      "monto": -180.00,
      "categoria": "gastos",
      "subcategoria": "restaurante",
      "tipoProducto": "TC",
      "tipoGasto": "excepcional"
    },
    {
      "id": "ago-op-10",
      "fecha": "2024-08-06T11:20:00Z",
      "operacion": "Mercado de Surquillo",
      "monto": -35.00,
      "categoria": "gastos",
      "subcategoria": "mercado",
      "tipoProducto": "TD",
      "tipoGasto": "medio"
    }
  ]
}
```

**Nota**: El archivo completo tendría 100 operaciones. Este es solo un ejemplo de las primeras 10 para mostrar la estructura y variedad.
  "mesActual": "Noviembre 2024",
  "meses": [
    {
      "mes": "Agosto 2024",
      "saldoInicial": 1000,
      "saldoFinal": 2630,
      "saldoChanchitos": 5000,
      "ahorroChanchitosDelMes": 0,
      "metaAhorro": 800,
      "operaciones": [
        {
          "id": "ago-op-1",
          "fecha": "2024-08-01T00:00:00Z",
          "operacion": "Sueldo Agosto",
          "monto": 4000,
          "categoria": "otros",
          "categoriaUsuario": "ingreso"
        },
        {
          "id": "ago-op-2",
          "fecha": "2024-08-05T00:00:00Z",
          "operacion": "Alquiler",
          "monto": -800,
          "categoria": "transferencia",
          "categoriaUsuario": "operacion_recurrente",
          "estado": "pagado",
          "fechaPagoMaxima": "2024-08-05T00:00:00Z",
          "operacionRecurrenteId": "rec-prog-1"
        },
        {
          "id": "ago-op-3",
          "fecha": "2024-08-10T00:00:00Z",
          "operacion": "Supermercado Wong",
          "monto": -150,
          "categoria": "gastos",
          "subcategoria": "restaurantes",
          "tipoGasto": "medio"
        },
        {
          "id": "ago-op-4",
          "fecha": "2024-08-15T00:00:00Z",
          "operacion": "Luz",
          "monto": -120,
          "categoria": "cobro_automatico",
          "categoriaUsuario": "operacion_recurrente",
          "automatico": true,
          "estado": "pendiente",
          "fechaPagoMaxima": "2024-08-15T00:00:00Z"
        },
        {
          "id": "ago-op-5",
          "fecha": "2024-08-20T00:00:00Z",
          "operacion": "Retiro ATM",
          "monto": -300,
          "categoria": "retiro"
        }
      ]
    },
    {
      "mes": "Septiembre 2024",
      "saldoInicial": 2630,
      "saldoFinal": 5760,
      "saldoChanchitos": 5000,
      "ahorroChanchitosDelMes": 0,
      "metaAhorro": 800,
      "operacionesAtrasadas": {
        "operacionesRecurrentes": ["ago-op-4"],
        "pagosFinancieros": []
      },
      "operaciones": [
        {
          "id": "sep-op-1",
          "fecha": "2024-09-01T00:00:00Z",
          "operacion": "Sueldo Septiembre",
          "monto": 4000,
          "categoria": "otros",
          "categoriaUsuario": "ingreso"
        },
        {
          "id": "sep-op-2",
          "fecha": "2024-09-05T00:00:00Z",
          "operacion": "Alquiler",
          "monto": -800,
          "categoria": "transferencia",
          "categoriaUsuario": "operacion_recurrente",
          "estado": "pagado",
          "fechaPagoMaxima": "2024-09-05T00:00:00Z",
          "operacionRecurrenteId": "rec-prog-1"
        }
      ]
    }
  ],
  "configuracionPlan": {
    "ingresoNetoMensual": 4000,
    "metaAhorro": 800,
    "montoMaximoHormiga": 500,
    "tiempoAlertaCompraAlta": 5,
    "cuentasExcluidas": [],
    "porc_ahorro": 20,
    "porc_gastos_hormiga": 8,
    "monto_fijo_gastos_medios": 640,
    "porc_gastos_excepcionales": 8,
    "porc_carga_financiera": 20,
    "porc_movimientos_caja": 12,
    "porc_operaciones_recurrentes": 16,
    "presupuestos": [
      {
        "categoria": "gastos",
        "montoMaximo": 1000,
        "alertaAlSuperar": true
      }
    ],
    "fechaVigencia": "2024-08-01T00:00:00Z",
    "aplicaAMesesAnteriores": false
  },
  "validacionSaldos": {
    "valido": true,
    "errores": []
  },
    "distribucionGastos": [
      {
        "categoria": "Pagos crediticios",
        "porcentaje": 20,
        "monto": 800,
        "color": "#3B82F6"
      },
      {
        "categoria": "Gastos Recurrentes",
        "porcentaje": 16,
        "monto": 640,
        "color": "#8B5CF6"
      },
      {
        "categoria": "Movimientos de Caja",
        "porcentaje": 12,
        "monto": 480,
        "color": "#F97316"
      },
      {
        "categoria": "Cobros Automáticos",
        "porcentaje": 8,
        "monto": 320,
        "color": "#14B8A6"
      },
      {
        "categoria": "Gastos Hormiga",
        "porcentaje": 8,
        "monto": 320,
        "color": "#EC4899"
      },
      {
        "categoria": "Gastos Excepcionales",
        "porcentaje": 8,
        "monto": 320,
        "color": "#EF4444"
      },
      {
        "categoria": "Gastos Medios",
        "porcentaje": 8,
        "monto": 320,
        "color": "#84CC16"
      },
      {
        "categoria": "Ahorro",
        "porcentaje": 20,
        "monto": 800,
        "color": "#00D97E"
      }
    ]
  },
  "configuracion": {
    "ingresoNetoMensual": 4000,
    "metaAhorroPorcentaje": 20,
    "metaAhorroMonto": 800,
    "tiempoAlertaCompraAlta": 5,
    "topesGastos": [
      {
        "categoria": "Gastos Hormiga",
        "topeMensual": 320,
        "alertaAlSuperar": true
      },
      {
        "categoria": "Entretenimiento",
        "topeMensual": 200,
        "alertaAlSuperar": true
      }
    ]
  },
  "movimientosSinCategorizar": [
    {
      "id": "mov-1",
      "descripcion": "Transferencia desde Cuenta Sueldo",
      "monto": 4000,
      "fecha": "2024-05-01T00:00:00Z",
      "tipo": "ingreso"
    },
    {
      "id": "mov-2",
      "descripcion": "Pago a BCP - Préstamo",
      "monto": 500,
      "fecha": "2024-05-05T00:00:00Z",
      "tipo": "egreso"
    },
    {
      "id": "mov-3",
      "descripcion": "Transferencia recurrente - Alquiler",
      "monto": 800,
      "fecha": "2024-05-01T00:00:00Z",
      "tipo": "egreso"
    }
  ],
  "movimientosCaja": {
    "transferencias": [
      {
        "id": "caja-1",
        "descripcion": "Transferencia a Juan Pérez",
        "monto": 200,
        "fecha": "2024-05-10T00:00:00Z",
        "subcategoria": "transferencias"
      }
    ],
    "retiros": [
      {
        "id": "caja-2",
        "descripcion": "Retiro ATM Miraflores",
        "monto": 300,
        "fecha": "2024-05-08T00:00:00Z",
        "subcategoria": "retiros"
      }
    ],
    "depositos": [
      {
        "id": "caja-3",
        "descripcion": "Depósito en efectivo",
        "monto": 500,
        "fecha": "2024-05-05T00:00:00Z",
        "subcategoria": "depositos"
      }
    ],
    "otros": [
      {
        "id": "caja-4",
        "descripcion": "Comisión bancaria",
        "monto": 15,
        "fecha": "2024-05-01T00:00:00Z",
        "subcategoria": "otros"
      }
    ]
  },
  "detalleGastos": {
    "todos": {
      "categoria": "Todos los Gastos",
      "totalMonto": 640,
      "totalPorcentaje": 16,
      "comentarioIA": "Tus gastos están dentro del promedio esperado. El transporte representa la mayor parte, considera opciones de movilidad compartida para reducir costos.",
      "subcategorias": [
        {
          "nombre": "Transporte",
          "monto": 250,
          "porcentaje": 39,
          "color": "#3B82F6"
        },
        {
          "nombre": "Servicios",
          "monto": 150,
          "porcentaje": 23,
          "color": "#3B82F6"
        },
        {
          "nombre": "Delivery",
          "monto": 100,
          "porcentaje": 16,
          "color": "#3B82F6"
        },
        {
          "nombre": "Salud",
          "monto": 80,
          "porcentaje": 13,
          "color": "#3B82F6"
        },
        {
          "nombre": "Otros",
          "monto": 60,
          "porcentaje": 9,
          "color": "#3B82F6"
        }
      ],
      "operaciones": [
        {
          "descripcion": "Uber - Viaje a San Isidro",
          "monto": 25,
          "fecha": "2024-05-10T18:30:00Z"
        },
        {
          "descripcion": "Rappi - Almuerzo",
          "monto": 35,
          "fecha": "2024-05-10T13:00:00Z"
        }
      ]
    },
    "gastos-hormiga": {
      "categoria": "Gastos Hormiga",
      "totalMonto": 320,
      "totalPorcentaje": 8,
      "comentarioIA": "Tus gastos hormiga están acumulando S/ 320 al mes. Pequeños gastos como cafés y snacks suman. Identifícalos para mantener el control.",
      "subcategorias": [
        {
          "nombre": "Cafés",
          "monto": 120,
          "porcentaje": 38,
          "color": "#3B82F6"
        },
        {
          "nombre": "Snacks",
          "monto": 80,
          "porcentaje": 25,
          "color": "#3B82F6"
        },
        {
          "nombre": "Otros",
          "monto": 120,
          "porcentaje": 37,
          "color": "#3B82F6"
        }
      ],
      "operaciones": [
        {
          "descripcion": "Starbucks - Café",
          "monto": 15,
          "fecha": "2024-05-10T09:00:00Z"
        }
      ]
    }
  },
  "chanchitosAhorro": [
    {
      "id": "chanchito-1",
      "nombre": "Primer Depa",
      "montoActual": 5000,
      "metaMonto": 20000,
      "icono": "home"
    },
    {
      "id": "chanchito-2",
      "nombre": "Primer Carro",
      "montoActual": 3000,
      "metaMonto": 15000,
      "icono": "car"
    },
    {
      "id": "chanchito-3",
      "nombre": "Viaje a Europa",
      "montoActual": 1500,
      "metaMonto": 8000,
      "icono": "plane"
    }
  ],
  "operaciones": [
    {
      "id": "op-1",
      "fecha": "2024-05-01T00:00:00Z",
      "operacion": "Sueldo Mayo",
      "monto": 4000,
      "categoria": "otros",
      "categoriaUsuario": "ingreso"
    },
    {
      "id": "op-2",
      "fecha": "2024-05-01T00:00:00Z",
      "operacion": "Alquiler",
      "monto": -800,
      "categoria": "transferencia",
      "categoriaUsuario": "operacion_recurrente",
      "estado": "pagado",
      "fechaPagoMaxima": "2024-05-05T00:00:00Z"
    },
    {
      "id": "op-3",
      "fecha": "2024-05-15T00:00:00Z",
      "operacion": "Luz",
      "monto": -120,
      "categoria": "cobro_automatico",
      "categoriaUsuario": "operacion_recurrente",
      "automatico": true,
      "estado": "pendiente",
      "fechaPagoMaxima": "2024-05-15T00:00:00Z"
    },
    {
      "id": "op-4",
      "fecha": "2024-05-10T00:00:00Z",
      "operacion": "Supermercado Wong",
      "monto": -150,
      "categoria": "gastos",
      "subcategoria": "restaurantes",
      "tipoGasto": "medio"
    },
    {
      "id": "op-5",
      "fecha": "2024-05-08T00:00:00Z",
      "operacion": "Retiro ATM",
      "monto": -300,
      "categoria": "retiro"
    },
    {
      "id": "op-6",
      "fecha": "2024-05-05T00:00:00Z",
      "operacion": "Cuota Préstamo BCP",
      "monto": -500,
      "categoria": "pago_financiero",
      "categoriaUsuario": "pago_financiero_otro_banco",
      "estado": "pagado",
      "fechaPagoMaxima": "2024-05-10T00:00:00Z"
    },
    {
      "id": "op-7",
      "fecha": "2024-05-12T00:00:00Z",
      "operacion": "Café Starbucks",
      "monto": -15,
      "categoria": "gastos",
      "subcategoria": "delivery",
      "tipoGasto": "hormiga"
    },
    {
      "id": "op-8",
      "fecha": "2024-05-20T00:00:00Z",
      "operacion": "Tarjeta de Crédito",
      "monto": -250,
      "categoria": "pago_financiero",
      "estado": "pendiente",
      "fechaPagoMaxima": "2024-05-25T00:00:00Z"
    }
  ],
  "respuestasEstaticas": [
    {
      "preguntaUsuario": "cualquier_texto",
      "respuestaIA": "Tu último gasto en un supermercado fue de S/ 150.80 en Wong el 25 de mayo."
    }
  ],
  "listaRecompensas": [
    {
      "id": "rec-1",
      "titulo": "Descuentos/Promociones por Ahorro",
      "subtitulo": "Descubre beneficios exclusivos por ahorrar con nosotros.",
      "textoBoton": "Ver promoción",
      "icono": "reward",
      "tipo": "recompensa"
    },
    {
      "id": "rec-2",
      "titulo": "Préstamos Personales",
      "subtitulo": "Accede a un préstamo con tasas preferenciales.",
      "textoBoton": "Solicitar ahora",
      "imagen": "prestamo.png",
      "tipo": "recompensa"
    }
  ],
  "listaAlertas": [
    {
      "id": "alert-1",
      "titulo": "Detectamos que tus gastos se están saliendo de tu plan de ahorros",
      "subtitulo": "Revisa tus últimas transacciones para ajustar tu presupuesto.",
      "icono": "warning",
      "textoBoton": "Ver detalles",
      "tipo": "alerta"
    },
    {
      "id": "alert-2",
      "titulo": "Tus gastos hormiga han incrementado...",
      "subtitulo": "Pequeños gastos suman. Identifícalos para mantener el control.",
      "icono": "warning",
      "textoBoton": "Ver gastos",
      "tipo": "alerta"
    }
  ],
}
```

#### DataEstatica/chat/respuestas-estaticas.json
```json
{
  "respuestaIA": "Tu último gasto en un supermercado fue de S/ 150.80 en Wong el 2 de agosto."
}
```

#### DataEstatica/chat/lista-conversacion.json
```json
{
  "mensajes": [
    {
      "id": "chat-1",
      "texto": "¡Hola! Estoy aquí para ayudarte con tus finanzas.",
      "esIA": true,
      "tipo": "chat",
      "timestamp": "2024-11-01T10:00:00Z",
      "leido": true
    },
    {
      "id": "chat-2",
      "texto": "¿Cuál fue mi último gasto?",
      "esIA": false,
      "tipo": "chat",
      "timestamp": "2024-11-01T10:01:00Z",
      "leido": true
    },
    {
      "id": "chat-3",
      "texto": "Tu último gasto fue de S/ 150.80 en Wong el 2 de agosto.",
      "esIA": true,
      "tipo": "chat",
      "timestamp": "2024-11-01T10:01:30Z",
      "leido": true
    }
  ]
}
```

#### DataEstatica/chat/lista-alertas.json
```json
{
  "alertas": [
    {
      "id": "alert-1",
      "tipo": "alerta",
      "titulo": "Detectamos que tus gastos se están saliendo de tu plan de ahorros",
      "subtitulo": "Revisa tus últimas transacciones para ajustar tu presupuesto.",
      "icono": "warning",
      "textoBoton": "Ver detalles",
      "severidad": "warning",
      "timestamp": "2024-11-10T09:00:00Z",
      "leido": false
    },
    {
      "id": "alert-2",
      "tipo": "alerta",
      "titulo": "Tus gastos hormiga han incrementado...",
      "subtitulo": "Pequeños gastos suman. Identifícalos para mantener el control.",
      "icono": "warning",
      "textoBoton": "Ver gastos",
      "severidad": "warning",
      "timestamp": "2024-11-09T14:30:00Z",
      "leido": false
    }
  ]
}
```

#### DataEstatica/chat/lista-recompensas.json
```json
{
  "recompensas": [
    {
      "id": "rec-1",
      "tipo": "recompensa",
      "tituloRecompensa": "Descuentos/Promociones por Ahorro",
      "subtituloRecompensa": "Descubre beneficios exclusivos por ahorrar con nosotros.",
      "iconoRecompensa": "reward",
      "textoBotonRecompensa": "Ver promoción",
      "timestamp": "2024-11-08T10:00:00Z",
      "leido": true
    },
    {
      "id": "rec-2",
      "tipo": "recompensa",
      "tituloRecompensa": "Préstamos Personales",
      "subtituloRecompensa": "Accede a un préstamo con tasas preferenciales.",
      "imagenRecompensa": "prestamo.png",
      "textoBotonRecompensa": "Solicitar ahora",
      "timestamp": "2024-11-07T15:00:00Z",
      "leido": true
    }
  ]
}
```

#### DataEstatica/operaciones-recurrentes.json
```json
{
  "operacionesRecurrentes": [
    {
      "id": "rec-prog-1",
      "titulo": "Alquiler",
      "monto": -800,
      "fechaInicio": "2024-08-01T00:00:00Z",
      "fechaFin": "2024-12-31T00:00:00Z",
      "diaDelMes": 5,
      "activa": true,
      "operacionesGeneradas": [
        {
          "mes": "Agosto 2024",
          "operacionId": "ago-op-2",
          "vinculada": true
        },
        {
          "mes": "Septiembre 2024",
          "operacionId": "sep-op-2",
          "vinculada": true
        }
      ]
    },
    {
      "id": "rec-prog-2",
      "titulo": "Internet",
      "monto": -80,
      "fechaInicio": "2024-08-01T00:00:00Z",
      "fechaFin": "2024-12-31T00:00:00Z",
      "diaDelMes": "fin_de_mes",
      "activa": true,
      "operacionesGeneradas": []
    },
    {
      "id": "rec-prog-3",
      "titulo": "Gimnasio",
      "monto": -150,
      "fechaInicio": "2024-09-01T00:00:00Z",
      "fechaFin": "2024-11-30T00:00:00Z",
      "diaDelMes": 15,
      "activa": false,
      "operacionesGeneradas": []
    }
  ]
}
```

## Environment Configuration

### environment.development.ts
```typescript
export const environment = {
  production: false,
  apiUrl: '',  // Vacío para usar mock data
  useMockData: true,
  enableLogging: true
};
```

### environment.production.ts
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.interbank.pe/chicho',  // TODO: Reemplazar con URL real
  useMockData: false,  // Cambiar a false cuando las APIs estén listas
  enableLogging: false
};
```


## HTML Refactoring Strategy

### Agent Hook Workflow

El Hook de Refactorización se ejecuta automáticamente cuando se detectan nuevos archivos HTML en el folder `OriginalHTMLs/` después de un pull request.

#### Proceso de Refactorización

1. **Detección de HTMLs**
   - El hook monitorea el folder `OriginalHTMLs/`
   - Detecta archivos nuevos o modificados
   - Lee el contenido del HTML

2. **Identificación de User Story**
   - Analiza el nombre del archivo (ej: `chat-view.html`, `plan-ahorros.html`)
   - Analiza el contenido HTML para identificar elementos clave
   - Mapea a un user story específico del requirements.md

3. **Extracción de Componentes**
   - Identifica elementos repetibles (botones, cards, inputs)
   - Crea componentes reutilizables en `shared/components/`
   - Genera componente principal en el módulo correspondiente

4. **Extracción de Estilos**
   - Extrae estilos inline a archivo SCSS
   - Reemplaza valores hardcoded con variables SCSS
   - Aplica mixins cuando sea apropiado

5. **Generación de TypeScript**
   - Crea interfaces para datos
   - Implementa lógica de componente
   - Conecta con servicios existentes

6. **Integración con Routing**
   - Añade ruta al archivo `app.routes.ts`
   - Actualiza navegación si es necesario

### Mapeo HTML → User Story

```typescript
// Reglas de mapeo para el hook
const htmlToUserStoryMap = {
  'home': 'Requirement 1',
  'chat': 'Requirement 4, 5, 6',
  'plan-ahorros': 'Requirement 9',
  'crear-plan': 'Requirement 9',
  'recompensas': 'Requirement 8',
  'alertas': 'Requirement 3'
};
```

### Ejemplo de Refactorización

**Input**: `OriginalHTMLs/chat-view.html`

```html
<div style="padding: 16px; background: #F9FAFB;">
  <div style="display: flex; align-items: center; margin-bottom: 16px;">
    <img src="avatar.png" style="width: 40px; height: 40px; border-radius: 50%;">
    <span style="margin-left: 12px; font-weight: 600;">Chicho</span>
  </div>
  <div style="background: white; padding: 16px; border-radius: 12px;">
    <p>¿En qué puedo ayudarte hoy?</p>
  </div>
</div>
```

**Output**: `features/chat/chat.component.ts` + `chat.component.scss`

```typescript
// chat.component.ts
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, ChatMessageComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  messages: ChatMessage[] = [];
  
  constructor(private chatService: ChatService) {}
  
  ngOnInit() {
    this.loadMessages();
  }
  
  loadMessages() {
    this.chatService.getConversationHistory()
      .subscribe(messages => this.messages = messages);
  }
}
```


```html
<!-- chat.component.html -->
<div class="chat-container">
  <div class="chat-header">
    <img [src]="'assets/images/avatar-chicho.png'" class="avatar" alt="Chicho">
    <span class="chat-name">Chicho</span>
  </div>
  
  <div class="messages-container">
    <app-chat-message 
      *ngFor="let message of messages"
      [message]="message">
    </app-chat-message>
  </div>
</div>
```

```scss
// chat.component.scss
@import 'variables';
@import 'mixins';

.chat-container {
  padding: $spacing-md;
  background-color: $color-bg-secondary;
}

.chat-header {
  display: flex;
  align-items: center;
  margin-bottom: $spacing-md;
  
  .avatar {
    width: 40px;
    height: 40px;
    border-radius: $border-radius-full;
  }
  
  .chat-name {
    margin-left: $spacing-sm;
    font-weight: 600;
    color: $color-text-primary;
  }
}

.messages-container {
  @include card;
}
```

### Componentes Reutilizables Identificados

Durante la refactorización, el hook debe identificar y crear estos componentes comunes:

1. **ButtonComponent** - Botones con estilos Interbank
2. **CardComponent** - Cards genéricos
3. **InputComponent** - Inputs de texto con estilos
4. **AvatarComponent** - Avatares circulares
5. **BadgeComponent** - Badges de notificación
6. **IconComponent** - Wrapper para iconos SVG
7. **LoadingSpinnerComponent** - Indicador de carga
8. **EmptyStateComponent** - Estados vacíos

## Error Handling

### Estrategia de Manejo de Errores

```typescript
// error-handler.service.ts
@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  
  handleApiError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error inesperado';
    
    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      errorMessage = `Código: ${error.status}\nMensaje: ${error.message}`;
    }
    
    console.error(errorMessage);
    
    // Mostrar mensaje al usuario (toast, snackbar, etc.)
    // this.toastService.showError(errorMessage);
    
    return throwError(() => new Error(errorMessage));
  }
  
  handleMockFallback(operation: string): void {
    console.warn(`Usando datos mock para: ${operation}`);
  }
}
```

### Interceptor para Fallback Automático

```typescript
// api-fallback.interceptor.ts
export const apiFallbackInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si falla la API, intentar con mock data
      if (error.status === 0 || error.status >= 500) {
        console.warn('API no disponible, usando datos mock');
        // Retornar datos mock según el endpoint
        return of(getMockDataForEndpoint(req.url));
      }
      return throwError(() => error);
    })
  );
};
```


## Testing Strategy

### Enfoque de Testing para PoC

Dado que es una PoC, el testing se enfoca en:

1. **Testing manual** - Verificación visual y funcional
2. **Unit tests básicos** - Solo para servicios críticos
3. **E2E tests opcionales** - Para flujos principales

### Unit Tests Básicos

```typescript
// chat.service.spec.ts
describe('ChatService', () => {
  let service: ChatService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatService);
  });
  
  it('should return mock response when API is not available', (done) => {
    service.sendMessage('test').subscribe(response => {
      expect(response).toBeDefined();
      expect(response.content).toBeTruthy();
      done();
    });
  });
});
```

### Testing Manual Checklist

- [ ] Responsive en desktop (marco de celular centrado)
- [ ] Responsive en móvil (pantalla completa)
- [ ] Botón flotante muestra badge correcto
- [ ] Chat se abre con animación
- [ ] Mensajes se muestran correctamente
- [ ] Filtros de comunicación funcionan
- [ ] Navegación entre secciones mantiene estado
- [ ] Alertas se pueden marcar como leídas
- [ ] Recompensas se muestran por categoría
- [ ] Plan de ahorros muestra gráfico correcto

## Vercel Deployment

### vercel.json Configuration

```json
{
  "version": 2,
  "name": "chicho-chatbot-poc",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/chicho-chatbot-poc/browser"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### package.json Scripts

```json
{
  "scripts": {
    "dev": "ng serve",
    "build": "ng build",
    "build:prod": "ng build --configuration production",
    "vercel-build": "ng build --configuration production"
  }
}
```

### Deployment Steps

1. **Conectar repositorio a Vercel**
   - Ir a vercel.com
   - Importar proyecto desde GitHub
   - Seleccionar el repositorio

2. **Configurar build**
   - Framework Preset: Angular
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist/chicho-chatbot-poc/browser`

3. **Variables de entorno**
   - Añadir `PRODUCTION=true` en Vercel
   - Configurar `API_URL` cuando esté disponible

4. **Deploy**
   - Push a main branch para deploy automático
   - Vercel genera URL de preview para cada PR


## Development Guidelines

### Código Simple y Legible

#### Principios para Desarrolladores

1. **Nombres descriptivos en español**
   ```typescript
   // ✅ Bueno
   const metaAhorro = 800;
   const distribucionGastos = [];
   
   // ❌ Evitar
   const ma = 800;
   const dg = [];
   ```

2. **Evitar abstracciones innecesarias**
   ```typescript
   // ✅ Bueno - Directo y claro
   getAlertas(): Observable<Alert[]> {
     if (this.useMockData) {
       return of(MOCK_ALERTS);
     }
     return this.http.get<Alert[]>(`${this.apiUrl}/alertas`);
   }
   
   // ❌ Evitar - Sobre-ingeniería
   getAlertas(): Observable<Alert[]> {
     return this.dataStrategy
       .execute(new GetAlertasCommand())
       .pipe(map(result => result.data));
   }
   ```

3. **Comentarios donde sea necesario**
   ```typescript
   // Fallback a datos mock si la API no está disponible
   if (!this.apiUrl || this.useMockData) {
     return this.getMockResponse(message);
   }
   ```

4. **Componentes con responsabilidad única**
   - Un componente = una funcionalidad
   - Máximo 200 líneas por archivo
   - Extraer lógica compleja a servicios

5. **Evitar optimizaciones prematuras**
   ```typescript
   // ✅ Bueno para PoC
   messages.filter(m => m.type === 'alert')
   
   // ❌ Innecesario para PoC
   // Implementar memoización, virtual scroll, etc.
   ```

### Estructura de Archivos

Cada componente debe seguir esta estructura:

```
component-name/
├── component-name.component.ts       # Lógica del componente
├── component-name.component.html     # Template
├── component-name.component.scss     # Estilos
└── component-name.component.spec.ts  # Tests (opcional)
```

### Convenciones de Nomenclatura

- **Componentes**: PascalCase - `ChatMessageComponent`
- **Servicios**: PascalCase + Service - `ChatService`
- **Interfaces**: PascalCase - `ChatMessage`
- **Variables**: camelCase - `metaAhorro`
- **Constantes**: UPPER_SNAKE_CASE - `MOCK_ALERTS`
- **Archivos**: kebab-case - `chat-message.component.ts`

### Git Workflow

1. **Branches**
   - `main` - Producción (deploy automático a Vercel)
   - `develop` - Desarrollo
   - `feature/nombre-feature` - Features nuevos
   - `fix/nombre-fix` - Correcciones

2. **Commits**
   - Usar mensajes descriptivos en español
   - Formato: `tipo: descripción`
   - Ejemplos:
     - `feat: añadir vista de alertas`
     - `fix: corregir badge de notificaciones`
     - `style: actualizar colores de Interbank`
     - `refactor: simplificar lógica de chat`

3. **Pull Requests**
   - Incluir capturas de pantalla
   - Describir cambios realizados
   - Mencionar user stories relacionados


## Performance Considerations

### Optimizaciones Básicas (sin sobre-ingeniería)

1. **Lazy Loading de Imágenes**
   ```html
   <img [src]="imageUrl" loading="lazy" alt="descripción">
   ```

2. **OnPush Change Detection** (solo donde tenga sentido)
   ```typescript
   @Component({
     changeDetection: ChangeDetectionStrategy.OnPush
   })
   ```

3. **TrackBy en ngFor**
   ```html
   <div *ngFor="let alert of alertas; trackBy: trackByAlertId">
   ```

4. **Debounce en búsqueda**
   ```typescript
   searchControl.valueChanges
     .pipe(debounceTime(300))
     .subscribe(value => this.search(value));
   ```

### Métricas a Monitorear

- Tiempo de carga inicial < 3s
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s
- Bundle size < 500KB (gzipped)

## Accessibility

### Consideraciones Básicas

1. **Contraste de colores**
   - Ratio mínimo 4.5:1 para texto normal
   - Ratio mínimo 3:1 para texto grande

2. **Navegación por teclado**
   - Todos los elementos interactivos accesibles con Tab
   - Focus visible en elementos activos

3. **ARIA labels**
   ```html
   <button aria-label="Cerrar chat">
     <img src="close.svg" alt="">
   </button>
   ```

4. **Textos alternativos**
   ```html
   <img src="chicho.svg" alt="Chicho, tu asistente de ahorro">
   ```

## Security Considerations

### Prácticas Básicas

1. **Sanitización de inputs**
   - Angular sanitiza automáticamente
   - Evitar usar `innerHTML` directamente

2. **HTTPS en producción**
   - Vercel provee HTTPS automáticamente

3. **Variables de entorno**
   - No commitear API keys
   - Usar variables de entorno de Vercel

4. **CORS**
   - Configurar en el backend cuando se conecten APIs reales

## Documentation

### README.md del Proyecto

```markdown
# Chicho - Chatbot Inteligente de Ahorro

PoC de aplicación web Angular para Interbank.

## Requisitos

- Node.js 18+
- npm 9+
- Angular CLI 17+

## Instalación

\`\`\`bash
npm install
\`\`\`

## Desarrollo

\`\`\`bash
npm run dev
\`\`\`

Abre http://localhost:4200

## Build

\`\`\`bash
npm run build:prod
\`\`\`

## Deploy a Vercel

\`\`\`bash
vercel --prod
\`\`\`

## Estructura del Proyecto

Ver [ARCHITECTURE.md](./docs/ARCHITECTURE.md)

## Reemplazar Assets

Ver [assets/README.md](./src/assets/README.md)

## Conectar APIs Reales

1. Actualizar `environment.production.ts`:
   - Cambiar `apiUrl` a la URL real
   - Cambiar `useMockData` a `false`

2. Los servicios automáticamente usarán las APIs reales

## Añadir Nuevas Vistas

1. Colocar HTML en `OriginalHTMLs/`
2. Hacer commit y push
3. El hook generará automáticamente los componentes
```


## User Flows

### Flujo de Configuración del Plan de Ahorros

#### Opción 1: Conversacional con Chicho (Recomendado)
1. Usuario accede a `/plan-ahorros/crear`
2. Chicho saluda y pregunta por ingreso mensual
3. Usuario responde con monto
4. Chicho pregunta por meta de ahorro
5. Usuario define porcentaje o monto
6. Chicho sugiere distribución de gastos
7. Usuario confirma o modifica
8. Plan se crea y se redirige a `/plan-ahorros`

#### Opción 2: Configuración Manual
1. Usuario accede a `/plan-ahorros` y hace clic en botón de settings
2. Se abre `/plan-ahorros/configurar`
3. Formulario muestra campos editables:
   - Ingreso neto mensual
   - Meta de ahorro (% y monto)
   - Topes de gastos por categoría
   - Tiempo de alerta para compras altas (minutos)
4. Botón "Hablar con Chicho" en la parte superior permite cambiar a flujo conversacional
5. Usuario guarda cambios
6. Se redirige a `/plan-ahorros`

### Flujo de Categorización de Movimientos

1. Usuario está en `/plan-ahorros`
2. En secciones "Ingresos", "Operaciones Regulares" o "Pagos Financieros" ve botón "+"
3. Hace clic en botón "+"
4. Se abre modal `CategorizarMovimientoModalComponent`
5. Modal muestra lista de movimientos sin categorizar
6. Usuario selecciona un movimiento
7. Usuario elige categoría: Ingresos, Operaciones Regulares, o Pagos Financieros (Otros Bancos)
8. Movimiento se categoriza y se actualiza la vista
9. Modal se cierra

### Flujo de Detalle de Gastos

1. Usuario está en `/plan-ahorros`
2. En la sección de "Gastos" ve botón "Ver más"
3. Hace clic en "Ver más"
4. Se navega a `/plan-ahorros/detalle/gastos`
5. Vista muestra:
   - Título "Detalle de Gastos"
   - Filtro con opciones: Todos, Gastos Hormiga, Gastos Medios, Gastos Excepcionales
   - Gráfico de barras horizontales con 9 tipos de consumo + Otros (color azul configurable)
   - Lista cronológica de operaciones debajo del gráfico con monto y fecha
   - Comentario resumen generado por IA al final
6. WHEN usuario cambia filtro, THE gráfico y lista se actualizan según la selección
7. Botón de regresar para volver a `/plan-ahorros`

### Flujo de Lista de Movimientos (Para otras secciones)

1. Usuario está en `/plan-ahorros`
2. En secciones de "Operaciones Regulares", "Ingresos", "Pagos Financieros" ve botón "Ver más"
3. Hace clic en "Ver más"
4. Se navega a `/plan-ahorros/lista/:categoria`
5. Vista muestra:
   - Título de la categoría
   - Lista cronológica de movimientos con: nombre, monto, fecha
   - Cada movimiento tiene botones para:
     - Recategorizar en: "Pago Financiero - Otro Banco", "Ingresos", "Operaciones Regulares"
     - Devolver a Movimientos de Caja (subcategorías: Transferencias, Retiros, Depósitos, Otros)
6. Botón de regresar para volver a `/plan-ahorros`

### Flujo de Transferencia al Chanchito de Ahorro

1. Usuario está en `/plan-ahorros` viendo el **mes actual** (Noviembre 2024)
2. Ve icono circular de dinero deslizable hacia el icono del chanchito
3. **NOTA**: Si usuario está viendo un mes pasado, el drag-to-save NO aparece
4. Usuario desliza el icono de dinero hacia el chanchito
5. Se abre modal de transferencia al ahorro
6. Modal muestra:
   - Campo para ingresar monto
   - Selector de chanchito de ahorro (Primer depa, Primer carro, Viaje, etc.)
   - Botón de confirmación
7. Usuario ingresa monto, selecciona chanchito y confirma
8. Sistema:
   - Crea operación temporal de egreso
   - Actualiza `ahorroChanchitosDelMes` del mes actual
   - Actualiza `saldoChanchitos` sumando el monto
   - Actualiza `montoActual` del chanchito seleccionado
9. Se cierra modal y se actualiza vista de plan de ahorros
10. **IMPORTANTE**: Al refrescar la página, todos los cambios desaparecen (no persisten en PoC)

### Flujo de Pull-to-Refresh

1. Usuario está en `/plan-ahorros`
2. Usuario arrastra la vista hacia abajo (pull-to-refresh)
3. Aparece indicador de carga
4. Sistema recarga datos del plan de ahorros
5. Vista se actualiza con datos frescos
6. Indicador de carga desaparece

### Flujo de Detalle de Movimientos de Caja

1. Usuario está en `/plan-ahorros`
2. En la sección "Movimientos de Caja" ve 4 items: Transferencias, Retiros, Depósitos, Otros
3. Cada item tiene botón "Ver más"
4. WHEN usuario hace clic en "Ver más" de un item, THE Sistema Angular navega a `/plan-ahorros/movimientos-caja/:tipo`
5. Vista muestra:
   - Título del tipo seleccionado (ej: "Transferencias")
   - Lista cronológica de operaciones con: nombre, monto, fecha
   - Cada operación tiene botones para recategorizar en: "Pago Financiero - Otro Banco", "Ingresos", "Operaciones Regulares"
6. Botón de regresar para volver a `/plan-ahorros`

## Estructura de Datos JSON (Basada en Operaciones.xlsx)

### Archivo: DataEstatica/operaciones/agosto-2024.json

Este archivo contiene 100 operaciones del mes de Agosto 2024. La estructura se basa en el archivo `Operaciones.xlsx` ubicado en `c:\Users\B38471\cofi-ibk\Operaciones.xlsx`.

**Distribución de operaciones**:
- 60% Tarjeta de Débito (TD)
- 40% Tarjeta de Crédito (TC)

**Categorías incluidas**:
- Cobros Automáticos (automatico: true)
- Gastos (subcategorías: restaurantes, transporte, delivery, entretenimiento, salud, educación, compras, servicios, viajes)
- Transferencias
- Retiros
- Depósitos
- Pagos Financieros
- Otros

**Campos obligatorios por operación**:
```typescript
{
  id: string;                    // UUID único
  fecha: Date;                   // Fecha de la operación
  operacion: string;             // Descripción (tomada del Excel)
  monto: number;                 // Monto (negativo para egresos, positivo para ingresos)
  categoria: string;             // cobro_automatico | transferencia | retiro | deposito | pago_financiero | otros | gastos
  categoriaUsuario?: string;     // operacion_recurrente | ingreso | pago_financiero_otro_banco | no_aplica
  subcategoria?: string;         // Solo para gastos: restaurantes, transporte, delivery, etc.
  tipoProducto: 'TC' | 'TD';    // Tarjeta de Crédito o Tarjeta de Débito
  automatico?: boolean;          // true para cobros automáticos
  estado?: string;               // pagado | pendiente (solo para Operaciones Recurrentes y Pagos Financieros)
  fechaPagoMaxima?: Date;        // Solo para operaciones pendientes
  tipoGasto?: string;            // hormiga | medio | excepcional (calculado automáticamente)
  operacionRecurrenteId?: string; // ID de la operación recurrente programada
  vinculadaARecurrente?: boolean; // true si está vinculada
  esAtrasada?: boolean;          // true si es un pago atrasado del mes anterior
  notas?: string;                // Notas del usuario
  etiquetas?: string[];          // Tags personalizados
}
```

**Ejemplo de operación del Excel**:
```json
{
  "id": "op-ago-001",
  "fecha": "2024-08-01T10:30:00Z",
  "operacion": "COMPRA EN SUPERMERCADO WONG",
  "monto": -85.50,
  "categoria": "gastos",
  "subcategoria": "compras",
  "tipoProducto": "TD",
  "automatico": false,
  "estado": "pagado",
  "tipoGasto": "medio"
}
```

**Ejemplo de cobro automático**:
```json
{
  "id": "op-ago-002",
  "fecha": "2024-08-05T00:00:00Z",
  "operacion": "NETFLIX SUBSCRIPTION",
  "monto": -35.90,
  "categoria": "cobro_automatico",
  "subcategoria": "entretenimiento",
  "tipoProducto": "TC",
  "automatico": true,
  "estado": "pagado",
  "tipoGasto": "hormiga"
}
```

**Ejemplo de operación recurrente pendiente**:
```json
{
  "id": "op-ago-003",
  "fecha": "2024-08-15T00:00:00Z",
  "operacion": "PAGO ALQUILER DEPARTAMENTO",
  "monto": -1200.00,
  "categoria": "gastos",
  "categoriaUsuario": "operacion_recurrente",
  "subcategoria": "servicios",
  "tipoProducto": "TD",
  "automatico": false,
  "estado": "pendiente",
  "fechaPagoMaxima": "2024-08-20T23:59:59Z",
  "operacionRecurrenteId": "rec-001",
  "vinculadaARecurrente": true
}
```

**Ejemplo de pago financiero otro banco**:
```json
{
  "id": "op-ago-004",
  "fecha": "2024-08-10T00:00:00Z",
  "operacion": "PAGO TARJETA BBVA",
  "monto": -450.00,
  "categoria": "pago_financiero",
  "categoriaUsuario": "pago_financiero_otro_banco",
  "tipoProducto": "TD",
  "estado": "pagado"
}
```

**Ejemplo de ingreso**:
```json
{
  "id": "op-ago-005",
  "fecha": "2024-08-01T00:00:00Z",
  "operacion": "SUELDO MENSUAL",
  "monto": 4000.00,
  "categoria": "transferencia",
  "categoriaUsuario": "ingreso",
  "tipoProducto": "TD",
  "estado": "pagado"
}
```

**Ejemplo de transferencia (movimiento de caja)**:
```json
{
  "id": "op-ago-006",
  "fecha": "2024-08-12T14:20:00Z",
  "operacion": "TRANSFERENCIA A CUENTA AHORROS",
  "monto": -500.00,
  "categoria": "transferencia",
  "tipoProducto": "TD",
  "estado": "pagado"
}
```

**Ejemplo de operación atrasada del mes anterior**:
```json
{
  "id": "op-ago-007",
  "fecha": "2024-07-28T00:00:00Z",
  "operacion": "PAGO TARJETA RIPLEY (ATRASADO)",
  "monto": -280.00,
  "categoria": "pago_financiero",
  "categoriaUsuario": "pago_financiero_otro_banco",
  "tipoProducto": "TD",
  "estado": "pagado",
  "esAtrasada": true
}
```

### Subcategorías de Gastos (9 tipos + Otros)

Las operaciones de gastos deben distribuirse entre estas subcategorías:

1. **viajes** - Pasajes, hoteles, tours
2. **transporte** - Taxi, Uber, combustible, estacionamiento
3. **delivery** - Pedidos de comida a domicilio
4. **restaurantes** - Comidas en restaurantes, cafés
5. **entretenimiento** - Cine, conciertos, streaming, juegos
6. **salud** - Farmacia, consultas médicas, seguros
7. **educación** - Cursos, libros, materiales
8. **compras** - Ropa, electrónica, supermercado
9. **servicios** - Luz, agua, internet, teléfono, alquiler
10. **otros** - Cualquier gasto que no encaje en las anteriores

### Validación de Saldos Multi-Mes

El sistema debe validar que:
```typescript
saldoInicialSeptiembre === saldoFinalAgosto
saldoInicialOctubre === saldoFinalSeptiembre
saldoInicialNoviembre === saldoFinalOctubre
```

Si hay inconsistencias, mostrar en `validacionSaldos.errores[]`.

### Archivo: DataEstatica/operaciones-recurrentes.json

```json
[
  {
    "id": "rec-001",
    "titulo": "Alquiler Departamento",
    "monto": -1200.00,
    "fechaInicio": "2024-08-01",
    "fechaFin": "2025-12-31",
    "diaDelMes": 15,
    "activa": true,
    "operacionesGeneradas": [
      {
        "mes": "Agosto 2024",
        "operacionId": "op-ago-003",
        "vinculada": true
      },
      {
        "mes": "Septiembre 2024",
        "operacionId": "op-sep-015",
        "vinculada": false
      }
    ]
  },
  {
    "id": "rec-002",
    "titulo": "Pago Gimnasio",
    "monto": -150.00,
    "fechaInicio": "2024-08-01",
    "fechaFin": "2024-12-31",
    "diaDelMes": 5,
    "activa": true,
    "operacionesGeneradas": [
      {
        "mes": "Agosto 2024",
        "operacionId": "op-ago-020",
        "vinculada": true
      }
    ]
  },
  {
    "id": "rec-003",
    "titulo": "Pago Seguro Auto",
    "monto": -200.00,
    "fechaInicio": "2024-08-01",
    "fechaFin": "2025-08-01",
    "diaDelMes": "fin_de_mes",
    "activa": false,
    "operacionesGeneradas": []
  }
]
```

### Archivo: DataEstatica/chanchitos-ahorro.json

```json
[
  {
    "id": "chan-001",
    "nombre": "Primer Depa",
    "montoActual": 5200.00,
    "metaMonto": 15000.00,
    "icono": "home"
  },
  {
    "id": "chan-002",
    "nombre": "Primer Carro",
    "montoActual": 3800.00,
    "metaMonto": 12000.00,
    "icono": "car"
  },
  {
    "id": "chan-003",
    "nombre": "Viaje a Europa",
    "montoActual": 1500.00,
    "metaMonto": 8000.00,
    "icono": "plane"
  },
  {
    "id": "chan-004",
    "nombre": "Fondo Emergencia",
    "montoActual": 2000.00,
    "metaMonto": 5000.00,
    "icono": "shield"
  }
]
```

### Archivo: DataEstatica/cliente.json

```json
{
  "nombre": "Juan Pérez",
  "correo": "juan.perez@example.com",
  "cuentas": [
    {
      "id": "cta-001",
      "nombre": "Cuenta Sueldo",
      "tipo": "cuenta",
      "saldoDisponible": 2450.00,
      "excluirDeSaldoInicial": false
    },
    {
      "id": "cta-002",
      "nombre": "Cuenta Ahorros",
      "tipo": "cuenta",
      "saldoDisponible": 8500.00,
      "excluirDeSaldoInicial": false
    },
    {
      "id": "tc-001",
      "nombre": "Tarjeta Clásica",
      "tipo": "tarjeta",
      "lineaDisponible": 3500.00,
      "excluirDeSaldoInicial": true
    }
  ]
}
```

### Archivo: DataEstatica/configuracion-plan.json

```json
{
  "ingresoNetoMensual": 4000.00,
  "metaAhorro": 800.00,
  "tiempoAlertaCompraAlta": 30,
  "cuentasExcluidas": ["tc-001"],
  "clasificacionGastos": {
    "topeHormiga": {
      "automatico": true,
      "montoManual": null
    },
    "topeMedio": {
      "automatico": true,
      "montoManual": null
    }
  },
  "topesMensuales": {
    "cobrosAutomaticos": {
      "porcentaje": 10,
      "montoFijo": null
    },
    "gastosHormiga": {
      "porcentaje": 10,
      "montoFijo": null
    },
    "gastosMedios": {
      "porcentaje": 10,
      "montoFijo": null
    },
    "gastosExcepcionales": {
      "porcentaje": 10,
      "montoFijo": null
    },
    "cargaFinanciera": {
      "porcentaje": 30,
      "montoFijo": null
    },
    "movimientosCaja": {
      "porcentaje": null,
      "montoFijo": null
    },
    "operacionesRecurrentes": {
      "porcentaje": null,
      "montoFijo": null
    }
  },
  "fechaVigencia": "2024-08-01T00:00:00Z",
  "aplicaAMesesAnteriores": false
}
```

**Topes por defecto (para el chat/resumen)**:
- **Carga Financiera**: 30% del ingreso neto mensual
- **Cobros Automáticos**: 10% del ingreso neto mensual
- **Gastos Hormiga**: 10% del ingreso neto mensual
- **Gastos Medios**: 10% del ingreso neto mensual
- **Gastos Excepcionales**: 10% del ingreso neto mensual
- **Movimientos de Caja**: Sin tope (null)
- **Operaciones Recurrentes**: Sin tope (null)

**Nota**: Solo las categorías con tope configurado mostrarán pills de alerta (ámbar/rojo) cuando se acerquen o superen el límite.

### Notas Importantes sobre la Estructura de Datos

1. **Prioridad de categorización**: 
   - Si existe `categoriaUsuario`, usar esa para cálculos
   - Si no existe, usar `categoria`
   - Función helper: `getCategoriaEfectiva(op)`

2. **Operaciones vinculadas**:
   - Si `vinculadaARecurrente === true`, NO incluir en cálculos de saldo para evitar duplicados
   - Solo mostrar en la sección de "Operaciones Recurrentes"

3. **Operaciones atrasadas**:
   - Si `esAtrasada === true`, mostrar en sección especial "Pagos Atrasados"
   - Incluir en cálculo de "Por Pagar"

4. **Distribución TD/TC**:
   - 60% de operaciones con `tipoProducto: 'TD'`
   - 40% de operaciones con `tipoProducto: 'TC'`
   - Mantener esta proporción en cada mes

5. **Clasificación automática de gastos**:
   - El campo `tipoGasto` se calcula automáticamente usando la fórmula del servicio
   - No es necesario incluirlo en el JSON si se prefiere calcularlo en runtime

## Implementation Notes

### Orden de Implementación Sugerido

1. **Fase 1: Estructura Base**
   - Crear proyecto Angular
   - Configurar routing básico
   - Implementar MobileContainerComponent
   - Configurar variables SCSS
   - Organizar estructura de assets

2. **Fase 2: Servicios y Mock Data**
   - Crear interfaces TypeScript
   - Implementar servicios con fallback
   - Crear archivos JSON de datos mock
   - Configurar environments

3. **Fase 3: Componentes Compartidos**
   - ButtonComponent
   - CardComponent
   - ChatMessageComponent
   - AlertCardComponent
   - RewardCardComponent
   - FloatingButtonComponent

4. **Fase 4: Features (según lleguen HTMLs)**
   - HomeModule
   - ChatModule
   - AlertasModule
   - RecompensasModule
   - PlanAhorrosModule

5. **Fase 5: Integración y Pulido**
   - Animaciones
   - Estados de carga
   - Manejo de errores
   - Testing manual
   - Deploy a Vercel

### Consideraciones Técnicas

#### Angular Standalone Components

Usar standalone components para simplificar:

```typescript
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatMessageComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent { }
```

#### RxJS Patterns

Mantener patrones simples:

```typescript
// ✅ Simple y claro
this.chatService.sendMessage(text)
  .subscribe(response => {
    this.messages.push(response);
  });

// ❌ Evitar complejidad innecesaria
this.chatService.sendMessage(text)
  .pipe(
    switchMap(response => this.processResponse(response)),
    tap(processed => this.cache.set(processed)),
    shareReplay(1)
  )
  .subscribe(/* ... */);
```

#### State Management

Sin NgRx, usar servicios con BehaviorSubject:

```typescript
@Injectable({ providedIn: 'root' })
export class ChatStateService {
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  messages$ = this.messagesSubject.asObservable();
  
  addMessage(message: ChatMessage) {
    const current = this.messagesSubject.value;
    this.messagesSubject.next([...current, message]);
  }
}
```

### Troubleshooting Common Issues

#### Issue: Marco de celular no se centra en desktop
**Solución**: Verificar que el contenedor padre tenga `display: flex` y `justify-content: center`

#### Issue: Datos mock no se cargan
**Solución**: Verificar que `useMockData: true` en environment y que los archivos JSON estén en `assets/data/`

#### Issue: Estilos no se aplican
**Solución**: Verificar que las variables SCSS estén importadas en cada componente

#### Issue: Routing no funciona en Vercel
**Solución**: Verificar que `vercel.json` tenga la configuración de fallback a `index.html`


## Future Enhancements

### Cuando se conecten APIs Reales

1. **Actualizar servicios**
   - Reemplazar URLs mock con endpoints reales
   - Ajustar interfaces si la estructura de datos difiere
   - Mantener fallback para desarrollo local

2. **Autenticación**
   - Implementar login/logout
   - Guardar tokens en localStorage
   - Añadir guards a rutas protegidas

3. **WebSockets para chat en tiempo real**
   - Reemplazar polling con WebSocket
   - Notificaciones push

4. **Analytics**
   - Integrar Google Analytics
   - Trackear interacciones del usuario
   - Medir conversiones

### Mejoras Opcionales

1. **PWA**
   - Añadir service worker
   - Soporte offline
   - Instalable en móvil

2. **Internacionalización**
   - Soporte para múltiples idiomas
   - Usar @angular/localize

3. **Animaciones avanzadas**
   - Transiciones entre vistas
   - Micro-interacciones

4. **Optimizaciones**
   - Lazy loading de módulos
   - Preloading strategies
   - Virtual scrolling para listas largas

## Conclusion

Este diseño prioriza:

✅ **Simplicidad** - Código directo y fácil de entender
✅ **Mantenibilidad** - Assets organizados y bien documentados
✅ **Flexibilidad** - Preparado para APIs reales sin refactorización mayor
✅ **Rapidez de desarrollo** - Componentes reutilizables y mock data lista
✅ **Deploy sencillo** - Configuración lista para Vercel

El proyecto está diseñado para que un desarrollador frontend pueda:
- Entender el código rápidamente
- Hacer cambios sin miedo a romper cosas
- Reemplazar assets fácilmente
- Conectar APIs cuando estén listas
- Debuggear problemas de manera sencilla

La arquitectura es suficientemente robusta para una PoC pero evita complejidad innecesaria que dificultaría el mantenimiento.


## Layout y Scroll Architecture

### Estructura de Contenedores

Todas las vistas de la aplicación siguen una estructura consistente para asegurar que el scroll funcione correctamente y todos los elementos de navegación permanezcan dentro del marco del celular:

```
mobile-container (position: relative, overflow: hidden, height: 100%)
└── feature-container (position: relative, display: flex, flex-direction: column, height: 100%, overflow: hidden)
    ├── pull-down-handle (position: relative, flex-shrink: 0) [opcional]
    ├── header (flex-shrink: 0, z-index: 10)
    ├── content (flex: 1, overflow-y: auto, overflow-x: hidden)
    │   └── scrollable-content (padding-bottom: 80-100px)
    ├── floating-button (position: absolute, bottom: 80px, right: 16px) [opcional]
    └── bottom-navigation (position: absolute, bottom: 0, flex-shrink: 0, height: 64px)
```

### Reglas de Posicionamiento

#### 1. Contenedor Principal de Vista
```scss
.feature-container {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden; // CRÍTICO: evita que el contenido se salga del marco
  background-color: var(--color-bg-light);
}
```

#### 2. Header
```scss
.feature-header {
  flex-shrink: 0; // No se encoge durante el scroll
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background-color: var(--color-bg-light);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
```

#### 3. Contenido Scrolleable
```scss
.feature-content {
  flex: 1; // Ocupa todo el espacio disponible
  overflow-y: auto; // Permite scroll vertical
  overflow-x: hidden; // Evita scroll horizontal
  -webkit-overflow-scrolling: touch; // Scroll suave en iOS
}

.scrollable-content {
  padding: 1rem;
  padding-bottom: 100px; // Espacio para bottom nav + botón flotante
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
```

#### 4. Bottom Navigation
```scss
.bottom-navigation {
  position: absolute; // Posición absoluta relativa al contenedor padre
  bottom: 0;
  left: 0;
  width: 100%;
  height: 64px;
  background-color: var(--color-bg-primary);
  border-top: 1px solid var(--color-border-light);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 20;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  flex-shrink: 0; // No se encoge
}
```

#### 5. Botón Flotante
```scss
.floating-button {
  position: absolute; // Posición absoluta relativa al contenedor padre
  bottom: 80px; // Justo encima del bottom nav (64px + 16px spacing)
  right: 16px;
  z-index: 40;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
```

#### 6. Pull-Down Handle
```scss
.pull-down-handle {
  position: relative; // Parte del flujo normal del documento
  z-index: 30;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: var(--color-white);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  flex-shrink: 0; // No se encoge
  cursor: grab;
  user-select: none;
}
```

### Comportamiento de Scroll

1. **Scroll Vertical**: Solo el contenido principal (`.feature-content`) tiene scroll vertical
2. **Elementos Fijos**: Header y bottom navigation permanecen visibles en todo momento
3. **Padding Bottom**: El contenido scrolleable tiene padding-bottom suficiente para que el último elemento no quede oculto detrás del bottom navigation
4. **Smooth Scrolling**: Se aplica `-webkit-overflow-scrolling: touch` para iOS
5. **Overflow Hidden**: El contenedor principal tiene `overflow: hidden` para evitar que elementos se salgan del marco

### Casos Especiales

#### Home Component
- Incluye botón flotante de chat (chanchito verde)
- Padding-bottom: 100px (64px nav + 16px spacing + 20px extra)

#### Plan de Ahorros Component
- Incluye pull-down handle en la parte superior
- Padding-bottom: 80px (64px nav + 16px spacing)
- Header no es sticky, es parte del flujo normal

#### Chat Component
- Incluye pull-down handle en la parte superior
- Input de chat fijo en la parte inferior (encima del bottom nav)
- Padding-bottom ajustado para el input

#### Alertas Component
- Incluye pull-down handle en la parte superior
- Filtros sticky debajo del header
- Padding-bottom: 80px

### Testing de Layout

Para verificar que el layout funciona correctamente:

1. **Scroll Test**: Hacer scroll hasta el final del contenido y verificar que el último elemento es visible
2. **Bottom Nav Test**: Verificar que el bottom navigation está siempre visible en la parte inferior
3. **Floating Button Test**: Verificar que el botón flotante está dentro del marco del celular
4. **Header Test**: Verificar que el header no se encoge durante el scroll
5. **Pull-Down Test**: Verificar que el pull-down handle arrastra toda la vista, no solo el componente

### Errores Comunes a Evitar

1. ❌ **NO usar `position: fixed` en elementos dentro del contenedor móvil** - Esto los saca del marco
2. ❌ **NO usar `position: sticky` sin `flex-shrink: 0`** - Puede causar problemas de tamaño
3. ❌ **NO olvidar `overflow: hidden` en el contenedor principal** - El contenido se saldrá del marco
4. ❌ **NO olvidar `padding-bottom` en el contenido scrolleable** - El último elemento quedará oculto
5. ❌ **NO usar `height: 100vh` en elementos internos** - Usar `height: 100%` relativo al padre
6. ❌ **NO olvidar `-webkit-overflow-scrolling: touch`** - El scroll no será suave en iOS

