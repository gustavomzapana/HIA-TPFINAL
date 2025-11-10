import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoticiasService } from '../../../services/noticias/noticias.service';
import { Noticia } from '../../../interfaces/noticia.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-noticias-page',
  templateUrl: './noticias-page.component.html',
  styleUrls: ['./noticias-page.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class NoticiasPageComponent implements OnInit {
  noticias: Noticia[] = [];

  constructor(
    private noticiasService: NoticiasService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.noticiasService.obtenerTodasLasNoticias().subscribe({
      next: (data: Noticia[]) => {
        this.noticias = data.sort((a: Noticia, b: Noticia) =>
          new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        );
      },
      error: (err: any) => {
        console.error('Error al obtener noticias', err);
      }
    });
  }

  verNoticia(noticia: Noticia) {
    //this.router.navigate(['/noticias', noticia._id]);
    this.router.navigate(['/noticias-detalle'], { queryParams: { id: noticia._id } });
    console.log('Navegando a detalle de noticia:', noticia._id);
  }
}

