import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ConfirmarRecategorizacionComponent } from './confirmar-recategorizacion.component';
import { PlanAhorrosService } from '../../../core/services/plan-ahorros.service';
import { OperacionVinculable, RecategorizacionResponse } from '../../../core/models/recategorizacion.interface';

describe('ConfirmarRecategorizacionComponent', () => {
  let component: ConfirmarRecategorizacionComponent;
  let fixture: ComponentFixture<ConfirmarRecategorizacionComponent>;
  let mockPlanService: jasmine.SpyObj<PlanAhorrosService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const mockOperacionesVinculables: OperacionVinculable[] = [
    {
      id: 'op-1',
      nombre: 'Netflix',
      descripcion: 'Suscripción mensual',
      tipo: 'operacion_recurrente',
      icono: 'repeat'
    }
  ];

  const mockResponse: RecategorizacionResponse = {
    success: true,
    message: 'Movimiento recategorizado exitosamente'
  };

  beforeEach(async () => {
    mockPlanService = jasmine.createSpyObj('PlanAhorrosService', [
      'getOperacionesRecurrentesVinculables',
      'getPagosFinancierosVinculables',
      'recategorizarMovimiento'
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      params: of({ tipo: 'transferencias', operacionId: '123' }),
      queryParams: of({ categoria: 'operaciones_recurrentes' })
    };

    await TestBed.configureTestingModule({
      imports: [ConfirmarRecategorizacionComponent],
      providers: [
        { provide: PlanAhorrosService, useValue: mockPlanService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    mockPlanService.getOperacionesRecurrentesVinculables.and.returnValue(of(mockOperacionesVinculables));
    mockPlanService.recategorizarMovimiento.and.returnValue(of(mockResponse));
    
    fixture = TestBed.createComponent(ConfirmarRecategorizacionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load operaciones vinculables for operaciones_recurrentes', () => {
    fixture.detectChanges();
    expect(mockPlanService.getOperacionesRecurrentesVinculables).toHaveBeenCalled();
    expect(component.operacionesVinculables).toEqual(mockOperacionesVinculables);
  });

  it('should select operacion', () => {
    component.seleccionarOperacion('op-1');
    expect(component.operacionSeleccionada).toBe('op-1');
  });

  it('should confirm recategorizacion successfully', () => {
    component.operacionId = '123';
    component.categoria = 'ingresos';
    component.mesActual = 'Noviembre 2024';
    
    component.confirmar();
    
    expect(mockPlanService.recategorizarMovimiento).toHaveBeenCalledWith({
      operacionId: '123',
      nuevaCategoria: 'ingresos',
      operacionVinculadaId: undefined,
      mes: 'Noviembre 2024'
    });
  });
});
