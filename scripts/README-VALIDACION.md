# Guía de Validación de Cálculos

## Script de Validación

El script `validar-calculos-plan.js` valida todos los cálculos críticos del plan de ahorros.

### Ejecutar Validación

```bash
node scripts/validar-calculos-plan.js
```

### Tests Incluidos

1. **Cálculo de Saldo Actual** (Requirements 31, 40)
   - Verifica la fórmula: `saldoInicial + ingresos + operacionesRegulares + gastos + movimientosCaja + cargaFinanciera`
   - Confirma que operaciones vinculadas se excluyen correctamente

2. **Cálculo de Por Pagar** (Requirements 32, 36)
   - Verifica suma de operaciones pendientes
   - Confirma inclusión de operaciones atrasadas

3. **Clasificación de Gastos** (Requirements 40, 46)
   - Verifica fórmula automática:
     - Hormiga: ≤ 20% ingreso diario
     - Medio: ≤ 50% ingreso diario
     - Excepcional: > 50% ingreso diario

4. **Pills de Alerta** (Requirements 45, 46)
   - Verifica que pills se aplican solo al total (TD + TC)
   - Verifica estados: Normal (<90%), Warning (90-100%), Danger (>100%)

5. **Pills Solo con Tope** (Requirement 46)
   - Verifica que pills solo aparecen en categorías con tope configurado

### Salida Esperada

```
✓ Cálculo de Saldo Actual (excluye vinculadas)
✓ Cálculo de Por Pagar (incluye atrasadas)
✓ Clasificación de Gastos (fórmula automática)
✓ Pills de Alerta en Totales
✓ Pills Solo en Categorías con Tope

✓ TODOS LOS TESTS PASARON EXITOSAMENTE
```

### Documentación Completa

Ver `VALIDATION_CALCULOS_PLAN.md` para resultados detallados con tablas y ejemplos.

### Datos de Prueba

El script usa los datos JSON en:
- `src/assets/data/DataEstatica/configuracion-plan.json`
- `src/assets/data/DataEstatica/operaciones/*.json`

### Código Fuente

La implementación validada está en:
- `src/app/core/services/plan-ahorros.service.ts`
- `src/app/core/models/operacion-financiera.interface.ts`
- `src/app/core/models/configuracion-plan.interface.ts`
- `src/app/core/models/plan-ahorros.interface.ts`
