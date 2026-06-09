import AsyncStorage from '@react-native-async-storage/async-storage';
import { Guardia, ICompensacion, Asignatura } from './types';

const KEY_GUARDIAS = '@guardias';
const KEY_COMPENSACIONES = '@compensaciones';
const KEY_ASIGNATURAS = '@asignaturas_guardadas'; // ✅ Nueva clave

// --- Guardias ---
export const getGuardias = async (asignatura?: Asignatura): Promise<Guardia[]> => {
  const data = await AsyncStorage.getItem(KEY_GUARDIAS);
  const lista: Guardia[] = data ? JSON.parse(data) : [];
  return asignatura 
    ? lista.filter(g => g.asignatura.trim().toLowerCase() === asignatura.trim().toLowerCase()) 
    : lista;
};

export const addGuardia = async (guardia: Guardia): Promise<void> => {
  const lista = await getGuardias();
  lista.push(guardia);
  await AsyncStorage.setItem(KEY_GUARDIAS, JSON.stringify(lista));
  await guardarAsignaturaUsada(guardia.asignatura); // ✅ Guarda la materia si es nueva
};

export const deleteGuardia = async (id: string): Promise<void> => {
  const lista = await getGuardias();
  const filtrada = lista.filter(g => g.id !== id);
  await AsyncStorage.setItem(KEY_GUARDIAS, JSON.stringify(filtrada));
};

// --- Compensaciones ---
export const getCompensaciones = async (asignatura?: Asignatura): Promise<ICompensacion[]> => {
  const data = await AsyncStorage.getItem(KEY_COMPENSACIONES);
  const lista: ICompensacion[] = data ? JSON.parse(data) : [];
  return asignatura 
    ? lista.filter(c => c.asignatura.trim().toLowerCase() === asignatura.trim().toLowerCase()) 
    : lista;
};

export const addCompensacion = async (comp: ICompensacion): Promise<void> => {
  const lista = await getCompensaciones();
  lista.push(comp);
  await AsyncStorage.setItem(KEY_COMPENSACIONES, JSON.stringify(lista));
  await guardarAsignaturaUsada(comp.asignatura);
};

// --- ✅ NUEVO: Gestión de materias guardadas ---
export const guardarAsignaturaUsada = async (nombre: Asignatura): Promise<void> => {
  if (!nombre.trim()) return;
  const actuales = await getAsignaturasGuardadas();
  const nombreLimpio = nombre.trim();
  if (!actuales.some(a => a.toLowerCase() === nombreLimpio.toLowerCase())) {
    actuales.push(nombreLimpio);
    await AsyncStorage.setItem(KEY_ASIGNATURAS, JSON.stringify(actuales.sort()));
  }
};

export const getAsignaturasGuardadas = async (): Promise<Asignatura[]> => {
  const data = await AsyncStorage.getItem(KEY_ASIGNATURAS);
  return data ? JSON.parse(data) : [];
};

export const getResumenPorAsignatura = async (): Promise<IResumenAsignatura[]> => {
  const guardias = await getGuardias();
  const compensaciones = await getCompensaciones();
  const asignaturas = await getAsignaturasGuardadas();

  return asignaturas.map(nombre => {
    const horasTotales = guardias
      .filter(g => g.asignatura.trim().toLowerCase() === nombre.toLowerCase())
      .reduce((sum, g) => sum + (g.tipo === 'semana' ? 20 : 32), 0);

    const horasUsadas = compensaciones
      .filter(c => c.asignatura.trim().toLowerCase() === nombre.toLowerCase())
      .reduce((sum, c) => sum + c.horasPedCompensadas, 0);

    return {
      asignatura: nombre,
      totalHoras: horasTotales,
      horasUsadas: horasUsadas,
      saldo: horasTotales - horasUsadas
    };
  });
};
