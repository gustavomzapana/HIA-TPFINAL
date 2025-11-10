import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments';

export interface DatosInscripcion {
  // Datos personales
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  dni: string;
  fechaNacimiento: string;

  // Datos de afiliación
  esAfiliado: boolean;
  numeroAfiliado?: string;

  // Datos de la actividad
  actividadId: string;
}

export interface RespuestaInscripcion {
  success: boolean;
  message: string;
  inscripcion: any;
  pago?: {
    id: string;
    monto: number;
    preferenceId: string;
    initPoint: string;
    sandboxInitPoint: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class InscripcionService {
  private apiUrl = `${environment.apiUrl}/api/inscripciones`;

  constructor(private http: HttpClient) { }


  // Verificar si ya existe inscripción
  verificarDuplicado(email: string, dni: string, actividadId: string): Observable<any> {
    const params = new HttpParams()
      .set('email', email)
      .set('dni', dni)
      .set('actividadId', actividadId);

    return this.http.get(`${this.apiUrl}/verificar-duplicado`, { params });
  }

  // Crear inscripción
  crearInscripcion(datos: DatosInscripcion): Observable<RespuestaInscripcion> {
    return this.http.post<RespuestaInscripcion>(this.apiUrl, datos);
  }

  // Obtener inscripciones del usuario
  obtenerInscripcionesUsuario(email: string): Observable<any[]> {
    const params = new HttpParams().set('email', email);
    return this.http.get<any[]>(`${this.apiUrl}/usuario`, { params });
  }

  // Obtener inscripción por ID
  obtenerInscripcionPorId(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  obtenerInscripcionesPorActividad(actividadId: string): Observable<any> {
    console.log('Enviando request a:', `${this.apiUrl}/por-actividad/${actividadId}`);
    return this.http.get<any>(`${this.apiUrl}/por-actividad/${actividadId}`);
  }

  // Cancelar inscripción
  cancelarInscripcion(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/cancelar`, {});
  }

  obtenerDetallesActividad(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/actividad/${id}`);
  }
}