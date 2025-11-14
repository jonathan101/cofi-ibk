import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { DetalleSubcategoriaComponent } from './detalle-subcategoria.component';
import { PlanAhorrosService } from '../../../core/services/plan-ahorros.service';
import { OperacionFinanciera } from '../../../core/models/operacion-financiera.interface';

describe('DetalleSubcategoriaComponent', () => {
  let component: DetalleSubcategoriaComponent;
  let fixture: ComponentFixture<DetalleSubcategoriaComponent>;
  let mockPlanService: jasmine.SpyObj<PlanAhorrosService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const mockOperaciones: OperacionFinanciera[] = [
    {
      id: '1',
      operacion: 'Uber',
      monto: -50,
      fecha: new Date('2024-11-15'),
      categoria: 'gastos',
      tipoGasto: 'hormiga',
      subcategoria: 'transporte'
    } as OperacionFinanciera,
    {
      id: '2',
      operacion: 'Taxi',
      monto: -30,
      fecha: new Date('2024-11-14'),
      categoria: 'gastos',
      tipoGasto: 'hormiga',
      subcategoria: 'transporte'
    } as OperacionFinanciera
  ];

  beforeEach(async () => {
    mockPlanService = jasmine.createSpyObj('PlanAhorrosService', ['getOperacionesPorSubcategoria']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      params: of({ tipo: 'hormigas', subcategoria: 'transporte' })
    };

    await TestBed.configureTestingModule({
      imports: [DetalleSubcategoriaComponent],
      providers: [
        { provide: PlanAhorrosService, useValue: mockPlanService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    mockPlanService.getOperacionesPorSubcategoria.and.returnValue(of(mockOperaciones));
    fixture = TestBed.createComponent(DetalleSubcategoriaComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load operaciones on init', () => {
    fixture.detectChanges();
    expect(mockPlanService.getOperacionesPorSubcategoria).toHaveBeenCalledWith('Noviembre 2024', 'hormigas', 'transporte');
    expect(component.operaciones).toEqual(mockOperaciones);
  });

  it('should format fecha correctly', () => {
    const fecha = new Date('2024-11-15');
    const formatted = component.formatearFecha(fecha);
    expect(formatted).toContain('nov');
  });
});
