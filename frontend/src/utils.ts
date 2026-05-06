const MESES_CORTOS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
const MESES_LARGOS = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

export function formatFechaMilitar(iso: string): string {
  // "2026-04-19" -> "19ABR2026"
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const dd = String(d).padStart(2, '0');
  const mmm = MESES_CORTOS[m - 1] || '';
  return `${dd}${mmm}${y}`;
}

export function formatFechaMilitarLarga(iso: string): string {
  // "2026-04-16" -> "16ABRIL2026"
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const dd = String(d).padStart(2, '0');
  const mes = MESES_LARGOS[m - 1] || '';
  return `${dd}${mes}${y}`;
}

export function formatFechaCorta(iso: string): string {
  // "2026-04-19" -> "19/04/2026"
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function esFinDeSemana(iso: string): boolean {
  const date = parseISODate(iso);
  const dia = date.getDay(); // 0=dom, 6=sab
  return dia === 0 || dia === 6;
}

export function formatMinutosPed(minutos: number): string {
  // 120 -> "02h"
  // 75  -> "01h 15m"
  // 15  -> "15m"
  if (minutos <= 0) return '00h';
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${String(m).padStart(2, '0')}m`;
  if (m === 0) return `${String(h).padStart(2, '0')}h`;
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
}

export function formatHorarioGuardia(tipo: 'semana' | 'finde'): string {
  if (tipo === 'semana') return '1700h.-0800h.\n15h crono.\n20h pedag.';
  return '0800h.-0800h.\n24h crono.\n32h pedag.';
}

export function formatHorarioGuardiaInline(tipo: 'semana' | 'finde'): string {
  if (tipo === 'semana') return '17:00 - 08:00 · 15h crono · 20h pedag';
  return '08:00 - 08:00 · 24h crono · 32h pedag';
}

export function formatNumeroOrden(tipo: string, numero: string, fecha: string): string {
  const num = (numero || '').trim();
  const fechaLarga = formatFechaMilitarLarga(fecha);
  return `${tipo} N.°${num.padStart(3, '0')} del ${fechaLarga}`;
}

export function generarId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}
