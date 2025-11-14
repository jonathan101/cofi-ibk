import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlanAhorrosService } from '../../../../core/services/plan-ahorros.service';
import { ConfiguracionPlan } from '../../../../core/models/configuracion-plan.interface';

/**
 * Componente para configurar clasificación de gastos individuales
 * Requirement 47
 */
@Component({
  selector: 'app-clasificacion-gastos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clasificacion-gastos.component.html',
  styleUrls: ['./clasificacion-gastos.component.scss']
})
export class ClasificacionGastosComponent implements OnInit {
  configuracion: ConfiguracionPlan | null = null;
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

  calcularTopeHormigaAutomatico(): number {
    if (!this.configuracion) return 0;
    const ingresoDiario = this.configuracion.ingresoNetoMensual / 30;
    // 20% del ingreso diario, redondeado a decena hacia abajo
    return Math.floor(ingresoDiario * 0.20 / 10) * 10;
  }

  calcularTopeMedioAutomatico(): number {
    if (!this.configuracion) return 0;
    const ingresoDiario = this.configuracion.ingresoNetoMensual / 30;
    // 50% del ingreso diario, redondeado a decena hacia abajo
    return Math.floor(ingresoDiario * 0.50 / 10) * 10;
  }

  onTopeHormigaChange(automatico: boolean): void {
    if (!this.configuracion) return;
    
    this.configuracion.clasificacionGastos.topeHormiga.automatico = automatico;
    
    if (automatico) {
      this.configuracion.clasificacionGastos.topeHormiga.montoManual = undefined;
    } else {
      // Inicializar con valor automático como sugerencia
      this.configuracion.clasificacionGastos.topeHormiga.montoManual = this.calcularTopeHormigaAutomatico();
    }
  }

  onTopeMedioChange(automatico: boolean): void {
    if (!this.configuracion) return;
    
    this.configuracion.clasificacionGastos.topeMedio.automatico = automatico;
    
    if (automatico) {
      this.configuracion.clasificacionGastos.topeMedio.montoManual = undefined;
    } else {
      // Inicializar con valor automático como sugerencia
      this.configuracion.clasificacionGastos.topeMedio.montoManual = this.calcularTopeMedioAutomatico();
    }
  }

  guardarConfiguracion(): void {
    if (!this.configuracion) return;

    this.guardando = true;
    this.mensajeExito = '';

    this.planService.actualizarConfiguracion(this.configuracion).subscribe({
      next: () => {
        this.guardando = false;
        this.mensajeExito = 'Clasificación de gastos guardada exitosamente';
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
