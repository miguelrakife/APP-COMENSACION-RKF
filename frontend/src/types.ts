// ==============================================
// TIPOS DE DATOS - SISTEMA DE COMPENSACIONES RKF
// ==============================================

export type EstadoGuardia = "ACTIVA" | "AGOTADA";
export type GuardiaType = "semana" | "finde";
export type Modalidad = "Guardia" | "Servicio";
export type OrderType = "O/E" | "O/R" | "O/C";

// ✅ Ahora es texto libre, no lista fija
export type Asignatura = string;

export interface IBloqueGuardia {
  idBloque: string;
  horaInicio: string;
  horaFin: string;
  minutosCron: number;
  horasPed: number;
}

export interface Guardia {
  id: string;
  fecha: string;
  tipo: GuardiaType;
  modalidad: Modalidad;
  ordenTipo: OrderType;
  ordenNumero: string;
  ordenFecha: string;
  asignatura: Asignatura; // Nombre de la materia
  createdAt: string;
}

export interface ICompensacion {
  id: string;
  clases: number;
  fecha: string;
  mesAnio: string;
  nombreMes: string;
  asignatura: Asignatura;
  horasPedCompensadas: number;
  detalleConsumo: Array<{
    fechaGuardia: string;
    horasConsumidas: number;
    saldoRestante: number;
  }>;
  fechaRegistro: string;
}

export interface IResumenAsignatura {
  asignatura: Asignatura;
  totalHoras: number;
  horasUsadas: number;
  saldo: number;
}
