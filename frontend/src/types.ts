// ==============================================
// TIPOS DE DATOS - SISTEMA DE COMPENSACIONES RKF
// REGLAS: 45min cron = 1h pedagógica | FIFO | Arrastre mensual
// ==============================================

export type EstadoGuardia = "ACTIVA" | "AGOTADA";

export interface IBloqueGuardia {
  idBloque: string;
  horaInicio: string; // formato HH:MM
  horaFin: string;
  minutosCron: number;
  horasPed: number;
}

export interface IGuardia {
  id: string;
  fecha: string; // formato YYYY-MM-DD
  fechaCompleta: Date;
  minutosCronOriginal: number;
  horasPedOriginal: number;
  horasPedUtilizadas: number;
  horasPedRestantes: number;
  estado: EstadoGuardia;
  bloquesGenerados: IBloqueGuardia[];
}

export interface ICompensacion {
  id: string;
  clases: number;
  fecha: string;
  mesAnio: string; // ej: "4/2026"
  nombreMes: string; // ej: "abril de 2026"
  horasPedCompensadas: number;
  detalleConsumo: Array<{
    fechaGuardia: string;
    horasConsumidas: number;
    saldoRestante: number;
  }>;
  fechaRegistro: string;
}

export interface IResumenMes {
  nombreMes: string;
  totalHorasPed: number;
  registros: ICompensacion[];
}
