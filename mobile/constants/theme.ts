import { Platform } from 'react-native';
import { palette } from '@/constants/palette';

export const Colors = {
  light: {
    text: palette.light.text,
    background: palette.light.background,
    tint: palette.light.accent,
    icon: palette.light.textMuted,
    tabIconDefault: palette.light.textMuted,
    tabIconSelected: palette.light.accent,
    surface: palette.light.surface,
    surfaceMuted: palette.light.surfaceMuted,
    border: palette.light.border,
    danger: palette.light.danger,
  },
  dark: {
    text: palette.dark.text,
    background: palette.dark.background,
    tint: palette.dark.accent,
    icon: palette.dark.textMuted,
    tabIconDefault: palette.dark.textMuted,
    tabIconSelected: palette.dark.accent,
    surface: palette.dark.surface,
    surfaceMuted: palette.dark.surfaceMuted,
    border: palette.dark.border,
    danger: palette.dark.danger,
  },
};

export const layout = {
  screenPadding: 20,
  sectionGap: 16,
  screenBottomPadding: 132,
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    pill: 999,
  },
  iconButtonSize: 40,
  inputHeight: 50,
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
