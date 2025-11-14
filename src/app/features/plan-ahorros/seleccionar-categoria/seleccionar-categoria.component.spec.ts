import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { SeleccionarCategoriaComponent } from './seleccionar-categoria.component';

describe('SeleccionarCategoriaComponent', () => {
  let component: SeleccionarCategoriaComponent;
  let fixture: ComponentFixture<SeleccionarCategoriaComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      params: of({ tipo: 'transferencias', operacionId: '123' })
    };

    await TestBed.configureTestingModule({
      imports: [SeleccionarCategoriaComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SeleccionarCategoriaComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select categoria', () => {
    component.seleccionarCategoria('ingresos');
    expect(component.categoriaSeleccionada).toBe('ingresos');
  });

  it('should enable confirmar button when categoria is selected', () => {
    component.categoriaSeleccionada = null;
    fixture.detectChanges();
    
    const button = fixture.nativeElement.querySelector('.btn-confirmar');
    expect(button.disabled).toBe(true);
    
    component.seleccionarCategoria('ingresos');
    fixture.detectChanges();
    
    expect(button.disabled).toBe(false);
  });

  it('should navigate to confirmar with query params', () => {
    component.tipoMovimiento = 'transferencias';
    component.operacionId = '123';
    component.categoriaSeleccionada = 'ingresos';
    
    component.confirmar();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['/plan-ahorros/movimientos-caja', 'transferencias', 'confirmar', '123'],
      { queryParams: { categoria: 'ingresos' } }
    );
  });
});
