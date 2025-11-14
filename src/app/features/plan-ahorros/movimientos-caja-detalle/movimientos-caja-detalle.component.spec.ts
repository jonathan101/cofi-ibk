import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { MovimientosCajaDetalleComponent } from './movimientos-caja-detalle.component';
import { PlanAhorrosService } from '../../../core/services/plan-ahorros.service';
import { MovimientoCaja } from '../../../core/models/plan-ahorros.interface';

describe('MovimientosCajaDetalleComponent', () => {
  let component: MovimientosCajaDetalleComponent;
  let fixture: ComponentFixture<MovimientosCajaDetalleComponent>;
  let mockPlanService: jasmine.SpyObj<PlanAhorrosService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const mockMovimientos: MovimientoCaja[] = [
    {
      id: '1',
      descripcion: 'Transferencia a cuenta externa',
      monto: -500,
      fecha: new Date('2024-11-15'),
      subcategoria: 'transferencias'
    },
    {
      id: '2',
      descripcion: 'Transferencia recibida',
      monto: 300,
      fecha: new Date('2024-11-14'),
      subcategoria: 'transferencias'
    }
  ];

  beforeEach(async () => {
    mockPlanService = jasmine.createSpyObj('PlanAhorrosService', ['getMovimientosCajaPorTipo']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      params: of({ tipo: 'transferencias' })
    };

    await TestBed.configureTestingModule({
      imports: [MovimientosCajaDetalleComponent],
      providers: [
        { provide: PlanAhorrosService, useValue: mockPlanService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    mockPlanService.getMovimientosCajaPorTipo.and.returnValue(of(mockMovimientos));
    fixture = TestBed.createComponent(MovimientosCajaDetalleComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load movimientos on init', () => {
    fixture.detectChanges();
    expect(mockPlanService.getMovimientosCajaPorTipo).toHaveBeenCalledWith('Noviembre 2024', 'transferencias');
    expect(component.movimientos).toEqual(mockMovimientos);
  });

  it('should filter entradas correctly', () => {
    component.movimientos = mockMovimientos;
    component.aplicarFiltro('entradas');
    expect(component.movimientosFiltrados.length).toBe(1);
    expect(component.movimientosFiltrados[0].monto).toBeGreaterThan(0);
  });

  it('should filter salidas correctly', () => {
    component.movimientos = mockMovimientos;
    component.aplicarFiltro('salidas');
    expect(component.movimientosFiltrados.length).toBe(1);
    expect(component.movimientosFiltrados[0].monto).toBeLessThan(0);
  });

  it('should navigate to recategorizar', () => {
    component.tipoMovimiento = 'transferencias';
    const movimiento = mockMovimientos[0];
    
    component.recategorizar(movimiento);
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/plan-ahorros/movimientos-caja', 'transferencias', 'recategorizar', '1']);
  });
});
