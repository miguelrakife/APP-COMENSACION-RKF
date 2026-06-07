// ==============================================
// UTILIDADES Y CÁLCULOS - REGLAS FIJAS
// ==============================================
import { IGuardia, IBloqueGuardia } from "./types";

// REGLA PRINCIPAL: 45 minutos cronológicos = 1 hora pedagógica
export const MINUTOS_POR_HORA_PEDAGOGICA = 45;
export const HORA_INICIO_BLOQUE = 8 * 60; // 08:00 en minutos del día

// Conversiones
export const cronologicoAPedagogico = (minutosCron: number): number => {
  return minutosCron / MINUTOS_POR_HORA_PEDAGOGICA;
};

export const pedagogicoACronologico = (horasPed: number): number => {
  return horasPed * MINUTOS_POR_HORA_PEDAGOGICA;
};

// Formateos para mostrar
export const formatearTiempoPedagogico = (horasPed: number): string => {
  const totalMin = Math.round(horasPed * MINUTOS_POR_HORA_PEDAGOGICA);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
};

export const formatearMinutosCronologicos = (minutos: number): string => {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
};

export const minutosAHorario = (minutos: number): string => {
  const minutosAjustados = minutos % (24 * 60);
  const h = Math.floor(minutosAjustados / 60);
  const m = minutosAjustados % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

// Generar bloques automáticos (empieza 08:00, sigue donde terminó)
export const generarBloquesGuardia = (guardia: IGuardia): IBloqueGuardia[] => {
  const bloques: IBloqueGuardia[] = [];
  let minutosDisponibles = guardia.minutosCronOriginal;
  let minutosInicio = HORA_INICIO_BLOQUE;

  while (minutosDisponibles > 0.1) {
    const minutosBloque = Math.min(minutosDisponibles, (24 * 60) - (minutosInicio % (24 * 60)));
    if (minutosBloque <= 0) break;

    const minutosFin = minutosInicio + minutosBloque;
    const horasPedBloque = cronologicoAPedagogico(minutosBloque);

    bloques.push({
      idBloque: Date.now().toString() + Math.random().toString(),
      horaInicio: minutosAHorario(minutosInicio),
      horaFin: minutosAHorario(minutosFin),
      minutosCron: minutosBloque,
      horasPed: Number(horasPedBloque.toFixed(4))
    });

    minutosDisponibles -= minutosBloque;
    minutosInicio = minutosFin;
  }

  return bloques;
};

// Sistema FIFO: obtener guardia MÁS ANTIGUA y ACTIVA
export const obtenerGuardiaDisponible = (guardias: IGuardia[]): IGuardia | null => {
  return guardias
    .filter(g => g.estado === "ACTIVA" && g.horasPedRestantes > 0.001)
    .sort((a, b) => a.fechaCompleta.getTime() - b.fechaCompleta.getTime())[0] || null;
};

// Agrupar compensaciones por mes
export const agruparCompensacionesPorMes = (compensaciones: any[]) => {
  return compensaciones.reduce((grupos: any, comp: any) => {
    if (!grupos[comp.mesAnio]) {
      grupos[comp.mesAnio] = {
        nombreMes: comp.nombreMes,
        totalHorasPed: 0,
        registros: []
      };
    }
    grupos[comp.mesAnio].totalHorasPed += comp.horasPedCompensadas;
    grupos[comp.mesAnio].registros.push(comp);
    return grupos;
  }, {});
};
