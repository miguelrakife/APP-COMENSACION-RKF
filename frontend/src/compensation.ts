// ==============================================
// LÓGICA PRINCIPAL DE COMPENSACIONES
// ARRASTRE MENSUAL | FIFO | BLOQUES AUTOMÁTICOS
// ==============================================
import { IGuardia, ICompensacion } from "./types";
import {
  cronologicoAPedagogico,
  generarBloquesGuardia,
  obtenerGuardiaDisponible
} from "./utils";
import { guardarDatos, obtenerDatos } from "./storage";

// 🛡️ Registrar nueva guardia (bolsa de horas)
export const registrarGuardia = async (fecha: string, horasCronologicas: number): Promise<{exito: boolean; mensaje: string}> => {
  try {
    const minutosCron = horasCronologicas * 60;
    const horasPed = cronologicoAPedagogico(minutosCron);

    const nuevaGuardia: IGuardia = {
      id: Date.now().toString(),
      fecha,
      fechaCompleta: new Date(fecha),
      minutosCronOriginal: minutosCron,
      horasPedOriginal: Number(horasPed.toFixed(4)),
      horasPedUtilizadas: 0,
      horasPedRestantes: Number(horasPed.toFixed(4)),
      estado: "ACTIVA",
      bloquesGenerados: []
    };

    // Generar bloques y horarios automáticos
    nuevaGuardia.bloquesGenerados = generarBloquesGuardia(nuevaGuardia);

    // Guardar
    const datos = await obtenerDatos();
    datos.guardias.push(nuevaGuardia);
    await guardarDatos(datos);

    return { exito: true, mensaje: `Guardia registrada. Disponible: ${horasPed.toFixed(2)}h pedagógicas` };
  } catch (error) {
    return { exito: false, mensaje: "Error al registrar guardia" };
  }
};

// ⚖️ Consumir horas (SISTEMA FIFO: más antigua primero)
export const consumirHoras = async (horasPedNecesarias: number): Promise<{exito: boolean; detalle: any[]}> => {
  const datos = await obtenerDatos();
  let horasRestantes = horasPedNecesarias;
  const detalleConsumo: any[] = [];

  while (horasRestantes > 0.001) {
    const guardia = obtenerGuardiaDisponible(datos.guardias);
    if (!guardia) return { exito: false, detalle: [] };

    const disponible = guardia.horasPedRestantes;
    const consumo = Math.min(horasRestantes, disponible);

    // Actualizar saldos
    guardia.horasPedUtilizadas = Number((guardia.horasPedUtilizadas + consumo).toFixed(4));
    guardia.horasPedRestantes = Number((disponible - consumo).toFixed(4));

    // Cerrar si se agotó
    if (guardia.horasPedRestantes < 0.001) {
      guardia.estado = "AGOTADA";
    }

    detalleConsumo.push({
      fechaGuardia: guardia.fecha,
      horasConsumidas: consumo,
      saldoRestante: guardia.horasPedRestantes
    });

    horasRestantes -= consumo;
  }

  await guardarDatos(datos);
  return { exito: true, detalle: detalleConsumo };
};

// 📝 Registrar compensación + agrupar por mes
export const registrarCompensacion = async (
  clases: number,
  fecha: string,
  horasPedCompensar: number
): Promise<{exito: boolean; mensaje: string}> => {
  try {
    const fechaObj = new Date(fecha);
    const mesAnio = `${fechaObj.getMonth() + 1}/${fechaObj.getFullYear()}`;
    const nombreMes = fechaObj.toLocaleDateString("es-ES", { month: "long", year: "numeric" });

    // Consumir horas según regla FIFO
    const consumo = await consumirHoras(horasPedCompensar);
    if (!consumo.exito) return { exito: false, mensaje: "No hay horas disponibles en guardias activas" };

    // Guardar compensación
    const nuevaCompensacion: ICompensacion = {
      id: Date.now().toString(),
      clases,
      fecha,
      mesAnio,
      nombreMes,
      horasPedCompensadas: horasPedCompensar,
      detalleConsumo: consumo.detalle,
      fechaRegistro: new Date().toISOString()
    };

    const datos = await obtenerDatos();
    datos.compensaciones.push(nuevaCompensacion);
    await guardarDatos(datos);

    return { exito: true, mensaje: `Compensación registrada para ${nombreMes}. Se usaron guardias por antigüedad.` };
  } catch (error) {
    return { exito: false, mensaje: "Error al registrar compensación" };
  }
};
