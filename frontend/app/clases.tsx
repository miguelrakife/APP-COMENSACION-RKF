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
import { theme, BLOQUES_PREDEFINIDOS } from '../src/theme';
import { getClases, addClase, deleteClase } from '../src/storage';
import { Clase } from '../src/types';
import { formatFechaMilitar, formatMinutosPed, generarId, toISODate } from '../src/utils';
import DatePickerField from '../src/DatePickerField';

export default function ClasesScreen() {
  const [clases, setClases] = useState<Clase[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [fecha, setFecha] = useState(toISODate(new Date()));
  const [bloqueIdx, setBloqueIdx] = useState<number | 'otro' | null>(null);
  const [customInicio, setCustomInicio] = useState('');
  const [customFin, setCustomFin] = useState('');
  const [customDuracion, setCustomDuracion] = useState('');

  const cargar = useCallback(async () => {
    const data = await getClases();
    data.sort((a, b) => b.fecha.localeCompare(a.fecha));
    setClases(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const resetForm = () => {
    setFecha(toISODate(new Date()));
    setBloqueIdx(null);
    setCustomInicio('');
    setCustomFin('');
    setCustomDuracion('');
  };

  const handleGuardar = async () => {
    if (bloqueIdx === null) {
      Alert.alert('Falta información', 'Selecciona un bloque horario o elige "Otro".');
      return;
    }

    let clase: Clase;
    if (bloqueIdx === 'otro') {
      if (!customInicio || !customFin || !customDuracion) {
        Alert.alert('Faltan datos', 'Completa horario inicio, fin y duración pedagógica.');
        return;
      }
      const dur = parseInt(customDuracion, 10);
      if (isNaN(dur) || dur <= 0) {
        Alert.alert('Duración inválida', 'Ingresa un número de minutos pedagógicos mayor a 0.');
        return;
      }
      clase = {
        id: generarId(),
        fecha,
        bloqueLabel: `${customInicio} - ${customFin}`,
        horarioInicio: customInicio,
        horarioFin: customFin,
        duracionPedMin: dur,
        esPersonalizado: true,
        createdAt: new Date().toISOString(),
      };
    } else {
      const b = BLOQUES_PREDEFINIDOS[bloqueIdx];
      clase = {
        id: generarId(),
        fecha,
        bloqueLabel: b.label,
        horarioInicio: b.inicio,
        horarioFin: b.fin,
        duracionPedMin: b.duracionPedMin,
        minCrono: b.displayLabel === '15m' ? 15 : undefined,
        esPersonalizado: false,
        createdAt: new Date().toISOString(),
      };
    }

    await addClase(clase);
    await cargar();
    resetForm();
    setModalOpen(false);
  };

  const handleEliminar = (c: Clase) => {
    const confirmar = async () => {
      await deleteClase(c.id);
      await cargar();
    };
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      if (confirm(`¿Eliminar clase del ${formatFechaMilitar(c.fecha)}?`)) confirmar();
    } else {
      Alert.alert('Eliminar clase', `¿Eliminar clase del ${formatFechaMilitar(c.fecha)}?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: confirmar },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} testID="clases-scroll">
        {clases.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="school-outline" size={48} color={theme.colors.textFaint} />
            <Text style={styles.emptyTitle}>Sin clases registradas</Text>
            <Text style={styles.emptySub}>Toca el botón + para agregar tu primera clase.</Text>
          </View>
        ) : (
          clases.map((c) => (
            <View key={c.id} style={styles.claseCard} testID={`clase-${c.id}`}>
              <View style={styles.claseLeft}>
                <Text style={styles.claseFecha}>{formatFechaMilitar(c.fecha)}</Text>
                <Text style={styles.claseBloque}>{c.bloqueLabel}</Text>
                <Text style={styles.claseDur}>{formatMinutosPed(c.duracionPedMin)} pedag.</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleEliminar(c)}
                testID={`eliminar-clase-${c.id}`}
              >
                <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalOpen(true)}
        testID="abrir-nueva-clase"
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalOpen} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva clase</Text>
              <TouchableOpacity onPress={() => { setModalOpen(false); resetForm(); }} testID="cerrar-nueva-clase">
                <Ionicons name="close" size={26} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <DatePickerField label="Fecha de la clase" value={fecha} onChange={setFecha} testID="fecha-clase" />

              <Text style={styles.label}>Bloque horario</Text>
              {BLOQUES_PREDEFINIDOS.map((b, i) => {
                const pedLabel =
                  b.duracionPedMin >= 60
                    ? `${Math.floor(b.duracionPedMin / 60)}h pedag.`
                    : `${b.duracionPedMin}m pedag.`;
                return (
                  <View key={b.label}>
                    <TouchableOpacity
                      style={[styles.bloqueOption, bloqueIdx === i && styles.bloqueOptionActive]}
                      onPress={() => setBloqueIdx(i)}
                      testID={`bloque-${i}`}
                    >
                      <View style={styles.radio}>
                        {bloqueIdx === i && <View style={styles.radioDot} />}
                      </View>
                      <Text style={[styles.bloqueText, bloqueIdx === i && styles.bloqueTextActive]}>
                        {b.label}
                      </Text>
                      <Text style={styles.bloquePed}>{pedLabel}</Text>
                    </TouchableOpacity>
                    {b.nota && bloqueIdx === i && (
                      <Text style={styles.bloqueNota}>ⓘ {b.nota}</Text>
                    )}
                  </View>
                );
              })}
              <TouchableOpacity
                style={[styles.bloqueOption, bloqueIdx === 'otro' && styles.bloqueOptionActive]}
                onPress={() => setBloqueIdx('otro')}
                testID="bloque-otro"
              >
                <View style={styles.radio}>
                  {bloqueIdx === 'otro' && <View style={styles.radioDot} />}
                </View>
                <Text style={[styles.bloqueText, bloqueIdx === 'otro' && styles.bloqueTextActive]}>
                  Otro (personalizado)
                </Text>
              </TouchableOpacity>

              {bloqueIdx === 'otro' && (
                <View style={styles.customBox}>
                  <View style={styles.rowInputs}>
                    <View style={styles.halfInput}>
                      <Text style={styles.label}>Inicio</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="HH:MM"
                        placeholderTextColor={theme.colors.textFaint}
                        value={customInicio}
                        onChangeText={setCustomInicio}
                        testID="custom-inicio"
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <Text style={styles.label}>Fin</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="HH:MM"
                        placeholderTextColor={theme.colors.textFaint}
                        value={customFin}
                        onChangeText={setCustomFin}
                        testID="custom-fin"
                      />
                    </View>
                  </View>
                  <Text style={styles.label}>Duración pedagógica (minutos)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="ej: 120, 90, 15"
                    placeholderTextColor={theme.colors.textFaint}
                    keyboardType="numeric"
                    value={customDuracion}
                    onChangeText={setCustomDuracion}
                    testID="custom-duracion"
                  />
                </View>
              )}

              <TouchableOpacity style={styles.saveBtn} onPress={handleGuardar} testID="guardar-clase">
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.saveBtnText}>Guardar clase</Text>
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
  claseCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
  },
  claseLeft: { flex: 1 },
  claseFecha: { color: theme.colors.text, fontSize: theme.fontSize.lg, fontWeight: '800', letterSpacing: 0.5 },
  claseBloque: { color: theme.colors.textMuted, fontSize: theme.fontSize.sm, marginTop: 3 },
  claseDur: { color: theme.colors.primary, fontSize: theme.fontSize.sm, fontWeight: '700', marginTop: 4 },
  deleteBtn: { padding: 10 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: theme.colors.primary,
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
  bloqueOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 8,
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
  bloquePed: { color: theme.colors.textMuted, fontSize: theme.fontSize.xs, fontWeight: '700' },
  bloqueNota: {
    color: theme.colors.warning,
    fontSize: theme.fontSize.xs,
    fontStyle: 'italic',
    marginTop: -4,
    marginBottom: 8,
    paddingHorizontal: 14,
  },
  customBox: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  rowInputs: { flexDirection: 'row', gap: theme.spacing.sm },
  halfInput: { flex: 1 },
  input: {
    backgroundColor: theme.colors.bgSecondary,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: theme.fontSize.md,
  },
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
