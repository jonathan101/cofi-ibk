// Script para generar operaciones financieras realistas
// Ejecutar con: node scripts/generar-operaciones.js

const fs = require('fs');
const path = require('path');

// Configuración
const MESES = [
  { nombre: 'agosto-2024', total: 100, fecha: '2024-08' },
  { nombre: 'septiembre-2024', total: 100, fecha: '2024-09' },
  { nombre: 'octubre-2024', total: 100, fecha: '2024-10' },
  { nombre: 'noviembre-2024', total: 50, fecha: '2024-11' }
];

const RATIO_TD = 0.6; // 60% TD
const RATIO_TC = 0.4; // 40% TC

// Categorías y subcategorías
// Distribución de gastos: 55% hormiga, 30% medio, 15% excepcional
const GASTOS_SUBCATEGORIAS = [
  // Gastos hormiga (pequeños, frecuentes) - 55%
  { nombre: 'supermercado', tipoProducto: ['TD'], montoMin: 5, montoMax: 20, peso: 15 }, // Bodega, panadería
  { nombre: 'transporte', tipoProducto: ['TC'], montoMin: 8, montoMax: 20, peso: 12 }, // Taxi corto, pasaje
  { nombre: 'restaurantes', tipoProducto: ['TC'], montoMin: 10, montoMax: 20, peso: 10 }, // Café, snack
  { nombre: 'delivery', tipoProducto: ['TC'], montoMin: 12, montoMax: 20, peso: 8 }, // Delivery pequeño
  { nombre: 'entretenimiento', tipoProducto: ['TC'], montoMin: 8, montoMax: 20, peso: 5 }, // Apps, juegos
  { nombre: 'salud', tipoProducto: ['TD'], montoMin: 10, montoMax: 20, peso: 5 }, // Farmacia básica
  
  // Gastos medios (moderados) - 30%
  { nombre: 'supermercado', tipoProducto: ['TD', 'TC'], montoMin: 21, montoMax: 60, peso: 8 }, // Compra mediana
  { nombre: 'restaurantes', tipoProducto: ['TC'], montoMin: 21, montoMax: 60, peso: 7 }, // Almuerzo/cena
  { nombre: 'delivery', tipoProducto: ['TC'], montoMin: 21, montoMax: 60, peso: 5 }, // Delivery normal
  { nombre: 'transporte', tipoProducto: ['TD', 'TC'], montoMin: 21, montoMax: 60, peso: 4 }, // Gasolina, taxi largo
  { nombre: 'salud', tipoProducto: ['TD', 'TC'], montoMin: 21, montoMax: 60, peso: 3 }, // Farmacia, consulta
  { nombre: 'entretenimiento', tipoProducto: ['TC'], montoMin: 21, montoMax: 60, peso: 3 }, // Cine, teatro
  
  // Gastos excepcionales (grandes, ocasionales) - 15%
  { nombre: 'supermercado', tipoProducto: ['TD', 'TC'], montoMin: 61, montoMax: 300, peso: 3 }, // Compra grande
  { nombre: 'restaurantes', tipoProducto: ['TC'], montoMin: 61, montoMax: 400, peso: 3 }, // Restaurante fino
  { nombre: 'compras', tipoProducto: ['TC'], montoMin: 61, montoMax: 500, peso: 3 }, // Ropa, electrónicos
  { nombre: 'transporte', tipoProducto: ['TD'], montoMin: 61, montoMax: 150, peso: 2 }, // Gasolina lleno
  { nombre: 'salud', tipoProducto: ['TD', 'TC'], montoMin: 61, montoMax: 200, peso: 2 }, // Clínica, exámenes
  { nombre: 'educacion', tipoProducto: ['TC'], montoMin: 61, montoMax: 300, peso: 1 }, // Cursos, libros
  { nombre: 'viajes', tipoProducto: ['TC'], montoMin: 100, montoMax: 1000, peso: 1 } // Pasajes, hoteles
];

const GASTOS_AUTOMATICOS = [
  { nombre: 'Netflix', monto: 35, subcategoria: 'entretenimiento', dia: 5 },
  { nombre: 'Spotify Premium', monto: 20, subcategoria: 'entretenimiento', dia: 5 },
  { nombre: 'Gimnasio Gold\'s Gym', monto: 150, subcategoria: 'salud', dia: 13 },
  { nombre: 'Amazon Prime', monto: 25, subcategoria: 'entretenimiento', dia: 14 }
];

const OPERACIONES_RECURRENTES = [
  { id: 'rec1', nombre: 'Alquiler departamento', monto: 800, dia: 5, tipoMovimiento: 'transferencia' },
  { id: 'rec2', nombre: 'Pago de luz', monto: 120, dia: 15, tipoMovimiento: 'otros' },
  { id: 'rec3', nombre: 'Internet y cable', monto: 150, dia: 31, tipoMovimiento: 'otros' }
];

// Funciones auxiliares
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

function generarFecha(mes, dia, hora = null) {
  if (!hora) hora = `${randomInt(8, 20)}:${randomInt(0, 59)}:00`;
  const diaStr = dia.toString().padStart(2, '0');
  return `${mes}-${diaStr}T${hora}.000Z`;
}

function clasificarTipoGasto(monto) {
  const montoAbs = Math.abs(monto);
  if (montoAbs <= 20) return 'hormiga';
  if (montoAbs <= 60) return 'medio';
  return 'excepcional';
}

function generarOperaciones(mes, totalOperaciones) {
  const operaciones = [];
  let contadorTD = 0;
  let contadorTC = 0;
  const targetTD = Math.floor(totalOperaciones * RATIO_TD);
  
  // 1. Ingreso mensual (siempre el día 1)
  operaciones.push({
    id: `${mes.nombre.substring(0, 3)}-001`,
    fecha: generarFecha(mes.fecha, 1, '10:30:00'),
    operacion: 'Sueldo mensual',
    monto: 4000,
    categoria: 'ingresos',
    tipoProducto: 'TD'
  });
  contadorTD++;

  // 2. Gastos automáticos
  GASTOS_AUTOMATICOS.forEach((auto, idx) => {
    operaciones.push({
      id: `${mes.nombre.substring(0, 3)}-${String(operaciones.length + 1).padStart(3, '0')}`,
      fecha: generarFecha(mes.fecha, auto.dia, '08:00:00'),
      operacion: auto.nombre,
      monto: -auto.monto,
      categoria: 'gastos',
      subcategoria: auto.subcategoria,
      tipoProducto: 'TC',
      tipoGasto: 'automatico'
    });
    contadorTC++;
  });

  // 3. Operaciones recurrentes
  OPERACIONES_RECURRENTES.forEach((rec, idx) => {
    const dia = rec.dia === 31 ? new Date(mes.fecha.split('-')[0], parseInt(mes.fecha.split('-')[1]), 0).getDate() : rec.dia;
    operaciones.push({
      id: `op-rec-${mes.nombre.substring(0, 3)}-${idx + 1}`,
      fecha: generarFecha(mes.fecha, dia, '00:00:00'),
      operacion: rec.nombre,
      monto: -rec.monto,
      categoria: 'movimiento_caja',
      tipoMovimiento: rec.tipoMovimiento,
      categoriaUsuario: 'operacion_recurrente',
      tipoProducto: 'TD',
      estado: 'pagado',
      operacionRecurrenteId: rec.id,
      vinculadaARecurrente: true
    });
    contadorTD++;
  });

  // 4. Pagos financieros (3-5 por mes)
  const numPagosFinancieros = randomInt(3, 5);
  for (let i = 0; i < numPagosFinancieros; i++) {
    const dia = randomInt(10, 28);
    const tipos = ['Pago tarjeta de crédito Visa', 'Pago tarjeta de crédito Mastercard', 'Cuota préstamo personal', 'Cuota préstamo vehicular'];
    operaciones.push({
      id: `${mes.nombre.substring(0, 3)}-${String(operaciones.length + 1).padStart(3, '0')}`,
      fecha: generarFecha(mes.fecha, dia),
      operacion: randomChoice(tipos),
      monto: -randomInt(500, 1500),
      categoria: 'pago_financiero',
      tipoProducto: 'TD',
      estado: 'pagado'
    });
    contadorTD++;
  }

  // 5. Movimientos de caja (transferencias, retiros, depósitos)
  const numMovimientos = randomInt(8, 12);
  for (let i = 0; i < numMovimientos; i++) {
    const tipoMov = randomChoice(['transferencia', 'retiro', 'deposito']);
    const dia = randomInt(2, 28);
    let operacion, monto;
    
    if (tipoMov === 'transferencia') {
      operacion = randomChoice(['Transferencia a ahorros', 'Transferencia a terceros', 'Pago de servicios']);
      monto = -randomInt(100, 800);
    } else if (tipoMov === 'retiro') {
      operacion = 'Retiro ATM';
      monto = -randomInt(100, 500);
    } else {
      operacion = randomChoice(['Depósito en cuenta', 'Transferencia recibida']);
      monto = randomInt(200, 1000);
    }

    operaciones.push({
      id: `${mes.nombre.substring(0, 3)}-${String(operaciones.length + 1).padStart(3, '0')}`,
      fecha: generarFecha(mes.fecha, dia),
      operacion,
      monto,
      categoria: 'movimiento_caja',
      tipoMovimiento: tipoMov,
      tipoProducto: 'TD'
    });
    contadorTD++;
  }

  // 6. Gastos variados hasta completar 100 operaciones
  // Usar sistema de pesos para distribución realista
  const totalPeso = GASTOS_SUBCATEGORIAS.reduce((sum, cat) => sum + cat.peso, 0);
  
  while (operaciones.length < totalOperaciones) {
    // Seleccionar subcategoría basada en peso
    let random = Math.random() * totalPeso;
    let subcategoria;
    for (const cat of GASTOS_SUBCATEGORIAS) {
      random -= cat.peso;
      if (random <= 0) {
        subcategoria = cat;
        break;
      }
    }
    
    const dia = randomInt(2, mes.nombre === 'noviembre-2024' ? 14 : 28);
    
    // Decidir si es TD o TC basado en ratio objetivo
    let tipoProducto;
    if (contadorTD < targetTD && subcategoria.tipoProducto.includes('TD')) {
      tipoProducto = 'TD';
      contadorTD++;
    } else if (subcategoria.tipoProducto.includes('TC')) {
      tipoProducto = 'TC';
      contadorTC++;
    } else {
      tipoProducto = randomChoice(subcategoria.tipoProducto);
      if (tipoProducto === 'TD') contadorTD++;
      else contadorTC++;
    }

    const monto = -randomInt(subcategoria.montoMin, subcategoria.montoMax);
    const tipoGasto = clasificarTipoGasto(monto);

    const nombres = {
      supermercado: tipoGasto === 'hormiga' 
        ? ['Bodega del barrio', 'Panadería', 'Mercado local', 'Minimarket', 'Tienda de barrio']
        : tipoGasto === 'medio'
        ? ['Supermercado Wong', 'Plaza Vea', 'Metro', 'Tottus']
        : ['Supermercado Wong - Compra grande', 'Plaza Vea - Compra mensual', 'Metro - Despensa'],
      
      restaurantes: tipoGasto === 'hormiga'
        ? ['Café Starbucks', 'Juan Valdez', 'Café local', 'Snack bar', 'Jugos']
        : tipoGasto === 'medio'
        ? ['Chili\'s', 'Pardos Chicken', 'Bembos', 'KFC', 'Pizza Hut', 'China Wok']
        : ['Restaurante La Rosa Náutica', 'Osaka', 'Tanta', 'Maido', 'Central', 'Astrid y Gastón'],
      
      delivery: tipoGasto === 'hormiga'
        ? ['Delivery Rappi - Snack', 'Uber Eats - Desayuno', 'PedidosYa - Café']
        : tipoGasto === 'medio'
        ? ['Delivery Rappi', 'Uber Eats', 'PedidosYa', 'Glovo']
        : ['Delivery Rappi - Pedido grande', 'Uber Eats - Cena familiar'],
      
      transporte: tipoGasto === 'hormiga'
        ? ['Taxi Uber', 'Taxi Beat', 'Taxi Cabify', 'Pasaje bus', 'Estacionamiento']
        : tipoGasto === 'medio'
        ? ['Taxi Uber - Largo', 'Gasolina Primax', 'Peaje', 'Taxi al aeropuerto']
        : ['Gasolina Primax - Lleno', 'Gasolina Shell - Lleno', 'Taxi largo'],
      
      salud: tipoGasto === 'hormiga'
        ? ['Farmacia Inkafarma', 'Farmacia Universal', 'Boticas BTL', 'Vitaminas']
        : tipoGasto === 'medio'
        ? ['Farmacia - Medicamentos', 'Consulta médica', 'Análisis clínicos']
        : ['Clínica', 'Laboratorio', 'Exámenes médicos', 'Tratamiento dental'],
      
      entretenimiento: tipoGasto === 'hormiga'
        ? ['App Store', 'Google Play', 'Juego móvil', 'Revista', 'Streaming']
        : tipoGasto === 'medio'
        ? ['Cine Cinemark', 'Cine UVK', 'Cine Cinépolis', 'Bowling', 'Karaoke']
        : ['Teatro Municipal', 'Concierto', 'Parque de diversiones', 'Show'],
      
      educacion: ['Librería Nacional', 'Librería Crisol', 'Curso online Udemy', 'Coursera', 'Útiles escolares', 'Libros'],
      compras: ['Amazon', 'Mercado Libre', 'Saga Falabella', 'Ripley', 'Oechsle', 'Zara', 'H&M', 'Adidas'],
      viajes: ['Pasaje aéreo', 'Hotel', 'Airbnb', 'Agencia de viajes', 'Alquiler de auto', 'Excursión']
    };

    operaciones.push({
      id: `${mes.nombre.substring(0, 3)}-${String(operaciones.length + 1).padStart(3, '0')}`,
      fecha: generarFecha(mes.fecha, dia),
      operacion: randomChoice(nombres[subcategoria.nombre]),
      monto,
      categoria: 'gastos',
      subcategoria: subcategoria.nombre,
      tipoProducto,
      tipoGasto
    });
  }

  // Ordenar por fecha
  operaciones.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  return operaciones;
}

// Generar archivos
MESES.forEach(mes => {
  const operaciones = generarOperaciones(mes, mes.total);
  const outputPath = path.join(__dirname, '..', 'src', 'assets', 'data', 'DataEstatica', 'operaciones', `${mes.nombre}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(operaciones, null, 2));
  console.log(`✓ Generado ${mes.nombre}.json con ${operaciones.length} operaciones`);
});

console.log('\n✓ Todos los archivos generados exitosamente');
