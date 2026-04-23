import { StyleSheet } from 'react-native'
import { layout } from '@/constants/theme'
import { textStyles } from '@/constants/typography'

export const selectionSheetStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(9, 11, 12, 0.42)'
  },
  dismissArea: {
    flex: 1
  },
  sheetCard: {
    minHeight: '64%',
    maxHeight: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderCurve: 'continuous',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 10
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#d5d2d6',
    marginBottom: 4
  },
  title: {
    fontSize: 17,
    textAlign: 'left',
    ...textStyles.title
  },
  searchInput: {
    minHeight: layout.inputHeight + 2,
    borderRadius: 14,
    borderCurve: 'continuous',
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    ...textStyles.bodyStrong
  },
  optionsList: {
    flexGrow: 1
  },
  option: {
    minHeight: 54,
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 4,
    paddingVertical: 14
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  optionCopy: {
    flex: 1,
    gap: 4
  },
  optionLabel: {
    fontSize: 15,
    ...textStyles.title
  },
  optionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    ...textStyles.body
  },
  selectionIndicator: {
    width: 10,
    height: 10,
    borderRadius: 999,
    borderWidth: 1
  },
  emptyState: {
    paddingVertical: 28,
    paddingHorizontal: 8
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    ...textStyles.body
  }
})
