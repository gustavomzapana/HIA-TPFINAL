import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {
  // usuario subject es para que nuestro header sea reactivo y se actualice a los inicios y cierres de session
  private usuarioSubject = new BehaviorSubject<any>(this.getUsuario());
  usuario$ = this.usuarioSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
  getUsuario(): any {
      if (typeof window !== 'undefined') { // Alternativa segura para SSR
    const usuarioStr = localStorage.getItem('usuario');
    console.log('getUsuario() lee:', usuarioStr);
    if (!usuarioStr || usuarioStr === 'undefined') return null;
    try {
      return JSON.parse(usuarioStr);
    } catch (e) {
      return null;
    }
  }
  return null;
  }

  getRol(): string | null {
    return this.getUsuario()?.rol || null;
  }

estaLogueado(): boolean {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem('token');
  }
  return false;
}

setUsuario(usuario: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('usuario', JSON.stringify(usuario));
    this.usuarioSubject.next(usuario);
  }
}
cerrarSesion(): void {
  if (typeof window !== 'undefined') {
    localStorage.clear();
    this.usuarioSubject.next(null);
  }
}
}
