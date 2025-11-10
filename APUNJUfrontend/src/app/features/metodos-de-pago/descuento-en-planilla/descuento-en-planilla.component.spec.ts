import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescuentoEnPlanillaComponent } from './descuento-en-planilla.component';

describe('DescuentoEnPlanillaComponent', () => {
  let component: DescuentoEnPlanillaComponent;
  let fixture: ComponentFixture<DescuentoEnPlanillaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DescuentoEnPlanillaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DescuentoEnPlanillaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
