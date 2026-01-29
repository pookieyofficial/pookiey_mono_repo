import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import PagerView from 'react-native-pager-view';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import CustomLoader from '@/components/CustomLoader';
import { useAuth } from '@/hooks/useAuth';
import { getUsersWhoLikedMeAPI, getUserMatchesAPI } from '@/APIs/userAPIs';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;
const ITEMS_PER_PAGE = 20;

type TabType = 'likes' | 'matches';

interface User {
  user_id: string;
  displayName: string;
  photoURL?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string | Date;
    photos?: Array<{ url: string }>;
  };
  interactionType?: 'like' | 'superlike';
  likedAt?: Date | string;
  matchedAt?: Date | string;
  matchId?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasMore: boolean;
}

export default function LikesScreen() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const router = useRouter();
  const pagerRef = useRef<PagerView>(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [likes, setLikes] = useState<User[]>([]);
  const [matches, setMatches] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [likesPagination, setLikesPagination] = useState<PaginationInfo>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    pages: 0,
    hasMore: false,
  });
  const [matchesPagination, setMatchesPagination] = useState<PaginationInfo>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    pages: 0,
    hasMore: false,
  });

  // Animated value for tab indicator
  const indicatorPosition = useRef(new Animated.Value(0)).current;

  const loadLikes = useCallback(async (page: number = 1, append: boolean = false) => {
    if (!token) return;
    try {
      const response = await getUsersWhoLikedMeAPI(token, page, ITEMS_PER_PAGE);
      if (response?.success) {
        if (append) {
          setLikes(prev => [...prev, ...(response.data || [])]);
        } else {
          setLikes(response.data || []);
        }
        if (response.pagination) {
          setLikesPagination(response.pagination);
        }
      }
    } catch (error) {
      console.error('Error loading likes:', error);
    }
  }, [token]);

  const loadMatches = useCallback(async (page: number = 1, append: boolean = false) => {
    if (!token) return;
    try {
      const response = await getUserMatchesAPI(token, page, ITEMS_PER_PAGE);
      if (response?.success) {
        if (append) {
          setMatches(prev => [...prev, ...(response.data || [])]);
        } else {
          setMatches(response.data || []);
        }
        if (response.pagination) {
          setMatchesPagination(response.pagination);
        }
      }
    } catch (error) {
      console.error('Error loading matches:', error);
    }
  }, [token]);

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      await Promise.all([loadLikes(1, false), loadMatches(1, false)]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [token, loadLikes, loadMatches]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load data when tab changes if needed
  useEffect(() => {
    if (activeTabIndex === 0 && likes.length === 0 && !loading) {
      loadLikes(1, false);
    } else if (activeTabIndex === 1 && matches.length === 0 && !loading) {
      loadMatches(1, false);
    }
  }, [activeTabIndex]);

  // Animate indicator when tab changes
  useEffect(() => {
    Animated.spring(indicatorPosition, {
      toValue: activeTabIndex,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  }, [activeTabIndex]);

  const handleTabPress = (index: number) => {
    setActiveTabIndex(index);
    pagerRef.current?.setPage(index);
  };

  const handlePageChange = (e: any) => {
    const newIndex = e.nativeEvent.position;
    setActiveTabIndex(newIndex);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (activeTabIndex === 0) {
      await loadLikes(1, false);
    } else {
      await loadMatches(1, false);
    }
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    const currentPagination = activeTabIndex === 0 ? likesPagination : matchesPagination;

    if (loadingMore || !currentPagination.hasMore) return;

    setLoadingMore(true);
    const nextPage = currentPagination.page + 1;

    try {
      if (activeTabIndex === 0) {
        await loadLikes(nextPage, true);
      } else {
        await loadMatches(nextPage, true);
      }
    } catch (error) {
      console.error('Error loading more:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const calculateAge = (dateOfBirth: Date | string | undefined): number | null => {
    if (!dateOfBirth) return null;
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const getUserPhoto = (user: User): string => {
    return user.profile?.photos?.[0]?.url || user.photoURL || '';
  };

  const getUserName = (user: User): string => {
    if (user.profile?.firstName) {
      return `${user.profile.firstName}${user.profile.lastName ? ` ${user.profile.lastName}` : ''}`;
    }
    return user.displayName || 'User';
  };

  const handleUserPress = (user: User) => {
    router.push({
      pathname: '/userProfile',
      params: {
        userId: user.user_id,
      },
    });
  };

  const renderUserCard = ({ item }: { item: User }) => {
    const photo = getUserPhoto(item);
    const name = getUserName(item);
    const age = calculateAge(item.profile?.dateOfBirth);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleUserPress(item)}
        activeOpacity={0.8}
      >
        <Image
          source={
            photo
              ? { uri: photo }
              : require('@/assets/images/loginPageImage.png')
          }
          style={styles.cardImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
          locations={[0, 0.3, 0.7, 1]}
          style={styles.cardOverlay}
        />
        <View style={styles.cardContent}>
          <ThemedText style={styles.cardName} numberOfLines={1}>
            {name}
            {age !== null && `, ${age}`}
          </ThemedText>
          {activeTabIndex === 0 && item.interactionType === 'superlike' && (
            <View style={styles.superlikeBadge}>
              <ThemedText style={styles.superlikeText}>⭐ Super Like</ThemedText>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.primaryBackgroundColor} />
      </View>
    );
  };

  const renderEmpty = (isLikes: boolean) => (
    <View style={styles.emptyContainer}>
      <ThemedText type="title" style={styles.emptyTitle}>
        {isLikes
          ? t('likes.noLikesYet')
          : t('likes.noMatchesYet')}
      </ThemedText>
      <ThemedText style={styles.emptyText}>
        {isLikes
          ? t('likes.startSwiping')
          : t('likes.keepSwiping')}
      </ThemedText>
    </View>
  );

  const renderLikesTab = () => {
    return (
      <View style={styles.tabContent}>
        <FlatList
          data={likes}
          renderItem={renderUserCard}
          keyExtractor={(item) => item.user_id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.listContainer,
            likes.length === 0 && styles.emptyListContainer,
          ]}
          ListEmptyComponent={() => renderEmpty(true)}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primaryBackgroundColor}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  const renderMatchesTab = () => {
    return (
      <View style={styles.tabContent}>
        <FlatList
          data={matches}
          renderItem={renderUserCard}
          keyExtractor={(item) => item.user_id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.listContainer,
            matches.length === 0 && styles.emptyListContainer,
          ]}
          ListEmptyComponent={() => renderEmpty(false)}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primaryBackgroundColor}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  const tabWidth = (width - 40) / 2;
  const indicatorWidth = 100;
  const indicatorTranslateX = indicatorPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [
      tabWidth / 2 - indicatorWidth / 2,
      tabWidth + tabWidth / 2 - indicatorWidth / 2,
    ],
  });

  if (loading && likes.length === 0 && matches.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryBackgroundColor} />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.headerSection}>
        <ThemedText type="title" style={styles.headerTitle}>
          {t('likes.engagements')}
        </ThemedText>
      </View>

      {/* Swipeable Tab Bar */}
      <View style={styles.tabContainer}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabPress(0)}
            activeOpacity={0.7}
          >
            <View style={styles.tabContent}>
              <ThemedText
                style={[
                  styles.tabText,
                  activeTabIndex === 0 && styles.tabTextActive,
                ]}
              >
                {t('likes.whoLikedYou')}
              </ThemedText>
              {likes.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {likes.length}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabPress(1)}
            activeOpacity={0.7}
          >
            <View style={styles.tabContent}>
              <ThemedText
                style={[
                  styles.tabText,
                  activeTabIndex === 1 && styles.tabTextActive,
                ]}
              >
                {t('likes.youMatched')}
              </ThemedText>
              {matches.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {matches.length}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Animated Underline Indicator */}
          <Animated.View
            style={[
              styles.indicator,
              {
                width: 100, // Fixed width for underline
                transform: [{ translateX: indicatorTranslateX }],
              },
            ]}
          />
        </View>
      </View>

      {/* Swipeable Pager View */}
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={handlePageChange}
      >
        {renderLikesTab()}
        {renderMatchesTab()}
      </PagerView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.parentBackgroundColor,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  headerTitle: {
    color: Colors.primaryBackgroundColor,
  },
  tabContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.parentBackgroundColor,
    marginBottom: 8,
  },
  tabBar: {
    flexDirection: 'row',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  tabTextActive: {
    color: Colors.primaryBackgroundColor,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: Colors.text.light,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text.secondary,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    backgroundColor: Colors.primaryBackgroundColor,
    borderRadius: 2,
    alignSelf: 'center',
  },
  pagerView: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  emptyListContainer: {
    flex: 1,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.4,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
  },
  cardName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  superlikeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  superlikeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryBackgroundColor,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    color: Colors.titleColor,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
});
