import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlanAhorrosService } from '../../../core/services/plan-ahorros.service';
import { ConfiguracionPlan } from '../../../core/models/configuracion-plan.interface';

/**
 * Componente de configuración manual del plan de ahorros
 * Requirements: 42, 43
 */
@Component({
  selector: 'app-configurar-plan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configurar-plan.component.html',
  styleUrls: ['./configurar-plan.component.scss']
})
export class ConfigurarPlanComponent implements OnInit {
  configuracion: ConfiguracionPlan | null = null;
  mesActual: string = 'Noviembre 2024';
  guardando: boolean = false;
  mensajeExito: string = '';

  constructor(
    private planService: PlanAhorrosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarConfiguracion();
  }

  cargarConfiguracion(): void {
    this.planService.getConfiguracion().subscribe({
      next: (config) => {
        this.configuracion = config;
      },
      error: (error) => {
        console.error('Error cargando configuración:', error);
      }
    });
  }

  guardarConfiguracion(): void {
    if (!this.configuracion) return;

    this.guardando = true;
    this.mensajeExito = '';

    // Actualizar fecha de vigencia al mes actual
    this.configuracion.fechaVigencia = new Date();
    this.configuracion.aplicaAMesesAnteriores = false;

    this.planService.actualizarConfiguracion(this.configuracion).subscribe({
      next: () => {
        this.guardando = false;
        this.mensajeExito = 'Configuración guardada exitosamente';
        setTimeout(() => {
          this.mensajeExito = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error guardando configuración:', error);
        this.guardando = false;
      }
    });
  }

  navegarATopesMensuales(): void {
    this.router.navigate(['/plan-ahorros/configurar/topes-mensuales']);
  }

  navegarAClasificacionGastos(): void {
    this.router.navigate(['/plan-ahorros/configurar/clasificacion-gastos']);
  }

  navegarAOperacionesRecurrentes(): void {
    this.router.navigate(['/plan-ahorros/operaciones-recurrentes']);
  }

  hablarConChicho(): void {
    this.router.navigate(['/chat']);
  }

  volver(): void {
    this.router.navigate(['/plan-ahorros']);
  }
}
