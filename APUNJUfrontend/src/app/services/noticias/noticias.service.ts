import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Asegúrate de que HttpClientModule esté importado en tu app.config.ts o app.module.ts
import { Observable } from 'rxjs';
import { Noticia } from '../../interfaces/noticia.interface'; // Importa la interfaz que creaste
import { environment } from '../../../environments';
@Injectable({
  providedIn: 'root' // Esto hace que el servicio esté disponible en toda la app
})
export class NoticiasService {
  private apiUrl = environment.apiUrl + '/api/noticias/'; // **¡Importante! Cambia esto por la URL de tu backend**

  constructor(private http: HttpClient) { }

  obtenerTodasLasNoticias(): Observable<Noticia[]> {
    return this.http.get<Noticia[]>(this.apiUrl);
  }

  obtenerNoticiaPorId(id: string): Observable<Noticia> {
    return this.http.get<Noticia>(`${this.apiUrl}${id}`);
  }

  crearNoticia(noticia: Noticia): Observable<Noticia> {
    return this.http.post<Noticia>(this.apiUrl, noticia);
  }

  actualizarNoticia(id: string, noticia: Noticia): Observable<Noticia> {
    return this.http.put<Noticia>(`${this.apiUrl}${id}`, noticia);
  }

  eliminarNoticia(id: string): Observable<void> {
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