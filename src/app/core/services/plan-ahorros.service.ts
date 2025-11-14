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
  MovimientoCaja,
  TipoGastoDetalle,
  SubcategoriaGastoDetalle
} from '../models/plan-ahorros.interface';
import {
  RecategorizacionRequest,
  RecategorizacionResponse,
  OperacionVinculable
} from '../models/recategorizacion.interface';
import { OperacionFinanciera } from '../models/operacion-financiera.interface';
import { ConfiguracionPlan } from '../models/configuracion-plan.interface';
import { ChanchitoAhorro, TransferenciaAhorro } from '../models/chanchito-ahorro.interface';
import { OperacionRecurrente } from '../models/operacion-recurrente.interface';
import { Chanchito } from '../models/chanchito.interface';

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

    // Filtro por tipoProducto (TC/TD)
    if (filtros.tipoProducto) {
      resultado = resultado.filter(op => op.tipoProducto === filtros.tipoProducto);
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
        estado:'pagado',
        vinculadaARecurrente: true 
      }),
      gastosMes: this.sumarOperaciones(mes, { 
        categoria: 'gastos',
        tipoProducto:'TD',
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
    // Agregar timestamp para evitar caché del navegador
    const timestamp = new Date().getTime();
    
    // TODO: Reemplazar con URL real de API
    return this.http.get<ChanchitoAhorro[]>(`${this.DATA_PATH}/chanchitos-ahorro.json?t=${timestamp}`)
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
   * Obtiene datos de múltiples meses con validación de consistencia
   * Requirement 35, 39: Navegación y validación multi-mes
   */
  getDatosMultiMes(): Observable<DatosMultiMes> {
    const meses = this.MESES_DISPONIBLES;
    
    // Cargar datos de todos los meses
    const requests = meses.map(mes => this.getDatosMesCompleto(mes));
    
    return forkJoin(requests).pipe(
      map(datosMeses => {
        // Validar consistencia de saldos entre meses
        const validacion = this.validarConsistenciaSaldos(datosMeses);
        
        return {
          meses: datosMeses,
          mesActual: 'Noviembre 2024',
          validacionSaldos: validacion
        };
      })
    );
  }

  /**
   * Obtiene datos completos de un mes incluyendo saldo final calculado
   * Requirement 35: Datos completos del mes
   */
  private getDatosMesCompleto(mes: string): Observable<DatosSaldoMes> {
    return forkJoin({
      operaciones: this.getOperacionesMes(mes),
      chanchitos: this.getChanchitosAhorro(),
      config: this.getConfiguracion(),
      atrasadas: this.getOperacionesAtrasadas(mes)
    }).pipe(
      map(({ operaciones, chanchitos, config, atrasadas }) => {
        // Calcular saldos
        const saldoChanchitos = chanchitos.reduce((sum, ch) => sum + ch.montoActual, 0);
        
        // Obtener saldo inicial del mes
        const saldoInicial = this.obtenerSaldoInicialMes(mes);
        
        // Calcular saldo final del mes
        const saldoFinal = this.calcularSaldoFinalMes(operaciones, saldoInicial);
        
        // Calcular ahorro en chanchitos del mes (mock por ahora)
        const ahorroChanchitosDelMes = 0;
        
        return {
          mes,
          saldoInicial,
          saldoFinal,
          saldoChanchitos,
          ahorroChanchitosDelMes,
          metaAhorro: config.metaAhorro,
          operaciones: operaciones.map(op => op.id),
          operacionesAtrasadas: {
            pagosFinancieros: atrasadas.pagosFinancieros.map(op => op.id),
            operacionesRecurrentes: atrasadas.operacionesRecurrentes.map(op => op.id)
          }
        };
      })
    );
  }

  /**
   * Obtiene el saldo inicial de un mes
   * En una implementación real, esto vendría de la API
   * Requirement 35: Saldo inicial por mes
   * 
   * IMPORTANTE: Los saldos de cuentas bancarias nunca pueden ser negativos.
   * El saldo inicial de cada mes es el saldo final del mes anterior.
   * 
   * NARRATIVA DE AHORRO (Meta: S/ 800/mes):
   * - Agosto: Buen mes, ahorra S/ 900 (supera meta) ✅
   * - Septiembre: Mes difícil, solo ahorra S/ 300 (no llega) ❌
   * - Octubre: Se recupera, ahorra S/ 650 (cerca pero no llega) ⚠️
   * - Noviembre: Excelente mes, ahorra S/ 1,000 (supera meta) ✅
   */
  private obtenerSaldoInicialMes(mes: string): number {
    // Saldos iniciales por mes (cada mes comienza con el saldo final del mes anterior)
    // Los saldos siempre son >= 0 (no pueden ser negativos en cuentas reales)
    // 
    // IMPORTANTE: Estos valores deben ser consistentes con los saldos finales calculados
    // Saldo Inicial del Mes N = Saldo Final del Mes N-1
    // 
    // Fórmula: Saldo Final = Saldo Inicial + Ingresos + Op. Recurrentes + Gastos + Mov. Caja + Carga Financiera
    // (Los valores negativos ya vienen con signo negativo)
    // 
    // Narrativa de ahorro incremental realista (Meta: S/ 800/mes):
    // Agosto: 4000 -> 4057 (ahorro: 57) - 7% de meta - Primer mes, muchos gastos
    // Septiembre: 4057 -> 4357 (ahorro: 300) - 37% de meta - Mejorando control de gastos
    // Octubre: 4357 -> 4907 (ahorro: 550) - 69% de meta - Buen progreso, casi llega
    // Noviembre: 4907 -> 5757 (ahorro: 850) - 106% de meta - ¡Superó la meta!
    const saldosIniciales: { [key: string]: number } = {
      'Agosto 2024': 4000,      // Saldo inicial del primer mes (base)
      'Septiembre 2024': 4057,  // Saldo final de Agosto (4000 + 57)
      'Octubre 2024': 4357,     // Saldo final de Septiembre (4057 + 300)
      'Noviembre 2024': 4907    // Saldo final de Octubre (4357 + 550)
    };
    
    return saldosIniciales[mes] || 4000;
  }

  /**
   * Calcula el saldo final de un mes basado en operaciones
   * Requirement 31: Cálculo de saldo final
   * 
   * IMPORTANTE: Para el PoC, usamos saldos finales predefinidos que reflejan
   * una narrativa realista de ahorro con altibajos.
   * En producción, esto se calcularía basándose en las operaciones reales.
   */
  private calcularSaldoFinalMes(operaciones: OperacionFinanciera[], saldoInicial: number): number {
    // Calcular saldo final basándose en operaciones reales
    const operacionesValidas = operaciones.filter(op => {
      if (op.vinculadaARecurrente) return false;
      if (op.estado && op.estado === 'pendiente') return false;
      return true;
    });
    
    const totalOperaciones = operacionesValidas.reduce((sum, op) => sum + op.monto, 0);
    const saldoCalculado = saldoInicial + totalOperaciones;
    
    return Math.max(0, saldoCalculado);
  }

  /**
   * Valida la consistencia de saldos entre meses consecutivos
   * Requirement 39: Validación de consistencia
   */
  private validarConsistenciaSaldos(datosMeses: DatosSaldoMes[]): { valido: boolean; errores: string[] } {
    const errores: string[] = [];
    
    // Validar que saldo inicial de mes N = saldo final de mes N-1
    for (let i = 1; i < datosMeses.length; i++) {
      const mesAnterior = datosMeses[i - 1];
      const mesActual = datosMeses[i];
      
      const diferencia = Math.abs(mesActual.saldoInicial - mesAnterior.saldoFinal);
      
      // Permitir una diferencia mínima por redondeo (0.01)
      if (diferencia > 0.01) {
        errores.push(
          `Inconsistencia detectada: El saldo inicial de ${mesActual.mes} (S/ ${mesActual.saldoInicial.toFixed(2)}) ` +
          `no coincide con el saldo final de ${mesAnterior.mes} (S/ ${mesAnterior.saldoFinal.toFixed(2)}). ` +
          `Diferencia: S/ ${diferencia.toFixed(2)}`
        );
      }
    }
    
    return {
      valido: errores.length === 0,
      errores
    };
  }

  /**
   * Actualiza la configuración del plan (parcial)
   * Requirement 2, 3, 6, 7: Actualizar configuración
   */
  updateConfiguracion(config: Partial<ConfiguracionPlan>): Observable<void> {
    if (this.configuracionCache) {
      this.configuracionCache = { ...this.configuracionCache, ...config };
    }
    
    // TODO: Reemplazar con llamada real a API
    return of(void 0).pipe(delay(300));
  }

  /**
   * Obtiene operaciones recurrentes
   * Requirement 4: Gestión de operaciones recurrentes
   */
  getOperacionesRecurrentes(): Observable<OperacionRecurrente[]> {
    // TODO: Reemplazar con URL real de API
    return this.http.get<OperacionRecurrente[]>(`${this.DATA_PATH}/operaciones-recurrentes.json`)
      .pipe(
        catchError(() => {
          console.warn('Error cargando operaciones recurrentes, retornando array vacío');
          return of([]);
        })
      );
  }

  /**
   * Agrega una operación recurrente
   * Requirement 4: Agregar operación recurrente
   */
  addOperacionRecurrente(op: OperacionRecurrente): Observable<void> {
    // TODO: Reemplazar con llamada real a API
    return of(void 0).pipe(delay(300));
  }

  /**
   * Actualiza una operación recurrente
   * Requirement 4: Editar operación recurrente
   */
  updateOperacionRecurrente(id: string, op: Partial<OperacionRecurrente>): Observable<void> {
    // TODO: Reemplazar con llamada real a API
    return of(void 0).pipe(delay(300));
  }

  /**
   * Elimina una operación recurrente
   * Requirement 4: Eliminar operación recurrente
   */
  deleteOperacionRecurrente(id: string): Observable<void> {
    // TODO: Reemplazar con llamada real a API
    return of(void 0).pipe(delay(300));
  }

  /**
   * Obtiene chanchitos (alias para compatibilidad)
   * Requirement 5: Obtener lista de chanchitos
   */
  getChanchitos(): Observable<Chanchito[]> {
    return this.http.get<Chanchito[]>(`${this.DATA_PATH}/chanchitos.json`)
      .pipe(
        catchError(() => {
          console.warn('Error cargando chanchitos, retornando array vacío');
          return of([]);
        })
      );
  }

  /**
   * Establece un chanchito como principal
   * Requirement 5: Seleccionar chanchito principal
   */
  setChanchitoPrincipal(id: string): Observable<void> {
    // TODO: Reemplazar con llamada real a API
    return of(void 0).pipe(delay(300));
  }

  /**
   * Obtiene operaciones de gastos con filtro opcional
   * Requirement 8: Detalle de gastos
   */
  getOperacionesGastos(mes: string, filtro?: string): Observable<OperacionFinanciera[]> {
    const filtroOperacion: FiltroOperacion = {
      categoria: 'gastos',
      vinculadaARecurrente: false
    };

    if (filtro === 'hormiga') {
      filtroOperacion.condiciones = [{ campo: 'tipoGasto', operador: '=', valor: 'hormiga' }];
    } else if (filtro === 'medio') {
      filtroOperacion.condiciones = [{ campo: 'tipoGasto', operador: '=', valor: 'medio' }];
    } else if (filtro === 'excepcional') {
      filtroOperacion.condiciones = [{ campo: 'tipoGasto', operador: '=', valor: 'excepcional' }];
    }

    return this.getOperacionesPorFiltro(mes, filtroOperacion);
  }

  /**
   * Obtiene categorías de gastos agrupadas con totales
   * Requirement 8: Gráfico de categorías
   */
  getCategoriasGastos(mes: string): Observable<{ categoria: string, monto: number }[]> {
    return this.getOperacionesGastos(mes).pipe(
      map(operaciones => {
        const grupos = new Map<string, number>();
        
        operaciones.forEach(op => {
          const cat = op.subcategoria || 'otros';
          grupos.set(cat, (grupos.get(cat) || 0) + Math.abs(op.monto));
        });

        return Array.from(grupos.entries())
          .map(([categoria, monto]) => ({ categoria, monto }))
          .sort((a, b) => b.monto - a.monto);
      })
    );
  }

  /**
   * Requirement 1.1, 1.2, 1.3: Obtiene detalle de gastos por tipo
   */
  getDetalleGastosPorTipo(mes: string, tipo: string): Observable<TipoGastoDetalle> {
    const tipoGastoMap: { [key: string]: string } = {
      'automaticos': 'automatico',
      'hormigas': 'hormiga',
      'medios': 'medio',
      'excepcionales': 'excepcional'
    };

    const tipoFiltro = tipoGastoMap[tipo];
    
    const filtro: FiltroOperacion = {
      categoria: 'gastos',
      vinculadaARecurrente: false,
      condiciones: tipoFiltro ? [{ campo: 'tipoGasto', operador: '=', valor: tipoFiltro }] : []
    };

    return this.getOperacionesPorFiltro(mes, filtro).pipe(
      map(operaciones => {
        // Agrupar por subcategoría
        const grupos = new Map<string, { monto: number; operaciones: OperacionFinanciera[] }>();
        
        operaciones.forEach(op => {
          const subcat = op.subcategoria || 'otros';
          if (!grupos.has(subcat)) {
            grupos.set(subcat, { monto: 0, operaciones: [] });
          }
          const grupo = grupos.get(subcat)!;
          grupo.monto += Math.abs(op.monto);
          grupo.operaciones.push(op);
        });

        // Calcular total
        const totalMonto = Array.from(grupos.values()).reduce((sum, g) => sum + g.monto, 0);

        // Mapear iconos por subcategoría
        const iconosSubcategoria: { [key: string]: string } = {
          'transporte': 'directions_car',
          'delivery': 'delivery_dining',
          'restaurantes': 'restaurant',
          'supermercado': 'shopping_cart',
          'entretenimiento': 'movie',
          'salud': 'local_hospital',
          'educacion': 'school',
          'compras': 'shopping_bag',
          'servicios': 'build',
          'otros': 'more_horiz'
        };

        // Convertir a array de subcategorías
        const subcategorias: SubcategoriaGastoDetalle[] = Array.from(grupos.entries())
          .map(([nombre, data]) => ({
            nombre: this.capitalizarTexto(nombre),
            monto: data.monto,
            porcentaje: totalMonto > 0 ? (data.monto / totalMonto) * 100 : 0,
            color: this.getColorSubcategoria(nombre),
            icono: iconosSubcategoria[nombre.toLowerCase()] || 'category',
            operaciones: data.operaciones
          }))
          .sort((a, b) => b.monto - a.monto);

        const titulosMap: { [key: string]: string } = {
          'automaticos': 'Cobros Automáticos',
          'hormigas': 'Gastos Hormiga',
          'medios': 'Gastos Medios',
          'excepcionales': 'Gastos Excepcionales'
        };

        return {
          tipo: tipo as any,
          titulo: titulosMap[tipo] || tipo,
          totalMonto,
          totalPorcentaje: 100,
          subcategorias
        };
      })
    );
  }

  /**
   * Requirement 2.1, 2.2, 2.3: Obtiene operaciones de una subcategoría específica
   */
  getOperacionesPorSubcategoria(mes: string, tipo: string, subcategoria: string): Observable<OperacionFinanciera[]> {
    const tipoGastoMap: { [key: string]: string } = {
      'automaticos': 'automatico',
      'hormigas': 'hormiga',
      'medios': 'medio',
      'excepcionales': 'excepcional'
    };

    const tipoFiltro = tipoGastoMap[tipo];
    
    const filtro: FiltroOperacion = {
      categoria: 'gastos',
      vinculadaARecurrente: false,
      condiciones: tipoFiltro ? [{ campo: 'tipoGasto', operador: '=', valor: tipoFiltro }] : []
    };

    return this.getOperacionesPorFiltro(mes, filtro).pipe(
      map(operaciones => {
        // Filtrar por subcategoría
        const subcatLower = subcategoria.toLowerCase();
        const filtradas = operaciones.filter(op => 
          (op.subcategoria || 'otros').toLowerCase() === subcatLower
        );
        
        // Ordenar por fecha descendente
        return filtradas.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
      })
    );
  }

  /**
   * Requirement 3.1, 3.2, 3.4: Obtiene movimientos de caja por tipo
   */
  getMovimientosCajaPorTipo(mes: string, tipoMovimiento: string): Observable<MovimientoCaja[]> {
    // Filtrar solo por categoría movimiento_caja
    const filtro: FiltroOperacion = {
      categoria: 'movimiento_caja'
    };

    return this.getOperacionesPorFiltro(mes, filtro).pipe(
      map(operaciones => {
        // Mapear tipos de movimiento
        const tipoMap: { [key: string]: string } = {
          'transferencias': 'transferencia',
          'retiros': 'retiro',
          'depositos': 'deposito',
          'otros': 'otros'
        };

        const tipoFiltro = tipoMap[tipoMovimiento];

        // Filtrar por tipo de movimiento si se especifica un tipo
        let filtradas = operaciones;
        if (tipoFiltro) {
          filtradas = operaciones.filter(op => op.tipoMovimiento === tipoFiltro);
        }

        // Convertir a MovimientoCaja
        return filtradas.map(op => ({
          id: op.id,
          descripcion: op.operacion,
          monto: op.monto,
          fecha: op.fecha,
          subcategoria: tipoMovimiento as any
        }));
      })
    );
  }

  /**
   * Requirement 5.1, 5.2: Obtiene operaciones recurrentes vinculables
   */
  getOperacionesRecurrentesVinculables(): Observable<OperacionVinculable[]> {
    return this.getOperacionesRecurrentes().pipe(
      map(operaciones => 
        operaciones.map(op => ({
          id: op.id,
          nombre: op.nombre,
          descripcion: op.categoria || op.nombre,
          monto: op.monto,
          tipo: 'operacion_recurrente' as const,
          icono: 'repeat'
        }))
      )
    );
  }

  /**
   * Requirement 5.1, 5.2: Obtiene pagos financieros vinculables
   */
  getPagosFinancierosVinculables(): Observable<OperacionVinculable[]> {
    return this.getConfiguracion().pipe(
      map(config => {
        // TODO: Obtener pagos financieros de la configuración o de un endpoint
        // Por ahora retornamos un array vacío
        const pagosFinancieros: OperacionVinculable[] = [
          {
            id: 'pf-1',
            nombre: 'Tarjeta de Crédito',
            descripcion: 'Pago de tarjeta de crédito',
            tipo: 'pago_financiero',
            icono: 'credit_card'
          },
          {
            id: 'pf-2',
            nombre: 'Préstamo Personal',
            descripcion: 'Cuota de préstamo personal',
            tipo: 'pago_financiero',
            icono: 'account_balance'
          }
        ];
        return pagosFinancieros;
      })
    );
  }

  /**
   * Requirement 6.4: Recategoriza un movimiento de caja
   */
  recategorizarMovimiento(request: RecategorizacionRequest): Observable<RecategorizacionResponse> {
    return this.getOperacionesMes(request.mes).pipe(
      map(operaciones => {
        const operacion = operaciones.find(op => op.id === request.operacionId);
        
        if (!operacion) {
          return {
            success: false,
            message: 'Operación no encontrada'
          };
        }

        // Actualizar la operación según la nueva categoría
        switch (request.nuevaCategoria) {
          case 'ingresos':
            operacion.categoria = 'ingresos';
            operacion.categoriaUsuario = 'ingreso';
            operacion.vinculadaARecurrente = false;
            break;
          
          case 'operaciones_recurrentes':
            operacion.categoria = 'gastos'; // Mantener como gastos pero marcar como vinculada
            operacion.categoriaUsuario = 'operacion_recurrente';
            operacion.vinculadaARecurrente = !!request.operacionVinculadaId;
            // Nota: recurrenteId no existe en la interface, se maneja con vinculadaARecurrente
            break;
          
          case 'pagos_financieros':
            operacion.categoria = 'pago_financiero';
            operacion.categoriaUsuario = 'no_aplica';
            operacion.vinculadaARecurrente = !!request.operacionVinculadaId;
            // Nota: recurrenteId no existe en la interface, se maneja con vinculadaARecurrente
            break;
        }

        // Actualizar caché
        this.operacionesCache.set(request.mes, operaciones);

        return {
          success: true,
          message: 'Movimiento recategorizado exitosamente',
          operacionActualizada: {
            id: operacion.id,
            categoria: operacion.categoria,
            categoriaUsuario: operacion.categoriaUsuario || '',
            vinculadaARecurrente: operacion.vinculadaARecurrente || false
          }
        };
      }),
      delay(300) // Simular latencia de API
    );
  }

  /**
   * Capitaliza la primera letra de un texto
   */
  private capitalizarTexto(texto: string): string {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  /**
   * Obtiene un color para una subcategoría
   */
  private getColorSubcategoria(subcategoria: string): string {
    const colores: { [key: string]: string } = {
      'transporte': '#FF6B6B',
      'delivery': '#4ECDC4',
      'restaurantes': '#FFE66D',
      'supermercado': '#95E1D3',
      'entretenimiento': '#C7CEEA',
      'salud': '#FF6B9D',
      'educacion': '#A8E6CF',
      'compras': '#FFD3B6',
      'servicios': '#FFAAA5',
      'otros': '#B4B4B4'
    };
    return colores[subcategoria.toLowerCase()] || '#B4B4B4';
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
