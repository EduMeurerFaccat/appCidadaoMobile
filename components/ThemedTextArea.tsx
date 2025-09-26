import { Colors } from "@/constants/Colors";
import { useTheme } from "@/constants/useTheme";
import { StyleSheet, TextInput, TextInputProps } from "react-native";

type ThemedTextAreaProps = TextInputProps & {
  colorScheme?: 'auto' | 'light' | 'dark';
  borderStyle?: 'default' | 'soft' | 'none';
};

export function ThemedTextArea({ style, colorScheme = 'auto', borderStyle = 'default', ...props }: ThemedTextAreaProps) {
  const sys = useTheme();
  const colors = colorScheme === 'light' ? Colors.light : colorScheme === 'dark' ? Colors.dark : sys;

  const placeholderColor = `${colors.text}80`; // ~50% opacity
  const bg = colors.backgroudSecondary ?? colors.background;
  // border behavior
  const borderColor = borderStyle === 'soft' ? bg : (borderStyle === 'none' ? 'transparent' : colors.tint);
  const borderWidth = borderStyle === 'none' ? 0 : 1;
  return (
    <TextInput
      {...props}
      multiline
      textAlignVertical="top"
      style={[
        styles.textArea,
        {
          backgroundColor: bg,
          borderColor,
          borderWidth,
          color: colors.text,
        },
        style,
      ]}
      placeholderTextColor={placeholderColor as any}
    />
  );
}

const styles = StyleSheet.create({
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    fontSize: 16,
  },
});
