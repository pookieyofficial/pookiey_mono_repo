// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];
type MaterialCommunityIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house': { icon: 'home-outline', library: 'community' } as { icon: MaterialCommunityIconName; library: 'community' },
  'house.fill': { icon: 'home', library: 'material' } as { icon: MaterialIconName; library: 'material' },
  'message': { icon: 'message-outline', library: 'community' } as { icon: MaterialCommunityIconName; library: 'community' },
  'message.fill': { icon: 'message', library: 'community' } as { icon: MaterialCommunityIconName; library: 'community' },
  'gearshape': { icon: 'cog-outline', library: 'community' } as { icon: MaterialCommunityIconName; library: 'community' },
  'gearshape.fill': { icon: 'cog', library: 'community' } as { icon: MaterialCommunityIconName; library: 'community' },
  'paperplane.fill': { icon: 'send', library: 'material' } as { icon: MaterialIconName; library: 'material' },
  'gear.circle.fill': { icon: 'settings', library: 'material' } as { icon: MaterialIconName; library: 'material' },
  'heart': { icon: 'favorite-border', library: 'material' } as { icon: MaterialIconName; library: 'material' },
  'heart.fill': { icon: 'favorite', library: 'material' } as { icon: MaterialIconName; library: 'material' },
  'chevron.left.forwardslash.chevron.right': { icon: 'code', library: 'material' } as { icon: MaterialIconName; library: 'material' },
  'chevron.right': { icon: 'chevron-right', library: 'material' } as { icon: MaterialIconName; library: 'material' },
  'camera': { icon: 'camera-outline', library: 'community' } as { icon: MaterialCommunityIconName; library: 'community' },
  'camera.fill': { icon: 'camera', library: 'community' } as { icon: MaterialCommunityIconName; library: 'community' },
  
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
  const mapping = MAPPING[name];

  if (mapping.library === 'community') {
    return (
      <MaterialCommunityIcons
        color={color}
        size={size}
        name={mapping.icon as MaterialCommunityIconName}
        style={style}
      />
    );
  }

  return (
    <MaterialIcons
      color={color}
      size={size}
      name={mapping.icon as MaterialIconName}
      style={style}
    />
  );
}
