export interface Fecha{
    fecha: Date;
    estado: string; // 'reservado', 'bloqueado, 'disponible'
    reservaId: string;
    recursoId: string;
}
