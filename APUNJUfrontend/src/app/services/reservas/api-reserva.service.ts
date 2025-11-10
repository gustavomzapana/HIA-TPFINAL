import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments';

@Injectable({
  providedIn: 'root'
})
export class ApiReservaService {

  constructor(private _http: HttpClient) { }

  url = environment.apiUrl + "/api/reservas/";

  public crearReserva(reserva: any): Observable<any> {
    return this._http.post(this.url, reserva);
  }

  public getReservasPorRecurso(recursoId: string): Observable<any> {
    return this._http.get(`${this.url}recurso/${recursoId}`);

  }
  public editarReserva(reservaId: string, datos: any): Observable<any> {
    return this._http.put(`${this.url}editar/${reservaId}`, datos);
  }

  public eliminarReserva(reservaId: string): Observable<any> {
    return this._http.delete(`${this.url}${reservaId}`);
  }

  public reservasPorMesEnAnio(anio: number): Observable<any> {
    return this._http.get(`${this.url}cantidad/${anio}`);
  }

  public getReservasPorDni(dni: string): Observable<any> {
    return this._http.get(`${this.url}dni?dni=${dni}`);
  }

  public enviarComprobante(userId: string, pdfBuffer: string): Observable<any> {
    const data={
      userId: userId,
      pdfBuffer: pdfBuffer
    };
    
    return this._http.post(`${this.url}enviar`, data);
  }

}
