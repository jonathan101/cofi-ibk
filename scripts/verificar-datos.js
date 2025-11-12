// Script para verificar estadísticas de operaciones generadas
const fs = require('fs');
const path = require('path');

const MESES = ['agosto-2024', 'septiembre-2024', 'octubre-2024', 'noviembre-2024'];

console.log('\n📊 ESTADÍSTICAS DE OPERACIONES GENERADAS\n');
console.log('='.repeat(80));

MESES.forEach(mes => {
  const filePath = path.join(__dirname, '..', 'src', 'assets', 'data', 'DataEstatica', 'operaciones', `${mes}.json`);
  const operaciones = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  const stats = {
    total: operaciones.length,
    TD: operaciones.filter(o => o.tipoProducto === 'TD').length,
    TC: operaciones.filter(o => o.tipoProducto === 'TC').length,
    gastos: operaciones.filter(o => o.categoria === 'gastos').length,
    movimientos: operaciones.filter(o => o.categoria === 'movimiento_caja').length,
    pagos: operaciones.filter(o => o.categoria === 'pago_financiero').length,
    ingresos: operaciones.filter(o => o.categoria === 'ingresos').length,
    automaticos: operaciones.filter(o => o.tipoGasto === 'automatico').length,
    hormiga: operaciones.filter(o => o.tipoGasto === 'hormiga').length,
    medio: operaciones.filter(o => o.tipoGasto === 'medio').length,
    excepcional: operaciones.filter(o => o.tipoGasto === 'excepcional').length,
    atrasadas: operaciones.filter(o => o.esAtrasada === true).length,
    pendientes: operaciones.filter(o => o.estado === 'pendiente').length
  };
  
  const ratioTD = ((stats.TD / stats.total) * 100).toFixed(1);
  const ratioTC = ((stats.TC / stats.total) * 100).toFixed(1);
  
  console.log(`\n📅 ${mes.toUpperCase()}`);
  console.log('-'.repeat(80));
  console.log(`Total operaciones: ${stats.total}`);
  console.log(`  TD: ${stats.TD} (${ratioTD}%) | TC: ${stats.TC} (${ratioTC}%)`);
  console.log(`\nPor categoría:`);
  console.log(`  Gastos: ${stats.gastos} | Movimientos Caja: ${stats.movimientos} | Pagos Financieros: ${stats.pagos} | Ingresos: ${stats.ingresos}`);
  console.log(`\nTipos de gasto:`);
  console.log(`  Automáticos: ${stats.automaticos} | Hormiga: ${stats.hormiga} | Medio: ${stats.medio} | Excepcional: ${stats.excepcional}`);
  
  if (stats.atrasadas > 0) {
    console.log(`\n⚠️  Operaciones atrasadas: ${stats.atrasadas}`);
  }
  if (stats.pendientes > 0) {
    console.log(`⏳ Operaciones pendientes: ${stats.pendientes}`);
  }
  
  // Verificar subcategorías
  const subcategorias = {};
  operaciones.filter(o => o.subcategoria).forEach(o => {
    subcategorias[o.subcategoria] = (subcategorias[o.subcategoria] || 0) + 1;
  });
  
  console.log(`\nSubcategorías de gastos:`);
  Object.entries(subcategorias).sort((a, b) => b[1] - a[1]).forEach(([sub, count]) => {
    console.log(`  ${sub}: ${count}`);
  });
});

console.log('\n' + '='.repeat(80));
console.log('✅ Verificación completada\n');
