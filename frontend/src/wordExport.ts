// ==============================================
// GENERADOR DOCUMENTO GOLF
// MUESTRA TODA LA LÓGICA: bloques, saldos, arrastre, consumo
// ==============================================
import { IDatosApp } from "./storage";
import { formatearTiempoPedagogico, formatearMinutosCronologicos, agruparCompensacionesPorMes } from "./utils";

export const generarDocumentoGOLF = (datos: IDatosApp): string => {
  let contenido = `DOCUMENTO GOLF - SISTEMA DE COMPENSACIONES RKF\n`;
  contenido += `==============================================\n`;
  contenido += `Regla: 45min cronológicos = 1h pedagógica | FIFO | Arrastre mensual\n\n`;

  // 🛡️ BOLSA DE GUARDIAS
  contenido += `📋 BOLSA DE GUARDIAS Y ESTADO\n`;
  contenido += `------------------------------\n`;
  if (datos.guardias.length === 0) contenido += `Sin guardias registradas\n`;
  datos.guardias.forEach(g => {
    contenido += `Fecha: ${g.fecha} | Estado: ${g.estado}\n`;
    contenido += `Original: ${formatearTiempoPedagogico(g.horasPedOriginal)}\n`;
    contenido += `Utilizado: ${formatearTiempoPedagogico(g.horasPedUtilizadas)}\n`;
    contenido += `Restante: ${formatearTiempoPedagogico(g.horasPedRestantes)}\n`;
    contenido += `📅 Bloques generados automáticamente:\n`;
    g.bloquesGenerados.forEach(b => {
      contenido += `   • ${b.horaInicio} a ${b.horaFin} | ${formatearMinutosCronologicos(b.minutosCron)} | ${formatearTiempoPedagogico(b.horasPed)}\n`;
    });
    contenido += `------------------------------\n`;
  });

  // 📊 COMPENSACIONES POR MES (ARRASTRE)
  contenido += `\n📆 COMPENSACIONES POR MES\n`;
  contenido += `==========================\n`;
  const porMes = agruparCompensacionesPorMes(datos.compensaciones);
  if (Object.keys(porMes).length === 0) contenido += `Sin compensaciones registradas\n`;
  Object.values(porMes).forEach((mes: any) => {
    contenido += `\n${mes.nombreMes.toUpperCase()}\n`;
    contenido += `Total compensado: ${formatearTiempoPedagogico(mes.totalHorasPed)}\n`;
    mes.registros.forEach((r: any) => {
      contenido += `   • Fecha: ${r.fecha} | Clases: ${r.clases}\n`;
      contenido += `     Consumido: ${formatearTiempoPedagogico(r.horasPedCompensadas)}\n`;
      contenido += `     Usado de: ${r.detalleConsumo.map((d:any) => d.fechaGuardia).join(", ")}\n`;
    });
  });

  return contenido;
};
