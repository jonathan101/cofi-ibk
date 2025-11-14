import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SelectorMesComponent } from '../../shared/components/selector-mes/selector-mes.component';
import { SidebarMenuComponent } from '../../shared/components/sidebar-menu/sidebar-menu.component';
import { PullDownHandleComponent } from '../../shared/components/pull-down-handle/pull-down-handle.component';
import { TransferenciaAhorroModalComponent } from '../../shared/components/transferencia-ahorro-modal/transferencia-ahorro-modal.component';
import { PlanAhorrosService } from '../../core/services/plan-ahorros.service';
import { ResumenFinanciero, DetalleConsumo, DatosMultiMes } from '../../core/models/plan-ahorros.interface';
import { OperacionFinanciera } from '../../core/models/operacion-financiera.interface';
import { ConfiguracionPlan } from '../../core/models/configuracion-plan.interface';
import { TransferenciaAhorro } from '../../core/models/chanchito-ahorro.interface';

interface SeccionPlan {
  nombre: string;
  key: string;
  monto: number;
  colapsada: boolean;
  operaciones?: OperacionFinanciera[];
}

@Component({
  selector: 'app-plan-ahorros',
  standalone: true,
  imports: [CommonModule, SelectorMesComponent, SidebarMenuComponent, PullDownHandleComponent, TransferenciaAhorroModalComponent],
  templateUrl: './plan-ahorros.component.html',
  styleUrls: ['./plan-ahorros.component.scss']
})
export class PlanAhorrosComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('planContent', { read: ElementRef }) planContentRef!: ElementRef<HTMLDivElement>;
  
  private destroy$ = new Subject<void>();
  
  // Navegación de meses
  mesActual: string = 'Noviembre 2024';
  mesesDisponibles: string[] = ['Agosto 2024', 'Septiembre 2024', 'Octubre 2024', 'Noviembre 2024'];
  
  // Resumen financiero
  resumen: ResumenFinanciero | null = null;
  saldoChanchitos: number = 0;
  
  // Secciones del plan
  secciones: SeccionPlan[] = [];
  todasColapsadas: boolean = false;
  
  // Subsecciones de gastos con pills
  resumenGastos: {
    cobrosAutomaticos: DetalleConsumo | null;
    gastosHormiga: DetalleConsumo | null;
    gastosMedios: DetalleConsumo | null;
    gastosExcepcionales: DetalleConsumo | null;
  } = {
    cobrosAutomaticos: null,
    gastosHormiga: null,
    gastosMedios: null,
    gastosExcepcionales: null
  };
  
  // Subsecciones de movimientos de caja
  resumenMovimientos: {
    transferencias: { total: number };
    retiros: { total: number };
    depositos: { total: number };
    otros: { total: number };
  } = {
    transferencias: { total: 0 },
    retiros: { total: 0 },
    depositos: { total: 0 },
    otros: { total: 0 }
  };
  
  // Carga financiera con pill
  cargaFinancieraDetalle: DetalleConsumo | null = null;
  
  // Operaciones atrasadas
  operacionesAtrasadas: {
    pagosFinancieros: OperacionFinanciera[];
    operacionesRecurrentes: OperacionFinanciera[];
  } = {
    pagosFinancieros: [],
    operacionesRecurrentes: []
  };
  
  // Operaciones del mes
  operacionesRecurrentes: OperacionFinanciera[] = [];
  operacionesIngresos: OperacionFinanciera[] = [];
  operacionesDelMes: OperacionFinanciera[] = [];
  operacionesCargaFinanciera: OperacionFinanciera[] = [];
  tiposMovimientoCaja: { nombre: string; monto: number }[] = [];
  
  // Operaciones por subsección de gastos
  operacionesCobrosAutomaticos: OperacionFinanciera[] = [];
  operacionesGastosHormiga: OperacionFinanciera[] = [];
  operacionesGastosMedios: OperacionFinanciera[] = [];
  operacionesGastosExcepcionales: OperacionFinanciera[] = [];
  operacionesMovimientosCaja: OperacionFinanciera[] = [];
  
  // Estado de subsecciones expandidas
  subseccionesExpandidas: Set<string> = new Set();
  
  // Estados de UI
  loading: boolean = true;
  error: string | null = null;
  showSidebar: boolean = false;
  resumenExpandido: boolean = true;
  
  // Validación multi-mes
  validacionSaldos: { valido: boolean; errores: string[] } | null = null;
  
  // Configuración
  configuracion: ConfiguracionPlan | null = null;
  
  // Pull-to-refresh
  isPulling: boolean = false;
  isRefreshing: boolean = false;
  pullStartY: number = 0;
  pullDistance: number = 0;
  readonly PULL_THRESHOLD = 80; // Distancia mínima para activar refresh

  // Drag to send money
  isDragging: boolean = false;
  dragStartX: number = 0;
  dragPosition: number = 0;
  readonly DRAG_THRESHOLD = 200; // Distancia mínima para enviar dinero (en px)
  readonly DRAG_MAX_DISTANCE = 350; // Distancia máxima que puede recorrer el círculo (ancho del botón - tamaño del círculo)
  
  // Modal de transferencia
  showTransferenciaModal: boolean = false;

  // Scroll position restoration
  private readonly SCROLL_POSITION_KEY = 'plan-ahorros-scroll-position';

  constructor(
    private planService: PlanAhorrosService,
    private router: Router,
    private viewportScroller: ViewportScroller
  ) {}

  ngOnInit(): void {
    this.cargarDatosMes(this.mesActual);
    this.validarConsistenciaMultiMes();
  }

  ngAfterViewInit(): void {
    // Restaurar posición de scroll después de que la vista esté inicializada
    this.restaurarScrollPosition();
  }

  /**
   * Restaura la posición de scroll guardada
   */
  private restaurarScrollPosition(): void {
    const savedPosition = sessionStorage.getItem(this.SCROLL_POSITION_KEY);
    if (savedPosition && this.planContentRef) {
      try {
        const scrollY = parseInt(savedPosition, 10);
        // Esperar a que el DOM esté completamente renderizado
        setTimeout(() => {
          if (this.planContentRef?.nativeElement) {
            this.planContentRef.nativeElement.scrollTop = scrollY;
            console.log('Scroll restaurado a:', scrollY);
          }
        }, 150);
      } catch (error) {
        console.error('Error restaurando scroll:', error);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga todos los datos del mes seleccionado
   */
  cargarDatosMes(mes: string): void {
    this.loading = true;
    this.error = null;
    
    // Obtener saldo inicial del mes seleccionado
    const saldoInicial = this.getSaldoInicialMes(mes);
    
    forkJoin({
      resumen: this.planService.getResumenFinanciero(mes, saldoInicial),
      chanchitos: this.planService.getChanchitosAhorro(),
      atrasadas: this.planService.getOperacionesAtrasadas(mes),
      config: this.planService.getConfiguracion(),
      operacionesRecurrentes: this.planService.getOperacionesPorFiltro(mes, {
        vinculadaARecurrente: true
      }),
      operacionesIngresos: this.planService.getOperacionesPorFiltro(mes, {
        categoria: 'ingresos'
      }),
      operacionesCargaFinanciera: this.planService.getOperacionesPorFiltro(mes, {
        categoria: 'pago_financiero'
      })
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ({ resumen, chanchitos, atrasadas, config, operacionesRecurrentes, operacionesIngresos, operacionesCargaFinanciera }) => {
        this.resumen = resumen;
        this.configuracion = config;
        this.saldoChanchitos = chanchitos.reduce((sum, ch) => sum + ch.montoActual, 0);
        this.operacionesAtrasadas = atrasadas;
        this.operacionesRecurrentes = operacionesRecurrentes;
        this.operacionesIngresos = operacionesIngresos;
        this.operacionesCargaFinanciera = operacionesCargaFinanciera;
        
        // Cargar movimientos de caja agrupados por tipo
        this.cargarMovimientosCaja(mes);
        
        // Cargar detalles de gastos y carga financiera
        this.cargarDetallesConsumo(mes);
        
        // Cargar operaciones por subsección
        this.cargarOperacionesSubsecciones(mes);
        
        // Inicializar secciones
        this.inicializarSecciones();
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando datos del mes:', err);
        this.error = 'Error al cargar los datos del plan de ahorros';
        this.loading = false;
      }
    });
  }

  /**
   * Carga los detalles de consumo por tipo de producto (TD/TC) para gastos y carga financiera
   */
  cargarDetallesConsumo(mes: string): void {
    if (!this.configuracion) return;
    
    // Cargar detalles de cada subsección de gastos
    this.cargarDetalleGasto(mes, 'cobrosAutomaticos', 'automatico');
    this.cargarDetalleGasto(mes, 'gastosHormiga', 'hormiga');
    this.cargarDetalleGasto(mes, 'gastosMedios', 'medio');
    this.cargarDetalleGasto(mes, 'gastosExcepcionales', 'excepcional');
    
    // Cargar detalle de carga financiera
    this.cargarDetalleCargaFinanciera(mes);
  }

  /**
   * Carga las operaciones de cada subsección
   * Requirement 9, 10: Mostrar operaciones en cada sección
   */
  cargarOperacionesSubsecciones(mes: string): void {
    // Cargar operaciones de cobros automáticos
    this.planService.getOperacionesPorFiltro(mes, {
      categoria: 'gastos',
      condiciones: [{ campo: 'tipoGasto', operador: '=', valor: 'automatico' }],
      vinculadaARecurrente: false
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (ops) => {
        this.operacionesCobrosAutomaticos = ops;
      }
    });

    // Cargar operaciones de gastos hormiga
    this.planService.getOperacionesPorFiltro(mes, {
      categoria: 'gastos',
      condiciones: [{ campo: 'tipoGasto', operador: '=', valor: 'hormiga' }],
      vinculadaARecurrente: false
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (ops) => {
        this.operacionesGastosHormiga = ops;
      }
    });

    // Cargar operaciones de gastos medios
    this.planService.getOperacionesPorFiltro(mes, {
      categoria: 'gastos',
      condiciones: [{ campo: 'tipoGasto', operador: '=', valor: 'medio' }],
      vinculadaARecurrente: false
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (ops) => {
        this.operacionesGastosMedios = ops;
      }
    });

    // Cargar operaciones de gastos excepcionales
    this.planService.getOperacionesPorFiltro(mes, {
      categoria: 'gastos',
      condiciones: [{ campo: 'tipoGasto', operador: '=', valor: 'excepcional' }],
      vinculadaARecurrente: false
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (ops) => {
        this.operacionesGastosExcepcionales = ops;
      }
    });

    // Cargar operaciones de movimientos de caja
    this.planService.getOperacionesPorFiltro(mes, {
      categoria: 'movimiento_caja',
      categoriaUsuario: null,
      vinculadaARecurrente: false
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (ops) => {
        this.operacionesMovimientosCaja = ops;
      }
    });
  }

  /**
   * Carga los movimientos de caja agrupados por tipo
   * Solo cuenta operaciones sin categoriaUsuario (excluye operaciones recurrentes)
   */
  cargarMovimientosCaja(mes: string): void {
    const tiposMovimiento = ['transferencia', 'retiro', 'deposito', 'otros'];
    const nombresTipo: { [key: string]: string } = {
      'transferencia': 'Transferencias',
      'retiro': 'Retiros',
      'deposito': 'Depósitos',
      'otros': 'Otros'
    };

    this.tiposMovimientoCaja = [];

    // Cargar transferencias
    this.planService.sumarOperaciones(mes, {
      categoria: 'movimiento_caja',
      categoriaUsuario: null,
      vinculadaARecurrente: false,
      condiciones: [{ campo: 'tipoMovimiento', operador: '=', valor: 'transferencia' }]
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (monto) => {
        this.resumenMovimientos.transferencias.total = monto;
        if (monto !== 0) {
          this.tiposMovimientoCaja.push({
            nombre: nombresTipo['transferencia'],
            monto: monto
          });
        }
      }
    });

    // Cargar retiros
    this.planService.sumarOperaciones(mes, {
      categoria: 'movimiento_caja',
      categoriaUsuario: null,
      vinculadaARecurrente: false,
      condiciones: [{ campo: 'tipoMovimiento', operador: '=', valor: 'retiro' }]
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (monto) => {
        this.resumenMovimientos.retiros.total = monto;
        if (monto !== 0) {
          this.tiposMovimientoCaja.push({
            nombre: nombresTipo['retiro'],
            monto: monto
          });
        }
      }
    });

    // Cargar depósitos
    this.planService.sumarOperaciones(mes, {
      categoria: 'movimiento_caja',
      categoriaUsuario: null,
      vinculadaARecurrente: false,
      condiciones: [{ campo: 'tipoMovimiento', operador: '=', valor: 'deposito' }]
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (monto) => {
        this.resumenMovimientos.depositos.total = monto;
        if (monto !== 0) {
          this.tiposMovimientoCaja.push({
            nombre: nombresTipo['deposito'],
            monto: monto
          });
        }
      }
    });

    // Cargar otros
    this.planService.sumarOperaciones(mes, {
      categoria: 'movimiento_caja',
      categoriaUsuario: null,
      vinculadaARecurrente: false,
      condiciones: [{ campo: 'tipoMovimiento', operador: '=', valor: 'otros' }]
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (monto) => {
        this.resumenMovimientos.otros.total = monto;
        if (monto !== 0) {
          this.tiposMovimientoCaja.push({
            nombre: nombresTipo['otros'],
            monto: monto
          });
        }
      }
    });
  }

  /**
   * Carga el detalle de consumo de un tipo de gasto específico
   */
  cargarDetalleGasto(mes: string, key: keyof typeof this.resumenGastos, tipoGasto: string): void {
    if (!this.configuracion) return;
    
    forkJoin({
      td: this.planService.sumarOperaciones(mes, {
        categoria: 'gastos',
        tipoProducto: 'TD',
        condiciones: tipoGasto === 'automatico' 
          ? [{ campo: 'tipoGasto', operador: '=', valor: 'automatico' }]
          : [{ campo: 'tipoGasto', operador: '=', valor: tipoGasto }],
        vinculadaARecurrente: false
      }),
      tc: this.planService.sumarOperaciones(mes, {
        categoria: 'gastos',
        tipoProducto: 'TC',
        condiciones: tipoGasto === 'automatico'
          ? [{ campo: 'tipoGasto', operador: '=', valor: 'automatico' }]
          : [{ campo: 'tipoGasto', operador: '=', valor: tipoGasto }],
        vinculadaARecurrente: false
      })
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ({ td, tc }) => {
        const total = Math.abs(td) + Math.abs(tc);
        const topeMensual = this.obtenerTopeMensual(key);
        
        this.resumenGastos[key] = {
          consumoDebito: Math.abs(td),
          consumoTC: Math.abs(tc),
          total,
          topeMensual,
          porcentajeUsado: topeMensual ? (total / topeMensual) * 100 : 0,
          estadoAlerta: this.calcularEstadoAlerta(total, topeMensual)
        };
      }
    });
  }

  /**
   * Carga el detalle de consumo de carga financiera
   */
  cargarDetalleCargaFinanciera(mes: string): void {
    if (!this.configuracion) return;
    
    forkJoin({
      td: this.planService.sumarOperaciones(mes, {
        categoria: 'pago_financiero',
        tipoProducto: 'TD',
        estado: 'pagado',
        vinculadaARecurrente: false
      }),
      tc: this.planService.sumarOperaciones(mes, {
        categoria: 'pago_financiero',
        tipoProducto: 'TC',
        estado: 'pagado',
        vinculadaARecurrente: false
      })
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ({ td, tc }) => {
        const total = Math.abs(td) + Math.abs(tc);
        const topeMensual = this.obtenerTopeMensual('cargaFinanciera');
        
        this.cargaFinancieraDetalle = {
          consumoDebito: Math.abs(td),
          consumoTC: Math.abs(tc),
          total,
          topeMensual,
          porcentajeUsado: topeMensual ? (total / topeMensual) * 100 : 0,
          estadoAlerta: this.calcularEstadoAlerta(total, topeMensual)
        };
      }
    });
  }

  /**
   * Obtiene el tope mensual configurado para una categoría
   */
  obtenerTopeMensual(categoria: string): number {
    if (!this.configuracion) return 0;
    
    const topes = this.configuracion.topesMensuales;
    let tope: { porcentaje?: number; montoFijo?: number } | undefined;
    
    switch (categoria) {
      case 'cobrosAutomaticos':
        tope = topes.cobrosAutomaticos;
        break;
      case 'gastosHormiga':
        tope = topes.gastosHormiga;
        break;
      case 'gastosMedios':
        tope = topes.gastosMedios;
        break;
      case 'gastosExcepcionales':
        tope = topes.gastosExcepcionales;
        break;
      case 'cargaFinanciera':
        tope = topes.cargaFinanciera;
        break;
      default:
        return 0;
    }
    
    if (!tope) return 0;
    
    // Prioridad: montoFijo > porcentaje
    if (tope.montoFijo) {
      return tope.montoFijo;
    } else if (tope.porcentaje) {
      return (this.configuracion.ingresoNetoMensual * tope.porcentaje) / 100;
    }
    
    return 0;
  }

  /**
   * Calcula el estado de alerta según el porcentaje usado
   */
  calcularEstadoAlerta(total: number, topeMensual: number): 'normal' | 'warning' | 'danger' {
    if (!topeMensual) return 'normal';
    
    const porcentaje = (total / topeMensual) * 100;
    
    if (porcentaje >= 100) return 'danger';
    if (porcentaje >= 90) return 'warning';
    return 'normal';
  }

  /**
   * Inicializa las secciones del plan
   */
  inicializarSecciones(): void {
    if (!this.resumen) return;
    
    this.secciones = [
      {
        nombre: 'Pagos Atrasados',
        key: 'atrasados',
        monto: this.getTotalAtrasados(),
        colapsada: false
      },
      {
        nombre: 'Ingresos',
        key: 'ingresos',
        monto: this.resumen.ingresos,
        colapsada: false
      },
      {
        nombre: 'Operaciones Regulares',
        key: 'operacionesRegulares',
        monto: this.resumen.operacionesRegulares,
        colapsada: false
      },
      {
        nombre: 'Gastos',
        key: 'gastos',
        monto: this.resumen.gastosMes,
        colapsada: false
      },
      {
        nombre: 'Movimientos de Caja',
        key: 'movimientosCaja',
        monto: this.resumen.movimientosCaja,
        colapsada: false
      },
      {
        nombre: 'Carga Financiera',
        key: 'cargaFinanciera',
        monto: this.resumen.cargaFinanciera,
        colapsada: false
      }
    ];
  }

  /**
   * Maneja el cambio de mes
   */
  onMesChange(nuevoMes: string): void {
    this.mesActual = nuevoMes;
    this.cargarDatosMes(nuevoMes);
  }

  /**
   * Alterna el estado de colapso de una sección
   */
  toggleSeccion(seccion: SeccionPlan): void {
    seccion.colapsada = !seccion.colapsada;
  }

  /**
   * Colapsa o expande todas las secciones
   */
  toggleTodasSecciones(): void {
    this.todasColapsadas = !this.todasColapsadas;
    this.secciones.forEach(s => s.colapsada = this.todasColapsadas);
  }

  /**
   * Calcula el saldo final según la fórmula:
   * Saldo Final = Saldo Inicial + Ingresos + Operaciones Regulares + Gastos + Movimientos de Caja + Carga Financiera
   */
  getSaldoFinal(): number {
    if (!this.resumen) return 0;
    
    return this.resumen.saldoInicial + 
           this.resumen.ingresos + 
           this.resumen.operacionesRegulares + 
           this.resumen.gastosMes + 
           this.resumen.movimientosCaja + 
           this.resumen.cargaFinanciera;
  }

  /**
   * Calcula el saldo restante para una categoría de gasto
   */
  calcularSaldoRestante(detalle: DetalleConsumo | null): { monto: number; porcentaje: number; estado: 'normal' | 'warning' | 'danger' } {
    if (!detalle || !detalle.topeMensual) {
      return {
        monto: 0,
        porcentaje: 0,
        estado: 'normal'
      };
    }

    const saldoRestante = detalle.topeMensual - detalle.total;
    const porcentaje = Math.round(detalle.porcentajeUsado);
    
    let estado: 'normal' | 'warning' | 'danger' = 'normal';
    if (porcentaje >= 100) {
      estado = 'danger';
    } else if (porcentaje >= 90) {
      estado = 'warning';
    }

    return {
      monto: saldoRestante,
      porcentaje,
      estado
    };
  }

  /**
   * Toggle del sidebar
   */
  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
  }

  /**
   * Cierra el sidebar
   */
  closeSidebar(): void {
    this.showSidebar = false;
  }

  /**
   * Guarda la posición actual de scroll
   */
  private saveScrollPosition(): void {
    if (this.planContentRef?.nativeElement) {
      const scrollY = this.planContentRef.nativeElement.scrollTop;
      sessionStorage.setItem(this.SCROLL_POSITION_KEY, scrollY.toString());
      console.log('Scroll guardado:', scrollY);
    }
  }

  /**
   * Abre la configuración del plan
   */
  abrirConfiguracion(): void {
    this.saveScrollPosition();
    this.router.navigate(['/plan-ahorros/configuracion']);
  }

  /**
   * Navega al detalle completo de gastos (deprecated - usar verDetalleGastosPorTipo)
   */
  verDetalleGastos(): void {
    this.saveScrollPosition();
    this.router.navigate(['/plan-ahorros/gastos/todos']);
  }

  /**
   * Navega al detalle de gastos por tipo
   * Requirements: 1.1
   */
  verDetalleGastosPorTipo(tipo: 'automaticos' | 'hormigas' | 'medios' | 'excepcionales'): void {
    this.saveScrollPosition();
    this.router.navigate(['/plan-ahorros/gastos', tipo]);
  }

  /**
   * Navega al detalle de movimientos de caja por tipo
   * Requirements: 3.1
   */
  verDetalleMovimientosCaja(tipo: string): void {
    this.saveScrollPosition();
    this.router.navigate(['/plan-ahorros/detalle/movimientos-caja', tipo]);
  }

  /**
   * Alterna el estado de colapso de una sección por su key
   */
  toggleSeccionKey(key: string): void {
    const seccion = this.secciones.find(s => s.key === key);
    if (seccion) {
      seccion.colapsada = !seccion.colapsada;
    }
  }

  /**
   * Verifica si una sección está colapsada
   */
  isSeccionColapsada(key: string): boolean {
    const seccion = this.secciones.find(s => s.key === key);
    return seccion ? seccion.colapsada : true;
  }

  /**
   * Formatea un número como moneda
   */
  formatCurrency(value: number): string {
    return `S/ ${Math.abs(value).toFixed(2)}`;
  }

  /**
   * Obtiene la clase CSS para el pill de alerta
   */
  getPillClass(estado: 'normal' | 'warning' | 'danger'): string {
    return `pill-${estado}`;
  }

  /**
   * Verifica si hay operaciones atrasadas
   */
  tieneOperacionesAtrasadas(): boolean {
    return this.operacionesAtrasadas.pagosFinancieros.length > 0 ||
           this.operacionesAtrasadas.operacionesRecurrentes.length > 0;
  }

  /**
   * Verifica si es el mes actual
   */
  esMesActual(): boolean {
    return this.mesActual === 'Noviembre 2024';
  }

  /**
   * Obtiene el resumen del mes cerrado generado por IA
   */
  getResumenMesCerrado(): string {
    if (!this.resumen) return '';
    
    // TODO: Integrar con servicio de IA para generar resumen personalizado
    // Por ahora, generar un resumen básico basado en los datos
    
    const ahorro = this.getAhorroActual();
    const porcentajeAhorro = this.getPorcentajeAhorro();
    const saldoFinal = this.getSaldoFinal();
    
    if (ahorro > 0) {
      return `Mes exitoso con un ahorro de ${this.formatCurrency(ahorro)} (${porcentajeAhorro}% de tu meta). Saldo final: ${this.formatCurrency(saldoFinal)}.`;
    } else if (ahorro < 0) {
      return `Mes con déficit de ${this.formatCurrency(Math.abs(ahorro))}. Revisa tus gastos para el próximo mes. Saldo final: ${this.formatCurrency(saldoFinal)}.`;
    } else {
      return `Mes equilibrado sin ahorro ni déficit. Saldo final: ${this.formatCurrency(saldoFinal)}.`;
    }
  }

  /**
   * Calcula el total de operaciones atrasadas de pagos financieros
   */
  getTotalPagosFinancierosAtrasados(): number {
    return this.operacionesAtrasadas.pagosFinancieros.reduce((sum, op) => sum + Math.abs(op.monto), 0);
  }

  /**
   * Calcula el total de operaciones recurrentes atrasadas
   */
  getTotalOperacionesRecurrentesAtrasadas(): number {
    return this.operacionesAtrasadas.operacionesRecurrentes.reduce((sum, op) => sum + Math.abs(op.monto), 0);
  }

  /**
   * Pull-to-refresh: Detecta inicio del gesto de arrastre
   */
  onTouchStart(event: TouchEvent): void {
    const scrollTop = (event.target as HTMLElement).scrollTop || 0;
    
    // Solo activar si estamos en el tope de la página
    if (scrollTop === 0 && !this.isRefreshing) {
      this.pullStartY = event.touches[0].clientY;
      this.isPulling = true;
    }
  }

  /**
   * Pull-to-refresh: Detecta movimiento del arrastre
   */
  onTouchMove(event: TouchEvent): void {
    if (!this.isPulling || this.isRefreshing) return;
    
    const currentY = event.touches[0].clientY;
    this.pullDistance = Math.max(0, currentY - this.pullStartY);
    
    // Prevenir scroll nativo si estamos arrastrando hacia abajo
    if (this.pullDistance > 0) {
      event.preventDefault();
    }
  }

  /**
   * Pull-to-refresh: Detecta fin del gesto y ejecuta refresh si aplica
   */
  onTouchEnd(): void {
    if (!this.isPulling) return;
    
    this.isPulling = false;
    
    // Si superamos el threshold, ejecutar refresh
    if (this.pullDistance >= this.PULL_THRESHOLD && !this.isRefreshing) {
      this.ejecutarRefresh();
    }
    
    // Reset pull distance
    this.pullDistance = 0;
  }

  /**
   * Pull-to-refresh: Detecta inicio del gesto con mouse (desktop)
   */
  onMouseDown(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const scrollTop = target.scrollTop || 0;
    
    // Solo activar si estamos en el tope de la página
    if (scrollTop === 0 && !this.isRefreshing) {
      this.pullStartY = event.clientY;
      this.isPulling = true;
    }
  }

  /**
   * Pull-to-refresh: Detecta movimiento con mouse (desktop)
   */
  onMouseMove(event: MouseEvent): void {
    if (!this.isPulling || this.isRefreshing) return;
    
    const currentY = event.clientY;
    this.pullDistance = Math.max(0, currentY - this.pullStartY);
  }

  /**
   * Pull-to-refresh: Detecta fin del gesto con mouse (desktop)
   */
  onMouseUp(): void {
    if (!this.isPulling) return;
    
    this.isPulling = false;
    
    // Si superamos el threshold, ejecutar refresh
    if (this.pullDistance >= this.PULL_THRESHOLD && !this.isRefreshing) {
      this.ejecutarRefresh();
    }
    
    // Reset pull distance
    this.pullDistance = 0;
  }

  /**
   * Ejecuta el refresh del plan de ahorros
   */
  ejecutarRefresh(): void {
    this.isRefreshing = true;
    
    this.planService.refreshPlanAhorros()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Recargar datos del mes actual
          this.cargarDatosMes(this.mesActual);
          
          // Esperar un momento para mostrar el indicador
          setTimeout(() => {
            this.isRefreshing = false;
          }, 500);
        },
        error: (err) => {
          console.error('Error al refrescar plan:', err);
          this.isRefreshing = false;
        }
      });
  }

  /**
   * Obtiene el estilo del indicador de pull-to-refresh
   */
  getPullIndicatorStyle(): any {
    if (!this.isPulling && !this.isRefreshing) {
      return { display: 'none' };
    }
    
    const opacity = Math.min(this.pullDistance / this.PULL_THRESHOLD, 1);
    const rotation = (this.pullDistance / this.PULL_THRESHOLD) * 360;
    
    return {
      opacity: this.isRefreshing ? 1 : opacity,
      transform: this.isRefreshing ? 'rotate(360deg)' : `rotate(${rotation}deg)`,
      transition: this.isRefreshing ? 'transform 1s linear' : 'none'
    };
  }

  /**
   * Valida la consistencia de saldos entre meses
   * Requirement 39: Validación multi-mes
   */
  validarConsistenciaMultiMes(): void {
    this.planService.getDatosMultiMes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (datosMulti) => {
          this.validacionSaldos = datosMulti.validacionSaldos;
          
          // Si hay errores, mostrarlos en consola para debugging
          if (!datosMulti.validacionSaldos.valido) {
            console.warn('Inconsistencias detectadas en saldos multi-mes:');
            datosMulti.validacionSaldos.errores.forEach(error => {
              console.warn(`  - ${error}`);
            });
          }
        },
        error: (err) => {
          console.error('Error al validar consistencia multi-mes:', err);
        }
      });
  }

  /**
   * Verifica si hay errores de validación multi-mes
   */
  tieneErroresValidacion(): boolean {
    return this.validacionSaldos !== null && !this.validacionSaldos.valido;
  }

  /**
   * Obtiene los errores de validación multi-mes
   */
  getErroresValidacion(): string[] {
    return this.validacionSaldos?.errores || [];
  }

  /**
   * Toggle del resumen expandido
   */
  toggleResumen(): void {
    this.resumenExpandido = !this.resumenExpandido;
  }



  /**
   * Calcula el ahorro actual
   */
  getAhorroActual(): number {
    if (!this.resumen) return 0;
    return Math.max(0, this.getSaldoFinal() - this.resumen.saldoInicial);
  }

  /**
   * Calcula el porcentaje de ahorro
   */
  getPorcentajeAhorro(): number {
    if (!this.resumen || !this.configuracion) return 0;
    const ahorroActual = this.getAhorroActual();
    const metaAhorro = this.configuracion.metaAhorro;
    return Math.round((ahorroActual / metaAhorro) * 100);
  }

  /**
   * Calcula el stroke-dasharray para el círculo de progreso
   */
  getProgressDashArray(): string {
    const circumference = 2 * Math.PI * 40; // radio = 40
    const porcentaje = this.getPorcentajeAhorro();
    const progress = Math.min(porcentaje, 100);
    const dashLength = (progress / 100) * circumference;
    return `${dashLength}, ${circumference}`;
  }

  /**
   * Calcula el stroke-dashoffset para el círculo de progreso
   */
  getProgressDashOffset(): number {
    return 0;
  }



  /**
   * Obtiene el total de operaciones atrasadas
   */
  getTotalAtrasados(): number {
    return this.getTotalPagosFinancierosAtrasados() + this.getTotalOperacionesRecurrentesAtrasadas();
  }

  /**
   * Maneja el evento de arrastrar hacia abajo para volver al home
   */
  onPullDown(): void {
    this.router.navigate(['/home']);
  }

  /**
   * Obtiene el saldo inicial para un mes específico
   * El saldo inicial de un mes es el saldo final del mes anterior
   * 
   * IMPORTANTE: Los saldos deben ser consistentes entre meses
   * Saldo Inicial del Mes N = Saldo Final del Mes N-1
   * 
   * Fórmula: Saldo Final = Saldo Inicial + Ingresos + Op. Recurrentes + Gastos + Mov. Caja + Carga Financiera
   * (Los valores negativos ya vienen con signo negativo)
   * 
   * Narrativa de ahorro incremental (Meta: S/ 800/mes):
   * - Agosto: Ahorro de S/ 57 (7% de meta) - Primer mes, muchos gastos
   * - Septiembre: Ahorro de S/ 300 (37% de meta) - Mejorando control
   * - Octubre: Ahorro de S/ 550 (69% de meta) - Buen progreso
   * - Noviembre: Ahorro de S/ 850 (106% de meta) - ¡Superó la meta!
   */
  getSaldoInicialMes(mes: string): number {
    // Saldos iniciales por mes corregidos
    // Cada saldo inicial = saldo final del mes anterior
    const saldosIniciales: { [key: string]: number } = {
      'Agosto 2024': 4000,      // Saldo inicial del primer mes (base)
      'Septiembre 2024': 5575,  // Saldo final de Agosto
      'Octubre 2024': 6008,     // Saldo final de Septiembre (corregido)
      'Noviembre 2024': 8129    // Saldo final de Octubre (corregido)
    };

    return saldosIniciales[mes] || 4000; // Default 4000 si no se encuentra
  }

  /**
   * Drag to send: Inicia el arrastre del círculo S/
   */
  onDragStart(event: MouseEvent | TouchEvent): void {
    this.isDragging = true;
    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    this.dragStartX = clientX - this.dragPosition;

    // Agregar listeners para el movimiento y fin del drag
    if (event instanceof MouseEvent) {
      document.addEventListener('mousemove', this.onDragMove);
      document.addEventListener('mouseup', this.onDragEnd);
    } else {
      document.addEventListener('touchmove', this.onDragMove, { passive: false });
      document.addEventListener('touchend', this.onDragEnd);
    }

    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Drag to send: Maneja el movimiento del círculo S/
   */
  onDragMove = (event: MouseEvent | TouchEvent): void => {
    if (!this.isDragging) return;

    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const newPosition = clientX - this.dragStartX;

    // Limitar el movimiento entre 0 y DRAG_MAX_DISTANCE (puede llegar hasta el chanchito)
    this.dragPosition = Math.max(0, Math.min(newPosition, this.DRAG_MAX_DISTANCE));

    // Prevenir scroll en touch
    if (event instanceof TouchEvent) {
      event.preventDefault();
    }
  };

  /**
   * Drag to send: Finaliza el arrastre y abre el modal si se alcanzó el threshold
   */
  onDragEnd = (): void => {
    if (!this.isDragging) return;

    // Remover listeners
    document.removeEventListener('mousemove', this.onDragMove);
    document.removeEventListener('mouseup', this.onDragEnd);
    document.removeEventListener('touchmove', this.onDragMove);
    document.removeEventListener('touchend', this.onDragEnd);

    // Si se alcanzó el threshold, abrir modal de transferencia
    if (this.dragPosition >= this.DRAG_THRESHOLD) {
      this.abrirTransferencia();
    }

    // Reset
    this.isDragging = false;
    this.dragPosition = 0;
  };

  /**
   * Obtiene el estilo dinámico para el círculo de ahorro durante el drag
   */
  getDragStyle(): any {
    return {
      left: `${this.dragPosition}px`,
      transform: this.isDragging ? 'translateY(-50%) scale(1.05)' : 'translateY(-50%)',
      transition: this.isDragging ? 'none' : 'left 0.3s ease-out, transform 0.2s ease-out'
    };
  }

  /**
   * Obtiene la opacidad del chanchito según la posición del drag
   * La opacidad aumenta progresivamente desde 0.3 hasta 1.0 a medida que se arrastra
   */
  getChanchitoOpacity(): number {
    if (!this.isDragging) return 0.3;
    // Calcular opacidad basada en la distancia máxima, no en el threshold
    const progress = Math.min(this.dragPosition / this.DRAG_MAX_DISTANCE, 1);
    return 0.3 + progress * 0.7;
  }

  /**
   * Abre el modal de transferencia a chanchito
   */
  abrirTransferencia(): void {
    if (!this.resumen || this.getSaldoFinal() <= 0) {
      return;
    }
    this.showTransferenciaModal = true;
  }

  /**
   * Cierra el modal de transferencia
   */
  cerrarTransferenciaModal(): void {
    this.showTransferenciaModal = false;
  }

  /**
   * Maneja la confirmación de transferencia desde el modal
   */
  onTransferenciaConfirmada(transferencia: TransferenciaAhorro): void {
    // Recargar datos para reflejar la transferencia
    this.cargarDatosMes(this.mesActual);
    this.showTransferenciaModal = false;
  }

  /**
   * Obtiene el saldo disponible para transferir (saldo final del mes)
   */
  getSaldoDisponible(): number {
    return this.getSaldoFinal();
  }

  /**
   * Calcula el monto disponible restante de una categoría de gasto
   */
  getDisponible(detalle: DetalleConsumo): number {
    if (!detalle || !detalle.topeMensual) return 0;
    return Math.max(0, detalle.topeMensual - detalle.total);
  }

  /**
   * Obtiene el porcentaje usado de una categoría
   */
  getPorcentajeUsado(detalle: DetalleConsumo): number {
    if (!detalle || !detalle.topeMensual) return 0;
    return Math.round((detalle.total / detalle.topeMensual) * 100);
  }

  /**
   * Obtiene la clase CSS para el monto disponible según el porcentaje usado
   */
  getDisponibleClass(detalle: DetalleConsumo): string {
    const porcentaje = this.getPorcentajeUsado(detalle);
    if (porcentaje >= 100) return 'disponible-danger';
    if (porcentaje >= 90) return 'disponible-warning';
    return 'disponible-success';
  }

  /**
   * Obtiene la clase CSS para el porcentaje usado en meses pasados
   */
  getPorcentajeClass(detalle: DetalleConsumo): string {
    const porcentaje = this.getPorcentajeUsado(detalle);
    if (porcentaje >= 100) return 'porcentaje-danger';
    if (porcentaje >= 90) return 'porcentaje-warning';
    return 'porcentaje-success';
  }

  /**
   * Alterna el estado de expansión de una subsección de gastos
   */
  toggleSubseccion(key: string): void {
    if (this.subseccionesExpandidas.has(key)) {
      this.subseccionesExpandidas.delete(key);
    } else {
      this.subseccionesExpandidas.add(key);
    }
  }

  /**
   * Verifica si una subsección está expandida
   */
  isSubseccionExpandida(key: string): boolean {
    return this.subseccionesExpandidas.has(key);
  }

  /**
   * Formatea una fecha para mostrar en la lista de operaciones
   */
  formatFecha(fecha: Date): string {
    const date = new Date(fecha);
    const dia = date.getDate();
    const mes = date.toLocaleDateString('es-ES', { month: 'short' });
    return `${dia} ${mes}`;
  }

  /**
   * Calcula el porcentaje de carga financiera sobre el ingreso neto mensual configurado
   */
  getPorcentajeCargaFinanciera(): number {
    if (!this.resumen || !this.configuracion) return 0;
    const cargaTotal = Math.abs(this.resumen.cargaFinanciera);
    const ingresoNeto = this.configuracion.ingresoNetoMensual;
    return (cargaTotal / ingresoNeto) * 100;
  }

  /**
   * Obtiene el ancho del slider de carga financiera (limitado al 100%)
   */
  getCargaFinancieraWidth(): number {
    return Math.min(this.getPorcentajeCargaFinanciera(), 100);
  }

  /**
   * Obtiene la clase CSS para la barra de carga financiera según el porcentaje
   * Verde: <20%, Ámbar: 20-30%, Rojo: ≥30%
   */
  getCargaFinancieraClass(): string {
    const porcentaje = this.getPorcentajeCargaFinanciera();
    if (porcentaje >= 30) return 'danger';
    if (porcentaje >= 20) return 'warning';
    return 'success';
  }
}
