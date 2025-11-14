/**
 * Configuration interface for per-route scroll restoration behavior.
 * 
 * This interface defines the options available for customizing scroll restoration
 * on a per-route basis. Add these properties to the `data` object in your route
 * configuration to override the default scroll behavior.
 * 
 * USAGE:
 * ======
 * Add configuration to route data in your routes file:
 * 
 * @example Basic usage - Disable scroll restoration
 * ```typescript
 * {
 *   path: 'login',
 *   component: LoginComponent,
 *   data: {
 *     scrollRestoration: false  // Always scroll to top when entering this route
 *   }
 * }
 * ```
 * 
 * @example Add delay for dynamic content
 * ```typescript
 * {
 *   path: 'products',
 *   component: ProductListComponent,
 *   data: {
 *     scrollDelay: 150  // Wait 150ms for products to load before restoring scroll
 *   }
 * }
 * ```
 * 
 * @example Custom scroll container
 * ```typescript
 * {
 *   path: 'messages',
 *   component: MessagesComponent,
 *   data: {
 *     scrollContainer: '.message-list'  // Restore scroll for specific container
 *   }
 * }
 * ```
 * 
 * @example Combine multiple options
 * ```typescript
 * {
 *   path: 'dashboard',
 *   component: DashboardComponent,
 *   data: {
 *     scrollRestoration: true,
 *     scrollDelay: 100,
 *     scrollContainer: '.dashboard-content'
 *   }
 * }
 * ```
 * 
 * @example Apply to lazy-loaded feature modules
 * ```typescript
 * {
 *   path: 'admin',
 *   loadChildren: () => import('./admin/admin.routes'),
 *   data: {
 *     scrollRestoration: false  // Disable for all child routes in admin module
 *   }
 * }
 * ```
 * 
 * WHEN TO USE EACH OPTION:
 * ========================
 * 
 * scrollRestoration: false
 * - Login/authentication pages (always start at top)
 * - Modal or dialog routes
 * - Wizard/stepper flows (each step should start at top)
 * - Landing pages
 * 
 * scrollDelay: <number>
 * - Routes with async data loading (lists, tables)
 * - Routes with lazy-loaded images
 * - Routes with dynamic content that affects page height
 * - Recommended values: 50-200ms depending on content complexity
 * 
 * scrollContainer: '<selector>'
 * - Routes with custom scroll containers (not window scroll)
 * - Split-pane layouts with independent scroll areas
 * - Chat interfaces with scrollable message lists
 * - Sidebar navigation with scrollable content
 */
export interface RouteScrollConfig {
  /**
   * Whether scroll restoration is enabled for this route.
   * 
   * When set to `false`, the route will always scroll to the top (0,0) when entered,
   * regardless of any previously saved scroll position.
   * 
   * When set to `true` (default), the scroll position will be saved when leaving
   * the route and restored when returning to it.
   * 
   * @default true
   * 
   * @example
   * ```typescript
   * // Disable scroll restoration for login page
   * data: { scrollRestoration: false }
   * ```
   */
  scrollRestoration?: boolean;

  /**
   * Delay in milliseconds before restoring scroll position.
   * 
   * This is useful for routes with dynamic content that needs time to load
   * and render before the scroll position can be accurately restored.
   * 
   * A delay of 0 (default) means scroll will be restored immediately after
   * the next render cycle. Increase this value if you notice the scroll
   * restoration happening before your content is fully loaded.
   * 
   * @default 0
   * 
   * @example
   * ```typescript
   * // Wait 100ms for async data to load
   * data: { scrollDelay: 100 }
   * ```
   */
  scrollDelay?: number;

  /**
   * CSS selector for a specific scroll container element.
   * 
   * By default, scroll restoration applies to the window/viewport scroll.
   * Use this option if your route has a custom scroll container (e.g., a
   * scrollable div) and you want to restore scroll for that specific element.
   * 
   * The selector should match a single element. If multiple elements match,
   * the first one will be used.
   * 
   * @default undefined (uses window scroll)
   * 
   * @example
   * ```typescript
   * // Restore scroll for a specific container
   * data: { scrollContainer: '.main-content' }
   * ```
   */
  scrollContainer?: string;
}
