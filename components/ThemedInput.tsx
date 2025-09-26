// components/ThemedInput.tsx
import { useTheme } from '@/constants/useTheme';
import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

export function ThemedInput({ style, ...props }: TextInputProps) {
  const colors = useTheme();

  return (
    <TextInput
      {...props}
      style={[
        styles.input,
        {
          backgroundColor: colors.background,
          borderColor: colors.tint,
          color: colors.text,
        },
        style,
      ]}
      placeholderTextColor={colors.text}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 48, // altura padrão para campos de uma linha
  },
});
