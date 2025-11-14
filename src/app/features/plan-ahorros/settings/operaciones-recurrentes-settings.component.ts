import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlanAhorrosService } from '../../../core/services/plan-ahorros.service';
import { OperacionRecurrente } from '../../../core/models/operacion-recurrente.interface';

@Component({
  selector: 'app-operaciones-recurrentes-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './operaciones-recurrentes-settings.component.html',
  styleUrls: ['./operaciones-recurrentes-settings.component.scss']
})
export class OperacionesRecurrentesSettingsComponent implements OnInit {
  operacionesRecurrentes: OperacionRecurrente[] = [];
  showModal: boolean = false;
  operacionEditando: OperacionRecurrente | null = null;
  
  formData: {
    nombre: string;
    monto: number;
    categoria: string;
    diaDelMes: number;
    tipoProducto: 'TD' | 'TC';
  } = {
    nombre: '',
    monto: 0,
    categoria: '',
    diaDelMes: 1,
    tipoProducto: 'TD'
  };

  constructor(
    private router: Router,
    private planService: PlanAhorrosService
  ) {}

  ngOnInit(): void {
    this.cargarOperaciones();
  }

  cargarOperaciones(): void {
    this.planService.getOperacionesRecurrentes().subscribe(ops => {
      this.operacionesRecurrentes = ops;
    });
  }

  goBack(): void {
    this.router.navigate(['/plan-ahorros/configuracion']);
  }

  agregarOperacion(): void {
    this.operacionEditando = null;
    this.resetFormData();
    this.showModal = true;
  }

  editarOperacion(op: OperacionRecurrente): void {
    this.operacionEditando = op;
    this.formData = {
      nombre: op.nombre,
      monto: op.monto,
      categoria: op.categoria,
      diaDelMes: op.diaDelMes,
      tipoProducto: op.tipoProducto
    };
    this.showModal = true;
  }

  eliminarOperacion(id: string): void {
    if (confirm('¿Estás seguro de eliminar esta operación recurrente?')) {
      this.planService.deleteOperacionRecurrente(id).subscribe(() => {
        this.cargarOperaciones();
      });
    }
  }

  guardarOperacion(): void {
    // Validar datos
    if (!this.formData.nombre || !this.formData.categoria || this.formData.monto <= 0) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    if (this.formData.diaDelMes < 1 || this.formData.diaDelMes > 31) {
      alert('El día del mes debe estar entre 1 y 31');
      return;
    }

    if (this.operacionEditando) {
      // Editar operación existente
      const operacionActualizada: OperacionRecurrente = {
        ...this.operacionEditando,
        ...this.formData,
        activa: true
      };
      
      this.planService.updateOperacionRecurrente(this.operacionEditando.id, operacionActualizada).subscribe(() => {
        this.cargarOperaciones();
        this.cerrarModal();
      });
    } else {
      // Crear nueva operación
      const nuevaOperacion: OperacionRecurrente = {
        id: this.generateId(),
        ...this.formData,
        activa: true
      };
      
      this.planService.addOperacionRecurrente(nuevaOperacion).subscribe(() => {
        this.cargarOperaciones();
        this.cerrarModal();
      });
    }
  }

  cerrarModal(): void {
    this.showModal = false;
    this.operacionEditando = null;
    this.resetFormData();
  }

  private resetFormData(): void {
    this.formData = {
      nombre: '',
      monto: 0,
      categoria: '',
      diaDelMes: 1,
      tipoProducto: 'TD'
    };
  }

  private generateId(): string {
    return 'op-rec-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  getIconForCategory(categoria: string): string {
    const iconMap: { [key: string]: string } = {
      'Servicios': 'lightbulb',
      'Transferencias': 'swap_horiz',
      'Suscripciones': 'wifi',
      'Seguros': 'shield',
      'Otros': 'receipt_long'
    };
    return iconMap[categoria] || 'receipt_long';
  }

  getNombreOperacion(op: any): string {
    return (op as any).titulo || op.nombre || 'Sin nombre';
  }

  getIconForOperacion(op: any): string {
    // Si tiene categoría, usar el icono de categoría
    if (op.categoria) {
      return this.getIconForCategory(op.categoria);
    }
    
    // Si no, determinar por el título/nombre
    const nombre = this.getNombreOperacion(op).toLowerCase();
    if (nombre.includes('luz') || nombre.includes('enel')) return 'lightbulb';
    if (nombre.includes('agua') || nombre.includes('sedapal')) return 'water_drop';
    if (nombre.includes('internet') || nombre.includes('cable') || nombre.includes('claro')) return 'wifi';
    if (nombre.includes('transferencia')) return 'swap_horiz';
    if (nombre.includes('netflix') || nombre.includes('spotify') || nombre.includes('premium')) return 'subscriptions';
    if (nombre.includes('gimnasio') || nombre.includes('gym')) return 'fitness_center';
    if (nombre.includes('seguro')) return 'shield';
    if (nombre.includes('préstamo') || nombre.includes('cuota')) return 'payments';
    if (nombre.includes('alquiler')) return 'home';
    
    return 'receipt_long';
  }
}
