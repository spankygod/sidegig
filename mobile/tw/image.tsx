import { Image as ExpoImage } from 'expo-image';
import type { ComponentProps } from 'react';
import { useCssElement } from 'react-native-css';
import Animated from 'react-native-reanimated';
import { StyleSheet } from 'react-native';

const AnimatedExpoImage = Animated.createAnimatedComponent(ExpoImage);

function CSSImage(props: ComponentProps<typeof AnimatedExpoImage>) {
  // @ts-expect-error React Native CSS maps object fit into style.
  const { objectFit, objectPosition, ...style } = StyleSheet.flatten(props.style) || {};

  return (
    <AnimatedExpoImage
      contentFit={objectFit}
      contentPosition={objectPosition}
      {...props}
      source={typeof props.source === 'string' ? { uri: props.source } : props.source}
      // @ts-expect-error Style is remapped above.
      style={style}
    />
  );
}

export function Image(props: ComponentProps<typeof CSSImage> & { className?: string }) {
  return useCssElement(CSSImage, props, { className: 'style' });
}

Image.displayName = 'CSS(Image)';
