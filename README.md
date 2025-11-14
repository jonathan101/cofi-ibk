# Chicho - Chanchito Inteligente del Ahorro

Prueba de Concepto (PoC) de una aplicación web Angular que implementa "Chicho" - un chatbot inteligente de ahorro para la aplicación Interbank.

## 🚀 Características

- **Chatbot Inteligente**: Interfaz conversacional con Chicho para gestión de ahorros
- **Plan de Ahorros**: Visualización y gestión de ingresos, gastos y metas de ahorro
- **Recompensas**: Sistema de descuentos, promociones y beneficios
- **Alertas**: Notificaciones sobre operaciones que comprometen el plan de ahorro
- **Responsive**: Diseño adaptado para móvil y desktop con simulación de dispositivo móvil

## 🛠️ Tecnologías

- **Angular 18.2** con Standalone Components
- **TypeScript 5.5**
- **SCSS** con variables parametrizadas
- **RxJS 7.8** para manejo de estado
- **Vercel** para deployment

### Versiones de Dependencias

- Angular: 18.2.13 (última versión estable sin vulnerabilidades)
- TypeScript: 5.5.4
- RxJS: 7.8.1
- Zone.js: 0.14.10
- Todas las dependencias actualizadas a sus últimas versiones seguras

## 📁 Estructura del Proyecto

```
chicho-chatbot-poc/
├── src/
│   ├── app/
│   │   ├── core/              # Servicios singleton y configuración
│   │   ├── shared/            # Componentes reutilizables
│   │   ├── features/          # Módulos de funcionalidad
│   │   │   ├── home/
│   │   │   ├── chat/
│   │   │   ├── plan-ahorros/
│   │   │   ├── recompensas/
│   │   │   └── alertas/
│   │   └── app.routes.ts
│   ├── assets/
│   │   ├── icons/
│   │   ├── images/
│   │   └── data/              # JSON con datos mock
│   └── styles/
│       ├── _variables.scss    # Variables de diseño Interbank
│       ├── _mixins.scss       # Mixins reutilizables
│       └── styles.scss
└── vercel.json
```

## 🎨 Tema Interbank

El proyecto utiliza variables SCSS parametrizadas con los colores y estilos de marca Interbank:

- **Color Primario**: Verde Interbank (#00A651)
- **Tipografía**: Sistema de fuentes modernas
- **Espaciados**: Sistema de espaciado consistente
- **Componentes**: Botones, inputs y cards con estilos Interbank

## 🚦 Comandos

### Instalación

**Opción 1: Usando el archivo batch (recomendado para Windows)**
```bash
install.bat
```

**Opción 2: Usando CMD directamente**
```bash
cmd /c npm install
```

**Opción 3: Si tienes permisos de administrador, habilita PowerShell**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
npm install
```

### Desarrollo

```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200/`

### Build

```bash
npm run build
```

Los archivos compilados estarán en `dist/chicho-chatbot-poc/`

### Tests

```bash
npm test
```

## 📱 Rutas Principales

- `/home` - Vista principal con productos bancarios
- `/chat` - Chat con Chicho
- `/plan-ahorros` - Plan de ahorros
- `/recompensas` - Recompensas y beneficios
- `/alertas` - Alertas financieras

## 🔧 Configuración

### Environments

- `src/environments/environment.development.ts` - Configuración de desarrollo
- `src/environments/environment.ts` - Configuración de producción

Ambos archivos incluyen:
- `apiUrl`: URL de la API (placeholder)
- `useMockData`: Flag para usar datos mock

## 📦 Deployment en Vercel

El proyecto está listo para deployment en Vercel. Ver documentación completa en:
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guía completa de deployment
- **[VERCEL_DEPLOYMENT_CHECKLIST.md](./VERCEL_DEPLOYMENT_CHECKLIST.md)** - Checklist de verificación

### Quick Start

**Opción 1: Vercel Dashboard (Recomendado)**
1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Click "Add New..." → "Project"
3. Selecciona tu repositorio Git
4. Vercel detectará automáticamente Angular
5. Click "Deploy"

**Opción 2: Vercel CLI**
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Configuración

El proyecto incluye `vercel.json` con:
- ✅ Routing SPA configurado (fallback a index.html)
- ✅ Security headers (X-Frame-Options, CSP, etc.)
- ✅ Cache optimization para assets
- ✅ Build command y output directory

### Verificación Post-Deployment

Después del deployment, verifica:
- [ ] Todas las rutas funcionan (navegación directa)
- [ ] Assets se cargan correctamente
- [ ] Estilos Interbank se aplican
- [ ] Datos mock se cargan desde `/assets/data/`

Ver checklist completo en [VERCEL_DEPLOYMENT_CHECKLIST.md](./VERCEL_DEPLOYMENT_CHECKLIST.md)

## 🎯 Próximos Pasos

1. Implementar componentes de UI (Task 2)
2. Crear interfaces TypeScript y datos mock (Task 3)
3. Implementar servicios con fallback a mock data (Task 4)
4. Desarrollar módulos de funcionalidad (Tasks 5-13)

## 📝 Notas

- Este es un PoC que prioriza simplicidad y legibilidad
- Los servicios están preparados para conectar APIs reales con fallback a datos mock
- Los assets (iconos, imágenes) están organizados para fácil reemplazo
- El diseño sigue los lineamientos visuales de Interbank

## 👥 Equipo

Desarrollado como Prueba de Concepto para Interbank

---

**Versión**: 0.0.1  
**Última actualización**: 2024
