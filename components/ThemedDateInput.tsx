import { useTheme } from "@/constants/useTheme";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";

type Props = {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
};

export function ThemedDateInput({ label, value, onChange }: Props) {
  const colors = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  return (
    <View style={{ marginBottom: 20 }}>
      {label && <ThemedText type="subtitle">{label}</ThemedText>}

      <TouchableOpacity
        onPressIn={() => setShowPicker(true)}
        style={[
          styles.input,
          {
            backgroundColor: colors.background,
            borderColor: colors.tint,
          },
        ]}
        activeOpacity={0.8}
      >
        <ThemedText style={{ color: colors.text }}>
          {value.toLocaleDateString()}
        </ThemedText>
        <MaterialIcons
          name="date-range"
          size={24}
          color={colors.text}
          style={styles.icon}
        />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, date) => {
            setShowPicker(false);
            console.log("Date selected:", date);
            
            if(date){ 
              date.setHours(0, 0, 0, 0);
              onChange(date);
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 48,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  icon: {
    marginLeft: 12,
  },
});
