import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Usuario } from '../../../interfaces/usuario.model';
import { ApiMpService } from '../../../services/pagos/api-mp.service';
@Component({
  selector: 'app-descuento-en-planilla',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './descuento-en-planilla.component.html',
  styleUrls: ['./descuento-en-planilla.component.css']
})

export class DescuentoEnPlanillaComponent implements OnInit {
  valorCuota: number = 0;
  @Input() montoTotal: number = 0;
  @Input() usuario?: Usuario;
  @Input() descripcion: string = '';
  @Output() pagoConfirmadoEvent = new EventEmitter<any>();
  dni?: string;
  cuotas?: number;

  constructor(private _apiMpService: ApiMpService,) { }

  ngOnInit(): void {
  }

  calcularCuotas() {
    if (this.cuotas && this.cuotas > 0) {
      this.valorCuota = this.montoTotal / this.cuotas;
    } else {
      this.valorCuota = 0;
    }
  }

  onSubmit() {
    console.log("hice submit" + this.dni + " " + this.cuotas);
    if (this.dni && this.cuotas) {
      console.log("datos correctos 1");
      if (this.usuario?.dni === this.dni) {
        console.log("datos correctos 2");
        this.calcularCuotas();
        // Calcular fechas de vencimiento (día 10 de cada mes)
        const hoy = new Date();
        const cuotas = [];;
        
        for (let i = 1; i <= this.cuotas; i++) {
          const fechaVencimiento = new Date(hoy);
          // Si hoy es después del día 10, la primera cuota será el 10 del mes siguiente
          // Si hoy es antes del 10, la primera cuota será el 10 del mes actual
          const mesInicio = hoy.getDate() > 10 ? 1 : 0;
          
          fechaVencimiento.setMonth(hoy.getMonth() + mesInicio + i, 10); // Día 10 del mes
          fechaVencimiento.setHours(0, 0, 0, 0); // Inicio del día
          
          cuotas.push({
            numero: i,
            monto: this.valorCuota,
            fechaVencimiento: fechaVencimiento.toISOString(),
            estado: 'pendiente'
          });
        }
  
        const pagoData = {
          importeTotal: this.montoTotal,
          descripcion: this.descripcion,
          userId: this.usuario._id,
          cuotas: cuotas
        };
  
        console.log('Datos del pago:', pagoData);
        // Aquí iría la llamada al servicio para guardar el pago
       this._apiMpService.createPagoPlanilla(pagoData).subscribe({
        next: (res) => {
          console.log('Pago guardado exitosamente:', res);
          this.pagoConfirmadoEvent.emit(res);
        },
        error: (err) => {
          console.error('Error al guardar el pago:', err);
        }
       })
        
      } else {
        // Mostrar error de DNI no coincide
        console.error('El DNI no coincide con el usuario autenticado');
      }
    }
  }
}
