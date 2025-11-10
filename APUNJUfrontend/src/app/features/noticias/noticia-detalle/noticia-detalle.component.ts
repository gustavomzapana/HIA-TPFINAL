import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NoticiasService } from '../../../services/noticias/noticias.service';
import { Noticia } from '../../../interfaces/noticia.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-noticia-detalle',
  templateUrl: './noticia-detalle.component.html',
  styleUrls: ['./noticia-detalle.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class NoticiaDetalleComponent implements OnInit {
  noticia?: Noticia;
  cargaTerminada: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private noticiasService: NoticiasService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {const id = params['id']
        if (id) {
          this.noticiasService.obtenerNoticiaPorId(id).subscribe({
            next: (data: Noticia) => {
              this.noticia = data;
              this.cargaTerminada = true;
            },
            error: (err) => {
              console.error('Error al cargar noticia', err);
              this.cargaTerminada = true;
            }
          });
        } else {
          this.cargaTerminada = true;
        }
      });  
      }
      
}


