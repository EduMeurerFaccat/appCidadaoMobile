import { useTheme } from "@constants/useTheme";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface ButtonProps extends React.ComponentProps<typeof TouchableOpacity> {
  title: string;
};

export function ThemedButton(props: ButtonProps) {
  const colors = useTheme();

  return (
    <TouchableOpacity
      style={[styles.buttonPrimary, { backgroundColor: colors.backgroudSecondary }, props.style]}
      onPress={props.onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, { color: colors.text }]}>{props.title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonPrimary: {
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  text: {
    fontWeight: "600",
    fontSize: 16,
  },
});
