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
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { apiService } from '@/services/apiService';
import {
  CardResponse,
  CardCollectionResponse,
  AddCardToCollectionRequest,
  UpdateCardInCollectionRequest,
  RemoveCardFromCollectionRequest,
} from '@/types/api';

interface CardModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  editingCard?: CardCollectionResponse;
}

const CONDITION_OPTIONS = [
  'Raw',
  'PSA 10',
  'PSA 9',
  'PSA 8',
  'PSA 7',
  'PSA 6',
  'PSA 5',
  'PSA 4',
  'PSA 3',
  'PSA 2',
  'PSA 1',
  'BGS 10',
  'BGS 9.5',
  'BGS 9',
  'BGS 8.5',
  'BGS 8',
  'BGS 7.5',
  'BGS 7',
  'BGS 6.5',
  'BGS 6',
  'SGC 10',
  'SGC 9.5',
  'SGC 9',
  'SGC 8.5',
  'SGC 8',
  'SGC 7.5',
  'SGC 7',
  'SGC 6.5',
  'SGC 6',
  'Other',
];

export function CardModal({ visible, onClose, onSave, editingCard }: CardModalProps) {
  const { colors } = useTheme();
  const { user } = useAuth();

  const [sets, setSets] = useState<string[]>([]);
  const [cards, setCards] = useState<CardResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [selectedSet, setSelectedSet] = useState('');
  const [selectedCard, setSelectedCard] = useState<CardResponse | null>(null);
  const [selectedParallel, setSelectedParallel] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [condition, setCondition] = useState('Raw');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');

  // UI state
  const [showSetDropdown, setShowSetDropdown] = useState(false);
  const [showCardDropdown, setShowCardDropdown] = useState(false);
  const [showParallelDropdown, setShowParallelDropdown] = useState(false);
  const [showConditionDropdown, setShowConditionDropdown] = useState(false);

  useEffect(() => {
    if (visible) {
      loadSets();
      if (editingCard) {
        populateEditingData();
      } else {
        resetForm();
      }
    }
  }, [visible, editingCard]);

  const loadSets = async () => {
    try {
      const setsData = await apiService.getCardSets();
      setSets(setsData.map(s => s.value));
    } catch (error) {
      Alert.alert('Error', 'Failed to load card sets');
    }
  };

  const loadCards = async (setName: string) => {
    setIsLoading(true);
    try {
      const cardsData = await apiService.getCardsBySet(setName);
      setCards(cardsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load cards for this set');
    } finally {
      setIsLoading(false);
    }
  };

  const populateEditingData = () => {
    if (!editingCard) return;

    setSelectedSet(editingCard.setName);
    setQuantity(editingCard.quantity.toString());
    setCondition(editingCard.condition);
    setSelectedParallel(editingCard.parallel || '');
    setPurchasePrice(editingCard.purchasePrice?.toString() || '');
    setPurchaseDate(editingCard.purchaseDate ? new Date(editingCard.purchaseDate).toISOString().split('T')[0] : '');

    // Load cards for the set and find the matching card
    loadCards(editingCard.setName).then(() => {
      // This will be handled in the useEffect for cards
    });
  };

  useEffect(() => {
    if (editingCard && cards.length > 0) {
      const matchingCard = cards.find(card => card.id === editingCard.id);
      if (matchingCard) {
        setSelectedCard(matchingCard);
      }
    }
  }, [cards, editingCard]);

  const resetForm = () => {
    setSelectedSet('');
    setSelectedCard(null);
    setSelectedParallel('');
    setQuantity('1');
    setCondition('Raw');
    setPurchasePrice('');
    setPurchaseDate('');
  };

  const handleSetSelect = (setName: string) => {
    setSelectedSet(setName);
    setSelectedCard(null);
    setSelectedParallel('');
    setShowSetDropdown(false);
    loadCards(setName);
  };

  const handleCardSelect = (card: CardResponse) => {
    setSelectedCard(card);
    setSelectedParallel('');
    setShowCardDropdown(false);
  };

  const handleSave = async () => {
    if (!user || !selectedCard) return;

    const quantityNum = parseInt(quantity);
    const priceNum = purchasePrice ? parseFloat(purchasePrice) : undefined;
    const dateObj = purchaseDate ? new Date(purchaseDate) : undefined;

    if (isNaN(quantityNum) || quantityNum < 1) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    setIsSaving(true);
    try {
      if (editingCard) {
        // Update existing card
        const updateRequest: UpdateCardInCollectionRequest = {
          userId: user.id,
          cardId: selectedCard.id,
          oldParallel: editingCard.parallel,
          quantity: quantityNum,
          parallel: selectedParallel || undefined,
          purchasePrice: priceNum,
          purchaseDate: dateObj,
          condition,
        };
        await apiService.updateCardInCollection(updateRequest);
      } else {
        // Add new card
        const addRequest: AddCardToCollectionRequest = {
          userId: user.id,
          cardId: selectedCard.id,
          quantity: quantityNum,
          parallel: selectedParallel || undefined,
          purchasePrice: priceNum,
          purchaseDate: dateObj,
          condition,
        };
        await apiService.addCardToCollection(addRequest);
      }

      Alert.alert('Success', editingCard ? 'Card updated successfully' : 'Card added to collection');
      onSave();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save card. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !editingCard) return;

    Alert.alert(
      'Delete Card',
      'Are you sure you want to remove this card from your collection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsSaving(true);
            try {
              const removeRequest: RemoveCardFromCollectionRequest = {
                userId: user.id,
                cardId: editingCard.id,
                quantityToSubtract: editingCard.quantity,
                parallel: editingCard.parallel,
                condition: editingCard.condition,
              };
              await apiService.removeCardFromCollection(removeRequest);
              Alert.alert('Success', 'Card removed from collection');
              onSave();
              onClose();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove card. Please try again later.');
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  const renderDropdown = (
    items: string[],
    selectedValue: string,
    onSelect: (value: string) => void,
    placeholder: string
  ) => (
    <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
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

  const canSelectCard = selectedSet && cards.length > 0;
  const canSelectParallel = selectedCard && selectedCard.parallels.length > 0;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            {editingCard ? 'Edit Card' : 'Add Card'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name={"x"} size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Set Selection */}
          <Text style={[styles.label, { color: colors.text }]}>Set *</Text>
          <TouchableOpacity
            style={[styles.selector, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowSetDropdown(!showSetDropdown)}
          >
            <Text style={[styles.selectorText, { color: selectedSet ? colors.text : colors.textSecondary }]}>
              {selectedSet || 'Select a set...'}
            </Text>
          </TouchableOpacity>
          {showSetDropdown && renderDropdown(sets, selectedSet, handleSetSelect, 'Select a set...')}

          {/* Card Selection */}
          <Text style={[styles.label, { color: canSelectCard ? colors.text : colors.textSecondary }]}>
            Card Number *
          </Text>
          <TouchableOpacity
            style={[
              styles.selector,
              {
                backgroundColor: canSelectCard ? colors.surface : colors.border,
                borderColor: colors.border,
                opacity: canSelectCard ? 1 : 0.5,
              }
            ]}
            onPress={() => canSelectCard && setShowCardDropdown(!showCardDropdown)}
            disabled={!canSelectCard}
          >
            <Text style={[styles.selectorText, { color: selectedCard ? colors.text : colors.textSecondary }]}>
              {selectedCard ? `#${selectedCard.cardNumber} - ${selectedCard.driverName}` : 'Select a card...'}
            </Text>
          </TouchableOpacity>
          {showCardDropdown && canSelectCard && (
            <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <LoadingSpinner size="small" />
                  </View>
                ) : (
                  cards.map((card) => (
                    <TouchableOpacity
                      key={card.id}
                      style={[
                        styles.dropdownItem,
                        { backgroundColor: selectedCard?.id === card.id ? colors.primary + '20' : 'transparent' }
                      ]}
                      onPress={() => handleCardSelect(card)}
                    >
                      <Text style={[styles.dropdownItemText, { color: colors.text }]}>
                        #{card.cardNumber} - {card.driverName}
                      </Text>
                      <Text style={[styles.dropdownSubtext, { color: colors.textSecondary }]}>
                        {card.constructorName}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          )}

          {/* Parallel Selection */}
          <Text style={[styles.label, { color: canSelectParallel ? colors.text : colors.textSecondary }]}>
            Parallel
          </Text>
          <TouchableOpacity
            style={[
              styles.selector,
              {
                backgroundColor: canSelectParallel ? colors.surface : colors.border,
                borderColor: colors.border,
                opacity: canSelectParallel ? 1 : 0.5,
              }
            ]}
            onPress={() => canSelectParallel && setShowParallelDropdown(!showParallelDropdown)}
            disabled={!canSelectParallel}
          >
            <Text style={[styles.selectorText, { color: selectedParallel ? colors.text : colors.textSecondary }]}>
              {selectedParallel || 'Base (no parallel)'}
            </Text>
          </TouchableOpacity>
          {showParallelDropdown && canSelectParallel && renderDropdown(
            ['', ...selectedCard!.parallels.map(p => p.name)],
            selectedParallel,
            (value) => {
              setSelectedParallel(value);
              setShowParallelDropdown(false);
            },
            'Select parallel...'
          )}

          {/* Quantity */}
          <Input
            label="Quantity *"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            placeholder="1"
          />

          {/* Condition */}
          <Text style={[styles.label, { color: colors.text }]}>Condition *</Text>
          <TouchableOpacity
            style={[styles.selector, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowConditionDropdown(!showConditionDropdown)}
          >
            <Text style={[styles.selectorText, { color: colors.text }]}>{condition}</Text>
          </TouchableOpacity>
          {showConditionDropdown && renderDropdown(
            CONDITION_OPTIONS,
            condition,
            (value) => {
              setCondition(value);
              setShowConditionDropdown(false);
            },
            'Select condition...'
          )}

          {/* Purchase Price */}
          <View style={styles.inputWithIcon}>
            <Feather name={"dollar-sign"} size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <Input
              label="Purchase Price"
              value={purchasePrice}
              onChangeText={setPurchasePrice}
              keyboardType="numeric"
              placeholder="0.00"
              leftPadding={24}
            />
          </View>

          {/* Purchase Date */}
          <View style={styles.inputWithIcon}>
            <Feather name={"calendar"} size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <Input
              label="Purchase Date"
              value={purchaseDate}
              onChangeText={setPurchaseDate}
              placeholder="YYYY-MM-DD"
              leftPadding={24}
            />
          </View>
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          {editingCard && (
            <Button
              title="Delete"
              onPress={handleDelete}
              variant="outline"
              loading={isSaving}
              disabled={isSaving}
            />
          )}
          <View style={styles.footerButtons}>
            <Button
              title="Cancel"
              onPress={onClose}
              variant="outline"
              disabled={isSaving}
            />
            <Button
              title={editingCard ? 'Update' : 'Add'}
              onPress={handleSave}
              loading={isSaving}
              disabled={isSaving || !selectedCard}
            />
          </View>
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  selector: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  selectorText: {
    fontSize: 16,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    maxHeight: 200,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownItemText: {
    fontSize: 16,
  },
  dropdownSubtext: {
    fontSize: 14,
    marginTop: 2,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  inputWithIcon: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 42,
    zIndex: 1,
  },
  inputArea: {
    paddingLeft: 40,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
});