import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PlanAhorrosService } from '../../../core/services/plan-ahorros.service';
import { Chanchito } from '../../../core/models/chanchito.interface';

@Component({
  selector: 'app-chanchito-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chanchito-settings.component.html',
  styleUrls: ['./chanchito-settings.component.scss']
})
export class ChanchitoSettingsComponent implements OnInit {
  chanchitos: Chanchito[] = [];
  chanchitoSeleccionado: string | null = null;

  constructor(
    private router: Router,
    private planService: PlanAhorrosService
  ) {}

  ngOnInit(): void {
    this.cargarChanchitos();
  }

  cargarChanchitos(): void {
    this.planService.getChanchitos().subscribe(chanchitos => {
      this.chanchitos = chanchitos;
    });
  }

  goBack(): void {
    this.router.navigate(['/plan-ahorros/configuracion']);
  }

  seleccionarChanchito(id: string): void {
    this.chanchitoSeleccionado = id;
  }

  guardarSeleccion(): void {
    if (!this.chanchitoSeleccionado) {
      alert('Por favor selecciona un chanchito');
      return;
    }

    this.planService.setChanchitoPrincipal(this.chanchitoSeleccionado).subscribe(() => {
      this.goBack();
    });
  }

  agregarNuevoChanchito(): void {
    // TODO: Implementar navegación a pantalla de crear chanchito
    alert('Funcionalidad de agregar chanchito en desarrollo');
  }
}
