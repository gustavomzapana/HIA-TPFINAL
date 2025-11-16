export interface Recurso {
  id?: number;
  nombre: string;
  ubicacion: string;
  caracteristicas: string[];
  descripcion: string;
  imagen: string;
  capacidad: number;
  precios: {
    afiliado: number,
    noAfiliado: number
  },
  estado: 'disponible' | 'no-disponible';
}
