import { useTheme } from "@/constants/useTheme";
import { StyleSheet, Text, TextProps } from "react-native";

export type ThemedTextProps = TextProps & {
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
};

export function ThemedText({ style, type = "default", ...rest }: ThemedTextProps) {
  const colors = useTheme();

  // Cor padrão: colors.text; para tipo link: colors.tint (ou outra do tema que preferir)
  let color = colors.text;
  if (type === "link") {
    color = colors.tint;
  }

  return (
    <Text
      {...rest}
      style={[
        { color },
        type === "default" && styles.default,
        type === "title" && styles.title,
        type === "defaultSemiBold" && styles.defaultSemiBold,
        type === "subtitle" && styles.subtitle,
        type === "link" && styles.link,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
  },
  defaultSemiBold: {
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    // removi o color daqui para usar só o do tema
    fontSize: 16,
  },
});
