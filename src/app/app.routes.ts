import { Routes } from '@angular/router';

/**
 * Application Routes Configuration
 * 
 * SCROLL RESTORATION CONFIGURATION:
 * ================================
 * 
 * By default, scroll position is automatically saved and restored when navigating
 * between routes. You can customize this behavior per route using the `data` property.
 * 
 * Available configuration options (RouteScrollConfig):
 * 
 * - scrollRestoration: boolean (default: true)
 *   Enable or disable scroll restoration for a specific route
 * 
 * - scrollDelay: number (default: 0)
 *   Delay in milliseconds before restoring scroll position
 *   Useful for routes with dynamic content that needs time to load
 * 
 * - scrollContainer: string (default: undefined)
 *   CSS selector for a specific scroll container element
 *   If not provided, the window/viewport scroll will be used
 * 
 * EXAMPLES:
 * =========
 * 
 * Example 1: Disable scroll restoration for a specific route
 * {
 *   path: 'my-route',
 *   component: MyComponent,
 *   data: {
 *     scrollRestoration: false  // Always scroll to top when entering this route
 *   }
 * }
 * 
 * Example 2: Add delay for routes with dynamic content
 * {
 *   path: 'dynamic-list',
 *   component: ListComponent,
 *   data: {
 *     scrollDelay: 100  // Wait 100ms for content to load before restoring scroll
 *   }
 * }
 * 
 * Example 3: Combine multiple options
 * {
 *   path: 'complex-route',
 *   component: ComplexComponent,
 *   data: {
 *     scrollRestoration: true,
 *     scrollDelay: 150,
 *     scrollContainer: '.main-content'  // Restore scroll for specific container
 *   }
 * }
 * 
 * Example 4: Apply to lazy-loaded routes
 * {
 *   path: 'feature',
 *   loadChildren: () => import('./feature/feature.routes'),
 *   data: {
 *     scrollRestoration: false  // Disable for all child routes
 *   }
 * }
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'chat',
    loadComponent: () => import('./features/chat/chat.component').then(m => m.ChatComponent)
  },
  {
    path: 'plan-ahorros',
    loadChildren: () => import('./features/plan-ahorros/plan-ahorros.routes').then(m => m.PLAN_AHORROS_ROUTES)
  },
  {
    path: 'recompensas',
    loadComponent: () => import('./features/recompensas/recompensas.component').then(m => m.RecompensasComponent)
  },
  {
    path: 'alertas',
    loadComponent: () => import('./features/alertas/alertas.component').then(m => m.AlertasComponent)
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];
