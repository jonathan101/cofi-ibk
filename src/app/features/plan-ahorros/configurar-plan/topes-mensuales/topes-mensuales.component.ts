import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlanAhorrosService } from '../../../../core/services/plan-ahorros.service';
import { ConfiguracionPlan } from '../../../../core/models/configuracion-plan.interface';

/**
 * Componente para configurar topes mensuales de todas las secciones
 * Requirement 46
 */
@Component({
  selector: 'app-topes-mensuales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './topes-mensuales.component.html',
  styleUrls: ['./topes-mensuales.component.scss']
})
export class TopesMensualesComponent implements OnInit {
  configuracion: ConfiguracionPlan | null = null;
  guardando: boolean = false;
  mensajeExito: string = '';

  // Tipos de tope para cada sección
  tipoTopeCobrosAutomaticos: 'porcentaje' | 'monto' | 'sin-tope' = 'porcentaje';
  tipoTopeGastosHormiga: 'porcentaje' | 'monto' | 'sin-tope' = 'porcentaje';
  tipoTopeGastosMedios: 'porcentaje' | 'monto' | 'sin-tope' = 'porcentaje';
  tipoTopeGastosExcepcionales: 'porcentaje' | 'monto' | 'sin-tope' = 'porcentaje';
  tipoTopeCargaFinanciera: 'porcentaje' | 'monto' | 'sin-tope' = 'porcentaje';
  tipoTopeMovimientosCaja: 'porcentaje' | 'monto' | 'sin-tope' = 'sin-tope';
  tipoTopeOperacionesRecurrentes: 'porcentaje' | 'monto' | 'sin-tope' = 'sin-tope';

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
        this.inicializarTiposTope();
      },
      error: (error) => {
        console.error('Error cargando configuración:', error);
      }
    });
  }

  inicializarTiposTope(): void {
    if (!this.configuracion) return;

    const topes = this.configuracion.topesMensuales;

    // Determinar tipo de tope para cada sección
    this.tipoTopeCobrosAutomaticos = this.determinarTipoTope(topes.cobrosAutomaticos);
    this.tipoTopeGastosHormiga = this.determinarTipoTope(topes.gastosHormiga);
    this.tipoTopeGastosMedios = this.determinarTipoTope(topes.gastosMedios);
    this.tipoTopeGastosExcepcionales = this.determinarTipoTope(topes.gastosExcepcionales);
    this.tipoTopeCargaFinanciera = this.determinarTipoTope(topes.cargaFinanciera);
    this.tipoTopeMovimientosCaja = this.determinarTipoTope(topes.movimientosCaja);
    this.tipoTopeOperacionesRecurrentes = this.determinarTipoTope(topes.operacionesRecurrentes);
  }

  determinarTipoTope(tope: { porcentaje?: number; montoFijo?: number }): 'porcentaje' | 'monto' | 'sin-tope' {
    if (tope.montoFijo !== undefined && tope.montoFijo !== null) {
      return 'monto';
    } else if (tope.porcentaje !== undefined && tope.porcentaje !== null) {
      return 'porcentaje';
    } else {
      return 'sin-tope';
    }
  }

  calcularMontoDesdePorcentaje(porcentaje: number): number {
    if (!this.configuracion) return 0;
    return (this.configuracion.ingresoNetoMensual * porcentaje) / 100;
  }

  onTipoTopeChange(seccion: string, tipo: 'porcentaje' | 'monto' | 'sin-tope'): void {
    if (!this.configuracion) return;

    const topes = this.configuracion.topesMensuales;
    const topeSeccion = (topes as any)[seccion];

    if (tipo === 'sin-tope') {
      topeSeccion.porcentaje = undefined;
      topeSeccion.montoFijo = undefined;
    } else if (tipo === 'porcentaje') {
      topeSeccion.montoFijo = undefined;
      if (topeSeccion.porcentaje === undefined) {
        topeSeccion.porcentaje = 10; // Valor por defecto
      }
    } else if (tipo === 'monto') {
      topeSeccion.porcentaje = undefined;
      if (topeSeccion.montoFijo === undefined) {
        topeSeccion.montoFijo = 400; // Valor por defecto
      }
    }
  }

  guardarConfiguracion(): void {
    if (!this.configuracion) return;

    this.guardando = true;
    this.mensajeExito = '';

    this.planService.actualizarConfiguracion(this.configuracion).subscribe({
      next: () => {
        this.guardando = false;
        this.mensajeExito = 'Topes mensuales guardados exitosamente';
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

  volver(): void {
    this.router.navigate(['/plan-ahorros/configurar']);
  }
}
