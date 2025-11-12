import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';
import {
  PlanAhorros,
  ResumenFinanciero,
  FiltroOperacion,
  CondicionCustom,
  DatosSaldoMes,
  DatosMultiMes,
  DetalleGastoCategoria,
  SubcategoriaGasto,
  FiltroGastos,
  MovimientoSinCategorizar,
  MovimientoCaja
} from '../models/plan-ahorros.interface';
import { OperacionFinanciera } from '../models/operacion-financiera.interface';
import { ConfiguracionPlan } from '../models/configuracion-plan.interface';
import { ChanchitoAhorro, TransferenciaAhorro } from '../models/chanchito-ahorro.interface';
import { OperacionRecurrenteProgramada } from '../models/operacion-recurrente.interface';

/**
 * Servicio para gestionar el plan de ahorros con sistema de filtros flexible
 * Implementa fallback automático a datos mock JSON
 * 
 * Requirements: 14, 31, 32, 34, 35, 36, 38, 40, 41, 44
 */
@Injectable({
  providedIn: 'root'
})
export class PlanAhorrosService {
  private readonly DATA_PATH = '/assets/data/DataEstatica';
  private readonly MESES_DISPONIBLES = ['Agosto 2024', 'Septiembre 2024', 'Octubre 2024', 'Noviembre 2024'];
  
  // Cache temporal para operaciones y configuración
  private operacionesCache: Map<string, OperacionFinanciera[]> = new Map();
  private configuracionCache: ConfiguracionPlan | null = null;
  private chanchitosCache: ChanchitoAhorro[] | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la configuración del plan
   * Requirement 14: Fallback a datos mock
   */
  getConfiguracion(): Observable<ConfiguracionPlan> {
    if (this.configuracionCache) {
      return of(this.configuracionCache);
    }

    // TODO: Reemplazar con URL real de API cuando esté disponible
    return this.http.get<ConfiguracionPlan>(`${this.DATA_PATH}/configuracion-plan.json`)
      .pipe(
        map(config => {
          // Convertir fechas de string a Date
          config.fechaVigencia = new Date(config.fechaVigencia);
          this.configuracionCache = config;
          return config;
        }),
        catchError(() => {
          console.warn('Error cargando configuración, usando valores por defecto');
          return of(this.getConfiguracionPorDefecto());
        })
      );
  }

  /**
   * Actualiza la configuración del plan
   */
  actualizarConfiguracion(config: ConfiguracionPlan): Observable<void> {
    this.configuracionCache = config;
    
    // TODO: Reemplazar con llamada real a API
    return of(void 0).pipe(delay(300));
  }

  /**
   * Obtiene todas las operaciones de un mes específico
   * Requirement 35: Navegación entre meses
   */
  private getOperacionesMes(mes: string): Observable<OperacionFinanciera[]> {
    const cacheKey = mes;
    if (this.operacionesCache.has(cacheKey)) {
      return of(this.operacionesCache.get(cacheKey)!);
    }

    const mesSlug = this.getMesSlug(mes);
    
    // TODO: Reemplazar con URL real de API
    return this.http.get<OperacionFinanciera[]>(`${this.DATA_PATH}/operaciones/${mesSlug}.json`)
      .pipe(
        map(operaciones => {
          // Convertir fechas de string a Date
          const ops = operaciones.map(op => ({
            ...op,
            fecha: new Date(op.fecha),
            fechaPagoMaxima: op.fechaPagoMaxima ? new Date(op.fechaPagoMaxima) : undefined
          }));
          this.operacionesCache.set(cacheKey, ops);
          return ops;
        }),
        catchError(() => {
          console.warn(`Error cargando operaciones de ${mes}, retornando array vacío`);
          return of([]);
        })
      );
  }

  /**
   * Suma operaciones aplicando filtros flexibles tipo query builder
   * Requirement 34: Sistema de filtros flexible
   */
  sumarOperaciones(mes: string, filtros: FiltroOperacion): Observable<number> {
    return this.getOperacionesMes(mes).pipe(
      map(operaciones => {
        let operacionesFiltradas = this.aplicarFiltros(operaciones, filtros);
        
        // Sumar montos
        return operacionesFiltradas.reduce((sum, op) => sum + op.monto, 0);
      })
    );
  }

  /**
   * Obtiene operaciones aplicando filtros
   */
  getOperacionesPorFiltro(mes: string, filtros: FiltroOperacion): Observable<OperacionFinanciera[]> {
    return this.getOperacionesMes(mes).pipe(
      map(operaciones => this.aplicarFiltros(operaciones, filtros))
    );
  }

  /**
   * Aplica filtros a un array de operaciones
   * Requirement 34: Query builder con múltiples criterios
   */
  private aplicarFiltros(operaciones: OperacionFinanciera[], filtros: FiltroOperacion): OperacionFinanciera[] {
    let resultado = [...operaciones];

    // Filtro por categoría
    if (filtros.categoria !== undefined) {
      if (Array.isArray(filtros.categoria)) {
        resultado = resultado.filter(op => filtros.categoria!.includes(op.categoria));
      } else {
        resultado = resultado.filter(op => op.categoria === filtros.categoria);
      }
    }

    // Filtro por categoriaUsuario (con soporte para null)
    if (filtros.categoriaUsuario !== undefined) {
      if (filtros.categoriaUsuario === null) {
        resultado = resultado.filter(op => !op.categoriaUsuario || op.categoriaUsuario === 'no_aplica');
      } else if (Array.isArray(filtros.categoriaUsuario)) {
        resultado = resultado.filter(op => 
          op.categoriaUsuario && filtros.categoriaUsuario!.includes(op.categoriaUsuario)
        );
      } else {
        resultado = resultado.filter(op => op.categoriaUsuario === filtros.categoriaUsuario);
      }
    }

    // Filtro por estado
    if (filtros.estado && filtros.estado !== 'todos') {
      resultado = resultado.filter(op => op.estado === filtros.estado);
    }

    // Filtro por tipo (ingreso/egreso)
    if (filtros.tipo && filtros.tipo !== 'todos') {
      if (filtros.tipo === 'ingreso') {
        resultado = resultado.filter(op => op.monto > 0);
      } else if (filtros.tipo === 'egreso') {
        resultado = resultado.filter(op => op.monto < 0);
      }
    }

    // Filtro por rango de fechas
    if (filtros.fechaDesde) {
      resultado = resultado.filter(op => new Date(op.fecha) >= filtros.fechaDesde!);
    }
    if (filtros.fechaHasta) {
      resultado = resultado.filter(op => new Date(op.fecha) <= filtros.fechaHasta!);
    }

    // Filtro por rango de montos
    if (filtros.montoMin !== undefined) {
      resultado = resultado.filter(op => Math.abs(op.monto) >= filtros.montoMin!);
    }
    if (filtros.montoMax !== undefined) {
      resultado = resultado.filter(op => Math.abs(op.monto) <= filtros.montoMax!);
    }

    // Filtro por descripción
    if (filtros.descripcionContiene) {
      const busqueda = filtros.descripcionContiene.toLowerCase();
      resultado = resultado.filter(op => 
        op.operacion.toLowerCase().includes(busqueda)
      );
    }

    // Filtro por vinculadaARecurrente
    if (filtros.vinculadaARecurrente !== undefined) {
      resultado = resultado.filter(op => 
        (op.vinculadaARecurrente === true) === filtros.vinculadaARecurrente
      );
    }

    // Condiciones personalizadas
    if (filtros.condiciones && filtros.condiciones.length > 0) {
      resultado = resultado.filter(op => 
        this.evaluarCondiciones(op, filtros.condiciones!)
      );
    }

    return resultado;
  }

  /**
   * Evalúa condiciones personalizadas sobre una operación
   * Requirement 34: Soporte para operadores de comparación
   */
  private evaluarCondiciones(operacion: OperacionFinanciera, condiciones: CondicionCustom[]): boolean {
    return condiciones.every(condicion => {
      const valorCampo = (operacion as any)[condicion.campo];
      
      switch (condicion.operador) {
        case '=':
          return valorCampo === condicion.valor;
        case '!=':
          return valorCampo !== condicion.valor;
        case '>':
          return valorCampo > condicion.valor;
        case '<':
          return valorCampo < condicion.valor;
        case '>=':
          return valorCampo >= condicion.valor;
        case '<=':
          return valorCampo <= condicion.valor;
        case 'contains':
          return String(valorCampo).toLowerCase().includes(String(condicion.valor).toLowerCase());
        case 'in':
          return Array.isArray(condicion.valor) && condicion.valor.includes(valorCampo);
        case 'not_in':
          return Array.isArray(condicion.valor) && !condicion.valor.includes(valorCampo);
        default:
          return true;
      }
    });
  }

  /**
   * Calcula el saldo actual del mes
   * Requirement 31: Cálculo automático de saldo
   * Requirement 40: Excluye operaciones vinculadas a recurrentes
   */
  calcularSaldoActual(mes: string, saldoInicial: number): Observable<number> {
    return forkJoin({
      ingresos: this.sumarOperaciones(mes, { 
        categoria: 'ingresos',
        vinculadaARecurrente: false 
      }),
      operacionesReg: this.sumarOperaciones(mes, { 
        categoriaUsuario: 'operacion_recurrente',
        vinculadaARecurrente: false 
      }),
      gastos: this.sumarOperaciones(mes, { 
        categoria: 'gastos',
        vinculadaARecurrente: false 
      }),
      movCaja: this.sumarOperaciones(mes, { 
        categoria: 'movimiento_caja',
        categoriaUsuario: null,
        vinculadaARecurrente: false 
      }),
      cargaFin: this.sumarOperaciones(mes, { 
        categoria: 'pago_financiero',
        estado: 'pagado',
        vinculadaARecurrente: false 
      })
    }).pipe(
      map(({ ingresos, operacionesReg, gastos, movCaja, cargaFin }) => {
        return saldoInicial + ingresos + operacionesReg + gastos + movCaja + cargaFin;
      })
    );
  }

  /**
   * Calcula el total por pagar (incluye atrasadas)
   * Requirement 32: Cálculo de "Por Pagar"
   * Requirement 36: Incluye operaciones atrasadas
   */
  calcularPorPagar(mes: string): Observable<number> {
    return this.sumarOperaciones(mes, {
      categoria: ['pago_financiero', 'movimiento_caja'],
      categoriaUsuario: ['operacion_recurrente'],
      estado: 'pendiente',
      vinculadaARecurrente: false
    });
  }

  /**
   * Obtiene el resumen financiero completo del mes
   * Requirement 31, 32: Resumen con todos los cálculos
   */
  getResumenFinanciero(mes: string, saldoInicial: number): Observable<ResumenFinanciero> {
    return forkJoin({
      ingresos: this.sumarOperaciones(mes, { 
        categoria: 'ingresos',
        vinculadaARecurrente: false 
      }),
      operacionesRegulares: this.sumarOperaciones(mes, { 
        categoriaUsuario: 'operacion_recurrente',
        vinculadaARecurrente: false 
      }),
      gastosMes: this.sumarOperaciones(mes, { 
        categoria: 'gastos',
        vinculadaARecurrente: false 
      }),
      movimientosCaja: this.sumarOperaciones(mes, { 
        categoria: 'movimiento_caja',
        categoriaUsuario: null,
        vinculadaARecurrente: false 
      }),
      cargaFinanciera: this.sumarOperaciones(mes, { 
        categoria: 'pago_financiero',
        estado: 'pagado',
        vinculadaARecurrente: false 
      }),
      porPagar: this.calcularPorPagar(mes)
    }).pipe(
      map(({ ingresos, operacionesRegulares, gastosMes, movimientosCaja, cargaFinanciera, porPagar }) => {
        const saldoActual = saldoInicial + ingresos + operacionesRegulares + gastosMes + movimientosCaja + cargaFinanciera;
        
        return {
          saldoInicial,
          ingresos,
          operacionesRegulares,
          gastosMes,
          movimientosCaja,
          cargaFinanciera,
          porPagar,
          saldoActual
        };
      })
    );
  }

  /**
   * Clasifica el tipo de gasto según fórmula automática
   * Requirement 34: Clasificación con fórmula (20% y 50% ingreso diario)
   */
  clasificarTipoGasto(operacion: OperacionFinanciera, config: ConfiguracionPlan): 'hormiga' | 'medio' | 'excepcional' | null {
    // Solo aplica para gastos no automáticos
    if (operacion.categoria !== 'gastos' || operacion.tipoGasto === 'automatico') {
      return null;
    }
    
    const montoAbsoluto = Math.abs(operacion.monto);
    const ingresoNetoMensual = config.ingresoNetoMensual;
    const ingresoDiario = ingresoNetoMensual / 30;
    
    // Calcular topes con fórmula o usar manual
    let topeHormiga: number;
    let topeMedio: number;
    
    if (config.clasificacionGastos.topeHormiga.automatico) {
      // Fórmula: 20% del ingreso diario, redondeado a decena hacia abajo
      topeHormiga = Math.floor(ingresoDiario * 0.20 / 10) * 10;
    } else {
      topeHormiga = config.clasificacionGastos.topeHormiga.montoManual || 0;
    }
    
    if (config.clasificacionGastos.topeMedio.automatico) {
      // Fórmula: 50% del ingreso diario, redondeado a decena hacia abajo
      topeMedio = Math.floor(ingresoDiario * 0.50 / 10) * 10;
    } else {
      topeMedio = config.clasificacionGastos.topeMedio.montoManual || 0;
    }
    
    // Clasificar según rangos
    if (montoAbsoluto <= topeHormiga) {
      return 'hormiga';
    } else if (montoAbsoluto <= topeMedio) {
      return 'medio';
    } else {
      return 'excepcional';
    }
  }

  /**
   * Obtiene los datos de un mes específico
   * Requirement 35: Navegación entre meses
   */
  getDatosMes(mes: string): Observable<DatosSaldoMes> {
    return forkJoin({
      operaciones: this.getOperacionesMes(mes),
      chanchitos: this.getChanchitosAhorro(),
      config: this.getConfiguracion()
    }).pipe(
      map(({ operaciones, chanchitos, config }) => {
        // Calcular saldos
        const saldoChanchitos = chanchitos.reduce((sum, ch) => sum + ch.montoActual, 0);
        
        // TODO: Obtener saldo inicial real del mes
        const saldoInicial = 5000; // Mock
        
        return {
          mes,
          saldoInicial,
          saldoFinal: 0, // Se calcula después
          saldoChanchitos,
          ahorroChanchitosDelMes: 0, // Mock
          metaAhorro: config.metaAhorro,
          operaciones: operaciones.map(op => op.id),
          operacionesAtrasadas: {
            pagosFinancieros: [],
            operacionesRecurrentes: []
          }
        };
      })
    );
  }

  /**
   * Obtiene la lista de meses disponibles
   * Requirement 35: Navegación entre meses
   */
  getMesesDisponibles(): Observable<string[]> {
    return of(this.MESES_DISPONIBLES);
  }

  /**
   * Obtiene operaciones atrasadas del mes anterior
   * Requirement 36: Operaciones atrasadas
   */
  getOperacionesAtrasadas(mes: string): Observable<{
    pagosFinancieros: OperacionFinanciera[],
    operacionesRecurrentes: OperacionFinanciera[]
  }> {
    return this.getOperacionesMes(mes).pipe(
      map(operaciones => {
        const atrasadas = operaciones.filter(op => op.esAtrasada === true);
        
        return {
          pagosFinancieros: atrasadas.filter(op => op.categoria === 'pago_financiero'),
          operacionesRecurrentes: atrasadas.filter(op => op.categoriaUsuario === 'operacion_recurrente')
        };
      })
    );
  }

  /**
   * Vincula una operación con una operación recurrente programada
   * Requirement 38: Vincular operaciones
   */
  vincularOperacionConRecurrente(operacionId: string, recurrenteId: string, mes: string): Observable<void> {
    return this.getOperacionesMes(mes).pipe(
      map(operaciones => {
        const operacion = operaciones.find(op => op.id === operacionId);
        if (operacion) {
          operacion.vinculadaARecurrente = true;
          operacion.operacionRecurrenteId = recurrenteId;
          operacion.categoriaUsuario = 'operacion_recurrente';
          
          // Actualizar cache
          this.operacionesCache.set(mes, operaciones);
        }
        
        // TODO: Llamar a API real para persistir cambios
        return void 0;
      }),
      delay(300)
    );
  }

  /**
   * Obtiene los chanchitos de ahorro
   * Requirement 41, 44: Gestión de chanchitos
   */
  getChanchitosAhorro(): Observable<ChanchitoAhorro[]> {
    if (this.chanchitosCache) {
      return of(this.chanchitosCache);
    }

    // TODO: Reemplazar con URL real de API
    return this.http.get<ChanchitoAhorro[]>(`${this.DATA_PATH}/chanchitos-ahorro.json`)
      .pipe(
        map(chanchitos => {
          this.chanchitosCache = chanchitos;
          return chanchitos;
        }),
        catchError(() => {
          console.warn('Error cargando chanchitos, retornando array vacío');
          return of([]);
        })
      );
  }

  /**
   * Transfiere dinero a un chanchito de ahorro
   * Requirement 44: Transferencias internas sin crear operación visible
   */
  transferirAChanchito(transferencia: TransferenciaAhorro): Observable<void> {
    return this.getChanchitosAhorro().pipe(
      map(chanchitos => {
        const chanchito = chanchitos.find(ch => ch.id === transferencia.chanchitoId);
        if (chanchito) {
          chanchito.montoActual += transferencia.monto;
          
          // Actualizar cache
          this.chanchitosCache = chanchitos;
        }
        
        // TODO: Llamar a API real para persistir cambios
        // Nota: Esta es una operación temporal que se resetea al refrescar (PoC)
        return void 0;
      }),
      delay(300)
    );
  }

  /**
   * Refresca los datos del plan (pull-to-refresh)
   * Requirement 30: Pull-to-refresh
   */
  refreshPlanAhorros(): Observable<void> {
    // Limpiar caches
    this.operacionesCache.clear();
    this.configuracionCache = null;
    this.chanchitosCache = null;
    
    // TODO: Llamar a API real para obtener datos frescos
    return of(void 0).pipe(delay(1000));
  }

  /**
   * Obtiene detalle de gastos con filtro
   * Requirement 27: Detalle de gastos con filtros
   */
  getDetalleGastos(mes: string, filtro: FiltroGastos): Observable<DetalleGastoCategoria> {
    const filtroOperacion: FiltroOperacion = {
      categoria: 'gastos',
      vinculadaARecurrente: false
    };

    // Aplicar filtro específico
    if (filtro === 'gastos-hormiga') {
      filtroOperacion.condiciones = [{ campo: 'tipoGasto', operador: '=', valor: 'hormiga' }];
    } else if (filtro === 'gastos-medios') {
      filtroOperacion.condiciones = [{ campo: 'tipoGasto', operador: '=', valor: 'medio' }];
    } else if (filtro === 'gastos-excepcionales') {
      filtroOperacion.condiciones = [{ campo: 'tipoGasto', operador: '=', valor: 'excepcional' }];
    }

    return this.getOperacionesPorFiltro(mes, filtroOperacion).pipe(
      map(operaciones => {
        // Agrupar por subcategoría
        const subcategorias = this.agruparPorSubcategoria(operaciones);
        const totalMonto = operaciones.reduce((sum, op) => sum + Math.abs(op.monto), 0);

        return {
          categoria: filtro,
          subcategorias,
          comentarioIA: this.generarComentarioIA(filtro, operaciones),
          totalMonto,
          totalPorcentaje: 100
        };
      })
    );
  }

  /**
   * Agrupa operaciones por subcategoría para el gráfico
   */
  private agruparPorSubcategoria(operaciones: OperacionFinanciera[]): SubcategoriaGasto[] {
    const grupos = new Map<string, number>();
    const total = operaciones.reduce((sum, op) => sum + Math.abs(op.monto), 0);

    operaciones.forEach(op => {
      const sub = op.subcategoria || 'otros';
      grupos.set(sub, (grupos.get(sub) || 0) + Math.abs(op.monto));
    });

    const colores = ['#3B82F6', '#8B5CF6', '#EC4899', '#F97316', '#14B8A6', '#84CC16', '#EF4444', '#6366F1', '#F59E0B'];
    let colorIndex = 0;

    return Array.from(grupos.entries()).map(([nombre, monto]) => ({
      nombre: this.capitalizarSubcategoria(nombre),
      monto,
      porcentaje: (monto / total) * 100,
      color: colores[colorIndex++ % colores.length]
    })).sort((a, b) => b.monto - a.monto);
  }

  /**
   * Genera comentario IA mock para resumen de gastos
   */
  private generarComentarioIA(filtro: FiltroGastos, operaciones: OperacionFinanciera[]): string {
    const total = operaciones.reduce((sum, op) => sum + Math.abs(op.monto), 0);
    const cantidad = operaciones.length;

    if (filtro === 'gastos-hormiga') {
      return `Has realizado ${cantidad} gastos pequeños este mes por un total de S/ ${total.toFixed(2)}. Estos gastos hormiga pueden sumar más de lo que piensas.`;
    } else if (filtro === 'gastos-medios') {
      return `Tienes ${cantidad} gastos medios que suman S/ ${total.toFixed(2)}. Considera si algunos pueden reducirse o eliminarse.`;
    } else if (filtro === 'gastos-excepcionales') {
      return `Has tenido ${cantidad} gastos excepcionales por S/ ${total.toFixed(2)}. Estos gastos grandes impactan significativamente tu presupuesto.`;
    } else {
      return `Total de ${cantidad} gastos por S/ ${total.toFixed(2)} este mes.`;
    }
  }

  /**
   * Capitaliza el nombre de subcategoría
   */
  private capitalizarSubcategoria(sub: string): string {
    const nombres: { [key: string]: string } = {
      'transporte': 'Transporte',
      'delivery': 'Delivery',
      'restaurantes': 'Restaurantes',
      'supermercado': 'Supermercado',
      'entretenimiento': 'Entretenimiento',
      'salud': 'Salud',
      'educacion': 'Educación',
      'compras': 'Compras',
      'servicios': 'Servicios',
      'otros': 'Otros'
    };
    return nombres[sub] || sub;
  }

  /**
   * Convierte nombre de mes a slug para archivo
   */
  private getMesSlug(mes: string): string {
    const slugs: { [key: string]: string } = {
      'Agosto 2024': 'agosto-2024',
      'Septiembre 2024': 'septiembre-2024',
      'Octubre 2024': 'octubre-2024',
      'Noviembre 2024': 'noviembre-2024'
    };
    return slugs[mes] || 'agosto-2024';
  }

  /**
   * Retorna configuración por defecto
   */
  private getConfiguracionPorDefecto(): ConfiguracionPlan {
    return {
      ingresoNetoMensual: 4000,
      metaAhorro: 800,
      tiempoAlertaCompraAlta: 30,
      cuentasExcluidas: [],
      clasificacionGastos: {
        topeHormiga: {
          automatico: true,
          montoManual: undefined
        },
        topeMedio: {
          automatico: true,
          montoManual: undefined
        }
      },
      topesMensuales: {
        cobrosAutomaticos: { porcentaje: 10, montoFijo: undefined },
        gastosHormiga: { porcentaje: 10, montoFijo: undefined },
        gastosMedios: { porcentaje: 10, montoFijo: undefined },
        gastosExcepcionales: { porcentaje: 10, montoFijo: undefined },
        cargaFinanciera: { porcentaje: 30, montoFijo: undefined },
        movimientosCaja: { porcentaje: undefined, montoFijo: undefined },
        operacionesRecurrentes: { porcentaje: undefined, montoFijo: undefined }
      },
      fechaVigencia: new Date(),
      aplicaAMesesAnteriores: false
    };
  }
}
