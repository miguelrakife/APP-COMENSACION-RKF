export const theme = {
  colors: {
    bg: '#0B1120',
    bgSecondary: '#0F172A',
    surface: '#1E293B',
    surfaceElevated: '#273449',
    surfaceLight: '#334155',
    border: '#334155',
    borderLight: '#475569',
    primary: '#10B981', // emerald tactical green
    primaryDark: '#059669',
    primaryLight: '#34D399',
    accent: '#F59E0B', // amber gold
    text: '#F1F5F9',
    textMuted: '#94A3B8',
    textFaint: '#64748B',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    sm: 6,
    md: 10,
    lg: 16,
    full: 999,
  },
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },
};

export const DURACION_BLOQUE_PED_MIN = 120; // 2 horas pedagógicas = 120 min pedagógicos por defecto

export const BLOQUES_PREDEFINIDOS: {
  label: string;
  inicio: string;
  fin: string;
  duracionPedMin: number; // minutos pedagógicos a compensar
  nota?: string;
}[] = [
  { label: '08:00 - 09:30', inicio: '08:00', fin: '09:30', duracionPedMin: 120 },
  { label: '09:50 - 11:20', inicio: '09:50', fin: '11:20', duracionPedMin: 120 },
  { label: '11:40 - 13:10', inicio: '11:40', fin: '13:10', duracionPedMin: 120 },
  { label: '14:30 - 16:00', inicio: '14:30', fin: '16:00', duracionPedMin: 120 },
  { label: '15:00 - 16:30', inicio: '15:00', fin: '16:30', duracionPedMin: 120 },
  {
    label: '16:45 - 18:15',
    inicio: '16:45',
    fin: '18:15',
    duracionPedMin: 20, // 15 min cronológicos = 20 min pedagógicos (15 × 120/90)
    displayLabel: '15m', // se muestra así en la tabla y en la lista
    nota: 'Solo 15 min cronológicos compensables (16:45-17:00). Equivale a 20 min pedag.',
  },
];

export const GUARDIA_SEMANA_CAP_MIN = 20 * 60; // 20 horas pedagógicas = 1200 min
export const GUARDIA_FINDE_CAP_MIN = 32 * 60; // 32 horas pedagógicas = 1920 min

export const ORDEN_TIPOS: { value: 'O/E' | 'O/R' | 'O/C'; label: string }[] = [
  { value: 'O/E', label: 'O/E — Orden Escuela' },
  { value: 'O/R', label: 'O/R — Orden Regimiento' },
  { value: 'O/C', label: 'O/C — Orden Compañía' },
];
