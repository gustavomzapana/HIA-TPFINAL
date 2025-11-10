import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private resetReservasSource = new Subject<void>();
  resetReservas$ = this.resetReservasSource.asObservable();
  
  private actualizarRecursosSource = new Subject<void>();
  actualizarRecursos$ = this.actualizarRecursosSource.asObservable();
  
  resetReservas() {
    this.resetReservasSource.next();
  }
  
  actualizarRecursos() {
    this.actualizarRecursosSource.next();
  }
  
  constructor() { }
}
