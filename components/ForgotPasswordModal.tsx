import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { apiService } from '@/services/apiService';

interface ForgotPasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ visible, onClose }: ForgotPasswordModalProps) {
  const { colors } = useTheme();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await apiService.forgotPassword({ email });
      setEmailSent(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to send reset email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setEmailSent(false);
    setError('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            Reset Password
          </Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Feather name={"x"} size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {!emailSent ? (
            <>
              <View style={styles.iconContainer}>
                <Feather name={"mail"} size={48} color={colors.primary} />
              </View>

              <Text style={[styles.description, { color: colors.textSecondary }]}>
                Enter your email address and we'll send you a link to reset your password.
              </Text>

              <Input
                label="Email Address"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError('');
                }}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                error={error}
              />

              <Button
                title="Send Reset Email"
                onPress={handleSubmit}
                loading={isSubmitting}
                disabled={isSubmitting}
              />
            </>
          ) : (
            <>
              <View style={styles.iconContainer}>
                <Feather name={"mail"} size={48} color={colors.success} />
              </View>

              <Text style={[styles.successTitle, { color: colors.text }]}>
                Check Your Email
              </Text>

              <Text style={[styles.successDescription, { color: colors.textSecondary }]}>
                If an account exists with that email address, a password reset link has been sent.
                Please check your inbox and follow the instructions to reset your password.
              </Text>

              <Button
                title="Done"
                onPress={handleClose}
              />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  successDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
});