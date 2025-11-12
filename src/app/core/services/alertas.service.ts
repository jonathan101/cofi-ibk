import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';
import { Alert } from '../models/alert.interface';

/**
 * Servicio para gestionar alertas financieras
 * Implementa fallback automático a datos mock
 * 
 * Requirement 3: Gestión de alertas
 */
@Injectable({
  providedIn: 'root'
})
export class AlertasService {
  private readonly DATA_PATH = '/assets/data/DataEstatica/chat';
  
  // Cache de alertas
  private alertasCache: Alert[] | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de alertas
   * Requirement 3: Mostrar alertas sobre operaciones que comprometen el plan
   */
  getAlertas(): Observable<Alert[]> {
    if (this.alertasCache) {
      return of(this.alertasCache);
    }

    // TODO: Reemplazar con URL real de API cuando esté disponible
    // Por ahora, convertimos desde lista-alertas.json (MensajeUnificado) a Alert
    return this.http.get<any[]>(`${this.DATA_PATH}/lista-alertas.json`)
      .pipe(
        map(mensajes => {
          // Convertir de MensajeUnificado a Alert
          const alertasConvertidas = mensajes.map(msg => ({
            id: msg.id,
            title: msg.titulo || '',
            description: msg.subtitulo || '',
            severity: msg.severidad || 'info',
            amount: undefined,
            date: new Date(msg.timestamp),
            category: 'general',
            isRead: msg.leido || false,
            actionLabel: msg.textoBoton,
            actionUrl: undefined
          } as Alert));
          this.alertasCache = alertasConvertidas;
          return alertasConvertidas;
        }),
        catchError(() => {
          console.warn('Error cargando alertas, retornando array vacío');
          return of([]);
        })
      );
  }

  /**
   * Obtiene alertas filtradas por severidad
   */
  getAlertasBySeverity(severity: 'warning' | 'danger' | 'info'): Observable<Alert[]> {
    return this.getAlertas().pipe(
      map(alertas => alertas.filter(a => a.severity === severity))
    );
  }

  /**
   * Obtiene alertas filtradas por categoría
   */
  getAlertasByCategory(category: string): Observable<Alert[]> {
    return this.getAlertas().pipe(
      map(alertas => alertas.filter(a => a.category === category))
    );
  }

  /**
   * Marca una alerta como leída
   */
  markAsRead(alertId: string): Observable<void> {
    return this.getAlertas().pipe(
      map(alertas => {
        const alerta = alertas.find(a => a.id === alertId);
        if (alerta) {
          alerta.isRead = true;
          this.alertasCache = alertas;
        }
        
        // TODO: Llamar a API real para persistir cambio
        return void 0;
      }),
      delay(100)
    );
  }

  /**
   * Marca todas las alertas como leídas
   */
  markAllAsRead(): Observable<void> {
    return this.getAlertas().pipe(
      map(alertas => {
        alertas.forEach(a => a.isRead = true);
        this.alertasCache = alertas;
        
        // TODO: Llamar a API real para persistir cambios
        return void 0;
      }),
      delay(100)
    );
  }

  /**
   * Descarta una alerta (la elimina de la lista)
   */
  dismissAlert(alertId: string): Observable<void> {
    return this.getAlertas().pipe(
      map(alertas => {
        const index = alertas.findIndex(a => a.id === alertId);
        if (index !== -1) {
          alertas.splice(index, 1);
          this.alertasCache = alertas;
        }
        
        // TODO: Llamar a API real para persistir cambio
        return void 0;
      }),
      delay(100)
    );
  }

  /**
   * Obtiene el número de alertas no leídas
   */
  getUnreadCount(): Observable<number> {
    return this.getAlertas().pipe(
      map(alertas => alertas.filter(a => !a.isRead).length)
    );
  }

  /**
   * Obtiene alertas no leídas
   */
  getUnreadAlertas(): Observable<Alert[]> {
    return this.getAlertas().pipe(
      map(alertas => alertas.filter(a => !a.isRead))
    );
  }

  /**
   * Obtiene una alerta específica por ID
   */
  getAlertaById(alertId: string): Observable<Alert | undefined> {
    return this.getAlertas().pipe(
      map(alertas => alertas.find(a => a.id === alertId))
    );
  }

  /**
   * Limpia el cache de alertas
   */
  clearCache(): void {
    this.alertasCache = null;
  }

  /**
   * Refresca las alertas desde el servidor
   */
  refresh(): Observable<Alert[]> {
    this.clearCache();
    return this.getAlertas();
  }
}
