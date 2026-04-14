import * as TW from '@/tw';
import RNAnimated from 'react-native-reanimated';

export const Animated = {
  ...RNAnimated,
  View: RNAnimated.createAnimatedComponent(TW.View),
};
