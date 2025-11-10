import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LoginComponent } from './features/login/login.component';
import { FormularioComponent } from './features/formulario/formulario.component';
import { PerfilComponent } from './features/perfil/perfil.component';
import { AdminGuard } from './services/guards/admin.guard';
import { GestionComponent } from './features/gestion/gestion.component';
import { CapacitacionesComponent } from './features/activities/capacitaciones/capacitaciones.component';
import { CursosComponent } from './features/activities/cursos/cursos.component';
import { TalleresComponent } from './features/activities/talleres/talleres.component';
import { GestionActividadesComponent } from './features/activities/gestion-actividades/gestion-actividades.component';
import { ReservaComponent } from './features/reservations/reserva/reserva.component';
import { LogGuard } from './services/guards/log.guard';
import { InscripcionComponent } from './features/inscripcion/inscripcion.component';
import { ReservaAdministradorComponent } from './features/reservations/reserva-administrador/reserva-administrador.component';
import { StatisticsComponent } from './features/statistics/statistics.component';
import { NoticiasPageComponent } from './features/noticias/noticias-page/noticias-page.component';
import { ContactoComponent } from './features/contacto/contacto.component';
import { NoticiaDetalleComponent } from './features/noticias/noticia-detalle/noticia-detalle.component';
import { GestionNoticiasComponent } from './features/noticias/gestion-noticias/gestion-noticias.component';
import { GestionRecursosComponent } from './features/recursos/gestion-recursos/gestion-recursos.component';
import { usuarioGuard } from './services/guards/usuario.guard';
import { MisActividadesComponent } from './features/mis-actividades/mis-actividades.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'reservas', canActivate: [LogGuard], component: ReservaComponent },
  { path: 'usuario/login', component: LoginComponent },
  { path: 'usuario/perfil', canActivate: [LogGuard], component: PerfilComponent },
  { path: 'usuario/registro', component: FormularioComponent },
  { path: 'usuario/gestion', component: GestionComponent, canActivate: [AdminGuard] },//el guard cuida la ruta de otros usuarios
  { path: 'usuario/mis-actividades', canActivate: [usuarioGuard], component: MisActividadesComponent },
  { path: 'actividades/capacitaciones', component: CapacitacionesComponent },
  { path: 'actividades/cursos', component: CursosComponent },
  { path: 'actividades/talleres', component: TalleresComponent },
  { path: 'usuario/gestion-actividades', component: GestionActividadesComponent, canActivate: [AdminGuard] }, //ruta para gestionar actividades, protegida por AdminGuard
  { path: 'inscripcion', component: InscripcionComponent}, //ruta para inscribirse en actividades, con un parámetro de tipo y id
   //ruta para inscribirse en actividades  
  { path: 'usuario/gestion-reservas', component: ReservaAdministradorComponent, canActivate: [AdminGuard] }, //ruta para gestionar reservas, protegida por AdminGuard
  { path: 'recursos/gestion-recursos', component: GestionRecursosComponent, canActivate: [AdminGuard] }, //ruta para gestionar recursos, protegida por AdminGuard
  { path: 'estadisticas', component: StatisticsComponent, canActivate: [AdminGuard] }, //ruta para ver estadísticas, protegida por AdminGuard
  { path: 'noticias', component: NoticiasPageComponent},
  { path: 'contacto', component: ContactoComponent},
  { path: 'usuario/gestion-noticias', component: GestionNoticiasComponent, canActivate: [AdminGuard] },
  { path: 'noticias-detalle', component: NoticiaDetalleComponent } 

];
