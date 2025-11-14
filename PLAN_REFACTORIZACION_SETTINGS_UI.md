# Plan de Refactorización - Settings UI del Plan de Ahorros

## 🎯 Objetivo

Refactorizar las vistas de settings del plan de ahorros para que coincidan con los HTMLs originales y restaurar el UI correcto que se ha estropeado.

---

## 📋 Componentes a Refactorizar

### 1. **PlanSettingsComponent** (Vista Principal)
**Archivo:** `src/app/features/plan-ahorros/settings/plan-settings.component.html`
**HTML Original:** `OriginalHTMLs/plan-settings.html`

**Problemas Actuales:**
- Diseño no coincide con el original
- Falta el botón de "Chatear con la IA"
- Lista de opciones no tiene el estilo correcto

**Cambios Necesarios:**
- Botón verde grande de IA en la parte superior
- Lista con cards redondeadas y sombras
- Iconos azules Interbank
- Chevron derecho para navegación
- Hover effects en los items

---

### 2. **IngresoNetoSettingsComponent**
**Archivo:** `src/app/features/plan-ahorros/settings/ingreso-neto-settings.component.html`
**HTML Original:** `OriginalHTMLs/plan-settings-ingresoneto.html`

**Problemas Actuales:**
- Layout no coincide
- Input no tiene el estilo correcto
- Falta el link "¿Qué es el ingreso neto?"

**Cambios Necesarios:**
- Header con título centrado y botón back
- Headline grande "Tu Ingreso Mensual"
- Body text explicativo
- Input con placeholder "S/ 0.00"
- Link azul con underline
- Botón verde sticky en el footer

---

### 3. **MetaAhorroSettingsComponent**
**Archivo:** `src/app/features/plan-ahorros/settings/meta-ahorro-settings.component.html`
**HTML Original:** `OriginalHTMLs/plan-settings-ahorro.html`

**Problemas Actuales:**
- Slider no tiene el diseño correcto
- Falta el banner de advertencia
- Colores no coinciden

**Cambios Necesarios:**
- Card con ingreso neto e ingresos libres
- Título centrado "Elige cuánto quieres ahorrar al mes"
- Monto grande en verde (S/ 950.00)
- Slider con círculo verde y barra de progreso
- Banner de advertencia amarillo con icono
- Botón verde sticky

---

### 4. **ChanchitoSettingsComponent**
**Archivo:** `src/app/features/plan-ahorros/settings/chanchito-settings.component.html`
**HTML Original:** `OriginalHTMLs/plan-settings-chanchito.html`

**Problemas Actuales:**
- Grid de imágenes no tiene el diseño correcto
- Falta el indicador de selección
- Botón de añadir no está bien posicionado

**Cambios Necesarios:**
- Grid responsive de chanchitos
- Imágenes circulares con ring verde en el seleccionado
- Checkmark en el seleccionado
- Botón "Añadir nuevo Chanchito" con borde verde
- Footer sticky con botón de confirmación

---

### 5. **ConfiguracionGastosSettingsComponent**
**Archivo:** `src/app/features/plan-ahorros/settings/configuracion-gastos-settings.component.html`
**HTML Original:** `OriginalHTMLs/plan-settings-confgastos.html`

**Problemas Actuales:**
- Cards de categorías no tienen el diseño correcto
- Inputs de rango no están bien estructurados
- Iconos no coinciden

**Cambios Necesarios:**
- Cards con iconos grandes y descripciones
- Inputs "Desde" y "Hasta" lado a lado
- Prefijo "S/" en los inputs
- Campos "Desde" deshabilitados
- Botón sticky en el footer

---

### 6. **TopesGastosSettingsComponent**
**Archivo:** `src/app/features/plan-ahorros/settings/topes-gastos-settings.component.html`
**HTML Original:** `OriginalHTMLs/plan-settings-topegastos.html`

**Problemas Actuales:**
- Diseño de topes no coincide
- Toggle % / S/ no está implementado
- Cálculo de montos no se muestra

**Cambios Necesarios:**
- Mostrar ingreso neto e ingreso libre grandes
- Cards por cada tipo de gasto
- Input con toggle % / S/
- Mostrar monto calculado debajo
- Iconos en círculos con fondo verde claro

---

### 7. **OperacionesRecurrentesSettingsComponent**
**Archivo:** `src/app/features/plan-ahorros/settings/operaciones-recurrentes-settings.component.html`
**HTML Original:** `OriginalHTMLs/plan-settings-recurrentes.html`

**Problemas Actuales:**
- Lista de operaciones no tiene el diseño correcto
- Botones de editar/eliminar no están bien posicionados
- FAB no está implementado

**Cambios Necesarios:**
- Cards con iconos circulares verdes
- Información de la operación (nombre, frecuencia, monto)
- Botones de editar y eliminar a la derecha
- FAB verde en la esquina inferior derecha
- Empty state cuando no hay operaciones

---

## 🎨 Elementos Comunes de Diseño

### Colores
```scss
$interbank-green: #00843d;
$interbank-blue: #0039A6;
$background-light: #f6f8f7;
$background-dark: #101822;
$text-primary-light: #1C2D3A;
$text-secondary-light: #6B7B8B;
```

### Componentes Reutilizables

1. **Header con Back Button**
   - Botón back a la izquierda
   - Título centrado
   - Espacio vacío a la derecha para balance

2. **Sticky Footer Button**
   - Botón verde ancho
   - Sticky al bottom
   - Padding consistente

3. **Cards con Sombra**
   - Border radius: 0.75rem - 1rem
   - Sombra suave
   - Padding: 1rem
   - Background blanco/gris oscuro

4. **Iconos**
   - Material Symbols Outlined
   - Tamaño consistente (24px base)
   - Colores: azul Interbank o verde según contexto

---

## 📝 Prioridad de Refactorización

### Alta Prioridad (Crítico para UX)
1. ✅ **PlanSettingsComponent** - Vista principal de entrada
2. ✅ **IngresoNetoSettingsComponent** - Primer paso de configuración
3. ✅ **MetaAhorroSettingsComponent** - Segundo paso crítico

### Media Prioridad (Importante)
4. ⏳ **TopesGastosSettingsComponent** - Funcionalidad compleja
5. ⏳ **ConfiguracionGastosSettingsComponent** - Configuración importante

### Baja Prioridad (Puede esperar)
6. ⏳ **ChanchitoSettingsComponent** - Funcionalidad secundaria
7. ⏳ **OperacionesRecurrentesSettingsComponent** - Ya tiene componente separado

---

## 🔧 Estrategia de Implementación

### Fase 1: Análisis y Preparación
1. ✅ Revisar todos los HTMLs originales
2. ✅ Identificar componentes comunes
3. ✅ Crear plan de refactorización

### Fase 2: Refactorización de Alta Prioridad
1. Refactorizar PlanSettingsComponent
2. Refactorizar IngresoNetoSettingsComponent
3. Refactorizar MetaAhorroSettingsComponent
4. Testing de navegación básica

### Fase 3: Refactorización de Media Prioridad
1. Refactorizar TopesGastosSettingsComponent
2. Refactorizar ConfiguracionGastosSettingsComponent
3. Testing de funcionalidad completa

### Fase 4: Refactorización de Baja Prioridad
1. Refactorizar ChanchitoSettingsComponent
2. Refactorizar OperacionesRecurrentesSettingsComponent
3. Testing final y ajustes

---

## 📊 Checklist de Verificación

Para cada componente refactorizado:

- [ ] HTML coincide con el original
- [ ] Estilos SCSS implementados correctamente
- [ ] Funcionalidad TypeScript funciona
- [ ] Navegación funciona correctamente
- [ ] Responsive design funciona
- [ ] Modo oscuro funciona
- [ ] No hay errores de consola
- [ ] Accesibilidad básica implementada

---

## 🚀 Próximos Pasos Inmediatos

1. **Comenzar con PlanSettingsComponent**
   - Es la vista principal
   - Impacto visual inmediato
   - Relativamente simple

2. **Continuar con IngresoNetoSettingsComponent**
   - Primer paso del flujo
   - Diseño simple
   - Fácil de implementar

3. **Seguir con MetaAhorroSettingsComponent**
   - Segundo paso del flujo
   - Más complejo (slider)
   - Alto impacto visual

---

## 📝 Notas Importantes

- **No eliminar funcionalidad existente** - Solo mejorar el UI
- **Mantener compatibilidad** - Los servicios y lógica deben seguir funcionando
- **Testing continuo** - Probar después de cada componente
- **Commits incrementales** - Un commit por componente refactorizado

---

**Fecha de creación:** 13 de noviembre de 2025  
**Estado:** 📋 PLAN CREADO - Listo para implementación  
**Prioridad:** 🔴 ALTA - UI estropeado afecta UX
