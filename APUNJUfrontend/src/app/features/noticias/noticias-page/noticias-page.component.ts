import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoticiasService } from '../../../services/noticias/noticias.service';
import { Noticia } from '../../../interfaces/noticia.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-noticias-page',
  templateUrl: './noticias-page.component.html',
  styleUrls: ['./noticias-page.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class NoticiasPageComponent implements OnInit {
  noticias: Noticia[] = [];
  noticiasPaginadas: Noticia[] = [];
  
  // Paginación
  currentPage: number = 1;
  pageSize: number = 4;
  totalNoticias: number = 0;
  totalPages: number = 0;
  
  // Para el template
  Math = Math;

  constructor(
    private noticiasService: NoticiasService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarNoticias();
  }

  cargarNoticias(): void {
    this.noticiasService.obtenerTodasLasNoticias(this.currentPage, this.pageSize).subscribe({
      next: (response: any) => {
        this.noticiasPaginadas = response.noticias || [];
        this.totalNoticias = response.pagination.total;
        this.totalPages = response.pagination.totalPages;
      },
      error: (err: any) => {
        console.error('Error al obtener noticias', err);
      }
    });
  }

  updatePagination(): void {
    this.cargarNoticias();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cargarNoticias();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.cargarNoticias();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  verNoticia(noticia: Noticia) {
    this.router.navigate(['/noticias-detalle'], { queryParams: { id: noticia.id } });
    console.log('Navegando a detalle de noticia:', noticia.id);
  }

  onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.classList.add('loaded');
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/logoApunju.jpg';
    img.classList.add('loaded');
  }
}
