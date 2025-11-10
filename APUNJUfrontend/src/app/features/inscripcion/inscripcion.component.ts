import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ActividadService } from '../../services/actividades/actividades.service';
import { InscripcionService, DatosInscripcion } from '../../services/inscripcion/inscripcion.service';
import { ExcelNativoService } from '../../services/excel/lista-excel.service';
import { PagoComponent } from '../metodos-de-pago/pago/pago.component';
declare var bootstrap: any;

interface DatosInscripcionCompleto {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  dni: string;
  numeroAfiliado: string | undefined;
  tipoActividad: string;
  nombreActividad: string;
  fechaNacimiento: string;
  esAfiliado: boolean;
  actividadId: string;
  pagoId?: string;        // Optional property
  metodoDePago?: string;  // Optional property
}

@Component({
  selector: 'app-inscripcion',
  standalone: true,
  imports: [CommonModule, FormsModule, PagoComponent],
  templateUrl: './inscripcion.component.html',
  styleUrl: './inscripcion.component.css',
})
export class InscripcionComponent implements OnInit {
  // Estados del componente
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  showPaymentSection = false;
  inscripcionCompletada = false;
  datosValidos = false;
  // Estados de usuario
  usuarioLogueado: any = null;
  esAfiliado = false;
  datosAutocompletados = false;

  // Datos de la actividad
  actividad: any = null;
  tipoActividad = '';
  actividadId = '';

  // Datos del formulario
  datosInscripcion: DatosInscripcion = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    dni: '',
    fechaNacimiento: '',
    esAfiliado: false,
    numeroAfiliado: '',
    actividadId: ''
  };

  // Validaciones
  erroresValidacion: { [key: string]: string } = {};

  // Estados de validación en tiempo real
  emailValido = false;
  dniValido = false;
  telefonoValido = false;

  // Datos de pago
  datosInscripcionCreada: any = null;
  pago?: any;
  metodoDePago: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private actividadService: ActividadService,
    private inscripcionService: InscripcionService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.tipoActividad = params['tipo'];
      this.actividadId = params['id'];
      this.datosInscripcion.actividadId = this.actividadId;

      // Verificar usuario logueado ANTES de cargar actividad
      this.verificarUsuarioLogueado();
      this.cargarActividad();
    });
  }

  // =============== VERIFICACIÓN DE USUARIO (SIN SERVICIO) ===============
  verificarUsuarioLogueado(): void {
    try {
      // Verificar si hay un token y datos de usuario en localStorage
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('usuario');

      if (token && userData) {
        try {
          this.usuarioLogueado = JSON.parse(userData);
          console.log('Usuario logueado detectado:', this.usuarioLogueado);

          // Verificar si es afiliado
          this.esAfiliado = this.usuarioLogueado?.rol == "Afiliado" ? true : false;

          if (this.esAfiliado) {
            console.log('Usuario es afiliado, precargando datos...');
            this.precargarDatosAfiliado();
          } else {
            console.log('Usuario logueado pero no es afiliado');
            this.precargarDatosUsuario();
          }
        } catch (parseError) {
          console.error('Error parseando datos de usuario:', parseError);
          this.limpiarDatosUsuario();
        }
      } else {
        console.log('Usuario no logueado - será invitado');
        this.limpiarDatosUsuario();
      }

      // Establecer el tipo de inscripción
      this.datosInscripcion.esAfiliado = this.esAfiliado;

    } catch (error) {
      console.error('Error verificando usuario:', error);
      this.limpiarDatosUsuario();
    }
  }

  // Limpiar datos de usuario
  limpiarDatosUsuario(): void {
    this.usuarioLogueado = null;
    this.esAfiliado = false;
    this.datosAutocompletados = false;
    this.datosInscripcion.esAfiliado = false;
  }

  // Precargar datos básicos para usuarios no afiliados logueados

  // Validar campos precargados
  validarCamposPrecargados(): void {
    if (this.datosInscripcion.email) {
      this.validarEmail(this.datosInscripcion.email);
    }
    if (this.datosInscripcion.dni) {
      this.validarDNI(this.datosInscripcion.dni);
    }
    if (this.datosInscripcion.telefono) {
      this.validarTelefono(this.datosInscripcion.telefono);
    }
  }

  // =============== CARGA DE DATOS ===============
  cargarActividad(): void {
    this.isLoading = true;
    this.errorMessage = '';

    let observable;
    switch (this.tipoActividad.toLowerCase()) {
      case 'taller':
        observable = this.actividadService.getTallerById(this.actividadId);
        break;
      case 'curso':
        observable = this.actividadService.getCursoById(this.actividadId);
        break;
      case 'capacitacion':
        observable = this.actividadService.getCapacitacionById(this.actividadId);
        break;
      default:
        this.errorMessage = 'Tipo de actividad no válido';
        this.isLoading = false;
        return;
    }

    observable.subscribe({
      next: (data) => {
        this.actividad = data;
        this.isLoading = false;
        console.log('Actividad cargada:', data);
      },
      error: (error) => {
        console.error('Error cargando actividad:', error);
        this.errorMessage = 'No se pudo cargar la información de la actividad';
        this.isLoading = false;
      }
    });
  }

  // Recargar actividad después de inscripción exitosa
  recargarActividad(): void {
    console.log('Recargando actividad para actualizar cupos...');
    let observable;
    switch (this.tipoActividad.toLowerCase()) {
      case 'taller':
        observable = this.actividadService.getTallerById(this.actividadId);
        break;
      case 'curso':
        observable = this.actividadService.getCursoById(this.actividadId);
        break;
      case 'capacitacion':
        observable = this.actividadService.getCapacitacionById(this.actividadId);
        break;
      default:
        return;
    }

    observable.subscribe({
      next: (data) => {
        console.log('Actividad actualizada con nuevos cupos:', data);
        this.actividad = data;
      },
      error: (error) => {
        console.error('Error recargando actividad:', error);
      }
    });
  }

  // =============== VALIDACIONES ===============
  validarEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.emailValido = emailRegex.test(email);
    return this.emailValido;
  }

  validarDNI(dni: string): boolean {
    if (!dni) return false;
    const dniRegex = /^\d{7,8}$/;
    this.dniValido = dniRegex.test(dni);
    return this.dniValido;
  }

  validarTelefono(telefono: string): boolean {
    if (!telefono) return false;
    const telefonoRegex = /^\d{8,15}$/;
    const telefonoLimpio = telefono.replace(/\s+/g, '');
    this.telefonoValido = telefonoRegex.test(telefonoLimpio);
    return this.telefonoValido;
  }

  validarFormulario(): boolean {
    this.erroresValidacion = {};
    let esValido = true;

    // Validar nombre
    if (!this.datosInscripcion.nombre || this.datosInscripcion.nombre.trim().length < 2) {
      this.erroresValidacion['nombre'] = 'El nombre debe tener al menos 2 caracteres';
      esValido = false;
    }

    // Validar apellido
    if (!this.datosInscripcion.apellido || this.datosInscripcion.apellido.trim().length < 2) {
      this.erroresValidacion['apellido'] = 'El apellido debe tener al menos 2 caracteres';
      esValido = false;
    }

    // Validar email
    if (!this.datosInscripcion.email || !this.validarEmail(this.datosInscripcion.email)) {
      this.erroresValidacion['email'] = 'Email inválido';
      esValido = false;
    }

    // Validar teléfono
    if (!this.datosInscripcion.telefono || !this.validarTelefono(this.datosInscripcion.telefono)) {
      this.erroresValidacion['telefono'] = 'Teléfono inválido (8-15 dígitos)';
      esValido = false;
    }

    // Validar DNI
    if (!this.datosInscripcion.dni || !this.validarDNI(this.datosInscripcion.dni)) {
      this.erroresValidacion['dni'] = 'DNI inválido (7-8 dígitos)';
      esValido = false;
    }

    // Validar fecha de nacimiento
    if (!this.datosInscripcion.fechaNacimiento) {
      this.erroresValidacion['fechaNacimiento'] = 'Fecha de nacimiento requerida';
      esValido = false;
    } else {
      const fechaNac = new Date(this.datosInscripcion.fechaNacimiento);
      const hoy = new Date();
      const edad = hoy.getFullYear() - fechaNac.getFullYear();
      if (edad < 16 || edad > 100) {
        this.erroresValidacion['fechaNacimiento'] = 'Debe tener entre 16 y 100 años';
        esValido = false;
      }
    }

    // NO VALIDAR NÚMERO DE AFILIADO - se toma automáticamente del usuario logueado

    return esValido;
  }

  // =============== VERIFICACIÓN DE DUPLICADOS ===============
  verificarDuplicado(): Promise<boolean> {
    return new Promise((resolve) => {
      console.log(this.datosInscripcion.email, this.datosInscripcion.dni);

      this.inscripcionService.verificarDuplicado(
        this.datosInscripcion.email,
        this.datosInscripcion.dni,
        this.actividadId
      ).subscribe({
        next: (response) => {
          if (response.isDuplicate) {
            this.errorMessage = response.message;
            resolve(true);
          } else {
            resolve(false);
          }
        },
        error: (error) => {
          console.error('Error verificando duplicado:', error);
          this.errorMessage = error.error?.message || 'Error al verificar duplicado';
          resolve(true);
        }
      });
    });
  }

  async validarInscripcion(): Promise<void> {
    this.limpiarMensajes();
    // Verificar cupos disponibles
    if (!this.hayCuposDisponibles()) {
      this.errorMessage = this.getMensajeCupos();
      return;
    }

    // Validar formulario
    if (!this.validarFormulario()) {
      this.errorMessage = 'Por favor, corrija los errores en el formulario';
      return;
    }

    // Verificar duplicados
    const esDuplicado = await this.verificarDuplicado();
    if (esDuplicado) {
      return;
    }

    console.log("validando inscripcion")

    this.datosValidos = true;

    if (this.esAfiliado) {
      await this.procederInscripcion();
    }
    else {
      // For non-affiliates, show payment modal
      setTimeout(() => {
        const modalElement = document.getElementById('paymentModal');
        if (modalElement) {
          const modal = new bootstrap.Modal(modalElement, {
            backdrop: 'static',
            keyboard: false
          });
          modal.show();
        }
      }, 0);
    }
    return;
  }

  // =============== INSCRIPCIÓN ===============
  async procederInscripcion(): Promise<void> {
    this.isSaving = true;
    console.log("inscribiendo")
    // Limpiar y preparar datos
    const datosLimpios: DatosInscripcionCompleto = {
      ...this.datosInscripcion,
      email: this.datosInscripcion.email.trim().toLowerCase(),
      telefono: this.datosInscripcion.telefono.replace(/\s+/g, ''),
      dni: this.datosInscripcion.dni.trim(),
      numeroAfiliado: this.datosInscripcion.esAfiliado ? this.datosInscripcion.numeroAfiliado : undefined,
      tipoActividad: this.tipoActividad,
      nombreActividad: this.actividad?.nombreCurso || '',
      actividadId: this.actividadId,
      fechaNacimiento: this.datosInscripcion.fechaNacimiento
    };
    
    if (this.pago?._id) {
      datosLimpios.pagoId = this.pago._id;
      datosLimpios.metodoDePago = this.metodoDePago;
    }

    console.log('Datos enviados para inscripción:', datosLimpios);

    this.inscripcionService.crearInscripcion(datosLimpios).subscribe({
      next: (response) => {
        console.log('Inscripción creada:', response);
        this.datosInscripcionCreada = response.inscripcion;

        if (response.success) {
          // Recargar actividad para mostrar cupos actualizados
          this.recargarActividad();
          this.mostrarMensajeExito(response);
        }

        this.isSaving = false;
      },
      error: (error) => {
        console.error('Error en inscripción:', error);
        this.errorMessage = error.error?.message || 'Error al procesar la inscripción';
        this.isSaving = false;
      }
    });
  }

  async onPagoConfirmado(pago: any, metodoDePago: string): Promise<void> {
    console.log(this.datosValidos);
    this.pago = pago;
    this.metodoDePago = metodoDePago;
    const modal = document.getElementById('paymentModal');
    if (modal) {
      const modalInstance = bootstrap.Modal.getInstance(modal);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
    await this.procederInscripcion();
  }

  // =============== MANEJO DE RESULTADOS ===============
  mostrarMensajeExito(response: any): void {
    this.inscripcionCompletada = true;
    this.successMessage = `¡Felicitaciones! Te inscribiste exitosamente.`;
  }

  // =============== UTILIDADES ===============
  limpiarMensajes(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  getTipoActividadTexto(): string {
    switch (this.tipoActividad.toLowerCase()) {
      case 'taller': return 'Taller';
      case 'curso': return 'Curso';
      case 'capacitacion': return 'Capacitación';
      default: return 'Actividad';
    }
  }

  // Obtener texto del estado del usuario
  getEstadoUsuarioTexto(): string {
    if (!this.usuarioLogueado) {
      return 'Invitado - Se cobrará la inscripción';
    } else if (this.esAfiliado) {
      return 'Usuario afiliado - Inscripción gratuita';
    } else {
      return 'Usuario registrado - Se cobrará la inscripción';
    }
  }

  // Obtener clase CSS para el estado
  getEstadoUsuarioClase(): string {
    if (!this.usuarioLogueado) {
      return 'text-warning';
    } else if (this.esAfiliado) {
      return 'text-success';
    } else {
      return 'text-info';
    }
  }

  // Obtener ícono para el estado
  getEstadoUsuarioIcono(): string {
    if (!this.usuarioLogueado) {
      return 'bi-person-plus';
    } else if (this.esAfiliado) {
      return 'bi-shield-check';
    } else {
      return 'bi-person-check';
    }
  }

  // Verificar si hay cupos disponibles
  hayCuposDisponibles(): boolean {
    if (!this.actividad) return false;

    if (this.esAfiliado) {
      return this.actividad.cuposAfiliados > 0;
    } else {
      return this.actividad.cuposNoAfiliados > 0;
    }
  }

  // Obtener mensaje de cupos
  getMensajeCupos(): string {
    if (!this.actividad) return '';

    if (this.esAfiliado) {
      if (this.actividad.cuposAfiliados === 0) {
        return 'Sin cupos disponibles para afiliados';
      }
      return `${this.actividad.cuposAfiliados} cupos disponibles para afiliados`;
    } else {
      if (this.actividad.cuposNoAfiliados === 0) {
        return 'Sin cupos disponibles para no afiliados';
      }
      return `${this.actividad.cuposNoAfiliados} cupos disponibles para no afiliados`;
    }
  }

  // Verificar si el usuario puede inscribirse
  puedeInscribirse(): boolean {
    return this.hayCuposDisponibles() && this.actividad;
  }

  // Obtener texto del tipo de usuario
  getTipoUsuarioTexto(): string {
    if (!this.usuarioLogueado) {
      return 'Invitado';
    } else if (this.esAfiliado) {
      return 'Afiliado';
    } else {
      return 'Usuario Registrado';
    }
  }

  formatearPrecio(precio: number): string {
    if (!precio) return '$0';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(precio);
  }

  onImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/400x300/e9ecef/6c757d?text=Sin+Imagen';
  }

  volver(): void {
    // Construir la ruta basada en el tipo de actividad
    let ruta = '';

    switch (this.tipoActividad.toLowerCase()) {
      case 'taller':
        ruta = 'actividades/talleres';
        break;
      case 'curso':
        ruta = 'actividades/cursos';
        break;
      case 'capacitacion':
        ruta = 'actividades/capacitaciones';
        break;

    }

    console.log(`Navegando de vuelta a: ${ruta}`);
    this.router.navigate([ruta]);
  }

  nuevaInscripcion(): void {
    this.router.navigate([`/${this.tipoActividad}s`]);
  }

  // Método para ir al login
  irAlLogin(): void {
    const returnUrl = this.router.url;
    this.router.navigate(['/usuario/login'], { queryParams: { returnUrl } });
  }

  // Método para detectar cambios en el formulario
  onFormChange(): void {
    // Limpiar errores cuando el usuario empiece a escribir
    this.limpiarMensajes();
  }

  // Parsear fecha de nacimiento del backend
  parsearFechaNacimiento(fechaBackend: string | Date | null): string {
    if (!fechaBackend) return '';

    try {
      let fecha: Date;

      console.log('Fecha original del backend:', fechaBackend, 'Tipo:', typeof fechaBackend);

      if (typeof fechaBackend === 'string') {
        // Manejar el formato específico del backend (fNacimiento)
        if (fechaBackend.includes('/')) {
          // Formato DD/MM/YYYY del backend
          const partes = fechaBackend.split('/');
          if (partes.length === 3) {
            const dia = parseInt(partes[0], 10);
            const mes = parseInt(partes[1], 10) - 1; // Mes en JS es 0-indexed
            const año = parseInt(partes[2], 10);
            fecha = new Date(año, mes, dia);
            console.log('Fecha parseada desde DD/MM/YYYY:', fecha);
          } else {
            fecha = new Date(fechaBackend);
          }
        } else if (fechaBackend.includes('T')) {
          // Formato ISO: "2023-12-25T00:00:00.000Z"
          fecha = new Date(fechaBackend);
          console.log('Fecha parseada desde ISO:', fecha);
        } else if (fechaBackend.includes('-')) {
          // Formato YYYY-MM-DD
          fecha = new Date(fechaBackend);
          console.log('Fecha parseada desde YYYY-MM-DD:', fecha);
        } else {
          // Intentar parsear directamente
          fecha = new Date(fechaBackend);
          console.log('Fecha parseada directamente:', fecha);
        }
      } else {
        fecha = new Date(fechaBackend);
        console.log('Fecha parseada desde objeto Date:', fecha);
      }

      // Verificar que la fecha sea válida
      if (isNaN(fecha.getTime())) {
        console.error('Fecha inválida del backend:', fechaBackend);
        return '';
      }

      // Formatear para input HTML (YYYY-MM-DD)
      const año = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const dia = String(fecha.getDate()).padStart(2, '0');

      const fechaFormateada = `${año}-${mes}-${dia}`;
      console.log('Fecha final formateada para input:', fechaFormateada);

      return fechaFormateada;
    } catch (error) {
      console.error('Error parseando fecha de nacimiento:', error, fechaBackend);
      return '';
    }
  }

  // Precargar datos completos del usuario afiliado
  precargarDatosAfiliado(): void {
    if (!this.usuarioLogueado) return;

    console.log('Datos del usuario logueado:', this.usuarioLogueado);

    this.datosInscripcion = {
      nombre: this.usuarioLogueado.nombre || '',
      apellido: this.usuarioLogueado.apellido || '',
      email: this.usuarioLogueado.email || '',
      telefono: this.usuarioLogueado.telefono || '',
      dni: this.usuarioLogueado.dni || '',
      // CAMBIO: Usar fNacimiento en lugar de fechaNacimiento
      fechaNacimiento: this.parsearFechaNacimiento(this.usuarioLogueado.fNacimiento || this.usuarioLogueado.fechaNacimiento),
      esAfiliado: true,
      // CAMBIO: Usar legajo como número de afiliado
      numeroAfiliado: this.usuarioLogueado.legajo || this.usuarioLogueado.numeroAfiliado || '',
      actividadId: this.actividadId
    };

    this.datosAutocompletados = true;
    this.validarCamposPrecargados();

    console.log('Datos de afiliado precargados:', this.datosInscripcion);
  }

  // Precargar datos básicos para usuarios no afiliados logueados
  precargarDatosUsuario(): void {
    if (!this.usuarioLogueado) return;

    console.log('Datos del usuario no afiliado:', this.usuarioLogueado);

    this.datosInscripcion = {
      nombre: this.usuarioLogueado.nombre || '',
      apellido: this.usuarioLogueado.apellido || '',
      email: this.usuarioLogueado.email || '',
      telefono: this.usuarioLogueado.telefono || '',
      dni: this.usuarioLogueado.dni || '',
      // CAMBIO: Usar fNacimiento en lugar de fechaNacimiento
      fechaNacimiento: this.parsearFechaNacimiento(this.usuarioLogueado.fNacimiento || this.usuarioLogueado.fechaNacimiento),
      esAfiliado: false,
      numeroAfiliado: '',
      actividadId: this.actividadId
    };

    this.datosAutocompletados = true;
    this.validarCamposPrecargados();

    console.log('Datos de usuario no afiliado precargados:', this.datosInscripcion);
  }

}