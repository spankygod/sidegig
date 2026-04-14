import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type TabScreenProps = {
  action?: {
    label: string;
    onPress: () => void;
  };
  body: string;
  eyebrow: string;
  title: string;
  children?: ReactNode;
};

export function TabScreen({ action, body, eyebrow, title, children }: TabScreenProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
      }}
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: palette.background }}>
      <View
        style={{
          alignSelf: 'center',
          backgroundColor: palette.surface,
          borderColor: palette.border,
          borderCurve: 'continuous',
          borderRadius: 28,
          borderWidth: 1,
          gap: 14,
          maxWidth: 420,
          padding: 24,
          width: '100%',
        }}>
        <Text
          selectable
          style={{
            color: palette.muted,
            fontFamily: Fonts.rounded,
            fontSize: 12,
            fontWeight: '700',
            letterSpacing: 0.8,
            textTransform: 'uppercase',
          }}>
          {eyebrow}
        </Text>
        <Text
          selectable
          style={{
            color: palette.text,
            fontFamily: Fonts.rounded,
            fontSize: 34,
            fontWeight: '800',
            lineHeight: 38,
          }}>
          {title}
        </Text>
        <Text
          selectable
          style={{
            color: palette.text,
            fontFamily: Fonts.sans,
            fontSize: 18,
            lineHeight: 24,
          }}>
          {body}
        </Text>

        {children}

        {action ? (
          <Pressable
            onPress={action.onPress}
            style={{
              alignItems: 'center',
              borderColor: palette.border,
              borderRadius: 14,
              borderWidth: 1,
              justifyContent: 'center',
              marginTop: 8,
              minHeight: 54,
            }}>
            <Text
              style={{
                color: palette.text,
                fontFamily: Fonts.rounded,
                fontSize: 16,
                fontWeight: '700',
              }}>
              {action.label}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </ScrollView>
  );
}
