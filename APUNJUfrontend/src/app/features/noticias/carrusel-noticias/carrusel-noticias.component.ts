import { Component, OnInit } from '@angular/core';
import { NoticiasService } from '../../../services/noticias/noticias.service';
import { Noticia } from '../../../interfaces/noticia.interface';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-carrusel-noticias',
  templateUrl: './carrusel-noticias.component.html',
  styleUrls: ['./carrusel-noticias.component.css'],
  imports: [CommonModule, FormsModule,RouterModule],
})
export class CarruselNoticiasComponent implements OnInit {
  noticias: Noticia[] = [];
  isLoading: boolean = true;
  hasError: boolean = false;

  constructor(private noticiasService: NoticiasService) { }

  ngOnInit(): void {
    this.obtenerNoticiasParaCarrusel();
  }

  obtenerNoticiasParaCarrusel(): void {
    this.noticiasService.obtenerTodasLasNoticias(1, 20).subscribe({
      next: (response: any) => {
        this.noticias = response.noticias || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener noticias:', error);
        this.isLoading = false;
        this.hasError = true;
      }
    });
  }
}
