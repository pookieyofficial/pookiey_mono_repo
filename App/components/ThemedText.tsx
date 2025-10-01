import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | "bold";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {

  return (
    <Text
      selectable={true}
      style={[
        { color: Colors.primaryBackgroundColor },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'bold' ? styles.bold : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    fontFamily: 'HellixMedium',
  },
  defaultSemiBold: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'HellixSemiBold',
  },
  title: {
    fontSize: 32,
    fontFamily: 'HellixSemiBold',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'HellixMedium',
  },
  link: {
    fontSize: 16,
    color: Colors.primaryBackgroundColor,
    fontFamily: 'HellixBold',
  },
  bold: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'HellixBold',
  },
});
