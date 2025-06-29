import { View, Text, StyleSheet, ScrollView, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { useState, useEffect } from 'react';
import { generateRealisticBuses, findNearestBuses, getRecommendedRoutes } from '@/utils/rwandaBusData';
import { Bus } from '@/types/bus';
import { MapPin, Clock, Users, Heart, Navigation, CircleAlert as AlertCircle } from 'lucide-react-native';
import { LocationPermissionModal } from '@/components/LocationPermissionModal';

export default function Home() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { location, loading: locationLoading, requestLocation, hasPermission } = useLocation();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [interestedBuses, setInterestedBuses] = useState<Set<string>>(new Set());
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [recommendedRoutes, setRecommendedRoutes] = useState<any[]>([]);

  useEffect(() => {
    loadBusData();
  }, [location]);

  useEffect(() => {
    if (!hasPermission && !location) {
      setShowLocationModal(true);
    }
  }, [hasPermission, location]);

  const loadBusData = () => {
    const allBuses = generateRealisticBuses(location || undefined);
    
    if (location) {
      // Show nearest buses first
      const nearestBuses = findNearestBuses(location, allBuses, 10);
      setBuses(nearestBuses.slice(0, 8));
      
      // Get recommended routes based on location
      const routes = getRecommendedRoutes(location);
      setRecommendedRoutes(routes.slice(0, 3));
    } else {
      // Show all active buses
      setBuses(allBuses.filter(bus => bus.isActive).slice(0, 8));
    }
  };

  const handleShowInterest = (busId: string) => {
    setInterestedBuses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(busId)) {
        newSet.delete(busId);
      } else {
        newSet.add(busId);
      }
      return newSet;
    });
  };

  const handleLocationRequest = async () => {
    setShowLocationModal(false);
    await requestLocation();
  };

  const renderBusCard = ({ item: bus }: { item: Bus }) => (
    <View style={[styles.busCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.busHeader}>
        <View style={styles.busInfo}>
          <Text style={[styles.busRoute, { color: theme.text }]}>{bus.route}</Text>
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
            interestedBuses.has(bus.id) && { backgroundColor: theme.primary }
          ]}
          onPress={() => handleShowInterest(bus.id)}
        >
          <Heart
            size={16}
            color={interestedBuses.has(bus.id) ? theme.background : theme.primary}
            fill={interestedBuses.has(bus.id) ? theme.background : 'none'}
          />
          <Text style={[
            styles.interestText,
            { color: interestedBuses.has(bus.id) ? theme.background : theme.primary }
          ]}>
            {interestedBuses.has(bus.id) ? 'Interested' : t('showInterest')}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  const renderRecommendedRoute = (route: any, index: number) => (
    <View key={index} style={[styles.routeCard, { backgroundColor: theme.surface }]}>
      <View style={styles.routeHeader}>
        <Text style={[styles.routeNumber, { color: theme.primary }]}>
          Route {route.route}
        </Text>
        <Text style={[styles.routeFare, { color: theme.text }]}>
          {route.fare} RWF
        </Text>
      </View>
      <Text style={[styles.routeDestination, { color: theme.text }]}>
        {route.destination}
      </Text>
      <Text style={[styles.routeSchedule, { color: theme.textSecondary }]}>
        {route.schedule}
      </Text>
    </View>
  );

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
              {location ? 'Nearby Buses' : 'Active Buses'}
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
              {interestedBuses.size}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Interested
            </Text>
          </View>
        </View>

        {recommendedRoutes.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Recommended Routes
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.routesContainer}>
                {recommendedRoutes.map(renderRecommendedRoute)}
              </View>
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {location ? 'Buses Near You' : t('nearbyBuses')}
          </Text>
          {buses.length > 0 ? (
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
                No buses found
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: theme.textSecondary }]}>
                {location ? 'Try expanding your search area' : 'Enable location to find buses near you'}
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
  routesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  routeCard: {
    padding: 16,
    borderRadius: 12,
    width: 200,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeNumber: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  routeFare: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  routeDestination: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  routeSchedule: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  busCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  busHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  busInfo: {
    flex: 1,
  },
  busRoute: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
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
});