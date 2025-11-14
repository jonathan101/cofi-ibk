import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RecompensasService } from '../../core/services/recompensas.service';
import { Reward } from '../../core/models/reward.interface';
import { RecompensaCategoryComponent } from '../../shared/components/recompensa-category/recompensa-category.component';
import { PromocionCardComponent } from '../../shared/components/promocion-card/promocion-card.component';
import { SidebarMenuComponent } from '../../shared/components/sidebar-menu/sidebar-menu.component';
import { PullDownHandleComponent } from '../../shared/components/pull-down-handle/pull-down-handle.component';

/**
 * Componente principal de Recompensas
 * Requirement 5: Vista de recompensas y beneficios con categorías
 */
@Component({
  selector: 'app-recompensas',
  standalone: true,
  imports: [CommonModule, RecompensaCategoryComponent, PromocionCardComponent, SidebarMenuComponent, PullDownHandleComponent],
  templateUrl: './recompensas.component.html',
  styleUrl: './recompensas.component.scss'
})
export class RecompensasComponent implements OnInit {
  recompensas: Reward[] = [];
  recompensasDestacadas: Reward[] = [];
  recompensasPorCategoria: { [key: string]: Reward[] } = {
    'descuento': [],
    'promocion': [],
    'ampliacion-tc': [],
    'tipo-cambio': []
  };
  categoriasColapsadas: { [key: string]: boolean } = {
    'descuento': false,
    'promocion': false,
    'ampliacion-tc': false,
    'tipo-cambio': false
  };
  loading = true;
  totalRecompensas = 0;
  showSidebar = false;

  constructor(
    private recompensasService: RecompensasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarRecompensas();
  }

  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
  }

  closeSidebar(): void {
    this.showSidebar = false;
  }

  cargarRecompensas(): void {
    this.loading = true;
    
    // Cargar todas las recompensas
    this.recompensasService.getRecompensas().subscribe({
      next: (recompensas) => {
        this.recompensas = recompensas;
        this.totalRecompensas = recompensas.length;
        this.organizarRecompensasPorCategoria();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando recompensas:', error);
        this.loading = false;
      }
    });
    
    // Cargar recompensas destacadas
    this.recompensasService.getRecompensasDestacadas().subscribe({
      next: (destacadas) => {
        this.recompensasDestacadas = destacadas;
      },
      error: (error) => {
        console.error('Error cargando recompensas destacadas:', error);
      }
    });
  }

  organizarRecompensasPorCategoria(): void {
    this.recompensasPorCategoria = {
      'descuento': [],
      'promocion': [],
      'ampliacion-tc': [],
      'tipo-cambio': []
    };
    
    this.recompensas.forEach(recompensa => {
      if (this.recompensasPorCategoria[recompensa.category]) {
        this.recompensasPorCategoria[recompensa.category].push(recompensa);
      }
    });
  }

  toggleCategoria(categoria: string): void {
    this.categoriasColapsadas[categoria] = !this.categoriasColapsadas[categoria];
  }

  isCategoriaColapsada(categoria: string): boolean {
    return this.categoriasColapsadas[categoria];
  }

  solicitarBeneficio(rewardId: string): void {
    this.recompensasService.solicitarBeneficio(rewardId).subscribe({
      next: () => {
        console.log('Beneficio solicitado:', rewardId);
        // TODO: Mostrar mensaje de éxito o navegar a página de confirmación
      },
      error: (error) => {
        console.error('Error solicitando beneficio:', error);
      }
    });
  }

  refrescar(): void {
    this.cargarRecompensas();
  }

  getCategoriasConRecompensas(): ('descuento' | 'promocion' | 'ampliacion-tc' | 'tipo-cambio')[] {
    return Object.keys(this.recompensasPorCategoria).filter(
      categoria => this.recompensasPorCategoria[categoria].length > 0
    ) as ('descuento' | 'promocion' | 'ampliacion-tc' | 'tipo-cambio')[];
  }

  getRecompensasPorCategoria(categoria: string): Reward[] {
    return this.recompensasPorCategoria[categoria] || [];
  }

  /**
   * Maneja el evento de arrastrar hacia abajo para volver al home
   */
  onPullDown(): void {
    this.router.navigate(['/home']);
  }
}
