import { StyleSheet } from 'react-native'
import { layout } from '@/constants/theme'
import { textStyles } from '@/constants/typography'

export const postJobComposerStyles = StyleSheet.create({
  title: {
    fontSize: 24,
    lineHeight: 30,
    ...textStyles.title
  },
  description: {
    fontSize: 15,
    lineHeight: 22
  },
  errorText: {
    fontSize: 15,
    ...textStyles.title
  },
  fieldGroup: {
    gap: layout.spacing.xs
  },
  fieldLabel: {
    fontSize: 14,
    ...textStyles.label
  },
  budgetInputWrap: {
    minHeight: 52,
    borderRadius: layout.radius.sm,
    borderCurve: 'continuous',
    borderWidth: 1,
    paddingLeft: 14,
    paddingRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  budgetInput: {
    flex: 1,
    minHeight: 44,
    fontSize: 16,
    paddingVertical: 0,
    ...textStyles.title
  },
  budgetSuffix: {
    minWidth: 44,
    fontSize: 14,
    textAlign: 'right',
    ...textStyles.title
  },
  scheduleTrigger: {
    minHeight: 76,
    borderRadius: 16,
    borderCurve: 'continuous',
    borderWidth: 1,
    paddingHorizontal: 16,
    justifyContent: 'center'
  },
  scheduleCopy: {
    gap: 6
  },
  scheduleEyebrow: {
    fontSize: 12,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    ...textStyles.title
  },
  scheduleValue: {
    fontSize: 16,
    ...textStyles.title
  },
  sectionTitle: {
    fontSize: 15,
    ...textStyles.title
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  splitRow: {
    flexDirection: 'row',
    gap: 12
  },
  splitColumn: {
    flex: 1
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(9, 11, 12, 0.4)'
  },
  sheetDismissArea: {
    flex: 1
  },
  sheetCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderCurve: 'continuous',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 10
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 46,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#d5d2d6',
    marginBottom: 8
  },
  sheetTitle: {
    fontSize: 16,
    textAlign: 'center',
    ...textStyles.title
  },
  sheetDivider: {
    height: 1,
    backgroundColor: '#ebe8ec',
    marginHorizontal: -12
  },
  iosPickerWrap: {
    minHeight: 180,
    alignItems: 'stretch',
    justifyContent: 'center'
  },
  androidScheduleControls: {
    gap: 10,
    paddingTop: 2
  },
  androidWheelWrap: {
    minHeight: 200,
    borderRadius: 12,
    backgroundColor: '#f3f1f3',
    flexDirection: 'row',
    overflow: 'hidden'
  },
  androidWheelColumn: {
    backgroundColor: '#f3f1f3'
  },
  androidWheelOverlay: {
    borderRadius: 10,
    backgroundColor: '#ece9ed'
  },
  androidWheelItemText: {
    color: '#18181b',
    fontSize: 15,
    ...textStyles.title
  },
  androidWheelDivider: {
    width: 1,
    backgroundColor: '#ddd9de'
  },
  sheetPrimaryButton: {
    minHeight: 46,
    borderRadius: layout.radius.sm,
    backgroundColor: '#050507',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sheetPrimaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    ...textStyles.title
  },
  sheetSecondaryButton: {
    minHeight: 46,
    borderRadius: layout.radius.sm,
    backgroundColor: '#f2f0f2',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sheetSecondaryButtonText: {
    color: '#111111',
    fontSize: 15,
    ...textStyles.label
  }
})
