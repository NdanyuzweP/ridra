import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from '@/contexts/LocationContext';
import { useState, useEffect } from 'react';
import { generateRealisticBuses, findNearestBuses, RWANDA_BUS_ROUTES } from '@/utils/rwandaBusData';
import { Bus as BusType } from '@/types/bus';
import { Bus, MapPin, Clock, Users, Heart, Filter, Navigation, CircleAlert as AlertCircle } from 'lucide-react-native';
import { LocationPermissionModal } from '@/components/LocationPermissionModal';

export default function Buses() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { location, loading: locationLoading, requestLocation, hasPermission } = useLocation();
  const [buses, setBuses] = useState<BusType[]>([]);
  const [filteredBuses, setFilteredBuses] = useState<BusType[]>([]);
  const [interestedBuses, setInterestedBuses] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'active' | 'nearby' | 'affordable'>('all');
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    loadBusData();
  }, [location]);

  useEffect(() => {
    applyFilter();
  }, [buses, filter, location]);

  useEffect(() => {
    if (!hasPermission && !location && filter === 'nearby') {
      setShowLocationModal(true);
    }
  }, [hasPermission, location, filter]);

  const loadBusData = () => {
    const allBuses = generateRealisticBuses(location || undefined);
    setBuses(allBuses);
  };

  const applyFilter = () => {
    let filtered = buses;
    
    switch (filter) {
      case 'active':
        filtered = buses.filter(bus => bus.isActive);
        break;
      case 'nearby':
        if (location) {
          const nearbyBuses = findNearestBuses(location, buses, 10);
          filtered = nearbyBuses;
        } else {
          filtered = buses.filter(bus => bus.eta <= 15);
        }
        break;
      case 'affordable':
        filtered = buses.filter(bus => bus.fare && bus.fare <= 400);
        break;
      default:
        filtered = buses;
    }
    
    setFilteredBuses(filtered);
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

  const getStatusColor = (bus: BusType) => {
    if (!bus.isActive) return theme.textSecondary;
    if (bus.eta <= 5) return theme.success;
    if (bus.eta <= 10) return theme.warning;
    return theme.primary;
  };

  const getStatusText = (bus: BusType) => {
    if (!bus.isActive) return 'Inactive';
    if (bus.eta <= 5) return 'Arriving Soon';
    if (bus.eta <= 10) return 'Nearby';
    return 'En Route';
  };

  const renderFilterButton = (filterType: 'all' | 'active' | 'nearby' | 'affordable', label: string) => (
    <Pressable
      key={filterType}
      style={[
        styles.filterButton,
        { 
          backgroundColor: filter === filterType ? theme.primary : theme.surface,
          borderColor: theme.border 
        }
      ]}
      onPress={() => setFilter(filterType)}
    >
      <Text style={[
        styles.filterButtonText,
        { color: filter === filterType ? theme.background : theme.text }
      ]}>
        {label}
      </Text>
    </Pressable>
  );

  const renderBusCard = ({ item: bus }: { item: BusType }) => (
    <View style={[styles.busCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.busHeader}>
        <View style={styles.busIconContainer}>
          <Bus size={24} color={theme.primary} />
        </View>
        <View style={styles.busMainInfo}>
          <Text style={[styles.busRoute, { color: theme.text }]}>{bus.route}</Text>
          <View style={styles.busDestination}>
            <MapPin size={14} color={theme.textSecondary} />
            <Text style={[styles.destinationText, { color: theme.textSecondary }]}>
              {bus.destination}
            </Text>
          </View>
          {bus.distance && (
            <Text style={[styles.distanceText, { color: theme.primary }]}>
              {bus.distance.toFixed(1)} km away
            </Text>
          )}
        </View>
        <View style={styles.busStatus}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(bus) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(bus) }]}>
            {getStatusText(bus)}
          </Text>
        </View>
      </View>

      <View style={styles.busDetails}>
        <View style={styles.detailItem}>
          <Clock size={16} color={theme.primary} />
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
            {t('eta')}:
          </Text>
          <Text style={[styles.detailValue, { color: theme.text }]}>
            {bus.eta} min
          </Text>
        </View>
        
        <View style={styles.detailItem}>
          <Users size={16} color={theme.textSecondary} />
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
            Capacity:
          </Text>
          <Text style={[styles.detailValue, { color: theme.text }]}>
            {bus.currentPassengers}/{bus.capacity}
          </Text>
        </View>

        {bus.fare && (
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
              Fare:
            </Text>
            <Text style={[styles.detailValue, { color: theme.primary }]}>
              {bus.fare} RWF
            </Text>
          </View>
        )}
      </View>

      <View style={styles.busFooter}>
        <View style={styles.nextStopInfo}>
          <Text style={[styles.nextStopLabel, { color: theme.textSecondary }]}>
            Next stop:
          </Text>
          <Text style={[styles.nextStopText, { color: theme.text }]}>
            {bus.nextStop}
          </Text>
          {bus.schedule && (
            <Text style={[styles.scheduleText, { color: theme.textSecondary }]}>
              {bus.schedule}
            </Text>
          )}
        </View>
        
        <Pressable
          style={[
            styles.interestButton,
            { 
              backgroundColor: interestedBuses.has(bus.id) ? theme.primary : 'transparent',
              borderColor: theme.primary 
            }
          ]}
          onPress={() => handleShowInterest(bus.id)}
        >
          <Heart
            size={16}
            color={interestedBuses.has(bus.id) ? theme.background : theme.primary}
            fill={interestedBuses.has(bus.id) ? theme.background : 'none'}
          />
          <Text style={[
            styles.interestButtonText,
            { color: interestedBuses.has(bus.id) ? theme.background : theme.primary }
          ]}>
            {bus.interested + (interestedBuses.has(bus.id) ? 1 : 0)}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>
            {t('buses')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {filteredBuses.length} buses found
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
                Enable
              </Text>
            </>
          )}
        </Pressable>
      </View>

      <View style={styles.filters}>
        {renderFilterButton('all', 'All Buses')}
        {renderFilterButton('active', 'Active')}
        {renderFilterButton('nearby', location ? 'Nearby' : 'Soon')}
        {renderFilterButton('affordable', 'Affordable')}
      </View>

      <FlatList
        data={filteredBuses}
        renderItem={renderBusCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={[styles.emptyState, { backgroundColor: theme.surface }]}>
            <Bus size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyStateText, { color: theme.text }]}>
              No buses found
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.textSecondary }]}>
              {filter === 'nearby' && !location 
                ? 'Enable location to find nearby buses'
                : 'Try adjusting your filters or check back later'
              }
            </Text>
          </View>
        )}
      />

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
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
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  busCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  busHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  busIconContainer: {
    marginRight: 12,
  },
  busMainInfo: {
    flex: 1,
  },
  busRoute: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  busDestination: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  destinationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginLeft: 4,
  },
  distanceText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  busStatus: {
    alignItems: 'flex-end',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  busDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  detailValue: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  busFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextStopInfo: {
    flex: 1,
  },
  nextStopLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  nextStopText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  scheduleText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  interestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  interestButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 40,
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