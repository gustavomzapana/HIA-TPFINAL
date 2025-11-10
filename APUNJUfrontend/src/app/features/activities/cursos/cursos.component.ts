import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActividadService } from '../../../services/actividades/actividades.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cursos.component.html',
  styleUrl: './cursos.component.css'
})
export class CursosComponent implements OnInit {
  cursos: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  usuario: any;
  
  // NUEVO: Modal de detalles
  mostrarModalDetalles = false;
  cursoDetalles: any = null;

  constructor(
    private actividadService: ActividadService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.cargarCursos();
  }

  cargarCursos(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.actividadService.getCursos().subscribe({
      next: (data) => {
        this.cursos = data || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar cursos:', error);
        this.cursos = [];
        this.isLoading = false;
        
        if (error.status === 500) {
          this.errorMessage = 'Error del servidor. Por favor, intenta más tarde.';
        } else if (error.status === 0) {
          this.errorMessage = 'No se puede conectar con el servidor.';
        } else {
          this.errorMessage = 'Error al cargar los cursos.';
        }
      }
    });
  }

  inscribirseEnCurso(cursoId: string): void {
    console.log('Inscribirse en curso:', cursoId);
    this.router.navigate(['/inscripcion'], { queryParams: { tipo: 'curso', id: cursoId } });
  }

  // ACTUALIZAR: Método para mostrar detalles
  verDetalles(curso: any): void {
    this.cursoDetalles = curso;
    this.mostrarModalDetalles = true;
    document.body.classList.add('modal-open');
  }

  // NUEVO: Método para cerrar modal de detalles
  cerrarModalDetalles(): void {
    this.mostrarModalDetalles = false;
    this.cursoDetalles = null;
    document.body.classList.remove('modal-open');
  }

  // NUEVOS: Métodos auxiliares
  getDuracionEnDias(fechaInicio: string, fechaFin: string): number {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diferencia = fin.getTime() - inicio.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  }

  getTotalCupos(curso: any): number {
    return (curso.cuposAfiliados || 0) + (curso.cuposNoAfiliados || 0);
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(precio);
  }

  getEstadoFechas(curso: any): { estado: string, clase: string, icono: string } {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaInicio = new Date(curso.fechaInicio);
    const fechaFin = new Date(curso.fechaFin);

    if (fechaFin < hoy) {
      return { estado: 'Finalizado', clase: 'text-muted', icono: 'bi-check-circle' };
    } else if (fechaInicio <= hoy && fechaFin >= hoy) {
      return { estado: 'En curso', clase: 'text-success', icono: 'bi-play-circle' };
    } else {
      return { estado: 'Próximamente', clase: 'text-info', icono: 'bi-clock' };
    }
  }

  onImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/400x300/e9ecef/6c757d?text=Sin+Imagen';
  }

  reintentar(): void {
    this.cargarCursos();
  }

  abrirGoogleForm(actividad: any) {
    const url = `https://docs.google.com/forms/d/e/1FAIpQLSfwcMf_Nshu42rKwq68YbhUxLflbBPjn0hVf0RJI8aadhUJNw/viewform?usp=sf_link
      &entry.111111=${encodeURIComponent(actividad.nombre)}
      &entry.222222=${encodeURIComponent(actividad.tipo)}
      &entry.333333=${encodeURIComponent(actividad._id)}`.replace(/\s+/g, '');
    window.open(url, '_blank');
  }
}