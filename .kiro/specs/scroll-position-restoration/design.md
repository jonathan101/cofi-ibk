# Design Document: Scroll Position Restoration

## Overview

Esta funcionalidad implementa un sistema de preservación de posición de scroll para la aplicación Angular utilizando las capacidades nativas del Router de Angular. La solución aprovecha la configuración `scrollPositionRestoration` del Router y un servicio personalizado para gestionar el estado del scroll de manera más granular cuando sea necesario.

La aplicación actualmente utiliza Angular standalone components con lazy loading, por lo que la solución debe ser compatible con esta arquitectura y no interferir con la carga dinámica de componentes.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    App Config                            │
│  - Router Configuration                                  │
│  - Scroll Strategy Setup                                 │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│              Router with Scroll Config                   │
│  - scrollPositionRestoration: 'enabled'                  │
│  - anchorScrolling: 'enabled'                            │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│           ScrollPositionService                          │
│  - Store scroll positions per route                      │
│  - Restore positions on navigation                       │
│  - Handle edge cases (dynamic content)                   │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│              Individual Components                       │
│  - Optional: Custom scroll behavior                      │
│  - Optional: Disable restoration per route               │
└─────────────────────────────────────────────────────────┘
```

### Strategy Selection

Angular Router ofrece dos estrategias principales para manejar el scroll:

1. **Native Router Strategy** (`scrollPositionRestoration: 'enabled'`): Utiliza el historial del navegador para restaurar posiciones
2. **Custom Service Strategy**: Control manual completo sobre el scroll

**Problema identificado**: La estrategia nativa causa flickering visible - la vista se carga en posición 0 y luego salta a la posición guardada, creando una experiencia visual pobre.

**Decisión de diseño**: Utilizaremos una **estrategia completamente personalizada**:
- Deshabilitar la restauración nativa del Router (`scrollPositionRestoration: 'disabled'`)
- Implementar servicio personalizado con control total del timing
- Usar `ViewportScroller` de Angular para scroll programático
- Restaurar scroll DESPUÉS de que el contenido esté completamente renderizado usando `afterNextRender()`

**Justificación del cambio**:
- Elimina el flickering al controlar exactamente cuándo se restaura el scroll
- Permite esperar a que el contenido dinámico y lazy-loaded esté listo
- Mayor control sobre el timing y la experiencia visual
- Evita el "salto" visible que ocurre con la estrategia nativa

## Components and Interfaces

### 1. Router Configuration (app.config.ts)

**Responsabilidad**: Configurar el comportamiento global del scroll en el Router

```typescript
interface RouterScrollConfig {
  scrollPositionRestoration: 'disabled' | 'enabled' | 'top';
  anchorScrolling?: 'disabled' | 'enabled';
  scrollOffset?: [number, number] | (() => [number, number]);
}
```

**Configuración propuesta**:
```typescript
provideRouter(
  routes,
  withInMemoryScrolling({
    scrollPositionRestoration: 'disabled', // Deshabilitado para evitar flickering
    anchorScrolling: 'enabled'
  })
)
```

### 2. ScrollPositionService

**Responsabilidad**: Gestionar el almacenamiento y restauración de posiciones de scroll para casos especiales

```typescript
interface ScrollPosition {
  x: number;
  y: number;
  timestamp: number;
}

interface RouteScrollState {
  [routeKey: string]: ScrollPosition;
}

@Injectable({ providedIn: 'root' })
class ScrollPositionService {
  // Almacena posiciones de scroll por ruta
  private scrollPositions: Map<string, ScrollPosition>;
  
  // ViewportScroller para scroll programático
  private viewportScroller: ViewportScroller;
  
  // Guarda la posición actual del scroll antes de navegar
  saveScrollPosition(routeKey: string): void;
  
  // Restaura la posición del scroll DESPUÉS de renderizar
  restoreScrollPosition(routeKey: string): void;
  
  // Restaura usando afterNextRender para evitar flickering
  private restoreAfterRender(position: ScrollPosition): void;
  
  // Limpia posiciones antiguas (opcional, para gestión de memoria)
  clearOldPositions(maxAge: number): void;
  
  // Genera una clave única para la ruta actual
  private generateRouteKey(url: string): string;
  
  // Inicializa listeners de navegación del Router
  private initializeRouterListeners(): void;
}
```

### 3. ScrollRestorationDirective (Opcional)

**Responsabilidad**: Permitir control fino del scroll a nivel de componente

```typescript
@Directive({
  selector: '[appScrollRestoration]',
  standalone: true
})
class ScrollRestorationDirective {
  @Input() scrollRestoration: 'enabled' | 'disabled' = 'enabled';
  @Input() scrollDelay: number = 0;
  
  // Maneja el comportamiento de scroll específico del componente
}
```

### 4. Route Data Configuration

**Responsabilidad**: Permitir configuración por ruta

```typescript
interface RouteScrollData {
  scrollRestoration?: boolean;
  scrollDelay?: number;
  scrollContainer?: string; // Selector del contenedor de scroll
}

// Ejemplo de uso en routes
{
  path: 'plan-ahorros',
  data: { 
    scrollRestoration: true,
    scrollDelay: 100 
  },
  loadChildren: () => import('./features/plan-ahorros/plan-ahorros.routes')
}
```

## Data Models

### ScrollPosition

```typescript
interface ScrollPosition {
  x: number;              // Posición horizontal
  y: number;              // Posición vertical
  timestamp: number;      // Timestamp de cuando se guardó
}
```

### RouteScrollConfig

```typescript
interface RouteScrollConfig {
  enabled: boolean;           // Si está habilitada la restauración
  delay: number;              // Delay antes de restaurar (ms)
  container?: HTMLElement;    // Contenedor específico de scroll
  waitForContent: boolean;    // Esperar a que el contenido cargue
}
```

## Error Handling

### Casos de Error

1. **Contenido no disponible**: La posición guardada ya no es válida
   - **Solución**: Scroll a la posición más cercana válida o al inicio

2. **Contenido dinámico no cargado**: Se intenta restaurar antes de que el contenido esté listo
   - **Solución**: Usar `afterNextRender()` o `setTimeout()` con delay configurable

3. **Múltiples contenedores de scroll**: Componente con scroll interno
   - **Solución**: Permitir especificar el contenedor mediante configuración

4. **Navegación rápida**: Usuario navega antes de que se complete la restauración
   - **Solución**: Cancelar restauraciones pendientes

### Error Recovery Strategy

```typescript
class ScrollRestorationError extends Error {
  constructor(
    message: string,
    public routeKey: string,
    public position: ScrollPosition
  ) {
    super(message);
  }
}

// En el servicio
private handleRestorationError(error: ScrollRestorationError): void {
  console.warn('Scroll restoration failed:', error);
  // Fallback: scroll al inicio
  window.scrollTo(0, 0);
}
```

## Testing Strategy

### Unit Tests

1. **ScrollPositionService**
   - Guardar posición correctamente
   - Restaurar posición correctamente
   - Generar claves de ruta únicas
   - Limpiar posiciones antiguas
   - Manejar rutas no existentes

2. **Router Configuration**
   - Verificar que la configuración se aplica correctamente
   - Verificar que las opciones de scroll están habilitadas

### Integration Tests

1. **Navegación básica**
   - Navegar de A → B → A y verificar scroll restaurado
   - Navegar entre múltiples rutas y verificar cada restauración

2. **Contenido dinámico**
   - Verificar restauración con lazy loaded components
   - Verificar restauración con listas que cargan datos async

3. **Edge cases**
   - Contenido más corto que la posición guardada
   - Navegación rápida entre rutas
   - Refresh de página (no debe restaurar)

### Manual Testing Checklist

- [ ] Scroll en home, navegar a plan-ahorros, regresar → posición restaurada
- [ ] Scroll en lista de movimientos, ver detalle, regresar → posición restaurada
- [ ] Navegar A → B → C → B → A → verificar cada posición
- [ ] Probar en móvil (viewport pequeño)
- [ ] Probar en desktop (viewport grande)
- [ ] Probar con contenido dinámico (listas largas)
- [ ] Probar navegación rápida (clicks múltiples)

## Implementation Phases

### Phase 1: Basic Router Configuration
- Configurar `scrollPositionRestoration` en app.config.ts
- Probar comportamiento básico con rutas principales
- Validar que funciona con lazy loading

### Phase 2: Custom Service for Edge Cases
- Crear ScrollPositionService
- Implementar guardado y restauración manual
- Integrar con Router events

### Phase 3: Component-Level Control
- Implementar configuración por ruta (route data)
- Crear directiva opcional para control fino
- Documentar cómo deshabilitar por ruta

### Phase 4: Testing and Refinement
- Implementar tests unitarios
- Realizar testing manual exhaustivo
- Ajustar delays y configuraciones según resultados

## Performance Considerations

1. **Memory Management**
   - Limitar número de posiciones guardadas (últimas 20 rutas)
   - Limpiar posiciones al cerrar sesión

2. **Restoration Timing**
   - Usar `afterNextRender()` para evitar flickering
   - Delay mínimo de 50ms para contenido dinámico

3. **Browser Compatibility**
   - Verificar soporte de `scrollRestoration` API
   - Fallback para navegadores antiguos

## Configuration Examples

### Global Configuration (Recommended)

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'disabled', // Deshabilitado - usamos servicio custom
        anchorScrolling: 'enabled'
      })
    ),
    // ScrollPositionService se auto-inicializa via providedIn: 'root'
  ]
};
```

### Per-Route Configuration

```typescript
// app.routes.ts
{
  path: 'plan-ahorros',
  data: { scrollRestoration: false }, // Deshabilitar para esta ruta
  loadChildren: () => import('./features/plan-ahorros/plan-ahorros.routes')
}
```

### Component-Level Override

```typescript
// En un componente específico
export class MyComponent implements OnInit {
  constructor(private scrollService: ScrollPositionService) {}
  
  ngOnInit() {
    // Deshabilitar restauración para este componente
    this.scrollService.disableForCurrentRoute();
  }
}
```
