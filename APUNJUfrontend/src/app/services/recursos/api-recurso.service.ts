import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments';

@Injectable({
  providedIn: 'root'
})
export class ApiRecursoService {

  constructor(private _http : HttpClient) { }

  url = environment.apiUrl + "/api/recursos/";

  public getRecursos(): Observable<any> { 
    return this._http.get(this.url);
  }
  public getRecursoById(id: string): Observable<any> {
    const params = new HttpParams().set('id', id);
    return this._http.get(`${this.url}recurso`, { params });
  }

  public crearRecurso(data: any): Observable<any> {
    return this._http.post(`${this.url}`, data);
  }

  public updateRecurso(id: string, data: any): Observable<any> {
    const params = new HttpParams().set('id', id);
    return this._http.put(`${this.url}`, data, { params });
  }

  public deleteRecurso(id: string): Observable<any> {
    const params = new HttpParams().set('id', id);
    return this._http.delete(`${this.url}`, { params });
  }

  subirImagen(formData: FormData) {
    return this._http.post<{ url: string }>(
      `${this.url}subir-imagen`,
      formData
    );
  }

}
