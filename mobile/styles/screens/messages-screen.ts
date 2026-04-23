import { StyleSheet } from 'react-native'
import { layout } from '@/constants/theme'
import { textStyles } from '@/constants/typography'

export const messagesScreenStyles = StyleSheet.create({
  screen: {
    flex: 1
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  pressed: {
    opacity: 0.9
  },
  inboxHeader: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 12,
    gap: 12,
    borderBottomWidth: 1
  },
  inboxTitle: {
    fontSize: 30,
    lineHeight: 36,
    ...textStyles.headline
  },
  searchField: {
    minHeight: 46,
    borderRadius: layout.radius.pill,
    borderWidth: 1,
    paddingLeft: 14,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  searchInput: {
    flex: 1,
    minHeight: 44,
    fontSize: 15,
    ...textStyles.bodyStrong
  },
  clearSearchButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  threadList: {
    flex: 1
  },
  threadListContent: {
    paddingTop: 6
  },
  threadRow: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  threadSeparator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: layout.screenPadding + 60,
    marginRight: layout.screenPadding
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 15,
    ...textStyles.title
  },
  threadCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3
  },
  threadTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  threadName: {
    flex: 1,
    fontSize: 16,
    ...textStyles.title
  },
  threadTime: {
    fontSize: 12,
    ...textStyles.label
  },
  threadContext: {
    fontSize: 12,
    lineHeight: 16,
    ...textStyles.label
  },
  threadPreview: {
    fontSize: 14,
    lineHeight: 20,
    ...textStyles.bodyStrong
  },
  detailHeader: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1
  },
  backButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center'
  },
  detailHeaderCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2
  },
  detailTitle: {
    fontSize: 16,
    ...textStyles.title
  },
  detailSubtitle: {
    fontSize: 13,
    lineHeight: 18
  },
  messageList: {
    flex: 1
  },
  messageListContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: 16,
    gap: 12
  },
  messageRow: {
    flexDirection: 'row'
  },
  messageRowMine: {
    justifyContent: 'flex-end'
  },
  messageRowOther: {
    justifyContent: 'flex-start'
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 8
  },
  messageBody: {
    fontSize: 15,
    lineHeight: 21,
    ...textStyles.bodyStrong
  },
  messageTime: {
    fontSize: 11,
    ...textStyles.label
  },
  composerBar: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    borderTopWidth: 1
  },
  composerInputWrap: {
    flex: 1,
    minHeight: 52,
    maxHeight: 132,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  composerInput: {
    fontSize: 15,
    lineHeight: 21,
    maxHeight: 112,
    textAlignVertical: 'top',
    ...textStyles.body
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorBanner: {
    borderRadius: layout.radius.lg,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  listHeaderWrap: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: 12
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    ...textStyles.bodyStrong
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 36,
    gap: 8
  },
  emptyTitle: {
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'center',
    ...textStyles.title
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    ...textStyles.body
  }
})
