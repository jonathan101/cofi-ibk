# Requirements Document

## Introduction

Este documento define los requisitos para una Prueba de Concepto (PoC) de una aplicación web Angular que implementa "Chicho" - un chatbot inteligente de ahorro para la aplicación Interbank. La aplicación debe proporcionar una experiencia responsive que simula un dispositivo móvil en desktop y se adapta completamente en dispositivos móviles reales. El chatbot ofrece búsqueda inteligente de gastos, recomendaciones contextuales de descuentos, sistema de recompensas y resumen de planes de ahorro. La implementación debe refactorizar HTMLs existentes generados por Stitch en componentes Angular reutilizables, preparados para integración futura de APIs.

## Glossary

- **Chicho**: Chanchito Inteligente del Ahorro - el chatbot de la aplicación
- **PoC**: Prueba de Concepto (Proof of Concept)
- **Sistema Angular**: La aplicación web desarrollada en Angular framework
- **Contenedor Móvil**: El marco visual que simula un dispositivo móvil en pantallas desktop
- **Motor de Chat**: El componente que gestiona la interfaz conversacional del chatbot
- **Módulo de Recompensas**: El sistema que muestra descuentos, promociones y beneficios
- **Panel de Resumen**: La vista que muestra el plan de ahorros con ingresos, gastos y pagos
- **Servicio de API Mock**: Los servicios Angular preparados para conectar APIs reales pero que actualmente retornan datos estáticos
- **HTML Stitch**: Los archivos HTML generados por la herramienta Stitch que deben ser refactorizados
- **Hook de Refactorización**: El agent hook que procesa automáticamente los HTMLs al hacer pull del repositorio
- **Vista Home**: La pantalla principal de la aplicación desde donde se accede a Chicho
- **Botón Flotante Chicho**: El botón circular con el icono de Chicho que abre el chat
- **Badge de Notificaciones**: El indicador numérico que muestra mensajes pendientes de leer
- **Vista de Alertas**: La sección que muestra operaciones o gastos que comprometen el plan de ahorro
- **Panel de Chat**: La interfaz conversacional que se abre al presionar el Botón Flotante Chicho
- **Configurador de Comunicación**: El checklist que permite filtrar tipos de mensajes en el chat
- **Lineamientos Interbank**: Los estándares de diseño visual y UX de la aplicación Interbank

## Requirements

### Requirement 1

**User Story:** Como usuario, quiero ver una pantalla home con un botón flotante de Chicho, para acceder rápidamente al chatbot y ver cuántas notificaciones tengo pendientes

#### Acceptance Criteria

1. THE Sistema Angular SHALL mostrar una Vista Home como pantalla inicial de la aplicación
2. THE Vista Home SHALL incluir un Botón Flotante Chicho posicionado en la esquina inferior derecha
3. THE Botón Flotante Chicho SHALL mostrar el icono de Chicho de forma circular
4. WHEN existen notificaciones pendientes, THE Botón Flotante Chicho SHALL mostrar un Badge de Notificaciones con el número de mensajes sin leer
5. THE Badge de Notificaciones SHALL posicionarse en la esquina superior derecha del Botón Flotante Chicho
6. WHEN un usuario presiona el Botón Flotante Chicho, THE Sistema Angular SHALL abrir el Panel de Chat
7. THE Botón Flotante Chicho SHALL mantener su posición fija durante el scroll de la Vista Home

### Requirement 2

**User Story:** Como usuario, quiero que el chat se abra como vista principal al presionar el botón de Chicho, para interactuar inmediatamente con el asistente

#### Acceptance Criteria

1. WHEN un usuario presiona el Botón Flotante Chicho, THE Sistema Angular SHALL mostrar el Panel de Chat como vista principal
2. THE Panel de Chat SHALL abrirse con una animación suave desde la parte inferior de la pantalla
3. THE Panel de Chat SHALL ocupar la mayor parte de la pantalla manteniendo visibilidad parcial de la Vista Home
4. THE Panel de Chat SHALL incluir un botón de cierre en la parte superior
5. WHEN un usuario cierra el Panel de Chat, THE Sistema Angular SHALL retornar a la Vista Home con animación

### Requirement 3

**User Story:** Como usuario, quiero ver alertas sobre operaciones que ponen en peligro mi plan de ahorro, para tomar decisiones informadas sobre mis finanzas

#### Acceptance Criteria

1. THE Sistema Angular SHALL incluir una Vista de Alertas accesible desde el Panel de Chat
2. THE Vista de Alertas SHALL mostrar operaciones o gastos que exceden los límites del plan de ahorro
3. THE Vista de Alertas SHALL presentar cada alerta con descripción, monto y fecha de la operación
4. THE Vista de Alertas SHALL categorizar alertas por nivel de severidad mediante indicadores visuales
5. WHEN no hay APIs conectadas, THE Vista de Alertas SHALL mostrar datos estáticos de alertas de ejemplo
6. THE Vista de Alertas SHALL permitir marcar alertas como leídas o descartadas

### Requirement 4

**User Story:** Como usuario, quiero que el chat muestre por defecto alertas, recompensas y mensajes conversacionales, para tener una vista completa de toda la información relevante

#### Acceptance Criteria

1. THE Panel de Chat SHALL mostrar por defecto tres tipos de comunicación: alertas, recompensas y mensajes conversacionales
2. THE Panel de Chat SHALL diferenciar visualmente cada tipo de comunicación mediante colores o iconos distintivos
3. THE Panel de Chat SHALL ordenar los mensajes cronológicamente independientemente de su tipo
4. THE Panel de Chat SHALL mostrar alertas con formato destacado para llamar la atención del usuario
5. THE Panel de Chat SHALL integrar recomendaciones de recompensas dentro del flujo conversacional

### Requirement 5

**User Story:** Como usuario, quiero configurar qué tipos de comunicación veo en el chat, para personalizar la información que recibo según mis preferencias

#### Acceptance Criteria

1. THE Panel de Chat SHALL incluir un botón de acceso al Configurador de Comunicación
2. WHEN un usuario accede al Configurador de Comunicación, THE Sistema Angular SHALL mostrar un checklist con opciones de tipos de mensajes
3. THE Configurador de Comunicación SHALL incluir opciones para alertas, recompensas y mensajes conversacionales
4. WHEN un usuario desmarca un tipo de comunicación, THE Panel de Chat SHALL ocultar mensajes de ese tipo
5. THE Sistema Angular SHALL persistir las preferencias del Configurador de Comunicación durante la sesión
6. THE Configurador de Comunicación SHALL mostrar el estado actual de cada filtro de forma clara

### Requirement 6

**User Story:** Como usuario, quiero que la aplicación siga los lineamientos de diseño de Interbank, para tener una experiencia visual consistente con la marca

#### Acceptance Criteria

1. THE Sistema Angular SHALL utilizar la paleta de colores oficial de Interbank incluyendo verde primario y colores secundarios
2. THE Sistema Angular SHALL aplicar la tipografía corporativa de Interbank en todos los textos
3. THE Sistema Angular SHALL seguir los patrones de espaciado y layout definidos en los Lineamientos Interbank
4. THE Sistema Angular SHALL utilizar iconografía consistente con el estilo visual de Interbank
5. THE Sistema Angular SHALL implementar componentes de UI que reflejen el diseño moderno, sencillo e intuitivo de la app Interbank
6. THE Sistema Angular SHALL mantener consistencia visual con la referencia de diseño de interbank.pe

### Requirement 7

**User Story:** Como usuario desktop, quiero ver la aplicación dentro de un marco de celular centrado en mi navegador, para tener una experiencia visual consistente con la versión móvil

#### Acceptance Criteria

1. WHEN un usuario accede desde un dispositivo desktop, THE Sistema Angular SHALL renderizar un Contenedor Móvil centrado en la pantalla
2. THE Contenedor Móvil SHALL mantener dimensiones mínimas de 360px de ancho y 640px de alto
3. THE Contenedor Móvil SHALL ajustarse responsivamente al ancho disponible de la pantalla sin exceder 480px de ancho
4. THE Contenedor Móvil SHALL incluir bordes y sombras que simulen un dispositivo físico
5. WHEN la ventana del navegador se redimensiona, THE Sistema Angular SHALL mantener el Contenedor Móvil centrado y ajustar su tamaño proporcionalmente

### Requirement 2

**User Story:** Como usuario móvil, quiero que la aplicación se ajuste completamente a las dimensiones de mi dispositivo, para aprovechar todo el espacio disponible de mi pantalla

#### Acceptance Criteria

1. WHEN un usuario accede desde un dispositivo móvil, THE Sistema Angular SHALL detectar el tipo de dispositivo
2. WHEN se detecta un dispositivo móvil, THE Sistema Angular SHALL renderizar la aplicación en modo pantalla completa sin Contenedor Móvil
3. THE Sistema Angular SHALL ajustar todos los componentes a las dimensiones reales del dispositivo móvil
4. THE Sistema Angular SHALL mantener la funcionalidad completa en dispositivos móviles con anchos desde 320px

### Requirement 3

**User Story:** Como usuario, quiero interactuar con Chicho mediante conversaciones naturales, para buscar información sobre mis gastos de manera intuitiva

#### Acceptance Criteria

1. THE Motor de Chat SHALL mostrar una interfaz conversacional con mensajes del usuario y respuestas de Chicho
2. WHEN un usuario envía un mensaje, THE Motor de Chat SHALL mostrar el mensaje en el historial de conversación
3. WHEN un usuario envía un prompt sobre gastos, THE Motor de Chat SHALL generar una respuesta estática relevante al contexto
4. THE Motor de Chat SHALL permitir scroll en el historial de conversación cuando exceda el área visible
5. THE Motor de Chat SHALL incluir un campo de entrada de texto y botón de envío siempre visible

### Requirement 4

**User Story:** Como usuario, quiero recibir recomendaciones de descuentos basadas en el contexto de mi conversación con Chicho, para aprovechar mejor mis beneficios

#### Acceptance Criteria

1. WHEN un usuario menciona categorías de gasto en la conversación, THE Motor de Chat SHALL mostrar recomendaciones de descuentos relacionadas
2. THE Motor de Chat SHALL presentar las recomendaciones con formato visual distintivo dentro de la conversación
3. THE Motor de Chat SHALL incluir información del descuento como porcentaje, comercio y condiciones
4. WHEN no hay APIs conectadas, THE Motor de Chat SHALL utilizar datos estáticos de recomendaciones predefinidas

### Requirement 5

**User Story:** Como usuario, quiero acceder a una sección de recompensas, para ver todos los beneficios disponibles como descuentos, promociones y ampliaciones de tarjeta

#### Acceptance Criteria

1. THE Sistema Angular SHALL incluir una pestaña o sección dedicada al Módulo de Recompensas
2. THE Módulo de Recompensas SHALL mostrar categorías de beneficios incluyendo descuentos, promociones, ampliación de TC y tipo de cambio preferencial
3. THE Módulo de Recompensas SHALL presentar cada recompensa con título, descripción y condiciones de uso
4. WHEN no hay APIs conectadas, THE Módulo de Recompensas SHALL mostrar datos estáticos de recompensas de ejemplo
5. THE Módulo de Recompensas SHALL permitir navegación entre diferentes categorías de beneficios

### Requirement 6

**User Story:** Como usuario, quiero ver un resumen de mi plan de ahorros, para entender mis ingresos, gastos y pagos financieros de manera clara

#### Acceptance Criteria

1. THE Sistema Angular SHALL incluir un Panel de Resumen accesible desde la navegación principal
2. THE Panel de Resumen SHALL mostrar secciones diferenciadas para ingresos, gastos y pagos financieros
3. THE Panel de Resumen SHALL presentar totales calculados para cada categoría
4. THE Panel de Resumen SHALL incluir visualizaciones gráficas o indicadores visuales del estado del ahorro
5. WHEN no hay APIs conectadas, THE Panel de Resumen SHALL mostrar datos estáticos de ejemplo que demuestren la funcionalidad

### Requirement 14

**User Story:** Como desarrollador, quiero que los componentes estén preparados para conectar APIs reales, para facilitar la integración futura sin refactorización mayor

#### Acceptance Criteria

1. THE Sistema Angular SHALL implementar servicios Angular con métodos definidos para cada llamada de API futura
2. THE Servicio de API Mock SHALL incluir interfaces TypeScript que definan la estructura de datos esperada de las APIs
3. THE Servicio de API Mock SHALL retornar Observables con datos estáticos que coincidan con las interfaces definidas
4. THE Sistema Angular SHALL incluir comentarios en el código indicando dónde reemplazar URLs de API y lógica mock
5. THE Sistema Angular SHALL separar la lógica de presentación de la lógica de datos mediante servicios inyectables

### Requirement 15

**User Story:** Como desarrollador, quiero que los HTMLs de Stitch sean refactorizados automáticamente en componentes Angular, para mantener consistencia y reutilización de código

#### Acceptance Criteria

1. THE Sistema Angular SHALL mantener los archivos HTML Stitch originales en un directorio separado sin modificación
2. WHEN se ejecuta el Hook de Refactorización, THE Sistema Angular SHALL generar componentes Angular basados en los HTML Stitch
3. THE Hook de Refactorización SHALL extraer estilos inline a archivos SCSS con variables parametrizadas
4. THE Hook de Refactorización SHALL identificar y crear componentes reutilizables para elementos repetidos
5. THE Hook de Refactorización SHALL mantener la estructura visual y funcionalidad del HTML original

### Requirement 16

**User Story:** Como desarrollador, quiero que los estilos utilicen variables SCSS, para facilitar la personalización y mantenimiento del tema visual

#### Acceptance Criteria

1. THE Sistema Angular SHALL definir variables SCSS para colores, tipografías, espaciados y breakpoints
2. THE Sistema Angular SHALL utilizar las variables SCSS en todos los archivos de estilos de componentes
3. THE Sistema Angular SHALL organizar las variables SCSS en archivos temáticos separados
4. THE Sistema Angular SHALL incluir variables específicas para los colores de marca de Interbank
5. THE Sistema Angular SHALL aplicar las variables SCSS de manera consistente en todos los componentes

### Requirement 17

**User Story:** Como desarrollador, quiero que el proyecto respete las mejores prácticas de Angular, para asegurar mantenibilidad y escalabilidad del código

#### Acceptance Criteria

1. THE Sistema Angular SHALL organizar el código en módulos funcionales separados
2. THE Sistema Angular SHALL implementar lazy loading para módulos no críticos
3. THE Sistema Angular SHALL utilizar componentes standalone donde sea apropiado
4. THE Sistema Angular SHALL seguir la guía de estilos oficial de Angular para nomenclatura y estructura
5. THE Sistema Angular SHALL incluir un archivo de configuración de dependencias con versiones específicas compatibles

### Requirement 18

**User Story:** Como usuario, quiero poder navegar entre las diferentes secciones de la aplicación, para explorar todas las funcionalidades disponibles

#### Acceptance Criteria

1. THE Sistema Angular SHALL implementar un sistema de navegación con pestañas o menú para acceder a Recompensas y Resumen
2. WHEN un usuario selecciona una sección, THE Sistema Angular SHALL cambiar la vista activa sin recargar la página
3. THE Sistema Angular SHALL mantener el estado de la conversación del chat al navegar entre secciones
4. THE Sistema Angular SHALL indicar visualmente la sección activa en el sistema de navegación
5. THE Sistema Angular SHALL permitir navegación mediante gestos táctiles en dispositivos móviles

### Requirement 27

**User Story:** Como usuario, quiero ver el detalle de mis gastos con filtros y lista de operaciones, para analizar mejor mis patrones de gasto

#### Acceptance Criteria

1. THE vista de detalle de gastos SHALL incluir un filtro con opciones: Todos, Gastos Hormiga, Gastos Medios, Gastos Excepcionales
2. THE vista SHALL mostrar gráfico de barras horizontales con 9 tipos de consumo + Otros en color azul configurable
3. THE vista SHALL mostrar lista cronológica de operaciones debajo del gráfico con monto y fecha
4. WHEN un usuario cambia el filtro, THE Sistema Angular SHALL actualizar el gráfico y la lista de operaciones según la selección
5. THE vista SHALL incluir comentario resumen generado por IA específico para el filtro seleccionado
6. THE Sistema Angular SHALL mantener el estado del filtro durante la sesión

### Requirement 28

**User Story:** Como usuario, quiero ver el detalle de un tipo específico de Movimiento de Caja, para revisar operaciones específicas como transferencias o retiros

#### Acceptance Criteria

1. THE sección Movimientos de Caja SHALL mostrar 4 items: Transferencias, Retiros, Depósitos, Otros
2. THE cada item SHALL incluir botón "Ver más"
3. WHEN un usuario hace clic en "Ver más" de un item, THE Sistema Angular SHALL navegar a vista de detalle del tipo seleccionado
4. THE vista de detalle SHALL mostrar título del tipo (ej: "Transferencias")
5. THE vista de detalle SHALL presentar lista cronológica de operaciones con nombre, monto y fecha
6. THE cada operación SHALL incluir botones para recategorizar en: "Pago Financiero - Otro Banco", "Ingresos", "Operaciones Regulares"
7. WHEN un usuario recategoriza una operación, THE Sistema Angular SHALL actualizar la lista y refrescar la vista

### Requirement 29

**User Story:** Como usuario, quiero transferir dinero a mis chanchitos de ahorro mediante un gesto intuitivo, para hacer el ahorro más interactivo y divertido

#### Acceptance Criteria

1. THE Panel de Resumen SHALL mostrar un icono circular de dinero deslizable
2. THE Panel de Resumen SHALL mostrar un icono de chanchito como destino del arrastre
3. WHEN un usuario arrastra el icono de dinero hacia el chanchito, THE Sistema Angular SHALL detectar el gesto
4. WHEN el arrastre se completa exitosamente, THE Sistema Angular SHALL abrir modal de transferencia al ahorro
5. THE modal SHALL mostrar campo para ingresar monto y selector de chanchito de ahorro (Primer depa, Primer carro, Viaje, etc.)
6. WHEN un usuario confirma la transferencia, THE Sistema Angular SHALL mostrar mensaje de éxito y actualizar vista del plan
7. WHEN un usuario refresca la página, THE cambios SHALL resetearse ya que la PoC no persiste datos de chanchitos

### Requirement 30

**User Story:** Como usuario, quiero refrescar mi plan de ahorros arrastrando hacia abajo, para obtener datos actualizados de manera intuitiva como en apps móviles

#### Acceptance Criteria

1. THE Panel de Resumen SHALL detectar gesto de arrastre hacia abajo (pull-to-refresh)
2. WHEN un usuario arrastra hacia abajo, THE Sistema Angular SHALL mostrar indicador de carga
3. THE Sistema Angular SHALL recargar datos del plan de ahorros desde el servicio
4. WHEN los datos se cargan, THE Sistema Angular SHALL actualizar la vista con datos frescos
5. THE indicador de carga SHALL desaparecer al completar la recarga
6. THE funcionalidad SHALL funcionar tanto en dispositivos móviles como en desktop

## Glossary Additions

- **Chanchito de Ahorro**: Meta de ahorro específica con nombre personalizado (Primer depa, Primer carro, Viaje, etc.)
- **Drag-to-Save**: Gesto de arrastrar icono de dinero hacia chanchito para transferir al ahorro
- **Pull-to-Refresh**: Gesto de arrastrar vista hacia abajo para recargar datos, común en aplicaciones móviles
- **Filtro de Gastos**: Selector que permite ver gastos por categoría: Todos, Gastos Hormiga, Gastos Medios, Gastos Excepcionales
- **Operaciones Regulares**: Categoría que agrupa movimientos recurrentes que no son solo transferencias sino también otros tipos de operaciones bancarias
- **Movimientos de Caja**: Categoría que agrupa Transferencias, Retiros, Depósitos y Otros movimientos bancarios básicos

### Requirement 31

**User Story:** Como usuario, quiero que mi saldo actual se calcule automáticamente sumando todas mis operaciones financieras, para tener una visión precisa de mi situación financiera

#### Acceptance Criteria

1. THE Sistema Angular SHALL calcular el saldo actual usando la fórmula: saldoInicial + ingresos + operacionesRegulares + gastos + movimientosCaja + cargaFinanciera
2. THE cada categoría SHALL sumar todas las operaciones que pertenezcan a esa categoría
3. THE Sistema Angular SHALL permitir filtrar operaciones por estado (pagado/pendiente) para cálculos específicos
4. THE carga financiera SHALL sumar solo operaciones con estado "pagado"
5. THE Sistema Angular SHALL mostrar el saldo actual calculado en la parte superior del Panel de Resumen
6. THE cálculo SHALL actualizarse automáticamente cuando se añadan, modifiquen o eliminen operaciones

### Requirement 32

**User Story:** Como usuario, quiero ver el total "Por Pagar" en el resumen, para saber cuánto debo pagar próximamente

#### Acceptance Criteria

1. THE Panel de Resumen SHALL mostrar una sección "Por Pagar" en la parte superior
2. THE "Por Pagar" SHALL calcularse sumando operaciones pendientes de Carga Financiera y Operaciones Regulares
3. THE Sistema Angular SHALL filtrar operaciones con estado "pendiente" para el cálculo
4. THE "Por Pagar" SHALL actualizarse automáticamente cuando cambie el estado de operaciones
5. THE "Por Pagar" SHALL mostrarse con formato destacado para llamar la atención del usuario

### Requirement 33

**User Story:** Como usuario, quiero que cada sección del plan de ahorros sea colapsable, para enfocarme en la información que me interesa

#### Acceptance Criteria

1. THE cada sección del Panel de Resumen SHALL incluir un icono de colapsar/descolapsar
2. WHEN un usuario hace clic en el icono de una sección, THE Sistema Angular SHALL colapsar o descolapsar esa sección con transición smooth
3. THE Panel de Resumen SHALL incluir un botón global para colapsar/descolapsar todas las secciones simultáneamente
4. THE transiciones SHALL seguir prácticas de apps móviles modernas con animaciones suaves
5. THE Sistema Angular SHALL mantener el estado de colapso de cada sección durante la sesión
6. THE secciones colapsadas SHALL mostrar solo el título y el total, ocultando el detalle de operaciones

### Requirement 34

**User Story:** Como desarrollador, quiero un sistema de filtros flexible tipo query builder para calcular totales, para poder ajustar la lógica de negocio de manera rápida y sencilla

#### Acceptance Criteria

1. THE Sistema Angular SHALL implementar interfaz `FiltroOperacion` con múltiples criterios de filtrado
2. THE interfaz SHALL soportar filtros por: categoría (simple o múltiple), estado, tipo, rango de fechas, rango de montos, descripción y condiciones personalizadas
3. THE función `sumarOperaciones(filtros: FiltroOperacion)` SHALL aplicar todos los filtros especificados
4. THE Sistema Angular SHALL soportar operadores de comparación: =, !=, >, <, >=, <=, contains, in, not_in
5. THE Sistema Angular SHALL permitir condiciones personalizadas mediante interfaz `CondicionCustom`
6. THE código SHALL incluir ejemplos documentados de uso común (carga financiera pagada, por pagar, gastos del mes, etc.)
7. THE Sistema Angular SHALL separar la lógica de evaluación de condiciones en método privado reutilizable
8. THE función SHALL ser fácilmente extensible para agregar nuevos operadores o criterios de filtrado

### Requirement 35

**User Story:** Como usuario, quiero navegar entre diferentes meses para ver mi historial financiero, para analizar mi comportamiento de ahorro a lo largo del tiempo

#### Acceptance Criteria

1. THE Panel de Resumen SHALL incluir un selector de mes en el header
2. THE selector SHALL mostrar meses disponibles: Agosto 2024, Septiembre 2024, Octubre 2024, Noviembre 2024
3. WHEN un usuario selecciona un mes, THE Sistema Angular SHALL cargar los datos de ese mes específico
4. THE Sistema Angular SHALL indicar visualmente el mes actual (Noviembre 2024)
5. THE saldo inicial de cada mes SHALL ser igual al saldo final del mes anterior
6. THE Sistema Angular SHALL calcular el saldo final sumando todas las operaciones del mes

### Requirement 36

**User Story:** Como usuario, quiero ver operaciones atrasadas del mes anterior, para saber qué pagos no realicé a tiempo

#### Acceptance Criteria

1. WHEN existen operaciones pendientes del mes anterior, THE Panel de Resumen SHALL mostrar secciones "Pagos Financieros Atrasados" y "Operaciones Recurrentes Atrasadas"
2. THE secciones atrasadas SHALL mostrarse con indicador visual destacado (color rojo o badge)
3. THE operaciones atrasadas SHALL incluir campo `esAtrasada: true`
4. THE operaciones atrasadas SHALL sumar al total "Por Pagar"
5. THE Sistema Angular SHALL mostrar solo operaciones con estado "pendiente" y fechaPagoMaxima del mes anterior

### Requirement 37

**User Story:** Como usuario, quiero programar operaciones recurrentes, para no tener que registrar manualmente pagos que se repiten cada mes

#### Acceptance Criteria

1. THE Sistema Angular SHALL incluir ruta `/plan-ahorros/operaciones-recurrentes` para gestionar operaciones programadas
2. THE vista SHALL permitir crear nueva operación recurrente con: título, monto, fecha inicio, fecha fin, día del mes
3. THE día del mes SHALL aceptar número (1-31) o "fin_de_mes"
4. WHEN un usuario crea operación recurrente, THE Sistema Angular SHALL generar automáticamente operaciones mensuales entre fechaInicio y fechaFin
5. THE vista SHALL permitir editar, eliminar y activar/desactivar operaciones recurrentes
6. THE vista SHALL mostrar lista de operaciones generadas por cada recurrente

### Requirement 38

**User Story:** Como usuario, quiero vincular operaciones reales con operaciones recurrentes programadas, para mantener mi registro organizado

#### Acceptance Criteria

1. THE cada operación en el Panel de Resumen SHALL incluir opción "Vincular con operación recurrente"
2. WHEN un usuario selecciona vincular, THE Sistema Angular SHALL abrir modal con lista de operaciones recurrentes activas
3. THE modal SHALL mostrar confirmación antes de vincular
4. WHEN un usuario confirma vinculación, THE Sistema Angular SHALL actualizar `categoriaUsuario` de la operación
5. THE Sistema Angular SHALL actualizar `operacionRecurrenteId` de la operación
6. THE Sistema Angular SHALL añadir ID de operación a `operacionesGeneradas` de la recurrente
7. THE operación vinculada SHALL mostrarse con indicador visual de que pertenece a una recurrente

### Requirement 39

**User Story:** Como usuario, quiero que el sistema valide la consistencia de saldos entre meses, para detectar errores en mis datos financieros

#### Acceptance Criteria

1. THE Sistema Angular SHALL validar que el saldo inicial de cada mes sea igual al saldo final del mes anterior
2. WHEN existe inconsistencia, THE Sistema Angular SHALL mostrar mensaje de error en `validacionSaldos.errores`
3. THE Sistema Angular SHALL permitir visualizar datos incluso con errores de validación
4. THE validación SHALL ejecutarse al cargar datos multi-mes
5. THE Sistema Angular SHALL mostrar indicador visual si hay errores de validación

### Requirement 40

**User Story:** Como usuario, quiero que las operaciones vinculadas a recurrentes no se dupliquen en los cálculos, para tener saldos precisos

#### Acceptance Criteria

1. WHEN una operación tiene `vinculadaARecurrente: true`, THE Sistema Angular SHALL excluirla de su categoría original en los cálculos
2. THE operación vinculada SHALL aparecer solo en la sección de operaciones recurrentes
3. THE Sistema Angular SHALL usar `categoriaUsuario` con prioridad sobre `categoria` para determinar dónde mostrar la operación
4. THE filtro de operaciones SHALL soportar `vinculadaARecurrente: false` para excluir vinculadas
5. THE Sistema Angular SHALL mantener la operación original intacta, solo cambiar su visualización

### Requirement 41

**User Story:** Como usuario, quiero ver el saldo de mis chanchitos de ahorro separado del saldo principal, para entender mejor mi situación financiera

#### Acceptance Criteria

1. THE Panel de Resumen SHALL mostrar `saldoChanchitos` separado del `saldoActual`
2. THE saldo inicial SHALL excluir el dinero en chanchitos (solo cuentas en soles)
3. THE Sistema Angular SHALL permitir excluir cuentas específicas del saldo inicial en configuración
4. THE Panel de Resumen SHALL mostrar `ahorroChanchitosDelMes` para el mes actual
5. WHEN usuario transfiere a chanchito, THE Sistema Angular SHALL actualizar ambos valores temporalmente
6. THE drag-to-save SHALL aparecer solo cuando se visualiza el mes actual

### Requirement 42

**User Story:** Como usuario, quiero que la configuración del plan sea histórica, para poder ajustar parámetros sin afectar meses anteriores

#### Acceptance Criteria

1. THE configuración del plan SHALL incluir `fechaVigencia` indicando desde cuándo aplica
2. THE configuración SHALL incluir `aplicaAMesesAnteriores` para controlar si afecta histórico
3. WHEN `aplicaAMesesAnteriores: false`, THE Sistema Angular SHALL mantener configuración original de meses anteriores
4. WHEN `aplicaAMesesAnteriores: true`, THE Sistema Angular SHALL recalcular todos los meses con nueva configuración
5. THE Sistema Angular SHALL permitir modificaciones manuales de configuración por mes si es necesario

### Requirement 43

**User Story:** Como usuario, quiero una interfaz sencilla para configurar mi plan de ahorros, para entender fácilmente qué estoy modificando

#### Acceptance Criteria

1. THE vista de configuración SHALL mostrar "Configuración Vigente - Desde: [Mes Actual]" en el header
2. THE vista SHALL incluir radio buttons para límites de gastos con opciones "Automático" y "Manual"
3. WHEN "Automático" está seleccionado, THE Sistema Angular SHALL mostrar el monto calculado según fórmula
4. WHEN "Manual" está seleccionado, THE Sistema Angular SHALL permitir ingresar monto personalizado
5. THE vista SHALL incluir checkboxes para seleccionar cuentas excluidas del saldo inicial
6. THE vista SHALL mostrar advertencia clara: "Esta configuración aplicará desde [Mes] en adelante. Los meses anteriores mantendrán su configuración original"
7. THE vista SHALL incluir link a "Operaciones Recurrentes" para no sobrecargar la interfaz
8. THE vista SHALL incluir botón "Hablar con Chicho" para obtener ayuda conversacional

### Requirement 44

**User Story:** Como usuario, quiero que las transferencias al chanchito sean operaciones internas, para mantener mi lista de operaciones limpia

#### Acceptance Criteria

1. WHEN usuario transfiere dinero a un chanchito, THE Sistema Angular SHALL actualizar `ahorroChanchitosDelMes` sin crear operación visible
2. THE Sistema Angular SHALL actualizar `saldoChanchitos` sumando el monto transferido
3. THE Sistema Angular SHALL actualizar `montoActual` del chanchito seleccionado
4. THE transferencia SHALL ser temporal y desaparecer al refrescar la página (PoC)
5. THE lista de operaciones del mes SHALL permanecer sin cambios
6. THE saldo actual mostrado SHALL permanecer sin cambios (chanchitos no afectan saldo)

### Requirement 45

**User Story:** Como usuario, quiero ver subsecciones en Gastos con consumo por tipo de producto, para entender mejor cómo estoy gastando

#### Acceptance Criteria

1. THE sección de Gastos SHALL mostrar 4 subsecciones: Cobros Automáticos, Gastos Hormiga, Gastos Medios, Gastos Excepcionales
2. THE cada subsección SHALL mostrar botón "Ver más" alineado a la derecha
3. THE cada subsección SHALL mostrar 3 valores:
   - Consumo Débito (TD)
   - Consumo TC
   - Total
4. THE Total SHALL mostrarse con pill de color según porcentaje usado del tope mensual:
   - Normal (< 90%): texto normal sin pill
   - Ámbar (90-100%): pill amarillo con porcentaje
   - Rojo (> 100%): pill rojo con porcentaje
5. THE Sistema Angular SHALL calcular consumo TD sumando operaciones con `tipoProducto: 'TD'`
6. THE Sistema Angular SHALL calcular consumo TC sumando operaciones con `tipoProducto: 'TC'`

### Requirement 46

**User Story:** Como usuario, quiero configurar topes mensuales para todas las secciones, para controlar mis gastos totales por categoría

#### Acceptance Criteria

1. THE Sistema Angular SHALL incluir ruta `/plan-ahorros/configurar/topes-mensuales`
2. THE vista SHALL permitir configurar topes mensuales para: Cobros Automáticos, Gastos Hormiga, Gastos Medios, Gastos Excepcionales, Carga Financiera, Movimientos de Caja, Operaciones Recurrentes
3. THE cada tope SHALL permitir elegir entre Porcentaje del ingreso o Monto Fijo
4. WHEN existe monto fijo, THE Sistema Angular SHALL usar ese con prioridad sobre porcentaje
5. THE vista SHALL mostrar monto calculado si se usa porcentaje
6. THE configuración SHALL aplicar desde el mes actual en adelante

### Requirement 47

**User Story:** Como usuario, quiero configurar cómo se clasifican los gastos individuales, para personalizar los límites de hormiga/medio/excepcional

#### Acceptance Criteria

1. THE Sistema Angular SHALL incluir ruta `/plan-ahorros/configurar/clasificacion-gastos`
2. THE vista SHALL permitir configurar tope para clasificar un gasto como "Hormiga"
3. THE vista SHALL permitir configurar tope para clasificar un gasto como "Medio"
4. THE cada tope SHALL permitir elegir entre Automático (fórmula) o Manual
5. WHEN Automático está seleccionado, THE Sistema Angular SHALL mostrar monto calculado según fórmula
6. WHEN Manual está seleccionado, THE Sistema Angular SHALL permitir ingresar monto personalizado
7. THE configuración SHALL aplicar desde el mes actual en adelante

### Requirement 48

**User Story:** Como usuario, quiero que cada operación tenga tipo de producto (TC/TD), para ver consumos separados por método de pago

#### Acceptance Criteria

1. THE cada operación SHALL incluir campo `tipoProducto: 'TC' | 'TD'`
2. THE Sistema Angular SHALL usar este campo para calcular "Consumo Débito" y "Consumo TC"
3. THE campo SHALL ser obligatorio para todas las operaciones
4. THE datos mock SHALL incluir `tipoProducto` en todas las operaciones de ejemplo

### Requirement 49

**User Story:** Como desarrollador, quiero que los datos estáticos estén organizados en archivos JSON separados, para facilitar su mantenimiento y edición

#### Acceptance Criteria

1. THE datos estáticos SHALL organizarse en carpeta `DataEstatica/` con subcarpetas por tipo
2. THE datos SHALL separarse en archivos individuales: cliente.json, configuracion-plan.json, chanchitos-ahorro.json, operaciones-recurrentes.json
3. THE datos de chat SHALL organizarse en subcarpeta `chat/` con archivos separados
4. THE operaciones SHALL organizarse en subcarpeta `operaciones/` con un archivo por mes
5. THE cada mes SHALL contener 100 operaciones (excepto Noviembre con 50)
6. THE operaciones SHALL distribuirse 60% TD / 40% TC
7. THE tipo de producto SHALL respetar lógica de categoría (transferencias siempre TD, compras online siempre TC, etc.)
8. THE operaciones SHALL incluir variedad realista de gastos, ingresos y movimientos


### Requirement 50

**User Story:** Como usuario, quiero que todas las vistas tengan scroll funcional y elementos de navegación visibles dentro del marco del celular, para poder acceder a todo el contenido de manera intuitiva

#### Acceptance Criteria

1. THE Sistema Angular SHALL configurar cada vista con un contenedor principal que use `overflow: hidden` para evitar que el contenido se salga del marco
2. THE contenido scrolleable SHALL estar en un elemento hijo con `overflow-y: auto` y `flex: 1` para ocupar el espacio disponible
3. THE header de cada vista SHALL usar `flex-shrink: 0` para mantener su tamaño fijo y no encogerse durante el scroll
4. THE bottom navigation SHALL usar `position: absolute` con `bottom: 0` para mantenerse siempre visible en la parte inferior del marco del celular
5. THE bottom navigation SHALL usar `flex-shrink: 0` para no encogerse y mantener su altura de 64px
6. THE botón flotante de chat SHALL usar `position: absolute` con coordenadas relativas al contenedor padre para mantenerse dentro del marco
7. THE contenido scrolleable SHALL incluir `padding-bottom` suficiente (80-100px) para que el último elemento no quede oculto detrás del bottom navigation
8. THE pull-down handle SHALL usar `position: relative` y `flex-shrink: 0` para ser parte del flujo normal del documento
9. THE Sistema Angular SHALL aplicar `-webkit-overflow-scrolling: touch` en iOS para scroll suave
10. WHEN un usuario hace scroll, THE header y bottom navigation SHALL permanecer visibles en sus posiciones fijas
11. THE Sistema Angular SHALL asegurar que todos los elementos de navegación (header, bottom nav, botones flotantes) estén dentro del contenedor móvil en todo momento
