export const palette = {
  light: {
    background: '#f6f7f3',
    surface: '#ffffff',
    surfaceMuted: '#eef3ee',
    border: '#d8e0d9',
    text: '#17211d',
    textMuted: '#4f6158',
    accent: '#0f766e',
    accentSoft: '#d8f3ef',
    success: '#2f855a',
    warning: '#c05621',
    danger: '#c53030'
  },
  dark: {
    background: '#101714',
    surface: '#17211d',
    surfaceMuted: '#1d2a25',
    border: '#2b3a34',
    text: '#f4f7f4',
    textMuted: '#a9bab0',
    accent: '#5eead4',
    accentSoft: '#123833',
    success: '#68d391',
    warning: '#f6ad55',
    danger: '#fc8181'
  }
} as const

export type PaletteMode = keyof typeof palette

export function resolvePaletteMode(colorScheme: 'light' | 'dark' | null | undefined): PaletteMode {
  if (colorScheme === 'dark') {
    return 'dark'
  }

  return 'light'
}
