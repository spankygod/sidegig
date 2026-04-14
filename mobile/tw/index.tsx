import { Link as RouterLink } from 'expo-router';
import type { ComponentProps } from 'react';
import {
  useCssElement,
  useNativeVariable as useFunctionalVariable,
} from 'react-native-css';
import Animated from 'react-native-reanimated';
import {
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  Text as RNText,
  TextInput as RNTextInput,
  TouchableHighlight as RNTouchableHighlight,
  View as RNView,
} from 'react-native';

export const useCSSVariable =
  process.env.EXPO_OS !== 'web'
    ? useFunctionalVariable
    : (variable: string) => `var(${variable})`;

export function Link(props: ComponentProps<typeof RouterLink> & { className?: string }) {
  return useCssElement(RouterLink, props, { className: 'style' });
}

Link.Trigger = RouterLink.Trigger;
Link.Menu = RouterLink.Menu;
Link.MenuAction = RouterLink.MenuAction;
Link.Preview = RouterLink.Preview;

export function View(props: ComponentProps<typeof RNView> & { className?: string }) {
  return useCssElement(RNView, props, { className: 'style' });
}

View.displayName = 'CSS(View)';

export function Text(props: ComponentProps<typeof RNText> & { className?: string }) {
  return useCssElement(RNText, props, { className: 'style' });
}

Text.displayName = 'CSS(Text)';

export function Pressable(props: ComponentProps<typeof RNPressable> & { className?: string }) {
  return useCssElement(RNPressable, props, { className: 'style' });
}

Pressable.displayName = 'CSS(Pressable)';

export function TextInput(props: ComponentProps<typeof RNTextInput> & { className?: string }) {
  return useCssElement(RNTextInput, props, { className: 'style' });
}

TextInput.displayName = 'CSS(TextInput)';

export function ScrollView(
  props: ComponentProps<typeof RNScrollView> & {
    className?: string;
    contentContainerClassName?: string;
  }
) {
  return useCssElement(RNScrollView, props, {
    className: 'style',
    contentContainerClassName: 'contentContainerStyle',
  });
}

ScrollView.displayName = 'CSS(ScrollView)';

function BaseTouchableHighlight(props: ComponentProps<typeof RNTouchableHighlight>) {
  return <RNTouchableHighlight {...props} />;
}

export function TouchableHighlight(
  props: ComponentProps<typeof RNTouchableHighlight> & { className?: string }
) {
  return useCssElement(BaseTouchableHighlight, props, { className: 'style' });
}

TouchableHighlight.displayName = 'CSS(TouchableHighlight)';

export function AnimatedScrollView(
  props: ComponentProps<typeof Animated.ScrollView> & {
    className?: string;
    contentClassName?: string;
    contentContainerClassName?: string;
  }
) {
  return useCssElement(Animated.ScrollView, props, {
    className: 'style',
    contentClassName: 'contentContainerStyle',
    contentContainerClassName: 'contentContainerStyle',
  });
}
