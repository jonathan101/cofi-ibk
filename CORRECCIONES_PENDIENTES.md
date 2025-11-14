# Correcciones Pendientes - Plan de Ahorros

## ✅ Completado

1. ✅ Bottom navbar ahora está dentro del marco móvil
2. ✅ Ícono chevron_right corregido en Home (productos)
3. ✅ Material Symbols cargando correctamente
4. ✅ Mobile container funcionando

## 🔄 En Progreso - Plan de Ahorros

### Cambios Requeridos:

#### 1. Header del Plan de Ahorros
- [ ] Agregar ícono hamburguesa a la izquierda
- [ ] Agregar ícono settings a la derecha
- [ ] Mantener título "Plan de Ahorros" en el centro

#### 2. Resumen Superior
Cambiar de:
- Saldo Actual
- Por Pagar
- Saldo Chanchitos

A:
- **Saldo Inicial**
- **Saldo Final** (calculado)
- **Por Pagar**

**Fórmula**: 
```
Saldo Final = Saldo Inicial + Ingresos + Operaciones Regulares (Pagados) + Gastos (Débito) + Movimientos de Caja + Carga Financiera (Pagados)
```

#### 3. Carga Financiera
- [ ] **Eliminar** separación por TD/TC
- [ ] Mostrar solo el total
- [ ] Razón: La carga financiera son obligaciones de préstamos (Interbank u otros bancos), no tiene sentido separarlas por tipo de producto

#### 4. Gastos
- [ ] Mostrar "Gastos (Débito)" en la esquina derecha
- [ ] Esto es lo contable, no incluye TC
- [ ] Mantener subsecciones con TD/TC por tipo de gasto

#### 5. Saldo Restante en Cada Sección
Agregar en cada sección:
- **Saldo Restante** = Tope - Consumido
- **Pills de Alerta**:
  - 90-100% del tope: Pill ámbar
  - Negativo (>100%): Pill rojo
  - <90%: Sin pill

Aplicar a:
- [ ] Gastos (total)
- [ ] Cada tipo de gasto (Automáticos, Hormiga, Medios, Excepcionales)
- [ ] Carga Financiera
- [ ] Movimientos de Caja

#### 6. Implementar Detalles de Secciones
- [ ] **Ingresos**: Mostrar lista de ingresos con montos
- [ ] **Operaciones Regulares**: Mostrar lista con estado (Pagado/Pendiente)
- [ ] **Movimientos de Caja**: Mostrar desglose (Transferencias, Retiros, Depósitos, Otros)

#### 7. Estructura de Cada Sección

```
┌─────────────────────────────────────────┐
│ [▼] Nombre Sección          -S/ XXX.XX │
├─────────────────────────────────────────┤
│ Detalle de operaciones...               │
│                                         │
│ Tope Mensual: S/ XXX.XX                │
│ Saldo Restante: S/ XXX.XX [PILL]       │
└─────────────────────────────────────────┘
```

## Ejemplo de Implementación

### Gastos (con Saldo Restante)

```html
<div class="seccion gastos">
  <div class="seccion-header">
    <h3>Gastos (Débito)</h3>
    <span class="monto">-S/ 2,010.00</span>
  </div>
  
  <div class="seccion-content">
    <!-- Subsecciones de gastos -->
    
    <!-- Resumen al final -->
    <div class="seccion-resumen">
      <div class="resumen-row">
        <span>Tope Mensual:</span>
        <span>S/ 2,500.00</span>
      </div>
      <div class="resumen-row">
        <span>Saldo Restante:</span>
        <span class="con-pill">
          S/ 490.00
          <span class="pill pill-normal">80%</span>
        </span>
      </div>
    </div>
  </div>
</div>
```

### Carga Financiera (sin TD/TC)

```html
<div class="seccion carga-financiera">
  <div class="seccion-header">
    <h3>Carga Financiera</h3>
    <span class="monto">-S/ 1,100.00</span>
  </div>
  
  <div class="seccion-content">
    <ul class="lista-operaciones">
      <li>Pago TC -S/ 250 <span class="badge">Pagado</span></li>
      <li>Cuota Vehicular -S/ 700 <button>Pagar</button></li>
      <li>Cuota Hipoteca -S/ 600 <span class="badge">Pagado</span></li>
    </ul>
    
    <div class="seccion-resumen">
      <div class="resumen-row">
        <span>Tope Mensual:</span>
        <span>S/ 1,000.00</span>
      </div>
      <div class="resumen-row">
        <span>Saldo Restante:</span>
        <span class="con-pill">
          -S/ 100.00
          <span class="pill pill-danger">110%</span>
        </span>
      </div>
    </div>
  </div>
</div>
```

## Próximos Pasos

1. Actualizar `plan-ahorros.component.ts` con nueva lógica de cálculo
2. Actualizar `plan-ahorros.component.html` con nueva estructura
3. Actualizar `plan-ahorros.component.scss` con estilos para pills y saldo restante
4. Agregar header con hamburguesa y settings
5. Implementar detalles de Ingresos, Operaciones Regulares, Movimientos de Caja
6. Probar cálculos y validar fórmulas

## Notas Importantes

- El Saldo Final debe calcularse correctamente según la fórmula
- Los pills solo se muestran cuando hay tope configurado
- Los pills solo aparecen si el consumo está en 90-100% (ámbar) o >100% (rojo)
- La Carga Financiera NO se separa por TD/TC
- Los Gastos sí se separan por TD/TC en las subsecciones, pero el total es "Gastos (Débito)"
