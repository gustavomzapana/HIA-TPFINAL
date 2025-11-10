import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ConditionsReservaComponent } from "../conditions-reserva/conditions.component";
import { CalendarioComponent } from '../calendario/calendario.component';
import { PagoComponent } from '../../metodos-de-pago/pago/pago.component';
import { Reserva } from '../../../interfaces/reserva';
import { Usuario } from '../../../interfaces/usuario.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { EventService } from '../../../shared/events/event.service';
import { Fecha } from '../../../interfaces/fecha';
import { ApiReservaService } from '../../../services/reservas/api-reserva.service';
import { Recurso } from '../../../interfaces/recurso.interface';
import { ApiRecursoService } from '../../../services/recursos/api-recurso.service';
import { CommonModule } from '@angular/common';
import { log } from 'node:console';
import { ComprobanteComponent } from '../comprobante/comprobante.component';
import { DescuentoEnPlanillaComponent } from "../../metodos-de-pago/descuento-en-planilla/descuento-en-planilla.component";

@Component({
  selector: 'app-reserva',
  standalone: true,
  imports: [CalendarioComponent, ConditionsReservaComponent, PagoComponent, ComprobanteComponent, CommonModule, RouterLink, DescuentoEnPlanillaComponent],
  templateUrl: './reserva.component.html',
  styleUrl: './reserva.component.css'
})
export class ReservaComponent implements OnInit, OnDestroy {
  reserva: Reserva = { _id: '', resourceId: '', userId: '', pagoId: '', fechas: [], metodoDePago: '' };
  reservaConfirmada: boolean = false;
  recurso?: Recurso;
  usuario?: Usuario;
  step = 0;
  cantidadDias: number = 0;
  precioPorDia: number = 0;
  private navSubscription: Subscription;
  reset = false;
  metodoDePago: number = 0;
  modalOpen: boolean = false;
  montoTotal: number = 0;
  pago: any;

  @ViewChild('pagoSection') pagoSection!: ElementRef;
  private lastMetodoPago: number = 0;

  constructor(
    private _apiReserva: ApiReservaService,
    private _apiRecurso: ApiRecursoService,
    private route: ActivatedRoute,
    private eventService: EventService
  ) {
    this.navSubscription = this.eventService.resetReservas$.subscribe(() => {
      this.resetComponent();
    });
  }

  ngOnInit(): void {
    this.loadUserData();
    this.subscribeToRouteParams();
  }

  ngOnDestroy(): void {
    if (this.navSubscription) {
      this.navSubscription.unsubscribe();
    }
  }

  private loadUserData(): void {
    const usuarioStr = localStorage.getItem('usuario');
    console.log(usuarioStr)
    if (usuarioStr) {
      this.usuario = JSON.parse(usuarioStr);
      this.reserva.userId = this.usuario?._id || '';
    }
  }

  private subscribeToRouteParams(): void {
    console.log("suscribe")
    this.route.queryParams.subscribe(params => {
      const recursoId = params['recursoId'];
      console.log("id: " + recursoId);
      this._apiRecurso.getRecursoById(recursoId).subscribe(
        (response) => {
          console.log(response);
          this.recurso = response;
          this.reserva.resourceId = this.recurso?._id || '';
          if (this.usuario?.rol === "Afiliado" && this.recurso) {
            this.precioPorDia = this.recurso.precios.afiliado;
          } else if (this.usuario?.rol === "Invitado" && this.recurso) {
            this.precioPorDia = this.recurso.precios.noAfiliado;
          }
        },
        (error) => {
          console.error('Error al obtener recurso:', error);
        }
      );
    });
  }

  private resetComponent(): void {
    // Resetear el estado del componente
    this.reserva = { _id: '', resourceId: '', userId: '', pagoId: '', fechas: [], metodoDePago: '' };
    this.step = 0;
    this.reset = true;
    this.metodoDePago = 0;
    this.modalOpen = false;
    this.cantidadDias = 0;
    this.precioPorDia = 0;
    this.montoTotal = 0;
    setTimeout(() => {
      this.reset = false;
    }, 100);
    this.ngOnInit();
  }

  onFechasSeleccionadas(fechas: Fecha[]) {
    this.reserva.fechas = fechas;
    this.cantidadDias = fechas.length;
    this.step = 1;
  }

  onCondicionesAceptadas() {
    this.step = 2;
    this.montoTotal = this.precioPorDia * this.cantidadDias;
  }

  onReservaPagada(pago: any, metodoDePago: string) {
    this.step = 3;
    this.pago = pago;
    this.reserva.pagoId = pago._id;
    this.reserva.metodoDePago = metodoDePago;
    this._apiReserva.crearReserva(this.reserva).subscribe(
      (response) => {
        console.log(response);
        this.reservaConfirmada = true;
      },
      (error) => {
        console.error('Error al crear reserva:', error);
      }
    );
  }
  seleccionarMetodoPago(metodo: number) {
    this.metodoDePago = metodo;
    this.modalOpen = false;
  }

  ngAfterViewChecked() {
    // Solo hacer scroll en dispositivos móviles (ancho menor a 992px - breakpoint lg de Bootstrap)
    const isMobile = window.innerWidth < 992;

    if (this.metodoDePago === 2 &&
      this.lastMetodoPago !== 2 &&
      this.pagoSection &&
      isMobile) {
      setTimeout(() => {
        this.pagoSection.nativeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
    this.lastMetodoPago = this.metodoDePago;
  }
}