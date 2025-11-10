import { Component, OnInit, OnDestroy, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AutenticacionService } from '../../services/autenticacion/autenticacion.service';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments';

declare const google: any; // Declara 'google' para evitar errores de TypeScript

@Component({
  selector: 'app-google-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  constructor(private ngZone: NgZone, private router: Router,
     @Inject(PLATFORM_ID) private platformId: Object,
    private usuarioService: UsuarioService,
    private toastr: ToastrService,
    private autenticacionService: AutenticacionService
  ) {}
  googleClientId: string = environment.googleClientId;
  ngOnInit(): void {
   // console.log('Origen del navegador:', location.origin);
 //pregunta si el DOM está listo y si se está ejecutando en el navegador
  if (isPlatformBrowser(this.platformId)) {
    // Carga el script de Google GSI (Google Sign-In)
        this.loadGoogleScript();
        // Asegura que Angular detecte cambios al manejar la respuesta
        (window as any).handleCredentialResponse = this.handleCredentialResponse.bind(this);
      }
  }

private loadGoogleScript(): void {
 const script = document.createElement('script');
 script.src = 'https://accounts.google.com/gsi/client';
 script.async = true;
 script.defer = true;
 script.id = 'google-jwt';
  script.onerror = () => {
    console.error('Error al cargar el script de Google Sign-In');
    alert('Error al conectar con Google Sign-In. Verificá tu Client ID y configuración de origen.');
  };
 document.head.appendChild(script);
 }

/**
 * Maneja la respuesta de credenciales de Google después de un inicio de sesión exitoso.
 * Contiene el token JWT con la información del usuario.
 * @param response El objeto de respuesta de credenciales de Google.
 */
//metodo que se comunica con google, ademas obtiene y envia el token de google a validar en el backend, devolviendo
//datos del usuario y un toke json para proteger rutas
 handleCredentialResponse(response: any): void {
  this.ngZone.run(() => {
    const idToken = response.credential;

    // Mostrar por consola el token de Google (opcional)
    console.log('Token JWT ID codificado:', idToken);

    // Enviar el token al backend para validarlo y obtener el JWT y datos reales
    this.usuarioService.loginWithGoogle(idToken).subscribe({
      next: (res) => {
        console.log('Respuesta del backend:', res);

        // Guardar token de sesión y datos del usuario en el navegador para que no se este iniciando sesion cada rato
        localStorage.setItem('token', res.token);
        console.log('Usuario recibido del backend:', res.usuario);
        localStorage.setItem('usuario', JSON.stringify(res.usuario));
        //para mantener el header actualizado
        this.autenticacionService.setUsuario(res.usuario);
        // guardamos los datos en local storage, redireccionamos a la vista Panel
        // y mostramos toast
        console.log("mostrando toast y usuario guardado en storage")
        this.toastr.success('Login exitoso');
        console.log("toast mostrado")
          setTimeout(() => {
          this.router.navigate(['/usuario/perfil']).then(success => {
          if (success) {
            console.log('Navegación exitosa a usuario/panel');
          } else {
            console.error('Navegación fallida');
          }
        }).catch(err => {
          console.error('Error navegando:', err);
        });
        }, 100);
        
      },
      error: (err) => {
        console.error('Error en login con backend:', err);
        this.toastr.error('El usuario no existe. Por favor, comuniquese con un Administrador', 'Error');
      }
    });
  });
}

// Login Normal mediante Usuario y Contraseña
loginNormal(): void {
  // Obtén los valores de los inputs (puedes usar ngModel o template reference variables para hacerlo más Angular)
  const dni = (document.getElementById('dniInput') as HTMLInputElement).value;
  const password = (document.getElementById('passwordInput') as HTMLInputElement).value;
  console.log("Usuario: ", dni)
  // Valida campos
  if (!dni || !password) {
    this.toastr.error('Completa todos los campos', 'Error');
    return;
  }

  // Llama al servicio para hacer login
  this.usuarioService.loginNormal({ dni, password }).subscribe({
    next: (res) => {
      // Igual que con Google
      localStorage.setItem('token', res.token);
      localStorage.setItem('usuario', JSON.stringify(res.usuario));
      this.autenticacionService.setUsuario(res.usuario);
      this.toastr.success('Login exitoso');
      this.router.navigate(['/usuario/perfil']);
    },
    error: (err) => {
      this.toastr.error('Usuario o contraseña incorrectos', 'Error');
    }
  });
}
dniRecuperacion: string = '';

restaurarContrasena(){
  if (!this.dniRecuperacion) {
    this.toastr.error('Completa el campo DNI', 'Error');
    return;
  }

  this.usuarioService.resetPassword(this.dniRecuperacion).subscribe({
    next: (res) => {
      this.toastr.success('Se restauró la contraseña correctamente. Por favor, revisá tu correo electrónico.', 'Éxito');
      this.dniRecuperacion = '';

    },
    error: (err) => {
      const errorMessage = err.error?.message || 'Error al intentar restaurar la contraseña';
      console.error('Error al restaurar contraseña:', errorMessage);
      this.toastr.error(errorMessage, 'Error');
    }
  });
}

}