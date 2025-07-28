import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { CardCollectionResponse } from '@/types/api';

interface CardItemProps {
  card: CardCollectionResponse;
  onPress?: () => void;
}

export function CardItem({ card, onPress }: CardItemProps) {
  const { colors } = useTheme();
  const [imageError, setImageError] = useState<boolean>(false)

  const formatPrice = (price?: number) => {
    if (!price) return 'N/A';
    return `$${price.toFixed(2)}`;
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: imageError ? 'https://formulacardz-images.s3.us-east-2.amazonaws.com/Default.png' : card.imageUrl }}
        style={styles.image}
        resizeMode="cover"
        onError={() => setImageError(true)}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.driverName, { color: colors.text }]} numberOfLines={1}>
            {card.driverName}
          </Text>
          <View style={styles.badgeWrapper}>
            {card.rookieCard && (
              <View style={[styles.rookieBadge, { backgroundColor: colors.accent }]}>
                <Feather name={"star"} size={12} color="#FFFFFF" />
                <Text style={styles.rookieText}>RC</Text>
              </View>
            )}
            <View style={[styles.conditionBadge, { backgroundColor: getConditionColor(card.condition, colors) }]}>
              <Text style={styles.conditionText}>{card.condition}</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.setName, { color: colors.textSecondary }]} numberOfLines={1}>
          {card.setName}
        </Text>

        <Text style={[styles.cardNumber, { color: colors.textSecondary }]}>
          #{card.cardNumber} {card.parallel && (
          <>
            -
            <Text style={[styles.parallel, { color: colors.primary }]} numberOfLines={1}>
              {' '}{card.parallel}
            </Text>
          </>
        )}
        </Text>

        <View style={styles.footer}>
          <View style={styles.quantityContainer}>
            <Feather name={"award"} size={14} color={colors.textSecondary} />
            <Text style={[styles.quantity, { color: colors.textSecondary }]}>
              Qty: {card.quantity}
            </Text>
          </View>

          <Text style={[styles.price, { color: colors.text }]}>
            {formatPrice(card.purchasePrice)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function getConditionColor(condition: string, colors: any): string {
  const grade = condition.toLowerCase().replace(/\s+/g, '');

  if ([
    'psa10', 'psa9',
    'bgs10', 'bgs9.5', 'bgs9',
    'sgc10', 'sgc9.5', 'sgc9',
    'cgc10', 'cgc9.5', 'cgc9'
  ].includes(grade)) {
    return colors.success; // Gem Mint or Mint
  }

  if ([
    'psa8', 'psa7',
    'bgs8.5', 'bgs8', 'bgs7.5', 'bgs7',
    'sgc8.5', 'sgc8', 'sgc7.5', 'sgc7',
    'cgc8.5', 'cgc8', 'cgc7.5', 'cgc7'
  ].includes(grade)) {
    return colors.accent; // Near Mint to NM-MT
  }

  if ([
    'psa6', 'psa5',
    'bgs6.5', 'bgs6', 'bgs5.5', 'bgs5',
    'sgc6.5', 'sgc6', 'sgc5.5', 'sgc5',
    'cgc6.5', 'cgc6', 'cgc5.5', 'cgc5'
  ].includes(grade)) {
    return colors.warning; // Excellent to VG-EX
  }

  return colors.textSecondary; // Poor or ungraded
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  image: {
    width: 80,
    height: 112,
  },
  content: {
    flex: 1,
    padding: 12,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  badgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  driverName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  rookieBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  rookieText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 2,
  },
  setName: {
    fontSize: 14,
    marginBottom: 2,
  },
  cardNumber: {
    fontSize: 12,
    marginBottom: 4,
  },
  parallel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 12,
    marginLeft: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
  },
  conditionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  conditionText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
});