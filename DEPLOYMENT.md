# Deployment Guide - Chicho Chatbot PoC

## Vercel Deployment

Esta guía te ayudará a desplegar la aplicación Chicho Chatbot PoC en Vercel.

### Prerrequisitos

1. Cuenta en [Vercel](https://vercel.com)
2. Repositorio Git (GitHub, GitLab, o Bitbucket)
3. Código del proyecto subido al repositorio

### Opción 1: Deployment desde Vercel Dashboard (Recomendado)

#### Paso 1: Conectar Repositorio

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en "Add New..." → "Project"
3. Selecciona tu proveedor Git (GitHub, GitLab, o Bitbucket)
4. Autoriza a Vercel para acceder a tus repositorios
5. Busca y selecciona el repositorio `chicho-chatbot-poc`
6. Haz clic en "Import"

#### Paso 2: Configurar el Proyecto

Vercel detectará automáticamente que es un proyecto Angular. Verifica la siguiente configuración:

- **Framework Preset**: Angular
- **Root Directory**: `./` (raíz del proyecto)
- **Build Command**: `npm run build` (ya configurado en vercel.json)
- **Output Directory**: `dist/chicho-chatbot-poc/browser` (ya configurado en vercel.json)
- **Install Command**: `npm install`

#### Paso 3: Variables de Entorno (Opcional)

Para esta PoC no se requieren variables de entorno ya que usa datos mock estáticos. 

Si en el futuro necesitas configurar variables de entorno:

1. En la sección "Environment Variables" agrega:
   - `API_URL`: URL de tu API backend
   - `ENVIRONMENT`: `production`

#### Paso 4: Deploy

1. Haz clic en "Deploy"
2. Vercel comenzará el proceso de build y deployment
3. Espera a que termine (aproximadamente 2-3 minutos)
4. Una vez completado, verás el mensaje "Congratulations!" con la URL de tu aplicación

### Opción 2: Deployment desde CLI

#### Instalación de Vercel CLI

```bash
npm install -g vercel
```

#### Login

```bash
vercel login
```

#### Deploy

```bash
# Deploy a preview (staging)
vercel

# Deploy a producción
vercel --prod
```

### Verificación Post-Deployment

Una vez desplegada la aplicación, verifica lo siguiente:

#### 1. Aplicación Funciona Correctamente

- [ ] La página principal carga sin errores
- [ ] El botón flotante de Chicho es visible
- [ ] Los estilos se aplican correctamente (colores Interbank)
- [ ] El contenedor móvil se muestra en desktop
- [ ] La aplicación es responsive en móvil

#### 2. Routing Funciona Correctamente

Verifica que las siguientes rutas funcionan (el fallback a index.html está configurado):

- [ ] `/` - Home
- [ ] `/chat` - Chat con Chicho
- [ ] `/plan-ahorros` - Plan de Ahorros
- [ ] `/plan-ahorros/configurar` - Configuración del Plan
- [ ] `/plan-ahorros/detalle/gastos` - Detalle de Gastos
- [ ] `/recompensas` - Recompensas
- [ ] `/alertas` - Alertas

**Prueba de Routing**: Navega directamente a una ruta (ej: `https://tu-app.vercel.app/chat`) y verifica que carga correctamente sin error 404.

#### 3. Assets se Cargan Correctamente

- [ ] Iconos SVG se muestran
- [ ] Imágenes se cargan
- [ ] Datos JSON mock se cargan desde `/assets/data/`

#### 4. Performance

- [ ] La aplicación carga en menos de 3 segundos
- [ ] No hay errores en la consola del navegador
- [ ] Las transiciones son suaves

### Configuración Automática de Deployments

Vercel configurará automáticamente:

- **Production Deployments**: Cada push a la rama `main` o `master`
- **Preview Deployments**: Cada push a otras ramas o pull requests

### URLs de la Aplicación

Después del deployment, tendrás:

- **Production URL**: `https://chicho-chatbot-poc.vercel.app` (o similar)
- **Preview URLs**: URLs únicas para cada branch/PR

### Troubleshooting

#### Error: "Build Failed"

1. Verifica que `npm run build` funciona localmente
2. Revisa los logs de build en Vercel Dashboard
3. Asegúrate de que todas las dependencias están en `package.json`

#### Error: "404 Not Found" en rutas

1. Verifica que `vercel.json` tiene la configuración de rewrites
2. Asegúrate de que el `outputDirectory` es correcto: `dist/chicho-chatbot-poc/browser`

#### Assets no se cargan

1. Verifica que la carpeta `public` está en el repositorio
2. Revisa que `assets` está configurado en `angular.json`
3. Usa rutas relativas para assets: `/assets/...`

### Comandos Útiles

```bash
# Ver logs de deployment
vercel logs [deployment-url]

# Listar deployments
vercel ls

# Remover deployment
vercel rm [deployment-url]

# Ver información del proyecto
vercel inspect [deployment-url]
```

### Configuración Avanzada

#### Custom Domain

1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Domains
3. Agrega tu dominio personalizado
4. Configura los DNS según las instrucciones

#### Environment Variables por Branch

1. Settings → Environment Variables
2. Selecciona el scope: Production, Preview, o Development
3. Agrega las variables necesarias

### Monitoreo

Vercel proporciona:

- **Analytics**: Métricas de uso y performance
- **Logs**: Logs en tiempo real de tu aplicación
- **Speed Insights**: Análisis de velocidad de carga

Accede desde el Dashboard → Tu Proyecto → Analytics/Logs

### Rollback

Si necesitas volver a una versión anterior:

1. Ve a Deployments en el Dashboard
2. Encuentra el deployment anterior que funcionaba
3. Haz clic en los tres puntos → "Promote to Production"

### Notas Importantes

- Esta PoC usa datos mock estáticos, no requiere backend
- No se necesitan variables de entorno para funcionar
- El routing está configurado para SPA (Single Page Application)
- Los headers de seguridad están configurados en `vercel.json`
- El cache está optimizado para assets estáticos

### Próximos Pasos

Una vez desplegada la aplicación:

1. Comparte la URL con stakeholders para feedback
2. Prueba en diferentes dispositivos (móvil, tablet, desktop)
3. Verifica el performance con Lighthouse
4. Documenta cualquier issue encontrado

### Soporte

- [Documentación de Vercel](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Angular Deployment Guide](https://angular.io/guide/deployment)
