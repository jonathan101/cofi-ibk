# Design: Project Setup

## Overview

Este spec establece la fundación del proyecto: estructura de carpetas, componentes base, configuración de herramientas, y patrones arquitectónicos que se usarán en todo el proyecto.

## Architecture

```
cofi-ibk/
├── .kiro/
│   └── specs/                    # Specs organizados por feature
├── docs/                         # Documentación técnica
│   ├── architecture/
│   ├── features/
│   └── development/
├── src/
│   ├── app/
│   │   ├── core/                 # Servicios singleton, guards, interceptors
│   │   ├── features/             # Features modulares
│   │   ├── shared/               # Componentes, pipes, directives reutilizables
│   │   └── app.config.ts
│   ├── assets/
│   │   ├── data/mock/           # Datos mock claramente separados
│   │   ├── styles/              # Estilos globales y tokens
│   │   └── i18n/                # Traducciones
│   └── environments/
└── tests/
    └── e2e/
```

## Components and Interfaces

### BaseLayoutComponent

Componente base que resuelve problemas comunes de layout y scroll:

```typescript
@Component({
  selector: 'app-base-layout',
  template: `
    <div class="base-layout">
      <header class="base-layout__header" *ngIf="showHeader">
        <ng-content select="[header]"></ng-content>
      </header>
      <main class="base-layout__content" [class.with-padding]="contentPadding">
        <ng-content></ng-content>
      </main>
      <footer class="base-layout__footer" *ngIf="showFooter">
        <ng-content select="[footer]"></ng-content>
      </footer>
    </div>
  `
})
export class BaseLayoutComponent {
  @Input() showHeader = true;
  @Input() showFooter = false;
  @Input() contentPadding = true;
}
```

### Design Tokens

```scss
// assets/styles/_tokens.scss
$colors: (
  primary: #00843D,
  secondary: #1C2D3A,
  success: #10B981,
  warning: #F59E0B,
  danger: #EF4444,
  background-light: #F4F4F4,
  background-dark: #101822
);

$spacing: (
  xs: 0.25rem,
  sm: 0.5rem,
  md: 1rem,
  lg: 1.5rem,
  xl: 2rem
);

$typography: (
  font-family: 'Inter, sans-serif',
  font-size-base: 1rem,
  font-weight-normal: 400,
  font-weight-medium: 500,
  font-weight-bold: 700
);
```

## Data Models

### Environment Configuration

```typescript
export interface Environment {
  production: boolean;
  useMock: boolean;
  apiUrl: string;
  features: {
    enableAnalytics: boolean;
    enableLogging: boolean;
  };
}
```

## Error Handling

- Interceptor global para manejo de errores HTTP
- Servicio de logging centralizado
- Toast notifications para errores de usuario

## Testing Strategy

- Unit tests para todos los servicios y componentes
- E2E tests para flujos críticos de usuario
- Visual regression tests para componentes UI
- Coverage mínimo: 80%
