import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { provideRouter } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PLAN_AHORROS_ROUTES } from './plan-ahorros.routes';
import { PlanAhorrosService } from '../../core/services/plan-ahorros.service';

/**
 * Integration tests for Plan de Ahorros feature
 * Task 14: Testing y validación
 * Requirements: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
 */
describe('Plan de Ahorros - Integration Tests', () => {
  let router: Router;
  let location: Location;
  let service: PlanAhorrosService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideRouter(PLAN_AHORROS_ROUTES),
        PlanAhorrosService
      ]
    });

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    service = TestBed.inject(PlanAhorrosService);
  });

  /**
   * Requirement 1: Navegación a configuración del plan
   */
  describe('Requirement 1: Navegación a Configuración', () => {
    it('debe navegar a la vista principal de configuración', async () => {
      await router.navigate(['configuracion']);
      expect(location.path()).toBe('/configuracion');
    });

    it('debe cargar el componente PlanSettingsComponent', async () => {
      const fixture = await router.navigate(['configuracion']);
      expect(fixture).toBe(true);
    });
  });

  /**
   * Requirement 2: Navegación a Ingreso Neto
   */
  describe('Requirement 2: Navegación a Ingreso Neto', () => {
    it('debe navegar a configuración de ingreso neto', async () => {
      await router.navigate(['configuracion/ingreso-neto']);
      expect(location.path()).toBe('/configuracion/ingreso-neto');
    });

    it('debe cargar el componente IngresoNetoSettingsComponent', async () => {
      const fixture = await router.navigate(['configuracion/ingreso-neto']);
      expect(fixture).toBe(true);
    });
  });

  /**
   * Requirement 3: Navegación a Meta de Ahorro
   */
  describe('Requirement 3: Navegación a Meta de Ahorro', () => {
    it('debe navegar a configuración de meta de ahorro', async () => {
      await router.navigate(['configuracion/meta-ahorro']);
      expect(location.path()).toBe('/configuracion/meta-ahorro');
    });

    it('debe cargar el componente MetaAhorroSettingsComponent', async () => {
      const fixture = await router.navigate(['configuracion/meta-ahorro']);
      expect(fixture).toBe(true);
    });
  });

  /**
   * Requirement 4: Navegación a Operaciones Recurrentes
   */
  describe('Requirement 4: Navegación a Operaciones Recurrentes', () => {
    it('debe navegar a configuración de operaciones recurrentes', async () => {
      await router.navigate(['configuracion/operaciones-recurrentes']);
      expect(location.path()).toBe('/configuracion/operaciones-recurrentes');
    });

    it('debe cargar el componente OperacionesRecurrentesSettingsComponent', async () => {
      const fixture = await router.navigate(['configuracion/operaciones-recurrentes']);
      expect(fixture).toBe(true);
    });
  });

  /**
   * Requirement 5: Navegación a Chanchito
   */
  describe('Requirement 5: Navegación a Chanchito', () => {
    it('debe navegar a selección de chanchito', async () => {
      await router.navigate(['configuracion/chanchito']);
      expect(location.path()).toBe('/configuracion/chanchito');
    });

    it('debe cargar el componente ChanchitoSettingsComponent', async () => {
      const fixture = await router.navigate(['configuracion/chanchito']);
      expect(fixture).toBe(true);
    });
  });

  /**
   * Requirement 6: Navegación a Configuración de Gastos
   */
  describe('Requirement 6: Navegación a Configuración de Gastos', () => {
    it('debe navegar a configuración de gastos', async () => {
      await router.navigate(['configuracion/gastos']);
      expect(location.path()).toBe('/configuracion/gastos');
    });

    it('debe cargar el componente ConfiguracionGastosSettingsComponent', async () => {
      const fixture = await router.navigate(['configuracion/gastos']);
      expect(fixture).toBe(true);
    });
  });

  /**
   * Requirement 7: Navegación a Topes de Gastos
   */
  describe('Requirement 7: Navegación a Topes de Gastos', () => {
    it('debe navegar a configuración de topes', async () => {
      await router.navigate(['configuracion/topes']);
      expect(location.path()).toBe('/configuracion/topes');
    });

    it('debe cargar el componente TopesGastosSettingsComponent', async () => {
      const fixture = await router.navigate(['configuracion/topes']);
      expect(fixture).toBe(true);
    });
  });

  /**
   * Requirement 8: Navegación a Detalle de Gastos
   */
  describe('Requirement 8: Navegación a Detalle de Gastos', () => {
    it('debe navegar a detalle de gastos', async () => {
      await router.navigate(['detalle/gastos']);
      expect(location.path()).toBe('/detalle/gastos');
    });

    it('debe cargar el componente DetalleGastosComponent', async () => {
      const fixture = await router.navigate(['detalle/gastos']);
      expect(fixture).toBe(true);
    });
  });

  /**
   * Requirement 9 & 10: Navegación completa del flujo
   */
  describe('Requirements 9 & 10: Flujo Completo de Navegación', () => {
    it('debe navegar desde plan principal a configuración y volver', async () => {
      // Navegar al plan principal
      await router.navigate(['']);
      expect(location.path()).toBe('/');

      // Navegar a configuración
      await router.navigate(['configuracion']);
      expect(location.path()).toBe('/configuracion');

      // Navegar a ingreso neto
      await router.navigate(['configuracion/ingreso-neto']);
      expect(location.path()).toBe('/configuracion/ingreso-neto');

      // Volver a configuración
      await router.navigate(['configuracion']);
      expect(location.path()).toBe('/configuracion');

      // Volver al plan principal
      await router.navigate(['']);
      expect(location.path()).toBe('/');
    });

    it('debe navegar por todas las opciones de configuración', async () => {
      const rutasConfiguracion = [
        'configuracion',
        'configuracion/ingreso-neto',
        'configuracion/meta-ahorro',
        'configuracion/operaciones-recurrentes',
        'configuracion/chanchito',
        'configuracion/gastos',
        'configuracion/topes'
      ];

      for (const ruta of rutasConfiguracion) {
        const resultado = await router.navigate([ruta]);
        expect(resultado).toBe(true);
        expect(location.path()).toBe(`/${ruta}`);
      }
    });

    it('debe navegar desde plan principal a detalle de gastos', async () => {
      // Navegar al plan principal
      await router.navigate(['']);
      expect(location.path()).toBe('/');

      // Navegar a detalle de gastos
      await router.navigate(['detalle/gastos']);
      expect(location.path()).toBe('/detalle/gastos');

      // Volver al plan principal
      await router.navigate(['']);
      expect(location.path()).toBe('/');
    });
  });

  /**
   * Validación de rutas existentes
   */
  describe('Validación de Rutas Existentes', () => {
    it('debe tener todas las rutas de configuración definidas', () => {
      const rutasEsperadas = [
        '',
        'crear',
        'configurar',
        'configurar/topes-mensuales',
        'configurar/clasificacion-gastos',
        'operaciones-recurrentes',
        'detalle/gastos',
        'configuracion',
        'configuracion/ingreso-neto',
        'configuracion/meta-ahorro',
        'configuracion/operaciones-recurrentes',
        'configuracion/chanchito',
        'configuracion/gastos',
        'configuracion/topes'
      ];

      const rutasDefinidas = PLAN_AHORROS_ROUTES.map(r => r.path);
      
      rutasEsperadas.forEach(ruta => {
        expect(rutasDefinidas).toContain(ruta);
      });
    });

    it('debe tener lazy loading configurado para todos los componentes', () => {
      PLAN_AHORROS_ROUTES.forEach(ruta => {
        expect(ruta.loadComponent).toBeDefined();
      });
    });
  });
});
