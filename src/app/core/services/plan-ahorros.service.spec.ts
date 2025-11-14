import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PlanAhorrosService } from './plan-ahorros.service';
import { RecategorizacionRequest } from '../models/recategorizacion.interface';

describe('PlanAhorrosService - New Methods', () => {
  let service: PlanAhorrosService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PlanAhorrosService]
    });
    service = TestBed.inject(PlanAhorrosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getDetalleGastosPorTipo', () => {
    it('should return detalle gastos for tipo hormigas', (done) => {
      const mes = 'Noviembre 2024';
      const tipo = 'hormigas';

      service.getDetalleGastosPorTipo(mes, tipo).subscribe(detalle => {
        expect(detalle).toBeDefined();
        expect(detalle.tipo).toBe('hormigas');
        expect(detalle.subcategorias).toBeDefined();
        done();
      });

      // Mock the HTTP request for operaciones
      const req = httpMock.expectOne(request => 
        request.url.includes('noviembre-2024.json')
      );
      req.flush([
        {
          id: '1',
          operacion: 'Uber',
          monto: -50,
          fecha: '2024-11-15',
          categoria: 'gastos',
          tipoGasto: 'hormiga',
          subcategoria: 'transporte',
          vinculadaARecurrente: false
        }
      ]);
    });
  });

  describe('getOperacionesPorSubcategoria', () => {
    it('should filter operaciones by subcategoria', (done) => {
      const mes = 'Noviembre 2024';
      const tipo = 'hormigas';
      const subcategoria = 'transporte';

      service.getOperacionesPorSubcategoria(mes, tipo, subcategoria).subscribe(operaciones => {
        expect(operaciones).toBeDefined();
        expect(operaciones.length).toBeGreaterThan(0);
        expect(operaciones[0].subcategoria).toBe('transporte');
        done();
      });

      const req = httpMock.expectOne(request => 
        request.url.includes('noviembre-2024.json')
      );
      req.flush([
        {
          id: '1',
          operacion: 'Uber',
          monto: -50,
          fecha: '2024-11-15',
          categoria: 'gastos',
          tipoGasto: 'hormiga',
          subcategoria: 'transporte',
          vinculadaARecurrente: false
        }
      ]);
    });
  });

  describe('recategorizarMovimiento', () => {
    it('should recategorize movement successfully', (done) => {
      const request: RecategorizacionRequest = {
        operacionId: '123',
        nuevaCategoria: 'ingresos',
        mes: 'Noviembre 2024'
      };

      // First load operaciones into cache
      service['operacionesCache'].set('Noviembre 2024', [
        {
          id: '123',
          operacion: 'Transferencia',
          monto: -500,
          fecha: new Date('2024-11-15'),
          categoria: 'movimiento_caja',
          categoriaUsuario: 'no_aplica',
          tipoMovimiento: 'transferencia'
        } as any
      ]);

      service.recategorizarMovimiento(request).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.message).toContain('exitosamente');
        expect(response.operacionActualizada).toBeDefined();
        expect(response.operacionActualizada?.categoria).toBe('ingresos');
        done();
      });
    });
  });

  describe('getOperacionesRecurrentesVinculables', () => {
    it('should return operaciones vinculables', (done) => {
      service.getOperacionesRecurrentesVinculables().subscribe(operaciones => {
        expect(operaciones).toBeDefined();
        expect(Array.isArray(operaciones)).toBe(true);
        done();
      });

      const req = httpMock.expectOne(request => 
        request.url.includes('operaciones-recurrentes.json')
      );
      req.flush([
        {
          id: 'op-1',
          nombre: 'Netflix',
          descripcion: 'Suscripción mensual',
          monto: -50,
          tipo: 'egreso'
        }
      ]);
    });
  });

  describe('getPagosFinancierosVinculables', () => {
    it('should return pagos financieros vinculables', (done) => {
      service.getPagosFinancierosVinculables().subscribe(pagos => {
        expect(pagos).toBeDefined();
        expect(Array.isArray(pagos)).toBe(true);
        expect(pagos.length).toBeGreaterThan(0);
        done();
      });

      const req = httpMock.expectOne(request => 
        request.url.includes('configuracion-plan.json')
      );
      req.flush({
        ingresoNetoMensual: 4000,
        metaAhorro: 800,
        fechaVigencia: '2024-11-01'
      });
    });
  });
});
