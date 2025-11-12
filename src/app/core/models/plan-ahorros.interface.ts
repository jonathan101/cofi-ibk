export interface PlanAhorros {
  id: string;
  saldoInicial: number;
  saldoActual: number; // Calculado: saldoInicial + ingresos + operacionesRegulares + gastos + movimientosCaja + cargaFinanciera
  ingresoNeto: number;
  metaAhorro: number;
  metaPorcentaje: number;
  distribucionGastos: GastoDistribucion[];
  fechaCreacion: Date;
  activo: boolean;
}

export interface GastoDistribucion {
  categoria: string;
  porcentaje: number;
  monto: number; // Suma de operaciones de la categoría
  color: string;
  colapsado: boolean; // Estado de colapso de la sección
}

export interface ResumenFinanciero {
  saldoInicial: number;
  ingresos: number; // Suma de operaciones de Ingresos (positivo)
  operacionesRegulares: number; // Suma de operaciones Regulares (positivo/negativo)
  gastosMes: number; // Suma de operaciones de Gastos (negativo)
  movimientosCaja: number; // Suma de operaciones de Movimientos de Caja (positivo/negativo)
  cargaFinanciera: number; // Suma de operaciones de Carga Financiera con estado "Pagado" (negativo)
  porPagar: number; // Suma de operaciones de Carga Financiera y Operaciones Regulares con estado "Pendiente"
  saldoActual: number; // Calculado
}

export interface ResumenGastosPorTipo {
  cobrosAutomaticos: DetalleConsumo;
  gastosHormiga: DetalleConsumo;
  gastosMedios: DetalleConsumo;
  gastosExcepcionales: DetalleConsumo;
  cargaFinanciera: DetalleConsumo; // También tiene pill de alerta
}

export interface DetalleConsumo {
  consumoDebito: number; // Suma de operaciones con tipoProducto='TD' - Se muestra como TEXTO NORMAL
  consumoTC: number; // Suma de operaciones con tipoProducto='TC' - Se muestra como TEXTO NORMAL
  total: number; // consumoDebito + consumoTC - SOLO ESTE VALOR LLEVA PILL DE COLOR
  topeMensual: number; // Tope configurado para este tipo (null si no tiene tope)
  porcentajeUsado: number; // (total / topeMensual) * 100
  estadoAlerta: 'normal' | 'warning' | 'danger'; // normal: <90%, warning: 90-100%, danger: >100%
}

export interface ProductoBancario {
  id: string;
  nombre: string;
  tipo: 'cuenta' | 'tarjeta' | 'prestamo';
  saldoDisponible?: number;
  lineaDisponible?: number;
  iconName: string;
}

export interface MovimientoSinCategorizar {
  id: string;
  descripcion: string;
  monto: number;
  fecha: Date;
  tipo: 'ingreso' | 'egreso';
  categoriaActual?: string;
}

export interface MovimientoCaja {
  id: string;
  descripcion: string;
  monto: number;
  fecha: Date;
  subcategoria: 'transferencias' | 'retiros' | 'depositos' | 'otros';
}

export interface DetalleGastoCategoria {
  categoria: string;
  subcategorias: SubcategoriaGasto[];
  comentarioIA: string;
  totalMonto: number;
  totalPorcentaje: number;
}

export interface SubcategoriaGasto {
  nombre: string; // Viajes, Transporte, Delivery, etc.
  monto: number;
  porcentaje: number;
  color: string;
}

export interface PasoFlujo {
  id: string;
  pregunta: string;
  tipoRespuesta: 'texto-libre' | 'opciones';
  opciones?: OpcionRespuesta[];
  validacion?: string;
  campoDestino: string;
  siguientePaso: string | 'fin';
  respuestaAPI?: string; // Respuesta procesada por el API
  avanzarSiguientePaso: boolean; // Si el API determina que se puede avanzar
}

export interface OpcionRespuesta {
  texto: string;
  valor: string;
}

export interface ContextoFlujoPlan {
  ingresoNetoMensual?: number;
  fuenteIngreso?: string;
  contribuyeAFP?: string;
  metaAhorroPorcentaje?: number;
  metaAhorroMonto?: number;
  gastosDisponibles?: number;
  confirmacion?: string;
}

export interface DatosCliente {
  nombre: string;
  correo: string;
}

export interface DatosSaldoMes {
  mes: string; // Ej: "Agosto 2024"
  saldoInicial: number; // Suma de cuentas en soles (excluye chanchitos)
  saldoFinal: number; // Calculado con operaciones
  saldoChanchitos: number; // Suma de todos los chanchitos
  ahorroChanchitosDelMes: number; // Cuánto se ahorró en chanchitos este mes
  metaAhorro: number;
  operaciones: string[]; // IDs de operaciones
  operacionesAtrasadas?: {
    pagosFinancieros: string[]; // Solo IDs
    operacionesRecurrentes: string[]; // Solo IDs
  };
}

export interface DatosMultiMes {
  meses: DatosSaldoMes[]; // Agosto, Septiembre, Octubre, Noviembre
  mesActual: string; // "Noviembre 2024"
  validacionSaldos: {
    valido: boolean;
    errores: string[]; // Ej: "Saldo inicial Sept no coincide con saldo final Agosto"
  };
}

export type FiltroGastos = 'todos' | 'gastos-hormiga' | 'gastos-medios' | 'gastos-excepcionales';

export interface FiltroOperacion {
  categoria?: string | string[];           // Ej: 'ingresos' o ['ingresos', 'gastos']
  categoriaUsuario?: string | string[] | null; // null para "sin categoría usuario"
  estado?: 'pagado' | 'pendiente' | 'todos';
  tipo?: 'ingreso' | 'egreso' | 'todos';
  fechaDesde?: Date;
  fechaHasta?: Date;
  montoMin?: number;
  montoMax?: number;
  descripcionContiene?: string;
  vinculadaARecurrente?: boolean;         // true/false para filtrar vinculadas
  condiciones?: CondicionCustom[];        // Para condiciones personalizadas
}

export interface CondicionCustom {
  campo: string;                          // Nombre del campo a evaluar
  operador: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'in' | 'not_in';
  valor: any;
}
