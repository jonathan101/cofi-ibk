export interface ConfiguracionPlan {
  ingresoNetoMensual: number;
  metaAhorro: number; // Puede ser porcentaje o monto fijo
  tiempoAlertaCompraAlta: number; // en minutos
  cuentasExcluidas: string[]; // IDs de cuentas excluidas del saldo inicial
  
  // ============================================
  // CLASIFICACIÓN DE GASTOS INDIVIDUALES
  // Topes para clasificar UN gasto como hormiga/medio/excepcional
  // ============================================
  clasificacionGastos: {
    topeHormiga: {
      automatico: boolean; // Si true, usar fórmula (20% ingreso diario)
      montoManual?: number; // Si automatico=false, usar este monto
    };
    topeMedio: {
      automatico: boolean; // Si true, usar fórmula (50% ingreso diario)
      montoManual?: number; // Si automatico=false, usar este monto
    };
  };
  
  // ============================================
  // TOPES MENSUALES (SUMA DE TODOS LOS GASTOS DEL MES)
  // Para todas las secciones del plan
  // ============================================
  topesMensuales: {
    // Gastos
    cobrosAutomaticos: {
      porcentaje?: number; // % del ingreso neto mensual
      montoFijo?: number; // Monto fijo, prioridad si existe
    };
    gastosHormiga: {
      porcentaje?: number;
      montoFijo?: number;
    };
    gastosMedios: {
      porcentaje?: number;
      montoFijo?: number;
    };
    gastosExcepcionales: {
      porcentaje?: number;
      montoFijo?: number;
    };
    // Otras secciones
    cargaFinanciera: {
      porcentaje?: number;
      montoFijo?: number;
    };
    movimientosCaja: {
      porcentaje?: number;
      montoFijo?: number;
    };
    operacionesRecurrentes: {
      porcentaje?: number;
      montoFijo?: number;
    };
  };
  
  // Configuración histórica
  fechaVigencia: Date; // Desde cuándo aplica esta configuración
  aplicaAMesesAnteriores: boolean; // Si false, meses anteriores mantienen su config
}
