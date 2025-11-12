export interface ChanchitoAhorro {
  id: string;
  nombre: string; // Primer depa, Primer carro, Viaje, etc.
  montoActual: number;
  metaMonto: number;
  icono: string;
}

export interface TransferenciaAhorro {
  monto: number;
  chanchitoId: string;
  fecha: Date;
}
