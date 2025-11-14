import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlanAhorrosService } from '../../../core/services/plan-ahorros.service';

@Component({
  selector: 'app-topes-gastos-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './topes-gastos-settings.component.html',
  styleUrls: ['./topes-gastos-settings.component.scss']
})
export class TopesGastosSettingsComponent implements OnInit {
  ingresoNeto: number = 0;
  topes = {
    cobrosAutomaticos: { tipo: 'porcentaje' as 'porcentaje' | 'fijo', valor: 10 },
    gastosHormiga: { tipo: 'porcentaje' as 'porcentaje' | 'fijo', valor: 10 },
    gastosMedios: { tipo: 'porcentaje' as 'porcentaje' | 'fijo', valor: 50 },
    gastosExcepcionales: { tipo: 'porcentaje' as 'porcentaje' | 'fijo', valor: 20 },
    cargaFinanciera: { tipo: 'porcentaje' as 'porcentaje' | 'fijo', valor: 30 }
  };

  constructor(
    private router: Router,
    private planService: PlanAhorrosService
  ) {}

  ngOnInit(): void {
    this.cargarTopes();
  }

  cargarTopes(): void {
    this.planService.getConfiguracion().subscribe(config => {
      this.ingresoNeto = config.ingresoNetoMensual;
      // Cargar topes desde configuración
    });
  }

  goBack(): void {
    this.router.navigate(['/plan-ahorros/configuracion']);
  }

  toggleTipo(categoria: keyof typeof this.topes): void {
    this.topes[categoria].tipo = this.topes[categoria].tipo === 'porcentaje' ? 'fijo' : 'porcentaje';
  }

  calcularMontoTope(categoria: keyof typeof this.topes): number {
    const tope = this.topes[categoria];
    if (tope.tipo === 'porcentaje') {
      return (this.ingresoNeto * tope.valor) / 100;
    }
    return tope.valor;
  }

  calcularIngresoLibre(): number {
    // Ingreso libre = Ingreso neto - gastos fijos (operaciones recurrentes)
    // Por ahora retornamos un valor estimado
    return this.ingresoNeto * 0.8; // Asumiendo 80% del ingreso es libre
  }

  guardarTopes(): void {
    this.planService.updateConfiguracion({
      topesMensuales: {
        cobrosAutomaticos: this.topes.cobrosAutomaticos.tipo === 'porcentaje' 
          ? { porcentaje: this.topes.cobrosAutomaticos.valor, montoFijo: undefined }
          : { porcentaje: undefined, montoFijo: this.topes.cobrosAutomaticos.valor },
        gastosHormiga: this.topes.gastosHormiga.tipo === 'porcentaje'
          ? { porcentaje: this.topes.gastosHormiga.valor, montoFijo: undefined }
          : { porcentaje: undefined, montoFijo: this.topes.gastosHormiga.valor },
        gastosMedios: this.topes.gastosMedios.tipo === 'porcentaje'
          ? { porcentaje: this.topes.gastosMedios.valor, montoFijo: undefined }
          : { porcentaje: undefined, montoFijo: this.topes.gastosMedios.valor },
        gastosExcepcionales: this.topes.gastosExcepcionales.tipo === 'porcentaje'
          ? { porcentaje: this.topes.gastosExcepcionales.valor, montoFijo: undefined }
          : { porcentaje: undefined, montoFijo: this.topes.gastosExcepcionales.valor },
        cargaFinanciera: this.topes.cargaFinanciera.tipo === 'porcentaje'
          ? { porcentaje: this.topes.cargaFinanciera.valor, montoFijo: undefined }
          : { porcentaje: undefined, montoFijo: this.topes.cargaFinanciera.valor },
        movimientosCaja: { porcentaje: undefined, montoFijo: undefined },
        operacionesRecurrentes: { porcentaje: undefined, montoFijo: undefined }
      }
    }).subscribe(() => {
      this.goBack();
    });
  }
}
