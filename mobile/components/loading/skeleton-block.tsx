import React from 'react'
import { Animated, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import { palette, type PaletteMode } from '@/constants/palette'

type SkeletonBlockProps = {
  mode?: PaletteMode
  width?: number | `${number}%`
  height: number
  radius?: number
  style?: StyleProp<ViewStyle>
}

export function SkeletonBlock({
  mode,
  width = '100%',
  height,
  radius = 12,
  style
}: SkeletonBlockProps) {
  const pulse = React.useRef(new Animated.Value(0.55)).current
  const colors = palette[mode ?? 'light']

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true
        }),
        Animated.timing(pulse, {
          toValue: 0.55,
          duration: 800,
          useNativeDriver: true
        })
      ])
    )

    animation.start()

    return () => {
      animation.stop()
    }
  }, [pulse])

  return (
    <Animated.View
      style={[
        styles.block,
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: colors.surfaceMuted,
          opacity: pulse
        },
        style
      ]}
    />
  )
}

const styles = StyleSheet.create({
  block: {
    overflow: 'hidden'
  }
})
