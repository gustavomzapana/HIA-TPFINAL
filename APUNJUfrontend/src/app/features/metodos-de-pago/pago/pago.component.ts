import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApiMpService } from '../../../services/pagos/api-mp.service';
import { Usuario } from '../../../interfaces/usuario.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pago',
  imports: [CommonModule],
  templateUrl: './pago.component.html',
  styleUrl: './pago.component.css'
})
export class PagoComponent implements OnInit {
  loading = true;
  error: string = "";
  mp_init_point: string = '';
  reservaConfirmada: boolean = false;
  pollingInterval: any;
  pago: any = null;
  @Input() montoTotal: number = 0;
  @Input() usuario?: Usuario;
  @Input() descripcion: string = '';
  @Output() pagoConfirmadoEvent: EventEmitter<any> = new EventEmitter<any>();
  constructor(
    private _apiMpService: ApiMpService
  ) { }

  ngOnInit() {
    this.iniciarPago();
  }

  iniciarPollingPago() {
    if (!this.pago?._id) return;
    this.pollingInterval = setInterval(() => {
      console.log(this.pago._id + "polling");
      this._apiMpService.getPagoById(this.pago._id).subscribe((resp: any) => {
        if (resp.data.estado === 'aprobado') {
          this.pagoConfirmadoEvent.emit(this.pago);
          clearInterval(this.pollingInterval);
        }
        
      });
    }, 5000); // cada 5 segundos
  }

  iniciarPago() {
    const importeTotal = this.montoTotal;

    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      this.usuario = JSON.parse(usuarioStr);
    }

    const pagoData = {
      importeTotal: importeTotal,
      descripcion: this.descripcion,
      userId: this.usuario?._id
    };
    this._apiMpService.createPagoMercadoPago(pagoData).subscribe({
      next: (resp: any) => {
        this.mp_init_point = resp.data.mp_init_point;
        this.pago = resp.data.pago;
        this.iniciarPollingPago();
      },
      error: () => {
        this.error = 'No se pudo generar el link de pago';
      }
    });
  }

  ngOnDestroy() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }
}
