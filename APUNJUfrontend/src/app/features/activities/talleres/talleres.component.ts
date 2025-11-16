import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActividadService } from '../../../services/actividades/actividades.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-talleres',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './talleres.component.html',
  styleUrl: './talleres.component.css'
})
export class TalleresComponent implements OnInit {
  talleres: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  usuario: any;
  
  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 4;
  totalTalleres: number = 0;
  totalPages: number = 0;
  talleresPaginados: any[] = [];
  
  // NUEVO: Modal de detalles
  mostrarModalDetalles = false;
  tallerDetalles: any = null;

  constructor(
    private actividadService: ActividadService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.cargarTalleres();
  }

  cargarTalleres(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.actividadService.getTalleres(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.talleresPaginados = response.talleres || [];
        this.totalTalleres = response.pagination.total;
        this.totalPages = response.pagination.totalPages;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar talleres:', error);
        this.talleresPaginados = [];
        this.isLoading = false;
        
        if (error.status === 500) {
          this.errorMessage = 'Error del servidor. Por favor, intenta más tarde.';
        } else if (error.status === 0) {
          this.errorMessage = 'No se puede conectar con el servidor.';
        } else {
          this.errorMessage = 'Error al cargar los talleres.';
        }
      }
    });
  }

  updatePagination(): void {
    this.cargarTalleres();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cargarTalleres();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.cargarTalleres();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  inscribirseEnTaller(tallerId: string): void {
    console.log('Inscribirse en taller:', tallerId);
    this.router.navigate(['/inscripcion'], { queryParams: { tipo: 'taller', id: tallerId } });
  }

  // ACTUALIZAR: Método para mostrar detalles
  verDetalles(taller: any): void {
    this.tallerDetalles = taller;
    this.mostrarModalDetalles = true;
    document.body.classList.add('modal-open');
  }

  // NUEVO: Método para cerrar modal de detalles
  cerrarModalDetalles(): void {
    this.mostrarModalDetalles = false;
    this.tallerDetalles = null;
    document.body.classList.remove('modal-open');
  }

  // NUEVOS: Métodos auxiliares
  getDuracionEnDias(fechaInicio: string, fechaFin: string): number {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diferencia = fin.getTime() - inicio.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  }

  getTotalCupos(taller: any): number {
    return (taller.cuposAfiliados || 0) + (taller.cuposNoAfiliados || 0);
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(precio);
  }

  getEstadoFechas(taller: any): { estado: string, clase: string, icono: string } {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaInicio = new Date(taller.fechaInicio);
    const fechaFin = new Date(taller.fechaFin);

    if (fechaFin < hoy) {
      return { estado: 'Finalizado', clase: 'text-muted', icono: 'bi-check-circle' };
    } else if (fechaInicio <= hoy && fechaFin >= hoy) {
      return { estado: 'En curso', clase: 'text-success', icono: 'bi-play-circle' };
    } else {
      return { estado: 'Próximamente', clase: 'text-primary', icono: 'bi-clock' };
    }
  }

  onImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/400x300/e9ecef/6c757d?text=Sin+Imagen';
  }

  reintentar(): void {
    this.cargarTalleres();
  }
}