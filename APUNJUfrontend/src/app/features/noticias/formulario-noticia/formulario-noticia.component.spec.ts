import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioNoticiaComponent } from './formulario-noticia.component';

describe('FormularioNoticiaComponent', () => {
  let component: FormularioNoticiaComponent;
  let fixture: ComponentFixture<FormularioNoticiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioNoticiaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioNoticiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
