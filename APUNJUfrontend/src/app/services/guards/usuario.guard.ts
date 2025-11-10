import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AutenticacionService } from '../../services/autenticacion/autenticacion.service';

export const usuarioGuard: CanActivateFn = (route, state) => {
  const auth = inject(AutenticacionService);
  const router = inject(Router);

  const usuario = auth.getUsuario();
  
  if (usuario && (usuario.rol === 'Afiliado' || usuario.rol === 'Invitado')) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};