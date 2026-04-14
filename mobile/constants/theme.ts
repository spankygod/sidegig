import { Platform } from 'react-native';

const baseNeutralColors = {
  background: '#ffffff',
  border: '#d7deeb',
  inputBackground: '#f4f7fb',
  panel: '#ffffff',
  primary: '#163b73',
  text: '#163b73',
  tint: '#163b73',
  muted: '#6a7c9a',
} as const;

const neutralTheme = {
  text: baseNeutralColors.text,
  textStrong: '#102a52',
  background: baseNeutralColors.background,
  canvas: '#f7fafe',
  surface: baseNeutralColors.panel,
  surfaceAlt: baseNeutralColors.inputBackground,
  border: baseNeutralColors.border,
  borderSoft: '#e7edf5',
  muted: baseNeutralColors.muted,
  mutedSoft: '#8796b0',
  placeholder: '#9dacbf',
  accent: '#163b73',
  accentStrong: '#0f2f5f',
  accentSoft: '#edf3fb',
  accentMuted: '#e8f0fb',
  success: '#2f5f9e',
  successSoft: '#e8eff9',
  successSoftDark: '#1b2d49',
  warning: '#456ea8',
  warningSoft: '#edf3fb',
  warningSoftDark: '#1d3150',
  danger: '#8f2d3f',
  tint: baseNeutralColors.tint,
  inverseText: '#ffffff',
  inverseMuted: 'rgba(255,255,255,0.9)',
  overlayDark: 'rgba(9, 27, 54, 0.28)',
  overlayLight: 'rgba(255,255,255,0.24)',
  imageOverlay: 'rgba(16,42,82,0.14)',
  ratingStar: '#f0b84b',
  infoSurface: '#e3eefc',
  infoText: '#1e4b88',
  profileCoverSurface: '#e9f0fb',
  profileAvatarSurface: '#dde9fa',
  serviceCleaningSurface: '#edf3fb',
  serviceMovingSurface: '#e9f0fb',
  serviceMovingTint: '#2f5f9e',
  serviceHelperSurface: '#edf2fa',
  serviceHelperTint: '#456ea8',
  serviceErrandSurface: '#eef2fb',
  serviceErrandTint: '#375c97',
  serviceAirconSurface: '#e3eefc',
  serviceAirconTint: '#1e4b88',
  shadow: '#163b73',
  icon: '#6a7c9a',
  tabIconDefault: '#95a5bc',
  tabIconSelected: baseNeutralColors.tint,
  card: baseNeutralColors.panel,
  notification: baseNeutralColors.primary,
  link: '#1e4b88',
} as const;

export const Colors = {
  light: neutralTheme,
  dark: neutralTheme,
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
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
