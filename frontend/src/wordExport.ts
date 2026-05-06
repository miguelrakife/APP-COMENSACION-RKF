import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeightRule,
} from 'docx';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { ResumenCompensacion, GuardiaConCompensacion } from './types';
import { formatFechaMilitar, formatFechaMilitarLarga, formatMinutosPed } from './utils';

function cellBorders() {
  return {
    top: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
    bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
    left: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
    right: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
  };
}

function headerCell(text: string) {
  return new TableCell({
    borders: cellBorders(),
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text, bold: true, font: 'Times New Roman', size: 24 }),
        ],
      }),
    ],
  });
}

function textCell(lines: string[], align: AlignmentType = AlignmentType.LEFT) {
  return new TableCell({
    borders: cellBorders(),
    children: lines.map(
      (line) =>
        new Paragraph({
          alignment: align,
          children: [new TextRun({ text: line, font: 'Times New Roman', size: 22 })],
        })
    ),
  });
}

function horarioGuardiaLines(tipo: 'semana' | 'finde'): string[] {
  if (tipo === 'semana') {
    return ['1700h.-0800h.', '15h crono.', '20h pedag.'];
  }
  return ['0800h.-0800h.', '24h crono.', '32h pedag.'];
}

function tiemposCompensadosLines(gc: GuardiaConCompensacion): string[] {
  const lines: string[] = [];
  for (const c of gc.clasesCompensadas) {
    const duracion = formatClaseCompensada(c);
    lines.push(`${duracion} de Clases del ${formatFechaMilitar(c.fecha)}.`);
  }
  lines.push('');
  lines.push(`TOTAL ${formatTotalGuardia(gc.clasesCompensadas)} pedagógicas.`);
  return lines;
}

function modalidadLines(gc: GuardiaConCompensacion): string[] {
  const g = gc.guardia;
  const num = (g.ordenNumero || '').trim().padStart(3, '0');
  const ordenFechaTxt = formatFechaMilitarLarga(g.ordenFecha);
  const ordenAbrev = g.ordenTipo.replace('/', ''); // O/R -> OR
  return [g.modalidad, `${ordenAbrev} N.°${num} del ${ordenFechaTxt}`];
}

export async function generarWord(resumen: ResumenCompensacion): Promise<string> {
  const rows: TableRow[] = [];

  // Header row
  rows.push(
    new TableRow({
      tableHeader: true,
      children: [
        headerCell('N.°'),
        headerCell('Fecha'),
        headerCell('Horario'),
        headerCell('Tiempos compensados'),
        headerCell('Modalidad'),
      ],
    })
  );

  // Data rows
  resumen.guardias.forEach((gc, idx) => {
    const num = String(idx + 1).padStart(2, '0');
    rows.push(
      new TableRow({
        children: [
          textCell([num], AlignmentType.CENTER),
          textCell([formatFechaMilitar(gc.guardia.fecha)], AlignmentType.LEFT),
          textCell(horarioGuardiaLines(gc.guardia.tipo), AlignmentType.LEFT),
          textCell(tiemposCompensadosLines(gc), AlignmentType.LEFT),
          textCell(modalidadLines(gc), AlignmentType.CENTER),
        ],
      })
    );
  });

  const table = new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [800, 1600, 1800, 4200, 2400],
  });

  const doc = new Document({
    creator: 'Compensador Horario',
    title: 'Tabla de Compensación Horaria',
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: 'TABLA DE COMPENSACIÓN HORARIA',
                bold: true,
                font: 'Times New Roman',
                size: 28,
              }),
            ],
          }),
          table,
        ],
      },
    ],
  });

  const base64 = await Packer.toBase64String(doc);

  const fileName = `compensacion_${Date.now()}.docx`;
  const uri = (FileSystem.documentDirectory || FileSystem.cacheDirectory || '') + fileName;

  await FileSystem.writeAsStringAsync(uri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return uri;
}

export async function compartirArchivo(uri: string): Promise<void> {
  if (Platform.OS === 'web') {
    // On web, trigger a download
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const byteChars = atob(base64);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) {
        byteNumbers[i] = byteChars.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = uri.split('/').pop() || 'compensacion.docx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error en descarga web:', e);
      throw e;
    }
    return;
  }

  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('La función de compartir no está disponible en este dispositivo');
  }
  await Sharing.shareAsync(uri, {
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    dialogTitle: 'Compartir tabla de compensación',
    UTI: 'org.openxmlformats.wordprocessingml.document',
  });
}
