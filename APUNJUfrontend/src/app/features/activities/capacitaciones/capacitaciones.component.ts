import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActividadService } from '../../../services/actividades/actividades.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-capacitaciones',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './capacitaciones.component.html',
  styleUrl: './capacitaciones.component.css'
})
export class CapacitacionesComponent implements OnInit {
  capacitaciones: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  usuario: any;
  
  // NUEVO: Modal de detalles
  mostrarModalDetalles = false;
  capacitacionDetalles: any = null;

  constructor(
    private actividadService: ActividadService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.cargarCapacitaciones();
  }

  cargarCapacitaciones(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.actividadService.getCapacitaciones().subscribe({
      next: (data) => {
        this.capacitaciones = data || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar capacitaciones:', error);
        this.capacitaciones = [];
        this.isLoading = false;
        
        if (error.status === 500) {
          this.errorMessage = 'Error del servidor. Por favor, intenta más tarde.';
        } else if (error.status === 0) {
          this.errorMessage = 'No se puede conectar con el servidor.';
        } else {
          this.errorMessage = 'Error al cargar las capacitaciones.';
        }
      }
    });
  }

  inscribirseEnCapacitacion(capacitacionId: string): void {
    console.log('Inscribirse en capacitación:', capacitacionId);
    this.router.navigate(['/inscripcion'], { queryParams: { tipo: 'capacitacion', id: capacitacionId } });
  }

  // ACTUALIZAR: Método para mostrar detalles
  verDetalles(capacitacion: any): void {
    console.log('Ver detalles de la capacitación:', capacitacion);
    this.capacitacionDetalles = capacitacion;
    this.mostrarModalDetalles = true;
    document.body.classList.add('modal-open');
  }

  // NUEVO: Método para cerrar modal de detalles
  cerrarModalDetalles(): void {
    this.mostrarModalDetalles = false;
    this.capacitacionDetalles = null;
    document.body.classList.remove('modal-open');
  }

  // NUEVOS: Métodos auxiliares
  getDuracionEnDias(fechaInicio: string, fechaFin: string): number {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diferencia = fin.getTime() - inicio.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  }

  getTotalCupos(capacitacion: any): number {
    return (capacitacion.cuposAfiliados || 0) + (capacitacion.cuposNoAfiliados || 0);
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(precio);
  }

  getEstadoFechas(capacitacion: any): { estado: string, clase: string, icono: string } {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaInicio = new Date(capacitacion.fechaInicio);
    const fechaFin = new Date(capacitacion.fechaFin);

    if (fechaFin < hoy) {
      return { estado: 'Finalizado', clase: 'text-muted', icono: 'bi-check-circle' };
    } else if (fechaInicio <= hoy && fechaFin >= hoy) {
      return { estado: 'En curso', clase: 'text-success', icono: 'bi-play-circle' };
    } else {
      return { estado: 'Próximamente', clase: 'text-warning', icono: 'bi-clock' };
    }
  }

  getModalidadTexto(modalidad: string): string {
    if (!modalidad) return 'Presencial';
    return modalidad.charAt(0).toUpperCase() + modalidad.slice(1).toLowerCase();
  }

  onImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/400x300/e9ecef/6c757d?text=Sin+Imagen';
  }

  reintentar(): void {
    this.cargarCapacitaciones();
  }
}