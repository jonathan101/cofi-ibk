import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';
import { Reward } from '../models/reward.interface';

/**
 * Servicio para gestionar recompensas y beneficios
 * Implementa fallback automático a datos mock
 * 
 * Requirement 5: Gestión de recompensas
 */
@Injectable({
  providedIn: 'root'
})
export class RecompensasService {
  private readonly DATA_PATH = '/assets/data/DataEstatica/chat';
  
  // Cache de recompensas
  private recompensasCache: Reward[] | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de recompensas
   * Requirement 5: Mostrar beneficios disponibles
   */
  getRecompensas(): Observable<Reward[]> {
    if (this.recompensasCache) {
      return of(this.recompensasCache);
    }

    // TODO: Reemplazar con URL real de API cuando esté disponible
    // Por ahora, convertimos desde lista-recompensas.json (MensajeUnificado) a Reward
    return this.http.get<any[]>(`${this.DATA_PATH}/lista-recompensas.json`)
      .pipe(
        map(mensajes => {
          // Convertir de MensajeUnificado a Reward
          const recompensasConvertidas = mensajes.map(msg => ({
            id: msg.id,
            title: msg.tituloRecompensa || '',
            description: msg.subtituloRecompensa || '',
            category: this.inferirCategoria(msg.tituloRecompensa),
            discount: undefined,
            conditions: msg.subtituloRecompensa || '',
            imageUrl: msg.imagenRecompensa,
            iconName: msg.iconoRecompensa,
            actionLabel: msg.textoBotonRecompensa || 'Ver más'
          } as Reward));
          this.recompensasCache = recompensasConvertidas;
          return recompensasConvertidas;
        }),
        catchError(() => {
          console.warn('Error cargando recompensas, retornando array vacío');
          return of([]);
        })
      );
  }

  /**
   * Infiere la categoría de una recompensa basándose en el título
   */
  private inferirCategoria(titulo: string): 'descuento' | 'promocion' | 'ampliacion-tc' | 'tipo-cambio' {
    const tituloLower = titulo.toLowerCase();
    if (tituloLower.includes('descuento')) return 'descuento';
    if (tituloLower.includes('ampliación') || tituloLower.includes('ampliacion') || tituloLower.includes('línea')) return 'ampliacion-tc';
    if (tituloLower.includes('tipo de cambio') || tituloLower.includes('cambio')) return 'tipo-cambio';
    return 'promocion';
  }

  /**
   * Obtiene recompensas filtradas por categoría
   * Requirement 5: Navegación entre categorías de beneficios
   */
  getRecompensasByCategory(category: 'descuento' | 'promocion' | 'ampliacion-tc' | 'tipo-cambio'): Observable<Reward[]> {
    return this.getRecompensas().pipe(
      map(recompensas => recompensas.filter(r => r.category === category))
    );
  }

  /**
   * Obtiene una recompensa específica por ID
   */
  getRecompensaById(rewardId: string): Observable<Reward | undefined> {
    return this.getRecompensas().pipe(
      map(recompensas => recompensas.find(r => r.id === rewardId))
    );
  }

  /**
   * Solicita un beneficio
   * En la PoC solo simula la acción
   */
  solicitarBeneficio(rewardId: string): Observable<void> {
    // TODO: Llamar a API real para solicitar el beneficio
    console.log(`Solicitando beneficio: ${rewardId}`);
    return of(void 0).pipe(delay(500));
  }

  /**
   * Obtiene recompensas destacadas (primeras 3)
   */
  getRecompensasDestacadas(): Observable<Reward[]> {
    return this.getRecompensas().pipe(
      map(recompensas => recompensas.slice(0, 3))
    );
  }

  /**
   * Busca recompensas por texto
   */
  searchRecompensas(query: string): Observable<Reward[]> {
    const queryLower = query.toLowerCase();
    return this.getRecompensas().pipe(
      map(recompensas => recompensas.filter(r => 
        r.title.toLowerCase().includes(queryLower) ||
        r.description.toLowerCase().includes(queryLower) ||
        r.conditions.toLowerCase().includes(queryLower)
      ))
    );
  }

  /**
   * Obtiene el número total de recompensas disponibles
   */
  getCount(): Observable<number> {
    return this.getRecompensas().pipe(
      map(recompensas => recompensas.length)
    );
  }

  /**
   * Obtiene el número de recompensas por categoría
   */
  getCountByCategory(): Observable<{ [key: string]: number }> {
    return this.getRecompensas().pipe(
      map(recompensas => {
        const counts: { [key: string]: number } = {
          'descuento': 0,
          'promocion': 0,
          'ampliacion-tc': 0,
          'tipo-cambio': 0
        };
        
        recompensas.forEach(r => {
          counts[r.category] = (counts[r.category] || 0) + 1;
        });
        
        return counts;
      })
    );
  }

  /**
   * Limpia el cache de recompensas
   */
  clearCache(): void {
    this.recompensasCache = null;
  }

  /**
   * Refresca las recompensas desde el servidor
   */
  refresh(): Observable<Reward[]> {
    this.clearCache();
    return this.getRecompensas();
  }
}
