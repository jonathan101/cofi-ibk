# Getting Started with Specs

## 🎯 Objetivo

Este documento te guía paso a paso sobre cómo usar los specs para construir el proyecto de manera ordenada e incremental.

## 📖 Orden de Implementación

### Semana 1: Fundación
```bash
# 1. Setup del proyecto
cd .kiro/specs/00-project-setup
# Leer requirements.md, design.md, tasks.md
# Ejecutar tareas en orden

# 2. Autenticación (si aplica)
cd ../01-authentication
# Seguir mismo proceso

# 3. Navegación base
cd ../02-navigation
# Seguir mismo proceso
```

### Semana 2-3: Core Features
```bash
# 4. Capa de datos
cd ../10-data-layer
# Implementar servicios de API, state management

# 5. Core del plan de ahorros
cd ../11-plan-ahorros-core
# Modelos, cálculos, validaciones

# 6. UI del plan de ahorros
cd ../12-plan-ahorros-ui
# Vista principal
```

### Semana 4-5: Features Principales
```bash
# Implementar en paralelo (si tienes equipo) o secuencialmente:
cd ../20-gastos-management
cd ../21-movimientos-caja
cd ../22-operaciones-recurrentes
cd ../23-carga-financiera
cd ../24-chanchitos-ahorro
```

## 🔄 Workflow por Spec

### 1. Leer y Entender

```bash
# Navegar al spec
cd .kiro/specs/[número]-[nombre]

# Leer en orden:
cat requirements.md    # Entender QUÉ se necesita
cat design.md         # Entender CÓMO se implementará
cat tasks.md          # Entender los PASOS específicos
```

### 2. Preparar Ambiente

```bash
# Crear branch
git checkout -b feature/[número]-[nombre]

# Asegurarse que dependencias estén instaladas
npm install
```

### 3. Implementar Tareas

```bash
# Para cada tarea en tasks.md:

# 1. Marcar como "in progress" (opcional, si usas herramienta)
# 2. Implementar la tarea
# 3. Escribir tests (si no está marcada con *)
# 4. Verificar que funciona
# 5. Commit
git add .
git commit -m "feat([número]): [descripción de la tarea]"

# 6. Marcar como "completed"
```

### 4. Testing

```bash
# Ejecutar tests unitarios
npm run test

# Ejecutar tests E2E (si aplica)
npm run e2e

# Verificar coverage
npm run test:coverage
```

### 5. Review y Merge

```bash
# Push del branch
git push origin feature/[número]-[nombre]

# Crear Pull Request
# Esperar review
# Hacer ajustes si es necesario
# Merge a main/develop
```

## 📝 Ejemplo Práctico: Implementar Gastos Management

### Paso 1: Leer Requirements

```bash
cd .kiro/specs/20-gastos-management
cat requirements.md
```

**Puntos clave a identificar:**
- 5 requirements principales
- User stories claras
- Acceptance criteria medibles

### Paso 2: Estudiar Design

```bash
cat design.md
```

**Puntos clave a identificar:**
- Arquitectura de 3 niveles
- Componentes necesarios
- Modelos de datos
- Flujo de navegación

### Paso 3: Ejecutar Tasks

```bash
cat tasks.md
```

**Orden de ejecución:**

```bash
# Task 1: Modelos
touch src/app/features/plan-ahorros/models/gasto.model.ts
# Implementar tipos e interfaces
git commit -m "feat(20): add gasto models and types"

# Task 2.1: Servicio base
touch src/app/features/plan-ahorros/services/gastos.service.ts
# Crear estructura del servicio
git commit -m "feat(20): create gastos service"

# Task 2.2: Cálculo de resumen
# Implementar método getResumenGastos()
git commit -m "feat(20): implement resumen gastos calculation"

# ... continuar con cada tarea
```

### Paso 4: Verificar Implementación

```bash
# Verificar que cumple requirements
# ✅ Requirement 1.1: Muestra 4 tipos de gastos
# ✅ Requirement 1.2: Muestra monto total
# ✅ Requirement 1.3: Muestra desglose TD/TC
# ... etc

# Ejecutar tests
npm run test -- --include="**/gastos.service.spec.ts"

# Probar manualmente en el navegador
npm start
```

## 🎨 Tips para Mantener Orden

### 1. Un Spec a la Vez
No saltes entre specs. Completa uno antes de empezar otro.

### 2. Commits Pequeños
Haz commit después de cada tarea completada, no al final del spec.

### 3. Tests Primero (cuando sea posible)
```typescript
// Escribir test primero
it('should calculate resumen gastos correctly', () => {
  // Arrange
  const operaciones = [...];
  
  // Act
  const resumen = service.getResumenGastos(operaciones);
  
  // Assert
  expect(resumen.cobrosAutomaticos.total).toBe(230);
});

// Luego implementar para que pase
```

### 4. Documentar Decisiones
Si tomas una decisión que difiere del design, documéntala:

```markdown
## Architecture Decision Record (ADR)

### Decision: Usar Signals en lugar de BehaviorSubject

**Context:** El design original sugería BehaviorSubject para state management.

**Decision:** Usar Angular Signals (v16+) en su lugar.

**Consequences:**
- Mejor performance
- Código más simple
- Mejor integración con Angular
```

### 5. Actualizar Specs si es Necesario
Si descubres que algo del spec no funciona:

1. Implementa una solución temporal
2. Documenta el problema
3. Actualiza el spec
4. Notifica al equipo

## 🚀 Comandos Útiles

```bash
# Ver todos los specs
ls -la .kiro/specs/

# Buscar un requirement específico
grep -r "User Story" .kiro/specs/

# Ver progreso de un spec
cat .kiro/specs/20-gastos-management/tasks.md | grep "\[x\]"

# Generar reporte de progreso
find .kiro/specs -name "tasks.md" -exec grep -l "\[x\]" {} \;
```

## 📚 Recursos Adicionales

- [EARS Syntax Guide](https://alistairmavin.com/ears/)
- [Angular Style Guide](https://angular.io/guide/styleguide)
- [Testing Best Practices](../../docs/development/testing-guide.md)
- [Git Workflow](../../docs/development/git-workflow.md)

## ❓ FAQ

**Q: ¿Puedo implementar tareas en diferente orden?**
A: Solo si no tienen dependencias. Revisa el design para entender dependencias.

**Q: ¿Qué hago si un requirement no es claro?**
A: Pregunta al equipo, documenta la clarificación, actualiza el spec.

**Q: ¿Debo implementar todas las tareas marcadas con `*`?**
A: No, son opcionales (generalmente tests). Pero se recomienda hacerlas.

**Q: ¿Puedo agregar features no especificadas?**
A: Crea un nuevo spec primero, no agregues features sin documentar.

**Q: ¿Cómo manejo bugs encontrados durante implementación?**
A: Crea un spec de bug-fix o agrégalo como tarea en el spec actual.
