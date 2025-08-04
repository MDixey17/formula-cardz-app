import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { CardItem } from '@/components/CardItem';
import { CardModal } from '@/components/CardModal';
import { Button } from '@/components/Button';
import { apiService } from '@/services/apiService';
import { CardCollectionResponse } from '@/types/api';

export default function CollectionScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();

  const [cards, setCards] = useState<CardCollectionResponse[]>([]);
  const [filteredCards, setFilteredCards] = useState<CardCollectionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState<CardCollectionResponse | undefined>();

  // Filter state
  const [selectedSet, setSelectedSet] = useState('');
  const [selectedConstructor, setSelectedConstructor] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [showSetDropdown, setShowSetDropdown] = useState(false);
  const [showConstructorDropdown, setShowConstructorDropdown] = useState(false);
  const [showDriverDropdown, setShowDriverDropdown] = useState(false);

  const loadCollection = async (showLoading = true) => {
    if (!user) return;

    if (showLoading) setIsLoading(true);
    else setRefreshing(true);

    try {
      const collection = await apiService.getCollection(user.id);
      setCards(collection);
      setFilteredCards(collection);
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

  useEffect(() => {
    applyFilters();
  }, [cards, searchQuery, selectedSet, selectedConstructor, selectedDriver]);

  const applyFilters = () => {
    let filtered = [...cards];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(card =>
        card.driverName.toLowerCase().includes(query) ||
        card.constructorName.toLowerCase().includes(query) ||
        card.cardNumber.toLowerCase().includes(query) ||
        card.setName.toLowerCase().includes(query)
      );
    }

    // Apply set filter
    if (selectedSet) {
      filtered = filtered.filter(card => card.setName === selectedSet);
    }

    // Apply constructor filter
    if (selectedConstructor) {
      filtered = filtered.filter(card => card.constructorName === selectedConstructor);
    }

    // Apply driver filter
    if (selectedDriver) {
      filtered = filtered.filter(card => card.driverName === selectedDriver);
    }

    setFilteredCards(filtered);
  };

  const getUniqueValues = (key: keyof CardCollectionResponse): string[] => {
    const values = cards.map(card => card[key] as string);
    return [...new Set(values)].sort();
  };

  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchQuery('');
    }
  };

  const handleFiltersToggle = () => {
    setShowFilters(!showFilters);
    if (showFilters) {
      // Clear filters when hiding
      setSelectedSet('');
      setSelectedConstructor('');
      setSelectedDriver('');
    }
  };

  const handleCardPress = (card: CardCollectionResponse) => {
    setEditingCard(card);
    setShowModal(true);
  };

  const handleAddCard = () => {
    setEditingCard(undefined);
    setShowModal(true);
  };

  const handleModalSave = () => {
    loadCollection(false);
  };

  const renderDropdown = (
    items: string[],
    selectedValue: string,
    onSelect: (value: string) => void,
    placeholder: string
  ) => (
    <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TouchableOpacity
        style={styles.dropdownItem}
        onPress={() => onSelect('')}
      >
        <Text style={[styles.dropdownItemText, { color: colors.textSecondary }]}>
          All {placeholder}
        </Text>
      </TouchableOpacity>
      <ScrollView style={{ maxHeight: 150 }}>
        {items.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.dropdownItem,
              { backgroundColor: selectedValue === item ? colors.primary + '20' : 'transparent' }
            ]}
            onPress={() => onSelect(item)}
          >
            <Text style={[styles.dropdownItemText, { color: colors.text }]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderFilters = () => (
    <View style={[styles.filtersContainer, { backgroundColor: colors.surface }]}>
      {/* Set Filter */}
      <View style={styles.filterGroup}>
        <Text style={[styles.filterLabel, { color: colors.text }]}>Set</Text>
        <TouchableOpacity
          style={[styles.filterSelector, { backgroundColor: colors.background, borderColor: colors.border }]}
          onPress={() => setShowSetDropdown(!showSetDropdown)}
        >
          <Text style={[styles.filterSelectorText, { color: selectedSet ? colors.text : colors.textSecondary }]}>
            {selectedSet || 'All Sets'}
          </Text>
          <Feather name={"chevron-down"} size={16} color={colors.textSecondary} />
        </TouchableOpacity>
        {showSetDropdown && renderDropdown(
          getUniqueValues('setName'),
          selectedSet,
          (value) => {
            setSelectedSet(value);
            setShowSetDropdown(false);
          },
          'Sets'
        )}
      </View>

      {/* Constructor Filter */}
      <View style={styles.filterGroup}>
        <Text style={[styles.filterLabel, { color: colors.text }]}>Constructor</Text>
        <TouchableOpacity
          style={[styles.filterSelector, { backgroundColor: colors.background, borderColor: colors.border }]}
          onPress={() => setShowConstructorDropdown(!showConstructorDropdown)}
        >
          <Text style={[styles.filterSelectorText, { color: selectedConstructor ? colors.text : colors.textSecondary }]}>
            {selectedConstructor || 'All Constructors'}
          </Text>
          <Feather name={"chevron-down"} size={16} color={colors.textSecondary} />
        </TouchableOpacity>
        {showConstructorDropdown && renderDropdown(
          getUniqueValues('constructorName'),
          selectedConstructor,
          (value) => {
            setSelectedConstructor(value);
            setShowConstructorDropdown(false);
          },
          'Constructors'
        )}
      </View>

      {/* Driver Filter */}
      <View style={styles.filterGroup}>
        <Text style={[styles.filterLabel, { color: colors.text }]}>Driver</Text>
        <TouchableOpacity
          style={[styles.filterSelector, { backgroundColor: colors.background, borderColor: colors.border }]}
          onPress={() => setShowDriverDropdown(!showDriverDropdown)}
        >
          <Text style={[styles.filterSelectorText, { color: selectedDriver ? colors.text : colors.textSecondary }]}>
            {selectedDriver || 'All Drivers'}
          </Text>
          <Feather name={"chevron-down"} size={16} color={colors.textSecondary} />
        </TouchableOpacity>
        {showDriverDropdown && renderDropdown(
          getUniqueValues('driverName'),
          selectedDriver,
          (value) => {
            setSelectedDriver(value);
            setShowDriverDropdown(false);
          },
          'Drivers'
        )}
      </View>
    </View>
  );

  const calculateTotalValue = () => {
    return filteredCards.reduce((total, card) => {
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
            {filteredCards.length} cards • ${calculateTotalValue().toFixed(2)} value
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: showSearch ? colors.primary : colors.surface }]}
            onPress={handleSearchToggle}
          >
            <Feather name={"search"} size={20} color={showSearch ? '#FFFFFF' : colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: showFilters ? colors.primary : colors.surface }]}
            onPress={handleFiltersToggle}
          >
            <Feather name={"filter"} size={20} color={showFilters ? '#FFFFFF' : colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, styles.addButton, { backgroundColor: colors.primary }]}
            onPress={handleAddCard}
          >
            <Feather name={"plus"} size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {showSearch && (
        <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search cards..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          <TouchableOpacity
            style={styles.searchClear}
            onPress={() => setSearchQuery('')}
          >
            <Feather name={"x"} size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {showFilters && renderFilters()}

      {cards.length === 0 ? (
        renderEmptyCollection()
      ) : (
        <FlatList
          data={filteredCards}
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Cards Found</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Try adjusting your search or filters to find cards.
              </Text>
            </View>
          }
        />
      )}

      <CardModal visible={showModal} onClose={() => setShowModal(false)} onSave={handleModalSave} editingCard={editingCard} />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  searchClear: {
    padding: 4,
  },
  filtersContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  filterSelectorText: {
    fontSize: 14,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 6,
    marginTop: 4,
    maxHeight: 150,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownItemText: {
    fontSize: 14,
  },
});