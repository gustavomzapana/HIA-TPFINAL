import { Component, AfterViewInit, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiReservaService } from '../../services/reservas/api-reserva.service';
import Chart from 'chart.js/auto';
import { FormsModule } from '@angular/forms';
import { ExcelExportService } from '../../shared/excel/excel-export.service';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements AfterViewInit, OnInit {
  @ViewChild('chartCanvas', { static: false }) chartCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChart', { static: false }) pieChartRef!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;
  pieChart!: Chart;

  constructor(private apiReservaService: ApiReservaService,
     private excelExportService: ExcelExportService
  ) {}

  user: { nombre: string; rol: string } = {
    nombre: '',
    rol: ''
  };

ngOnInit(): void {
  const userJSON = localStorage.getItem('usuario');
  if (userJSON) {
    try {
      const usuario = JSON.parse(userJSON);
      this.user = {
        nombre: usuario.nombre,
        rol: usuario.rol
      };
    } catch (e) {
      console.error('Error al parsear el usuario del localStorage:', e);
    }
  }
}


  anioSeleccionado: any;

reservasPorMes: any[] = [];
anios = [2025, 2026, 2027, 2028, 2029, 2030]; // Años disponibles para seleccionar

maxDias = 31;

meses: { nombre: string; valor: number; porcentaje: number }[] = [];

 ngAfterViewInit(): void {
  setTimeout(() => {
    if (!this.chart) this.initBarChart();
    if (!this.pieChart) this.initPieChart();
  }, 100); // le damos unos ms para que el DOM "respire"
}
//grafico de barras y poligono de frecuencias
  initBarChart() {
  const canvas = this.chartCanvasRef?.nativeElement;
  if (!canvas) return;

  if (this.chart) this.chart.destroy();

  const colores = [
    '#0d6efd', '#6610f2', '#6f42c1', '#d63384',
    '#dc3545', '#fd7e14', '#ffc107', '#198754',
    '#20c997', '#0dcaf0', '#6c757d', '#343a40'
  ];

  const valores = this.meses.map(m => m.valor);
  const etiquetas = this.meses.map(m => m.nombre);

  this.chart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: etiquetas,
      datasets: [
        {
          label: 'Reservas',
          data: valores,
          backgroundColor: colores,
          borderRadius: 6,
          borderSkipped: false,
          barThickness: 30, // más fino (ajustá según el tamaño del canvas)
          yAxisID: 'y',
        },
        {
          label: 'Reservas',
          data: valores,
          type: 'line',
          borderColor: '#0dcaf0',
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointBackgroundColor: '#0dcaf0',
          pointRadius: 4,
          tension: 0.3,
          yAxisID: 'y',
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 31,
          ticks: { stepSize: 5 },
          title: {
            display: true,
            text: 'Reservas'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}
//grafico circular
initPieChart() {
  const canvas = this.pieChartRef?.nativeElement;
  if (!canvas) return;

  if (this.pieChart) this.pieChart.destroy();

  const colores = [
    '#0d6efd', '#6610f2', '#6f42c1', '#d63384',
    '#dc3545', '#fd7e14', '#ffc107', '#198754',
    '#20c997', '#0dcaf0', '#6c757d', '#343a40'
  ];

  this.pieChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: this.meses.map(m => m.nombre),
      datasets: [{
        data: this.meses.map(m => m.valor),
        backgroundColor: colores
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 20,          // tamaño del cuadrado de color
            padding: 15,           // espacio entre cada ítem
            usePointStyle: true,   // cambia cuadrado por círculo (opcional)
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const label = ctx.label || '';
              const value = ctx.raw;
              return `${label}: ${value} reservas`;
            }
          }
        }
      },
      layout: {
        padding: {
          bottom: 30 // agrega espacio inferior al gráfico para la leyenda
        }
      }
    }
  });
}
nombresMeses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];
obtenerReservasPorAnio() {
  if (!this.anioSeleccionado) return;

  this.apiReservaService.reservasPorMesEnAnio(this.anioSeleccionado).subscribe({
    next: (response) => {
      this.reservasPorMes = response.data;
      console.log('Reservas por mes:', this.reservasPorMes);
      // Mapear a estructura similar a this.meses con nombres
      this.meses = this.reservasPorMes.map((item: any, i: number) => {
          const valor = item.cantidad;
          return {
            nombre: this.nombresMeses[i],
            valor,
            porcentaje: Math.round((valor / this.maxDias) * 100)
          };
        });

      this.actualizarGraficos();
    },
    error: (err) => {
      console.error('Error al obtener reservas por año:', err);
    }
  });
}
actualizarGraficos() {
  this.initBarChart();
  this.initPieChart();
}

getProgressColor(porcentaje: number): string {
  if (porcentaje >= 75) return 'bg-success';
  if (porcentaje >= 40) return 'bg-warning';
  return 'bg-danger';
}
descargarExcel() {
    const headers = ['Mes', 'Cantidad de Reservas'];
    const data = this.meses.map(m => [m.nombre, m.valor]);

    this.excelExportService.exportAsExcelFile(headers, data, 'reservas'+this.anioSeleccionado+'.xlsx');
  }

}