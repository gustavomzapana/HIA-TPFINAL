import { Component } from '@angular/core';
import { NoticiasService } from '../../../services/noticias/noticias.service';
import { Noticia } from '../../../interfaces/noticia.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-formulario-noticia',
  templateUrl: './formulario-noticia.component.html',
  styleUrls: ['./formulario-noticia.component.css'],
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class FormularioNoticiaComponent {
  nuevaNoticia: Noticia = {
    titulo: '',
    message: '',
    link: '',
    imagenUrl: ''
  };

  constructor(private noticiasService: NoticiasService) { }

  onSubmit(): void {
    this.noticiasService.crearNoticia(this.nuevaNoticia).subscribe({
      next: (response) => {
        console.log('Noticia creada con éxito:', response);
        alert('Noticia creada con éxito!');
        this.nuevaNoticia = {titulo: '', message: '', link: '', imagenUrl: '' }; // Reiniciar formulario
      },
      error: (error) => {
        console.error('Error al crear la noticia:', error);
        alert('Hubo un error al crear la noticia. Por favor, inténtalo de nuevo.');
      }
    });
  }
}
