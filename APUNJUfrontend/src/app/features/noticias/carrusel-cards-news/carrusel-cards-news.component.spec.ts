import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarruselCardsNewsComponent } from './carrusel-cards-news.component';

describe('CarruselCardsNewsComponent', () => {
  let component: CarruselCardsNewsComponent;
  let fixture: ComponentFixture<CarruselCardsNewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarruselCardsNewsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarruselCardsNewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
