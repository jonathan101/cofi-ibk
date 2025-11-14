# Implementation Plan

## Overview
Este plan implementa los 8 componentes faltantes del Plan de Ahorros, siguiendo los diseños de los HTMLs originales y manteniendo consistencia con la arquitectura existente.

---

## Tasks

- [x] 1. Crear modelos e interfaces necesarias



  - Crear interfaces para ConfigMenuItem, OperacionRecurrente, Chanchito
  - Agregar métodos al PlanAhorrosService para configuración
  - _Requirements: 1, 2, 3, 4, 5, 6, 7_



- [x] 1.1 Crear interface ConfigMenuItem





  - Crear archivo `src/app/core/models/config-menu-item.interface.ts`


  - Definir propiedades: icon, label, route, filled (opcional)
  - _Requirements: 1_


- [x] 1.2 Crear interface OperacionRecurrente






  - Crear archivo `src/app/core/models/operacion-recurrente.interface.ts`
  - Definir propiedades: id, nombre, monto, categoria, diaDelMes, tipoProducto, activa


  - _Requirements: 4_

- [x] 1.3 Crear interface Chanchito




  - Crear archivo `src/app/core/models/chanchito.interface.ts`


  - Definir propiedades: id, nombre, montoActual, metaMonto, icono, color
  - _Requirements: 5_


- [x] 1.4 Agregar métodos al PlanAhorrosService





  - Agregar métodos para configuración: getConfiguracion, updateConfiguracion
  - Agregar métodos para operaciones recurrentes: CRUD completo
  - Agregar métodos para chanchitos: getChanchitos, setChanchitoPrincipal
  - Agregar métodos para detalle de gastos: getOperacionesGastos, getCategoriasGastos


  - _Requirements: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10_


- [x] 2. Actualizar routing de la aplicación




  - Agregar rutas para todos los componentes nuevos en app.routes.ts

  - Configurar rutas hijas bajo 'plan-ahorros'
  - _Requirements: 1, 2, 3, 4, 5, 6, 7, 8_

- [x] 3. Crear componente PlanSettingsComponent





  - Crear estructura de archivos en `src/app/features/plan-ahorros/settings/`
  - Implementar vista principal de configuración

  - _Requirements: 1_


- [x] 3.1 Crear estructura del componente

  - Generar componente standalone con imports necesarios
  - Agregar PullDownHandleComponent, CommonModule, RouterModule
  - Configurar :host styles para layout correcto

  - _Requirements: 1_


- [x] 3.2 Implementar HTML basado en plan-settings.html

  - Agregar pull-down handle

  - Crear header con botón back y título
  - Agregar botón "Chatear con la IA"
  - Crear lista de opciones de configuración con iconos
  - _Requirements: 1_




- [x] 3.3 Implementar lógica del componente

  - Definir array de menuItems con ConfigMenuItem[]
  - Implementar método navigateTo(route)
  - Implementar método onPullDown()
  - Implementar método openAIChat() (placeholder)

  - _Requirements: 1_


- [x] 3.4 Crear estilos SCSS

  - Aplicar estilos consistentes con el diseño
  - Usar variables SCSS existentes
  - Asegurar scroll y layout correcto
  - _Requirements: 1_


- [x] 4. Crear componente IngresoNetoSettingsComponent




  - Crear estructura de archivos
  - Implementar configuración de ingreso neto
  - _Requirements: 2_

- [x] 4.1 Crear estructura del componente

  - Generar componente standalone

  - Agregar imports: PullDownHandleComponent, FormsModule, CommonModule
  - Configurar :host styles
  - _Requirements: 2_


- [x] 4.2 Implementar HTML basado en plan-settings-ingresoneto




  - Agregar pull-down handle
  - Crear header con botón back
  - Agregar título y descripción

  - Crear input numérico para ingreso
  - Agregar link informativo
  - Crear footer sticky con botón guardar
  - _Requirements: 2_



- [x] 4.3 Implementar lógica del componente





  - Definir propiedad ingresoNeto
  - Cargar configuración actual en ngOnInit
  - Implementar método guardarIngreso()
  - Implementar validación de monto
  - Implementar método showInfoIngresoNeto()
  - _Requirements: 2_

- [x] 4.4 Crear estilos SCSS

  - Estilos para input numérico
  - Estilos para footer sticky
  - Responsive design
  - _Requirements: 2_

- [x] 5. Crear componente MetaAhorroSettingsComponent





  - Crear estructura de archivos

  - Implementar configuración de meta de ahorro
  - _Requirements: 3_


- [x] 5.1 Crear estructura del componente

  - Generar componente standalone

  - Agregar imports necesarios
  - Configurar :host styles
  - _Requirements: 3_

- [x] 5.2 Implementar HTML basado en plan-settings-ahorro

  - Agregar pull-down handle
  - Crear header
  - Mostrar card con ingreso neto e ingresos libres
  - Agregar título y monto grande en verde
  - Implementar slider para ajustar meta

  - Agregar banner de advertencia condicional
  - Crear footer con botón
  - _Requirements: 3_


- [x] 5.3 Implementar lógica del componente

  - Cargar ingreso neto y calcular ingresos libres
  - Implementar método onSliderChange()

  - Implementar método checkWarning()
  - Implementar método guardarMeta()
  - Calcular porcentaje de ahorro
  - _Requirements: 3_


- [x] 5.4 Crear estilos SCSS

  - Estilos para slider personalizado

  - Estilos para banner de advertencia
  - Estilos para monto grande
  - _Requirements: 3_


- [x] 6. Crear componente OperacionesRecurrentesSettingsComponent




  - Crear estructura de archivos
  - Implementar gestión de operaciones recurrentes
  - _Requirements: 4_

- [x] 6.1 Crear estructura del componente

  - Generar componente standalone
  - Agregar imports necesarios
  - Configurar :host styles
  - _Requirements: 4_


- [x] 6.2 Implementar HTML basado en plan-settings-recurrentes.html


  - Agregar pull-down handle
  - Crear header
  - Mostrar lista de operaciones recurrentes
  - Agregar botón flotante "+" para agregar
  - Crear modal para agregar/editar operación
  - _Requirements: 4_


- [x] 6.3 Implementar lógica del componente


  - Cargar operaciones recurrentes en ngOnInit
  - Implementar método agregarOperacion()
  - Implementar método editarOperacion()

  - Implementar método eliminarOperacion()
  - Implementar método guardarOperacion()
  - _Requirements: 4_


- [x] 6.4 Crear estilos SCSS


  - Estilos para lista de operaciones
  - Estilos para modal
  - Estilos para botón flotante
  - _Requirements: 4_


- [x] 7. Crear componente ChanchitoSettingsComponent





  - Crear estructura de archivos
  - Implementar selección de chanchito principal
  - _Requirements: 5_



- [x] 7.1 Crear estructura del componente

  - Generar componente standalone
  - Agregar imports necesarios
  - Configurar :host styles
  - _Requirements: 5_

- [x] 7.2 Implementar HTML basado en plan-settings-chanchito.html


  - Agregar pull-down handle
  - Crear header

  - Mostrar lista de chanchitos con radio buttons
  - Mostrar saldo actual de cada chanchito
  - Crear footer con botón guardar
  - _Requirements: 5_

- [x] 7.3 Implementar lógica del componente

  - Cargar lista de chanchitos en ngOnInit
  - Implementar método seleccionarChanchito()

  - Implementar método guardarSeleccion()
  - _Requirements: 5_

- [x] 7.4 Crear estilos SCSS


  - Estilos para lista de chanchitos
  - Estilos para radio buttons personalizados
  - Estilos para iconos de chanchito
  - _Requirements: 5_


- [x] 8. Crear componente ConfiguracionGastosSettingsComponent





  - Crear estructura de archivos
  - Implementar configuración de categorización de gastos
  - _Requirements: 6_


- [x] 8.1 Crear estructura del componente


  - Generar componente standalone
  - Agregar imports necesarios
  - Configurar :host styles
  - _Requirements: 6_

- [x] 8.2 Implementar HTML basado en plan-settings-confgastos.html


  - Agregar pull-down handle
  - Crear header

  - Mostrar explicación
  - Crear secciones para cada tipo de gasto
  - Agregar inputs para topes
  - Mostrar ejemplos de cada categoría
  - Crear footer con botón guardar
  - _Requirements: 6_


- [x] 8.3 Implementar lógica del componente

  - Cargar configuración actual
  - Implementar método validarTopes()
  - Implementar método guardarConfiguracion()
  - Validar que topes sean coherentes (hormiga < medio < excepcional)
  - _Requirements: 6_

- [x] 8.4 Crear estilos SCSS


  - Estilos para secciones de categorías
  - Estilos para inputs de topes

  - Estilos para ejemplos
  - _Requirements: 6_

- [x] 9. Crear componente TopesGastosSettingsComponent





  - Crear estructura de archivos

  - Implementar configuración de topes mensuales
  - _Requirements: 7_


- [x] 9.1 Crear estructura del componente

  - Generar componente standalone
  - Agregar imports necesarios
  - Configurar :host styles
  - _Requirements: 7_



- [x] 9.2 Implementar HTML basado en plan-settings-topegastos.html

  - Agregar pull-down handle
  - Crear header
  - Mostrar información del ingreso neto
  - Crear lista de categorías con topes
  - Agregar toggle porcentaje/monto fijo para cada categoría

  - Agregar inputs para valores

  - Mostrar indicador visual del monto calculado
  - Crear footer con botón guardar
  - _Requirements: 7_

- [x] 9.3 Implementar lógica del componente

  - Cargar ingreso neto y topes actuales
  - Implementar método toggleTipo()
  - Implementar método calcularMontoTope()
  - Implementar método guardarTopes()
  - Validar que la suma de topes no exceda el ingreso
  - _Requirements: 7_

- [x] 9.4 Crear estilos SCSS

  - Estilos para toggles
  - Estilos para indicadores visuales
  - Estilos para lista de categorías
  - _Requirements: 7_

- [x] 10. Crear componente DetalleGastosComponent

  - Crear estructura de archivos
  - Implementar vista detallada de gastos con filtros y gráfico
  - _Requirements: 8_

- [x] 10.1 Crear estructura del componente





  - Generar componente standalone
  - Agregar imports necesarios
  - Configurar :host styles

  - _Requirements: 8_

- [x] 10.2 Implementar HTML





  - Agregar pull-down handle
  - Crear header con botón back
  - Crear filtro de tipo de gasto (chips)

  - Agregar gráfico de barras horizontales
  - Crear lista cronológica de operaciones
  - Agregar scroll infinito o paginación
  - _Requirements: 8_

- [x] 10.3 Implementar lógica del componente





  - Cargar operaciones de gastos del mes
  - Implementar método aplicarFiltro()
  - Implementar método generarDatosGrafico()

  - Procesar operaciones para agrupar por categoría

  - Implementar método verDetalleOperacion()

  - _Requirements: 8_

- [x] 10.4 Crear estilos SCSS





  - Estilos para filtros (chips)
  - Estilos para gráfico de barras

  - Estilos para lista de operaciones
  - Estilos para pills de categoría
  - _Requirements: 8_




- [x] 11. Agregar operaciones en secciones del plan principal



  - Modificar PlanAhorrosComponent para mostrar operaciones
  - Cargar operaciones de cada sección
  - _Requirements: 9, 10_



- [x] 11.1 Actualizar HTML del plan principal
  - Agregar lista de operaciones en sección Ingresos
  - Agregar lista de operaciones en sección Operaciones Recurrentes
  - Agregar listas de operaciones en subsecciones de Gastos
  - Agregar lista de operaciones en sección Movimientos de Caja
  - Agregar lista de operaciones en sección Carga Financiera
  - Mostrar mensaje "No hay operaciones" cuando esté vacío
  - _Requirements: 9_


- [x] 11.2 Actualizar lógica del componente

  - Cargar operaciones de cada sección usando el servicio
  - Implementar métodos para obtener operaciones por categoría
  - Aplicar filtros según los requerimientos (tipoProducto, estado, etc.)
  - Calcular totales sumando las operaciones
  - _Requirements: 9, 10_


- [x] 11.3 Actualizar estilos SCSS


  - Estilos para listas de operaciones
  - Estilos para items de operación
  - Estilos para mensaje vacío
  - _Requirements: 9_

- [x] 12. Crear datos mock para testing





  - Crear archivos JSON con datos de ejemplo
  - Agregar datos de operaciones recurrentes
  - Agregar datos de chanchitos
  - _Requirements: 4, 5, 10_

- [x] 12.1 Crear archivo de operaciones recurrentes mock


  - Crear `src/assets/data/DataEstatica/operaciones-recurrentes.json`
  - Agregar 5-10 operaciones de ejemplo
  - _Requirements: 4_

- [x] 12.2 Crear archivo de chanchitos mock


  - Crear `src/assets/data/DataEstatica/chanchitos.json`
  - Agregar 3-5 chanchitos de ejemplo
  - _Requirements: 5_

- [x] 12.3 Actualizar archivos de operaciones existentes


  - Asegurar que tengan todas las propiedades necesarias
  - Agregar categorías de usuario si faltan
  - _Requirements: 10_

- [x] 13. Actualizar navegación desde el plan principal





  - Agregar botón de configuración en el header
  - Agregar navegación a detalle de gastos desde "Ver más"
  - _Requirements: 1, 8_


- [x] 13.1 Actualizar header del plan principal

  - Cambiar botón settings para navegar a /plan-ahorros/configuracion
  - Verificar que el método abrirConfiguracion() navegue correctamente
  - _Requirements: 1_


- [x] 13.2 Agregar navegación en sección de Gastos

  - Implementar método verDetalleGastos() que navegue a /plan-ahorros/detalle/gastos
  - Agregar botón "Ver más" en la sección de Gastos
  - _Requirements: 8_

- [x] 14. Testing y validación





  - Probar navegación entre todas las vistas
  - Validar que los formularios funcionen correctamente
  - Verificar que los datos se guarden y carguen correctamente
  - _Requirements: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10_

