import { StyleSheet } from 'react-native'
import { layout } from '@/constants/theme'
import { appTypography } from '@/constants/typography'

export const signInScreenStyles = StyleSheet.create({
  screen: {
    flex: 1
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32
  },
  card: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    gap: 24
  },
  hero: {
    alignItems: 'center',
    gap: 20
  },
  brandMark: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderCurve: 'continuous'
  },
  heroCopy: {
    width: '100%',
    gap: 8
  },
  heroTitle: {
    fontFamily: appTypography.bold,
    fontWeight: '700',
    fontSize: 21,
    lineHeight: 30
  },
  heroBody: {
    fontFamily: appTypography.regular,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20
  },
  form: {
    gap: 14
  },
  inputWrap: {
    borderRadius: 16,
    borderCurve: 'continuous',
    borderWidth: 1,
    paddingHorizontal: 16
  },
  passwordWrap: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center'
  },
  input: {
    minHeight: 56,
    fontFamily: appTypography.regular,
    fontWeight: '400',
    fontSize: 15
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 16,
    fontFamily: appTypography.regular,
    fontWeight: '400',
    fontSize: 15
  },
  utilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 4
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  checkbox: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    borderCurve: 'continuous',
    borderWidth: 1
  },
  utilityText: {
    fontFamily: appTypography.regular,
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 16
  },
  utilityAction: {
    fontFamily: appTypography.medium,
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 16
  },
  primaryButton: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderCurve: 'continuous',
    paddingHorizontal: 16
  },
  primaryButtonDisabled: {
    opacity: 0.7
  },
  primaryButtonText: {
    fontFamily: appTypography.medium,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 20,
    color: '#ffffff'
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4
  },
  dividerLine: {
    height: StyleSheet.hairlineWidth,
    flex: 1
  },
  dividerText: {
    fontFamily: appTypography.regular,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20
  },
  secondaryButton: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 16,
    borderCurve: 'continuous',
    borderWidth: 1,
    paddingHorizontal: 16
  },
  secondaryButtonDisabled: {
    opacity: 0.7
  },
  secondaryButtonText: {
    fontFamily: appTypography.medium,
    fontWeight: '500',
    fontSize: 15,
    lineHeight: 20
  },
  messageCard: {
    borderRadius: 16,
    borderCurve: 'continuous',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  messageText: {
    fontFamily: appTypography.medium,
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 20
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 8
  },
  footerText: {
    fontFamily: appTypography.regular,
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 20
  },
  footerAction: {
    fontFamily: appTypography.medium,
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 20
  }
})
