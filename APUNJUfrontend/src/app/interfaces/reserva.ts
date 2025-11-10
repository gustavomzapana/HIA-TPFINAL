import { Fecha } from "./fecha";

export interface Reserva {
    _id: string;
    resourceId: string;
    userId: string;
    pagoId: string;
    fechas: Fecha[]; // o Date[]
    metodoDePago: string;
    estado?: string;
}
