# Implementation Plan

## Overview
Este plan de implementación convierte el diseño aprobado en tareas incrementales de código. Cada tarea construye sobre las anteriores y termina con código integrado y funcional. El enfoque prioriza funcionalidad core sobre testing exhaustivo.

---

## Tasks

- [x] 1. Configurar proyecto Angular y estructura base
  - Crear proyecto Angular 17+ con standalone components
  - Configurar estructura de carpetas (core, shared, features)
  - Configurar routing básico
  - Configurar variables SCSS con colores Interbank y configuraciones parametrizadas
  - Crear archivo vercel.json para deployment
  - _Requirements: Todos los requisitos base del proyecto_

- [x] 1.1 Crear proyecto Angular con configuración inicial
  - Ejecutar `ng new chicho-chatbot-poc --standalone --routing --style=scss`
  - Configurar estructura de carpetas según diseño
  - Crear archivos de environment (development, production)
  - _Requirements: Arquitectura base_

- [x] 1.2 Configurar variables SCSS y tema Interbank
  - Crear `src/styles/_variables.scss` con colores, tipografía, espaciados
  - Crear `src/styles/_mixins.scss` con mixins reutilizables
  - Importar variables en `styles.scss`
  - Configurar colores parametrizados para gráficos
  - _Requirements: Diseño visual consistente_

- [x] 1.3 Configurar routing y vercel.json
  - Crear `app.routes.ts` con rutas principales
  - Crear `vercel.json` con fallback a index.html
  - _Requirements: Navegación y deployment_

- [x] 2. Crear interfaces TypeScript y estructura de datos
  - Definir todas las interfaces en archivos separados
  - Crear estructura de carpeta DataEstatica/
  - Crear archivos JSON mock con datos de ejemplo
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 7.1, 7.2, 7.3_

- [x] 2.1 Crear interfaces de datos core
  - Crear `src/app/core/models/operacion-financiera.interface.ts`
  - Crear `src/app/core/models/plan-ahorros.interface.ts`
  - Crear `src/app/core/models/configuracion-plan.interface.ts`
  - Crear `src/app/core/models/chanchito-ahorro.interface.ts`
  - Crear `src/app/core/models/operacion-recurrente.interface.ts`
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 2.2 Crear interfaces de chat y mensajería
  - Crear `src/app/core/models/mensaje-unificado.interface.ts`
  - Crear `src/app/core/models/alert.interface.ts`
  - Crear `src/app/core/models/reward.interface.ts`
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 2.3 Crear estructura de datos mock JSON
  - Crear carpeta `src/assets/data/DataEstatica/`
  - Crear `cliente.json` con datos del cliente
  - Crear `configuracion-plan.json` con topes por defecto (30% Carga Financiera, 10% Gastos)
  - Crear `chanchitos-ahorro.json` con 4 chanchitos
  - Crear `operaciones-recurrentes.json` con 3 operaciones programadas
  - Crear carpeta `operaciones/` con archivos por mes
  - Crear carpeta `chat/` con archivos de mensajería
  - _Requirements: 2.1, 2.2, 2.3, 4.1, 4.2, 4.3_

- [x] 2.4 Generar operaciones financieras basadas en Excel
  - Crear `agosto-2024.json` con 100 operaciones (60% TD, 40% TC)
  - Crear `septiembre-2024.json` con 100 operaciones
  - Crear `octubre-2024.json` con 100 operaciones
  - Crear `noviembre-2024.json` con 50 operaciones (hasta 14-Nov)
  - Distribuir operaciones entre categorías: gastos (9 subcategorías), cobros automáticos, transferencias, pagos financieros
  - Incluir operaciones atrasadas del mes anterior
  - _Requirements: 2.1, 2.2, 2.3, 4.1, 4.2, 4.3, 49_

- [x] 3. Implementar servicios core con fallback a mock data





  - Crear servicios con patrón de fallback automático
  - Implementar sistema de filtros flexible tipo query builder
  - Implementar lógica de cálculos financieros
  - _Requirements: 14, 31, 32, 34, 35, 36, 37, 38, 40_

- [x] 3.1 Crear PlanAhorrosService con sistema de filtros


  - Crear `src/app/core/services/plan-ahorros.service.ts`
  - Implementar interfaz `FiltroOperacion` con múltiples criterios de filtrado
  - Implementar `sumarOperaciones(filtros: FiltroOperacion)` con query builder
  - Implementar `calcularSaldoActual()` usando filtros (excluye operaciones vinculadas)
  - Implementar `calcularPorPagar()` usando filtros (incluye atrasadas)
  - Implementar `getResumenFinanciero()` con todos los cálculos
  - Implementar `clasificarTipoGasto()` con fórmula automática (20% y 50% ingreso diario)
  - Implementar `getDatosMes(mes: string)` para navegación entre meses
  - Implementar `getOperacionesAtrasadas(mes: string)` del mes anterior
  - Implementar `vincularOperacionConRecurrente()` para vincular operaciones
  - Implementar `getChanchitosAhorro()` y `transferirAChanchito()`
  - Implementar `refreshPlanAhorros()` para pull-to-refresh
  - Implementar fallback a datos mock JSON
  - _Requirements: 14, 31, 32, 34, 35, 36, 38, 40, 41, 44_

- [x] 3.2 Crear ChatService con flujo conversacional


  - Crear `src/app/core/services/chat.service.ts`
  - Implementar `sendMessage()` con respuesta estática única
  - Implementar `getListaUnificada()` que combina chat, alertas y recompensas
  - Implementar filtros de configuración (showAlerts, showRewards, showConversations)
  - Cargar datos de `chat/respuestas-estaticas.json`, `lista-conversacion.json`, `lista-alertas.json`, `lista-recompensas.json`
  - Implementar `getUnreadCount()` para badge de notificaciones
  - _Requirements: 1, 2, 3, 4, 5_

- [x] 3.3 Crear servicios auxiliares



  - Crear `src/app/core/services/alertas.service.ts` para gestionar alertas
  - Crear `src/app/core/services/recompensas.service.ts` para gestionar recompensas
  - Crear `src/app/core/services/operaciones-recurrentes.service.ts` para CRUD de operaciones recurrentes
  - Implementar `generarOperacionesMensuales()` en OperacionesRecurrentesService
  - Implementar fallback a mock data
  - _Requirements: 3, 5, 37_

- [x] 4. Crear componentes compartidos (shared)




  - Implementar componentes reutilizables básicos
  - Aplicar estilos con variables SCSS
  - _Requirements: 1, 6, 7, 16_

- [x] 4.1 Crear MobileContainerComponent


  - Crear `src/app/shared/components/mobile-container/mobile-container.component.ts`
  - Detectar tipo de dispositivo (desktop vs móvil)
  - Implementar marco de celular para desktop (max-width: 480px, min-width: 360px)
  - Aplicar estilos responsivos con sombras y bordes redondeados
  - En móvil, renderizar sin marco (pantalla completa)
  - _Requirements: 7, 16_



- [x] 4.2 Crear FloatingButtonComponent
  - Crear `src/app/shared/components/floating-button/floating-button.component.ts`
  - Mostrar icono de Chicho circular
  - Implementar badge de notificaciones en esquina superior derecha
  - Aplicar posición fija durante scroll (bottom-right)
  - Emitir evento onClick
  - _Requirements: 1_

- [x] 4.3 Crear componentes de mensajería

  - Crear `src/app/shared/components/chat-message/chat-message.component.ts` con renderizado condicional por tipo
  - Crear `src/app/shared/components/alert-card/alert-card.component.ts` con severidad y acciones
  - Crear `src/app/shared/components/reward-card/reward-card.component.ts` con categoría y botón de acción
  - _Requirements: 3, 4_

- [x] 5. Implementar módulo Home




  - Crear vista principal con productos bancarios
  - Integrar botón flotante de Chicho
  - Implementar navegación inferior
  - _Requirements: 1, 18_


- [x] 5.1 Implementar HomeComponent completo

  - Actualizar `src/app/features/home/home.component.ts` con template completo
  - Mostrar productos bancarios del usuario (cuentas, tarjetas)
  - Integrar FloatingButtonComponent con badge de notificaciones
  - Crear `src/app/shared/components/bottom-navigation/bottom-navigation.component.ts`
  - Integrar MobileContainerComponent como wrapper
  - Aplicar estilos Interbank
  - _Requirements: 1, 18_

- [ ] 6. Implementar módulo Chat
  - Crear vista de chat con Chicho
  - Implementar lista unificada de mensajes
  - Implementar filtros de configuración
  - _Requirements: 2, 3, 4, 5_

- [ ] 6.1 Implementar ChatComponent completo con lista unificada
  - Actualizar `src/app/features/chat/chat.component.ts` con template completo
  - Crear `src/app/shared/components/chat-header/chat-header.component.ts` con avatar y botón de configuración
  - Crear `src/app/shared/components/chat-messages/chat-messages.component.ts` con scroll automático
  - Crear `src/app/shared/components/chat-input/chat-input.component.ts` con envío de mensajes
  - Cargar lista unificada desde ChatService (combina chat, alertas, recompensas)
  - Usar ChatMessageComponent para renderizar cada mensaje según tipo
  - Implementar animación de apertura desde parte inferior
  - _Requirements: 2, 3, 4_

- [ ] 6.2 Crear ChatConfigModalComponent
  - Crear `src/app/shared/components/chat-config-modal/chat-config-modal.component.ts`
  - Implementar checklist con opciones: alertas, recompensas, conversaciones
  - Guardar configuración en ChatService
  - Aplicar filtros a lista unificada
  - _Requirements: 5_

- [ ] 7. Implementar módulo Plan de Ahorros - Parte 1 (Vista principal)
  - Crear vista principal con cálculos financieros
  - Implementar navegación entre meses
  - Implementar secciones colapsables
  - Mostrar pills de alerta en totales
  - _Requirements: 31, 32, 33, 35, 36, 45, 48_

- [ ] 7.1 Implementar PlanAhorrosComponent con cálculos dinámicos
  - Actualizar `src/app/features/plan-ahorros/plan-ahorros.component.ts` con template completo
  - Crear `src/app/shared/components/selector-mes/selector-mes.component.ts` para navegar entre Agosto-Noviembre
  - Cargar datos del mes seleccionado desde PlanAhorrosService
  - Calcular saldo actual: saldoInicial + ingresos + operacionesRegulares + gastos + movimientosCaja + cargaFinanciera
  - Calcular "Por Pagar": suma de operaciones pendientes + atrasadas
  - Mostrar secciones: Ingresos, Operaciones Regulares, Gastos, Movimientos de Caja, Carga Financiera
  - Mostrar saldoChanchitos separado del saldoActual
  - _Requirements: 31, 32, 35, 41_

- [ ] 7.2 Implementar subsecciones de Gastos con pills
  - Mostrar subsecciones: Cobros Automáticos, Gastos Hormiga, Gastos Medios, Gastos Excepcionales
  - Para cada subsección mostrar: Consumo TD (texto normal), Consumo TC (texto normal), Total (con pill)
  - Implementar lógica de pills: normal (<90%), ámbar (90-100%), rojo (>100%)
  - Aplicar pills también al total de Carga Financiera
  - Botón "Ver más" solo en sección general de Gastos (navega a /plan-ahorros/detalle/gastos)
  - Pills solo se muestran si la categoría tiene tope configurado
  - _Requirements: 45, 46, 48_

- [ ] 7.3 Implementar secciones colapsables y operaciones atrasadas
  - Gestionar estado de colapso de cada sección
  - Botón global para colapsar/descolapsar todas
  - Aplicar transiciones smooth (300ms ease-in-out) usando variables SCSS
  - Mostrar secciones "Pagos Financieros Atrasados" y "Operaciones Recurrentes Atrasadas" si existen
  - Indicador visual destacado (color rojo o badge) para atrasadas
  - _Requirements: 33, 36_

- [ ] 8. Implementar módulo Plan de Ahorros - Parte 2 (Configuración)
  - Crear vistas de configuración manual
  - Implementar configuración de topes mensuales
  - Implementar configuración de clasificación de gastos
  - _Requirements: 42, 43, 46, 47_

- [ ] 8.1 Implementar ConfigurarPlanComponent
  - Actualizar `src/app/features/plan-ahorros/configurar-plan/configurar-plan.component.ts` con template completo
  - Mostrar fecha de vigencia automática (mes actual)
  - Permitir editar ingreso neto mensual
  - Configurar metas de ahorro
  - Configurar tiempo de espera de alerta ante compras altas
  - Permitir seleccionar cuentas excluidas del saldo inicial
  - Links a "Topes Mensuales" y "Clasificación de Gastos"
  - Link a "Operaciones Recurrentes"
  - Mostrar advertencia: "Esta configuración aplicará desde [Mes] en adelante"
  - Botón para volver a hablar con Chicho
  - _Requirements: 42, 43_

- [ ] 8.2 Implementar TopesMensualesComponent
  - Actualizar `src/app/features/plan-ahorros/configurar-plan/topes-mensuales/topes-mensuales.component.ts`
  - Mostrar topes para: Cobros Automáticos, Gastos Hormiga, Gastos Medios, Gastos Excepcionales, Carga Financiera, Movimientos de Caja, Operaciones Recurrentes
  - Para cada tope: Porcentaje del ingreso, Monto Fijo, o Sin Tope
  - Topes por defecto: Carga Financiera 30%, Gastos 10% c/u, otros sin tope
  - Mostrar monto calculado si se usa porcentaje
  - Si existe monto fijo, usar ese con prioridad
  - Guardar configuración
  - _Requirements: 46_

- [ ] 8.3 Implementar ClasificacionGastosComponent
  - Actualizar `src/app/features/plan-ahorros/configurar-plan/clasificacion-gastos/clasificacion-gastos.component.ts`
  - Configurar tope para clasificar gasto como "Hormiga" (20% ingreso diario)
  - Configurar tope para clasificar gasto como "Medio" (50% ingreso diario)
  - Para cada tope: Automático (fórmula) o Manual
  - Mostrar monto calculado si automático
  - Guardar configuración
  - _Requirements: 47_

- [ ] 9. Implementar módulo Plan de Ahorros - Parte 3 (Detalle y listas)
  - Crear vista de detalle de gastos con filtro y gráfico
  - Crear vistas de listas de movimientos
  - Implementar recategorización
  - _Requirements: 27, 28_

- [ ] 9.1 Implementar DetalleGastosComponent
  - Actualizar `src/app/features/plan-ahorros/detalle-gastos/detalle-gastos.component.ts` con template completo
  - Implementar filtro: Todos, Gastos Hormiga, Gastos Medios, Gastos Excepcionales
  - Renderizar gráfico de barras horizontales con 9 tipos de consumo + Otros
  - Usar color azul configurable desde variables SCSS ($color-barra-detalle-gastos)
  - Mostrar lista cronológica de operaciones con monto y fecha
  - Actualizar gráfico y lista según filtro seleccionado
  - Mostrar comentario resumen generado por IA (mock)
  - _Requirements: 27_

- [ ] 9.2 Implementar ListaMovimientosComponent
  - Actualizar `src/app/features/plan-ahorros/lista-movimientos/lista-movimientos.component.ts`
  - Mostrar lista cronológica de movimientos por categoría (desde route params)
  - Botones para recategorizar en: "Pago Financiero - Otro Banco", "Ingresos", "Operaciones Regulares"
  - Botones para devolver a Movimientos de Caja (subcategorías: Transferencias, Retiros, Depósitos, Otros)
  - Actualizar lista al categorizar
  - _Requirements: 28_

- [ ] 9.3 Implementar MovimientosCajaDetalleComponent
  - Actualizar `src/app/features/plan-ahorros/movimientos-caja-detalle/movimientos-caja-detalle.component.ts`
  - Mostrar título del tipo seleccionado (Transferencias, Retiros, Depósitos, Otros) desde route params
  - Mostrar lista cronológica con nombre, monto, fecha
  - Botones para recategorizar en: "Pago Financiero - Otro Banco", "Ingresos", "Operaciones Regulares"
  - _Requirements: 28_

- [ ] 10. Implementar módulo Plan de Ahorros - Parte 4 (Operaciones recurrentes y chanchitos)
  - Crear vista CRUD de operaciones recurrentes
  - Implementar transferencia a chanchitos
  - Implementar drag-to-save
  - Implementar vinculación de operaciones
  - _Requirements: 29, 37, 38, 44_

- [ ] 10.1 Implementar OperacionesRecurrentesComponent
  - Actualizar `src/app/features/plan-ahorros/operaciones-recurrentes/operaciones-recurrentes.component.ts`
  - Listar operaciones recurrentes programadas
  - Permitir crear nueva operación (título, monto, fechas, día del mes o "fin_de_mes")
  - Permitir editar operación existente
  - Permitir eliminar operación
  - Permitir activar/desactivar
  - Mostrar operaciones generadas por cada recurrente
  - Generar automáticamente operaciones mensuales entre fechaInicio y fechaFin
  - _Requirements: 37_

- [ ] 10.2 Crear componentes de ahorro
  - Crear `src/app/shared/components/transferencia-ahorro-modal/transferencia-ahorro-modal.component.ts`
  - Crear `src/app/shared/components/drag-to-save/drag-to-save.component.ts` con gesto de arrastre
  - Mostrar campo para ingresar monto y selector de chanchito
  - Actualizar saldoChanchitos y ahorroChanchitosDelMes (sin crear operación visible)
  - Mostrar mensaje de éxito
  - Drag-to-save solo aparece en mes actual
  - _Requirements: 29, 44_

- [ ] 10.3 Crear VincularOperacionModalComponent
  - Crear `src/app/shared/components/vincular-operacion-modal/vincular-operacion-modal.component.ts`
  - Mostrar lista de operaciones recurrentes activas
  - Permitir seleccionar una para vincular
  - Mostrar confirmación antes de vincular
  - Actualizar categoriaUsuario y operacionRecurrenteId de la operación
  - Añadir ID de operación a operacionesGeneradas de la recurrente
  - Mostrar indicador visual de que operación está vinculada
  - _Requirements: 38_

- [ ] 11. Implementar módulo Plan de Ahorros - Parte 5 (Interacciones avanzadas)
  - Implementar pull-to-refresh
  - Implementar modal de categorización
  - Pulir transiciones y animaciones
  - _Requirements: 30, 40_

- [ ] 11.1 Implementar pull-to-refresh en PlanAhorrosComponent
  - Detectar gesto de arrastre hacia abajo (pull-to-refresh)
  - Llamar a `refreshPlanAhorros()` del servicio
  - Mostrar indicador de carga
  - Actualizar datos del plan
  - Funcionalidad debe trabajar en móvil y desktop
  - _Requirements: 30_

- [ ] 11.2 Crear CategorizarMovimientoModalComponent
  - Crear `src/app/shared/components/categorizar-movimiento-modal/categorizar-movimiento-modal.component.ts`
  - Mostrar lista de movimientos sin categorizar
  - Permitir seleccionar categoría: Ingresos, Operaciones Regulares, Pagos Financieros (Otros Bancos)
  - Guardar categorización actualizando categoriaUsuario
  - Cerrar modal
  - _Requirements: 40_

- [ ] 12. Implementar módulos Alertas y Recompensas
  - Crear vistas de alertas y recompensas
  - Integrar con servicios
  - _Requirements: 3, 5_

- [ ] 12.1 Implementar AlertasComponent
  - Actualizar `src/app/features/alertas/alertas.component.ts` con template completo
  - Mostrar lista de alertas por severidad
  - Crear `src/app/shared/components/alerta-detail/alerta-detail.component.ts` para detalle
  - Permitir marcar como leídas
  - Mostrar acciones sugeridas (pagar en cuotas, etc.)
  - Integrar con AlertasService
  - _Requirements: 3_

- [ ] 12.2 Implementar RecompensasComponent
  - Actualizar `src/app/features/recompensas/recompensas.component.ts` con template completo
  - Mostrar categorías de beneficios: descuentos, promociones, ampliación TC, tipo de cambio
  - Crear `src/app/shared/components/recompensa-category/recompensa-category.component.ts` por categoría
  - Crear `src/app/shared/components/promocion-card/promocion-card.component.ts` para promociones destacadas
  - Integrar con RecompensasService
  - _Requirements: 5_

- [ ] 13. Organizar assets y documentación
  - Organizar iconos SVG
  - Organizar imágenes
  - Crear README.md por carpeta de assets
  - _Requirements: 6, 16_

- [ ] 13.1 Organizar assets/icons/
  - Agregar iconos SVG necesarios: chicho.svg, alert-warning.svg, alert-danger.svg, alert-info.svg, reward.svg, piggy-bank.svg, home.svg, chat.svg, menu.svg, close.svg, send.svg, search.svg, filter.svg, check.svg, arrow-right.svg, settings.svg, plus.svg, back.svg, edit.svg
  - Crear `src/assets/icons/README.md` con instrucciones de reemplazo
  - Todos los iconos deben ser SVG 24x24px con currentColor
  - _Requirements: 6_

- [ ] 13.2 Organizar assets/images/
  - Agregar avatar-chicho.png para chat
  - Agregar empty-state-plan.svg para estado sin plan
  - Agregar gradient-promo.png para cards de promoción
  - Crear `src/assets/images/README.md` con instrucciones de dimensiones y formatos
  - _Requirements: 6_

- [ ]* 14. Testing y validación
  - Validar cálculos financieros
  - Validar navegación entre meses
  - Validar saldos multi-mes
  - Validar pills de alerta
  - _Requirements: 31, 32, 35, 36, 39, 45_

- [ ]* 14.1 Validar cálculos del plan de ahorros
  - Verificar cálculo de saldo actual (excluye operaciones vinculadas)
  - Verificar cálculo de "Por Pagar" (incluye atrasadas)
  - Verificar clasificación de gastos (hormiga/medio/excepcional) con fórmula automática
  - Verificar pills de alerta (ámbar/rojo) en totales de subsecciones
  - Verificar que pills solo se muestran en categorías con tope configurado
  - _Requirements: 31, 32, 40, 45, 46_

- [ ]* 14.2 Validar navegación y consistencia multi-mes
  - Verificar navegación entre Agosto-Noviembre
  - Validar que saldoInicial de mes N = saldoFinal de mes N-1
  - Verificar operaciones atrasadas del mes anterior
  - Verificar mensaje de error si hay inconsistencias en validacionSaldos
  - _Requirements: 35, 36, 39_

- [ ]* 15. Deploy a Vercel
  - Configurar proyecto en Vercel
  - Verificar build de producción
  - Verificar routing en producción
  - _Requirements: 17_

- [ ]* 15.1 Preparar build de producción
  - Ejecutar `ng build --configuration production`
  - Verificar que no hay errores de compilación
  - Verificar tamaño de bundles
  - Verificar que vercel.json está configurado correctamente
  - _Requirements: 17_

- [ ]* 15.2 Deploy a Vercel
  - Conectar repositorio con Vercel
  - Configurar variables de entorno si es necesario
  - Verificar que la aplicación funciona en producción
  - Verificar que el routing funciona correctamente (fallback a index.html)
  - _Requirements: 17_

---

## Notes

- Las tareas están ordenadas para construir incrementalmente
- Cada tarea referencia los requisitos específicos que implementa
- Las tareas marcadas con * son opcionales (testing y deployment)
- Priorizar funcionalidad core sobre edge cases
- Los datos mock deben ser realistas y basados en el Excel proporcionado
- Los pills de alerta solo se aplican a totales, no a valores individuales de TD/TC
- Solo las categorías con tope configurado muestran pills (Carga Financiera 30%, Gastos 10% c/u)
- Las operaciones vinculadas a recurrentes se excluyen de cálculos para evitar duplicados
- La clasificación de gastos usa fórmula automática: Hormiga (20% ingreso diario), Medio (50% ingreso diario)
- Las transferencias a chanchitos son operaciones internas que no crean operaciones visibles
- El sistema de filtros flexible permite ajustar lógica de negocio fácilmente
