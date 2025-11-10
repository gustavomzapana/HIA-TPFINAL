import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments';

@Injectable({
  providedIn: 'root'
})
export class ApiFechaService {
  constructor(private _http: HttpClient) { }

  url = environment.apiUrl + "/api/fechas/";

  public getFechasNoDisponiblesPorRecurso(id: string): Observable<any> {
    const params = new HttpParams().set('resourceId', id);
    return this._http.get(`${this.url}no-disponibles`, { params });
  }

  public crearFecha(fecha: any): Observable<any> {
    return this._http.post(this.url, fecha);
  }

  public bloquearFecha(resourceId: string, fechas: Date[]): Observable<any> {
    const body = {
      resourceId,
      fechas: fechas.map(fecha => fecha.toISOString()),
      metodoDePago: 'administrativo' // Añadimos el campo requerido
    };
    return this._http.post(this.url + 'bloquear', body);
  }

}
