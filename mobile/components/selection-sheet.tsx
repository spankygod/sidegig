import React from 'react'
import * as Haptics from 'expo-haptics'
import { FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native'
import { palette, type PaletteMode } from '@/constants/palette'
import { selectionSheetStyles as styles } from '@/styles/components/selection-sheet'

export type SelectionOption = {
  key: string
  label: string
  subtitle?: string
}

type SelectionSheetProps = {
  emptyMessage: string
  mode?: PaletteMode
  onClose: () => void
  onSelect: (option: SelectionOption) => void
  options: SelectionOption[]
  searchPlaceholder: string
  selectedKey?: string | null
  title: string
  visible: boolean
}

function normalizeSearchValue(value: string): string {
  return value
    .toLocaleLowerCase('en-PH')
    .replace(/\s+/g, ' ')
    .trim()
}

function getOptionBackgroundColor(
  colors: (typeof palette)[PaletteMode],
  isSelected: boolean,
  pressed: boolean
): string {
  if (isSelected) {
    return colors.accentSoft
  }

  if (pressed) {
    return colors.surfaceMuted
  }

  return colors.surface
}

function getOptionBottomBorderColor(
  colors: (typeof palette)[PaletteMode],
  isSelected: boolean
): string {
  if (isSelected) {
    return colors.accent
  }

  return colors.border
}

function getSelectionIndicatorStyle(
  colors: (typeof palette)[PaletteMode],
  isSelected: boolean
) {
  if (isSelected) {
    return {
      backgroundColor: colors.accent,
      borderColor: colors.accent
    }
  }

  return {
    backgroundColor: 'transparent',
    borderColor: colors.border
  }
}

function getOptionOpacity(pressed: boolean): number {
  if (pressed) {
    return 0.92
  }

  return 1
}

export function SelectionSheet({
  emptyMessage,
  mode,
  onClose,
  onSelect,
  options,
  searchPlaceholder,
  selectedKey,
  title,
  visible
}: SelectionSheetProps) {
  const colors = palette[mode ?? 'light']
  const [searchQuery, setSearchQuery] = React.useState('')
  const [pendingSelectionKey, setPendingSelectionKey] = React.useState<string | null>(null)
  const activeSelectedKey = pendingSelectionKey ?? selectedKey ?? null

  React.useEffect(() => {
    if (!visible) {
      setSearchQuery('')
      setPendingSelectionKey(null)
    }
  }, [visible])

  const filteredOptions = React.useMemo(() => {
    const normalizedSearchQuery = normalizeSearchValue(searchQuery)

    if (normalizedSearchQuery === '') {
      return options
    }

    return options.filter((option) => (
      normalizeSearchValue(option.label).includes(normalizedSearchQuery) ||
      normalizeSearchValue(option.subtitle ?? '').includes(normalizedSearchQuery)
    ))
  }, [options, searchQuery])
  const isEmptyState = filteredOptions.length === 0

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.dismissArea} />
        <View style={[styles.sheetCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.handle} />
          <Text selectable style={[styles.title, { color: colors.text }]}>
            {title}
          </Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setSearchQuery}
            placeholder={searchPlaceholder}
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.accent}
            style={[styles.searchInput, { backgroundColor: colors.surfaceMuted, borderColor: colors.border, color: colors.text }]}
            value={searchQuery}
          />

          {isEmptyState && (
            <View style={styles.emptyState}>
              <Text selectable style={[styles.emptyText, { color: colors.textMuted }]}>
                {emptyMessage}
              </Text>
            </View>
          )}
          {!isEmptyState && (
            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.key}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isSelected = item.key === activeSelectedKey
                const hasSubtitle = item.subtitle != null && item.subtitle.trim() !== ''
                const selectionIndicatorStyle = getSelectionIndicatorStyle(colors, isSelected)

                return (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      setPendingSelectionKey(item.key)
                      void Haptics.selectionAsync()
                      setTimeout(() => {
                        onSelect(item)
                      }, 80)
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      {
                        backgroundColor: getOptionBackgroundColor(colors, isSelected, pressed),
                        borderBottomColor: getOptionBottomBorderColor(colors, isSelected),
                        opacity: getOptionOpacity(pressed)
                      }
                    ]}
                  >
                    <View style={styles.optionContent}>
                      <View style={styles.optionCopy}>
                        <Text selectable style={[styles.optionLabel, { color: colors.text }]}>
                          {item.label}
                        </Text>
                        {hasSubtitle && (
                          <Text selectable style={[styles.optionSubtitle, { color: colors.textMuted }]}>
                            {item.subtitle}
                          </Text>
                        )}
                      </View>
                      <View
                        style={[
                          styles.selectionIndicator,
                          selectionIndicatorStyle
                        ]}
                      />
                    </View>
                  </Pressable>
                )
              }}
              style={styles.optionsList}
            />
          )}
        </View>
      </View>
    </Modal>
  )
}
