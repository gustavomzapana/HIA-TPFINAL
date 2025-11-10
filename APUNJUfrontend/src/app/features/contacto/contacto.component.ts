import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface FAQ {
  pregunta: string;
  respuesta: string;
  isOpen: boolean;
}

@Component({
  selector: 'app-contacto',
  imports: [CommonModule, FormsModule],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css'
})
export class ContactoComponent {

faqs: FAQ[] = [
  {
    pregunta: '¿Cómo me registro en la plataforma?',
    respuesta: 'Podés registrarte haciendo clic en "Registrarse" en la parte superior derecha e ingresando tus datos personales. También podés usar tu cuenta de Google para una autenticación más rápida.',
    isOpen: false
  },
  {
    pregunta: '¿Cómo me registro en una actividad, curso o taller?',
    respuesta: 'Una vez que inicias sesión, accedé a la sección de "Actividades". Allí podrás ver la lista de capacitaciones, cursos y talleres disponibles. Seleccioná la actividad que te interese y hacé clic en "Inscribirme".',
    isOpen: false
  },
  {
    pregunta: '¿Cómo realizo un alquiler de Cabaña?',
    respuesta: 'Una vez que inicias sesión, accedé a la sección de "Reservas". Allí podrás ver la lista de los Recursos que disponemos. Seleccioná el recurso que te interese reservar y seguí los pasos.',
    isOpen: false
  },
  {
    pregunta: '¿Qué métodos de pago están disponibles?',
    respuesta: 'Aceptamos pagos a través de Mercado Pago, donde podrás usar tarjeta de crédito, débito o saldo disponible en tu cuenta.',
    isOpen: false
  },
  {
    pregunta: '¿Dónde puedo ver mis reservas?',
    respuesta: 'Podés ver todas tus reservas accediendo a tu perfil y seleccionando la sección "Mis reservas".',
    isOpen: false
  },
  {
    pregunta: '¿Puedo cancelar una reserva?',
    respuesta: 'Sí, las reservas se pueden cancelar desde la sección "Mis reservas", siempre que se haga con al menos 24 horas de anticipación.',
    isOpen: false
  },
  {
    pregunta: '¿Cómo contacto a soporte?',
    respuesta: 'Podés enviarnos un mensaje a través de nuestras redes sociales como Facebook, Instagram o Whatsapp, disponibles en la sección "Contacto"',
    isOpen: false
  },
  {
    pregunta: '¿La plataforma es solo para afiliados a APUNJU?',
    respuesta: 'No, la plataforma está destinada a los Afiliados y a personas exentas.',
    isOpen: false
  }
];
  
  constructor() { }

  toggleFaq(index: number): void {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }
}