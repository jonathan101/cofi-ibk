// Script para marcar operaciones como pendientes en octubre
const fs = require('fs');
const path = require('path');

// Leer octubre
const octubrePath = path.join(__dirname, '..', 'src', 'assets', 'data', 'DataEstatica', 'operaciones', 'octubre-2024.json');
const octubre = JSON.parse(fs.readFileSync(octubrePath, 'utf8'));

// Encontrar y actualizar op-rec-oct-2 y op-rec-oct-3
octubre.forEach(op => {
  if (op.id === 'op-rec-oct-2' || op.id === 'op-rec-oct-3') {
    op.estado = 'pendiente';
    op.vinculadaARecurrente = false;
    op.fechaPagoMaxima = op.id === 'op-rec-oct-2' ? '2024-10-20T00:00:00.000Z' : '2024-11-05T00:00:00.000Z';
  }
});

// Guardar octubre actualizado
fs.writeFileSync(octubrePath, JSON.stringify(octubre, null, 2));
console.log('✓ Octubre actualizado con operaciones pendientes');
