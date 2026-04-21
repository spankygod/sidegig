import { StyleSheet } from 'react-native'
import { layout } from '@/constants/theme'
import { textStyles } from '@/constants/typography'

export const messagesScreenStyles = StyleSheet.create({
  screen: {
    flex: 1
  },
  scrollArea: {
    flex: 1
  },
  contentContainer: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: 24,
    paddingBottom: 112,
    gap: layout.sectionGap
  },
  heroBlock: {
    gap: 10
  },
  eyebrow: {
    fontSize: 13,
    letterSpacing: 0.2,
    ...textStyles.title
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    ...textStyles.headline
  },
  body: {
    fontSize: 15,
    lineHeight: 22
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 20,
    paddingBottom: 10,
    borderBottomWidth: 1
  },
  activeTab: {
    gap: 8
  },
  tabLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  tabLabelRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 2
  },
  activeTabLabel: {
    fontSize: 15,
    ...textStyles.title
  },
  inactiveTabLabel: {
    fontSize: 15,
    ...textStyles.label
  },
  activeTabIndicator: {
    height: 2,
    width: 108,
    borderRadius: 999
  },
  searchBar: {
    minHeight: 42,
    borderRadius: 999,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  searchText: {
    flex: 1,
    fontSize: 14,
    ...textStyles.bodyStrong
  },
  featuredCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  featuredAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  featuredAvatarText: {
    color: '#4f6158',
    fontSize: 13,
    ...textStyles.title
  },
  featuredCopy: {
    flex: 1,
    gap: 4
  },
  featuredMessage: {
    fontSize: 13,
    lineHeight: 19
  },
  featuredMessageStrong: {
    ...textStyles.title
  },
  featuredReplyAccent: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start'
  },
  featuredReplyText: {
    fontSize: 12,
    ...textStyles.title
  },
  threadList: {
    gap: 2
  },
  threadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 8
  },
  threadAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center'
  },
  threadAvatarText: {
    color: '#ffffff',
    fontSize: 14,
    ...textStyles.title
  },
  threadCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4
  },
  threadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  threadName: {
    flexShrink: 1,
    fontSize: 15,
    ...textStyles.title
  },
  threadPin: {
    fontSize: 12
  },
  previewPrefixRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  previewPrefixText: {
    fontSize: 13,
    lineHeight: 18
  },
  previewText: {
    fontSize: 13,
    lineHeight: 18,
    ...textStyles.bodyStrong
  },
  threadMeta: {
    alignItems: 'flex-end',
    gap: 8
  },
  timeLabel: {
    fontSize: 12,
    ...textStyles.label
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 999,
    backgroundColor: '#d84c4c',
    alignItems: 'center',
    justifyContent: 'center'
  },
  unreadBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    ...textStyles.title
  }
})
