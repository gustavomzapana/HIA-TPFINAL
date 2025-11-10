import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AutenticacionService } from '../../services/autenticacion/autenticacion.service'
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription } from 'rxjs';
import { Recurso } from '../../interfaces/recurso.interface';
import { ApiRecursoService } from '../../services/recursos/api-recurso.service';
import { EventService } from '../../shared/events/event.service';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  isMenuCollapsed = true;
  usuario: any;
  rol: string | null = null;
  private subscripcionUsuario: Subscription | undefined;
  private subscripcionEventos: Subscription | undefined;
  recursos: Recurso[] = [];
  
  constructor(
    private auth: AutenticacionService, 
    private router: Router,
    private toastr: ToastrService,
    private apiRecursos: ApiRecursoService,
    private eventService: EventService
  ) { }

  ngOnInit(): void {
    // Suscribirse al observable para mantener la sesión tras recargar
    this.subscripcionUsuario = this.auth.usuario$.subscribe(usuario => {
      console.log('Header recibe usuario:', usuario);
      this.usuario = usuario;
      this.rol = usuario?.rol || null;
    });

    // Cargar recursos iniciales
    this.getRecursos();

    // Suscribirse a eventos de actualización de recursos
    this.subscripcionEventos = this.eventService.actualizarRecursos$
      .subscribe(() => {
        console.log('Evento de actualización de recursos recibido en Header');
        this.getRecursos();
      });
  }
  ngOnDestroy(): void {
    this.subscripcionUsuario?.unsubscribe();
    this.subscripcionEventos?.unsubscribe();
  }

  cerrarSesion(): void {
    this.auth.cerrarSesion();
    this.router.navigate(['/']);
    this.toastr.success('Sesión cerrada correctamente', 'Hasta pronto');
  }

  getRecursos() {
    console.log('Obteniendo recursos en HeaderComponent...');
    this.apiRecursos.getRecursos().subscribe(
      (response) => {
        console.log('Recursos obtenidos:', response);
        this.recursos = response.filter((recurso: Recurso) => recurso.estado === 'disponible');
      },
      (error) => {
        console.error('Error al cargar los recursos:', error);
      }
    );
  }

  resetReservaComponent() {
    this.eventService.resetReservas();
  }
}
