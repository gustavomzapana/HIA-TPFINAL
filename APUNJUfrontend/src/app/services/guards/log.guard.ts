import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AutenticacionService } from '../../services/autenticacion/autenticacion.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class LogGuard implements CanActivate {
  constructor(private auth: AutenticacionService, private router: Router,
    private toastr: ToastrService,
  ) {}

  canActivate(): boolean {
    const usuario = this.auth.getUsuario();
    if (usuario) {
      return true;
    }
    this.router.navigate(['/usuario/login']);
    this.toastr.info('Debes iniciar sesión para acceder a esta página', '', {
      timeOut: 3000,  // 3 segundos
      progressBar: true,
      progressAnimation: 'decreasing',
      closeButton: true
    });
    return false;
  }
}