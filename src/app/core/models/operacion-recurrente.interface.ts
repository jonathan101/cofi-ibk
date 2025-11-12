export interface OperacionRecurrenteProgramada {
  id: string;
  titulo: string;
  monto: number;
  fechaInicio: Date;
  fechaFin: Date;
  diaDelMes: number | 'fin_de_mes'; // Ej: 5 para día 5, o 'fin_de_mes'
  activa: boolean;
  operacionesGeneradas: {
    mes: string; // "Agosto 2024"
    operacionId: string;
    vinculada: boolean;
  }[];
}
