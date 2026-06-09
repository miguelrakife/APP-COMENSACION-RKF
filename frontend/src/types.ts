// ==============================================
// TIPOS DE DATOS - SISTEMA DE COMPENSACIONES RKF
// REGLAS: 45min cron = 1h pedagógica | FIFO | Arrastre mensual
// ==============================================

export type EstadoGuardia = "ACTIVA" | "AGOTADA";
export type GuardiaType = "semana" | "finde";
export type Modalidad = "Guardia" | "Servicio";
export type OrderType = "O/E" | "O/R" | "O/C";

export interface IBloqueGuardia {
  idBloque: string;
  horaInicio: string; // formato HH:MM
  horaFin: string;
  minutosCron: number;
  horasPed: number;
}

export interface Guardia {
  id: string;
  fecha: string; // formato YYYY-MM-DD
  tipo: GuardiaType;
  modalidad: Modalidad;
  ordenTipo: OrderType;
  ordenNumero: string;
  ordenFecha: string
  
