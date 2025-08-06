import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
}

export function Button({
                         title,
                         onPress,
                         variant = 'primary',
                         size = 'medium',
                         disabled = false,
                         loading = false,
                       }: ButtonProps) {
  const { colors } = useTheme();

  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];

    if (disabled || loading) {
      return [...baseStyle, { backgroundColor: colors.border, opacity: 0.6 }];
    }

    switch (variant) {
      case 'primary':
        return [...baseStyle, { backgroundColor: colors.primary }];
      case 'secondary':
        return [...baseStyle, { backgroundColor: colors.secondary }];
      case 'outline':
        return [...baseStyle, { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary }];
      default:
        return [...baseStyle, { backgroundColor: colors.primary }];
    }
  };

  const getTextStyle = () => {
    if (variant === 'outline') {
      return [styles.text, styles[`${size}Text`], { color: colors.primary }];
    }
    return [styles.text, styles[`${size}Text`], { color: variant === 'secondary' ? colors.text : '#FFFFFF' }];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'outline' ? colors.primary : '#FFFFFF'} />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  medium: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  large: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  text: {
    fontWeight: '600',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});