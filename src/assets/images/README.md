# Images Directory

Este directorio contiene todas las imágenes e ilustraciones utilizadas en la aplicación Chicho.

## Estructura de Archivos

```
images/
├── avatar-chicho.svg          # Avatar del chatbot Chicho (SVG)
├── empty-state-plan.svg       # Ilustración de estado vacío para plan de ahorros
├── gradient-promo.svg         # Fondo con gradiente para cards de promoción
└── README.md                  # Este archivo
```

## Especificaciones por Imagen

### avatar-chicho.svg
- **Tipo**: SVG
- **Dimensiones**: Escalable (base recomendada: 128x128px)
- **Uso**: Avatar de Chicho en el chat, header, y botón flotante
- **Formato alternativo**: Puede exportarse a PNG si se necesita

### empty-state-plan.svg
- **Tipo**: SVG
- **Dimensiones**: 200x200px
- **Uso**: Estado vacío cuando no hay plan de ahorros configurado
- **Colores**: Usa paleta Interbank (#00A19B)
- **Descripción**: Ilustración de chanchito con monedas

### gradient-promo.svg / gradient-promo.png
- **Tipo**: SVG (placeholder) / PNG (producción)
- **Dimensiones**: 400x200px
- **Uso**: Fondo decorativo para cards de promociones y recompensas
- **Colores**: Gradiente verde Interbank (#00A19B → #00C9C0 → #00E5DC)
- **Nota**: Actualmente usando SVG como placeholder. Reemplazar con PNG de diseño final.

## Formatos Recomendados

| Tipo de Imagen | Formato | Razón |
|----------------|---------|-------|
| Iconos simples | SVG | Escalable, pequeño tamaño |
| Ilustraciones | SVG | Escalable, editable |
| Fotografías | JPG | Mejor compresión para fotos |
| Imágenes con transparencia | PNG | Soporte de canal alpha |
| Fondos con gradientes | PNG/SVG | Depende de complejidad |

## Dimensiones Estándar

### Avatares
- **Pequeño**: 32x32px
- **Mediano**: 64x64px
- **Grande**: 128x128px
- **Extra grande**: 256x256px

### Cards de Promoción
- **Ancho completo**: 400x200px
- **Thumbnail**: 200x100px

### Empty States
- **Estándar**: 200x200px
- **Grande**: 300x300px

### Banners
- **Mobile**: 360x120px
- **Desktop**: 1200x300px

## Cómo Usar

### En Templates HTML

```html
<!-- SVG -->
<img src="assets/images/avatar-chicho.svg" alt="Chicho" class="avatar">

<!-- Con lazy loading -->
<img src="assets/images/gradient-promo.svg" 
     alt="Promoción" 
     loading="lazy"
     class="promo-bg">
```

### En Componentes Angular

```typescript
// En el template
<img [src]="avatarUrl" alt="Avatar">

// En el componente
export class ChatComponent {
  avatarUrl = 'assets/images/avatar-chicho.svg';
}
```

### Como Background CSS

```scss
.promo-card {
  background-image: url('/assets/images/gradient-promo.svg');
  background-size: cover;
  background-position: center;
}

.empty-state {
  background-image: url('/assets/images/empty-state-plan.svg');
  background-repeat: no-repeat;
  background-position: center;
}
```

## Optimización de Imágenes

### Para SVG
1. Usar [SVGOMG](https://jakearchibald.github.io/svgomg/) para optimizar
2. Remover metadatos innecesarios
3. Simplificar paths cuando sea posible
4. Usar `currentColor` para elementos que deben heredar color

### Para PNG/JPG
1. Usar herramientas como [TinyPNG](https://tinypng.com/) o [Squoosh](https://squoosh.app/)
2. Exportar en 2x para pantallas retina
3. Considerar WebP como formato alternativo
4. Usar lazy loading para imágenes below the fold

## Cómo Reemplazar Imágenes

### Reemplazar avatar-chicho.svg

1. Crear nuevo SVG con las mismas dimensiones base
2. Mantener el nombre `avatar-chicho.svg`
3. Asegurar que el viewBox esté correctamente configurado
4. Probar en diferentes tamaños (32px, 64px, 128px)

```xml
<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <!-- Tu diseño aquí -->
</svg>
```

### Reemplazar gradient-promo

1. Crear imagen PNG de 400x200px
2. Usar gradiente de marca Interbank
3. Exportar con calidad alta (90-95%)
4. Optimizar con TinyPNG
5. Guardar como `gradient-promo.png`
6. Actualizar referencias en componentes

### Reemplazar empty-state-plan.svg

1. Mantener dimensiones 200x200px
2. Usar colores de la paleta Interbank
3. Mantener estilo simple y amigable
4. Probar legibilidad en diferentes tamaños

## Agregar Nuevas Imágenes

1. **Nombrar correctamente**: Usar kebab-case (ej: `promo-card-background.png`)
2. **Optimizar antes de agregar**: Usar herramientas mencionadas arriba
3. **Documentar**: Actualizar esta tabla con la nueva imagen
4. **Considerar responsive**: Crear versiones para mobile y desktop si es necesario

## Responsive Images

Para imágenes que necesitan diferentes versiones:

```html
<picture>
  <source media="(min-width: 768px)" srcset="assets/images/banner-desktop.png">
  <source media="(min-width: 480px)" srcset="assets/images/banner-tablet.png">
  <img src="assets/images/banner-mobile.png" alt="Banner">
</picture>
```

## Accesibilidad

- **Siempre usar atributo `alt`**: Describir el contenido de la imagen
- **Decorativas**: Usar `alt=""` para imágenes puramente decorativas
- **Informativas**: Describir la información que transmite la imagen
- **Complejas**: Considerar usar `aria-describedby` para descripciones largas

```html
<!-- Informativa -->
<img src="assets/images/avatar-chicho.svg" alt="Chicho, el chanchito de ahorros">

<!-- Decorativa -->
<img src="assets/images/gradient-promo.svg" alt="" role="presentation">
```

## Performance

### Lazy Loading

```html
<img src="assets/images/promo.png" loading="lazy" alt="Promoción">
```

### Preload para imágenes críticas

```html
<!-- En index.html -->
<link rel="preload" as="image" href="assets/images/avatar-chicho.svg">
```

### Usar srcset para responsive

```html
<img src="assets/images/avatar-chicho.svg"
     srcset="assets/images/avatar-chicho-2x.svg 2x"
     alt="Chicho">
```

## Recursos Útiles

- [SVGOMG - Optimizador SVG](https://jakearchibald.github.io/svgomg/)
- [TinyPNG - Compresor PNG/JPG](https://tinypng.com/)
- [Squoosh - Optimizador de imágenes](https://squoosh.app/)
- [Can I Use - WebP Support](https://caniuse.com/webp)
- [MDN - Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)

## Notas

- Todas las imágenes deben seguir los lineamientos de marca Interbank
- Priorizar SVG para ilustraciones y iconos
- Usar PNG para imágenes con transparencia
- Usar JPG para fotografías
- Considerar WebP para mejor compresión (con fallback)
- Siempre optimizar antes de hacer commit
