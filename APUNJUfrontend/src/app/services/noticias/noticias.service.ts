import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Noticia } from '../../interfaces/noticia.interface';
import { environment } from '../../../environments';

@Injectable({
  providedIn: 'root'
})
export class NoticiasService {
  private apiUrl = environment.apiUrl + '/api/noticias/';

  constructor(private http: HttpClient) { }

  obtenerTodasLasNoticias(page: number = 1, limit: number = 4): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  obtenerNoticiaPorId(id: number): Observable<Noticia> {
    return this.http.get<Noticia>(`${this.apiUrl}${id}`);
  }

  crearNoticia(noticia: Noticia): Observable<Noticia> {
    return this.http.post<Noticia>(this.apiUrl, noticia);
  }

  actualizarNoticia(id: number, noticia: Noticia): Observable<Noticia> {
    return this.http.put<Noticia>(`${this.apiUrl}${id}`, noticia);
  }

  eliminarNoticia(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}`);
  }

  subirImagen(formData: FormData) {
    return this.http.post<{ url: string }>(
      `${this.apiUrl}subir-imagen`,
      formData
    );
  }

 sincronizarFacebook(): Observable<any> {
  return this.http.get(`${environment.apiUrl}/api/facebook/sync`);
}

}