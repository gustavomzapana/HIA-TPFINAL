import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments';

@Injectable({
  providedIn: 'root'
})
export class ApiMpService {

  private apiUrl = environment.apiUrl + '/api/pagos'; 

  constructor(private http: HttpClient) { }

  getPagos() {
    return this.http.get(this.apiUrl);
  }

  getPagoById(id: string):Observable<any>{
    const params = new HttpParams().set('id', id);
    return this.http.get(`${this.apiUrl}/pago`, { params });
  }

  createPago(data: any) {
    console.log('Creating payment with data:', data);
    return this.http.post(this.apiUrl, data);
  }

  createPagoMercadoPago(data: any): Observable<any>{
    return this.http.post(`${this.apiUrl}/mercadopago`, data);
  }

  createPagoPlanilla(data: any): Observable<any>{
    return this.http.post(`${this.apiUrl}/planilla`, data);
  }

  updatePago(id: string, data: any) : Observable<any>{
    const params = new HttpParams().set('id', id);
    return this.http.put(`${this.apiUrl}/update`, data, { params });
  }
}
