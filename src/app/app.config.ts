import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

/**
 * SCROLL RESTORATION CONFIGURATION
 * =================================
 * 
 * This application uses a CUSTOM scroll restoration strategy to provide a smooth,
 * flicker-free navigation experience.
 * 
 * WHY CUSTOM INSTEAD OF NATIVE?
 * - Native Angular scroll restoration (`scrollPositionRestoration: 'enabled'`) causes
 *   visible flickering: the page loads at position 0, then "jumps" to the saved position
 * - Our custom ScrollPositionService restores scroll AFTER content is fully rendered,
 *   eliminating the visual jump
 * 
 * HOW IT WORKS:
 * 1. ScrollPositionService automatically saves scroll position before navigation
 * 2. After navigation completes, it waits for content to render using afterNextRender()
 * 3. Then smoothly restores the scroll position without flickering
 * 
 * CONFIGURATION OPTIONS:
 * - Global: Configured here in app.config.ts (applies to all routes by default)
 * - Per-route: Can be customized in route data (see app.routes.ts for examples)
 * 
 * CUSTOMIZATION:
 * To disable scroll restoration for specific routes, add to route data:
 *   data: { scrollRestoration: false }
 * 
 * To add delay for routes with dynamic content:
 *   data: { scrollDelay: 100 }
 * 
 * See app.routes.ts for detailed examples and documentation.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    
    // Router with custom scroll handling
    provideRouter(
      routes,
      withInMemoryScrolling({
        // DISABLED: Prevents native scroll restoration to avoid flickering
        // ScrollPositionService handles restoration with better timing control
        scrollPositionRestoration: 'disabled',
        
        // ENABLED: Allows anchor links (#section-id) to work properly
        anchorScrolling: 'enabled'
      })
    ),
    
    provideHttpClient()
  ]
};
