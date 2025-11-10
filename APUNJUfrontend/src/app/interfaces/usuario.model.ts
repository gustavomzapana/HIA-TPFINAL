export interface Usuario {
   _id?:string;
  legajo: string;
  apellido: string;
  nombre: string;
  fNacimiento: string;
  dni: string;
  email: string;
  domicilio: string;
  telefono: string;
  foto: string;
  dependencia: string;
  esAfiliado: boolean;
  rol: string;
  activo: boolean;
  //password?: string; // No lo mostraremos en el perfil
  
}