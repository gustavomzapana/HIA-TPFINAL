import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Usuario } from '../../interfaces/usuario.model';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
declare var bootstrap: any;

@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Importa ReactiveFormsModule aquí
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.css']
})
export class FormularioComponent implements OnInit {

  invitadoForm!: FormGroup; // Usamos '!' para asegurar que se inicializará en ngOnInit

  @Output() invitadoGuardado = new EventEmitter<Usuario>(); // Emite el invitado cuando se guarda

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService, // Inyecta el servicio
    private toastr: ToastrService, // Inyecta Toastr si lo usas
    private router: Router // 👈 agregá esto
  ) { }
  ngOnInit(): void {
    this.invitadoForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      dni: ['', Validators.required],
      telefono: [''], // Campo opcional, sin validador 'required'
      email: ['', [Validators.required, Validators.email]],
      fNacimiento: ['', Validators.required]
    });
  }

  // Getter para acceder fácilmente a los controles del formulario en el template
  get f() { return this.invitadoForm.controls; }

  loading = false;
  onSubmit(): void {
  if (this.invitadoForm.valid) {
    this.loading = true; // Mostrar spinner

    const nuevoInvitado: Usuario = this.invitadoForm.value;
    this.usuarioService.altaInvitado(nuevoInvitado).subscribe({
      next: (invitado) => {
        this.toastr.success('Usuario Invitado creado correctamente ✅', 'Éxito');
        this.invitadoGuardado.emit(invitado);
        this.resetForm();

        // Mostrar el modal de éxito
        const modalElement = document.getElementById('modalExitoRegistro')!;
        const modal = new bootstrap.Modal(modalElement);
        modal.show();

        // Redirigir cuando se cierre el modal (ya sea manual o automático)
        modalElement.addEventListener('hidden.bs.modal', () => {
          this.router.navigate(['/'], { replaceUrl: true });
        });

        // Cerrar el modal automáticamente luego de 2 segundos
        setTimeout(() => {
          modal.hide(); // Esto dispara el evento 'hidden.bs.modal'
        }, 2000);

        this.loading = false; // Ocultar spinner
      },
      error: (error) => {
        // Extraemos el mensaje del backend si existe, sino usamos uno genérico
        const mensajeError = error.error?.message || 'No se pudo crear el usuario ❌';
        this.toastr.error(mensajeError, 'Error');
        console.error('Error al crear usuario', error);
        this.loading = false; // Ocultar spinner en error
      }
    });
  } else {
    this.invitadoForm.markAllAsTouched();
    this.toastr.error('Formulario inválido. Revise los campos.', 'Error');
  }
}

  resetForm(): void {
    this.invitadoForm.reset();
    // Para limpiar las clases de validación después de un reset si quieres:
    Object.keys(this.invitadoForm.controls).forEach(key => {
      this.invitadoForm.get(key)?.setErrors(null);
    });
  }

mostrarConfirmacion(): void {
  if (this.invitadoForm.valid) {
    const modal = new bootstrap.Modal(document.getElementById('modalConfirmarRegistro')!);
    modal.show();
  } else {
    this.invitadoForm.markAllAsTouched();
    this.toastr.error('Formulario inválido. Revise los campos.', 'Error');
  }
}

}
