export interface Noticia {
  id?: number; // Primary key de Sequelize
  titulo: string;  // Título de la noticia
  message: string;       // Contenido de la noticia
  link: string;          // Enlace a la publicación
  imagenUrl?: string;    // URL de la imagen (opcional)
  origen?: 'manual' | 'facebook'; // 👈 AÑADIDO ESTO
  createdAt?: Date; // <- necesario para pipe date
  updatedAt?: Date;
}