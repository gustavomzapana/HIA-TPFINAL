import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'date-range-picker',
  templateUrl: './date-range-picker.component.html',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateRangePicker implements OnInit {
  minDate: Date;
  range: FormGroup;
  
  constructor(private fb: FormBuilder) {
    // Establecer la fecha mínima al día actual a las 00:00:00
    this.minDate = new Date();
    this.minDate.setHours(0, 0, 0, 0);
    
    // Inicializar el formulario
    this.range = this.fb.group({
      start: [null, Validators.required],
      end: [null, Validators.required]
    });
  }

  ngOnInit() {
    // Validación inicial
    this.validateDateRange();
    
    // Suscribirse a cambios en la fecha de inicio para actualizar validaciones
    this.range.get('start')?.valueChanges.subscribe(() => {
      this.validateDateRange();
    });
    
    this.range.get('end')?.valueChanges.subscribe(() => {
      this.validateDateRange();
    });
  }

  // Validar que la fecha de fin no sea anterior a la de inicio
  validateDateRange() {
    const startDate = this.range.get('start')?.value;
    const endDate = this.range.get('end')?.value;
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (end < start) {
        this.range.get('end')?.setErrors({ 'invalidDateRange': true });
      } else if (this.range.get('end')?.hasError('invalidDateRange')) {
        this.range.get('end')?.setErrors(null);
      }
    }
  }
}
