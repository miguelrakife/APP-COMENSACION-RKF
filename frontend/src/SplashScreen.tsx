import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from './theme';

interface Props {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <View style={styles.iconBg}>
          <Ionicons name="shield-checkmark" size={72} color={theme.colors.primary} />
        </View>
        <Text style={styles.appName}>COMPENSADOR</Text>
        <Text style={styles.appSub}>HORARIO</Text>
      </View>

      <View style={styles.signature}>
        <View style={styles.lineWrap}>
          <View style={styles.line} />
          <Text style={styles.byText}>BY</Text>
          <View style={styles.line} />
        </View>
        <Text style={styles.rakifeText}>RAKIFE</Text>
        <Text style={styles.subSignature}>· Hecha en Chile ·</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  center: { alignItems: 'center' },
  iconBg: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.primary + '55',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  appName: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 5,
    textAlign: 'center',
  },
  appSub: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 8,
    textAlign: 'center',
    marginTop: 4,
  },
  signature: {
    position: 'absolute',
    bottom: 70,
    alignItems: 'center',
  },
  lineWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  line: { width: 36, height: 1, backgroundColor: theme.colors.borderLight },
  byText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    letterSpacing: 4,
    fontWeight: '700',
  },
  rakifeText: {
    color: theme.colors.accent,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 10,
  },
  subSignature: {
    color: theme.colors.textFaint,
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
