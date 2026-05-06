import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme';
import { toISODate, parseISODate, formatFechaMilitar } from '../src/utils';

interface Props {
  label: string;
  value: string; // ISO date
  onChange: (iso: string) => void;
  testID?: string;
}

export default function DatePickerField({ label, value, onChange, testID }: Props) {
  const [show, setShow] = React.useState(false);
  const date = value ? parseISODate(value) : new Date();

  const handleChange = (_: any, selected?: Date) => {
    if (Platform.OS !== 'ios') setShow(false);
    if (selected) onChange(toISODate(selected));
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.webInputWrap}>
          {/* eslint-disable-next-line react/no-unknown-property */}
          <input
            type="date"
            value={value}
            onChange={(e: any) => onChange(e.target.value)}
            data-testid={testID}
            style={{
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: 8,
              padding: '12px 14px',
              fontSize: 15,
              width: '100%',
              outline: 'none',
              colorScheme: 'dark',
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShow(true)}
        testID={testID}
      >
        <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
        <Text style={styles.buttonText}>
          {value ? formatFechaMilitar(value) : 'Seleccionar fecha'}
        </Text>
      </TouchableOpacity>

      {show && Platform.OS === 'ios' && (
        <Modal transparent animationType="slide" visible={show}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={handleChange}
                themeVariant="dark"
              />
              <TouchableOpacity style={styles.closeBtn} onPress={() => setShow(false)}>
                <Text style={styles.closeBtnText}>Listo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {show && Platform.OS === 'android' && (
        <DateTimePicker value={date} mode="date" display="default" onChange={handleChange} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: theme.spacing.md },
  label: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.xs,
    fontWeight: '700',
  },
  webInputWrap: { width: '100%' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  buttonText: { color: theme.colors.text, fontSize: theme.fontSize.md, fontWeight: '600' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: { backgroundColor: theme.colors.surface, padding: theme.spacing.md },
  closeBtn: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  closeBtnText: { color: '#fff', fontWeight: '700', fontSize: theme.fontSize.md },
});
