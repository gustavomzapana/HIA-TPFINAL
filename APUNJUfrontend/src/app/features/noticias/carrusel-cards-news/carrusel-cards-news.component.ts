import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router'; // ⬅️ IMPORTANTE
import { Noticia } from '../../../interfaces/noticia.interface';

@Component({
  selector: 'app-carrusel-cards-news',
  standalone: true,
  imports: [CommonModule, RouterModule], // ⬅️ AGREGADO RouterModule
  templateUrl: './carrusel-cards-news.component.html',
  styleUrls: ['./carrusel-cards-news.component.css']
})
export class CarruselCardsNewsComponent implements OnDestroy {
  @Input() noticias: Noticia[] = [];

  currentIndex = 0;
  cardsPerView = 3;
  private isBrowser = typeof window !== 'undefined';
  private resizeObserver: any;

  constructor() {
    if (this.isBrowser) {
      this.cardsPerView = this.getCardsPerView();
      this.setupResizeObserver();
    }
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      window.removeEventListener('resize', this.onResize);
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
    }
  }

  get visibleCards(): Noticia[] {
    const endIndex = this.currentIndex + this.cardsPerView;
    return endIndex <= this.noticias.length
      ? this.noticias.slice(this.currentIndex, endIndex)
      : this.noticias.slice(-this.cardsPerView);
  }

  siguiente() {
    this.currentIndex = this.currentIndex + this.cardsPerView < this.noticias.length
      ? this.currentIndex + 1
      : 0;
  }

  anterior() {
    this.currentIndex = this.currentIndex > 0
      ? this.currentIndex - 1
      : Math.max(0, this.noticias.length - this.cardsPerView);
  }

  private getCardsPerView(): number {
    if (this.isBrowser) {
      if (window.innerWidth < 768) return 1;
      if (window.innerWidth < 1200) return 2;
    }
    return 3;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (this.isBrowser) {
      this.cardsPerView = this.getCardsPerView();
    }
  }

  private setupResizeObserver() {
    if (this.isBrowser && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.cardsPerView = this.getCardsPerView();
      });

      const container = document.querySelector('.carousel-container');
      if (container) {
        this.resizeObserver.observe(container);
      }
    }
  }

  getPageIndices(): number[] {
    return Array(Math.ceil(this.noticias.length / this.cardsPerView))
      .fill(0)
      .map((_, i) => i);
  }

  isActive(pageIndex: number): boolean {
    const startIndex = pageIndex * this.cardsPerView;
    return this.currentIndex >= startIndex &&
      this.currentIndex < startIndex + this.cardsPerView;
  }

  goToPage(pageIndex: number) {
    this.currentIndex = pageIndex * this.cardsPerView;
  }
}





