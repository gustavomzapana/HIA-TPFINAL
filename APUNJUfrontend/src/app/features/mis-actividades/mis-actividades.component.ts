import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { InscripcionService } from '../../services/inscripcion/inscripcion.service';
import { AutenticacionService } from '../../services/autenticacion/autenticacion.service';
import { ApiReservaService } from '../../services/reservas/api-reserva.service';
import { ApiRecursoService } from '../../services/recursos/api-recurso.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mis-actividades',
  imports: [CommonModule, RouterModule],
  templateUrl: './mis-actividades.component.html',
  styleUrl: './mis-actividades.component.css'
})
export class MisActividadesComponent implements OnInit {
  userEmail: string = '';
  usuario: any = null;

  capacitaciones: any[] = [];
  cursos: any[] = [];
  talleres: any[] = [];
  reservas: any[] = [];
  reservaDetalles: any = [];
  recursos: any[] = [];

  cargandoCapacitaciones: boolean = false;
  cargandoCursos: boolean = false;
  cargandoTalleres: boolean = false;
  cargandoReservas: boolean = false;
  cargandoRecursos: boolean = false;
  totalCapacitaciones = 0;
  totalCursos = 0;
  totalTalleres = 0;
  totalReservas = 0;
  mostrarModalDetalles = false;
  mostrarModalDetallesReserva = false;
  actividadDetalles: any = null;

  constructor(private _apiAutenticacion: AutenticacionService, private _apiInscripcion: InscripcionService, private _apiReservas: ApiReservaService, private _apiRecurso: ApiRecursoService) {
    console.log('MisActividadesComponent constructor');
  }

  ngOnInit() {
    console.log('MisActividadesComponent initialized');
    this.usuario = this._apiAutenticacion.getUsuario();

    if (this.usuario && this.usuario.email) {

      this.userEmail = this.usuario.email;
      this.cargarReservasPorDNI(this.usuario.dni); // Cargar reservas por DNI
      this.cargarInscripciones();
    } else {
      console.log('Usuario no encontrado o email no disponible');
    }
  }

  cargarReservasPorDNI(dni: string) {
    this.cargandoReservas = true;
    this._apiReservas.getReservasPorDni(dni).subscribe({
      next: (reservas) => {
        this.reservas = reservas;
        this.totalReservas = reservas.length;
        this.cargandoReservas = false;
        console.log('Reservas:', this.reservas);
        document.body.classList.add('modal-open');
      },
      error: (error) => {
        console.error('Error fetching reservations:', error);
        this.cargandoReservas = false;
      }
    });
  }


  verDetallesReserva(reserva: any): void {
    this.reservaDetalles = reserva;
    this.mostrarModalDetallesReserva = true;
  }

  cerrarModalDetallesReserva(): void {
    this.mostrarModalDetallesReserva = false;
    this.reservaDetalles = null;
  }
  cargarRecursos() {
    this.cargandoRecursos = true;
    this._apiRecurso.getRecursos().subscribe({
      next: (recursos) => {
        this.recursos = recursos;
        this.cargandoRecursos = false;
        console.log('Recursos:', this.recursos);
      },
      error: (error) => {
        console.error('Error fetching resources:', error);
      }
    });
  }

  cargarInscripciones() {
    this.cargandoCapacitaciones = true;
    this.cargandoCursos = true;
    this.cargandoTalleres = true;

    this._apiInscripcion.obtenerInscripcionesUsuario(this.userEmail).subscribe({
      next: (inscripciones) => {

        console.log('Inscripciones:', inscripciones);
        this.organizarInscripciones(inscripciones);
        this.cargandoCapacitaciones = false;
        this.cargandoCursos = false;
        this.cargandoTalleres = false;
      },
      error: (error) => {
        console.error('Error fetching activities:', error);
        this.cargandoCapacitaciones = false;
        this.cargandoCursos = false;
        this.cargandoTalleres = false;
      }
    });
  }

  organizarInscripciones(inscripciones: any[]) {
    // Limpiar arrays
    this.capacitaciones = [];
    this.cursos = [];
    this.talleres = [];

    // Separar por tipo de actividad
    inscripciones.forEach(inscripcion => {
      const actividadData = inscripcion;

      switch (inscripcion.tipoActividad) {
        case 'Capacitacion':
          this.capacitaciones.push(actividadData);
          break;
        case 'Curso':
          this.cursos.push(actividadData);
          break;
        case 'Taller':
          this.talleres.push(actividadData);
          break;
      }
    });

    // Actualizar contadores
    this.totalCapacitaciones = this.capacitaciones.length;
    this.totalCursos = this.cursos.length;
    this.totalTalleres = this.talleres.length;
  }
  // ACTUALIZAR: Método para mostrar detalles
  verDetalles(capacitacion: any): void {
    console.log('Ver detalles de la capacitación:', capacitacion);
    this.actividadDetalles = capacitacion;
    this.mostrarModalDetalles = true;
    document.body.classList.add('modal-open');
  }

  // NUEVO: Método para cerrar modal de detalles
  cerrarModalDetalles(): void {
    this.mostrarModalDetalles = false;
    this.actividadDetalles = null;
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
  
  cancelarReserva(reserva: any): void {
    if (confirm(`¿Estás seguro de que deseas cancelar la reserva para el recurso "${reserva.resourceId?.nombre}"?`)) {
      this._apiReservas.eliminarReserva(reserva._id).subscribe({
        next: () => {
          alert('Reserva cancelada exitosamente.');
          this.cerrarModalDetallesReserva();
          this.cargarReservasPorDNI(this.usuario.dni); // Actualiza la lista de reservas
        },
        error: (error) => {
          console.error('Error al cancelar la reserva:', error);
          alert('Hubo un problema al cancelar la reserva. Intenta nuevamente.');
        }
      });
    }
  }
  onImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/400x300/e9ecef/6c757d?text=Sin+Imagen';
  }


}
