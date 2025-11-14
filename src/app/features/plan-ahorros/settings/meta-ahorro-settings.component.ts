import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlanAhorrosService } from '../../../core/services/plan-ahorros.service';
import { ConfiguracionPlan } from '../../../core/models/configuracion-plan.interface';

@Component({
  selector: 'app-meta-ahorro-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meta-ahorro-settings.component.html',
  styleUrls: ['./meta-ahorro-settings.component.scss']
})
export class MetaAhorroSettingsComponent implements OnInit {
  ingresoNeto: number = 0;
  ingresosLibres: number = 0;
  metaAhorro: number = 0;
  porcentajeAhorro: number = 0;
  showWarning: boolean = false;
  configuracion: ConfiguracionPlan | null = null;

  // Slider properties
  minMeta: number = 10;
  maxMeta: number = 0;

  constructor(
    private router: Router,
    private planService: PlanAhorrosService
  ) {}

  ngOnInit(): void {
    this.cargarConfiguracion();
  }

  cargarConfiguracion(): void {
    this.planService.getConfiguracion().subscribe(config => {
      this.configuracion = config;
      this.ingresoNeto = config.ingresoNetoMensual;
      this.metaAhorro = config.metaAhorro || 0;
      
      this.calcularIngresosLibres();
      this.maxMeta = this.ingresosLibres;
      
      // Si no hay meta configurada, establecer un valor inicial
      if (this.metaAhorro === 0) {
        this.metaAhorro = Math.min(this.minMeta, this.maxMeta);
      }
      
      this.calcularPorcentaje();
      this.checkWarning();
    });
  }

  calcularIngresosLibres(): void {
    // Calcular ingresos libres restando gastos fijos/recurrentes del ingreso neto
    // Por ahora, asumimos que los ingresos libres son el 40% del ingreso neto
    // En una implementación real, esto debería calcularse basándose en las operaciones recurrentes
    this.ingresosLibres = this.ingresoNeto * 0.4;
  }

  onSliderChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.metaAhorro = parseFloat(target.value);
    this.calcularPorcentaje();
    this.checkWarning();
  }

  calcularPorcentaje(): void {
    if (this.ingresosLibres > 0) {
      this.porcentajeAhorro = (this.metaAhorro / this.ingresosLibres) * 100;
    } else {
      this.porcentajeAhorro = 0;
    }
  }

  checkWarning(): void {
    // Mostrar advertencia si la meta es mayor al 50% de los ingresos libres
    this.showWarning = this.porcentajeAhorro > 50;
  }

  guardarMeta(): void {
    if (this.metaAhorro < this.minMeta) {
      alert('La meta de ahorro debe ser al menos S/ ' + this.minMeta);
      return;
    }

    if (this.metaAhorro > this.maxMeta) {
      alert('La meta de ahorro no puede ser mayor a tus ingresos libres');
      return;
    }

    this.planService.updateConfiguracion({ metaAhorro: this.metaAhorro }).subscribe(() => {
      this.goBack();
    });
  }

  goBack(): void {
    this.router.navigate(['/plan-ahorros/configuracion']);
  }

  get sliderPercentage(): number {
    if (this.maxMeta === this.minMeta) return 0;
    return ((this.metaAhorro - this.minMeta) / (this.maxMeta - this.minMeta)) * 100;
  }
}
