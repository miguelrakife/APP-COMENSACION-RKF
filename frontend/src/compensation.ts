import { Clase, Guardia, ResumenCompensacion, GuardiaConCompensacion, ClaseCompensada } from './types';
import { GUARDIA_SEMANA_CAP_MIN, GUARDIA_FINDE_CAP_MIN } from './theme';

function capacidadGuardia(tipo: 'semana' | 'finde'): number {
  return tipo === 'semana' ? GUARDIA_SEMANA_CAP_MIN : GUARDIA_FINDE_CAP_MIN;
}

/**
 * Asigna clases a guardias en orden cronológico.
 * Si una clase no cabe completa en una guardia, se divide.
 */
export function calcularCompensacion(clases: Clase[], guardias: Guardia[]): ResumenCompensacion {
  // Ordenar por fecha ASC
  const clasesOrden = [...clases].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const guardiasOrden = [...guardias].sort((a, b) => a.fecha.localeCompare(b.fecha));

  const guardiasComp: GuardiaConCompensacion[] = guardiasOrden.map(g => ({
    guardia: g,
    clasesCompensadas: [],
    capacidadTotalMin: capacidadGuardia(g.tipo),
    capacidadUsadaMin: 0,
  }));

  const clasesPendientes: ClaseCompensada[] = [];
  const totalAdeudadoMin = clasesOrden.reduce((s, c) => s + c.duracionPedMin, 0);

  // Cola de "restos" pendientes de asignar (clase, minutos restantes)
  let idxGuardia = 0;

  for (const clase of clasesOrden) {
    let minutosRestantes = clase.duracionPedMin;

    while (minutosRestantes > 0 && idxGuardia < guardiasComp.length) {
      const gc = guardiasComp[idxGuardia];
      const libre = gc.capacidadTotalMin - gc.capacidadUsadaMin;

      if (libre <= 0) {
        idxGuardia++;
        continue;
      }

      const asignar = Math.min(minutosRestantes, libre);
      gc.clasesCompensadas.push({
        claseId: clase.id,
        fecha: clase.fecha,
        duracionMin: asignar,
      });
      gc.capacidadUsadaMin += asignar;
      minutosRestantes -= asignar;

      if (gc.capacidadUsadaMin >= gc.capacidadTotalMin) {
        idxGuardia++;
      }
    }

    if (minutosRestantes > 0) {
      clasesPendientes.push({
        claseId: clase.id,
        fecha: clase.fecha,
        duracionMin: minutosRestantes,
      });
    }
  }

  const totalCompensadoMin = guardiasComp.reduce((s, g) => s + g.capacidadUsadaMin, 0);
  const capacidadTotalGuardias = guardiasComp.reduce((s, g) => s + g.capacidadTotalMin, 0);

  // Saldo: capacidad total disponible - total adeudado
  // positivo = sobra capacidad (puede asumir más clases)
  // negativo = faltan guardias
  const saldoMin = capacidadTotalGuardias - totalAdeudadoMin;

  return {
    totalAdeudadoMin,
    totalCompensadoMin,
    saldoMin,
    guardias: guardiasComp,
    clasesPendientes,
  };
}
