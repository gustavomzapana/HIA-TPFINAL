import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Usuario } from '../../interfaces/usuario.model'
import { FormsModule, NgForm} from '@angular/forms';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-perfil',
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {


  usuario: Usuario | undefined;
  esAdmin: boolean = false;

  // Modelos para los formularios 
  profileData: any = {};
  securityData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  notificationSettings = {
    emailNotifications: true,
    reservationReminders: true,
    promotionalEmails: false
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
              private userService: UsuarioService,
              private toastr: ToastrService) { }
  ngOnInit(): void {
    //el is platform protege el acceso de local storage
    if (isPlatformBrowser(this.platformId)) {
      //traemos el usuario
      const usuarioString = localStorage.getItem('usuario');
      if (usuarioString) {
        this.usuario = JSON.parse(usuarioString);
        this.esAdmin = this.usuario?.rol === 'Administrador';
        // Initialize profileData with usuario data
        this.profileData = { ...this.usuario };
      }
    }
  }

  getFotoPerfil(): string {
    if (this.usuario && this.usuario.foto && this.usuario.foto.trim() !== '') {
      return this.usuario.foto;
    }
    return 'assets/images/perfilDefault.PNG';
  }

  onProfileSubmit(form: NgForm): void {
  if (form.valid) {
    this.userService.updateUser(this.profileData).subscribe({
      next: (response) => {
        console.log('Perfil actualizado', response);
        
        // Aquí podrías mostrar un mensaje de éxito, por ejemplo con un toast
        this.toastr.success('Perfil actualizado correctamente', 'Éxito');
        // Actualizar el usuario en la variable local
        this.usuario = { ...this.profileData };
        // Actualizar el usuario en localStorage
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('usuario', JSON.stringify(this.profileData));
        }
      },
      error: (err) => {
        console.error('Error al actualizar perfil', err);
        // mostrar toast error, etc.
      }
    });
  }
}

  onPasswordSubmit(form: NgForm): void {
  if (form.valid && this.securityData.newPassword === this.securityData.confirmPassword) {
    const passwordPayload = {
      userId: this.profileData._id, // O el ID que tengas del usuario actual
      currentPassword: this.securityData.currentPassword,
      newPassword: this.securityData.newPassword
    };

    this.userService.newPassword(passwordPayload).subscribe({
      next: () => {
        this.toastr.success('Contraseña actualizada correctamente ✅', 'Éxito');
        form.resetForm(); // Opcional: limpiar el formulario
      },
      error: (err) => {
        const mensaje = err.error?.message || 'No se pudo actualizar la contraseña ❌';
        this.toastr.error(mensaje, 'Error');
        console.error('Error al actualizar contraseña', err);
      }
    });
  } else {
    this.toastr.warning('Las contraseñas no coinciden ⚠️', 'Validación');
  }
}

  saveNotificationSettings(): void {
    console.log('Preferencias guardadas:', this.notificationSettings);
    // this.userService.updateNotificationSettings(this.notificationSettings).subscribe(...);
  }


}