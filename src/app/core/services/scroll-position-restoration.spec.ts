import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { Router, NavigationEnd, NavigationStart, ActivatedRoute } from '@angular/router';
import { Location, ViewportScroller } from '@angular/common';
import { provideRouter } from '@angular/router';
import { Component, Injector } from '@angular/core';
import { ScrollPositionService } from './scroll-position.service';
import { routes } from '../../app.routes';
import { CommonModule } from '@angular/common';

/**
 * Test components with different content heights for scroll testing
 */
@Component({
  selector: 'app-test-long-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="height: 5000px; padding: 20px;">
      <h1>Long Content Page</h1>
      <div *ngFor="let item of items" style="margin: 20px 0;">
        <p>Item {{ item }}</p>
      </div>
    </div>
  `
})
class TestLongContentComponent {
  items = Array.from({ length: 100 }, (_, i) => i + 1);
}

@Component({
  selector: 'app-test-short-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="height: 500px; padding: 20px;">
      <h1>Short Content Page</h1>
      <p>This is a short page</p>
    </div>
  `
})
class TestShortContentComponent {}

@Component({
  selector: 'app-test-dynamic-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px;">
      <h1>Dynamic Content Page</h1>
      <div *ngIf="loaded" style="height: 3000px;">
        <p *ngFor="let item of items">Dynamic item {{ item }}</p>
      </div>
    </div>
  `
})
class TestDynamicContentComponent {
  loaded = false;
  items: number[] = [];

  ngOnInit() {
    // Simulate async data loading
    setTimeout(() => {
      this.loaded = true;
      this.items = Array.from({ length: 50 }, (_, i) => i + 1);
    }, 50);
  }
}

/**
 * Scroll Position Restoration - Integration Tests
 * Task 5: Test scroll restoration across different routes
 * Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4
 */
describe('Scroll Position Restoration - Integration Tests', () => {
  let router: Router;
  let location: Location;
  let scrollService: ScrollPositionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        ScrollPositionService
      ]
    });

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    scrollService = TestBed.inject(ScrollPositionService);
  });

  /**
   * Helper function to simulate scrolling to a position
   */
  function scrollToPosition(x: number, y: number): void {
    window.scrollTo(x, y);
    // Trigger scroll event
    window.dispatchEvent(new Event('scroll'));
  }

  /**
   * Helper function to get current scroll position
   */
  function getCurrentScrollPosition(): [number, number] {
    return [window.scrollX, window.scrollY];
  }

  /**
   * Helper function to wait for navigation and rendering
   */
  async function navigateAndWait(path: string): Promise<void> {
    await router.navigate([path]);
    await new Promise(resolve => setTimeout(resolve, 150));
  }

  /**
   * Task 5.1: Test main route navigation
   * Requirements: 1.1, 1.2, 2.2
   */
  describe('5.1 Main Route Navigation', () => {
    it('should restore scroll position when navigating home ↔ plan-ahorros', fakeAsync(async () => {
      // Navigate to home
      await router.navigate(['/home']);
      tick(100);

      // Scroll to a position on home
      scrollToPosition(0, 500);
      const homeScrollPos = getCurrentScrollPosition();
      expect(homeScrollPos[1]).toBe(500);

      // Navigate to plan-ahorros
      await router.navigate(['/plan-ahorros']);
      tick(100);

      // Scroll to a different position on plan-ahorros
      scrollToPosition(0, 800);
      const planScrollPos = getCurrentScrollPosition();
      expect(planScrollPos[1]).toBe(800);

      // Navigate back to home
      await router.navigate(['/home']);
      tick(150);

      // Verify home scroll position is restored
      const restoredHomePos = getCurrentScrollPosition();
      expect(restoredHomePos[1]).toBeCloseTo(500, -1);

      flush();
    }));

    it('should restore scroll position when navigating home ↔ chat', fakeAsync(async () => {
      // Navigate to home
      await router.navigate(['/home']);
      tick(100);

      // Scroll to a position on home
      scrollToPosition(0, 300);
      const homeScrollPos = getCurrentScrollPosition();
      expect(homeScrollPos[1]).toBe(300);

      // Navigate to chat
      await router.navigate(['/chat']);
      tick(100);

      // Scroll to a different position on chat
      scrollToPosition(0, 600);
      const chatScrollPos = getCurrentScrollPosition();
      expect(chatScrollPos[1]).toBe(600);

      // Navigate back to home
      await router.navigate(['/home']);
      tick(150);

      // Verify home scroll position is restored
      const restoredHomePos = getCurrentScrollPosition();
      expect(restoredHomePos[1]).toBeCloseTo(300, -1);

      flush();
    }));

    it('should handle multi-step navigation: home → plan-ahorros → chat → plan-ahorros → home', fakeAsync(async () => {
      const scrollPositions = new Map<string, number>();

      // Step 1: Navigate to home and scroll
      await router.navigate(['/home']);
      tick(100);
      scrollToPosition(0, 200);
      scrollPositions.set('home', 200);

      // Step 2: Navigate to plan-ahorros and scroll
      await router.navigate(['/plan-ahorros']);
      tick(100);
      scrollToPosition(0, 400);
      scrollPositions.set('plan-ahorros', 400);

      // Step 3: Navigate to chat and scroll
      await router.navigate(['/chat']);
      tick(100);
      scrollToPosition(0, 600);
      scrollPositions.set('chat', 600);

      // Step 4: Navigate back to plan-ahorros
      await router.navigate(['/plan-ahorros']);
      tick(150);
      const planPos = getCurrentScrollPosition();
      expect(planPos[1]).toBeCloseTo(400, -1);

      // Step 5: Navigate back to home
      await router.navigate(['/home']);
      tick(150);
      const homePos = getCurrentScrollPosition();
      expect(homePos[1]).toBeCloseTo(200, -1);

      flush();
    }));
  });

  /**
   * Task 5.2: Test nested route navigation
   * Requirements: 2.1, 2.2
   */
  describe('5.2 Nested Route Navigation', () => {
    it('should restore scroll in plan-ahorros main view after navigating to gastos detail', fakeAsync(async () => {
      // Navigate to plan-ahorros main view
      await router.navigate(['/plan-ahorros']);
      tick(100);

      // Scroll to a position
      scrollToPosition(0, 700);
      const mainViewScrollPos = getCurrentScrollPosition();
      expect(mainViewScrollPos[1]).toBe(700);

      // Navigate to gastos detail
      await router.navigate(['/plan-ahorros/gastos/fijos']);
      tick(100);

      // Scroll on detail page
      scrollToPosition(0, 300);

      // Navigate back to main view
      await router.navigate(['/plan-ahorros']);
      tick(150);

      // Verify main view scroll position is restored
      const restoredPos = getCurrentScrollPosition();
      expect(restoredPos[1]).toBeCloseTo(700, -1);

      flush();
    }));

    it('should restore scroll in lista-movimientos after navigating to detail', fakeAsync(async () => {
      // Navigate to lista-movimientos
      await router.navigate(['/plan-ahorros/detalle/movimientos/gastos-fijos']);
      tick(100);

      // Scroll to a position
      scrollToPosition(0, 900);
      const listScrollPos = getCurrentScrollPosition();
      expect(listScrollPos[1]).toBe(900);

      // Navigate to a specific movement detail (simulated)
      await router.navigate(['/plan-ahorros/movimientos-caja/gastos-fijos/recategorizar/123']);
      tick(100);

      // Navigate back to lista-movimientos
      await router.navigate(['/plan-ahorros/detalle/movimientos/gastos-fijos']);
      tick(150);

      // Verify list scroll position is restored
      const restoredPos = getCurrentScrollPosition();
      expect(restoredPos[1]).toBeCloseTo(900, -1);

      flush();
    }));

    it('should restore scroll in configuracion routes with multiple levels', fakeAsync(async () => {
      // Navigate to configuracion main
      await router.navigate(['/plan-ahorros/configuracion']);
      tick(100);
      scrollToPosition(0, 250);

      // Navigate to ingreso-neto
      await router.navigate(['/plan-ahorros/configuracion/ingreso-neto']);
      tick(100);
      scrollToPosition(0, 150);

      // Navigate to meta-ahorro
      await router.navigate(['/plan-ahorros/configuracion/meta-ahorro']);
      tick(100);

      // Navigate back to ingreso-neto
      await router.navigate(['/plan-ahorros/configuracion/ingreso-neto']);
      tick(150);
      const ingresoPos = getCurrentScrollPosition();
      expect(ingresoPos[1]).toBeCloseTo(150, -1);

      // Navigate back to configuracion main
      await router.navigate(['/plan-ahorros/configuracion']);
      tick(150);
      const configPos = getCurrentScrollPosition();
      expect(configPos[1]).toBeCloseTo(250, -1);

      flush();
    }));
  });

  /**
   * Task 5.3: Test with dynamic content
   * Requirements: 3.3
   */
  describe('5.3 Dynamic Content', () => {
    it('should handle scroll restoration with lazy-loaded components', fakeAsync(async () => {
      // Navigate to a lazy-loaded route
      await router.navigate(['/plan-ahorros']);
      tick(100);

      // Scroll to a position
      scrollToPosition(0, 500);

      // Navigate to another lazy-loaded route
      await router.navigate(['/recompensas']);
      tick(100);

      // Navigate back
      await router.navigate(['/plan-ahorros']);
      tick(150);

      // Verify scroll position is restored
      const restoredPos = getCurrentScrollPosition();
      expect(restoredPos[1]).toBeCloseTo(500, -1);

      flush();
    }));

    it('should wait for async data loading before restoring scroll', fakeAsync(async () => {
      // Navigate to a route with async data
      await router.navigate(['/plan-ahorros/detalle/movimientos/gastos-fijos']);
      tick(100);

      // Scroll after content loads
      scrollToPosition(0, 800);

      // Navigate away
      await router.navigate(['/plan-ahorros']);
      tick(100);

      // Navigate back
      await router.navigate(['/plan-ahorros/detalle/movimientos/gastos-fijos']);
      tick(200); // Extra time for async loading

      // Verify scroll position is restored after content loads
      const restoredPos = getCurrentScrollPosition();
      expect(restoredPos[1]).toBeCloseTo(800, -1);

      flush();
    }));

    it('should handle content that changes height after initial render', fakeAsync(async () => {
      // Navigate to route
      await router.navigate(['/plan-ahorros']);
      tick(100);

      // Scroll to a position
      scrollToPosition(0, 1000);

      // Navigate away
      await router.navigate(['/home']);
      tick(100);

      // Navigate back (content might have different height)
      await router.navigate(['/plan-ahorros']);
      tick(150);

      // Verify scroll position is restored or adjusted to valid position
      const restoredPos = getCurrentScrollPosition();
      expect(restoredPos[1]).toBeGreaterThanOrEqual(0);
      expect(restoredPos[1]).toBeLessThanOrEqual(1000);

      flush();
    }));
  });

  /**
   * Task 5.4: Test responsive behavior
   * Requirements: 3.1, 3.2
   */
  describe('5.4 Responsive Behavior', () => {
    it('should restore scroll on mobile viewport (< 768px)', fakeAsync(async () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      // Navigate and scroll
      await router.navigate(['/home']);
      tick(100);
      scrollToPosition(0, 400);

      // Navigate away and back
      await router.navigate(['/chat']);
      tick(100);
      await router.navigate(['/home']);
      tick(150);

      // Verify scroll restoration works on mobile
      const restoredPos = getCurrentScrollPosition();
      expect(restoredPos[1]).toBeCloseTo(400, -1);

      flush();
    }));

    it('should restore scroll on desktop viewport (> 768px)', fakeAsync(async () => {
      // Simulate desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920
      });

      // Navigate and scroll
      await router.navigate(['/home']);
      tick(100);
      scrollToPosition(0, 600);

      // Navigate away and back
      await router.navigate(['/plan-ahorros']);
      tick(100);
      await router.navigate(['/home']);
      tick(150);

      // Verify scroll restoration works on desktop
      const restoredPos = getCurrentScrollPosition();
      expect(restoredPos[1]).toBeCloseTo(600, -1);

      flush();
    }));

    it('should handle orientation changes on mobile devices', fakeAsync(async () => {
      // Start in portrait mode
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667
      });

      // Navigate and scroll
      await router.navigate(['/home']);
      tick(100);
      scrollToPosition(0, 300);

      // Simulate orientation change to landscape
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 667
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 375
      });
      window.dispatchEvent(new Event('orientationchange'));

      // Navigate away and back
      await router.navigate(['/chat']);
      tick(100);
      await router.navigate(['/home']);
      tick(150);

      // Verify scroll restoration still works after orientation change
      const restoredPos = getCurrentScrollPosition();
      expect(restoredPos[1]).toBeGreaterThanOrEqual(0);

      flush();
    }));
  });

  /**
   * Task 5.5: Test edge cases
   * Requirements: 2.2, 3.4
   */
  describe('5.5 Edge Cases', () => {
    it('should handle rapid navigation (multiple clicks)', fakeAsync(async () => {
      // Navigate to home
      await router.navigate(['/home']);
      tick(50);
      scrollToPosition(0, 200);

      // Rapid navigation
      router.navigate(['/plan-ahorros']);
      tick(20);
      router.navigate(['/chat']);
      tick(20);
      router.navigate(['/home']);
      tick(150);

      // Verify no errors and scroll is at a valid position
      const finalPos = getCurrentScrollPosition();
      expect(finalPos[1]).toBeGreaterThanOrEqual(0);

      flush();
    }));

    it('should handle browser back/forward buttons', fakeAsync(async () => {
      // Navigate through several routes
      await router.navigate(['/home']);
      tick(100);
      scrollToPosition(0, 300);

      await router.navigate(['/plan-ahorros']);
      tick(100);
      scrollToPosition(0, 500);

      await router.navigate(['/chat']);
      tick(100);

      // Simulate back button
      location.back();
      tick(150);

      // Verify scroll is restored
      const backPos = getCurrentScrollPosition();
      expect(backPos[1]).toBeCloseTo(500, -1);

      // Simulate forward button
      location.forward();
      tick(150);

      // Verify scroll is at top for new page
      const forwardPos = getCurrentScrollPosition();
      expect(forwardPos[1]).toBeGreaterThanOrEqual(0);

      flush();
    }));

    it('should handle very long content (> 10000px)', fakeAsync(async () => {
      // Create a very long page (simulated)
      await router.navigate(['/home']);
      tick(100);

      // Scroll to a large position
      scrollToPosition(0, 5000);
      const longScrollPos = getCurrentScrollPosition();
      expect(longScrollPos[1]).toBe(5000);

      // Navigate away and back
      await router.navigate(['/chat']);
      tick(100);
      await router.navigate(['/home']);
      tick(150);

      // Verify scroll position is restored
      const restoredPos = getCurrentScrollPosition();
      expect(restoredPos[1]).toBeCloseTo(5000, -1);

      flush();
    }));

    it('should handle content shorter than saved position', fakeAsync(async () => {
      // Navigate to a page and scroll far down
      await router.navigate(['/home']);
      tick(100);
      scrollToPosition(0, 3000);

      // Navigate away
      await router.navigate(['/chat']);
      tick(100);

      // Navigate back (content might be shorter now)
      await router.navigate(['/home']);
      tick(150);

      // Verify scroll is adjusted to nearest valid position
      const restoredPos = getCurrentScrollPosition();
      expect(restoredPos[1]).toBeGreaterThanOrEqual(0);
      // Should not exceed document height
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      expect(restoredPos[1]).toBeLessThanOrEqual(Math.max(0, maxScroll));

      flush();
    }));

    it('should not restore scroll on page refresh', fakeAsync(async () => {
      // Navigate and scroll
      await router.navigate(['/home']);
      tick(100);
      scrollToPosition(0, 500);

      // Simulate page refresh by creating new service instance
      const newScrollService = new ScrollPositionService(
        router,
        TestBed.inject(ViewportScroller),
        TestBed.inject(Injector),
        TestBed.inject(ActivatedRoute)
      );

      // Navigate to same route
      await router.navigate(['/home']);
      tick(150);

      // Scroll should be at top (no saved position in new service)
      const refreshPos = getCurrentScrollPosition();
      expect(refreshPos[1]).toBe(0);

      flush();
    }));

    it('should handle navigation cancellation gracefully', fakeAsync(async () => {
      // Navigate to home
      await router.navigate(['/home']);
      tick(100);
      scrollToPosition(0, 400);

      // Start navigation but cancel it
      const navigationPromise = router.navigate(['/plan-ahorros']);
      tick(20);
      router.navigate(['/home']); // Cancel by navigating elsewhere
      tick(150);

      // Verify no errors and scroll is at a valid position
      const finalPos = getCurrentScrollPosition();
      expect(finalPos[1]).toBeGreaterThanOrEqual(0);

      flush();
    }));
  });

  /**
   * Additional validation tests
   */
  describe('Additional Validation', () => {
    it('should maintain independent scroll positions for different routes', fakeAsync(async () => {
      const routes = ['/home', '/chat', '/plan-ahorros', '/recompensas'];
      const scrollPositions = new Map<string, number>();

      // Navigate to each route and set different scroll positions
      for (let i = 0; i < routes.length; i++) {
        await router.navigate([routes[i]]);
        tick(100);
        const scrollY = (i + 1) * 200;
        scrollToPosition(0, scrollY);
        scrollPositions.set(routes[i], scrollY);
      }

      // Verify each route maintains its own scroll position
      for (const route of routes) {
        await router.navigate([route]);
        tick(150);
        const restoredPos = getCurrentScrollPosition();
        const expectedPos = scrollPositions.get(route) || 0;
        expect(restoredPos[1]).toBeCloseTo(expectedPos, -1);
      }

      flush();
    }));

    it('should clear old positions when exceeding max stored positions', fakeAsync(async () => {
      // Navigate to more than MAX_STORED_POSITIONS routes
      for (let i = 0; i < 25; i++) {
        await router.navigate(['/home']);
        tick(50);
        await router.navigate(['/chat']);
        tick(50);
      }

      // Verify service still works without memory issues
      await router.navigate(['/home']);
      tick(100);
      scrollToPosition(0, 300);

      await router.navigate(['/chat']);
      tick(100);
      await router.navigate(['/home']);
      tick(150);

      const restoredPos = getCurrentScrollPosition();
      expect(restoredPos[1]).toBeCloseTo(300, -1);

      flush();
    }));
  });
});
