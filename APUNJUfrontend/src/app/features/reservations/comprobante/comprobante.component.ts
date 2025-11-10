import { Component, Inject, Input, OnInit, PLATFORM_ID } from '@angular/core';
import { Reserva } from '../../../interfaces/reserva';
import { Recurso } from '../../../interfaces/recurso.interface';
import { Usuario } from '../../../interfaces/usuario.model';
import jsPDF from 'jspdf';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ApiReservaService } from '../../../services/reservas/api-reserva.service';
@Component({
  selector: 'app-comprobante',
  imports: [CommonModule],
  templateUrl: './comprobante.component.html',
  styleUrl: './comprobante.component.css'
})
export class ComprobanteComponent implements OnInit {
  @Input() reserva?: Reserva;
  @Input() recurso?: Recurso;
  @Input() usuario?: Usuario;
  @Input() pago?: any;
  @Input() montoTotal?: number;
  @Input() enviarAutomatico: boolean = false;
  precioPorDia?: number;
  today = new Date().toLocaleDateString();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
    private _apiReserva: ApiReservaService,
  ) { }

  ngOnInit(): void {
    if (this.usuario?.rol === "Afiliado" && this.recurso) {
      this.precioPorDia = this.recurso.precios.afiliado;
    } else if (this.usuario?.rol === "Invitado" && this.recurso) {
      this.precioPorDia = this.recurso.precios.noAfiliado;
    }

    if (this.enviarAutomatico && this.reserva && this.usuario) {
      setTimeout(() => {
        this.enviarComprobanteAutomatico(this.reserva?.userId);
      }, 2000);
    }
  }

  printDocument(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.document.defaultView?.print();
    }
  }

  exportarPDF() {
    const doc = new jsPDF();
    const fechaActual = new Date().toLocaleDateString();
    const numeroReserva = `RES-${Date.now()}`;

    // Encabezado
    doc.setFontSize(20);
    doc.setTextColor(33, 150, 243); // Azul primario
    doc.text('Comprobante de Reserva', 105, 20, { align: 'center' });

    // Logo (opcional)
    // doc.addImage('assets/logo.png', 'PNG', 10, 10, 30, 15);

    // Información de la empresa
    doc.setFontSize(10);
    doc.setTextColor(33, 33, 33);
    doc.text(this.recurso!.nombre, 14, 40);
    doc.text(this.recurso!.ubicacion, 14, 45);
    doc.text(this.recurso!.descripcion, 14, 50);

    // Información de la reserva
    doc.setFontSize(14);
    doc.setTextColor(33, 150, 243);
    doc.text('Datos de la Reserva', 14, 60);

    doc.setDrawColor(33, 150, 243);
    doc.setLineWidth(0.5);
    doc.line(14, 65, 190, 65);

    doc.setFontSize(10);
    doc.setTextColor(33, 33, 33);
    doc.text(`N° de Reserva: ${this.reserva?._id}`, 14, 70);
    doc.text(`Fecha de emisión: ${fechaActual}`, 14, 75);
    doc.text(`Estado: ${this.reserva?.estado}`, 14, 80);

    // Datos del cliente
    doc.setFontSize(14);
    doc.setTextColor(33, 150, 243);
    doc.text('Datos del Cliente', 14, 90);
    doc.line(14, 95, 190, 95);

    doc.setFontSize(10);
    doc.setTextColor(33, 33, 33);
    doc.text(`Nombre: ${this.usuario?.nombre} ${this.usuario?.apellido}`, 14, 100);
    doc.text(`Email: ${this.usuario?.email}`, 14, 105);
    doc.text(`Teléfono: ${this.usuario?.telefono || 'No especificado'}`, 14, 110);

    // Detalles del Pago
    doc.setFontSize(14);
    doc.setTextColor(33, 150, 243);
    doc.text('Detalles del Pago', 14, 120);
    doc.line(14, 125, 190, 125);

    doc.setFontSize(10);
    doc.setTextColor(33, 33, 33);
    doc.text(`N° de Pago: ${this.pago?._id}`, 14, 130);
    doc.text(`Método de Pago: ${this.reserva?.metodoDePago}`, 14, 135);
    let lastIndex = 135;
    if (this.reserva?.metodoDePago === 'planilla') {
      let index = 0;
      this.pago?.cuotas.forEach((cuota: any) => {
        doc.text(`Cuota ${cuota.numero}: $${cuota.monto}`, 14, 140 + index * 15);
        const fechaVencimiento = new Date(cuota.fechaVencimiento);
        doc.text(`Fecha de vencimiento: ${fechaVencimiento.toISOString().split('T')[0]}`, 14, 145 + index * 15);
        doc.text(`Estado: ${cuota.estado}`, 14, 150 + index * 15);
        lastIndex = 155 + index * 15;
        index++;
      });
    }
    doc.text(`Pago en Estado: ${this.pago?.estado}`, 14, lastIndex + 5);
    doc.text(`Fecha de emisión: ${fechaActual}`, 14, lastIndex + 10);
    doc.text(`Monto: $${this.pago?.importeTotal}`, 14, lastIndex + 15);

    // Detalles de la reserva
    doc.setFontSize(14);
    doc.setTextColor(33, 150, 243);
    doc.text('Detalles de la Estadía', 14, lastIndex + 25);
    doc.line(14, lastIndex + 30, 190, lastIndex + 30);

    const fechas = this.reserva?.fechas.map(f => new Date(f.fecha).toLocaleDateString()).join(', ');


    doc.setFontSize(10);
    doc.setTextColor(33, 33, 33);
    doc.text(`Recurso: ${this.recurso?.nombre}`, 14, lastIndex + 35);
    doc.text(`Fechas: ${fechas}`, 14, lastIndex + 40);
    doc.text(`Noches: ${this.reserva!.fechas.length}`, 14, lastIndex + 45);
    doc.text(`Precio por noche: $${this.precioPorDia}`, 14, lastIndex + 50);
    doc.text(`Total: $${this.montoTotal}`, 14, lastIndex + 55);

    // Pie de página
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('Gracias por elegirnos. ¡Esperamos su visita!', 105, lastIndex + 60, { align: 'center' });
    doc.text('www.cabanasdellago.com', 105, lastIndex + 65, { align: 'center' });

    // Guardar el PDF
    doc.save(`comprobante-reserva-${numeroReserva}.pdf`);
  }

  private enviarComprobanteAutomatico(userId?: string): void {
    const pdfBuffer = this.generarPDFBuffer();
    this._apiReserva.enviarComprobante(userId!, pdfBuffer).subscribe({})
  }

  private generarPDFBuffer(): string {
    const doc = new jsPDF();
    const fechaActual = new Date().toLocaleDateString();
    const numeroReserva = `RES-${Date.now()}`;

    // Encabezado
    doc.setFontSize(20);
    doc.setTextColor(33, 150, 243); // Azul primario
    doc.text('Comprobante de Reserva', 105, 20, { align: 'center' });

    // Logo (opcional)
    // doc.addImage('assets/logo.png', 'PNG', 10, 10, 30, 15);

    // Información de la empresa
    doc.setFontSize(10);
    doc.setTextColor(33, 33, 33);
    doc.text(this.recurso!.nombre, 14, 40);
    doc.text(this.recurso!.ubicacion, 14, 45);
    doc.text(this.recurso!.descripcion, 14, 50);

    // Información de la reserva
    doc.setFontSize(14);
    doc.setTextColor(33, 150, 243);
    doc.text('Datos de la Reserva', 14, 60);

    doc.setDrawColor(33, 150, 243);
    doc.setLineWidth(0.5);
    doc.line(14, 65, 190, 65);

    doc.setFontSize(10);
    doc.setTextColor(33, 33, 33);
    doc.text(`N° de Reserva: ${this.reserva?._id}`, 14, 70);
    doc.text(`Fecha de emisión: ${fechaActual}`, 14, 75);
    doc.text(`Estado: ${this.reserva?.estado}`, 14, 80);

    // Datos del cliente
    doc.setFontSize(14);
    doc.setTextColor(33, 150, 243);
    doc.text('Datos del Cliente', 14, 90);
    doc.line(14, 95, 190, 95);

    doc.setFontSize(10);
    doc.setTextColor(33, 33, 33);
    doc.text(`Nombre: ${this.usuario?.nombre} ${this.usuario?.apellido}`, 14, 100);
    doc.text(`Email: ${this.usuario?.email}`, 14, 105);
    doc.text(`Teléfono: ${this.usuario?.telefono || 'No especificado'}`, 14, 110);

    // Detalles del Pago
    doc.setFontSize(14);
    doc.setTextColor(33, 150, 243);
    doc.text('Detalles del Pago', 14, 120);
    doc.line(14, 125, 190, 125);

    doc.setFontSize(10);
    doc.setTextColor(33, 33, 33);
    doc.text(`N° de Pago: ${this.pago?._id}`, 14, 130);
    doc.text(`Método de Pago: ${this.reserva?.metodoDePago}`, 14, 135);
    let lastIndex = 135;
    if (this.reserva?.metodoDePago === 'planilla') {
      let index = 0;
      this.pago?.cuotas.forEach((cuota: any) => {
        doc.text(`Cuota ${cuota.numero}: $${cuota.monto}`, 14, 140 + index * 15);
        const fechaVencimiento = new Date(cuota.fechaVencimiento);
        doc.text(`Fecha de vencimiento: ${fechaVencimiento.toISOString().split('T')[0]}`, 14, 145 + index * 15);
        doc.text(`Estado: ${cuota.estado}`, 14, 150 + index * 15);
        lastIndex = 155 + index * 15;
        index++;
      });
    }
    doc.text(`Pago en Estado: ${this.pago?.estado}`, 14, lastIndex + 5);
    doc.text(`Fecha de emisión: ${fechaActual}`, 14, lastIndex + 10);
    doc.text(`Monto: $${this.pago?.importeTotal}`, 14, lastIndex + 15);

    // Detalles de la reserva
    doc.setFontSize(14);
    doc.setTextColor(33, 150, 243);
    doc.text('Detalles de la Estadía', 14, lastIndex + 25);
    doc.line(14, lastIndex + 30, 190, lastIndex + 30);

    const fechas = this.reserva?.fechas.map(f => new Date(f.fecha).toLocaleDateString()).join(', ');


    doc.setFontSize(10);
    doc.setTextColor(33, 33, 33);
    doc.text(`Recurso: ${this.recurso?.nombre}`, 14, lastIndex + 35);
    doc.text(`Fechas: ${fechas}`, 14, lastIndex + 40);
    doc.text(`Noches: ${this.reserva!.fechas.length}`, 14, lastIndex + 45);
    doc.text(`Precio por noche: $${this.precioPorDia}`, 14, lastIndex + 50);
    doc.text(`Total: $${this.montoTotal}`, 14, lastIndex + 55);

    // Pie de página
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('Gracias por elegirnos. ¡Esperamos su visita!', 105, lastIndex + 60, { align: 'center' });
    doc.text('www.cabanasdellago.com', 105, lastIndex + 65, { align: 'center' });

    // Guardar el PDF
    doc.save(`comprobante-reserva-${numeroReserva}.pdf`);
    return doc.output(`datauristring`).split(',')[1]; // Retorna el buffer en base64
  }
}
