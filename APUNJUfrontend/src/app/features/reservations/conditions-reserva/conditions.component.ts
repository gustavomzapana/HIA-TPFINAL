import { Component, ElementRef, ViewChild, AfterViewInit, Output, EventEmitter, HostListener, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-conditions-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './conditions-reserva.component.html',
  styleUrls: ['./conditions-reserva.component.css']
})
export class ConditionsReservaComponent implements AfterViewInit, OnDestroy {

  @Output() condicionesAceptadas = new EventEmitter<any>();
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  hasScrolledToBottom = false;
  aceptoCondiciones = false;
  activeSection = 'reservas';
  private observer!: IntersectionObserver;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.setupIntersectionObserver();
    this.checkIfScrolledToBottom();
  }

  private setupIntersectionObserver() {
    const options = {
      root: this.scrollContainer.nativeElement, // Usamos el contenedor como raíz
      rootMargin: '0px',
      threshold: 0.5
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.activeSection = entry.target.id;
        }
      });
    }, options);

    // Observar todas las secciones dentro del contenedor
    const sections = this.scrollContainer.nativeElement.querySelectorAll('.term-section');
    sections.forEach((section: Element) => {
      this.observer.observe(section);
    });
  }

  scrollTo(sectionId: string, event: Event): void {
    event.preventDefault();
    this.activeSection = sectionId;
    const element = document.getElementById(sectionId);
    const container = this.scrollContainer.nativeElement;

    if (element && container) {
      // Calculamos la posición relativa al contenedor
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const relativeTop = elementRect.top - containerRect.top + container.scrollTop;

      // Hacemos scroll solo dentro del contenedor
      container.scrollTo({
        top: relativeTop,
        behavior: 'smooth'
      });
    }
  }

  @HostListener('scroll', ['$event'])
  onScroll(event: any) {
    this.checkIfScrolledToBottom();
  }

  private checkIfScrolledToBottom() {
    const container = this.scrollContainer.nativeElement;
    // Añadimos un margen de 10px para ser más tolerantes en dispositivos móviles
    const margin = 10;
    const isAtBottom = Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight) <= margin;
    
    if (this.hasScrolledToBottom !== isAtBottom) {
      this.hasScrolledToBottom = isAtBottom;
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  onCondicionesAceptadas() {
    this.condicionesAceptadas.emit();
  }
}
