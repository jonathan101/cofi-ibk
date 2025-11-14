# Icons Directory

Este directorio contiene todos los iconos SVG utilizados en la aplicación Chicho.

## Especificaciones

- **Formato**: SVG
- **Dimensiones**: 24x24px
- **Color**: `currentColor` (hereda el color del texto del elemento padre)
- **Estilo**: Material Design Icons

## Lista de Iconos

| Icono | Archivo | Uso |
|-------|---------|-----|
| 🏠 | `home.svg` | Navegación - Inicio |
| 💬 | `chat.svg` | Navegación - Chat con Chicho |
| ⚙️ | `settings.svg` | Configuración |
| 🐷 | `chicho.svg` | Avatar de Chicho (chanchito) |
| 🏦 | `piggy-bank.svg` | Chanchitos de ahorro |
| ⚠️ | `alert-warning.svg` | Alertas de advertencia (amarillo) |
| 🔴 | `alert-danger.svg` | Alertas de peligro (rojo) |
| ℹ️ | `alert-info.svg` | Alertas informativas (azul) |
| ⭐ | `reward.svg` | Recompensas y beneficios |
| ➕ | `plus.svg` | Agregar nuevo |
| ✏️ | `edit.svg` | Editar |
| ✓ | `check.svg` | Confirmar / Completado |
| ← | `back.svg` | Volver atrás |
| → | `arrow-right.svg` | Ir adelante / Ver más |
| ✕ | `close.svg` | Cerrar |
| 📤 | `send.svg` | Enviar mensaje |
| 🔍 | `search.svg` | Buscar |
| 🔽 | `filter.svg` | Filtrar |
| ☰ | `menu.svg` | Menú hamburguesa |

## Cómo Usar

### En Templates HTML

```html
<!-- Método 1: Usando img tag -->
<img src="assets/icons/home.svg" alt="Home" class="icon">

<!-- Método 2: Inline SVG (recomendado para currentColor) -->
<svg class="icon">
  <use href="assets/icons/home.svg#icon"></use>
</svg>
```

### En Componentes Angular

```typescript
// En el template
<mat-icon svgIcon="home"></mat-icon>

// En el componente (registrar el icono)
constructor(private iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer) {
  this.iconRegistry.addSvgIcon(
    'home',
    this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/home.svg')
  );
}
```

### Con Estilos CSS

```scss
.icon {
  width: 24px;
  height: 24px;
  color: $color-primary; // El SVG heredará este color
}

.icon-large {
  width: 32px;
  height: 32px;
}

.icon-small {
  width: 16px;
  height: 16px;
}
```

## Cómo Reemplazar Iconos

1. **Mantener dimensiones**: Asegúrate de que el nuevo SVG sea 24x24px
2. **Usar currentColor**: Reemplaza colores fijos con `fill="currentColor"` o `stroke="currentColor"`
3. **Optimizar SVG**: Usa herramientas como [SVGOMG](https://jakearchibald.github.io/svgomg/) para optimizar
4. **Mantener nombre**: Usa el mismo nombre de archivo para no romper referencias

### Ejemplo de SVG Optimizado

```xml
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M..." fill="currentColor"/>
</svg>
```

## Agregar Nuevos Iconos

1. Crea el archivo SVG con las especificaciones mencionadas
2. Colócalo en este directorio
3. Actualiza esta tabla con el nuevo icono
4. Registra el icono en el servicio de iconos si usas MatIconRegistry

## Recursos

- [Material Design Icons](https://fonts.google.com/icons)
- [Heroicons](https://heroicons.com/)
- [Feather Icons](https://feathericons.com/)
- [SVGOMG - Optimizador SVG](https://jakearchibald.github.io/svgomg/)

## Notas

- Todos los iconos usan `currentColor` para facilitar el theming
- Los iconos son escalables sin pérdida de calidad
- Se recomienda usar clases CSS para controlar tamaño y color
- Para iconos de marca (Interbank), consultar el manual de identidad corporativa
