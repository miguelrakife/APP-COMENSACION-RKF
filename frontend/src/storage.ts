import AsyncStorage from '@react-native-async-storage/async-storage';
import { Clase, Guardia } from './types';

const KEYS = {
  CLASES: '@compensador:clases',
  GUARDIAS: '@compensador:guardias',
};

export async function getClases(): Promise<Clase[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.CLASES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveClases(clases: Clase[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.CLASES, JSON.stringify(clases));
}

export async function addClase(clase: Clase): Promise<void> {
  const clases = await getClases();
  clases.push(clase);
  await saveClases(clases);
}

export async function deleteClase(id: string): Promise<void> {
  const clases = await getClases();
  await saveClases(clases.filter(c => c.id !== id));
}

export async function updateClase(clase: Clase): Promise<void> {
  const clases = await getClases();
  const idx = clases.findIndex(c => c.id === clase.id);
  if (idx >= 0) {
    clases[idx] = clase;
    await saveClases(clases);
  }
}

export async function getGuardias(): Promise<Guardia[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.GUARDIAS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveGuardias(guardias: Guardia[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.GUARDIAS, JSON.stringify(guardias));
}

export async function addGuardia(guardia: Guardia): Promise<void> {
  const guardias = await getGuardias();
  guardias.push(guardia);
  await saveGuardias(guardias);
}

export async function deleteGuardia(id: string): Promise<void> {
  const guardias = await getGuardias();
  await saveGuardias(guardias.filter(g => g.id !== id));
}

export async function updateGuardia(guardia: Guardia): Promise<void> {
  const guardias = await getGuardias();
  const idx = guardias.findIndex(g => g.id === guardia.id);
  if (idx >= 0) {
    guardias[idx] = guardia;
    await saveGuardias(guardias);
  }
}

export async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.CLASES, KEYS.GUARDIAS]);
}
