export interface ExcelStrategy {
  generarExcel(datos: any[]): Promise<void>;
}