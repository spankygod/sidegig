import { StyleSheet } from 'react-native'
import { layout } from '@/constants/theme'
import { appTypography } from '@/constants/typography'

export const onboardingScreenStyles = StyleSheet.create({
  screen: {
    flex: 1
  },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 28
  },
  card: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 24,
    borderCurve: 'continuous',
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 24
  },
  hero: {
    gap: 10
  },
  progressText: {
    fontFamily: appTypography.medium,
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.2
  },
  kicker: {
    alignSelf: 'flex-start',
    borderRadius: layout.radius.pill,
    borderCurve: 'continuous',
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  kickerText: {
    fontFamily: appTypography.medium,
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.6
  },
  title: {
    fontFamily: appTypography.bold,
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 34
  },
  description: {
    fontFamily: appTypography.regular,
    fontWeight: '400',
    fontSize: 15,
    lineHeight: 22
  },
  email: {
    fontFamily: appTypography.medium,
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 18
  },
  form: {
    gap: 16
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12
  },
  actionButton: {
    flex: 1
  },
  helperText: {
    fontFamily: appTypography.regular,
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 18
  },
  photoCard: {
    alignItems: 'center',
    gap: 14,
    borderRadius: 20,
    borderCurve: 'continuous',
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 20
  },
  photoPreview: {
    width: 108,
    height: 108,
    borderRadius: 999,
    overflow: 'hidden'
  },
  photoTitle: {
    fontFamily: appTypography.bold,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 22
  },
  photoDescription: {
    fontFamily: appTypography.regular,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center'
  },
  messageCard: {
    borderRadius: 16,
    borderCurve: 'continuous',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  messageText: {
    fontFamily: appTypography.medium,
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 18
  }
})
