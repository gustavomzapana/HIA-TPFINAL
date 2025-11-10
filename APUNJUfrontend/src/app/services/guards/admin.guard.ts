import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AutenticacionService } from '../../services/autenticacion/autenticacion.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private auth: AutenticacionService, private router: Router,
    private toastr: ToastrService,
  ) {}

  canActivate(): boolean {
    const usuario = this.auth.getUsuario();
    if (usuario && usuario.rol && usuario.rol === 'Administrador') {
      return true;
    }
    // Redirige si no es admin
    this.router.navigate(['/']);
    /*
    this.toastr.info('Debes ser un administrador para acceder a esta página', '', {
      timeOut: 3000,  // 3 segundos
      progressBar: true,
      progressAnimation: 'decreasing',
      closeButton: true
    });
    */
    return false;
  }
}