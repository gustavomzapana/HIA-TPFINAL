import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments';

@Injectable({
  providedIn: 'root'
})
export class ActividadService {
  private apiUrl = environment.apiUrl + '/api/actividades';

  constructor(private http: HttpClient) { }

  subirImagen(formData: FormData) {
    return this.http.post<{ url: string }>(
      `${this.apiUrl}/subir-imagen`,
      formData
    );
  }


  // =============== MÉTODOS PARA TALLERES ===============
  getTalleres(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/talleres/activos`);
  }

  getAllTalleres(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/talleres/todos`);
  }

  getTallerById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/talleres/${id}`);
  }

  createTaller(taller: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/talleres`, taller);
  }

  updateTaller(id: string, taller: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/talleres/${id}`, taller);
  }

  deleteTaller(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/talleres/${id}`);
  }

  // =============== MÉTODOS PARA CURSOS ===============
  getCursos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cursos/activos`);
  }

  getAllCursos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cursos/todos`);
  }

  getCursoById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cursos/${id}`);
  }

  createCurso(curso: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cursos`, curso);
  }

  updateCurso(id: string, curso: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/cursos/${id}`, curso);
  }

  deleteCurso(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/cursos/${id}`);
  }

  // =============== MÉTODOS PARA CAPACITACIONES ===============
  getCapacitaciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/capacitaciones/activos`);
  }

  getAllCapacitaciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/capacitaciones/todos`);
  }

  getCapacitacionById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/capacitaciones/${id}`);
  }

  createCapacitacion(capacitacion: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/capacitaciones`, capacitacion);
  }

  updateCapacitacion(id: string, capacitacion: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/capacitaciones/${id}`, capacitacion);
  }

  deleteCapacitacion(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/capacitaciones/${id}`);
  }

  createCursoConImagen(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cursos`, formData);
  }

  createTallerConImagen(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/talleres`, formData);
  }

  createCapacitacionConImagen(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/capacitaciones`, formData);
  }
}