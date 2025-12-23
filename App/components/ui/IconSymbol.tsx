// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home' as MaterialIconName,
  'house': 'home' as MaterialIconName,
  'message': 'question-answer' as MaterialIconName, // Rounded chat bubble (most rounded option)
  'message.fill': 'question-answer' as MaterialIconName, // Rounded chat bubble filled
  'gearshape': 'settings' as MaterialIconName,
  'gearshape.fill': 'settings' as MaterialIconName,
  'paperplane.fill': 'send' as MaterialIconName,
  'gear.circle.fill': 'settings' as MaterialIconName,
  'heart.fill': 'favorite' as MaterialIconName,
  'chevron.left.forwardslash.chevron.right': 'code' as MaterialIconName,
  'chevron.right': 'chevron-right' as MaterialIconName,
  'camera.fill': 'camera' as MaterialIconName,
  'camera': 'camera' as MaterialIconName,
  'fire': 'fire' as MaterialIconName,
  'fire.fill': 'fire' as MaterialIconName
} as const;

type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
