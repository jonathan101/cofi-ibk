/**
 * Interface para operaciones recurrentes mensuales
 * Representa pagos o gastos que se repiten cada mes
 */
export interface OperacionRecurrente {
  /** Identificador único de la operación recurrente */
  id: string;
  
  /** Nombre descriptivo de la operación */
  nombre: string;
  
  /** Monto de la operación */
  monto: number;
  
  /** Categoría de la operación (ej: "Servicios", "Suscripciones", etc.) */
  categoria: string;
  
  /** Día del mes en que se ejecuta la operación (1-31) */
  diaDelMes: number;
  
  /** Tipo de producto asociado: Tarjeta de Débito o Tarjeta de Crédito */
  tipoProducto: 'TD' | 'TC';
  
  /** Indica si la operación recurrente está activa */
  activa: boolean;
}

/**
 * Interface para operaciones recurrentes programadas
 * Representa una operación recurrente que se genera automáticamente cada mes
 */
export interface OperacionRecurrenteProgramada {
  /** Identificador único de la operación recurrente */
  id: string;
  
  /** Título o nombre de la operación */
  titulo: string;
  
  /** Monto de la operación */
  monto: number;
  
  /** Fecha de inicio de la recurrencia */
  fechaInicio: Date;
  
  /** Fecha de fin de la recurrencia */
  fechaFin: Date;
  
  /** Día del mes en que se ejecuta (1-31 o 'fin_de_mes') */
  diaDelMes: number | 'fin_de_mes';
  
  /** Indica si la operación recurrente está activa */
  activa: boolean;
  
  /** Lista de operaciones generadas por esta recurrente */
  operacionesGeneradas: {
    mes: string;
    operacionId: string;
    vinculada: boolean;
  }[];
}
