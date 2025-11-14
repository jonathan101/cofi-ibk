import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlanAhorrosService } from '../../../core/services/plan-ahorros.service';
import { ConfiguracionPlan } from '../../../core/models/configuracion-plan.interface';

@Component({
  selector: 'app-ingreso-neto-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ingreso-neto-settings.component.html',
  styleUrls: ['./ingreso-neto-settings.component.scss']
})
export class IngresoNetoSettingsComponent implements OnInit {
  ingresoNeto: number = 0;
  configuracion: ConfiguracionPlan | null = null;

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
    });
  }

  goBack(): void {
    this.router.navigate(['/plan-ahorros/configuracion']);
  }

  guardarIngreso(): void {
    if (this.ingresoNeto <= 0) {
      alert('Por favor ingresa un monto válido');
      return;
    }

    this.planService.updateConfiguracion({ ingresoNetoMensual: this.ingresoNeto }).subscribe(() => {
      this.goBack();
    });
  }

  showInfoIngresoNeto(): void {
    alert('El ingreso neto es el dinero que recibes después de impuestos y descuentos. Es el monto que realmente llega a tu cuenta.');
  }
}
