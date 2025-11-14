# Explicación de Saldos y Consistencia Multi-Mes

## Concepto Importante

**Los saldos de cuentas bancarias NUNCA pueden ser negativos.**

Cuando no hay suficiente dinero para pagar una deuda, la operación queda como **PENDIENTE/ATRASADA**, no se ejecuta y por lo tanto no afecta el saldo.

## Flujo de Saldos con Narrativa de Ahorro

**Meta de Ahorro Mensual**: S/ 800

### Agosto 2024 ✅ (Supera la meta)
- **Saldo Inicial**: S/ 4,000 (primer mes del sistema)
- **Saldo Final**: S/ 4,900
- **Ahorro del mes**: S/ 900 (¡Superó la meta en S/ 100!)
- **Resultado**: Buen mes, logró ahorrar más de lo planeado

### Septiembre 2024 ❌ (No llega a la meta)
- **Saldo Inicial**: S/ 4,900 (= Saldo final de Agosto)
- **Saldo Final**: S/ 5,200
- **Ahorro del mes**: S/ 300 (No llegó a la meta, faltaron S/ 500)
- **Resultado**: Mes difícil con gastos inesperados, solo logró ahorrar S/ 300

### Octubre 2024 ⚠️ (Cerca de la meta)
- **Saldo Inicial**: S/ 5,200 (= Saldo final de Septiembre)
- **Saldo Final**: S/ 5,850
- **Ahorro del mes**: S/ 650 (Cerca pero no llegó, faltaron S/ 150)
- **Resultado**: Se está recuperando, logró ahorrar más que el mes anterior

### Noviembre 2024 ✅ (Supera la meta)
- **Saldo Inicial**: S/ 5,850 (= Saldo final de Octubre)
- **Saldo Final**: S/ 6,850
- **Ahorro del mes**: S/ 1,000 (¡Superó la meta en S/ 200!)
- **Resultado**: Excelente mes, logró el mejor ahorro de los 4 meses

## Resumen de la Narrativa

- **Progreso Total**: S/ 2,850 ahorrados en 4 meses
- **Ahorro Promedio**: S/ 712.50/mes
- **Meses que superan la meta**: 2 de 4 (50%)
- **Meses cerca de la meta**: 1 de 4 (25%)
- **Meses que no llegan**: 1 de 4 (25%)

Esta narrativa muestra **altibajos realistas** en el comportamiento de ahorro:
- ✅ Hay meses buenos donde se supera la meta
- ❌ Hay meses difíciles donde no se llega
- ⚠️ Hay meses de recuperación donde se acerca a la meta
- 📈 Hay un progreso general positivo a lo largo del tiempo

## Validación de Consistencia

La regla de validación es:

```
saldoInicial(Mes N) = saldoFinal(Mes N-1)
```

Esto garantiza que no hay "saltos" o inconsistencias en los saldos entre meses.

## Operaciones Pendientes/Atrasadas

Cuando el saldo no es suficiente para pagar una operación:

1. La operación se marca como `estado: 'pendiente'`
2. Se marca como `esAtrasada: true`
3. Se registra el `mesOriginal` de donde proviene
4. **NO afecta el saldo** hasta que se pague

Ejemplo:
```json
{
  "id": "nov-050",
  "fecha": "2024-11-15T10:00:00.000Z",
  "operacion": "Pago tarjeta atrasado",
  "monto": -500,
  "categoria": "pago_financiero",
  "estado": "pendiente",
  "esAtrasada": true,
  "mesOriginal": "Octubre 2024"
}
```

## Cálculo de Saldo Final

```typescript
saldoFinal = saldoInicial + Σ(operaciones PAGADAS del mes)

// Las operaciones pendientes NO se incluyen
// Las operaciones vinculadas a recurrentes NO se incluyen (para evitar duplicados)
// El resultado NUNCA puede ser negativo: Math.max(0, saldoCalculado)
```

## Ejemplo Práctico

Si en Septiembre el saldo es S/ 100 y hay gastos por S/ 150:

**Opción A - Sin protección (INCORRECTO)**:
- Saldo final = 100 - 150 = -50 ❌ (imposible en cuentas reales)

**Opción B - Con protección (CORRECTO)**:
- Saldo disponible: S/ 100
- Se pagan gastos hasta agotar: S/ 100
- Gastos restantes (S/ 50) quedan como PENDIENTES
- Saldo final = 0 ✅
- Operaciones pendientes = S/ 50 (se arrastran al siguiente mes)

## Resumen

✅ **Saldos siempre >= 0**  
✅ **Saldo inicial mes N = Saldo final mes N-1**  
✅ **Operaciones pendientes no afectan el saldo**  
✅ **Operaciones atrasadas se rastrean con flags especiales**  
✅ **El ingreso del sueldo es una operación más del mes**
