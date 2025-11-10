import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CarruselCardsNewsComponent } from "../noticias/carrusel-cards-news/carrusel-cards-news.component";
import { NoticiasService } from '../../services/noticias/noticias.service';
import { ActividadService } from '../../services/actividades/actividades.service';
import { Noticia } from '../../interfaces/noticia.interface';
import { OnDestroy } from '@angular/core';
import { Observable, forkJoin, Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';

interface Actividad {
  // Define the properties of an actividad here, adjust as needed
  [key: string]: any;
  tipo?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CarruselCardsNewsComponent, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  noticias: Noticia[] = [];
  noticiasFacebook: Noticia[] = [];
  noticiasManual: Noticia[] = [];
  actividades: Actividad[] = [];
  gruposActividades: Actividad[][] = [];
  private actividadesSubscription?: Subscription;

  constructor(private noticiasService: NoticiasService, private actividadService: ActividadService) { }

  ngOnInit(): void {
    this.noticiasService.obtenerTodasLasNoticias().subscribe(
      (response: Noticia[]) => {
        this.noticias = response.map((noticia: Noticia) => ({
          _id: noticia._id,
          titulo: noticia.titulo,
          message: noticia.message,
          imagenUrl: noticia.imagenUrl,
          link: noticia.link,
          origen: noticia.origen
        }));

        this.noticiasFacebook = this.noticias.filter((n: Noticia) => n.origen === 'facebook');
        this.noticiasManual = this.noticias.filter((n: Noticia) => n.origen === 'manual');
      },
      (error: any) => {
        console.error('Error al obtener las noticias:', error);
      }
    );

    // Cargar todas las actividades (talleres, cursos, capacitaciones)
    this.actividadesSubscription = forkJoin([
      this.actividadService.getTalleres() as Observable<Actividad[]>,
      this.actividadService.getCursos() as Observable<Actividad[]>,
      this.actividadService.getCapacitaciones() as Observable<Actividad[]>
    ]).subscribe({
      next: ([talleres, cursos, capacitaciones]: [Actividad[], Actividad[], Actividad[]]) => {
        // Puedes agregar un campo 'tipo' para distinguirlas si quieres
        this.actividades = [
          ...talleres.map((a: Actividad) => ({ ...a, tipo: 'Taller' })),
          ...cursos.map((a: Actividad) => ({ ...a, tipo: 'Curso' })),
          ...capacitaciones.map((a: Actividad) => ({ ...a, tipo: 'Capacitacion' }))
        ];
        this.actualizarGruposActividades();
      },
      error: (err: any) => console.error('Error al obtener actividades:', err)
    });
  }

  actualizarGruposActividades() {
    let size = 3;
    if (typeof window !== 'undefined' && window.innerWidth <= 576) {
      size = 1;
    }
    this.gruposActividades = [];
    for (let i = 0; i < this.actividades.length; i += size) {
      this.gruposActividades.push(this.actividades.slice(i, i + size));
    }
  }

  ngOnDestroy(): void {
    this.actividadesSubscription?.unsubscribe();
  }
}



