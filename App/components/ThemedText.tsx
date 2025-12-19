import { StyleSheet, Text, type TextProps } from 'react-native';

import { Colors } from '@/constants/Colors';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | "bold";
};

export function ThemedText({
  style,
  type = 'default',
  ...rest
}: ThemedTextProps) {

  return (
    <Text
      selectable={false}
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
    width: 'auto'
  },
  defaultSemiBold: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'HellixSemiBold',
    width: 'auto'

  },
  title: {
    fontSize: 32,
    fontFamily: 'HellixSemiBold',
    width: 'auto'

  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'HellixMedium',
    width: 'auto'

  },
  link: {
    fontSize: 16,
    color: Colors.primaryBackgroundColor,
    fontFamily: 'HellixBold',
    width: 'auto'

  },
  bold: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'HellixBold',
    width: 'auto'

  },
});
