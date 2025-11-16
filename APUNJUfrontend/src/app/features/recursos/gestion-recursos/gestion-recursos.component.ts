import { Component, OnInit } from '@angular/core';
import { ApiRecursoService } from '../../../services/recursos/api-recurso.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EventService } from '../../../shared/events/event.service';
import { Recurso } from '../../../interfaces/recurso.interface';

@Component({
  selector: 'app-gestion-recursos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './gestion-recursos.component.html',
  styleUrls: ['./gestion-recursos.component.css']
})
export class GestionRecursosComponent implements OnInit {
    recursos: Recurso[] = [];
    recursosFiltrados: Recurso[] = [];
    filtro: string = '';
    // Para manejo de imágenes
    imagenSeleccionada: File | null = null;
    isUploading: boolean = false;
    
    mostrarModal = false;
    isSaving = false;
    errorMessage = '';
    successMessage = '';
  
    recursoSeleccionado: Recurso | null = null;
    formulario: Partial<Recurso> = {
      nombre: '',
      ubicacion: '',
      caracteristicas: [],
      descripcion: '',
      imagen: '',
      capacidad: 2,
      precios: {
        afiliado: 0,
        noAfiliado: 0
      },
      estado: 'disponible'
    };
  
    imagenPreview: string | null = null;
  
    constructor(
    private apiRecursoService: ApiRecursoService,
    private eventService: EventService
  ) { }
  
    ngOnInit(): void {
      this.obtenerRecursos();
    }
  
    obtenerRecursos(): void {
      this.apiRecursoService.getRecursos().subscribe({
        next: (recursos) => {
          this.recursos = recursos;
          this.filtrarRecursos();
        },
        error: err => console.error('Error al obtener recursos', err)
      });
    }
  
    filtrarRecursos(): void {
      const texto = this.filtro.toLowerCase();
      this.recursosFiltrados = this.recursos.filter(r =>
        r.nombre.toLowerCase().includes(texto) || 
        r.descripcion.toLowerCase().includes(texto) ||
        r.ubicacion.toLowerCase().includes(texto)
      );
    }
  
    abrirModal(recurso?: Recurso): void {
      this.mostrarModal = true;
      this.recursoSeleccionado = recurso || null;
      this.formulario = recurso
        ? { ...recurso }
        : {
            nombre: '',
            ubicacion: '',
            caracteristicas: [],
            descripcion: '',
            imagen: '',
            capacidad: 2,
            precios: {
              afiliado: 0,
              noAfiliado: 0
            },
            estado: 'disponible'
          };
      this.imagenPreview = this.formulario.imagen || null;
    }
  
    cerrarModal(): void {
      this.mostrarModal = false;
      this.recursoSeleccionado = null;
      this.formulario = {
        nombre: '',
        ubicacion: '',
        caracteristicas: [],
        descripcion: '',
        imagen: '',
        capacidad: 2,
        precios: {
          afiliado: 0,
          noAfiliado: 0
        },
        estado: 'disponible'
      };
      this.imagenPreview = null;
    }
  
    guardarRecurso(): void {
      if (!this.formulario.nombre || !this.formulario.descripcion) {
        alert('Por favor complete los campos obligatorios');
        return;
      }
  
    this.isSaving = true;

    const obs = this.recursoSeleccionado
      ? this.apiRecursoService.updateRecurso(this.recursoSeleccionado.id!, this.formulario)
      : this.apiRecursoService.crearRecurso(this.formulario as Recurso);      obs.subscribe({
        next: () => {
          console.log("Imagen en guardar recurso: ",this.formulario.imagen);
          this.cerrarModal();
          this.obtenerRecursos();
          this.isSaving = false;
          this.eventService.actualizarRecursos(); // Emitir evento de actualización
        },
        error: ()=> {
          console.error('Error al guardar recurso');
          this.isSaving = false;
        }
      });
    }
  
    eliminarRecurso(recurso: Recurso): void {
      if (!confirm(`¿Seguro que desea eliminar el recurso "${recurso.nombre}"?`)) return;
  
      this.apiRecursoService.deleteRecurso(recurso.id!).subscribe({
        next: () => {
          this.eventService.actualizarRecursos(); // Emitir evento de actualización
          this.obtenerRecursos();
        },
        error: err => console.error('Error al eliminar recurso', err)
      });
    }
  
    getUsuarioActual() {
      return { nombre: 'Administrador', email: 'admin@apunju.org' };
    }
  

    onFileSelected(event: any): void {
      const file = event.target.files[0];
      if (file) {
  
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
          this.errorMessage = 'Solo se permiten archivos de imagen (JPG, PNG, GIF)';
          return;
        }
  
        // Validar tamaño (5MB máximo)
        if (file.size > 5 * 1024 * 1024) {
          this.errorMessage = 'La imagen no puede ser mayor a 5MB';
          return;
        }
  
        this.procesarYSubirImagen(file);
      }
    }
  
    // NUEVO: Procesar y subir imagen automáticamente
    private procesarYSubirImagen(file: File): void {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenPreview = e.target.result;
        this.imagenSeleccionada = file;
  
        // Subir imagen automáticamente
        this.subirImagen();
      };
      reader.readAsDataURL(file);
    }

    private subirImagen(): void {
      if (!this.imagenSeleccionada) return;

      this.isSaving = true;
  
      const formData = new FormData();
      formData.append('imagen', this.imagenSeleccionada);
  
      // VERIFICAR QUE LA URL SE ESTÁ CONSTRUYENDO CORRECTAMENTE
      console.log('FormData preparado:', formData.get('imagen'));
  
      this.apiRecursoService.subirImagen(formData).subscribe({
        next: (response) => {
          console.log('Imagen subida exitosamente:', response);
          this.formulario.imagen = response.url;
          console.log("Imagen en subir imagen: ",this.formulario.imagen);
          this.isSaving = false;
          this.successMessage = 'Imagen subida exitosamente';
        },
        error: (error) => {
          console.error('Error completo al subir imagen:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          console.error('URL que se intentó:', error.url);
          this.isSaving = false;
          this.errorMessage = `Error al subir la imagen: ${error.status} - ${error.message}`;
        }
      });
    }

    // Método para agregar características al formulario
    agregarCaracteristica(caracteristica: string): void {
      if (caracteristica && !this.formulario.caracteristicas?.includes(caracteristica)) {
        this.formulario.caracteristicas = [...(this.formulario.caracteristicas || []), caracteristica];
      }
    }

    // Método para eliminar características del formulario
    eliminarCaracteristica(caracteristica: string): void {
      this.formulario.caracteristicas = this.formulario.caracteristicas?.filter(c => c !== caracteristica) || [];
    }
}