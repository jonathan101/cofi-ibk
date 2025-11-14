# Implementation Plan

- [x] 1. Configure router to disable native scroll restoration





  - Update app.config.ts to DISABLE native scroll restoration to prevent flickering
  - Set `scrollPositionRestoration: 'disabled'` and `anchorScrolling: 'enabled'`
  - Add comment explaining why native restoration is disabled (prevents flickering/jumping)
  - _Requirements: 1.1, 1.3_

- [x] 2. Create ScrollPositionService for advanced control




- [x] 2.1 Implement core ScrollPositionService

  - Create service file at `src/app/core/services/scroll-position.service.ts`
  - Inject ViewportScroller for programmatic scrolling
  - Implement Map-based storage for scroll positions with route keys
  - Add methods: `saveScrollPosition()`, `restoreScrollPosition()`, `generateRouteKey()`
  - Implement timestamp tracking for each saved position
  - _Requirements: 2.1, 2.2, 2.3_


- [x] 2.2 Add Router event listeners

  - Subscribe to Router NavigationStart events to save current scroll position
  - Subscribe to Router NavigationEnd events to restore scroll position
  - Implement route key generation based on full URL path
  - Handle navigation cancellation to prevent incorrect saves
  - _Requirements: 1.1, 2.2_

- [x] 2.3 Implement content-ready detection and smooth restoration

  - Use `afterNextRender()` from @angular/core to restore scroll AFTER content renders
  - Implement restoration in `restoreScrollPosition()` using ViewportScroller.scrollToPosition()
  - Add small delay (0-10ms) only if needed for very dynamic content
  - Ensure no visible flickering or jumping during restoration
  - _Requirements: 1.3, 3.3_



- [x] 2.4 Add memory management

  - Implement `clearOldPositions()` method to limit stored positions (max 20 routes)
  - Add automatic cleanup based on timestamp (remove positions older than session)
  - _Requirements: 2.4_

- [x] 3. Implement per-route configuration support





- [x] 3.1 Define route data interface


  - Create `RouteScrollConfig` interface in `src/app/core/models/route-scroll-config.interface.ts`
  - Define properties: `scrollRestoration`, `scrollDelay`, `scrollContainer`
  - Export interface for use in route configurations
  - _Requirements: 4.2_

- [x] 3.2 Update ScrollPositionService to read route data


  - Inject ActivatedRoute to access route data configuration
  - Check route data for `scrollRestoration` flag before restoring
  - Apply custom `scrollDelay` from route data if specified
  - _Requirements: 4.2, 4.3_


- [x] 3.3 Add configuration examples to route files

  - Document how to disable scroll restoration for specific routes in comments
  - Add example route data configuration in app.routes.ts comments
  - _Requirements: 4.4_

- [x] 4. Handle edge cases and error scenarios




- [x] 4.1 Implement invalid position handling


  - Add validation to check if saved scroll position is still valid (within document height)
  - Scroll to nearest valid position if saved position exceeds content height
  - Fallback to top (0,0) if position cannot be validated
  - _Requirements: 1.4, 3.4_

- [x] 4.2 Handle rapid navigation


  - Track pending restoration operations
  - Cancel pending restorations when new navigation starts
  - Prevent race conditions between multiple navigation events
  - _Requirements: 2.2_

- [x] 4.3 Add error logging and recovery


  - Implement try-catch blocks around scroll operations
  - Log warnings for failed restorations (console.warn)
  - Ensure errors don't break navigation flow
  - _Requirements: 3.4_

- [x] 5. Test scroll restoration across different routes





- [x] 5.1 Test main route navigation


  - Verify scroll restoration between home ↔ plan-ahorros
  - Verify scroll restoration between home ↔ chat
  - Test multi-step navigation: home → plan-ahorros → chat → plan-ahorros → home
  - _Requirements: 1.1, 1.2, 2.2_

- [x] 5.2 Test nested route navigation


  - Verify scroll in plan-ahorros main view, navigate to gastos detail, return
  - Test scroll in lista-movimientos, navigate to detail, return
  - Verify scroll in configuracion routes with multiple levels
  - _Requirements: 2.1, 2.2_



- [x] 5.3 Test with dynamic content

  - Test scroll restoration with lazy-loaded components
  - Verify behavior with async data loading (lists, details)
  - Test with content that changes height after initial render
  - _Requirements: 3.3_


- [x] 5.4 Test responsive behavior

  - Verify scroll restoration on mobile viewport (< 768px)
  - Verify scroll restoration on desktop viewport (> 768px)
  - Test orientation changes on mobile devices
  - _Requirements: 3.1, 3.2_


- [x] 5.5 Test edge cases

  - Test rapid navigation (multiple clicks)
  - Test browser back/forward buttons
  - Test with very long content (> 10000px)
  - Test with content shorter than saved position
  - _Requirements: 2.2, 3.4_

- [x] 6. Document usage and configuration





  - Add inline comments in app.config.ts explaining scroll configuration
  - Document how to disable scroll restoration per route in route files
  - Add examples of custom scroll delays for specific routes
  - _Requirements: 4.4_
