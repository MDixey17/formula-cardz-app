import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/Button';
import { apiService } from '@/services/apiService';
import { CardDropResponse } from '@/types/api';

type DropItemHeader = {
  type: string
  title: string
}

type DropItemDrop = {
  type: string
  data: CardDropResponse
}

export default function DropsScreen() {
  const { colors } = useTheme();

  const [drops, setDrops] = useState<CardDropResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [imageError, setImageError] = useState<boolean>(false)

  const loadDrops = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    else setRefreshing(true);

    try {
      const dropsData = await apiService.getUpcomingDrops();
      // Sort by release date
      const sortedDrops = dropsData.sort((a, b) =>
        new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
      );
      setDrops(sortedDrops);
    } catch (error) {
      Alert.alert('Error', 'Failed to load upcoming drops');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDrops();
  }, []);

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isUpcoming = (dateString: Date) => {
    const releaseDate = new Date(dateString);
    const now = new Date();
    return releaseDate > now;
  };

  const daysBetween = (dateString: Date) => {
    const releaseDate = new Date(dateString);
    const now = new Date();
    const diffTime = releaseDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handlePreorder = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open preorder link');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open preorder link');
    }
  };

  const renderDrop = ({ item }: { item: CardDropResponse }) => {
    const upcoming = isUpcoming(item.releaseDate);
    const daysUntil = daysBetween(item.releaseDate);

    return (
      <View style={[styles.dropCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Image
          source={{ uri: imageError ? 'https://formulacardz-images.s3.us-east-2.amazonaws.com/Default.png' : item.imageUrl }}
          style={styles.dropImage}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />

        <View style={styles.dropContent}>
          <View style={styles.dropHeader}>
            <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
              {item.productName}
            </Text>

            {upcoming && daysUntil <= 7 && (
              <View style={[styles.urgentBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.urgentText}>
                  {daysUntil === 0 ? 'Today!' : `${daysUntil}d`}
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.manufacturer, { color: colors.textSecondary }]}>
            {item.manufacturer}
          </Text>

          <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={3}>
            {item.description}
          </Text>

          <View style={styles.dropFooter}>
            <View style={styles.dateContainer}>
              <Feather name={"calendar"} size={16} color={colors.textSecondary} />
              <Text style={[styles.releaseDate, { color: colors.textSecondary }]}>
                {formatDate(item.releaseDate)}
              </Text>
            </View>

            {item.preorderUrl && (
              <TouchableOpacity
                style={[styles.preorderButton, { backgroundColor: colors.primary }]}
                onPress={() => handlePreorder(item.preorderUrl!)}
              >
                <Feather name={"external-link"} size={14} color="#FFFFFF" />
                <Text style={styles.preorderText}>Preorder</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Feather name={"calendar"} size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Upcoming Drops
      </Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Check back later for new Formula 1 card releases and drop announcements.
      </Text>
      <Button
        title="Refresh"
        onPress={() => loadDrops()}
        variant="outline"
      />
    </View>
  );

  const categorizeDrops = () => {
    const now = new Date();
    const thisWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const thisWeekDrops = drops.filter(drop => {
      const releaseDate = new Date(drop.releaseDate);
      return releaseDate >= now && releaseDate <= thisWeek;
    });

    const thisMonthDrops = drops.filter(drop => {
      const releaseDate = new Date(drop.releaseDate);
      return releaseDate > thisWeek && releaseDate <= thisMonth;
    });

    const laterDrops = drops.filter(drop => {
      const releaseDate = new Date(drop.releaseDate);
      return releaseDate > thisMonth;
    });

    return { thisWeekDrops, thisMonthDrops, laterDrops };
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading upcoming drops..." />;
  }

  const { thisWeekDrops, thisMonthDrops, laterDrops } = categorizeDrops();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Upcoming Drops</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {drops.length} releases tracked
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.surface }]}
          onPress={() => loadDrops()}
        >
          <Feather name={"refresh-cw"} size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {thisWeekDrops.length === 0 && thisMonthDrops.length === 0 && laterDrops.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={[
            ...(thisWeekDrops.length > 0 ? [{ type: 'header', title: 'This Week' }] : []),
            ...thisWeekDrops.map(drop => ({ type: 'drop', data: drop })),
            ...(thisMonthDrops.length > 0 ? [{ type: 'header', title: 'This Month' }] : []),
            ...thisMonthDrops.map(drop => ({ type: 'drop', data: drop })),
            ...(laterDrops.length > 0 ? [{ type: 'header', title: 'Later' }] : []),
            ...laterDrops.map(drop => ({ type: 'drop', data: drop })),
          ]}
          keyExtractor={(item, index) =>
            item.type === 'header' ? `header-${(item as DropItemHeader).title}` : `drop-${(item as DropItemDrop).data.productName}-${index}`
          }
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return (
                <Text style={[styles.sectionHeader, { color: colors.text }]}>
                  {(item as DropItemHeader).title}
                </Text>
              );
            }
            return renderDrop({ item: (item as DropItemDrop).data });
          }}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={() => loadDrops(false)}
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
    paddingBottom: 8,
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
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    marginTop: 8,
  },
  dropCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  dropImage: {
    width: '100%',
    height: 200,
  },
  dropContent: {
    padding: 16,
  },
  dropHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productName: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  urgentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  urgentText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  manufacturer: {
    fontSize: 14,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
  },
  dropFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  releaseDate: {
    fontSize: 14,
    marginLeft: 6,
  },
  preorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  preorderText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
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
    marginTop: 16,
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