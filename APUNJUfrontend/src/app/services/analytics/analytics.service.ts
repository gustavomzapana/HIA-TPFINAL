import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

declare let gtag: Function;

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  constructor(private router: Router) { }

  public init() {
    this.trackPageViews();
  }

  private trackPageViews() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      if (typeof gtag !== 'undefined') {
        gtag('config', 'G-4RC837RCK1', {
          page_path: event.urlAfterRedirects
        });
      }
    });
  }

  public trackEvent(eventName: string, eventParams: any = {}) {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, eventParams);
    }
  }
}