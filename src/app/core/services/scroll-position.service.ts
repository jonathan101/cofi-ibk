import { Injectable, afterNextRender, Injector } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, ActivatedRoute } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { filter } from 'rxjs/operators';
import { RouteScrollConfig } from '../models/route-scroll-config.interface';

/**
 * Interface representing a saved scroll position
 */
interface ScrollPosition {
  x: number;
  y: number;
  timestamp: number;
}

/**
 * Service responsible for saving and restoring scroll positions during navigation.
 * 
 * This service provides advanced control over scroll restoration to prevent flickering
 * and ensure smooth user experience when navigating between routes.
 */
@Injectable({
  providedIn: 'root'
})
export class ScrollPositionService {
  private scrollPositions = new Map<string, ScrollPosition>();
  private readonly MAX_STORED_POSITIONS = 20;
  private currentRouteKey: string = '';
  private pendingRestoration: boolean = false;
  private pendingRestorationTimeout: any = null;

  constructor(
    private router: Router,
    private viewportScroller: ViewportScroller,
    private injector: Injector,
    private activatedRoute: ActivatedRoute
  ) {
    this.initializeRouterListeners();
  }

  /**
   * Saves the current scroll position for a given route key.
   * 
   * @param routeKey - Unique identifier for the route
   */
  saveScrollPosition(routeKey: string): void {
    try {
      const scrollPosition = this.viewportScroller.getScrollPosition();
      
      this.scrollPositions.set(routeKey, {
        x: scrollPosition[0],
        y: scrollPosition[1],
        timestamp: Date.now()
      });

      // Perform cleanup if we exceed the maximum stored positions
      if (this.scrollPositions.size > this.MAX_STORED_POSITIONS) {
        this.clearOldPositions();
      }
    } catch (error) {
      console.warn('Failed to save scroll position for route:', routeKey, error);
      // Error doesn't break navigation flow - just log and continue
    }
  }

  /**
   * Restores the scroll position for a given route key.
   * Uses afterNextRender to ensure content is fully rendered before scrolling.
   * Respects per-route configuration from route data.
   * 
   * @param routeKey - Unique identifier for the route
   */
  restoreScrollPosition(routeKey: string): void {
    try {
      // Cancel any pending restoration operations to prevent race conditions
      this.cancelPendingRestoration();

      // Get route configuration from route data
      const routeConfig = this.getRouteScrollConfig();

      // Check if scroll restoration is disabled for this route
      if (routeConfig.scrollRestoration === false) {
        this.scrollToTop();
        return;
      }

      const savedPosition = this.scrollPositions.get(routeKey);
      
      if (!savedPosition) {
        // No saved position, scroll to top
        this.scrollToTop();
        return;
      }

      // Mark that we have a pending restoration
      this.pendingRestoration = true;

      // Apply custom delay if specified in route data
      const delay = routeConfig.scrollDelay ?? 0;

      // Restore scroll after the next render cycle to avoid flickering
      afterNextRender(() => {
        if (this.pendingRestoration) {
          if (delay > 0) {
            // Apply custom delay for routes with dynamic content
            this.pendingRestorationTimeout = setTimeout(() => {
              if (this.pendingRestoration) {
                this.restoreAfterRender(savedPosition);
                this.pendingRestoration = false;
                this.pendingRestorationTimeout = null;
              }
            }, delay);
          } else {
            this.restoreAfterRender(savedPosition);
            this.pendingRestoration = false;
          }
        }
      }, { injector: this.injector });
    } catch (error) {
      console.warn('Failed to restore scroll position for route:', routeKey, error);
      // Ensure errors don't break navigation - fallback to top
      this.scrollToTop();
      this.pendingRestoration = false;
    }
  }

  /**
   * Cancels any pending restoration operations.
   * This prevents race conditions during rapid navigation.
   */
  private cancelPendingRestoration(): void {
    // Clear the pending restoration flag
    this.pendingRestoration = false;

    // Clear any pending timeout
    if (this.pendingRestorationTimeout !== null) {
      clearTimeout(this.pendingRestorationTimeout);
      this.pendingRestorationTimeout = null;
    }
  }

  /**
   * Generates a unique route key based on the URL path.
   * 
   * @param url - The URL to generate a key from
   * @returns A unique string key for the route
   */
  private generateRouteKey(url: string): string {
    // Use the full URL path as the key
    return url;
  }

  /**
   * Gets the scroll configuration from the current route's data.
   * 
   * @returns RouteScrollConfig object with configuration values
   */
  private getRouteScrollConfig(): RouteScrollConfig {
    try {
      let route = this.activatedRoute;
      
      // Traverse to the deepest activated route to get the most specific configuration
      while (route.firstChild) {
        route = route.firstChild;
      }

      // Get route data and extract scroll configuration
      const routeData = route.snapshot.data;
      
      return {
        scrollRestoration: routeData['scrollRestoration'] ?? true,
        scrollDelay: routeData['scrollDelay'] ?? 0,
        scrollContainer: routeData['scrollContainer']
      };
    } catch (error) {
      console.warn('Failed to get route scroll configuration, using defaults:', error);
      // Return default configuration if error occurs
      return {
        scrollRestoration: true,
        scrollDelay: 0,
        scrollContainer: undefined
      };
    }
  }

  /**
   * Restores scroll position after content has been rendered.
   * Includes validation to ensure the position is still valid.
   * 
   * @param position - The scroll position to restore
   */
  private restoreAfterRender(position: ScrollPosition): void {
    try {
      // Validate that the position is still valid (within document bounds)
      if (!this.isValidScrollPosition(position)) {
        console.warn('Saved scroll position is invalid, scrolling to nearest valid position');
        const validPosition = this.getNearestValidPosition(position);
        this.viewportScroller.scrollToPosition([validPosition.x, validPosition.y]);
        return;
      }

      // Use ViewportScroller for programmatic scrolling
      this.viewportScroller.scrollToPosition([position.x, position.y]);
    } catch (error) {
      console.warn('Failed to restore scroll position:', error);
      // Fallback to top if position cannot be validated
      this.scrollToTop();
    }
  }

  /**
   * Validates if a scroll position is within the current document bounds.
   * 
   * @param position - The scroll position to validate
   * @returns true if the position is valid, false otherwise
   */
  private isValidScrollPosition(position: ScrollPosition): boolean {
    try {
      const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
      const maxScrollX = document.documentElement.scrollWidth - window.innerWidth;

      // Check if position is within valid bounds
      const isYValid = position.y >= 0 && position.y <= Math.max(0, maxScrollY);
      const isXValid = position.x >= 0 && position.x <= Math.max(0, maxScrollX);

      return isYValid && isXValid;
    } catch (error) {
      console.warn('Error validating scroll position:', error);
      return false;
    }
  }

  /**
   * Gets the nearest valid scroll position if the saved position exceeds content height.
   * 
   * @param position - The original scroll position
   * @returns The nearest valid scroll position
   */
  private getNearestValidPosition(position: ScrollPosition): { x: number; y: number } {
    try {
      const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
      const maxScrollX = document.documentElement.scrollWidth - window.innerWidth;

      // Clamp the position to valid bounds
      const validY = Math.min(Math.max(0, position.y), Math.max(0, maxScrollY));
      const validX = Math.min(Math.max(0, position.x), Math.max(0, maxScrollX));

      return { x: validX, y: validY };
    } catch (error) {
      console.warn('Error calculating nearest valid position:', error);
      // Fallback to top (0,0) if calculation fails
      return { x: 0, y: 0 };
    }
  }

  /**
   * Scrolls to the top of the page.
   */
  private scrollToTop(): void {
    try {
      this.viewportScroller.scrollToPosition([0, 0]);
    } catch (error) {
      console.warn('Failed to scroll to top:', error);
      // Fallback to native scroll if ViewportScroller fails
      try {
        window.scrollTo(0, 0);
      } catch (fallbackError) {
        console.warn('Failed to scroll using fallback method:', fallbackError);
        // Error doesn't break navigation flow
      }
    }
  }

  /**
   * Clears old scroll positions to manage memory.
   * Keeps only the most recent MAX_STORED_POSITIONS entries.
   */
  private clearOldPositions(): void {
    try {
      // Convert to array and sort by timestamp
      const entries = Array.from(this.scrollPositions.entries())
        .sort((a, b) => b[1].timestamp - a[1].timestamp);

      // Keep only the most recent positions
      this.scrollPositions.clear();
      entries.slice(0, this.MAX_STORED_POSITIONS).forEach(([key, value]) => {
        this.scrollPositions.set(key, value);
      });
    } catch (error) {
      console.warn('Failed to clear old scroll positions:', error);
      // If cleanup fails, clear all positions to prevent memory issues
      this.scrollPositions.clear();
    }
  }

  /**
   * Initializes Router event listeners to automatically save and restore scroll positions.
   */
  private initializeRouterListeners(): void {
    // Save scroll position before navigation starts
    this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe((event: NavigationStart) => {
        // Cancel any pending restoration to prevent race conditions
        this.cancelPendingRestoration();

        // Save current scroll position if we have a current route
        if (this.currentRouteKey) {
          this.saveScrollPosition(this.currentRouteKey);
        }
      });

    // Restore scroll position after navigation ends successfully
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const routeKey = this.generateRouteKey(event.urlAfterRedirects);
        this.currentRouteKey = routeKey;
        this.restoreScrollPosition(routeKey);
      });

    // Handle navigation cancellation
    this.router.events
      .pipe(filter(event => event instanceof NavigationCancel || event instanceof NavigationError))
      .subscribe(() => {
        // Cancel any pending restoration to prevent orphaned operations
        this.cancelPendingRestoration();
      });
  }
}
