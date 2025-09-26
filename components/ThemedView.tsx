import { useThemeColor } from "@/hooks/useThemeColor";
import { StyleProp, View, ViewProps, ViewStyle } from "react-native";

type ThemedViewProps = {
  style?: StyleProp<ViewStyle>;
  lightColor?: string;
  darkColor?: string;
} & ViewProps;

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
    <View
      style={[{ backgroundColor }, style]}
      pointerEvents="box-none" // <- esta linha é essencial
      {...otherProps}
    />
  );
}
