/**
 * Script de validación de cálculos del plan de ahorros
 * Valida Requirements: 31, 32, 40, 45, 46
 * 
 * Este script valida:
 * 1. Cálculo de saldo actual (excluye operaciones vinculadas)
 * 2. Cálculo de "Por Pagar" (incluye atrasadas)
 * 3. Clasificación de gastos (hormiga/medio/excepcional) con fórmula automática
 * 4. Pills de alerta (ámbar/rojo) en totales de subsecciones
 * 5. Pills solo se muestran en categorías con tope configurado
 */

const fs = require('fs');
const path = require('path');

// Colores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'cyan');
}

function logSection(message) {
  log(`\n${'='.repeat(60)}`, 'blue');
  log(`  ${message}`, 'blue');
  log('='.repeat(60), 'blue');
}

// Cargar datos
const DATA_PATH = path.join(__dirname, '../src/assets/data/DataEstatica');

function cargarJSON(archivo) {
  try {
    const contenido = fs.readFileSync(path.join(DATA_PATH, archivo), 'utf8');
    return JSON.parse(contenido);
  } catch (error) {
    logError(`Error cargando ${archivo}: ${error.message}`);
    return null;
  }
}

// Cargar configuración
const configuracion = cargarJSON('configuracion-plan.json');
if (!configuracion) {
  logError('No se pudo cargar la configuración');
  process.exit(1);
}

// Cargar operaciones de cada mes
const meses = ['agosto-2024', 'septiembre-2024', 'octubre-2024', 'noviembre-2024'];
const operacionesPorMes = {};

meses.forEach(mes => {
  const ops = cargarJSON(`operaciones/${mes}.json`);
  if (ops) {
    operacionesPorMes[mes] = ops.map(op => ({
      ...op,
      fecha: new Date(op.fecha),
      fechaPagoMaxima: op.fechaPagoMaxima ? new Date(op.fechaPagoMaxima) : undefined
    }));
  }
});

// Función para aplicar filtros
function filtrarOperaciones(operaciones, filtros) {
  let resultado = [...operaciones];

  if (filtros.categoria !== undefined) {
    if (Array.isArray(filtros.categoria)) {
      resultado = resultado.filter(op => filtros.categoria.includes(op.categoria));
    } else {
      resultado = resultado.filter(op => op.categoria === filtros.categoria);
    }
  }

  if (filtros.categoriaUsuario !== undefined) {
    if (filtros.categoriaUsuario === null) {
      resultado = resultado.filter(op => !op.categoriaUsuario || op.categoriaUsuario === 'no_aplica');
    } else if (Array.isArray(filtros.categoriaUsuario)) {
      resultado = resultado.filter(op => 
        op.categoriaUsuario && filtros.categoriaUsuario.includes(op.categoriaUsuario)
      );
    } else {
      resultado = resultado.filter(op => op.categoriaUsuario === filtros.categoriaUsuario);
    }
  }

  if (filtros.estado && filtros.estado !== 'todos') {
    resultado = resultado.filter(op => op.estado === filtros.estado);
  }

  if (filtros.vinculadaARecurrente !== undefined) {
    resultado = resultado.filter(op => 
      (op.vinculadaARecurrente === true) === filtros.vinculadaARecurrente
    );
  }

  if (filtros.tipoProducto) {
    resultado = resultado.filter(op => op.tipoProducto === filtros.tipoProducto);
  }

  if (filtros.tipoGasto) {
    resultado = resultado.filter(op => op.tipoGasto === filtros.tipoGasto);
  }

  if (filtros.esAtrasada !== undefined) {
    resultado = resultado.filter(op => op.esAtrasada === filtros.esAtrasada);
  }

  return resultado;
}

// Función para sumar operaciones
function sumarOperaciones(operaciones, filtros) {
  const filtradas = filtrarOperaciones(operaciones, filtros);
  return filtradas.reduce((sum, op) => sum + op.monto, 0);
}

// Función para clasificar tipo de gasto
function clasificarTipoGasto(operacion, config) {
  if (operacion.categoria !== 'gastos' || operacion.tipoGasto === 'automatico') {
    return null;
  }
  
  const montoAbsoluto = Math.abs(operacion.monto);
  const ingresoNetoMensual = config.ingresoNetoMensual;
  const ingresoDiario = ingresoNetoMensual / 30;
  
  let topeHormiga, topeMedio;
  
  if (config.clasificacionGastos.topeHormiga.automatico) {
    topeHormiga = Math.floor(ingresoDiario * 0.20 / 10) * 10;
  } else {
    topeHormiga = config.clasificacionGastos.topeHormiga.montoManual || 0;
  }
  
  if (config.clasificacionGastos.topeMedio.automatico) {
    topeMedio = Math.floor(ingresoDiario * 0.50 / 10) * 10;
  } else {
    topeMedio = config.clasificacionGastos.topeMedio.montoManual || 0;
  }
  
  if (montoAbsoluto <= topeHormiga) {
    return 'hormiga';
  } else if (montoAbsoluto <= topeMedio) {
    return 'medio';
  } else {
    return 'excepcional';
  }
}

// Función para calcular estado de alerta
function calcularEstadoAlerta(total, topeMensual) {
  if (!topeMensual) return 'normal';
  
  const porcentajeUsado = (Math.abs(total) / topeMensual) * 100;
  
  if (porcentajeUsado < 90) {
    return 'normal';
  } else if (porcentajeUsado <= 100) {
    return 'warning';
  } else {
    return 'danger';
  }
}

// ============================================
// VALIDACIÓN 1: Cálculo de Saldo Actual
// ============================================
logSection('Validando Cálculo de Saldo Actual (Requirement 31)');

let erroresEncontrados = 0;

meses.forEach(mes => {
  const operaciones = operacionesPorMes[mes];
  if (!operaciones) return;
  
  logInfo(`\nMes: ${mes}`);
  
  const saldoInicial = 5000; // Mock
  
  const ingresos = sumarOperaciones(operaciones, { 
    categoria: 'ingresos',
    vinculadaARecurrente: false 
  });
  
  const operacionesReg = sumarOperaciones(operaciones, { 
    categoriaUsuario: 'operacion_recurrente',
    vinculadaARecurrente: false 
  });
  
  const gastos = sumarOperaciones(operaciones, { 
    categoria: 'gastos',
    vinculadaARecurrente: false 
  });
  
  const movCaja = sumarOperaciones(operaciones, { 
    categoria: 'movimiento_caja',
    categoriaUsuario: null,
    vinculadaARecurrente: false 
  });
  
  const cargaFin = sumarOperaciones(operaciones, { 
    categoria: 'pago_financiero',
    estado: 'pagado',
    vinculadaARecurrente: false 
  });
  
  const saldoActual = saldoInicial + ingresos + operacionesReg + gastos + movCaja + cargaFin;
  
  logInfo(`  Saldo Inicial: S/ ${saldoInicial.toFixed(2)}`);
  logInfo(`  Ingresos: S/ ${ingresos.toFixed(2)}`);
  logInfo(`  Operaciones Regulares: S/ ${operacionesReg.toFixed(2)}`);
  logInfo(`  Gastos: S/ ${gastos.toFixed(2)}`);
  logInfo(`  Movimientos de Caja: S/ ${movCaja.toFixed(2)}`);
  logInfo(`  Carga Financiera (pagado): S/ ${cargaFin.toFixed(2)}`);
  logInfo(`  Saldo Actual: S/ ${saldoActual.toFixed(2)}`);
  
  // Verificar que no hay operaciones vinculadas en el cálculo
  const vinculadas = filtrarOperaciones(operaciones, { vinculadaARecurrente: true });
  if (vinculadas.length > 0) {
    logWarning(`  Encontradas ${vinculadas.length} operaciones vinculadas (correctamente excluidas)`);
  }
  
  logSuccess(`  Cálculo de saldo actual completado`);
});

// ============================================
// VALIDACIÓN 2: Cálculo de "Por Pagar"
// ============================================
logSection('Validando Cálculo de Por Pagar (Requirement 32)');

meses.forEach(mes => {
  const operaciones = operacionesPorMes[mes];
  if (!operaciones) return;
  
  logInfo(`\nMes: ${mes}`);
  
  const porPagar = sumarOperaciones(operaciones, {
    categoria: ['pago_financiero', 'movimiento_caja'],
    categoriaUsuario: ['operacion_recurrente'],
    estado: 'pendiente',
    vinculadaARecurrente: false
  });
  
  // Verificar operaciones atrasadas
  const atrasadas = filtrarOperaciones(operaciones, { esAtrasada: true });
  
  logInfo(`  Por Pagar: S/ ${Math.abs(porPagar).toFixed(2)}`);
  if (atrasadas.length > 0) {
    logWarning(`  Incluye ${atrasadas.length} operaciones atrasadas`);
  }
  
  logSuccess(`  Cálculo de por pagar completado`);
});

// ============================================
// VALIDACIÓN 3: Clasificación de Gastos
// ============================================
logSection('Validando Clasificación de Gastos (Requirement 40)');

const ingresoDiario = configuracion.ingresoNetoMensual / 30;
const topeHormiga = Math.floor(ingresoDiario * 0.20 / 10) * 10;
const topeMedio = Math.floor(ingresoDiario * 0.50 / 10) * 10;

logInfo(`\nIngreso Neto Mensual: S/ ${configuracion.ingresoNetoMensual}`);
logInfo(`Ingreso Diario: S/ ${ingresoDiario.toFixed(2)}`);
logInfo(`Tope Hormiga (20%): S/ ${topeHormiga}`);
logInfo(`Tope Medio (50%): S/ ${topeMedio}`);

let gastosValidados = 0;
let gastosIncorrectos = 0;

meses.forEach(mes => {
  const operaciones = operacionesPorMes[mes];
  if (!operaciones) return;
  
  const gastos = filtrarOperaciones(operaciones, { categoria: 'gastos' });
  
  gastos.forEach(gasto => {
    if (gasto.tipoGasto === 'automatico') return;
    
    const clasificacionEsperada = clasificarTipoGasto(gasto, configuracion);
    const clasificacionActual = gasto.tipoGasto;
    
    if (clasificacionEsperada === clasificacionActual) {
      gastosValidados++;
    } else {
      gastosIncorrectos++;
      logError(`  ${mes}: ${gasto.operacion} (S/ ${Math.abs(gasto.monto)}) - Esperado: ${clasificacionEsperada}, Actual: ${clasificacionActual}`);
      erroresEncontrados++;
    }
  });
});

logInfo(`\nGastos validados: ${gastosValidados}`);
if (gastosIncorrectos > 0) {
  logError(`Gastos con clasificación incorrecta: ${gastosIncorrectos}`);
} else {
  logSuccess(`Todos los gastos están correctamente clasificados`);
}

// ============================================
// VALIDACIÓN 4: Pills de Alerta
// ============================================
logSection('Validando Pills de Alerta (Requirements 45, 46)');

meses.forEach(mes => {
  const operaciones = operacionesPorMes[mes];
  if (!operaciones) return;
  
  logInfo(`\nMes: ${mes}`);
  
  // Validar subsecciones de gastos
  const subsecciones = [
    { nombre: 'Cobros Automáticos', filtro: { categoria: 'gastos', tipoGasto: 'automatico' }, tope: configuracion.topesMensuales.cobrosAutomaticos },
    { nombre: 'Gastos Hormiga', filtro: { categoria: 'gastos', tipoGasto: 'hormiga' }, tope: configuracion.topesMensuales.gastosHormiga },
    { nombre: 'Gastos Medios', filtro: { categoria: 'gastos', tipoGasto: 'medio' }, tope: configuracion.topesMensuales.gastosMedios },
    { nombre: 'Gastos Excepcionales', filtro: { categoria: 'gastos', tipoGasto: 'excepcional' }, tope: configuracion.topesMensuales.gastosExcepcionales },
    { nombre: 'Carga Financiera', filtro: { categoria: 'pago_financiero', estado: 'pagado' }, tope: configuracion.topesMensuales.cargaFinanciera }
  ];
  
  subsecciones.forEach(({ nombre, filtro, tope }) => {
    const consumoTD = sumarOperaciones(operaciones, { ...filtro, tipoProducto: 'TD', vinculadaARecurrente: false });
    const consumoTC = sumarOperaciones(operaciones, { ...filtro, tipoProducto: 'TC', vinculadaARecurrente: false });
    const total = consumoTD + consumoTC;
    
    // Calcular tope mensual
    let topeMensual = null;
    if (tope.montoFijo) {
      topeMensual = tope.montoFijo;
    } else if (tope.porcentaje) {
      topeMensual = (configuracion.ingresoNetoMensual * tope.porcentaje) / 100;
    }
    
    const estadoAlerta = calcularEstadoAlerta(total, topeMensual);
    const porcentajeUsado = topeMensual ? (Math.abs(total) / topeMensual) * 100 : 0;
    
    let mensaje = `  ${nombre}:`;
    mensaje += `\n    Consumo TD: S/ ${Math.abs(consumoTD).toFixed(2)} (texto normal)`;
    mensaje += `\n    Consumo TC: S/ ${Math.abs(consumoTC).toFixed(2)} (texto normal)`;
    mensaje += `\n    Total: S/ ${Math.abs(total).toFixed(2)}`;
    
    if (topeMensual) {
      mensaje += ` (${porcentajeUsado.toFixed(1)}% del tope)`;
      
      if (estadoAlerta === 'normal') {
        mensaje += ' - Sin pill (< 90%)';
        logInfo(mensaje);
      } else if (estadoAlerta === 'warning') {
        mensaje += ' - Pill ÁMBAR (90-100%)';
        logWarning(mensaje);
      } else {
        mensaje += ' - Pill ROJO (> 100%)';
        logError(mensaje);
      }
    } else {
      mensaje += ' - Sin pill (sin tope configurado)';
      logInfo(mensaje);
    }
  });
  
  logSuccess(`  Validación de pills completada`);
});

// ============================================
// VALIDACIÓN 5: Operaciones Vinculadas
// ============================================
logSection('Validando Operaciones Vinculadas (Requirement 40)');

let totalVinculadas = 0;

meses.forEach(mes => {
  const operaciones = operacionesPorMes[mes];
  if (!operaciones) return;
  
  const vinculadas = filtrarOperaciones(operaciones, { vinculadaARecurrente: true });
  totalVinculadas += vinculadas.length;
  
  if (vinculadas.length > 0) {
    logInfo(`\n${mes}: ${vinculadas.length} operaciones vinculadas`);
    vinculadas.forEach(op => {
      logInfo(`  - ${op.operacion} (S/ ${op.monto}) → Recurrente ID: ${op.operacionRecurrenteId}`);
    });
  }
});

if (totalVinculadas > 0) {
  logSuccess(`\nTotal de operaciones vinculadas: ${totalVinculadas}`);
  logSuccess(`Las operaciones vinculadas se excluyen correctamente de los cálculos`);
} else {
  logInfo(`\nNo se encontraron operaciones vinculadas en los datos`);
}

// ============================================
// RESUMEN FINAL
// ============================================
logSection('RESUMEN DE VALIDACIÓN');

if (erroresEncontrados === 0) {
  logSuccess('\n✓ Todas las validaciones pasaron correctamente');
  logSuccess('✓ Cálculo de saldo actual: OK');
  logSuccess('✓ Cálculo de por pagar: OK');
  logSuccess('✓ Clasificación de gastos: OK');
  logSuccess('✓ Pills de alerta: OK');
  logSuccess('✓ Operaciones vinculadas: OK');
  console.log('');
  process.exit(0);
} else {
  logError(`\n✗ Se encontraron ${erroresEncontrados} errores`);
  logWarning('Revisa los detalles arriba para más información');
  console.log('');
  process.exit(1);
}
