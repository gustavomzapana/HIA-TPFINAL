import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservaAdministradorComponent } from './reserva-administrador.component';

describe('ReservaAdministradorComponent', () => {
  let component: ReservaAdministradorComponent;
  let fixture: ComponentFixture<ReservaAdministradorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservaAdministradorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservaAdministradorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
