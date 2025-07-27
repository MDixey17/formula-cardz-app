import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { CardItem } from '@/components/CardItem';
import { Button } from '@/components/Button';
import { apiService } from '@/services/apiService';
import { CardCollectionResponse } from '@/types/api';

export default function CollectionScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();

  const [cards, setCards] = useState<CardCollectionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadCollection = async (showLoading = true) => {
    if (!user) return;

    if (showLoading) setIsLoading(true);
    else setRefreshing(true);

    try {
      const collection = await apiService.getCollection(user.id);
      setCards(collection);
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to load your collection. Please try again.'
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadCollection();
    }
  }, [user]);

  const handleCardPress = (card: CardCollectionResponse) => {
    Alert.alert(
      card.driverName,
      `${card.year} ${card.setName}\n#${card.cardNumber}\n${card.parallel || 'Base'}\nCondition: ${card.condition}\nQuantity: ${card.quantity}`,
      [
        { text: 'Edit', onPress: () => handleEditCard(card) },
        { text: 'Remove', style: 'destructive', onPress: () => handleRemoveCard(card) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleEditCard = (card: CardCollectionResponse) => {
    // TODO: Navigate to edit screen or show edit modal
    Alert.alert('Edit Card', 'Edit functionality coming soon!');
  };

  const handleRemoveCard = (card: CardCollectionResponse) => {
    Alert.alert(
      'Remove Card',
      `Are you sure you want to remove ${card.driverName} from your collection?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeCard(card)
        }
      ]
    );
  };

  const removeCard = async (card: CardCollectionResponse) => {
    if (!user) return;

    try {
      await apiService.removeCardFromCollection({
        userId: user.id,
        cardId: card.id,
        quantityToSubtract: card.quantity,
        parallel: card.parallel,
        condition: card.condition,
      });

      // Remove from local state
      setCards(prevCards => prevCards.filter(c =>
        !(c.id === card.id && c.parallel === card.parallel && c.condition === card.condition)
      ));

      Alert.alert('Success', 'Card removed from collection');
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to remove card from collection. Please try again.'
      );
    }
  };

  const handleAddCard = () => {
    // TODO: Navigate to add card screen
    Alert.alert('Add Card', 'Add card functionality coming soon!');
  };

  const calculateTotalValue = () => {
    return cards.reduce((total, card) => {
      return total + (card.purchasePrice || 0) * card.quantity;
    }, 0);
  };

  const renderEmptyCollection = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Cards Yet
      </Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Start building your Formula 1 card collection by adding your first card.
      </Text>
      <Button
        title="Add Your First Card"
        onPress={handleAddCard}
        size="large"
      />
    </View>
  );

  const renderLoginPrompt = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Login Required
      </Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Please log in to view and manage your card collection.
      </Text>
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {renderLoginPrompt()}
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading your collection..." />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>My Collection</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {cards.length} cards • ${calculateTotalValue().toFixed(2)} value
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.surface }]}
            onPress={() => {}}
          >
            <Feather name={"search"} size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.surface }]}
            onPress={() => {}}
          >
            <Feather name={"filter"} size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, styles.addButton, { backgroundColor: colors.primary }]}
            onPress={handleAddCard}
          >
            <Feather name={"plus"} size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {cards.length === 0 ? (
        renderEmptyCollection()
      ) : (
        <FlatList
          data={cards}
          keyExtractor={(item, index) => `${item.id}-${item.parallel || 'base'}-${item.condition}-${index}`}
          renderItem={({ item }) => (
            <CardItem
              card={item}
              onPress={() => handleCardPress(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={() => loadCollection(false)}
          contentContainerStyle={styles.listContent}
        />
      )}
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
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  listContent: {
    paddingBottom: 20,
  },
});