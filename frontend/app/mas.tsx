import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme';
import { exportarBackup, compartirBackup, importarBackupDesdeJson } from '../src/backup';
import { clearAll } from '../src/storage';

export default function MasScreen() {
  const [loading, setLoading] = useState(false);

  useFocusEffect(useCallback(() => {}, []));

  const handleExport = async () => {
    setLoading(true);
    try {
      const uri = await exportarBackup();
      await compartirBackup(uri);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Falló');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (Platform.OS !== 'web') {
      Alert.alert('Importar', 'En la app móvil: copia el JSON, ábrelo desde el explorador de archivos y compártelo a esta app. (Próximamente: file picker nativo)');
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const r = await importarBackupDesdeJson(text);
        // eslint-disable-next-line no-alert
        alert(`Importado: ${r.clases} clases, ${r.guardias} guardias`);
      } catch (err: any) {
        // eslint-disable-next-line no-alert
        alert('Error: ' + (err?.message || 'desconocido'));
      }
    };
    input.click();
  };

  const handleClear = () => {
    const fn = async () => {
      await clearAll();
      if (Platform.OS === 'web') alert('Datos borrados.');
      else Alert.alert('Listo', 'Todos los datos fueron borrados.');
    };
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      if (confirm('¿Borrar TODOS los datos? Esta acción no se puede deshacer.')) fn();
    } else {
      Alert.alert('Borrar todo', '¿Borrar TODOS los datos? Esta acción no se puede deshacer.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Borrar', style: 'destructive', onPress: fn },
      ]);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerSmall}>HERRAMIENTAS</Text>
      <Text style={styles.headerTitle}>Backup y datos</Text>

      <TouchableOpacity style={styles.btn} onPress={handleExport} disabled={loading} testID="backup-export">
        <Ionicons name="cloud-download-outline" size={22} color={theme.colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={styles.btnTitle}>Exportar backup</Text>
          <Text style={styles.btnSub}>Guarda todos tus datos en un archivo .json</Text>
        </View>
        {loading ? <ActivityIndicator /> : <Ionicons name="chevron-forward" size={20} color={theme.colors.textFaint} />}
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={handleImport} testID="backup-import">
        <Ionicons name="cloud-upload-outline" size={22} color={theme.colors.accent} />
        <View style={{ flex: 1 }}>
          <Text style={styles.btnTitle}>Importar backup</Text>
          <Text style={styles.btnSub}>Restaura datos desde un archivo .json</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textFaint} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={handleClear} testID="clear-all">
        <Ionicons name="trash-outline" size={22} color={theme.colors.danger} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.btnTitle, { color: theme.colors.danger }]}>Borrar todos los datos</Text>
          <Text style={styles.btnSub}>Elimina clases y guardias permanentemente</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.aboutBox}>
        <Text style={styles.aboutTitle}>COMPENSADOR HORARIO</Text>
        <Text style={styles.aboutSub}>v1.1 — Datos guardados localmente en tu dispositivo</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: theme.spacing.md, paddingBottom: theme.spacing.xxl },
  headerSmall: { color: theme.colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 2, marginBottom: 4 },
  headerTitle: { color: theme.colors.text, fontSize: 24, fontWeight: '900', marginBottom: theme.spacing.md },
  btn: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  btnDanger: { borderColor: theme.colors.danger + '55' },
  btnTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  btnSub: { color: theme.colors.textMuted, fontSize: 12, marginTop: 2 },
  aboutBox: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.md,
    alignItems: 'center',
    opacity: 0.6,
  },
  aboutTitle: { color: theme.colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  aboutSub: { color: theme.colors.textMuted, fontSize: 11, marginTop: 4 },
});
