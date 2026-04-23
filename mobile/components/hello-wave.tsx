import Animated from 'react-native-reanimated';
import { helloWaveStyles as styles } from '@/styles/components/hello-wave';

export function HelloWave() {
  return (
    <Animated.Text style={styles.wave}>
      👋
    </Animated.Text>
  );
}
