# Scroll Position Restoration Guide

## Overview

This application implements a custom scroll restoration system that automatically saves and restores scroll positions when navigating between routes. This provides a smooth, native-app-like experience where users don't lose their place when navigating back to previously visited pages.

## How It Works

### Architecture

```
User navigates from Route A → Route B
    ↓
ScrollPositionService saves scroll position of Route A
    ↓
User navigates back from Route B → Route A
    ↓
ScrollPositionService waits for content to render
    ↓
Scroll position is smoothly restored (no flickering!)
```

### Key Components

1. **app.config.ts**: Global router configuration with native scroll restoration disabled
2. **ScrollPositionService**: Core service that manages saving and restoring scroll positions
3. **RouteScrollConfig**: Interface for per-route configuration options
4. **app.routes.ts**: Route definitions with optional scroll configuration

## Why Custom Instead of Native?

Angular's built-in scroll restoration (`scrollPositionRestoration: 'enabled'`) causes visible flickering:
- Page loads at position 0
- Content renders
- Scroll "jumps" to saved position ← **Visible flicker!**

Our custom solution:
- Page loads at position 0
- Content renders
- Service waits for render to complete
- Scroll smoothly restores ← **No flicker!**

## Usage

### Default Behavior

By default, scroll restoration is **enabled for all routes**. You don't need to do anything - it just works!

```typescript
// No configuration needed - scroll restoration works automatically
{
  path: 'products',
  component: ProductListComponent
}
```

### Disable for Specific Routes

Some routes should always start at the top (e.g., login pages, modals):

```typescript
{
  path: 'login',
  component: LoginComponent,
  data: {
    scrollRestoration: false  // Always scroll to top
  }
}
```

### Add Delay for Dynamic Content

If your route loads data asynchronously, add a delay to ensure content is ready:

```typescript
{
  path: 'products',
  component: ProductListComponent,
  data: {
    scrollDelay: 100  // Wait 100ms for products to load
  }
}
```

### Custom Scroll Container

For routes with custom scroll containers (not window scroll):

```typescript
{
  path: 'messages',
  component: MessagesComponent,
  data: {
    scrollContainer: '.message-list'  // Restore scroll for this element
  }
}
```

### Combine Multiple Options

```typescript
{
  path: 'dashboard',
  component: DashboardComponent,
  data: {
    scrollRestoration: true,
    scrollDelay: 150,
    scrollContainer: '.dashboard-content'
  }
}
```

## Configuration Reference

### RouteScrollConfig Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `scrollRestoration` | `boolean` | `true` | Enable/disable scroll restoration for this route |
| `scrollDelay` | `number` | `0` | Delay in ms before restoring scroll |
| `scrollContainer` | `string` | `undefined` | CSS selector for custom scroll container |

## Common Use Cases

### 1. Login/Authentication Pages

Always start at the top:

```typescript
{
  path: 'login',
  data: { scrollRestoration: false }
}
```

### 2. Product Lists with Async Data

Wait for data to load:

```typescript
{
  path: 'products',
  data: { scrollDelay: 100 }
}
```

### 3. Wizard/Stepper Flows

Each step starts at top:

```typescript
{
  path: 'checkout',
  children: [
    { path: 'step1', data: { scrollRestoration: false } },
    { path: 'step2', data: { scrollRestoration: false } },
    { path: 'step3', data: { scrollRestoration: false } }
  ]
}
```

### 4. Chat/Messages with Custom Container

Restore scroll for message list:

```typescript
{
  path: 'chat',
  data: { scrollContainer: '.message-list' }
}
```

### 5. Lazy-Loaded Feature Modules

Apply configuration to all child routes:

```typescript
{
  path: 'admin',
  loadChildren: () => import('./admin/admin.routes'),
  data: { scrollRestoration: false }  // Applies to all admin routes
}
```

## Best Practices

### When to Disable Scroll Restoration

✅ **DO disable for:**
- Login/authentication pages
- Modal or dialog routes
- Wizard/stepper flows
- Landing pages
- Routes that should always start fresh

❌ **DON'T disable for:**
- List views (products, articles, etc.)
- Detail pages
- Dashboard/home pages
- Any route where users might want to return to their previous position

### Choosing the Right Delay

- **0ms (default)**: Static content, no async data loading
- **50-100ms**: Light async data (small lists, simple API calls)
- **100-200ms**: Heavy async data (large lists, multiple API calls, images)
- **200ms+**: Very complex dynamic content (avoid if possible - optimize loading instead)

### Performance Considerations

The service automatically manages memory:
- Stores max 20 most recent scroll positions
- Clears old positions based on timestamp
- Cancels pending restorations during rapid navigation

## Troubleshooting

### Scroll Restoration Not Working

**Problem**: Scroll position isn't being restored

**Solutions**:
1. Check if route has `scrollRestoration: false` in data
2. Verify content is fully loaded (try adding `scrollDelay`)
3. Check browser console for warnings
4. Ensure route path is unique (scroll positions are stored per URL)

### Flickering Still Occurs

**Problem**: Visible jump when scroll restores

**Solutions**:
1. Increase `scrollDelay` to wait for content
2. Ensure images have fixed heights or use loading placeholders
3. Check if content height changes after initial render

### Scroll Restores to Wrong Position

**Problem**: Scroll position is incorrect

**Solutions**:
1. Content height may have changed - add `scrollDelay`
2. Check if multiple routes share the same URL
3. Verify custom `scrollContainer` selector is correct

### Memory Issues

**Problem**: Too many scroll positions stored

**Solution**: The service automatically limits to 20 positions. If you need more control, modify `MAX_STORED_POSITIONS` in `ScrollPositionService`.

## Technical Details

### How Positions Are Stored

Scroll positions are stored in a Map with the route URL as the key:

```typescript
Map<string, ScrollPosition>
// Example:
// '/products' → { x: 0, y: 1250, timestamp: 1699564800000 }
// '/products/123' → { x: 0, y: 0, timestamp: 1699564900000 }
```

### When Positions Are Saved

- **NavigationStart**: Current scroll position is saved before leaving route
- **NavigationEnd**: Saved scroll position is restored after entering route
- **NavigationCancel/Error**: Pending restorations are cancelled

### Validation and Error Handling

The service includes robust error handling:
- Validates scroll positions are within document bounds
- Falls back to nearest valid position if saved position is invalid
- Scrolls to top (0,0) if validation fails
- Logs warnings without breaking navigation

## Examples from This Application

### Home Route (Default Behavior)

```typescript
{
  path: 'home',
  loadComponent: () => import('./features/home/home.component')
  // No data needed - scroll restoration enabled by default
}
```

### Plan Ahorros (With Delay for Dynamic Content)

```typescript
{
  path: 'plan-ahorros',
  loadChildren: () => import('./features/plan-ahorros/plan-ahorros.routes'),
  data: {
    scrollDelay: 100  // Wait for financial data to load
  }
}
```

### Chat (Disabled - Always Start Fresh)

```typescript
{
  path: 'chat',
  loadComponent: () => import('./features/chat/chat.component'),
  data: {
    scrollRestoration: false  // Always start at top of conversation
  }
}
```

## Further Reading

- [Angular Router Documentation](https://angular.dev/guide/routing)
- [ViewportScroller API](https://angular.dev/api/common/ViewportScroller)
- [afterNextRender API](https://angular.dev/api/core/afterNextRender)

## Support

If you encounter issues or have questions about scroll restoration:
1. Check this guide for common solutions
2. Review the inline documentation in `scroll-position.service.ts`
3. Check browser console for warning messages
4. Review route configuration in `app.routes.ts`
