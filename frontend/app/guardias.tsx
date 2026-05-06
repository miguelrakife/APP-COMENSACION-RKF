import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme, ORDEN_TIPOS } from '../src/theme';
import { getGuardias, addGuardia, deleteGuardia } from '../src/storage';
import { Guardia, OrderType, GuardiaType, Modalidad } from '../src/types';
import {
  formatFechaMilitar,
  formatFechaMilitarLarga,
  generarId,
  toISODate,
  esFinDeSemana,
} from '../src/utils';
import DatePickerField from '../src/DatePickerField';
import ConfirmModal from '../src/ConfirmModal';

export default function GuardiasScreen() {
  const [guardias, setGuardias] = useState<Guardia[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Form
  const [fecha, setFecha] = useState(toISODate(new Date()));
  const [tipo, setTipo] = useState<GuardiaType>('semana');
  const [modalidad, setModalidad] = useState<Modalidad>('Guardia');
  const [ordenTipo, setOrdenTipo] = useState<OrderType>('O/E');
  const [ordenNumero, setOrdenNumero] = useState('');
  const [ordenFecha, setOrdenFecha] = useState(toISODate(new Date()));

  const cargar = useCallback(async () => {
    const data = await getGuardias();
    data.sort((a, b) => b.fecha.localeCompare(a.fecha));
    setGuardias(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  // Auto-detect tipo según fecha
  const handleFechaChange = (iso: string) => {
    setFecha(iso);
    setTipo(esFinDeSemana(iso) ? 'finde' : 'semana');
  };

  const resetForm = () => {
    const hoy = toISODate(new Date());
    setFecha(hoy);
    setTipo(esFinDeSemana(hoy) ? 'finde' : 'semana');
    setModalidad('Guardia');
    setOrdenTipo('O/E');
    setOrdenNumero('');
    setOrdenFecha(hoy);
  };

  const handleGuardar = async () => {
    if (!ordenNumero.trim()) {
      Alert.alert('Falta N° de orden', 'Ingresa el número de orden (ej: 074).');
      return;
    }
    const g: Guardia = {
      id: generarId(),
      fecha,
      tipo,
      modalidad,
      ordenTipo,
      ordenNumero: ordenNumero.trim(),
      ordenFecha,
      createdAt: new Date().toISOString(),
    };
    await addGuardia(g);
    await cargar();
    resetForm();
    setModalOpen(false);
  };

  const handleEliminar = async (g: Guardia) => {
    await deleteGuardia(g.id);
    await cargar();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} testID="guardias-scroll">
        {guardias.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="shield-outline" size={48} color={theme.colors.textFaint} />
            <Text style={styles.emptyTitle}>Sin guardias registradas</Text>
            <Text style={styles.emptySub}>Toca el botón + para registrar tu primera guardia o servicio.</Text>
          </View>
        ) : (
          guardias.map((g) => (
            <View key={g.id} style={styles.card} testID={`guardia-${g.id}`}>
              <View style={styles.cardHeader}>
                <View style={[styles.badge, g.tipo === 'finde' ? styles.badgeFinde : styles.badgeSemana]}>
                  <Text style={styles.badgeText}>{g.tipo === 'finde' ? 'FIN DE SEMANA · 32h' : 'SEMANA · 20h'}</Text>
                </View>
                <TouchableOpacity onPress={() => handleEliminar(g)} testID={`eliminar-guardia-${g.id}`}>
                  <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
                </TouchableOpacity>
              </View>
              <Text style={styles.fechaBig}>{formatFechaMilitar(g.fecha)}</Text>
              <View style={styles.row}>
                <Ionicons name="briefcase-outline" size={14} color={theme.colors.textMuted} />
                <Text style={styles.rowText}>{g.modalidad}</Text>
              </View>
              <View style={styles.row}>
                <Ionicons name="document-text-outline" size={14} color={theme.colors.textMuted} />
                <Text style={styles.rowText}>
                  {g.ordenTipo.replace('/', '')} N.°{g.ordenNumero.padStart(3, '0')} del {formatFechaMilitarLarga(g.ordenFecha)}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setModalOpen(true)} testID="abrir-nueva-guardia">
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalOpen} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva guardia / servicio</Text>
              <TouchableOpacity
                onPress={() => { setModalOpen(false); resetForm(); }}
                testID="cerrar-nueva-guardia"
              >
                <Ionicons name="close" size={26} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent}>
              <DatePickerField label="Fecha de inicio" value={fecha} onChange={handleFechaChange} testID="fecha-guardia" />

              <Text style={styles.label}>Tipo de día</Text>
              <View style={styles.segmented}>
                <TouchableOpacity
                  style={[styles.segment, tipo === 'semana' && styles.segmentActive]}
                  onPress={() => setTipo('semana')}
                  testID="tipo-semana"
                >
                  <Text style={[styles.segmentText, tipo === 'semana' && styles.segmentTextActive]}>
                    Día semana
                  </Text>
                  <Text style={styles.segmentSub}>17:00-08:00 · 20h pedag</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segment, tipo === 'finde' && styles.segmentActive]}
                  onPress={() => setTipo('finde')}
                  testID="tipo-finde"
                >
                  <Text style={[styles.segmentText, tipo === 'finde' && styles.segmentTextActive]}>
                    Fin de semana
                  </Text>
                  <Text style={styles.segmentSub}>08:00-08:00 · 32h pedag</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Modalidad</Text>
              <View style={styles.segmented}>
                <TouchableOpacity
                  style={[styles.segment, modalidad === 'Guardia' && styles.segmentActive]}
                  onPress={() => setModalidad('Guardia')}
                  testID="modalidad-guardia"
                >
                  <Ionicons
                    name="shield-checkmark"
                    size={18}
                    color={modalidad === 'Guardia' ? theme.colors.primary : theme.colors.textFaint}
                  />
                  <Text style={[styles.segmentText, modalidad === 'Guardia' && styles.segmentTextActive]}>
                    Guardia
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segment, modalidad === 'Servicio' && styles.segmentActive]}
                  onPress={() => setModalidad('Servicio')}
                  testID="modalidad-servicio"
                >
                  <Ionicons
                    name="briefcase"
                    size={18}
                    color={modalidad === 'Servicio' ? theme.colors.primary : theme.colors.textFaint}
                  />
                  <Text style={[styles.segmentText, modalidad === 'Servicio' && styles.segmentTextActive]}>
                    Servicio
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Tipo de orden</Text>
              {ORDEN_TIPOS.map((o) => (
                <TouchableOpacity
                  key={o.value}
                  style={[styles.bloqueOption, ordenTipo === o.value && styles.bloqueOptionActive]}
                  onPress={() => setOrdenTipo(o.value)}
                  testID={`orden-${o.value.replace('/', '')}`}
                >
                  <View style={styles.radio}>
                    {ordenTipo === o.value && <View style={styles.radioDot} />}
                  </View>
                  <Text style={[styles.bloqueText, ordenTipo === o.value && styles.bloqueTextActive]}>
                    {o.label}
                  </Text>
                </TouchableOpacity>
              ))}

              <Text style={styles.label}>Número de orden</Text>
              <TextInput
                style={styles.input}
                placeholder="ej: 074"
                placeholderTextColor={theme.colors.textFaint}
                keyboardType="numeric"
                value={ordenNumero}
                onChangeText={setOrdenNumero}
                testID="orden-numero"
              />

              <DatePickerField
                label="Fecha de la orden"
                value={ordenFecha}
                onChange={setOrdenFecha}
                testID="orden-fecha"
              />

              <View style={styles.previewBox}>
                <Text style={styles.previewLabel}>VISTA PREVIA</Text>
                <Text style={styles.previewLine}>{modalidad}</Text>
                <Text style={styles.previewLine}>
                  {ordenTipo.replace('/', '')} N.°{(ordenNumero || '---').padStart(3, '0')} del {formatFechaMilitarLarga(ordenFecha)}
                </Text>
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleGuardar} testID="guardar-guardia">
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.saveBtnText}>Guardar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: theme.spacing.md, paddingBottom: 120 },
  emptyCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  emptyTitle: { color: theme.colors.text, fontSize: theme.fontSize.lg, fontWeight: '800', marginTop: 12 },
  emptySub: { color: theme.colors.textMuted, fontSize: theme.fontSize.sm, marginTop: 6, textAlign: 'center' },
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  badgeSemana: { backgroundColor: theme.colors.info + '33' },
  badgeFinde: { backgroundColor: theme.colors.accent + '33' },
  badgeText: { color: theme.colors.text, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  fechaBig: { color: theme.colors.text, fontSize: theme.fontSize.xl, fontWeight: '900', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  rowText: { color: theme.colors.textMuted, fontSize: theme.fontSize.sm, flex: 1 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: { backgroundColor: theme.colors.bg, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '92%' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: { color: theme.colors.text, fontSize: theme.fontSize.xl, fontWeight: '900' },
  modalContent: { padding: theme.spacing.md },
  label: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: theme.spacing.sm,
  },
  segmented: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  segment: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 12,
  },
  segmentActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '22' },
  segmentText: { color: theme.colors.text, fontSize: theme.fontSize.sm, fontWeight: '700' },
  segmentTextActive: { color: theme.colors.primary },
  segmentSub: { color: theme.colors.textFaint, fontSize: 10, fontWeight: '600' },
  bloqueOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 6,
  },
  bloqueOptionActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '22' },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary },
  bloqueText: { color: theme.colors.text, fontSize: theme.fontSize.md, fontWeight: '600', flex: 1 },
  bloqueTextActive: { color: theme.colors.primary },
  input: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: theme.fontSize.md,
    marginBottom: theme.spacing.sm,
  },
  previewBox: {
    backgroundColor: theme.colors.bgSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  previewLabel: {
    color: theme.colors.primary,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '800',
    marginBottom: 8,
  },
  previewLine: { color: theme.colors.text, fontSize: theme.fontSize.sm, fontWeight: '600', marginBottom: 3 },
  saveBtn: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xxl,
  },
  saveBtnText: { color: '#fff', fontSize: theme.fontSize.md, fontWeight: '800', letterSpacing: 0.5 },
});
