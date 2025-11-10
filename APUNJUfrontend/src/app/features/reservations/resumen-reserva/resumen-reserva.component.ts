import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../../interfaces/usuario.model';
import { Reserva } from '../../../interfaces/reserva';
import { Recurso } from '../../../interfaces/recurso.interface';
import { ApiReservaService } from '../../../services/reservas/api-reserva.service';
import { Fecha} from '../../../interfaces/fecha';

declare var bootstrap: any; // Declaración para TypeScript

@Component({
  selector: 'app-resumen-reserva',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resumen-reserva.component.html',
  styleUrls: ['./resumen-reserva.component.css']
})
export class ResumenReservaComponent implements OnInit{
  
  metodoDePago: number = 0;
  modalOpen: boolean = false;
  @Input() recurso!: Recurso;
  @Input() cantidadDeDias !: number;
  @Input() precioPorDia !: number;
  @Input() fechasSeleccionadas !: Fecha[];
  @Input() usuario!: Usuario;
  @Output() metodoDePagoSeleccionadoEvent = new EventEmitter<number>();

  constructor(private _apiReserva: ApiReservaService) {}

  seleccionarMetodoPago(metodo: number) {
    this.metodoDePago = metodo;
    this.metodoDePagoSeleccionadoEvent.emit(metodo);
    this.modalOpen = false;
  }

  ngOnInit(): void {
    //console.log(this.recurso)
    this.fechasSeleccionadas
  }
}
