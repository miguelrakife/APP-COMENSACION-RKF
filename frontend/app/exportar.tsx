import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme';
import { getClases, getGuardias } from '../src/storage';
import { calcularCompensacion } from '../src/compensation';
import { formatFechaMilitar, formatFechaMilitarLarga, formatMinutosPed, formatClaseCompensada, formatTotalGuardia } from '../src/utils';
import { ResumenCompensacion } from '../src/types';
import { generarWord, compartirArchivo } from '../src/wordExport';

export default function ExportarScreen() {
  const [resumen, setResumen] = useState<ResumenCompensacion | null>(null);
  const [loading, setLoading] = useState(false);
  const [filtroMes, setFiltroMes] = useState<string>(''); // YYYY-MM o vacío = todos

  const cargar = useCallback(async () => {
    let clases = await getClases();
    let guardias = await getGuardias();
    if (filtroMes) {
      clases = clases.filter(c => c.fecha.startsWith(filtroMes));
      guardias = guardias.filter(g => g.fecha.startsWith(filtroMes));
    }
    setResumen(calcularCompensacion(clases, guardias));
  }, [filtroMes]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const handleExportar = async () => {
    if (!resumen || resumen.guardias.length === 0) {
      Alert.alert('Sin datos', 'Registra al menos una guardia antes de exportar.');
      return;
    }
    setLoading(true);
    try {
      const uri = await generarWord(resumen);
      await compartirArchivo(uri);
    } catch (e: any) {
      console.error(e);
      if (Platform.OS === 'web') {
        // eslint-disable-next-line no-alert
        alert('Error al exportar: ' + (e?.message || 'desconocido'));
      } else {
        Alert.alert('Error', 'No se pudo generar el documento: ' + (e?.message || 'desconocido'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (!resumen) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const hasData = resumen.guardias.length > 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} testID="exportar-scroll">
        <Text style={styles.headerSmall}>VISTA PREVIA</Text>
        <Text style={styles.headerTitle}>Tabla de compensación</Text>

        <View style={styles.filterBox}>
          <Text style={styles.filterLabel}>FILTRAR POR MES (YYYY-MM, vacío = todo)</Text>
          <TextInput
            style={styles.filterInput}
            placeholder="ej: 2026-04"
            placeholderTextColor={theme.colors.textFaint}
            value={filtroMes}
            onChangeText={setFiltroMes}
            testID="filtro-mes"
          />
        </View>

        {!hasData && (
          <View style={styles.emptyCard}>
            <Ionicons name="document-outline" size={48} color={theme.colors.textFaint} />
            <Text style={styles.emptyTitle}>Nada para exportar</Text>
            <Text style={styles.emptySub}>
              Registra guardias y clases para generar la tabla en formato Word.
            </Text>
          </View>
        )}

        {hasData && (
          <View style={styles.tableWrap}>
            {/* Header row */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.th, styles.colNum]}>N.°</Text>
              <Text style={[styles.th, styles.colFecha]}>Fecha</Text>
              <Text style={[styles.th, styles.colHorario]}>Horario</Text>
              <Text style={[styles.th, styles.colTiempos]}>Tiempos compensados</Text>
              <Text style={[styles.th, styles.colMod]}>Modalidad</Text>
            </View>

            {resumen.guardias.map((gc, idx) => {
              const num = String(idx + 1).padStart(2, '0');
              const ordenAbrev = gc.guardia.ordenTipo.replace('/', '');
              const horario = gc.guardia.tipo === 'semana'
                ? ['1700h.-0800h.', '15h crono.', '20h pedag.']
                : ['0800h.-0800h.', '24h crono.', '32h pedag.'];
              return (
                <View key={gc.guardia.id} style={styles.tableRow}>
                  <Text style={[styles.td, styles.colNum, styles.tdCenter]}>{num}</Text>
                  <Text style={[styles.td, styles.colFecha]}>{formatFechaMilitar(gc.guardia.fecha)}</Text>
                  <View style={[styles.tdBox, styles.colHorario]}>
                    {horario.map((l, i) => (
                      <Text key={i} style={styles.td}>{l}</Text>
                    ))}
                  </View>
                  <View style={[styles.tdBox, styles.colTiempos]}>
                    {gc.clasesCompensadas.length === 0 ? (
                      <Text style={[styles.td, styles.tdFaint]}>—</Text>
                    ) : (
                      gc.clasesCompensadas.map((c, i) => (
                        <Text key={i} style={styles.td}>
                          {formatClaseCompensada(c)} de Clases del {formatFechaMilitar(c.fecha)}.
                        </Text>
                      ))
                    )}
                    <Text style={[styles.td, styles.tdBold]}>
                      {'\n'}TOTAL {formatTotalGuardia(gc.clasesCompensadas)} pedagógicas.
                    </Text>
                  </View>
                  <View style={[styles.tdBox, styles.colMod, styles.tdCenterBox]}>
                    <Text style={[styles.td, styles.tdCenter]}>{gc.guardia.modalidad}</Text>
                    <Text style={[styles.td, styles.tdCenter]}>
                      {ordenAbrev} N.°{gc.guardia.ordenNumero.padStart(3, '0')}
                    </Text>
                    <Text style={[styles.td, styles.tdCenter]}>
                      del {formatFechaMilitarLarga(gc.guardia.ordenFecha)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {hasData && resumen.clasesPendientes.length > 0 && (
          <View style={styles.warnBox}>
            <Ionicons name="warning-outline" size={16} color={theme.colors.warning} />
            <Text style={styles.warnText}>
              Hay {formatMinutosPed(resumen.clasesPendientes.reduce((s, c) => s + c.duracionMin, 0))}{' '}
              de clases sin compensar (faltan guardias).
            </Text>
          </View>
        )}
      </ScrollView>

      {hasData && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.exportBtn}
            onPress={handleExportar}
            disabled={loading}
            testID="exportar-word"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="download-outline" size={22} color="#fff" />
                <Text style={styles.exportBtnText}>Exportar a Word (.docx)</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: theme.spacing.md, paddingBottom: 120 },
  loading: { flex: 1, backgroundColor: theme.colors.bg, justifyContent: 'center', alignItems: 'center' },
  headerSmall: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.xs,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xxl,
    fontWeight: '900',
    marginBottom: theme.spacing.md,
  },
  emptyCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  emptyTitle: { color: theme.colors.text, fontSize: theme.fontSize.lg, fontWeight: '800', marginTop: 12 },
  emptySub: { color: theme.colors.textMuted, fontSize: theme.fontSize.sm, marginTop: 6, textAlign: 'center' },
  tableWrap: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.radius.sm,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  tableHeader: { backgroundColor: theme.colors.surfaceLight },
  th: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    padding: 8,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: theme.colors.borderLight,
  },
  td: {
    color: theme.colors.text,
    fontSize: 11,
    lineHeight: 15,
    fontFamily: Platform.select({ ios: 'Times New Roman', android: 'serif', default: 'serif' }),
  },
  tdBox: {
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: theme.colors.borderLight,
  },
  tdCenter: { textAlign: 'center' },
  tdCenterBox: { alignItems: 'center', justifyContent: 'center' },
  tdBold: { fontWeight: '800' },
  tdFaint: { color: theme.colors.textFaint },
  colNum: { width: 34, padding: 6, borderRightWidth: 1, borderRightColor: theme.colors.borderLight, textAlign: 'center' },
  colFecha: { width: 78, padding: 6, borderRightWidth: 1, borderRightColor: theme.colors.borderLight },
  colHorario: { width: 90 },
  colTiempos: { flex: 1, minWidth: 140 },
  colMod: { width: 110 },
  warnBox: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: theme.colors.warning + '22',
    borderWidth: 1,
    borderColor: theme.colors.warning + '55',
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.md,
  },
  warnText: { color: theme.colors.text, fontSize: theme.fontSize.sm, flex: 1 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.bgSecondary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  exportBtn: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportBtnText: { color: '#fff', fontSize: theme.fontSize.md, fontWeight: '800', letterSpacing: 0.5 },
  filterBox: { marginBottom: theme.spacing.md },
  filterLabel: {
    color: theme.colors.textMuted,
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: '700',
    marginBottom: 6,
  },
  filterInput: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
  },
});
