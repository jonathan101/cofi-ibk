# Implementation Plan: Project Setup

- [ ] 1. Crear proyecto Angular y estructura base
  - Ejecutar `ng new cofi-ibk --standalone --routing --style=scss`
  - Crear estructura de carpetas: core/, features/, shared/
  - Configurar TypeScript strict mode
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2. Configurar herramientas de desarrollo
  - Instalar y configurar ESLint
  - Instalar y configurar Prettier
  - Crear scripts de npm para linting y formatting
  - Configurar pre-commit hooks con Husky
  - _Requirements: 1.4_

- [ ] 3. Implementar Design System base
- [ ] 3.1 Crear tokens de diseño
  - Crear archivo `_tokens.scss` con colores, espaciados, tipografía
  - Crear mixins para dark mode
  - _Requirements: 2.3_

- [ ] 3.2 Implementar BaseLayoutComponent
  - Crear componente con header, content, footer slots
  - Implementar estilos con scroll correcto
  - Agregar inputs para configuración
  - _Requirements: 2.1_

- [ ] 3.3 Crear componentes UI base
  - Implementar ButtonComponent
  - Implementar CardComponent
  - Implementar ModalComponent
  - Implementar InputComponent
  - _Requirements: 2.2_

- [ ] 3.4 Implementar soporte de dark mode
  - Crear servicio ThemeService
  - Implementar toggle de tema
  - Persistir preferencia en localStorage
  - _Requirements: 2.4_

- [ ] 4. Configurar entornos
- [ ] 4.1 Crear archivos de configuración
  - Crear `environment.development.ts`
  - Crear `environment.staging.ts`
  - Crear `environment.production.ts`
  - _Requirements: 3.1_

- [ ] 4.2 Implementar abstracción de API
  - Crear interfaz abstracta `ApiService`
  - Crear `ApiMockService` para desarrollo
  - Crear `ApiHttpService` para producción
  - Configurar provider basado en environment
  - _Requirements: 3.2, 3.3_

- [ ] 4.3 Configurar variables de entorno
  - Agregar URLs de API a environments
  - Agregar feature flags
  - _Requirements: 3.4_

- [ ] 5. Configurar testing
- [ ] 5.1 Setup unit testing
  - Configurar Karma/Jasmine
  - Crear helpers de testing
  - Configurar coverage threshold
  - _Requirements: 4.1, 4.3_

- [ ] 5.2 Setup E2E testing
  - Instalar Cypress o Playwright
  - Crear estructura de tests E2E
  - Configurar fixtures y helpers
  - _Requirements: 4.2_

- [ ] 5.3 Configurar CI/CD
  - Crear workflow de GitHub Actions o similar
  - Agregar steps para linting, testing, build
  - Configurar deployment automático
  - _Requirements: 4.4_

- [ ] 6. Documentación inicial
  - Crear README.md con instrucciones de setup
  - Crear docs/architecture/overview.md
  - Crear docs/development/getting-started.md
  - Documentar decisiones arquitectónicas (ADRs)
  - _Requirements: All_
