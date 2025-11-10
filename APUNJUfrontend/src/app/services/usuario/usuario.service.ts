import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from '../../interfaces/usuario.model';
import { environment } from '../../../environments';
@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
 private apiUrl = environment.apiUrl + '/api/usuarios'; // Replace with your API URL

 constructor(private http:HttpClient) {}

altaUser(user: any): Observable<any> {
  console.log( 'Datos enviados',user);
  return this.http.post<any>(`${this.apiUrl}/`, user);
}
altaInvitado(user: any): Observable <any>{
  console.log('Datos del Invitado',user)
  return this.http.post<any>(`${this.apiUrl}/invitado/`,user);
}
//Encargado de llevar el token de google de usuario para ser validado en el backend
loginWithGoogle(idToken: string): Observable<any> {
    return this.http.post( environment.apiUrl + '/api/autenticacion/login/google', {
      id_token: idToken
    });
}

getUsers(): Observable<any>{
  return this.http.get(`${this.apiUrl}/`);
}

getUserByLegajo(legajo: string): Observable<any>{
  return this.http.get<any>(`${this.apiUrl}/legajo/${legajo}`);
}

getUserByEmail(email:string): Observable<any>{
  return this.http.get<any>(`${this.apiUrl}/email/${email}`);
}
getUsersByDependencia(dependencia:string):Observable<any>{
return this.http.get<any>(`${this.apiUrl}/dependencia/${dependencia}`);
}
getUserByDni(dni: string): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/dni/${dni}`);
}
getInvitados(): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/invitados`);
}
getDesafiliados(): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/desafiliados`);
}
updateUser(user: Usuario): Observable<any> {
  // Supone que el usuario tiene un campo 'legajo' como identificador único
  return this.http.put<any>(`${this.apiUrl}/${user._id}`, user);
}
deleteUser(_id: string): Observable<any>{
  return this.http.delete(`${this.apiUrl}/${_id}`);
}
loginNormal(data: { dni: string; password: string }): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/login`, data);
}
newPassword(data: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}): Observable<any> {
  return this.http.put<any>(`${this.apiUrl}/password`, data);
}
resetPassword(dni: string): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/restauracion/${dni}`);
};
}