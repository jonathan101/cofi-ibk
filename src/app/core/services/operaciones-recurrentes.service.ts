import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';
import { OperacionRecurrenteProgramada } from '../models/operacion-recurrente.interface';
import { OperacionFinanciera } from '../models/operacion-financiera.interface';

/**
 * Servicio para gestionar operaciones recurrentes programadas
 * Implementa CRUD y generación automática de operaciones mensuales
 * Implementa fallback automático a datos mock
 * 
 * Requirement 37: Gestión de operaciones recurrentes
 */
@Injectable({
  providedIn: 'root'
})
export class OperacionesRecurrentesService {
  private readonly DATA_PATH = '/assets/data/DataEstatica';
  
  // Cache de operaciones recurrentes
  private operacionesRecurrentesCache: OperacionRecurrenteProgramada[] | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de operaciones recurrentes programadas
   * Requirement 37: Listar operaciones recurrentes
   */
  getOperacionesRecurrentes(): Observable<OperacionRecurrenteProgramada[]> {
    if (this.operacionesRecurrentesCache) {
      return of(this.operacionesRecurrentesCache);
    }

    // TODO: Reemplazar con URL real de API cuando esté disponible
    return this.http.get<{ operacionesRecurrentes: OperacionRecurrenteProgramada[] }>(`${this.DATA_PATH}/operaciones-recurrentes.json`)
      .pipe(
        map(data => {
          // Convertir fechas de string a Date
          const operaciones = data.operacionesRecurrentes.map(op => ({
            ...op,
            fechaInicio: new Date(op.fechaInicio),
            fechaFin: new Date(op.fechaFin)
          }));
          this.operacionesRecurrentesCache = operaciones;
          return operaciones;
        }),
        catchError(() => {
          console.warn('Error cargando operaciones recurrentes, retornando array vacío');
          return of([]);
        })
      );
  }

  /**
   * Obtiene operaciones recurrentes activas
   */
  getOperacionesActivas(): Observable<OperacionRecurrenteProgramada[]> {
    return this.getOperacionesRecurrentes().pipe(
      map(operaciones => operaciones.filter(op => op.activa))
    );
  }

  /**
   * Obtiene una operación recurrente por ID
   */
  getOperacionById(id: string): Observable<OperacionRecurrenteProgramada | undefined> {
    return this.getOperacionesRecurrentes().pipe(
      map(operaciones => operaciones.find(op => op.id === id))
    );
  }

  /**
   * Crea una nueva operación recurrente
   * Requirement 37: Crear operación recurrente con generación automática
   */
  crearOperacionRecurrente(data: Partial<OperacionRecurrenteProgramada>): Observable<OperacionRecurrenteProgramada> {
    const nuevaOperacion: OperacionRecurrenteProgramada = {
      id: `rec-prog-${Date.now()}`,
      titulo: data.titulo || '',
      monto: data.monto || 0,
      fechaInicio: data.fechaInicio || new Date(),
      fechaFin: data.fechaFin || new Date(),
      diaDelMes: data.diaDelMes || 1,
      activa: data.activa !== undefined ? data.activa : true,
      operacionesGeneradas: []
    };

    return this.getOperacionesRecurrentes().pipe(
      map(operaciones => {
        operaciones.push(nuevaOperacion);
        this.operacionesRecurrentesCache = operaciones;
        
        // TODO: Llamar a API real para persistir
        return nuevaOperacion;
      }),
      delay(300)
    );
  }

  /**
   * Actualiza una operación recurrente existente
   */
  actualizarOperacionRecurrente(id: string, data: Partial<OperacionRecurrenteProgramada>): Observable<OperacionRecurrenteProgramada> {
    return this.getOperacionesRecurrentes().pipe(
      map(operaciones => {
        const index = operaciones.findIndex(op => op.id === id);
        if (index === -1) {
          throw new Error(`Operación recurrente ${id} no encontrada`);
        }

        // Actualizar campos
        operaciones[index] = {
          ...operaciones[index],
          ...data,
          id // Mantener el ID original
        };

        this.operacionesRecurrentesCache = operaciones;
        
        // TODO: Llamar a API real para persistir
        return operaciones[index];
      }),
      delay(300)
    );
  }

  /**
   * Elimina una operación recurrente
   */
  eliminarOperacionRecurrente(id: string): Observable<void> {
    return this.getOperacionesRecurrentes().pipe(
      map(operaciones => {
        const index = operaciones.findIndex(op => op.id === id);
        if (index !== -1) {
          operaciones.splice(index, 1);
          this.operacionesRecurrentesCache = operaciones;
        }
        
        // TODO: Llamar a API real para persistir
        return void 0;
      }),
      delay(300)
    );
  }

  /**
   * Activa o desactiva una operación recurrente
   */
  activarDesactivarOperacionRecurrente(id: string, activa: boolean): Observable<void> {
    return this.getOperacionesRecurrentes().pipe(
      map(operaciones => {
        const operacion = operaciones.find(op => op.id === id);
        if (operacion) {
          operacion.activa = activa;
          this.operacionesRecurrentesCache = operaciones;
        }
        
        // TODO: Llamar a API real para persistir
        return void 0;
      }),
      delay(300)
    );
  }

  /**
   * Genera operaciones mensuales automáticamente entre fechaInicio y fechaFin
   * Requirement 37: Generación automática de operaciones mensuales
   */
  generarOperacionesMensuales(recurrente: OperacionRecurrenteProgramada): OperacionFinanciera[] {
    const operaciones: OperacionFinanciera[] = [];
    
    const fechaInicio = new Date(recurrente.fechaInicio);
    const fechaFin = new Date(recurrente.fechaFin);
    
    // Iterar mes por mes
    let fechaActual = new Date(fechaInicio);
    
    while (fechaActual <= fechaFin) {
      // Calcular fecha de la operación
      let fechaOperacion: Date;
      
      if (recurrente.diaDelMes === 'fin_de_mes') {
        // Último día del mes
        fechaOperacion = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);
      } else {
        // Día específico del mes
        const dia = typeof recurrente.diaDelMes === 'number' ? recurrente.diaDelMes : 1;
        fechaOperacion = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), dia);
        
        // Si el día no existe en el mes (ej: 31 en febrero), usar último día del mes
        if (fechaOperacion.getMonth() !== fechaActual.getMonth()) {
          fechaOperacion = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);
        }
      }
      
      // Crear operación
      const operacion: OperacionFinanciera = {
        id: `${recurrente.id}-${fechaOperacion.getFullYear()}-${fechaOperacion.getMonth() + 1}`,
        fecha: fechaOperacion,
        operacion: recurrente.titulo,
        monto: recurrente.monto,
        categoria: 'cobro_automatico',
        categoriaUsuario: 'operacion_recurrente',
        tipoProducto: 'TD',
        automatico: true,
        estado: 'pendiente',
        fechaPagoMaxima: fechaOperacion,
        operacionRecurrenteId: recurrente.id,
        vinculadaARecurrente: false
      };
      
      operaciones.push(operacion);
      
      // Avanzar al siguiente mes
      fechaActual = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 1);
    }
    
    return operaciones;
  }

  /**
   * Marca una operación como generada (vinculada)
   */
  marcarOperacionComoGenerada(recurrenteId: string, operacionId: string, mes: string): Observable<void> {
    return this.getOperacionesRecurrentes().pipe(
      map(operaciones => {
        const recurrente = operaciones.find(op => op.id === recurrenteId);
        if (recurrente) {
          // Verificar si ya existe
          const existe = recurrente.operacionesGeneradas.some(og => og.operacionId === operacionId);
          
          if (!existe) {
            recurrente.operacionesGeneradas.push({
              mes,
              operacionId,
              vinculada: true
            });
            
            this.operacionesRecurrentesCache = operaciones;
          }
        }
        
        // TODO: Llamar a API real para persistir
        return void 0;
      }),
      delay(100)
    );
  }

  /**
   * Obtiene las operaciones generadas por una recurrente específica
   */
  getOperacionesGeneradas(recurrenteId: string): Observable<{ mes: string; operacionId: string; vinculada: boolean }[]> {
    return this.getOperacionById(recurrenteId).pipe(
      map(recurrente => recurrente?.operacionesGeneradas || [])
    );
  }

  /**
   * Verifica si una operación ya está vinculada a una recurrente
   */
  isOperacionVinculada(operacionId: string): Observable<boolean> {
    return this.getOperacionesRecurrentes().pipe(
      map(operaciones => {
        return operaciones.some(rec => 
          rec.operacionesGeneradas.some(og => og.operacionId === operacionId && og.vinculada)
        );
      })
    );
  }

  /**
   * Limpia el cache de operaciones recurrentes
   */
  clearCache(): void {
    this.operacionesRecurrentesCache = null;
  }

  /**
   * Refresca las operaciones recurrentes desde el servidor
   */
  refresh(): Observable<OperacionRecurrenteProgramada[]> {
    this.clearCache();
    return this.getOperacionesRecurrentes();
  }
}