import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { DetalleGastosComponent } from './detalle-gastos.component';
import { PlanAhorrosService } from '../../../core/services/plan-ahorros.service';
import { TipoGastoDetalle } from '../../../core/models/plan-ahorros.interface';

describe('DetalleGastosComponent', () => {
  let component: DetalleGastosComponent;
  let fixture: ComponentFixture<DetalleGastosComponent>;
  let mockPlanService: jasmine.SpyObj<PlanAhorrosService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const mockDetalleGastos: TipoGastoDetalle = {
    tipo: 'hormigas',
    titulo: 'Gastos Hormiga',
    totalMonto: 500,
    totalPorcentaje: 100,
    subcategorias: [
      {
        nombre: 'Transporte',
        monto: 300,
        porcentaje: 60,
        color: '#FF6B6B',
        icono: 'directions_car',
        operaciones: []
      },
      {
        nombre: 'Delivery',
        monto: 200,
        porcentaje: 40,
        color: '#4ECDC4',
        icono: 'delivery_dining',
        operaciones: []
      }
    ]
  };

  beforeEach(async () => {
    mockPlanService = jasmine.createSpyObj('PlanAhorrosService', ['getDetalleGastosPorTipo']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      params: of({ tipo: 'hormigas' })
    };

    await TestBed.configureTestingModule({
      imports: [DetalleGastosComponent],
      providers: [
        { provide: PlanAhorrosService, useValue: mockPlanService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    mockPlanService.getDetalleGastosPorTipo.and.returnValue(of(mockDetalleGastos));
    fixture = TestBed.createComponent(DetalleGastosComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load detalle gastos on init', () => {
    fixture.detectChanges();
    expect(mockPlanService.getDetalleGastosPorTipo).toHaveBeenCalledWith('Noviembre 2024', 'hormigas');
    expect(component.detalleGastos).toEqual(mockDetalleGastos);
  });

  it('should navigate to subcategoria detail', () => {
    component.tipoGasto = 'hormigas';
    const subcategoria = mockDetalleGastos.subcategorias[0];
    
    component.verDetalleSubcategoria(subcategoria);
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/plan-ahorros/gastos', 'hormigas', 'transporte']);
  });

  it('should navigate back to plan-ahorros', () => {
    component.volver();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/plan-ahorros']);
  });
});
