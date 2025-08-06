import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (newValue: boolean) => void;
  disabled?: boolean;
}

export function Checkbox({ label, checked, onChange, disabled = false }: CheckboxProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={() => !disabled && onChange(!checked)}
      style={({ pressed }) => [
        styles.container,
        {
          opacity: disabled ? 0.5 : 1,
          backgroundColor: pressed ? colors.surface : 'transparent',
        },
      ]}
    >
      <View
        style={[
          styles.checkbox,
          {
            borderColor: colors.border,
            backgroundColor: checked ? colors.primary : 'transparent',
          },
        ]}
      >
        {checked && <Feather name="check" size={16} color="#fff" />}
      </View>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
  },
});
