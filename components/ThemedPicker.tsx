import { useTheme } from "@/constants/useTheme";
import { Picker } from "@react-native-picker/picker";
import React from "react";
import { StyleSheet, View } from "react-native";

interface ThemedPickerProps {
  selectedValue: string;
  onValueChange: (itemValue: string) => void;
  items: { label: string; value: string }[];
}

export function ThemedPicker({ selectedValue, onValueChange, items }: ThemedPickerProps) {
  const colors = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderColor: colors.tint,
        },
      ]}
    >
      <Picker
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        style={{ color: colors.text }}
        dropdownIconColor={colors.text}
      >
        {items.map((item) => (
          <Picker.Item key={item.value} label={item.label} value={item.value} />
        ))}
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
  },
});
