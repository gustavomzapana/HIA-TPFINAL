import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConditionsReservaComponent } from './conditions.component';

describe('ConditionsReservaComponent', () => {
  let component: ConditionsReservaComponent;
  let fixture: ComponentFixture<ConditionsReservaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConditionsReservaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConditionsReservaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
