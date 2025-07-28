import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Input } from '@/components/Input';
import { apiService } from '@/services/apiService';
import { OneOfOneCardResponse, EnabledParallel, Dropdown } from '@/types/api';

interface FilterState {
  showFound: boolean;
  showMissing: boolean;
  searchDriver: string;
  searchConstructor: string;
  includePrintingPlates: boolean;
}

export default function TrackerScreen() {
  const { colors } = useTheme();

  const [cards, setCards] = useState<OneOfOneCardResponse[]>([]);
  const [filteredCards, setFilteredCards] = useState<OneOfOneCardResponse[]>([]);
  const [sets, setSets] = useState<Dropdown[]>([]);
  const [selectedSet, setSelectedSet] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSetPicker, setShowSetPicker] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    showFound: true,
    showMissing: true,
    searchDriver: '',
    searchConstructor: '',
    includePrintingPlates: false,
  });

  const loadSets = async () => {
    try {
      const setsData = await apiService.getCardSets();
      setSets(setsData.filter((s) => !s.label.toLowerCase().includes('Dynasty')));
      if (setsData.length > 0 && !selectedSet) {
        setSelectedSet(setsData[0].value);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load card sets');
    }
  };

  const loadCards = async () => {
    if (!selectedSet) return;

    setIsLoading(true);
    try {
      const cardsData = await apiService.getOneOfOneCards(selectedSet);
      setCards(cardsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load 1/1 cards');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSets();
  }, []);

  useEffect(() => {
    if (selectedSet) {
      loadCards();
    }
  }, [selectedSet]);

  useEffect(() => {
    applyFilters();
  }, [cards, filters]);

  const applyFilters = () => {
    let filtered = [...cards];

    // Filter by found/missing status
    filtered = filtered.filter(card => {
      const hasFoundParallels = card.parallels.some(p => p.isOneOfOne && p.isOneOfOneFound);
      const hasMissingParallels = card.parallels.some(p => p.isOneOfOne && !p.isOneOfOneFound);

      if (filters.showFound && filters.showMissing) return true;
      if (filters.showFound && !filters.showMissing) return hasFoundParallels;
      if (!filters.showFound && filters.showMissing) return hasMissingParallels;
      return false;
    });

    // Filter by driver name
    if (filters.searchDriver.trim()) {
      const searchTerm = filters.searchDriver.toLowerCase();
      filtered = filtered.filter(card =>
        card.driverName.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by constructor
    if (filters.searchConstructor.trim()) {
      const searchTerm = filters.searchConstructor.toLowerCase();
      filtered = filtered.filter(card =>
        card.constructorName.toLowerCase().includes(searchTerm)
      );
    }

    // Filter printing plates
    if (!filters.includePrintingPlates) {
      filtered = filtered.map(card => ({
        ...card,
        parallels: card.parallels.filter(p =>
          !p.name.toLowerCase().includes('printing plate')
        )
      })).filter(card => card.parallels.length > 0);
    }

    setFilteredCards(filtered);
  };

  const renderParallel = (parallel: EnabledParallel, cardId: string) => {
    if (!parallel.isOneOfOne) return null;

    const isFound = parallel.isOneOfOneFound;

    return (
      <View
        key={`${cardId}-${parallel.name}`}
        style={[
          styles.parallelItem,
          {
            backgroundColor: isFound ? colors.success + '20' : colors.error + '20',
            borderColor: isFound ? colors.success : colors.error,
          }
        ]}
      >
        <View style={styles.parallelInfo}>
          <Text style={[styles.parallelName, { color: colors.text }]}>
            {parallel.name}
          </Text>
          <View style={styles.statusContainer}>
            {isFound ? (
              <Feather name={"eye"} size={14} color={colors.success} />
            ) : (
              <Feather name={"eye-off"} size={14} color={colors.error} />
            )}
            <Text style={[
              styles.statusText,
              { color: isFound ? colors.success : colors.error }
            ]}>
              {isFound ? 'Found' : 'Missing'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderCard = ({ item }: { item: OneOfOneCardResponse }) => {
    const oneOfOneParallels = item.parallels.filter(p => p.isOneOfOne);

    if (oneOfOneParallels.length === 0) return null;

    return (
      <View style={[styles.cardContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.driverName, { color: colors.text }]}>
              {item.driverName}
            </Text>
            <Text style={[styles.constructorName, { color: colors.textSecondary }]}>
              {item.constructorName}
            </Text>
            <Text style={[styles.cardDetails, { color: colors.textSecondary }]}>
              #{item.cardNumber}
            </Text>
          </View>
          {item.rookieCard && (
            <View style={[styles.rookieBadge, { backgroundColor: colors.accent }]}>
              <Text style={styles.rookieText}>RC</Text>
            </View>
          )}
        </View>

        <View style={styles.parallelsContainer}>
          {oneOfOneParallels.map(parallel => renderParallel(parallel, item.id))}
        </View>
      </View>
    );
  };

  const renderFilters = () => (
    <View style={[styles.filtersContainer, { backgroundColor: colors.surface }]}>
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: filters.showFound ? colors.primary : colors.background }
          ]}
          onPress={() => setFilters(prev => ({ ...prev, showFound: !prev.showFound }))}
        >
          <Text style={[
            styles.filterButtonText,
            { color: filters.showFound ? '#FFFFFF' : colors.text }
          ]}>
            Show Found
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: filters.showMissing ? colors.primary : colors.background }
          ]}
          onPress={() => setFilters(prev => ({ ...prev, showMissing: !prev.showMissing }))}
        >
          <Text style={[
            styles.filterButtonText,
            { color: filters.showMissing ? '#FFFFFF' : colors.text }
          ]}>
            Show Missing
          </Text>
        </TouchableOpacity>
      </View>

      <Input
        placeholder="Search by driver..."
        value={filters.searchDriver}
        onChangeText={(text) => setFilters(prev => ({ ...prev, searchDriver: text }))}
      />

      <Input
        placeholder="Search by constructor..."
        value={filters.searchConstructor}
        onChangeText={(text) => setFilters(prev => ({ ...prev, searchConstructor: text }))}
      />

      <TouchableOpacity
        style={[
          styles.filterButton,
          { backgroundColor: filters.includePrintingPlates ? colors.primary : colors.background }
        ]}
        onPress={() => setFilters(prev => ({ ...prev, includePrintingPlates: !prev.includePrintingPlates }))}
      >
        <Text style={[
          styles.filterButtonText,
          { color: filters.includePrintingPlates ? '#FFFFFF' : colors.text }
        ]}>
          Include Printing Plates
        </Text>
      </TouchableOpacity>
    </View>
  );

  const getStatusCounts = () => {
    const found = filteredCards.reduce((count, card) =>
      count + card.parallels.filter(p => p.isOneOfOne && p.isOneOfOneFound).length, 0
    );
    const total = filteredCards.reduce((count, card) =>
      count + card.parallels.filter(p => p.isOneOfOne).length, 0
    );
    return { found, total };
  };

  const statusCounts = getStatusCounts();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>1/1 Tracker</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {statusCounts.found}/{statusCounts.total} found
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.surface }]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Feather name={"filter"} size={20} color={showFilters ? colors.primary : colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View>
        <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
          Just because a 1/1 card is listed as "missing" does not guarantee it is truly undiscovered. It's possible the card has been found but has not been publicly claimed. This tracker is frequently updated based on community input, social media sightings, and population reports from PSA, BGS, and SGC.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.setPicker, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => setShowSetPicker(!showSetPicker)}
      >
        <Text style={[styles.setPickerText, { color: colors.text }]}>
          {selectedSet || 'Select a set...'}
        </Text>
        <Feather name={"chevron-down"} size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      {showSetPicker && (
        <View style={[styles.setList, { backgroundColor: colors.surface }]}>
          {sets.map((set) => (
            <TouchableOpacity
              key={set.value}
              style={[
                styles.setItem,
                { backgroundColor: selectedSet === set.value ? colors.primary + '20' : 'transparent' }
              ]}
              onPress={() => {
                setSelectedSet(set.value);
                setShowSetPicker(false);
              }}
            >
              <Text style={[styles.setItemText, { color: colors.text }]}>{set.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {showFilters && renderFilters()}

      {isLoading ? (
        <LoadingSpinner message="Loading 1/1 cards..." />
      ) : (
        <FlatList
          data={filteredCards}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {selectedSet ? 'No cards match your filters' : 'Select a set to view 1/1 cards'}
              </Text>
            </View>
          }
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
    marginBottom: 20,
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
  setPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  setPickerText: {
    fontSize: 16,
  },
  setList: {
    borderRadius: 8,
    marginBottom: 16,
    maxHeight: 200,
  },
  setItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  setItemText: {
    fontSize: 16,
  },
  filtersContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  driverName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  constructorName: {
    fontSize: 14,
    marginBottom: 2,
  },
  cardDetails: {
    fontSize: 12,
  },
  rookieBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  rookieText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  parallelsContainer: {
    gap: 8,
  },
  parallelItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  parallelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  parallelName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 16,
    paddingBottom: 16
  },
});