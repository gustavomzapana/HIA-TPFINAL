import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';

@Injectable({
  providedIn: 'root',
})
export class ExcelExportService {
  async exportAsExcelFile(
    headers: string[],
    data: any[][],
    fileName: string = 'export.xlsx'
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Datos');

    // Encabezado con estilo
    worksheet.addRow(headers);
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 13 };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.eachCell(cell => {
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFBDD7EE' },
      };
    });

    // Agregar filas de datos
    data.forEach(row => worksheet.addRow(row));

    
    // Ajustar ancho de columnas y centrar números
    worksheet.columns.forEach(column => {
    column.width = 25;

    if (column.values && column.values.length > 1 && typeof column.values[1] === 'number') {
        column.alignment = { horizontal: 'center' };
    }
    });

    // Fila total si hay datos numéricos en segunda columna
    if (data.length > 0 && typeof data[0][1] === 'number') {
      const totalRowIndex = worksheet.lastRow!.number + 1;

      const labelCell = worksheet.getCell(`A${totalRowIndex}`);
      labelCell.value = 'Total';
      labelCell.font = { bold: true };
      labelCell.alignment = { horizontal: 'right' };

      const totalCell = worksheet.getCell(`B${totalRowIndex}`);
      totalCell.value = { formula: `SUM(B2:B${totalRowIndex - 1})` };
      totalCell.font = { bold: true };
      totalCell.alignment = { horizontal: 'center' };

      [labelCell, totalCell].forEach(cell => {
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'double' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE2EFDA' },
        };
      });
    }

    // Descargar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    FileSaver.saveAs(blob, fileName);
  }
}