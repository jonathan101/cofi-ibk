# Guía de Testing y Validación

Este documento describe cómo ejecutar las validaciones de cálculos financieros para el proyecto Chicho Chatbot PoC.

## Herramientas de Validación

### 1. Test Suite Jasmine/Karma (Recomendado para CI/CD)

**Descripción**: Suite completa de tests unitarios con 20 test cases que validan todos los requisitos.

**Archivo**: `src/app/core/services/plan-ahorros.service.spec.ts`

**Ejecutar todos los tests**:
```bash
npm test
```

**Ejecutar solo tests de plan-ahorros**:
```bash
npm test -- --include='**/plan-ahorros.service.spec.ts' --browsers=ChromeHeadless --watch=false
```

**Ejecutar en modo watch (desarrollo)**:
```bash
npm test -- --include='**/plan-ahorros.service.spec.ts'
```

### 2. Script de Validación Node.js (Recomendado para validación rápida)

**Descripción**: Script standalone que valida cálculos con datos reales de JSON y muestra resultados coloridos en consola.

**Archivo**: `scripts/validar-calculos.js`

**Ejecutar**:
```bash
node scripts/validar-calculos.js
```

**Ventajas**:
- ✅ No requiere navegador
- ✅ Ejecución rápida (< 1 segundo)
- ✅ Salida colorizada y fácil de leer
- ✅ Valida con datos reales de JSON
- ✅ Muestra detalles de cada cálculo

## Requisitos Validados

### ✅ Requirement 31: Cálculo de Saldo Actual
- Fórmula: `saldoInicial + ingresos + operacionesRegulares + gastos + movimientosCaja + cargaFinanciera`
- Excluye operaciones vinculadas a recurrentes

### ✅ Requirement 32: Cálculo de "Por Pagar"
- Suma operaciones pendientes de Carga Financiera y Operaciones Regulares
- Incluye operaciones atrasadas

### ✅ Requirement 35: Navegación entre Meses
- Carga correcta de operaciones por mes
- Meses disponibles: Agosto, Septiembre, Octubre, Noviembre 2024

### ✅ Requirement 36: Operaciones Atrasadas
- Identificación de operaciones atrasadas del mes anterior
- Inclusión en cálculo de "Por Pagar"

### ✅ Requirement 39: Consistencia Multi-Mes
- Validación de que saldo final mes N = saldo inicial mes N+1
- Detección de inconsistencias

### ✅ Requirement 45: Pills de Alerta
- Cálculo de consumo por tipo de producto (TD/TC)
- Cálculo de porcentaje usado del tope
- Asignación correcta de estado (normal/warning/danger)

## Interpretación de Resultados

### Script de Validación (validar-calculos.js)

**Símbolos**:
- ✓ (verde): Validación exitosa
- ✗ (rojo): Alerta o exceso de tope
- ⚠ (amarillo): Advertencia
- ℹ (cyan): Información

**Estados de Pills**:
- **Normal (< 90%)**: Sin pill, texto normal
- **Ámbar (90-100%)**: Pill amarillo con porcentaje
- **Rojo (> 100%)**: Pill rojo con porcentaje

**Ejemplo de Salida**:
```
Gastos Hormiga:
  Consumo TD: S/ 101.00
  Consumo TC: S/ 198.00
  Total: S/ 299.00
  Tope: S/ 400.00 (10%)
  Porcentaje usado: 74.8%
✓ Estado: Normal (sin pill)
```

### Test Suite Jasmine/Karma

**Salida Esperada**:
```
Chrome Headless: Executed 20 of 20 SUCCESS (X.XXX secs / X.XXX secs)
```

**Si hay fallos**:
- Revisar el mensaje de error específico
- Verificar que los datos JSON estén correctos
- Verificar que la configuración esté actualizada

## Datos de Prueba

Los tests utilizan datos de:
- `src/assets/data/DataEstatica/operaciones/agosto-2024.json`
- `src/assets/data/DataEstatica/operaciones/septiembre-2024.json`
- `src/assets/data/DataEstatica/operaciones/octubre-2024.json`
- `src/assets/data/DataEstatica/operaciones/noviembre-2024.json`
- `src/assets/data/DataEstatica/configuracion-plan.json`

## Troubleshooting

### Error: "Cannot find module"
**Solución**: Ejecutar `npm install` para instalar dependencias

### Error: "Chrome not found"
**Solución**: Usar ChromeHeadless o instalar Chrome
```bash
npm test -- --browsers=ChromeHeadless
```

### Error: "Timeout"
**Solución**: Aumentar timeout en karma.conf.js o usar el script Node.js

### Script no muestra colores en Windows
**Solución**: Usar Windows Terminal o PowerShell 7+ para soporte de colores ANSI

## Integración Continua

Para CI/CD, se recomienda usar el test suite Jasmine/Karma:

```yaml
# Ejemplo para GitHub Actions
- name: Run tests
  run: npm test -- --browsers=ChromeHeadless --watch=false
```

Para validación rápida en pre-commit hooks:

```bash
# Ejemplo para husky
node scripts/validar-calculos.js
```

## Resultados Detallados

Ver `VALIDATION_RESULTS.md` para un reporte completo de las validaciones realizadas.

## Próximos Pasos

1. Ejecutar validaciones después de cada cambio en el servicio
2. Agregar tests para nuevas funcionalidades
3. Mantener cobertura de tests > 80%
4. Documentar casos edge encontrados

---

**Última actualización**: 2024-11-14
