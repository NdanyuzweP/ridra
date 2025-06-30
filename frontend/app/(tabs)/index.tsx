import { View, Text, StyleSheet, ScrollView, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { useBuses } from '@/hooks/useBuses';
import { useUserInterests } from '@/hooks/useUserInterests';
import { useState, useEffect } from 'react';
import { Bus } from '@/types/bus';
import { MapPin, Clock, Users, Heart, Navigation, CircleAlert as AlertCircle, Bus as BusIcon } from 'lucide-react-native';
import { LocationPermissionModal } from '@/components/LocationPermissionModal';

export default function Home() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { location, loading: locationLoading, requestLocation, hasPermission } = useLocation();
  const { buses, loading: busesLoading, error: busesError, refetch } = useBuses(location || undefined, true); // true = nearby only
  const { interests, showInterest, removeInterest } = useUserInterests();
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    if (!hasPermission && !location) {
      setShowLocationModal(true);
    }
  }, [hasPermission, location]);

  const handleShowInterest = async (busId: string) => {
    // For now, we'll use mock data since we need bus schedule and pickup point IDs
    // In a real implementation, you'd get these from the bus data
    const mockScheduleId = `schedule_${busId}`;
    const mockPickupPointId = `pickup_${busId}`;
    
    const existingInterest = interests.find(interest => 
      interest.busScheduleId === mockScheduleId
    );
    
    if (existingInterest) {
      await removeInterest(existingInterest.id);
    } else {
      await showInterest(mockScheduleId, mockPickupPointId);
    }
  };

  const handleLocationRequest = async () => {
    setShowLocationModal(false);
    await requestLocation();
  };

  const isInterestedInBus = (busId: string) => {
    const mockScheduleId = `schedule_${busId}`;
    return interests.some(interest => interest.busScheduleId === mockScheduleId);
  };

  const renderBusCard = ({ item: bus }: { item: Bus }) => (
    <View style={[styles.busCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.busHeader}>
        <View style={styles.busIconContainer}>
          <BusIcon size={20} color={theme.primary} />
        </View>
        <View style={styles.busInfo}>
          <Text style={[styles.busRoute, { color: theme.text }]}>{bus.route}</Text>
          <Text style={[styles.plateNumber, { color: theme.primary }]}>{bus.plateNumber}</Text>
          <View style={styles.busDetails}>
            <MapPin size={14} color={theme.textSecondary} />
            <Text style={[styles.busDestination, { color: theme.textSecondary }]}>
              {bus.destination}
            </Text>
          </View>
          {bus.distance && (
            <Text style={[styles.distanceText, { color: theme.primary }]}>
              {bus.distance.toFixed(1)} km away
            </Text>
          )}
        </View>
        <View style={styles.busStats}>
          <View style={styles.statItem}>
            <Clock size={16} color={theme.primary} />
            <Text style={[styles.etaText, { color: theme.primary }]}>
              {bus.eta}m
            </Text>
          </View>
          <View style={styles.statItem}>
            <Users size={16} color={theme.textSecondary} />
            <Text style={[styles.passengersText, { color: theme.textSecondary }]}>
              {bus.currentPassengers}/{bus.capacity}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.busActions}>
        <View style={styles.busMetadata}>
          <Text style={[styles.nextStop, { color: theme.textSecondary }]}>
            Next: {bus.nextStop}
          </Text>
          {bus.fare && (
            <Text style={[styles.fareText, { color: theme.primary }]}>
              {bus.fare} RWF
            </Text>
          )}
        </View>
        <Pressable
          style={[
            styles.interestButton,
            isInterestedInBus(bus.id) && { backgroundColor: theme.primary }
          ]}
          onPress={() => handleShowInterest(bus.id)}
        >
          <Heart
            size={16}
            color={isInterestedInBus(bus.id) ? theme.background : theme.primary}
            fill={isInterestedInBus(bus.id) ? theme.background : 'none'}
          />
          <Text style={[
            styles.interestText,
            { color: isInterestedInBus(bus.id) ? theme.background : theme.primary }
          ]}>
            {isInterestedInBus(bus.id) ? 'Interested' : t('showInterest')}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  if (busesError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={theme.error} />
          <Text style={[styles.errorText, { color: theme.error }]}>
            {busesError}
          </Text>
          <Pressable
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
            onPress={refetch}
          >
            <Text style={[styles.retryButtonText, { color: theme.background }]}>
              Retry
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>
              Welcome back,
            </Text>
            <Text style={[styles.userName, { color: theme.text }]}>
              {user?.name}
            </Text>
          </View>
          <Pressable
            style={[styles.locationButton, { backgroundColor: location ? theme.primary + '20' : theme.error + '20' }]}
            onPress={requestLocation}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <Text style={[styles.locationButtonText, { color: theme.textSecondary }]}>
                Loading...
              </Text>
            ) : location ? (
              <>
                <Navigation size={16} color={theme.primary} />
                <Text style={[styles.locationButtonText, { color: theme.primary }]}>
                  Located
                </Text>
              </>
            ) : (
              <>
                <AlertCircle size={16} color={theme.error} />
                <Text style={[styles.locationButtonText, { color: theme.error }]}>
                  Enable Location
                </Text>
              </>
            )}
          </Pressable>
        </View>

        <View style={styles.quickStats}>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>
              {buses.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Nearby Buses
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>
              {buses.length > 0 ? Math.min(...buses.map(b => b.eta)) : 0}m
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Nearest Bus
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>
              {interests.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Interested
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Buses Near You
          </Text>
          {busesLoading ? (
            <View style={[styles.loadingState, { backgroundColor: theme.surface }]}>
              <Text style={[styles.loadingText, { color: theme.text }]}>
                Loading nearby buses...
              </Text>
            </View>
          ) : buses.length > 0 ? (
            <FlatList
              data={buses}
              renderItem={renderBusCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={[styles.emptyState, { backgroundColor: theme.surface }]}>
              <MapPin size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyStateText, { color: theme.text }]}>
                No nearby buses found
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: theme.textSecondary }]}>
                {location ? 'Try expanding your search area or check the Buses tab for all available buses' : 'Enable location to find buses near you'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <LocationPermissionModal
        visible={showLocationModal}
        onRequestPermission={handleLocationRequest}
        onClose={() => setShowLocationModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  locationButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  busCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  busHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  busIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  busInfo: {
    flex: 1,
  },
  busRoute: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  plateNumber: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  busDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  busDestination: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginLeft: 4,
  },
  distanceText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  busStats: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  etaText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  passengersText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  busActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  busMetadata: {
    flex: 1,
  },
  nextStop: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  fareText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  interestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#16697a',
    gap: 4,
  },
  interestText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  loadingState: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});