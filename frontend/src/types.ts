export type OrderType = 'O/E' | 'O/R' | 'O/C';
export type GuardiaType = 'semana' | 'finde';
export type Modalidad = 'Guardia' | 'Servicio';

export interface Clase {
  id: string;
  fecha: string; // ISO date YYYY-MM-DD
  bloqueLabel: string; // e.g. "08:00 - 09:30" or custom
  horarioInicio: string; // HH:MM
  horarioFin: string; // HH:MM
  duracionPedMin: number; // pedagogical minutes (para capacidad interna)
  minCrono?: number; // si está presente, se muestra como "Xm" cronológicos en la tabla
  esPersonalizado: boolean;
  createdAt: string;
}

export interface Guardia {
  id: string;
  fecha: string; // ISO date YYYY-MM-DD (día de inicio de la guardia/servicio)
  tipo: GuardiaType;
  modalidad: Modalidad; // Guardia o Servicio
  ordenTipo: OrderType;
  ordenNumero: string;
  ordenFecha: string; // ISO YYYY-MM-DD
  createdAt: string;
}

export interface ClaseCompensada {
  claseId: string;
  fecha: string;
  duracionMin: number; // puede ser parcial si se dividió (min pedag)
  minCrono?: number; // si está presente, se muestra como Xm en la tabla
  partial?: boolean; // true si la clase fue dividida
}

export interface GuardiaConCompensacion {
  guardia: Guardia;
  clasesCompensadas: ClaseCompensada[];
  capacidadTotalMin: number;
  capacidadUsadaMin: number;
}

export interface ResumenCompensacion {
  totalAdeudadoMin: number;
  totalCompensadoMin: number;
  saldoMin: number; // positivo = a favor (sobre-compensado), negativo = debe
  guardias: GuardiaConCompensacion[];
  clasesPendientes: ClaseCompensada[];
}
