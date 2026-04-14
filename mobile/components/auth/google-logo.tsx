import { AntDesign } from '@expo/vector-icons';

import { Colors } from '@/constants/theme';

type GoogleLogoProps = {
  color?: string;
  size?: number;
};

export function GoogleLogo({ color = Colors.light.text, size = 16 }: GoogleLogoProps) {
  return <AntDesign color={color} name="google" size={size} />;
}
