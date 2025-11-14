import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlanAhorrosService } from '../../../core/services/plan-ahorros.service';
import { ConfiguracionPlan } from '../../../core/models/configuracion-plan.interface';

@Component({
  selector: 'app-configuracion-gastos-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion-gastos-settings.component.html',
  styleUrls: ['./configuracion-gastos-settings.component.scss']
})
export class ConfiguracionGastosSettingsComponent implements OnInit {
  topeHormiga: number = 0;
  topeMedio: number = 0;
  configuracion: ConfiguracionPlan | null = null;
  
  // Flags para modo automático
  hormigaAutomatico: boolean = true;
  medioAutomatico: boolean = true;

  constructor(
    private router: Router,
    private planService: PlanAhorrosService
  ) {}

  ngOnInit(): void {
    this.cargarConfiguracion();
  }

  /**
   * Carga la configuración actual del plan
   */
  cargarConfiguracion(): void {
    this.planService.getConfiguracion().subscribe(config => {
      this.configuracion = config;
      
      // Cargar valores de clasificación de gastos
      if (config.clasificacionGastos) {
        this.hormigaAutomatico = config.clasificacionGastos.topeHormiga.automatico;
        this.medioAutomatico = config.clasificacionGastos.topeMedio.automatico;
        
        // Si es manual, cargar el monto
        if (!this.hormigaAutomatico && config.clasificacionGastos.topeHormiga.montoManual) {
          this.topeHormiga = config.clasificacionGastos.topeHormiga.montoManual;
        } else {
          // Calcular automático (20% del ingreso diario)
          this.topeHormiga = this.calcularTopeHormigaAutomatico(config.ingresoNetoMensual);
        }
        
        if (!this.medioAutomatico && config.clasificacionGastos.topeMedio.montoManual) {
          this.topeMedio = config.clasificacionGastos.topeMedio.montoManual;
        } else {
          // Calcular automático (50% del ingreso diario)
          this.topeMedio = this.calcularTopeMedioAutomatico(config.ingresoNetoMensual);
        }
      }
    });
  }

  /**
   * Calcula el tope hormiga automático (20% del ingreso diario)
   */
  calcularTopeHormigaAutomatico(ingresoMensual: number): number {
    const ingresoDiario = ingresoMensual / 30;
    return Math.round(ingresoDiario * 0.20 * 100) / 100;
  }

  /**
   * Calcula el tope medio automático (50% del ingreso diario)
   */
  calcularTopeMedioAutomatico(ingresoMensual: number): number {
    const ingresoDiario = ingresoMensual / 30;
    return Math.round(ingresoDiario * 0.50 * 100) / 100;
  }

  /**
   * Valida que los topes sean coherentes (hormiga < medio < excepcional)
   */
  validarTopes(): boolean {
    if (this.topeHormiga <= 0) {
      alert('El tope de gastos hormiga debe ser mayor a 0');
      return false;
    }
    
    if (this.topeMedio <= this.topeHormiga) {
      alert('El tope de gastos medios debe ser mayor al tope de gastos hormiga');
      return false;
    }
    
    return true;
  }

  /**
   * Guarda la configuración de categorización de gastos
   */
  guardarConfiguracion(): void {
    if (!this.validarTopes()) {
      return;
    }

    const actualizacion: Partial<ConfiguracionPlan> = {
      clasificacionGastos: {
        topeHormiga: {
          automatico: this.hormigaAutomatico,
          montoManual: this.hormigaAutomatico ? undefined : this.topeHormiga
        },
        topeMedio: {
          automatico: this.medioAutomatico,
          montoManual: this.medioAutomatico ? undefined : this.topeMedio
        }
      }
    };

    this.planService.updateConfiguracion(actualizacion).subscribe(() => {
      this.goBack();
    });
  }

  /**
   * Vuelve a la vista anterior
   */
  goBack(): void {
    this.router.navigate(['/plan-ahorros/configuracion']);
  }
}
