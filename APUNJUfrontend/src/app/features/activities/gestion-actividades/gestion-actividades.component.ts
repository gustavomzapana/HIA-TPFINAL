import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExcelNativoService } from '../../../services/excel/lista-excel.service'; // AGREGAR
import { InscripcionService } from '../../../services/inscripcion/inscripcion.service'; // AGREGAR

import { ActividadService } from '../../../services/actividades/actividades.service';
import { AutenticacionService } from '../../../services/autenticacion/autenticacion.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gestion-actividades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-actividades.component.html',
  styleUrl: './gestion-actividades.component.css'
})
export class GestionActividadesComponent implements OnInit {
  // Estados del componente
  tipoSeleccionado: 'talleres' | 'cursos' | 'capacitaciones' = 'talleres';
  mostrarModal = false;

  // NUEVO: Modal de detalles
  mostrarModalDetalles = false;
  actividadDetalles: any = null;

  // Datos
  actividades: any[] = [];
  actividadSeleccionada: any = null;

  // Estados de carga
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  // NUEVO: Estados para generar Excel
  generandoExcel = false;
  errorExcel = '';

  // Filtros - ACTUALIZADO
  filtroTexto = '';
  filtroEstado = 'activos'; // CAMBIAR DEFAULT A 'activos'

  // Imagen - ACTUALIZADO
  imagenSeleccionada: File | null = null;
  imagenPreview: string | null = null;
  imagenUrlSubida: string | null = null; // NUEVO: URL de la imagen subida

  // NUEVO: Campos específicos para talleres
  materialesTaller: string[] = [];
  nuevoMaterial: string = '';

  // NUEVO: Campos específicos para capacitaciones
  modalidadCapacitacion: string = 'presencial';

  // Formulario - ACTUALIZADO
  formularioActividad = {
    imagen: '',
    nombreCurso: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: '',
    precioNoAfiliado: 0,
    activo: true,
    cuposAfiliados: 0,
    cuposNoAfiliados: 0,
    // NUEVO: Campos específicos
    materiales: [] as string[], // Para talleres
    modalidad: 'presencial' // Para capacitaciones
  };

  constructor(
    private inscripcionService: InscripcionService, // AGREGAR

    private actividadService: ActividadService,
    private excelNativoService: ExcelNativoService, // AGREGAR

    private autenticacionService: AutenticacionService,
    private router: Router
  ) { }

  generarExcelInscripciones(actividad: any): void {
    this.generandoExcel = true;
    this.errorExcel = '';
    this.limpiarMensajes();

    console.log('=== GENERAR EXCEL ===');
    console.log('Generando Excel para actividad:', actividad._id);

    this.inscripcionService.obtenerInscripcionesPorActividad(actividad._id).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);

        if (response.success && response.data && response.data.length > 0) {
          // Generar Excel usando el servicio nativo
          this.excelNativoService.generarExcelInscripciones(
            response.data,
            actividad.nombreCurso,
            this.getTipoActividadTexto()
          );

          // Mostrar mensaje de éxito con estadísticas
          this.successMessage = `Excel generado exitosamente: ${response.totalInscripciones} inscripción(es) - ${response.resumen.totalAfiliados} afiliados, ${response.resumen.totalNoAfiliados} no afiliados, ${response.resumen.totalPagados} pagos confirmados`;

          setTimeout(() => {
            this.successMessage = '';
          }, 5000);

        } else {
          this.errorMessage = 'No hay inscripciones para esta actividad';
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }

        this.generandoExcel = false;
      },
      error: (error) => {
        console.error('Error completo al obtener inscripciones:', error);

        let mensajeError = 'Error al generar el Excel de inscripciones';

        if (error.status === 404) {
          mensajeError = 'No se encontraron inscripciones para esta actividad.';
        } else if (error.status === 500) {
          mensajeError = 'Error del servidor. Intenta nuevamente.';
        } else if (error.error?.message) {
          mensajeError = error.error.message;
        }

        this.errorMessage = mensajeError;
        this.generandoExcel = false;

        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }





  // NUEVO: Verificar si hay inscriptos
  verificarInscriptos(actividad: any): void {



    this.inscripcionService.obtenerInscripcionesPorActividad(actividad._id).subscribe({
      next: (response) => {
        if (response.success) {
          const mensaje = `
Inscriptos en "${actividad.nombreCurso}":
• Total: ${response.totalInscripciones}
• Afiliados: ${response.resumen.totalAfiliados}
• No afiliados: ${response.resumen.totalNoAfiliados}
• Pagos confirmados: ${response.resumen.totalPagados}
• Pagos pendientes: ${response.resumen.totalPendientes}
• Monto total recaudado: $${response.resumen.montoTotal}
          `;
          alert(mensaje);
        }
      },
      error: (error) => {
        console.error('Error verificando inscriptos:', error);
        alert('Error al verificar inscriptos');
      }
    });
  }

  // NUEVO: Obtener texto del tipo de actividad
  private getTipoActividadTexto(): string {
    switch (this.tipoSeleccionado) {
      case 'talleres': return 'Taller';
      case 'cursos': return 'Curso';
      case 'capacitaciones': return 'Capacitación';
      default: return 'Actividad';
    }
  }


  ngOnInit(): void {
    if (this.autenticacionService.getRol() !== 'admin') {
      this.router.navigate(['/login']);
      return;
    }
    this.cargarActividades();
  }

  // NUEVO: Método para mostrar detalles
  verDetalles(actividad: any): void {
    this.actividadDetalles = actividad;
    this.mostrarModalDetalles = true;
    document.body.classList.add('modal-open');
  }

  // NUEVO: Método para cerrar modal de detalles
  cerrarModalDetalles(): void {
    this.mostrarModalDetalles = false;
    this.actividadDetalles = null;
    document.body.classList.remove('modal-open');
  }

  // NUEVO: Método para obtener duración en días
  getDuracionEnDias(fechaInicio: string, fechaFin: string): number {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diferencia = fin.getTime() - inicio.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  }

  // NUEVO: Método para obtener total de cupos
  getTotalCupos(actividad: any): number {
    return (actividad.cuposAfiliados || 0) + (actividad.cuposNoAfiliados || 0);
  }

  // NUEVO: Método para formatear precio
  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(precio);
  }

  // NUEVO: Método para obtener estado de fechas
  getEstadoFechas(actividad: any): { estado: string, clase: string, icono: string } {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaInicio = new Date(actividad.fechaInicio);
    const fechaFin = new Date(actividad.fechaFin);

    if (fechaFin < hoy) {
      return { estado: 'Finalizado', clase: 'text-muted', icono: 'bi-check-circle' };
    } else if (fechaInicio <= hoy && fechaFin >= hoy) {
      return { estado: 'En curso', clase: 'text-success', icono: 'bi-play-circle' };
    } else {
      return { estado: 'Próximamente', clase: 'text-primary', icono: 'bi-clock' };
    }
  }

  // NUEVO: Método para obtener progreso de cupos
  getProgresoCupos(actividad: any): { porcentaje: number, texto: string } {
    const totalCupos = this.getTotalCupos(actividad);
    if (totalCupos === 0) return { porcentaje: 0, texto: 'Sin cupos' };

    // Simulamos cupos ocupados (en un caso real vendría de inscripciones)
    const cuposOcupados = Math.floor(Math.random() * totalCupos);
    const porcentaje = (cuposOcupados / totalCupos) * 100;

    return {
      porcentaje: Math.round(porcentaje),
      texto: `${cuposOcupados}/${totalCupos} cupos ocupados`
    };
  }

  // =============== CARGA DE DATOS ===============
  cargarActividades(): void {
    this.isLoading = true;
    this.errorMessage = '';

    let observable;
    switch (this.tipoSeleccionado) {
      case 'talleres':
        observable = this.actividadService.getAllTalleres();
        break;
      case 'cursos':
        observable = this.actividadService.getAllCursos();
        break;
      case 'capacitaciones':
        observable = this.actividadService.getAllCapacitaciones();
        break;
    }

    observable.subscribe({
      next: (response: any) => {
        // Manejar respuesta paginada o directa
        if (response.talleres) {
          this.actividades = response.talleres || [];
        } else if (response.cursos) {
          this.actividades = response.cursos || [];
        } else if (response.capacitaciones) {
          this.actividades = response.capacitaciones || [];
        } else {
          this.actividades = response || [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar actividades:', error);
        this.errorMessage = 'Error al cargar las actividades';
        this.isLoading = false;
        this.actividades = [];
      }
    });
  }

  // =============== GESTIÓN DE MODAL ===============
  abrirModal(): void {
    this.mostrarModal = true;
    this.actividadSeleccionada = null;
    this.resetearFormulario();
    document.body.classList.add('modal-open');
  }

  editarActividad(actividad: any): void {
    this.mostrarModal = true;
    this.actividadSeleccionada = actividad;
    this.cargarFormulario(actividad);
    document.body.classList.add('modal-open');
  }

  // ACTUALIZAR el método cerrarModal existente
  cerrarModal(): void {
    this.mostrarModal = false;
    this.actividadSeleccionada = null;
    this.resetearFormulario();
    this.limpiarMensajes();
    // ACTUALIZAR: Solo remover si no hay otros modales abiertos
    if (!this.mostrarModalDetalles) {
      document.body.classList.remove('modal-open');
    }
  }

  // =============== GESTIÓN DE IMAGEN - ACTUALIZADO ===============
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.limpiarMensajes();

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Solo se permiten archivos de imagen (JPG, PNG, GIF)';
        this.resetearImagen();
        return;
      }

      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'La imagen no puede ser mayor a 5MB';
        this.resetearImagen();
        return;
      }

      // SOLO PREVIEW - NO SUBIR AUTOMÁTICAMENTE
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenPreview = e.target.result;
        this.imagenSeleccionada = file;
      };
      reader.readAsDataURL(file);
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

  // NUEVO: Subir imagen usando el endpoint separado
  private subirImagen(): void {
    if (!this.imagenSeleccionada) return;

    console.log('Subiendo imagen...');
    console.log('URL completa:', `${this.actividadService['apiUrl']}/subir-imagen`); // AGREGAR ESTE LOG
    this.isSaving = true;

    const formData = new FormData();
    formData.append('imagen', this.imagenSeleccionada);

    // VERIFICAR QUE LA URL SE ESTÁ CONSTRUYENDO CORRECTAMENTE
    console.log('FormData preparado:', formData.get('imagen'));

    this.actividadService.subirImagen(formData).subscribe({
      next: (response) => {
        console.log('Imagen subida exitosamente:', response);
        this.imagenUrlSubida = response.url;
        this.formularioActividad.imagen = response.url;
        this.successMessage = 'Imagen subida exitosamente';
        this.isSaving = false;

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error completo al subir imagen:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('URL que se intentó:', error.url);

        this.errorMessage = `Error al subir la imagen: ${error.status} - ${error.message}`;
        this.isSaving = false;
        this.resetearImagen();
      }
    });
  }

  // ACTUALIZADO: Resetear imagen
  private resetearImagen(): void {
    this.imagenSeleccionada = null;
    this.imagenPreview = null;
    this.imagenUrlSubida = null;
    // Limpiar el input file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  // =============== GESTIÓN DE MATERIALES (TALLERES) - NUEVO ===============
  agregarMaterial(): void {
    if (this.nuevoMaterial.trim()) {
      this.materialesTaller.push(this.nuevoMaterial.trim());
      this.formularioActividad.materiales = [...this.materialesTaller];
      this.nuevoMaterial = '';
    }
  }

  eliminarMaterial(index: number): void {
    this.materialesTaller.splice(index, 1);
    this.formularioActividad.materiales = [...this.materialesTaller];
  }

  // =============== CRUD OPERATIONS - ACTUALIZADO ===============
  guardarActividad(): void {
    if (!this.validarFormulario()) return;

    this.isSaving = true;
    this.limpiarMensajes();

    // Usar FormData como funcionaba antes
    const formData = new FormData();
    formData.append('nombreCurso', this.formularioActividad.nombreCurso.trim());
    formData.append('descripcion', this.formularioActividad.descripcion.trim());
    formData.append('fechaInicio', this.formularioActividad.fechaInicio);
    formData.append('fechaFin', this.formularioActividad.fechaFin);
    formData.append('precioNoAfiliado', this.formularioActividad.precioNoAfiliado.toString());
    formData.append('activo', this.formularioActividad.activo.toString());
    formData.append('cuposAfiliados', this.formularioActividad.cuposAfiliados.toString());
    formData.append('cuposNoAfiliados', this.formularioActividad.cuposNoAfiliados.toString());

    // Agregar campos específicos
    if (this.tipoSeleccionado === 'talleres') {
      formData.append('materiales', JSON.stringify(this.materialesTaller));
    } else if (this.tipoSeleccionado === 'capacitaciones') {
      formData.append('modalidad', this.modalidadCapacitacion);
    }

    // Agregar imagen si existe
    if (this.imagenSeleccionada) {
      formData.append('imagen', this.imagenSeleccionada);
    }

    console.log('Datos a enviar:', formData);

    this.procesarGuardadoConFormData(formData);
  }

  // ACTUALIZADO: Procesar guardado sin FormData
  private procesarGuardadoConFormData(formData: FormData): void {
    let observable;

    if (this.actividadSeleccionada) {
      // Para actualizar, necesitamos convertir FormData a objeto
      const actividadData: any = {};
      formData.forEach((value, key) => {
        if (key === 'materiales') {
          actividadData[key] = JSON.parse(value.toString());
        } else {
          actividadData[key] = value;
        }
      });

      const id = this.actividadSeleccionada._id;
      switch (this.tipoSeleccionado) {
        case 'talleres':
          observable = this.actividadService.updateTaller(id, actividadData);
          break;
        case 'cursos':
          observable = this.actividadService.updateCurso(id, actividadData);
          break;
        case 'capacitaciones':
          observable = this.actividadService.updateCapacitacion(id, actividadData);
          break;
      }
    } else {
      // Para crear, usar FormData
      switch (this.tipoSeleccionado) {
        case 'talleres':
          observable = this.actividadService.createTallerConImagen(formData);
          break;
        case 'cursos':
          observable = this.actividadService.createCursoConImagen(formData);
          break;
        case 'capacitaciones':
          observable = this.actividadService.createCapacitacionConImagen(formData);
          break;
      }
    }

    observable.subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        this.successMessage = `${this.getTipoCapitalizado().slice(0, -1)} ${this.actividadSeleccionada ? 'actualizado' : 'creado'} exitosamente`;
        this.isSaving = false;
        setTimeout(() => {
          this.cerrarModal();
          this.cargarActividades();
        }, 2000);
      },
      error: (error) => {
        console.error('Error al guardar actividad:', error);
        this.errorMessage = error.error?.message || 'Error al guardar la actividad';
        this.isSaving = false;
      }
    });
  }

  eliminarActividad(actividad: any): void {
    if (!confirm(`¿Estás seguro de eliminar "${actividad.nombreCurso}"?`)) return;

    this.isLoading = true;
    this.limpiarMensajes();

    let observable;
    switch (this.tipoSeleccionado) {
      case 'talleres':
        observable = this.actividadService.deleteTaller(actividad._id);
        break;
      case 'cursos':
        observable = this.actividadService.deleteCurso(actividad._id);
        break;
      case 'capacitaciones':
        observable = this.actividadService.deleteCapacitacion(actividad._id);
        break;
    }

    observable.subscribe({
      next: (response) => {
        this.successMessage = `${this.getTipoCapitalizado().slice(0, -1)} eliminado exitosamente`;
        this.cargarActividades();
      },
      error: (error) => {
        console.error('Error al eliminar actividad:', error);
        this.errorMessage = 'Error al eliminar la actividad';
        this.isLoading = false;
      }
    });
  }

  // =============== VALIDACIONES - ACTUALIZADO ===============
  validarFormulario(): boolean {
    console.log('Validando formulario...');
    this.limpiarMensajes();

    // Validaciones básicas
    if (!this.formularioActividad.nombreCurso.trim()) {
      this.errorMessage = 'El nombre del curso es obligatorio';
      return false;
    }

    if (this.formularioActividad.nombreCurso.trim().length < 3) {
      this.errorMessage = 'El nombre del curso debe tener al menos 3 caracteres';
      return false;
    }

    if (!this.formularioActividad.descripcion.trim()) {
      this.errorMessage = 'La descripción es obligatoria';
      return false;
    }

    if (this.formularioActividad.descripcion.trim().length < 10) {
      this.errorMessage = 'La descripción debe tener al menos 10 caracteres';
      return false;
    }

    if (!this.formularioActividad.fechaInicio) {
      this.errorMessage = 'La fecha de inicio es obligatoria';
      return false;
    }

    if (!this.formularioActividad.fechaFin) {
      this.errorMessage = 'La fecha de fin es obligatoria';
      return false;
    }

    if (this.formularioActividad.precioNoAfiliado < 0) {
      this.errorMessage = 'El precio no puede ser negativo';
      return false;
    }

    if (this.formularioActividad.cuposAfiliados < 0) {
      this.errorMessage = 'Los cupos para afiliados no pueden ser negativos';
      return false;
    }

    if (this.formularioActividad.cuposNoAfiliados < 0) {
      this.errorMessage = 'Los cupos para no afiliados no pueden ser negativos';
      return false;
    }

    if (this.formularioActividad.cuposAfiliados === 0 && this.formularioActividad.cuposNoAfiliados === 0) {
      this.errorMessage = 'Debe haber al menos un cupo disponible';
      return false;
    }

    // Validar fechas
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaInicio = new Date(this.formularioActividad.fechaInicio);
    const fechaFin = new Date(this.formularioActividad.fechaFin);

    if (fechaInicio < hoy) {
      this.errorMessage = 'La fecha de inicio no puede ser anterior a hoy';
      return false;
    }

    if (fechaFin <= fechaInicio) {
      this.errorMessage = 'La fecha de fin debe ser posterior a la fecha de inicio';
      return false;
    }

    // Validaciones específicas por tipo
    if (this.tipoSeleccionado === 'talleres') {
      if (this.materialesTaller.length === 0) {
        this.errorMessage = 'Debe agregar al menos un material para el taller';
        return false;
      }
    }

    console.log('Formulario válido');
    return true;
  }

  // =============== UTILIDADES - ACTUALIZADO ===============
  resetearFormulario(): void {
    this.formularioActividad = {
      imagen: '',
      nombreCurso: '',
      descripcion: '',
      fechaInicio: '',
      fechaFin: '',
      precioNoAfiliado: 0,
      activo: true,
      cuposAfiliados: 0,
      cuposNoAfiliados: 0,
      materiales: [],
      modalidad: 'presencial'
    };
    this.imagenSeleccionada = null;
    this.imagenPreview = null;
    this.imagenUrlSubida = null;
    this.materialesTaller = [];
    this.nuevoMaterial = '';
    this.modalidadCapacitacion = 'presencial';
  }

  limpiarFormulario(): void {
    this.resetearFormulario();
    this.limpiarMensajes();
  }

  cargarFormulario(actividad: any): void {
    this.formularioActividad = {
      imagen: actividad.imagen || '',
      nombreCurso: actividad.nombreCurso || '',
      descripcion: actividad.descripcion || '',
      fechaInicio: actividad.fechaInicio ? this.formatearFecha(actividad.fechaInicio) : '',
      fechaFin: actividad.fechaFin ? this.formatearFecha(actividad.fechaFin) : '',
      precioNoAfiliado: actividad.precioNoAfiliado || 0,
      activo: actividad.activo !== false,
      cuposAfiliados: actividad.cuposAfiliados || 0,
      cuposNoAfiliados: actividad.cuposNoAfiliados || 0,
      materiales: actividad.materiales || [],
      modalidad: actividad.modalidad || 'presencial'
    };

    // Cargar campos específicos
    this.materialesTaller = actividad.materiales || [];
    this.modalidadCapacitacion = actividad.modalidad || 'presencial';

    if (actividad.imagen) {
      this.imagenPreview = actividad.imagen;
      this.imagenUrlSubida = actividad.imagen;
    }
  }

  cambiarTipo(tipo: 'talleres' | 'cursos' | 'capacitaciones'): void {
    this.tipoSeleccionado = tipo;
    this.limpiarMensajes();
    this.cargarActividades();
  }

  // =============== FILTROS - ACTUALIZADO ===============
  get actividadesFiltradas(): any[] {
    let resultado = [...this.actividades];

    // Filtrar por texto
    if (this.filtroTexto.trim()) {
      const texto = this.filtroTexto.toLowerCase();
      resultado = resultado.filter(actividad =>
        actividad.nombreCurso?.toLowerCase().includes(texto) ||
        actividad.descripcion?.toLowerCase().includes(texto)
      );
    }

    // Filtrar por estado - ACTUALIZADO
    if (this.filtroEstado === 'activos') {
      resultado = resultado.filter(actividad => actividad.activo === true);
    } else if (this.filtroEstado === 'inactivos') {
      resultado = resultado.filter(actividad => actividad.activo === false);
    }
    // Si filtroEstado === 'todos', no filtrar por estado

    return resultado;
  }

  limpiarMensajes(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // ACTUALIZADO: Limpiar filtros con nuevo default
  limpiarFiltros(): void {
    this.filtroTexto = '';
    this.filtroEstado = 'activos'; // CAMBIAR DEFAULT A 'activos'
  }

  getTipoCapitalizado(): string {
    return this.tipoSeleccionado.charAt(0).toUpperCase() + this.tipoSeleccionado.slice(1);
  }

  getBadgeClass(activo: boolean): string {
    return activo ? 'badge bg-success' : 'badge bg-secondary';
  }

  getEstadoTexto(activo: boolean): string {
    return activo ? 'Activo' : 'Inactivo';
  }

  getUsuarioActual(): any {
    return this.autenticacionService.getUsuario();
  }

  getFechaMinima(): string {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toISOString().split('T')[0];
  }

  onImageError(event: any): void {
    console.log('Error al cargar imagen:', event.target.src);
    // Usar una imagen por defecto de un servicio confiable
    event.target.src = 'https://via.placeholder.com/60x60/e9ecef/6c757d?text=Sin+Imagen';
  }
}