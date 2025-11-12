import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, forkJoin } from 'rxjs';
import { map, catchError, delay, switchMap } from 'rxjs/operators';
import { MensajeUnificado, ChatConfig, RespuestaEstatica } from '../models/mensaje-unificado.interface';

/**
 * Servicio para gestionar el chat con Chicho
 * Implementa lista unificada de mensajes (chat, alertas, recompensas)
 * Siempre retorna respuesta estática única
 * 
 * Requirements: 1, 2, 3, 4, 5
 */
@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly DATA_PATH = '/assets/data/DataEstatica/chat';
  
  // Configuración de filtros (por defecto todo visible)
  private chatConfigSubject = new BehaviorSubject<ChatConfig>({
    showAlerts: true,
    showRewards: true,
    showConversations: true
  });

  // Cache de mensajes
  private listaConversacionCache: MensajeUnificado[] | null = null;
  private listaAlertasCache: MensajeUnificado[] | null = null;
  private listaRecompensasCache: MensajeUnificado[] | null = null;
  private respuestaEstaticaCache: RespuestaEstatica | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Envía un mensaje del usuario y retorna respuesta estática
   * Requirement 2, 3: Siempre retorna la misma respuesta configurada
   */
  sendMessage(message: string): Observable<MensajeUnificado> {
    // Primero obtener la respuesta estática configurada
    return this.getRespuestaEstatica().pipe(
      map(respuesta => {
        // Crear mensaje de respuesta de Chicho
        const mensajeRespuesta: MensajeUnificado = {
          id: `msg-${Date.now()}`,
          tipo: 'chat',
          timestamp: new Date(),
          leido: true,
          texto: respuesta.respuestaIA,
          esIA: true
        };

        // TODO: En producción, llamar a API real para procesar el mensaje
        // return this.http.post<MensajeUnificado>(`${apiUrl}/chat`, { message });

        return mensajeRespuesta;
      }),
      delay(500) // Simular latencia de red
    );
  }

  /**
   * Obtiene la respuesta estática configurada
   */
  private getRespuestaEstatica(): Observable<RespuestaEstatica> {
    if (this.respuestaEstaticaCache) {
      return of(this.respuestaEstaticaCache);
    }

    return this.http.get<RespuestaEstatica>(`${this.DATA_PATH}/respuestas-estaticas.json`)
      .pipe(
        map(respuesta => {
          this.respuestaEstaticaCache = respuesta;
          return respuesta;
        }),
        catchError(() => {
          console.warn('Error cargando respuesta estática, usando respuesta por defecto');
          return of({
            respuestaIA: '¡Hola! Soy Chicho, tu asistente de ahorro. ¿En qué puedo ayudarte?'
          });
        })
      );
  }

  /**
   * Obtiene la lista unificada de mensajes (chat, alertas, recompensas)
   * Requirement 4: Combina los tres tipos de comunicación
   * Requirement 5: Aplica filtros de configuración
   */
  getListaUnificada(): Observable<MensajeUnificado[]> {
    const config = this.chatConfigSubject.value;
    
    // Cargar todas las listas en paralelo según configuración
    return forkJoin({
      conversaciones: config.showConversations ? this.getListaConversacion() : of([]),
      alertas: config.showAlerts ? this.getListaAlertas() : of([]),
      recompensas: config.showRewards ? this.getListaRecompensas() : of([])
    }).pipe(
      map(({ conversaciones, alertas, recompensas }) => {
        // Combinar todas las listas
        const mensajes: MensajeUnificado[] = [
          ...conversaciones,
          ...alertas,
          ...recompensas
        ];
        
        // Ordenar por timestamp (más reciente primero)
        return mensajes.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      })
    );
  }

  /**
   * Carga la lista de conversaciones
   */
  private getListaConversacion(): Observable<MensajeUnificado[]> {
    if (this.listaConversacionCache) {
      return of(this.listaConversacionCache);
    }

    return this.http.get<any[]>(`${this.DATA_PATH}/lista-conversacion.json`)
      .pipe(
        map(mensajes => {
          // Convertir timestamps de string a Date
          const mensajesConvertidos = mensajes.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          this.listaConversacionCache = mensajesConvertidos;
          return mensajesConvertidos;
        }),
        catchError(() => {
          console.warn('Error cargando lista de conversación');
          this.listaConversacionCache = [];
          return of([]);
        })
      );
  }

  /**
   * Carga la lista de alertas
   */
  private getListaAlertas(): Observable<MensajeUnificado[]> {
    if (this.listaAlertasCache) {
      return of(this.listaAlertasCache);
    }

    return this.http.get<any[]>(`${this.DATA_PATH}/lista-alertas.json`)
      .pipe(
        map(mensajes => {
          // Convertir timestamps de string a Date
          const mensajesConvertidos = mensajes.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          this.listaAlertasCache = mensajesConvertidos;
          return mensajesConvertidos;
        }),
        catchError(() => {
          console.warn('Error cargando lista de alertas');
          this.listaAlertasCache = [];
          return of([]);
        })
      );
  }

  /**
   * Carga la lista de recompensas
   */
  private getListaRecompensas(): Observable<MensajeUnificado[]> {
    if (this.listaRecompensasCache) {
      return of(this.listaRecompensasCache);
    }

    return this.http.get<any[]>(`${this.DATA_PATH}/lista-recompensas.json`)
      .pipe(
        map(mensajes => {
          // Convertir timestamps de string a Date
          const mensajesConvertidos = mensajes.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          this.listaRecompensasCache = mensajesConvertidos;
          return mensajesConvertidos;
        }),
        catchError(() => {
          console.warn('Error cargando lista de recompensas');
          this.listaRecompensasCache = [];
          return of([]);
        })
      );
  }

  /**
   * Actualiza la configuración de filtros del chat
   * Requirement 5: Configurar qué tipos de comunicación ver
   */
  updateChatConfig(config: ChatConfig): void {
    this.chatConfigSubject.next(config);
  }

  /**
   * Obtiene la configuración actual de filtros
   */
  getChatConfig(): Observable<ChatConfig> {
    return this.chatConfigSubject.asObservable();
  }

  /**
   * Obtiene el número de mensajes no leídos
   * Requirement 1: Badge de notificaciones
   */
  getUnreadCount(): Observable<number> {
    return this.getListaUnificada().pipe(
      map(mensajes => mensajes.filter(msg => !msg.leido).length)
    );
  }

  /**
   * Marca un mensaje como leído
   */
  markAsRead(messageId: string): Observable<void> {
    // Buscar en todas las listas
    const buscarYMarcar = (lista: MensajeUnificado[] | null) => {
      if (lista) {
        const mensaje = lista.find(msg => msg.id === messageId);
        if (mensaje) {
          mensaje.leido = true;
        }
      }
    };

    buscarYMarcar(this.listaConversacionCache);
    buscarYMarcar(this.listaAlertasCache);
    buscarYMarcar(this.listaRecompensasCache);

    // TODO: Llamar a API real para persistir cambio
    return of(void 0).pipe(delay(100));
  }

  /**
   * Marca todos los mensajes como leídos
   */
  markAllAsRead(): Observable<void> {
    const marcarLista = (lista: MensajeUnificado[] | null) => {
      if (lista) {
        lista.forEach(msg => msg.leido = true);
      }
    };

    marcarLista(this.listaConversacionCache);
    marcarLista(this.listaAlertasCache);
    marcarLista(this.listaRecompensasCache);

    // TODO: Llamar a API real para persistir cambios
    return of(void 0).pipe(delay(100));
  }

  /**
   * Limpia el cache de mensajes (útil para refresh)
   */
  clearCache(): void {
    this.listaConversacionCache = null;
    this.listaAlertasCache = null;
    this.listaRecompensasCache = null;
    this.respuestaEstaticaCache = null;
  }

  /**
   * Agrega un mensaje del usuario al historial
   * (Solo para UI, no persiste en PoC)
   */
  addUserMessage(texto: string): MensajeUnificado {
    const mensaje: MensajeUnificado = {
      id: `user-${Date.now()}`,
      tipo: 'chat',
      timestamp: new Date(),
      leido: true,
      texto,
      esIA: false
    };

    // Agregar al cache temporal
    if (this.listaConversacionCache) {
      this.listaConversacionCache.push(mensaje);
    }

    return mensaje;
  }

  /**
   * Agrega un mensaje de Chicho al historial
   * (Solo para UI, no persiste en PoC)
   */
  addChichoMessage(texto: string): MensajeUnificado {
    const mensaje: MensajeUnificado = {
      id: `chicho-${Date.now()}`,
      tipo: 'chat',
      timestamp: new Date(),
      leido: true,
      texto,
      esIA: true
    };

    // Agregar al cache temporal
    if (this.listaConversacionCache) {
      this.listaConversacionCache.push(mensaje);
    }

    return mensaje;
  }

  /**
   * Obtiene el historial de conversación (solo mensajes de chat)
   */
  getConversationHistory(): Observable<MensajeUnificado[]> {
    return this.getListaConversacion().pipe(
      map(mensajes => mensajes.filter(msg => msg.tipo === 'chat'))
    );
  }

  /**
   * Inicializa el servicio cargando todos los datos
   */
  initialize(): Observable<void> {
    // Cargar todas las listas en paralelo
    this.getListaConversacion().subscribe();
    this.getListaAlertas().subscribe();
    this.getListaRecompensas().subscribe();
    this.getRespuestaEstatica().subscribe();

    return of(void 0);
  }
}
