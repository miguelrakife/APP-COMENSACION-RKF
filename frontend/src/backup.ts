import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { getClases, getGuardias, saveClases, saveGuardias } from './storage';

export async function exportarBackup(): Promise<string> {
  const clases = await getClases();
  const guardias = await getGuardias();
  const backup = {
    version: 1,
    fecha: new Date().toISOString(),
    clases,
    guardias,
  };
  const json = JSON.stringify(backup, null, 2);
  const fileName = `compensador_backup_${Date.now()}.json`;
  const uri = (FileSystem.documentDirectory || FileSystem.cacheDirectory || '') + fileName;
  await FileSystem.writeAsStringAsync(uri, json, { encoding: FileSystem.EncodingType.UTF8 });
  return uri;
}

export async function compartirBackup(uri: string): Promise<void> {
  if (Platform.OS === 'web') {
    const text = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.UTF8 });
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = uri.split('/').pop() || 'backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return;
  }
  await Sharing.shareAsync(uri, {
    mimeType: 'application/json',
    dialogTitle: 'Compartir backup',
  });
}

export async function importarBackupDesdeJson(json: string): Promise<{ clases: number; guardias: number }> {
  const data = JSON.parse(json);
  if (!data || !Array.isArray(data.clases) || !Array.isArray(data.guardias)) {
    throw new Error('Archivo no válido. Falta clases o guardias.');
  }
  await saveClases(data.clases);
  await saveGuardias(data.guardias);
  return { clases: data.clases.length, guardias: data.guardias.length };
}
