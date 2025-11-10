import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExcelNativoService {

  constructor() { }

  generarExcelInscripciones(datos: any[], nombreActividad: string, tipoActividad: string): void {
    // Crear los datos para Excel
    const encabezados = [
      'N°',
      'Nombre',
      'Apellido',
      'Email',
      'Teléfono',
      'DNI',
      'Fecha de Nacimiento',
      'Tipo de Usuario',
      'Número de Afiliado',
      'Estado de Inscripción',
      'Estado de Pago',
      'Monto',
      'Ha Pagado',
      'Fecha de Inscripción',
      'Observaciones'
    ];

    // Preparar datos
    const datosFormateados = datos.map((inscripcion, index) => [
      index + 1,
      inscripcion.nombre,
      inscripcion.apellido,
      inscripcion.email,
      inscripcion.telefono,
      inscripcion.dni,
      this.formatearFecha(inscripcion.fechaNacimiento),
      inscripcion.esAfiliado ? 'Afiliado' : 'No Afiliado',
      inscripcion.numeroAfiliado || 'N/A',
      this.capitalizarTexto(inscripcion.estado),
      this.capitalizarTexto(inscripcion.estadoPago),
      inscripcion.esAfiliado ? 'Gratuito' : `$${inscripcion.montoPagado || 0}`,
      inscripcion.esAfiliado ? 'N/A' : (inscripcion.estadoPago === 'pagado' ? 'SÍ' : 'NO'),
      this.formatearFecha(inscripcion.fechaInscripcion),
      this.obtenerObservaciones(inscripcion)
    ]);

    // Crear información del encabezado
    const infoActividad = [
      ['REPORTE DE INSCRIPCIONES'],
      [''],
      ['Actividad:', nombreActividad],
      ['Tipo:', tipoActividad],
      ['Total de inscripciones:', datos.length.toString()],
      ['Inscripciones de afiliados:', datos.filter(i => i.esAfiliado).length.toString()],
      ['Inscripciones de no afiliados:', datos.filter(i => !i.esAfiliado).length.toString()],
      ['Pagos confirmados:', datos.filter(i => i.estadoPago === 'pagado').length.toString()],
      ['Pagos pendientes:', datos.filter(i => i.estadoPago === 'pendiente').length.toString()],
      ['Fecha de generación:', new Date().toLocaleDateString('es-AR')],
      [''],
      encabezados
    ];

    // Combinar información y datos
    const datosCompletos = [...infoActividad, ...datosFormateados];

    // Generar archivo Excel
    this.descargarComoExcel(datosCompletos, nombreActividad, tipoActividad);
  }

  private descargarComoExcel(datos: any[][], nombreActividad: string, tipoActividad: string): void {
    // Crear tabla HTML
    const tablaHtml = this.crearTablaHtml(datos);
    
    // Crear Blob con formato Excel
    const blob = new Blob([tablaHtml], {
      type: 'application/vnd.ms-excel;charset=utf-8;'
    });

    // Crear nombre del archivo
    const nombreArchivo = `Inscripciones_${tipoActividad}_${nombreActividad.replace(/[^a-zA-Z0-9]/g, '_')}_${this.formatearFechaArchivo()}.xls`;

    // Descargar archivo
    this.descargarArchivo(blob, nombreArchivo);
  }

  private crearTablaHtml(datos: any[][]): string {
    let html = `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .header { background-color: #4CAF50; color: white; font-weight: bold; }
            .info { background-color: #e3f2fd; }
          </style>
        </head>
        <body>
          <table>
    `;

    datos.forEach((fila, index) => {
      html += '<tr>';
      
      fila.forEach((celda, colIndex) => {
        let clase = '';
        let tag = 'td';
        
        // Aplicar estilos especiales
        if (index === 0) {
          clase = 'header';
          tag = 'th';
        } else if (index < 11) {
          clase = 'info';
        } else if (index === 11) {
          tag = 'th';
        }
        
        html += `<${tag}${clase ? ` class="${clase}"` : ''}>${celda || ''}</${tag}>`;
      });
      
      html += '</tr>';
    });

    html += `
          </table>
        </body>
      </html>
    `;

    return html;
  }

  private descargarArchivo(blob: Blob, nombreArchivo: string): void {
    // Crear enlace de descarga
    const enlace = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    
    enlace.href = url;
    enlace.download = nombreArchivo;
    enlace.style.display = 'none';
    
    // Agregar al DOM, hacer clic y remover
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    
    // Liberar memoria
    window.URL.revokeObjectURL(url);
  }

  private formatearFecha(fecha: string | Date): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-AR');
  }

  private formatearFechaArchivo(): string {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${año}${mes}${dia}`;
  }

  private capitalizarTexto(texto: string): string {
    if (!texto) return '';
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  }

  private obtenerObservaciones(inscripcion: any): string {
    const observaciones = [];
    
    if (inscripcion.esAfiliado) {
      observaciones.push('Inscripción gratuita');
    } else {
      if (inscripcion.estadoPago === 'pendiente') {
        observaciones.push('Pago pendiente');
      } else if (inscripcion.estadoPago === 'pagado') {
        observaciones.push('Pago confirmado');
      }
    }
    
    if (inscripcion.estado === 'cancelada') {
      observaciones.push('Inscripción cancelada');
    }
    
    return observaciones.join(', ') || 'Sin observaciones';
  }
}