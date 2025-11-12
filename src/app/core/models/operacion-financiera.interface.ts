export interface OperacionFinanciera {
  id: string;
  fecha: Date; // Fecha de operación (si pagado) o fecha máxima de pago (si pendiente)
  operacion: string; // Descripción
  monto: number;
  categoria: 'gastos' | 'movimiento_caja' | 'pago_financiero' | 'ingresos';
  categoriaUsuario?: 'operacion_recurrente' | 'ingreso' | 'no_aplica';
  subcategoria?: string; // Solo para gastos: restaurantes, supermercado, delivery, transporte, salud, entretenimiento, educacion, compras
  tipoProducto: 'TC' | 'TD'; // Tarjeta de Crédito o Tarjeta de Débito
  tipoGasto?: 'automatico' | 'hormiga' | 'medio' | 'excepcional'; // Solo para categoria 'gastos'
  tipoMovimiento?: 'transferencia' | 'retiro' | 'deposito' | 'otros'; // Solo para categoria 'movimiento_caja'
  estado?: 'pagado' | 'pendiente'; // Solo para movimiento_caja con operacion_recurrente y pago_financiero
  fechaPagoMaxima?: Date; // Solo para operaciones con estado
  operacionRecurrenteId?: string; // ID de la operación recurrente programada a la que pertenece
  vinculadaARecurrente?: boolean; // true si está vinculada, no aparece en categoría original
  esAtrasada?: boolean; // true si es un pago atrasado del mes anterior
  mesOriginal?: string; // Mes original de la operación atrasada (ej: "Octubre 2024")
  notas?: string; // Notas del usuario
  etiquetas?: string[]; // Tags personalizados
  historialCambios?: {
    fecha: Date;
    campo: string;
    valorAnterior: any;
    valorNuevo: any;
  }[];
}
