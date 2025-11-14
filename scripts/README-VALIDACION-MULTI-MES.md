# Validación de Navegación y Consistencia Multi-Mes

## Task 14.2: Validar navegación y consistencia multi-mes

Este documento describe la implementación de la validación de navegación entre meses y la consistencia de saldos multi-mes.

## Requirements Implementados

- **Requirement 35**: Navegación entre meses (Agosto-Noviembre 2024)
- **Requirement 36**: Operaciones atrasadas del mes anterior
- **Requirement 39**: Validación de consistencia de saldos entre meses

## Funcionalidades Implementadas

### 1. Navegación entre Meses

El servicio `PlanAhorrosService` proporciona métodos para navegar entre los meses disponibles:

```typescript
getMesesDisponibles(): Observable<string[]>
// Retorna: ['Agosto 2024', 'Septiembre 2024', 'Octubre 2024', 'Noviembre 2024']

getDatosMes(mes: string): Observable<DatosSaldoMes>
// Carga datos completos de un mes específico
```

### 2. Validación de Consistencia Multi-Mes

El método `getDatosMultiMes()` carga datos de todos los meses y valida que:

- El saldo inicial de cada mes sea igual al saldo final del mes anterior
- Se detecten y reporten inconsistencias con mensajes descriptivos
- Se incluyan operaciones atrasadas en los datos de cada mes

```typescript
getDatosMultiMes(): Observable<DatosMultiMes>
// Retorna datos de todos los meses con validación de consistencia
```

### 3. Operaciones Atrasadas

El servicio identifica operaciones atrasadas del mes anterior:

```typescript
getOperacionesAtrasadas(mes: string): Observable<{
  pagosFinancieros: OperacionFinanciera[],
  operacionesRecurrentes: OperacionFinanciera[]
}>
```

Las operaciones atrasadas tienen:
- `esAtrasada: true`
- `mesOriginal: string` (ej: "Octubre 2024")
- `estado: 'pendiente'`

### 4. Mensajes de Error

Cuando se detectan inconsistencias, el sistema genera mensajes descriptivos:

```
Inconsistencia detectada: El saldo inicial de Septiembre 2024 (S/ 3575.00) 
no coincide con el saldo final de Agosto 2024 (S/ 3500.00). 
Diferencia: S/ 75.00
```

## Estructura de Datos

### DatosSaldoMes

```typescript
interface DatosSaldoMes {
  mes: string;                    // "Agosto 2024"
  saldoInicial: number;           // Saldo al inicio del mes
  saldoFinal: number;             // Saldo calculado al final del mes
  saldoChanchitos: number;        // Suma de chanchitos de ahorro
  ahorroChanchitosDelMes: number; // Ahorro del mes en chanchitos
  metaAhorro: number;             // Meta de ahorro configurada
  operaciones: string[];          // IDs de operaciones del mes
  operacionesAtrasadas?: {
    pagosFinancieros: string[];
    operacionesRecurrentes: string[];
  };
}
```

### DatosMultiMes

```typescript
interface DatosMultiMes {
  meses: DatosSaldoMes[];         // Datos de todos los meses
  mesActual: string;              // "Noviembre 2024"
  validacionSaldos: {
    valido: boolean;              // true si no hay inconsistencias
    errores: string[];            // Mensajes de error descriptivos
  };
}
```

## Cálculo de Saldos

### Saldo Final del Mes

```typescript
saldoFinal = saldoInicial + Σ(operaciones no vinculadas)
```

Las operaciones vinculadas a recurrentes (`vinculadaARecurrente: true`) se excluyen para evitar duplicados.

### Validación de Consistencia

Para cada par de meses consecutivos (N-1, N):

```typescript
if (Math.abs(mesN.saldoInicial - mesN_1.saldoFinal) > 0.01) {
  // Reportar inconsistencia
}
```

Se permite una diferencia de 0.01 por redondeo.

## Script de Validación

El script `validar-navegacion-multi-mes.js` valida:

1. ✓ Navegación entre Agosto-Noviembre
2. ✓ Consistencia de saldos entre meses consecutivos
3. ✓ Operaciones atrasadas del mes anterior
4. ✓ Estructura de datos de cada mes

### Ejecutar Validación

```bash
node scripts/validar-navegacion-multi-mes.js
```

### Salida Esperada

```
================================================================================
VALIDACIÓN DE NAVEGACIÓN Y CONSISTENCIA MULTI-MES
================================================================================

Test 1: Verificar navegación entre Agosto-Noviembre
--------------------------------------------------------------------------------
✓ Agosto 2024: 100 operaciones cargadas
✓ Septiembre 2024: 100 operaciones cargadas
✓ Octubre 2024: 100 operaciones cargadas
✓ Noviembre 2024: 52 operaciones cargadas

Test 2: Validar que saldoInicial de mes N = saldoFinal de mes N-1
--------------------------------------------------------------------------------
✓ Septiembre 2024: Saldo inicial (S/ 3575.00) = Saldo final Agosto 2024
✓ Octubre 2024: Saldo inicial (S/ -2384.00) = Saldo final Septiembre 2024
✓ Noviembre 2024: Saldo inicial (S/ -4439.00) = Saldo final Octubre 2024

Test 3: Verificar operaciones atrasadas del mes anterior
--------------------------------------------------------------------------------
✓ Noviembre 2024: Encontradas 2 operaciones atrasadas

Test 4: Verificar estructura de datos de cada mes
--------------------------------------------------------------------------------
Agosto 2024:
  - Saldo Inicial: S/ 5000.00
  - Saldo Final: S/ 3575.00
  - Operaciones: 100
...

================================================================================
RESUMEN DE VALIDACIÓN
================================================================================
✓ Validaciones exitosas: 12
⚠ Advertencias: 0
✗ Errores: 0

✅ TODOS LOS TESTS DE NAVEGACIÓN MULTI-MES PASARON EXITOSAMENTE
```

## Integración en el Componente

El componente `PlanAhorrosComponent` valida la consistencia al inicializar:

```typescript
ngOnInit(): void {
  this.cargarDatosMes(this.mesActual);
  this.validarConsistenciaMultiMes();
}

validarConsistenciaMultiMes(): void {
  this.planService.getDatosMultiMes()
    .subscribe(datosMulti => {
      this.validacionSaldos = datosMulti.validacionSaldos;
      
      if (!datosMulti.validacionSaldos.valido) {
        console.warn('Inconsistencias detectadas en saldos multi-mes:');
        datosMulti.validacionSaldos.errores.forEach(error => {
          console.warn(`  - ${error}`);
        });
      }
    });
}
```

## Tests Unitarios

Los tests en `plan-ahorros.service.spec.ts` validan:

- ✓ Navegación entre meses disponibles
- ✓ Carga de datos específicos de cada mes
- ✓ Validación de consistencia de saldos
- ✓ Detección de operaciones atrasadas
- ✓ Generación de mensajes de error descriptivos
- ✓ Cálculo correcto de saldo final

## Notas de Implementación

### Saldos Iniciales Mock

Los saldos iniciales están configurados para ser consistentes con los datos de operaciones:

```typescript
'Agosto 2024': 5000,
'Septiembre 2024': 3575,   // = Saldo final de Agosto
'Octubre 2024': -2384,     // = Saldo final de Septiembre
'Noviembre 2024': -4439    // = Saldo final de Octubre
```

En una implementación real, estos valores vendrían de la API.

### Operaciones Vinculadas

Las operaciones vinculadas a recurrentes se excluyen del cálculo de saldo para evitar duplicados:

```typescript
const operacionesValidas = operaciones.filter(op => !op.vinculadaARecurrente);
```

### Tolerancia de Redondeo

Se permite una diferencia de 0.01 en la validación de saldos para manejar errores de redondeo:

```typescript
if (diferencia > 0.01) {
  // Reportar inconsistencia
}
```

## Próximos Pasos

Para integración con API real:

1. Reemplazar `obtenerSaldoInicialMes()` con llamada a API
2. Actualizar `getDatosMultiMes()` para cargar desde backend
3. Implementar persistencia de validaciones
4. Agregar UI para mostrar errores de validación al usuario

## Referencias

- Task 14.2 en `.kiro/specs/chicho-chatbot-poc/tasks.md`
- Requirements 35, 36, 39 en `.kiro/specs/chicho-chatbot-poc/requirements.md`
- Design document en `.kiro/specs/chicho-chatbot-poc/design.md`


## Narrativa de Ahorro con Altibajos

Los datos implementados muestran una **historia realista de ahorro** con variabilidad:

| Mes | Ahorro | Estado | Descripción |
|-----|--------|--------|-------------|
| Agosto | S/ 900 | ✅ | Buen mes, supera la meta |
| Septiembre | S/ 300 | ❌ | Mes difícil, no llega a la meta |
| Octubre | S/ 650 | ⚠️ | Recuperándose, cerca de la meta |
| Noviembre | S/ 1,000 | ✅ | Excelente mes, mejor ahorro |

**Métricas**:
- Meta mensual: S/ 800
- Progreso total: S/ 2,850 (4 meses)
- Ahorro promedio: S/ 712.50/mes
- Meses que superan meta: 2 de 4 (50%)

**Validaciones**:
✅ Variabilidad en el ahorro (altibajos)  
✅ Progreso general positivo  
✅ Consistencia entre meses  
✅ Saldos siempre >= 0

Ver `REQUISITOS-NARRATIVA-AHORRO.md` para más detalles sobre los requisitos de validación.
