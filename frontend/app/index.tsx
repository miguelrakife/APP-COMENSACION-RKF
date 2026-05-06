import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme';
import { getClases, getGuardias } from '../src/storage';
import { calcularCompensacion } from '../src/compensation';
import { formatMinutosPed, formatFechaMilitar, formatTotalGuardia } from '../src/utils';
import { ResumenCompensacion } from '../src/types';

export default function Dashboard() {
  const [resumen, setResumen] = useState<ResumenCompensacion | null>(null);
  const [clasesCount, setClasesCount] = useState(0);
  const [guardiasCount, setGuardiasCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [adeudadoFmt, setAdeudadoFmt] = useState('00h');
  const [compensadoFmt, setCompensadoFmt] = useState('00h');
  const [saldoFmt, setSaldoFmt] = useState('00h');

  const cargar = useCallback(async () => {
    const clases = await getClases();
    const guardias = await getGuardias();
    setClasesCount(clases.length);
    setGuardiasCount(guardias.length);
    const r = calcularCompensacion(clases, guardias);
    setResumen(r);

    // Formato "Xh Ym" igual que la tabla
    const adeudados = clases.map(c => ({ duracionMin: c.duracionPedMin, minCrono: c.minCrono }));
    const compensados = r.guardias.flatMap(g => g.clasesCompensadas);
    setAdeudadoFmt(formatTotalGuardia(adeudados));
    setCompensadoFmt(formatTotalGuardia(compensados));

    // Saldo: si saldoMin >= 0, capacidad disponible; si negativo, falta compensar
    const saldoAbs = Math.abs(r.saldoMin);
    const h = Math.floor(saldoAbs / 60);
    const m = saldoAbs % 60;
    const parts: string[] = [];
    if (h > 0) parts.push(`${String(h).padStart(2, '0')}h`);
    if (m > 0) parts.push(`${String(m).padStart(2, '0')}m`);
    setSaldoFmt(parts.length > 0 ? parts.join(' ') : '00h');
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await cargar();
    setRefreshing(false);
  };

  const saldo = resumen?.saldoMin ?? 0;
  const saldoPositivo = saldo >= 0;
  const porcentaje = resumen && resumen.totalAdeudadoMin > 0
    ? Math.min(100, Math.round((resumen.totalCompensadoMin / resumen.totalAdeudadoMin) * 100))
    : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      testID="dashboard-scroll"
    >
      <View style={styles.header}>
        <Text style={styles.headerSmall}>ESTADO GENERAL</Text>
        <Text style={styles.headerTitle}>Balance pedagógico</Text>
      </View>

      {/* BALANCE PRINCIPAL */}
      <View style={[styles.balanceCard, saldoPositivo ? styles.balanceOk : styles.balanceDanger]}>
        <View style={styles.balanceRow}>
          <View>
            <Text style={styles.balanceLabel}>
              {saldoPositivo ? 'CAPACIDAD DISPONIBLE' : 'FALTA COMPENSAR'}
            </Text>
            <Text style={styles.balanceValue} testID="balance-saldo">
              {saldoFmt}
            </Text>
          </View>
          <Ionicons
            name={saldoPositivo ? 'checkmark-circle' : 'alert-circle'}
            size={56}
            color={saldoPositivo ? theme.colors.success : theme.colors.danger}
          />
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${porcentaje}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {porcentaje}% compensado de tus clases
        </Text>
      </View>

      {/* STATS */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard} testID="stat-adeudado">
          <Ionicons name="time-outline" size={22} color={theme.colors.warning} />
          <Text style={styles.statLabel}>ADEUDADO</Text>
          <Text style={styles.statValue}>
            {adeudadoFmt}
          </Text>
          <Text style={styles.statSub}>{clasesCount} clases</Text>
        </View>

        <View style={styles.statCard} testID="stat-compensado">
          <Ionicons name="shield-checkmark-outline" size={22} color={theme.colors.primary} />
          <Text style={styles.statLabel}>COMPENSADO</Text>
          <Text style={styles.statValue}>
            {compensadoFmt}
          </Text>
          <Text style={styles.statSub}>{guardiasCount} servicios</Text>
        </View>
      </View>

      {/* INFO */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>
          <Ionicons name="information-circle-outline" size={16} color={theme.colors.primary} />
          {'  '}EQUIVALENCIAS
        </Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Bloque de clase (90 min crono)</Text>
          <Text style={styles.infoValue}>2h pedag.</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Guardia día semana (15h crono)</Text>
          <Text style={styles.infoValue}>20h pedag.</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Guardia fin de semana (24h crono)</Text>
          <Text style={styles.infoValue}>32h pedag.</Text>
        </View>
      </View>

      {/* CLASES PENDIENTES */}
      {resumen && resumen.clasesPendientes.length > 0 && (
        <View style={styles.pendientesCard}>
          <Text style={styles.pendientesTitle}>
            <Ionicons name="warning" size={14} color={theme.colors.danger} />
            {'  '}CLASES SIN COMPENSAR
          </Text>
          {resumen.clasesPendientes.slice(0, 5).map((c, i) => (
            <View key={i} style={styles.pendienteRow}>
              <Text style={styles.pendienteFecha}>{formatFechaMilitar(c.fecha)}</Text>
              <Text style={styles.pendienteDur}>{formatMinutosPed(c.duracionMin)}</Text>
            </View>
          ))}
          {resumen.clasesPendientes.length > 5 && (
            <Text style={styles.pendienteMas}>+{resumen.clasesPendientes.length - 5} más</Text>
          )}
        </View>
      )}

      {clasesCount === 0 && guardiasCount === 0 && (
        <View style={styles.emptyCard}>
          <Ionicons name="clipboard-outline" size={48} color={theme.colors.textFaint} />
          <Text style={styles.emptyTitle}>Sin registros aún</Text>
          <Text style={styles.emptySub}>
            Comienza agregando tus clases y guardias desde las pestañas inferiores.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: theme.spacing.md, paddingBottom: theme.spacing.xxl },
  header: { marginBottom: theme.spacing.md },
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
    letterSpacing: -0.5,
  },
  balanceCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  balanceOk: { borderLeftWidth: 4, borderLeftColor: theme.colors.success },
  balanceDanger: { borderLeftWidth: 4, borderLeftColor: theme.colors.danger },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  balanceLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.xs,
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  balanceValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.display,
    fontWeight: '900',
    letterSpacing: -1,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.bgSecondary,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: { height: '100%', backgroundColor: theme.colors.primary, borderRadius: 3 },
  progressText: { color: theme.colors.textMuted, fontSize: theme.fontSize.sm, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.md },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  statLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.xs,
    letterSpacing: 1,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 2,
  },
  statValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xl,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  statSub: { color: theme.colors.textFaint, fontSize: theme.fontSize.xs, marginTop: 2 },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  infoTitle: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.xs,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: theme.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoLabel: { color: theme.colors.textMuted, fontSize: theme.fontSize.sm, flex: 1 },
  infoValue: { color: theme.colors.text, fontSize: theme.fontSize.sm, fontWeight: '700' },
  pendientesCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.danger + '44',
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  pendientesTitle: {
    color: theme.colors.danger,
    fontSize: theme.fontSize.xs,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: theme.spacing.sm,
  },
  pendienteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  pendienteFecha: { color: theme.colors.text, fontSize: theme.fontSize.sm, fontWeight: '600' },
  pendienteDur: { color: theme.colors.danger, fontSize: theme.fontSize.sm, fontWeight: '700' },
  pendienteMas: {
    color: theme.colors.textFaint,
    fontSize: theme.fontSize.xs,
    marginTop: 6,
    textAlign: 'center',
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
  emptyTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
    marginTop: theme.spacing.md,
    marginBottom: 6,
  },
  emptySub: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});
