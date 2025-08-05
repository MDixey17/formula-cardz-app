import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { apiService } from '@/services/apiService';
import { UpdateUserRequest } from '@/types/api';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

// Common F1 constructors and drivers for suggestions
const COMMON_CONSTRUCTORS = [
  'McLaren',
  'Ferrari',
  'Red Bull Racing',
  'Mercedes',
  'Aston Martin',
  'Alpine',
  'Williams',
  'Racing Bulls',
  'Kick Sauber',
  'Haas',
];

const COMMON_DRIVERS = [
  'Max Verstappen',
  'Lewis Hamilton',
  'Charles Leclerc',
  'Lando Norris',
  'Oscar Piastri',
  'George Russell',
  'Carlos Sainz',
  'Sergio Pérez',
  'Fernando Alonso',
  'Lance Stroll',
];

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const { colors } = useTheme();
  const { user, refreshUser } = useAuth();

  const [username, setUsername] = useState('');
  const [favoriteDrivers, setFavoriteDrivers] = useState<string[]>([]);
  const [favoriteConstructors, setFavoriteConstructors] = useState<string[]>([]);
  const [newDriver, setNewDriver] = useState('');
  const [newConstructor, setNewConstructor] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (visible && user) {
      setUsername(user.username);
      setFavoriteDrivers([...user.favoriteDrivers]);
      setFavoriteConstructors([...user.favoriteConstructors]);
      setHasChanges(false);
    }
  }, [visible, user]);

  useEffect(() => {
    if (user) {
      const usernameChanged = username !== user.username;
      const driversChanged = JSON.stringify(favoriteDrivers.sort()) !== JSON.stringify(user.favoriteDrivers.sort());
      const constructorsChanged = JSON.stringify(favoriteConstructors.sort()) !== JSON.stringify(user.favoriteConstructors.sort());

      setHasChanges(usernameChanged || driversChanged || constructorsChanged);
    }
  }, [username, favoriteDrivers, favoriteConstructors, user]);

  const addDriver = () => {
    if (newDriver.trim() && !favoriteDrivers.includes(newDriver.trim())) {
      setFavoriteDrivers([...favoriteDrivers, newDriver.trim()]);
      setNewDriver('');
    }
  };

  const removeDriver = (driver: string) => {
    setFavoriteDrivers(favoriteDrivers.filter(d => d !== driver));
  };

  const addConstructor = () => {
    if (newConstructor.trim() && !favoriteConstructors.includes(newConstructor.trim())) {
      setFavoriteConstructors([...favoriteConstructors, newConstructor.trim()]);
      setNewConstructor('');
    }
  };

  const removeConstructor = (constructor: string) => {
    setFavoriteConstructors(favoriteConstructors.filter(c => c !== constructor));
  };

  const handleSave = async () => {
    if (!user || !hasChanges) return;

    setIsSaving(true);
    try {
      const updateData: UpdateUserRequest = {
        username: username !== user.username ? username : undefined,
        favoriteDrivers: JSON.stringify(favoriteDrivers.sort()) !== JSON.stringify(user.favoriteDrivers.sort()) ? favoriteDrivers : undefined,
        favoriteConstructors: JSON.stringify(favoriteConstructors.sort()) !== JSON.stringify(user.favoriteConstructors.sort()) ? favoriteConstructors : undefined,
      };

      const updatedUser = await apiService.updateUser(user.id, updateData);
      await refreshUser(updatedUser)
      Alert.alert('Success', 'Your settings have been updated successfully');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to update settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to cancel?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard Changes',
            style: 'destructive',
            onPress: onClose
          },
        ]
      );
    } else {
      onClose();
    }
  };

  const renderFavoriteItem = (item: string, onRemove: () => void, icon: React.ReactNode) => (
    <View key={item} style={[styles.favoriteItem, { backgroundColor: colors.surface }]}>
      {icon}
      <Text style={[styles.favoriteItemText, { color: colors.text }]}>{item}</Text>
      <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
        <Feather name={"x"} size={16} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  const renderSuggestions = (suggestions: string[], current: string[], onAdd: (item: string) => void) => (
    <View style={styles.suggestions}>
      {suggestions
        .filter(item => !current.includes(item))
        .slice(0, 3)
        .map(item => (
          <TouchableOpacity
            key={item}
            style={[styles.suggestionChip, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}
            onPress={() => onAdd(item)}
          >
            <Text style={[styles.suggestionText, { color: colors.primary }]}>{item}</Text>
          </TouchableOpacity>
        ))}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
          <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
            <Feather name={"x"} size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Username Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name={"user"} size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Username</Text>
            </View>
            <Input
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              autoCapitalize="none"
            />
          </View>

          {/* Favorite Drivers Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name={"users"} size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Favorite Drivers</Text>
            </View>

            <View style={styles.addItemContainer}>
              <Input
                value={newDriver}
                onChangeText={setNewDriver}
                placeholder="Add a driver..."
                onSubmitEditing={addDriver}
              />
              <View style={{ paddingTop: 8 }}>
                <Button
                  title="Add"
                  onPress={addDriver}
                  size="small"
                  disabled={!newDriver.trim() || favoriteDrivers.includes(newDriver.trim())}
                />
              </View>
            </View>

            {renderSuggestions(COMMON_DRIVERS, favoriteDrivers, (driver) => {
              setFavoriteDrivers([...favoriteDrivers, driver]);
            })}

            <View style={styles.favoritesList}>
              {favoriteDrivers.map(driver =>
                renderFavoriteItem(
                  driver,
                  () => removeDriver(driver),
                  <Feather name={"users"} size={16} color={colors.textSecondary} />
                )
              )}
            </View>
          </View>

          {/* Favorite Constructors Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome name={"car"} size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Favorite Constructors</Text>
            </View>

            <View style={styles.addItemContainer}>
              <Input
                value={newConstructor}
                onChangeText={setNewConstructor}
                placeholder="Add a constructor..."
                onSubmitEditing={addConstructor}
              />
              <View style={{ paddingTop: 8 }}>
                <Button
                  title="Add"
                  onPress={addConstructor}
                  size="small"
                  disabled={!newConstructor.trim() || favoriteConstructors.includes(newConstructor.trim())}
                />
              </View>
            </View>

            {renderSuggestions(COMMON_CONSTRUCTORS, favoriteConstructors, (constructor) => {
              setFavoriteConstructors([...favoriteConstructors, constructor]);
            })}

            <View style={styles.favoritesList}>
              {favoriteConstructors.map(constructor =>
                renderFavoriteItem(
                  constructor,
                  () => removeConstructor(constructor),
                  <FontAwesome name={"car"} size={16} color={colors.textSecondary} />
                )
              )}
            </View>
          </View>
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Button
            title="Cancel"
            onPress={handleCancel}
            variant="outline"
            disabled={isSaving}
          />
          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={isSaving}
            disabled={isSaving || !hasChanges}
          />
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
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  addItemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
    minWidth: 85
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  favoritesList: {
    gap: 8,
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  favoriteItemText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
  },
  removeButton: {
    padding: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    gap: 12,
  },
});