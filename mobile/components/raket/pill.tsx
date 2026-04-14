import { StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type PillTone = 'accent' | 'neutral' | 'success' | 'warning';

export function Pill({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: PillTone;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  const toneStyles = {
    accent: {
      backgroundColor: palette.accentSoft,
      color: palette.tint,
    },
    neutral: {
      backgroundColor: palette.surfaceAlt,
      color: palette.text,
    },
    success: {
      backgroundColor: colorScheme === 'light' ? palette.successSoft : palette.successSoftDark,
      color: palette.success,
    },
    warning: {
      backgroundColor: colorScheme === 'light' ? palette.warningSoft : palette.warningSoftDark,
      color: palette.warning,
    },
  }[tone];

  return (
    <View style={[styles.pill, { backgroundColor: toneStyles.backgroundColor }]}>
      <Text style={[styles.label, { color: toneStyles.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  label: {
    fontFamily: Fonts.rounded,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
