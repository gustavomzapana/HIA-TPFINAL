import { AfterViewInit, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Usuario } from '../../interfaces/usuario.model'
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-gestion',
  imports: [CommonModule,FormsModule],
  templateUrl: './gestion.component.html',
  styleUrl: './gestion.component.css'
})
export class GestionComponent implements AfterViewInit,OnInit{

  constructor(private usuarioService:UsuarioService,
  private toastr: ToastrService,
  @Inject(PLATFORM_ID) private platformId: Object
){}
//para mantener la sesion abierta del admin
 usuario: Usuario | undefined;
 esAdmin: boolean=false;
  ngOnInit(): void {
    //el is platform protege el acceso de local storage
    if (isPlatformBrowser(this.platformId)) {
      //traemos el usuario
      const usuarioStr = localStorage.getItem('usuario');
      console.log(usuarioStr);
      if (usuarioStr) {
        this.usuario = JSON.parse(usuarioStr);
        this.esAdmin = this.usuario?.rol === 'Administrador';
      }
    }
  }
ngAfterViewInit(): void {
  //Para limpiar los modales en caso de que abra el edit y cancele
  // Modal Afiliado
  const userModal = document.getElementById('userModal');
  if (userModal) {
    userModal.addEventListener('hidden.bs.modal', () => {
      this.usuarioSeleccionado = this.getAfiliadoVacio();
      this.editMode = false;
    });
  }
  // Modal Invitado
  const invitadoModal = document.getElementById('invitadoModal');
  if (invitadoModal) {
    invitadoModal.addEventListener('hidden.bs.modal', () => {
      this.nuevoInvitado = this.getInvitadoVacio();
      this.editMode = false;
    });
  }
}
currentPage = 1;
itemsPerPage = 10;

loading = false;

get totalPages(): number {
  return Math.ceil(this.usuarios.length / this.itemsPerPage);
}

editMode: boolean = false;
mostrarBotonBaja: boolean = true;

//para almacenar todos los usuarios tanto en busquedas x dependencia como por legajo e email
usuarios: Usuario[] = [];
//usado para crear un afiliado e modificar
usuarioSeleccionado: Usuario = this.getAfiliadoVacio();
  //usado para crear un invitado
nuevoInvitado: Usuario = this.getAfiliadoVacio();
getAfiliadoVacio(): Usuario {
  return {
    nombre: '',
    apellido: '',
    email: '',
    legajo: '',
    fNacimiento: '',
    dni: '',
    domicilio: '',
    telefono: '',
    foto: '',
    dependencia: '',
    esAfiliado: true,
    rol: '',
    activo: true
  };
}
getInvitadoVacio(): Usuario {
  return {
    nombre: '',
    apellido: '',
    email: '',
    legajo: '-',
    fNacimiento: '',
    dni: '',
    domicilio: '',
    telefono: '',
    foto: '-',
    dependencia: '-',
    esAfiliado: false,
    rol: 'Invitado',
    activo: true
  };
}
//variables que toman un valor para busquedas
dependencia: string ="";
legajo: string ="";
dni: string="";

guardarAfiliado(usuarioForm: NgForm) {
  if (usuarioForm.invalid) return;
  if (this.editMode) {
    // Modo edición
    this.modificarAfiliado(usuarioForm);
  } else {
    // Modo alta
    this.altaAfiliado(usuarioForm);
  }
}
guardarInvitado(invitadoForm: NgForm) {
  if (invitadoForm.invalid) return;
  if (this.editMode) {
    // Modo edición
    this.modificarInvitado(invitadoForm);
  } else {
    // Modo alta
    this.altaInvitado(invitadoForm);
  }
}
altaAfiliado(usuarioForm: NgForm): void {
    if (usuarioForm.invalid) return;  
    this.loading = true; // Mostrar spinner
    this.usuarioSeleccionado.fNacimiento = this.usuarioSeleccionado.fNacimiento.toString();
    this.usuarioService.altaUser(this.usuarioSeleccionado).subscribe({
      next: (nuevoUsuario) => {
        console.log('Usuario creado:', nuevoUsuario);
        this.toastr.success('Usuario creado correctamente ✅', 'Éxito');
        usuarioForm.resetForm();
        this.loading = false; // Ocultar spinner
      },
      error: (error) => {
        // Extraemos el mensaje del backend si existe, sino usamos uno genérico
        const mensajeError = error.error?.message || 'No se pudo crear el usuario ❌';
        this.toastr.error(mensajeError, 'Error');
        console.error('Error al crear usuario', error);
        this.loading = false; // Ocultar spinner
      }
    });
}
altaInvitado(invitadoForm: NgForm): void{
  if(invitadoForm.invalid) return;
  this.loading = true; // Mostrar spinner
  this.nuevoInvitado.fNacimiento = this.nuevoInvitado.fNacimiento.toString();
  this.usuarioService.altaInvitado(this.nuevoInvitado).subscribe({
      next: (invitado) => {
        console.log('Usuario creado:', invitado);
        this.toastr.success('Usuario Invitado creado correctamente ✅', 'Éxito');
        invitadoForm.resetForm();
        this.loading = false; // Ocultar spinner
      },
      error: (error) => {
        // Extraemos el mensaje del backend si existe, sino usamos uno genérico
        const mensajeError = error.error?.message || 'No se pudo crear el usuario ❌';
        this.toastr.error(mensajeError, 'Error');
        console.error('Error al crear usuario', error);
        this.loading = false; // Ocultar spinner
      }
  });
}

usuarioPorLegajo(){
  this.mostrarBotonBaja = true;
  console.log("Usuario con Legajo:", this.legajo)
  this.usuarioService.getUserByLegajo(this.legajo).subscribe({
    next:(usuarioFiltrado) => {
      this.usuarios = [usuarioFiltrado];
        this.toastr.success('Usuario Encontrado correctamente ✅', 'Éxito');
      },
      error: (error) => {
        console.error('Error al Buscar Usuario', error.error);
        this.toastr.error('No se pudo encontrar el Usuario ❌ ', 'Error');
      }
    });
}
usuarioPorDni(){
  this.mostrarBotonBaja = true;
  console.log("Usuario con DNI:",this.dni)
  this.usuarioService.getUserByDni(this.dni).subscribe({
      next:(usuarioFiltrado) => {
        this.usuarios = [usuarioFiltrado];
        this.toastr.success('Usuario Encontrado correctamente ✅', 'Éxito');
      },
      error: (error) => {
        console.error('Error al Buscar Usuario', error.error);
        this.toastr.error('No se pudo encontrar el Usuario ❌', 'Error');
      }
    });
}

modificarAfiliado(afiliadoForm: NgForm) {
  this.mostrarBotonBaja = true;
  if (afiliadoForm.invalid) return;
  this.loading = true; // Mostrar spinner
  console.log("Afiliado a modificar", this.usuarioSeleccionado)
  this.usuarioService.updateUser(this.usuarioSeleccionado).subscribe({
    next: (usuarioActualizado) => {
      this.toastr.success('Afiliado modificado correctamente ✅', 'Éxito');
      afiliadoForm.resetForm();
      this.usuarios =[usuarioActualizado];
      this.loading = false; // Ocultar spinner
    },
    error: (error) => {
      // Extraemos el mensaje del backend si existe, sino usamos uno genérico
        const mensajeError = error.error?.message || 'No se pudo crear el usuario ❌';
        this.toastr.error(mensajeError, 'Error');
        console.error('Error al crear usuario', error);
        this.loading = false; // Ocultar spinner
    }
  });
}
modificarInvitado(invitadoForm: NgForm) {
  this.mostrarBotonBaja = true;
  if (invitadoForm.invalid) return;
  this.loading = true; // Mostrar spinner
  console.log("Invitado a modificar",this.nuevoInvitado)
  this.usuarioService.updateUser(this.nuevoInvitado).subscribe({
    next: (invitadoActualizado) => {
      this.toastr.success('Invitado modificado correctamente ✅', 'Éxito');
      invitadoForm.resetForm();
      this.usuarios= [invitadoActualizado];
      this.loading = false; // Ocultar spinner
      
    },
    error: (error) => {
      // Extraemos el mensaje del backend si existe, sino usamos uno genérico
        const mensajeError = error.error?.message || 'No se pudo crear el usuario ❌';
        this.toastr.error(mensajeError, 'Error');
        console.error('Error al crear usuario', error);
        this.loading = false; // Ocultar spinner
    }
  });
}
eliminarUsuario(usuarioEliminado: any) {
  console.log("Usuario a eliminar", usuarioEliminado.email);
  this.usuarioService.deleteUser(usuarioEliminado._id).subscribe({
    next: () => {
      this.toastr.success('Usuario eliminado correctamente ✅', 'Éxito');
      // Quita el usuario eliminado del array sin recargar toda la lista
      this.usuarios = this.usuarios.filter(u => u._id !== usuarioEliminado._id);
    },
    error: (error) => {
      console.error('Error al eliminar usuario', error);
      this.toastr.error('No se pudo eliminar el usuario ❌', 'Error');
    }
  });
}

filtrarPorDependencia() {
  console.log("dependencia seleccionada", this.dependencia);
  this.mostrarBotonBaja = true;
    this.usuarioService.getUsersByDependencia(this.dependencia).subscribe({
      next: (usuariosFiltrados) => {
        this.usuarios = usuariosFiltrados;
        if (!this.usuarios || this.usuarios.length === 0) {
          this.toastr.success('Sin usuarios en esta dependencia ', 'Éxito');
        } else {
          this.toastr.success('Usuarios filtrados correctamente', 'Éxito');
        }
      },
      error: (error) => {
        console.error('Error al filtrar usuarios', error.error);
        this.toastr.error('No se pudieron filtrar los usuarios', 'Error');
      }
    });
}

formatearFechaISO(fechaStr: string): string {
  // Ej: "25/04/1990" → "1990-04-25"
  const partes = fechaStr.split('/');
  if (partes.length === 3) {
    const [dia, mes, anio] = partes;
    return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  }
  return fechaStr; // si ya viene en formato ISO
}
abrirModalEditar(usuario: any) {
  if (usuario.rol === 'Invitado') {
    this.nuevoInvitado = { ...usuario };
    // 🟡 Formatear fecha si existe
    if (this.nuevoInvitado.fNacimiento) {
      this.nuevoInvitado.fNacimiento = this.formatearFechaISO(this.nuevoInvitado.fNacimiento);
    }
    //settimeout es para que angular termine de cargar el dom antes de buscar el modal
    setTimeout(() => {
      const modal = document.getElementById('invitadoModal');
      if (modal && (window as any).bootstrap) {
        (window as any).bootstrap.Modal.getOrCreateInstance(modal).show();
      } 
    });
  } else {
    this.editMode = true;
    this.usuarioSeleccionado = { ...usuario };
    // 🟡 Formatear fecha si existe
    if (this.usuarioSeleccionado.fNacimiento) {
      this.usuarioSeleccionado.fNacimiento = this.formatearFechaISO(this.usuarioSeleccionado.fNacimiento);
    }
    setTimeout(() => {
      const modal = document.getElementById('userModal');
      if (modal && (window as any).bootstrap) {
        (window as any).bootstrap.Modal.getOrCreateInstance(modal).show();
      } 
    });
  }
}
//auxiliar para mostrar detalles del usuario
usuarioDetalle: any = null
abrirModalDetalle(usuario: any){
  this.usuarioDetalle = usuario;
  setTimeout(() => {
      const modal = document.getElementById('userDetailModal');
      if (modal && (window as any).bootstrap) {
        (window as any).bootstrap.Modal.getOrCreateInstance(modal).show();
      }
    });
}
abrirModalCrearAfiliado(){
  // Cierra el modal si está abierto
  const modal = document.getElementById('userModal');
  if (modal && (window as any).bootstrap) {
    (window as any).bootstrap.Modal.getOrCreateInstance(modal).hide();
  }
  this.editMode=false;
  this.usuarioSeleccionado = this.getAfiliadoVacio();
  // Abre el modal después de un pequeño delay para asegurar el refresco
  setTimeout(() => {
    if (modal && (window as any).bootstrap) {
      (window as any).bootstrap.Modal.getOrCreateInstance(modal).show();
    }
  }, 200);
}
abrirModalCrearInvitado(){
  // Cierra el modal si está abierto
  const modal = document.getElementById('invitadoModal');
  if (modal && (window as any).bootstrap) {
    (window as any).bootstrap.Modal.getOrCreateInstance(modal).hide();
  }

  this.editMode=false;
  this.nuevoInvitado = this.getInvitadoVacio();
  setTimeout(() => {
    if (modal && (window as any).bootstrap) {
      (window as any).bootstrap.Modal.getOrCreateInstance(modal).show();
    }
  }, 200);
}

listarDesafiliados() {
  this.mostrarBotonBaja = false;
  this.usuarioService.getDesafiliados().subscribe({
    next: (usuariosFiltrados) => {
      this.usuarios = usuariosFiltrados;
      this.toastr.success('Desafiliados listados correctamente', 'Éxito');
    },
    error: (error) => {
      console.error('Error al listar desafiliados', error);
      this.toastr.error('No se pudieron listar los desafiliados', 'Error');
    }
  });
}
listarInvitados() {
  this.mostrarBotonBaja = true;
  this.usuarioService.getInvitados().subscribe({
    next: (usuariosFiltrados) => {
      this.usuarios = usuariosFiltrados;
      this.toastr.success('Invitados listados correctamente', 'Éxito');
    },
    error: (error) => {
      console.error('Error al listar invitados', error);
      this.toastr.error('No se pudieron listar los invitados', 'Error');
    }
  });
}

}