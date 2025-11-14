/**
 * Interfaces para el proceso de recategorización de movimientos de caja
 * Requirements: 5.5, 6.4
 */

/**
 * Solicitud de recategorización de un movimiento
 */
export interface RecategorizacionRequest {
  operacionId: string;
  nuevaCategoria: 'ingresos' | 'operaciones_recurrentes' | 'pagos_financieros';
  operacionVinculadaId?: string; // ID de operación recurrente o pago financiero a vincular
  mes: string; // Mes de la operación (ej: "Noviembre 2024")
}

/**
 * Respuesta de la API de recategorización
 */
export interface RecategorizacionResponse {
  success: boolean;
  message: string;
  operacionActualizada?: {
    id: string;
    categoria: string;
    categoriaUsuario: string;
    vinculadaARecurrente: boolean;
  };
}

/**
 * Operación que puede ser vinculada durante la recategorización
 */
export interface OperacionVinculable {
  id: string;
  nombre: string;
  descripcion: string;
  monto?: number;
  tipo: 'operacion_recurrente' | 'pago_financiero';
  icono: string; // Material Icon name
}
