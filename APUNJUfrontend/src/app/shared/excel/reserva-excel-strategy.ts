import { ExcelExportService } from './excel-export.service';
import { ExcelStrategy } from './excel-strategy.interface';

export class ReservaExcelStrategy implements ExcelStrategy {
  constructor(private excelService: ExcelExportService) {}

  async generarExcel(datos: any[]): Promise<void> {
    const headers = ['#', 'Nombre', 'DNI', 'Afiliado', 'Día', 'Recurso', 'Estado'];

    const data = datos.map((reserva, i) => [
      i + 1,
      reserva.user?.nombre || '',
      reserva.user?.dni || '',
      reserva.user?.esAfiliado ? 'Sí' : 'No',
      reserva.fecha,
      reserva.recurso?.nombre || '',
      reserva.estado || '',
    ]);

    await this.excelService.exportAsExcelFile(
      headers,
      data,
      `reservas_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  }
}