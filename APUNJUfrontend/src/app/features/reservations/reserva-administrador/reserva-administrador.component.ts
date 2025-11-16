import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CalendarioComponent } from '../calendario/calendario.component';
import { Recurso } from '../../../interfaces/recurso.interface';
import { Fecha } from '../../../interfaces/fecha';
import { ApiReservaService } from '../../../services/reservas/api-reserva.service';
import { ApiRecursoService } from '../../../services/recursos/api-recurso.service';
import { ApiFechaService } from '../../../services/fechas/api-fecha.service';
import { UsuarioService } from '../../../services/usuario/usuario.service';
import { ApiMpService } from '../../../services/pagos/api-mp.service';

declare var bootstrap: any;

@Component({
  selector: 'app-reserva-admin',
  standalone: true,
  imports: [CommonModule, CalendarioComponent, FormsModule, RouterLink],
  templateUrl: './reserva-administrador.component.html',
  styleUrl: './reserva-administrador.component.css'
})
export class ReservaAdministradorComponent implements OnInit, OnDestroy {
  @ViewChild(CalendarioComponent) calendarioComponent!: CalendarioComponent;

  recursos: Recurso[] = [];
  recursoSeleccionado: string = '';
  recursoSeleccionadoNombre: string = '';

  vistaActual: 'calendario' | 'reservas' = 'calendario';
  diasReservados: Date[] = [];
  diasSeleccionados: Fecha[] = [];
  reservasDetalladas: any[] = [];
  reservaSeleccionada: any = null;

  reservaEditando: any = null;
  usuarioSeleccionado: any = null;

  cargando = false;
  error = '';

  filtros = {
    dni: '',
    nombre: '',
    fechaDesde: '',
    fechaHasta: '',
    tipo: ''
  };

  pasoReserva: number = 1;
  busquedaDNI: string = '';
  usuarioParaReserva: any = null;
  usuarioNoEncontrado: boolean = false;
  metodoPago: string = '';
  errorReserva: string = '';
  modalReserva: any;
  errorCargaDias: string = '';
  private modal: any;
  reservasFiltradas: any[] = [];

  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 1;
  paginatedReservas: any[] = [];


  constructor(private _apiReserva: ApiReservaService, private _apiRecurso: ApiRecursoService, private _apiFecha: ApiFechaService, private _apiUsuarios: UsuarioService, private _apiPago: ApiMpService) { }

  ngOnInit(): void {
    this.getRecurso();
  }

  ngOnDestroy(): void {
    this.cerrarModal();
  }

  cargarRecursos(): void {
    this._apiRecurso.getRecursos().subscribe({
      next: (recursos: any) => this.recursos = recursos,
      error: (error) => console.error('Error al cargar recursos:', error)
    });
  }

  cargarDiasReservados(): void {
    if (!this.recursoSeleccionado) return;

    this.cargando = true;
    this.error = '';

    this._apiReserva.getReservasPorRecurso(this.recursoSeleccionado).subscribe({
      next: (response) => {
        const reservas = response.data || [];
        this.diasReservados = [];
        reservas.forEach((reserva: any) => {
          if (reserva.fechas?.length > 0) {
            reserva.fechas.forEach((fechaObj: any) => {
              this.diasReservados.push(new Date(fechaObj.fecha));
            });
          }
        });
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar días reservados:', error);
        this.cargando = false;
      }
    });
  }


  cargarReservasDetalladas(): void {
    if (!this.recursoSeleccionado) return;
    this.cargando = true;
    this.error = '';
    this._apiReserva.getReservasPorRecurso(this.recursoSeleccionado).subscribe({
      next: (response) => {
        console.log('Reservas obtenidas:', response);
        const reservas = response.data || [];
        this.reservasDetalladas = [];
        reservas.forEach((reserva: any) => {
          if (reserva.fechas?.length > 0) {
            reserva.fechas.forEach((fechaObj: any) => {
              const esBloqueo = reserva.estado === 'finalizada' && fechaObj.estado === 'bloqueado';
              const esAfiliado = !esBloqueo && reserva.userId?.esAfiliado;
              const recurso = this.recursos.find(r => r.id === Number(this.recursoSeleccionado));
              const precioDia = esBloqueo ? 0 : (esAfiliado ?
                recurso?.precios?.afiliado :
                recurso?.precios?.noAfiliado) || 0;
              this.reservasDetalladas.push({
                _id: reserva._id,
                fechaId: fechaObj._id,
                fecha: new Date(fechaObj.fecha),
                estadoFecha: fechaObj.estado,
                estadoReserva: reserva.estado,
                usuario: this.crearUsuario(reserva.userId, esBloqueo),
                metodoDePago: reserva.metodoDePago,
                pagoId: reserva.pagoId,
                tipo: esBloqueo ? 'bloqueo' : 'reserva',
                precioDia: precioDia,
              });
            });
          }
        });
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.error = 'Error al cargar reservas';
        this.cargando = false;
      }
    });
  }

  abrirModal(recurso: Recurso): void {
    this.recursoSeleccionado = String(recurso.id) || '';
    this.recursoSeleccionadoNombre = recurso.nombre;
    this.vistaActual = 'calendario';

    this.cargarDiasReservados();
    this.mostrarModal();
  }


  cambiarVista(vista: 'calendario' | 'reservas'): void {
    this.vistaActual = vista;
    if (vista === 'reservas') {
      console.log('Cargando reservas detalladas');
      this.cargarReservasDetalladas();
    }
  }

  refrescarDatos(): void {
    if (this.vistaActual === 'calendario') {
      this.cargarDiasReservados();
    } else {
      this.cargarReservasDetalladas();
    }
  }

  editarReserva(reserva: any): void {
    if (reserva.tipo === 'bloqueo') {
      alert('Los bloqueos administrativos no pueden ser editados desde aquí.');
      return;
    }

    this.reservaEditando = { ...reserva, usuario: { ...reserva.usuario } };
    this.abrirModalEdicion();
  }




  guardarCambiosReserva(): void {
    if (!this.reservaEditando) return;

    const datos = {
      estadoReserva: this.reservaEditando.estadoReserva,
      estadoFecha: this.reservaEditando.estadoFecha
    };
    this._apiReserva.editarReserva(this.reservaEditando._id, datos).subscribe({
      next: (response) => {
        this.cerrarModalEdicion();
        this.cargarReservasDetalladas();
        alert('Reserva actualizada correctamente');
        this.reservaEditando = null;
      },
      error: (error) => {
        alert('Error al actualizar la reserva. Intenta nuevamente.');
      }
    });
  }

  eliminarReserva(reserva: any): void {
    if (!confirm('¿Eliminar esta reserva?')) return;
    this.cargando = true;
    this._apiReserva.eliminarReserva(reserva._id).subscribe({
      next: () => {
        this.actualizarCalendario();
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudo eliminar la reserva';
        this.cargando = false;
      }
    });
  }

  cancelarEdicion(): void {
    this.reservaEditando = null;
  }

  onFechasSeleccionadas(fechas: Fecha[]): void {
    this.diasSeleccionados = fechas;
  }

  bloquearDiasSeleccionados(): void {
    if (!this.diasSeleccionados?.length) {
      this.errorCargaDias = 'No hay días seleccionados para bloquear';
      return;
    }

    if (!confirm('¿Estás seguro de que deseas bloquear los días seleccionados?')) return;

    this.cargando = true;
    this.errorCargaDias = '';

    // Convertir a formato de fecha que espera el servicio
    const fechas = this.diasSeleccionados.map((dia: any) => {
      // Si ya es un objeto Date, lo usamos directamente
      if (dia.fecha instanceof Date) {
        return dia.fecha;
      }
      // Si no, creamos un nuevo objeto Date
      return new Date(dia.fecha);
    });

    console.log('Datos enviados al servidor:', {
      recursoId: this.recursoSeleccionado,
      fechas: fechas
    });

    this._apiFecha.bloquearFecha(this.recursoSeleccionado, fechas).subscribe({
      next: (response) => {
        console.log('Respuesta exitosa:', response);
        this.actualizarCalendario();
        this.diasSeleccionados = [];
        this.cargando = false;
        alert('Días bloqueados correctamente');
      },
      error: (error) => {
        console.error('Error detallado:', error);
        this.errorCargaDias = `Error al bloquear fechas: ${error.message || error.statusText || 'Error del servidor'}`;
        this.cargando = false;
      },
      complete: () => {
        this.cargando = false;
      }
    });
  }

  reservarDiasSeleccionados(): void {
    if (!this.diasSeleccionados?.length) {
      this.errorCargaDias = 'No hay días seleccionados para reservar';
      return;
    }
    this.pasoReserva = 1;
    this.busquedaDNI = '';
    this.usuarioParaReserva = null;
    this.usuarioNoEncontrado = false;
    this.metodoPago = '';
    this.errorReserva = '';

    this.abrirModalReserva();
  }

  pasoSiguiente(): void {
    if (this.pasoReserva < 3) {
      this.pasoReserva++;
    }
  }
  pasoAnterior(): void {
    if (this.pasoReserva > 1) {
      this.pasoReserva--;
    }
  }

  buscarUsuarioPorDNI(): void {
    if (!this.busquedaDNI) {
      this.errorReserva = 'Por favor, ingresa un DNI válido.';
      return;
    }
    this.cargando = true;
    this.errorReserva = '';
    this.usuarioNoEncontrado = false;

    this._apiUsuarios.getUserByDni(this.busquedaDNI).subscribe({
      next: (response: any) => {
        this.usuarioParaReserva = response;
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error al buscar usuario por DNI:', error);
        this.usuarioNoEncontrado = true;
        this.usuarioParaReserva = null;
        this.cargando = false;
        this.errorReserva = 'Usuario no encontrado. Verifica el DNI e intenta nuevamente.';
      }
    });
  }
  calcularImporteTotal(): number {
    if (!this.diasSeleccionados || this.diasSeleccionados.length === 0) {
      return 0;
    }
    // Buscar el recurso actual
    const recurso = this.recursos.find(r => r.id === Number(this.recursoSeleccionado));
    if (!recurso) {
      return 0;
    }
    // Determinar si el usuario es afiliado
    const esAfiliado = this.usuarioParaReserva?.esAfiliado ?? false;
    // Precio por día según afiliación
    const precioDia = esAfiliado ? recurso.precios.afiliado : recurso.precios.noAfiliado;
    // Total = días seleccionados × precio diario
    return this.diasSeleccionados.length * precioDia;
  }

  confirmarReserva(): void {
    if (!this.diasSeleccionados?.length || !this.usuarioParaReserva || !this.metodoPago) {
      this.errorReserva = 'Faltan datos necesarios para reservar';
      return;
    }
    this.cargando = true;

    const fechas = this.diasSeleccionados.map((dia: any) => {
      if (dia.fecha instanceof Date) {
        return dia.fecha.toISOString();
      }
      return new Date(dia.fecha).toISOString();
    });

    this._apiPago.createPago({
      userId: this.usuarioParaReserva._id,
      importeTotal: this.calcularImporteTotal(),
      descripcion: `Reserva administrativa - ${this.recursoSeleccionadoNombre}`,
      estado: 'aprobado'
    }).subscribe({
      next: (pagoResponse: any) => {

        const pagoId = pagoResponse.data?._id || pagoResponse._id;;
        const reservaData = {
          resourceId: this.recursoSeleccionado,
          userId: this.usuarioParaReserva._id,
          pagoId: pagoId, // Usar el pago creado
          fechas: fechas,
          estado: 'pendiente',
          metodoDePago: this.metodoPago
        };

        this._apiReserva.crearReserva(reservaData).subscribe({
          next: () => {
            this.actualizarCalendario();
            this.diasSeleccionados = [];
            this.cargando = false;
            this.cerrarModalReserva();
            alert('Reserva creada correctamente');
          },
          error: (error) => {
            console.error('Error al crear reserva:', error);
            this.cargando = false;
            this.errorReserva = 'Error al crear la reserva. Intenta nuevamente.';
          }
        });
      },
      error: (error) => {
        console.error('Error al crear el pago:', error);
        this.cargando = false;
        this.errorReserva = 'Error al procesar el pago. Intenta nuevamente.';
      }
    });
  }



  aplicarFiltros(): void {
    let filtradas = [...this.reservasDetalladas];

    // Filtro por DNI
    if (this.filtros.dni.trim()) {
      filtradas = filtradas.filter(reserva =>
        reserva.usuario.dni.toLowerCase().includes(this.filtros.dni.toLowerCase())
      );
    }

    // Filtro por nombre
    if (this.filtros.nombre.trim()) {
      filtradas = filtradas.filter(reserva =>
        reserva.usuario.nombre.toLowerCase().includes(this.filtros.nombre.toLowerCase())
      );
    }

    // Filtro por fecha desde
    if (this.filtros.fechaDesde) {
      const fechaDesde = new Date(this.filtros.fechaDesde);
      filtradas = filtradas.filter(reserva =>
        reserva.fecha >= fechaDesde
      );
    }

    // Filtro por fecha hasta
    if (this.filtros.fechaHasta) {
      const fechaHasta = new Date(this.filtros.fechaHasta);
      fechaHasta.setHours(23, 59, 59, 999); // Incluir todo el día
      filtradas = filtradas.filter(reserva =>
        reserva.fecha <= fechaHasta
      );
    }

    // Filtro por tipo
    if (this.filtros.tipo) {
      filtradas = filtradas.filter(reserva =>
        reserva.tipo === this.filtros.tipo
      );
    }
    this.reservasFiltradas = filtradas;

    this.currentPage = 1;
    this.totalPages = Math.ceil(this.reservasFiltradas.length / this.itemsPerPage) || 1;
    this.updatePagination();
  }

  limpiarFiltros(): void {
    this.filtros = {
      dni: '',
      nombre: '',
      fechaDesde: '',
      fechaHasta: '',
      tipo: ''
    };
    this.currentPage = 1;
    this.aplicarFiltros();
  }

  private updatePagination(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedReservas = this.reservasFiltradas.slice(start, start + this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  get pages(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }

  verDetalleUsuario(usuario: any): void {
    if (usuario.nombre === 'ADMINISTRADOR') return;
    this.usuarioSeleccionado = usuario;
    this.abrirModalUsuario();
  }

  getEstadoFechaBadgeClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'confirmada': 'bg-success',
      'bloqueado': 'bg-danger',
      'pendiente': 'bg-warning text-dark'
    };
    return clases[estado?.toLowerCase()] || 'bg-info';
  }


  //METODOS PRIVADOS

  private crearUsuario(userId: any, esBloqueo: boolean) {
    if (esBloqueo) {
      return {
        nombre: 'ADMINISTRADOR',
        email: 'Bloqueo administrativo',
        dni: 'N/A',
        telefono: 'N/A',
        domicilio: 'N/A',
        esAfiliado: false
      };
    }
    return {
      nombre: userId ? `${userId.nombre} ${userId.apellido}` : 'Usuario del sistema',
      email: userId?.email || 'No especificado',
      dni: userId?.dni || 'No especificado',
      telefono: userId?.telefono || 'No especificado',
      domicilio: userId?.domicilio || 'No especificado',
      esAfiliado: userId?.esAfiliado || false
    };
  }

  private mostrarModal(): void {
    setTimeout(() => {
      const modalElement = document.getElementById('calendarioModal');
      if (modalElement) {
        this.modal = new bootstrap.Modal(modalElement);
        this.modal.show();
        modalElement.addEventListener('hidden.bs.modal', this.onModalHidden);
      }
    }, 50);
  }

  private abrirModalEdicion(): void {
    setTimeout(() => {
      const modalElement = document.getElementById('editarReservaModal');
      if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
      }
    }, 50);
  }

  private abrirModalUsuario(): void {
    const modalElement = document.getElementById('detalleUsuarioModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  private cerrarModalEdicion(): void {
    const modalElement = document.getElementById('editarReservaModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      modal?.hide();
    }
  }

  private cerrarModal(): void {
    if (this.modal) {
      this.modal.hide();
    }
    const modalElement = document.getElementById('calendarioModal');
    if (modalElement) {
      modalElement.removeEventListener('hidden.bs.modal', this.onModalHidden);
    }
  }

  private getRecurso(): void {
    this._apiRecurso.getRecursos().subscribe({
      next: (recursos: any) => {
        this.recursos = recursos;
      },
      error: (error) => {
        console.error('Error al obtener los recursos:', error);
      }
    });
  }

  private actualizarCalendario(): void {
    if (this.calendarioComponent && this.vistaActual === 'calendario') {
      setTimeout(() => this.calendarioComponent.cargarDisponibilidad(), 200);
    }

    if (this.vistaActual === 'reservas') {
      this.cargarReservasDetalladas();
    }
  }

  private onModalHidden = (): void => {
    this.diasSeleccionados = [];
  };

  private abrirModalReserva(): void {
    setTimeout(() => {
      const modalElement = document.getElementById('reservarModal');
      if (modalElement) {
        this.modalReserva = new bootstrap.Modal(modalElement);
        this.modalReserva.show();
      }
    }, 50);
  }

  cerrarModalReserva(): void {
    if (this.modalReserva) {
      this.modalReserva.hide();
    }
  }

}


