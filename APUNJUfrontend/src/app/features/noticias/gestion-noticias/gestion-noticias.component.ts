import { Component, OnInit } from '@angular/core';
import { NoticiasService } from '../../../services/noticias/noticias.service';
import { Noticia } from '../../../interfaces/noticia.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-gestion-noticias',
  templateUrl: './gestion-noticias.component.html',
  styleUrls: ['./gestion-noticias.component.css'],
  imports: [CommonModule, FormsModule]
})
export class GestionNoticiasComponent implements OnInit {
  noticias: Noticia[] = [];
  noticiasFiltradas: Noticia[] = [];
  filtro: string = '';

  imagenSeleccionada: File | null = null;
  isUploading: boolean = false;
  isSyncing: boolean = false; // NUEVO: estado para sincronización

  mostrarModal = false;
  isSaving = false;

  noticiaSeleccionada: Noticia | null = null;
  formulario: Noticia = {
    titulo: '',
    message: '',
    link: '',
    imagenUrl: ''
  };

  imagenPreview: string | null = null;

  constructor(private noticiasService: NoticiasService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.obtenerNoticias();
  }

  obtenerNoticias(): void {
    this.noticiasService.obtenerTodasLasNoticias(1, 1000).subscribe({
      next: (response: any) => {
        this.noticias = response.noticias || [];
        this.filtrarNoticias();
      },
      error: err => console.error('Error al obtener noticias', err)
    });
  }

  filtrarNoticias(): void {
    const texto = this.filtro.toLowerCase();
    this.noticiasFiltradas = this.noticias.filter(n =>
      n.titulo.toLowerCase().includes(texto) || n.message.toLowerCase().includes(texto)
    );
  }

  abrirModal(noticia?: Noticia): void {
    this.mostrarModal = true;
    this.noticiaSeleccionada = noticia || null;
    this.formulario = noticia
      ? { ...noticia }
      : { titulo: '', message: '', link: '', imagenUrl: '' };
    this.imagenPreview = this.formulario.imagenUrl || null;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.noticiaSeleccionada = null;
    this.formulario = { titulo: '', message: '', link: '', imagenUrl: '' };
    this.imagenPreview = null;
  }

  guardarNoticia(): void {
    if (!this.formulario.titulo || !this.formulario.message) return;

    this.isSaving = true;

    const obs = this.noticiaSeleccionada
      ? this.noticiasService.actualizarNoticia(this.noticiaSeleccionada.id!, this.formulario)
      : this.noticiasService.crearNoticia(this.formulario);

    obs.subscribe({
      next: () => {
        this.cerrarModal();
        this.obtenerNoticias();
        this.isSaving = false;
      },
      error: err => {
        console.error('Error al guardar noticia', err);
        this.isSaving = false;
      }
    });
  }

  eliminarNoticia(noticia: Noticia): void {
    if (!confirm(`¿Seguro que deseas eliminar la noticia "${noticia.titulo}"?`)) return;

    this.noticiasService.eliminarNoticia(noticia.id!).subscribe({
      next: () => this.obtenerNoticias(),
      error: err => console.error('Error al eliminar noticia', err)
    });
  }

  getUsuarioActual() {
    return { nombre: 'Administrador', email: 'admin@apunju.org' };
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result as string;
      };
      reader.readAsDataURL(file);

      this.isUploading = true;
      const formData = new FormData();
      formData.append('imagen', file);

      this.noticiasService.subirImagen(formData).subscribe({
        next: (resp) => {
          this.formulario.imagenUrl = resp.url;
          this.isUploading = false;
        },
        error: () => {
          alert('Error al subir la imagen');
          this.isUploading = false;
          this.imagenPreview = null;
        }
      });
    }
  }

  // ✅ NUEVO: Sincronizar publicaciones desde Facebook
  sincronizarNoticiasFacebook(): void {
    this.isSyncing = true;

    this.noticiasService.sincronizarFacebook().subscribe({
      next: (resp) => {
        const nuevas = resp?.nuevas || 0;

        if (nuevas > 0) {
          this.toastr.success(`Se sincronizaron ${nuevas} nuevas noticia(s).`, '¡Sincronización exitosa!');
        } else {
          this.toastr.info('No hay nuevas noticias. Ya están sincronizadas.', 'Sin novedades');
        }

        this.obtenerNoticias();
        this.isSyncing = false;
      },
      error: (err) => {
        console.error('Error al sincronizar publicaciones:', err);
        this.toastr.error('No se pudo sincronizar publicaciones de Facebook.', 'Error');
        this.isSyncing = false;
      }
    });
  }
}

