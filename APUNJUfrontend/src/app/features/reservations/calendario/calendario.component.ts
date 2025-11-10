import { Component, EventEmitter, Input, input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { addMonths, isSameDay } from 'date-fns';
import { Fecha } from '../../../interfaces/fecha';
import { ApiReservaService } from '../../../services/reservas/api-reserva.service';
import { RouterModule } from '@angular/router';
import { ApiFechaService } from '../../../services/fechas/api-fecha.service';

interface DiaCalendario {
  fecha: Date;
  esMesActual: boolean;
  disponible?: boolean;
  esHoy: boolean;
  seleccionado: boolean;
}

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.css']
})
export class CalendarioComponent implements OnInit {
  fechaActual = new Date();
  meses: Date[] = [];
  mesActualIndex = 0;
  diasPorMes: DiaCalendario[][] = [];
  diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  fechasReservadas?: any = [];
  fechasParaReservar: Fecha[] = [];
  cargando = false;
  error: string | null = null;
  bloquear = false;

  @Input() resourceId = '';
  @Output() fechasSeleccionadas = new EventEmitter<Fecha[]>();

  constructor(private _apiFechas: ApiFechaService) { }

  ngOnInit() {
    this.generarMeses();
    this.generarCalendarios();
    this.cargarDisponibilidad();
  }

  generarMeses() {
    this.meses = [];
    const hoy = new Date();
    for (let i = 0; i < 6; i++) {
      this.meses.push(addMonths(new Date(hoy), i));
    }
    this.mesActualIndex = 0;
  }

  generarCalendarios() {
    this.diasPorMes = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < this.meses.length; i++) { //O(6 meses)
      const year = this.meses[i].getFullYear();
      const month = this.meses[i].getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const dias: DiaCalendario[] = [];
  
      // Agregar días del mes anterior para completar la primera semana
      const primerDiaSemana = firstDay.getDay(); // 0 (domingo) a 6 (sábado)
      for (let j = 0; j < primerDiaSemana; j++) {
        const fechaAnterior = new Date(year, month, -j);
        dias.unshift({
          fecha: fechaAnterior,
          esMesActual: false,
          disponible: false,
          esHoy: false,
          seleccionado: false
        });
      }
  
      // Agregar días del mes actual
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        dias.push({
          fecha: date,
          esMesActual: true,
          disponible: undefined,
          esHoy: isSameDay(date, today),
          seleccionado: false
        });
      }
  
      this.diasPorMes.push(dias);
    }
  }

 public cargarDisponibilidad() {
    this.cargando = true;
    this.error = null;
    this.fechasReservadas = [];

    this._apiFechas.getFechasNoDisponiblesPorRecurso(this.resourceId).subscribe(
      (response) => {
        this.fechasReservadas = [];
        for(let i = 0; i < response.fechas.length; i++) {
          this.fechasReservadas.push(response.fechas[i].fecha.split('T')[0]);
				}
        this.actualizarDisponibilidad();
        this.cargando = false;
      },
      (error) => {
        this.error = 'Error al cargar las fechas ocupadas';
        this.cargando = false;
      }
    );
  }

  actualizarDisponibilidad() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    this.diasPorMes.forEach(dias => {
      dias.forEach(dia => {
        const fechaStr = dia.fecha.toISOString().split('T')[0];
        const esFechaPasada = dia.fecha <= hoy; //No queremos que se peuda reservar en el mismo Día
        dia.disponible = !esFechaPasada && !this.fechasReservadas.includes(fechaStr);
        dia.esHoy = isSameDay(dia.fecha, hoy);
      });
    });
  }

  mesAnterior() {
    if (this.mesActualIndex > 0) {
      this.mesActualIndex--;
    }
  }

  mesSiguiente() {
    if (this.mesActualIndex < this.meses.length - 1) {
      this.mesActualIndex++;
    }
  }

  seleccionarDia(dia: DiaCalendario) {
    if (!dia.disponible && dia.disponible !== undefined) return;
    if (!dia.seleccionado) {
      dia.seleccionado = true;
      this.fechasParaReservar.push({
        fecha: dia.fecha,
        estado: "reservado"
      } as Fecha);
    } else {
      dia.seleccionado = false;
      this.fechasParaReservar = this.fechasParaReservar.filter(fecha => !isSameDay(fecha.fecha, dia.fecha));
    }
  }

  formatearMes(fecha: Date): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
  }

  onSiguiente() {
    this.fechasSeleccionadas.emit(this.fechasParaReservar);
  }
}