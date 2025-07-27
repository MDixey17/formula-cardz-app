import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AuthRequest, NewUserRequest } from '@/types/api';

export default function ProfileScreen() {
  const { user, login, register, logout, isLoading } = useAuth();
  const { colors, theme, setTheme, isDark } = useTheme();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (isLoading) {
    return <LoadingSpinner message="Loading..." />;
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLoginMode) {
      if (!username.trim()) {
        newErrors.username = 'Username is required';
      }

      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (isLoginMode) {
        const credentials: AuthRequest = { email, password };
        await login(credentials);
      } else {
        const userData: NewUserRequest = {
          username,
          email,
          password,
          favoriteDrivers: [],
          favoriteConstructors: [],
        };
        await register(userData);
      }

      // Clear form
      setEmail('');
      setPassword('');
      setUsername('');
      setConfirmPassword('');
      setErrors({});
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Authentication failed'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Feather name={'sun'} size={20} color={colors.textSecondary} />;
      case 'dark':
        return <Feather name={'moon'} size={20} color={colors.textSecondary} />;
      default:
        return <Feather name={"monitor"} size={20} color={colors.textSecondary} />;
    }
  };

  if (user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.surface }]}
              onPress={() => {}}
            >
              <Feather name={"settings"} size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.welcomeText, { color: colors.text }]}>
              Welcome back, {user.username}!
            </Text>
            <Text style={[styles.emailText, { color: colors.textSecondary }]}>
              {user.email}
            </Text>

            {user.hasPremium && (
              <View style={[styles.premiumBadge, { backgroundColor: colors.accent }]}>
                <Text style={styles.premiumText}>Premium Member</Text>
              </View>
            )}
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Favorite Drivers
            </Text>
            {user.favoriteDrivers.length > 0 ? (
              <View style={styles.favoritesList}>
                {user.favoriteDrivers.map((driver, index) => (
                  <View key={index} style={[styles.favoriteItem, { backgroundColor: colors.background }]}>
                    <Text style={[styles.favoriteText, { color: colors.text }]}>{driver}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No favorite drivers selected
              </Text>
            )}
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Favorite Constructors
            </Text>
            {user.favoriteConstructors.length > 0 ? (
              <View style={styles.favoritesList}>
                {user.favoriteConstructors.map((constructor, index) => (
                  <View key={index} style={[styles.favoriteItem, { backgroundColor: colors.background }]}>
                    <Text style={[styles.favoriteText, { color: colors.text }]}>{constructor}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No favorite constructors selected
              </Text>
            )}
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Theme</Text>
            <View style={styles.themeSelector}>
              {(['light', 'dark', 'system'] as const).map((themeOption) => (
                <TouchableOpacity
                  key={themeOption}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor: theme === themeOption ? colors.primary : colors.background,
                    }
                  ]}
                  onPress={() => setTheme(themeOption)}
                >
                  <Text style={[
                    styles.themeOptionText,
                    {
                      color: theme === themeOption ? '#FFFFFF' : colors.text,
                    }
                  ]}>
                    {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
          />

          <View style={styles.disclaimer}>
            <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
              Formula Cardz is an independent application and is not affiliated with, endorsed by, or sponsored by Formula 1, Topps, or any of their respective affiliates. All trademarks and copyrights belong to their respective owners.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.authHeader}>
          <Text style={[styles.authTitle, { color: colors.text }]}>
            Formula Cardz
          </Text>
          <Text style={[styles.authSubtitle, { color: colors.textSecondary }]}>
            Your F1 Trading Card Collection
          </Text>
        </View>

        <View style={[styles.authCard, { backgroundColor: colors.surface }]}>
          <View style={styles.authToggle}>
            <TouchableOpacity
              style={[
                styles.authToggleButton,
                isLoginMode && { backgroundColor: colors.primary }
              ]}
              onPress={() => setIsLoginMode(true)}
            >
              <Text style={[
                styles.authToggleText,
                { color: isLoginMode ? '#FFFFFF' : colors.textSecondary }
              ]}>
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.authToggleButton,
                !isLoginMode && { backgroundColor: colors.primary }
              ]}
              onPress={() => setIsLoginMode(false)}
            >
              <Text style={[
                styles.authToggleText,
                { color: !isLoginMode ? '#FFFFFF' : colors.textSecondary }
              ]}>
                Register
              </Text>
            </TouchableOpacity>
          </View>

          {!isLoginMode && (
            <Input
              label="Username"
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              error={errors.username}
              autoCapitalize="none"
            />
          )}

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            error={errors.email}
            autoCapitalize="none"
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            error={errors.password}
          />

          {!isLoginMode && (
            <Input
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              secureTextEntry
              error={errors.confirmPassword}
            />
          )}

          <Button
            title={isLoginMode ? 'Login' : 'Create Account'}
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
          />

          {isLoginMode && (
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.disclaimer}>
          <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
            Formula Cardz is an independent application and is not affiliated with, endorsed by, or sponsored by Formula 1, Topps, or any of their respective affiliates. All trademarks and copyrights belong to their respective owners.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    marginBottom: 12,
  },
  premiumBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  premiumText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  favoritesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  favoriteItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  favoriteText: {
    fontSize: 14,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  themeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  themeOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  authTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  authCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  authToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  authToggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  authToggleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  disclaimer: {
    marginTop: 24,
    padding: 16,
  },
  disclaimerText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});