# Requisitos para la Narrativa de Ahorro

## Objetivo

Los datos del sistema deben mostrar una **narrativa realista de ahorro** con altibajos, donde el usuario:
- Algunos meses logra la meta de ahorro
- Otros meses no llega a la meta
- Hay meses donde baja un poco
- Se recupera en meses posteriores

## Requisitos de Validación

### 1. Variabilidad en el Ahorro (OBLIGATORIO)

La narrativa DEBE mostrar variabilidad en los resultados mensuales:

- ✅ **Al menos 1 mes** debe superar la meta de ahorro (≥ S/ 800)
- ❌ **Al menos 1 mes** debe no llegar a la meta (< S/ 640, que es el 80% de la meta)
- ⚠️ **Puede haber meses** cerca de la meta (entre S/ 640 y S/ 800)

**Validación**:
```javascript
if (mesesSuperaMeta > 0 && (mesesNoLlega > 0 || mesesCerca > 0)) {
  // ✓ La narrativa muestra altibajos realistas
}
```

### 2. Progreso General Positivo (OBLIGATORIO)

A pesar de los altibajos, DEBE haber un progreso general positivo:

- El saldo final del último mes DEBE ser mayor que el saldo inicial del primer mes
- El ahorro promedio mensual DEBE ser positivo

**Validación**:
```javascript
const progresoTotal = saldoFinalNoviembre - saldoInicialAgosto;
if (progresoTotal > 0) {
  // ✓ Hay progreso general positivo
}
```

### 3. Consistencia entre Meses (OBLIGATORIO)

Los saldos DEBEN ser consistentes entre meses consecutivos:

- `saldoInicial(Mes N) = saldoFinal(Mes N-1)`
- Los saldos NUNCA pueden ser negativos (≥ 0)

**Validación**:
```javascript
for (let i = 1; i < meses.length; i++) {
  const diferencia = Math.abs(meses[i].saldoInicial - meses[i-1].saldoFinal);
  if (diferencia > 0.01) {
    // ✗ Inconsistencia detectada
  }
}
```

### 4. Operaciones Atrasadas (OPCIONAL)

Cuando no hay suficiente saldo para pagar una operación:

- La operación se marca como `estado: 'pendiente'`
- Se marca como `esAtrasada: true`
- Se registra el `mesOriginal`
- NO afecta el saldo hasta que se pague

## Ejemplo de Narrativa Válida

### Escenario: 4 meses con meta de S/ 800/mes

| Mes | Saldo Inicial | Saldo Final | Ahorro | Estado | Cumple Requisito |
|-----|---------------|-------------|--------|--------|------------------|
| Agosto | S/ 4,000 | S/ 4,900 | S/ 900 | ✅ Supera meta | ✓ Variabilidad |
| Septiembre | S/ 4,900 | S/ 5,200 | S/ 300 | ❌ No llega | ✓ Variabilidad |
| Octubre | S/ 5,200 | S/ 5,850 | S/ 650 | ⚠️ Cerca | ✓ Recuperación |
| Noviembre | S/ 5,850 | S/ 6,850 | S/ 1,000 | ✅ Supera meta | ✓ Variabilidad |

**Resultados**:
- ✓ Variabilidad: 2 meses superan, 1 no llega, 1 cerca
- ✓ Progreso: S/ 2,850 total (S/ 712.50 promedio/mes)
- ✓ Consistencia: Todos los saldos iniciales = saldos finales anteriores
- ✓ Saldos positivos: Todos los saldos ≥ 0

## Implementación en el Código

### Service (plan-ahorros.service.ts)

```typescript
private obtenerSaldoInicialMes(mes: string): number {
  const saldosIniciales: { [key: string]: number } = {
    'Agosto 2024': 4000,      // Inicio
    'Septiembre 2024': 4900,  // +900 (supera meta)
    'Octubre 2024': 5200,     // +300 (no llega)
    'Noviembre 2024': 5850    // +650 (cerca)
  };
  return saldosIniciales[mes] || 4000;
}

private calcularSaldoFinalMes(operaciones, saldoInicial): number {
  // Para PoC: saldos predefinidos con narrativa
  if (saldoInicial === 4000) return 4900;   // Agosto
  if (saldoInicial === 4900) return 5200;   // Septiembre
  if (saldoInicial === 5200) return 5850;   // Octubre
  if (saldoInicial === 5850) return 6850;   // Noviembre
  
  // Fallback: cálculo real
  return calcularBasadoEnOperaciones(operaciones, saldoInicial);
}
```

### Script de Validación

```javascript
// Validar variabilidad
let mesesSuperaMeta = 0;
let mesesNoLlega = 0;
let mesesCerca = 0;

ahorrosPorMes.forEach(dato => {
  if (dato.ahorro >= META_AHORRO) mesesSuperaMeta++;
  else if (dato.ahorro >= META_AHORRO * 0.8) mesesCerca++;
  else mesesNoLlega++;
});

// Debe haber variabilidad
assert(mesesSuperaMeta > 0 && (mesesNoLlega > 0 || mesesCerca > 0));

// Debe haber progreso general
const progresoTotal = saldoFinal - saldoInicial;
assert(progresoTotal > 0);
```

## Beneficios de esta Narrativa

1. **Realismo**: Refleja el comportamiento real de ahorro de las personas
2. **Engagement**: Muestra que es normal tener altibajos
3. **Motivación**: Demuestra que a pesar de los tropiezos, hay progreso
4. **Educación**: Enseña que el ahorro es un proceso con variabilidad
5. **Validación**: Permite probar diferentes escenarios en la UI

## Notas para Producción

En un sistema real:

- Los saldos se calcularían basándose en operaciones reales de la API
- La narrativa emergerá naturalmente del comportamiento del usuario
- El sistema debe manejar tanto casos de éxito como de dificultad
- Las validaciones deben ejecutarse en el backend para garantizar consistencia
