import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from '@/contexts/LocationContext';
import { useState, useEffect } from 'react';
import { generateRealisticBuses, findNearestBuses } from '@/utils/rwandaBusData';
import { Bus as BusType } from '@/types/bus';
import { Navigation, MapPin, CircleAlert as AlertCircle } from 'lucide-react-native';
import { GoogleMapView } from '@/components/GoogleMapView';
import { LocationPermissionModal } from '@/components/LocationPermissionModal';

export default function Map() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { location, loading: locationLoading, requestLocation, hasPermission, error } = useLocation();
  const [buses, setBuses] = useState<BusType[]>([]);
  const [selectedBus, setSelectedBus] = useState<BusType | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

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
      // Show buses within 15km radius
      const nearbyBuses = findNearestBuses(location, allBuses, 15);
      setBuses(nearbyBuses);
    } else {
      // Show all active buses
      setBuses(allBuses.filter(bus => bus.isActive));
    }
  };

  const handleBusPress = (bus: BusType) => {
    setSelectedBus(bus);
  };

  const handleLocationRequest = async () => {
    setShowLocationModal(false);
    await requestLocation();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>
            {t('map')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {buses.length} buses tracked
          </Text>
        </View>
        
        <View style={styles.headerActions}>
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
      </View>

      {error && (
        <View style={[styles.errorBanner, { backgroundColor: theme.error + '20' }]}>
          <AlertCircle size={16} color={theme.error} />
          <Text style={[styles.errorText, { color: theme.error }]}>
            {error}
          </Text>
        </View>
      )}

      <GoogleMapView
        buses={buses}
        userLocation={location || undefined}
        onBusPress={handleBusPress}
      />

      {selectedBus && (
        <View style={[styles.busDetails, { backgroundColor: theme.surface }]}>
          <View style={styles.busDetailsHeader}>
            <View>
              <Text style={[styles.busDetailsRoute, { color: theme.text }]}>
                {selectedBus.route}
              </Text>
              <Text style={[styles.busDetailsDestination, { color: theme.textSecondary }]}>
                {selectedBus.destination}
              </Text>
            </View>
            <Pressable
              style={styles.closeButton}
              onPress={() => setSelectedBus(null)}
            >
              <Text style={[styles.closeButtonText, { color: theme.textSecondary }]}>
                ✕
              </Text>
            </Pressable>
          </View>
          
          <View style={styles.busDetailsContent}>
            <View style={styles.busDetailItem}>
              <MapPin size={16} color={theme.primary} />
              <Text style={[styles.busDetailLabel, { color: theme.textSecondary }]}>
                Next Stop:
              </Text>
              <Text style={[styles.busDetailValue, { color: theme.text }]}>
                {selectedBus.nextStop}
              </Text>
            </View>
            
            <View style={styles.busDetailItem}>
              <Navigation size={16} color={theme.primary} />
              <Text style={[styles.busDetailLabel, { color: theme.textSecondary }]}>
                ETA:
              </Text>
              <Text style={[styles.busDetailValue, { color: theme.text }]}>
                {selectedBus.eta} minutes
              </Text>
            </View>
            
            {selectedBus.fare && (
              <View style={styles.busDetailItem}>
                <Text style={[styles.busDetailLabel, { color: theme.textSecondary }]}>
                  Fare:
                </Text>
                <Text style={[styles.busDetailValue, { color: theme.primary }]}>
                  {selectedBus.fare} RWF
                </Text>
              </View>
            )}
            
            {selectedBus.distance && (
              <View style={styles.busDetailItem}>
                <Text style={[styles.busDetailLabel, { color: theme.textSecondary }]}>
                  Distance:
                </Text>
                <Text style={[styles.busDetailValue, { color: theme.text }]}>
                  {selectedBus.distance.toFixed(1)} km
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

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
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  busDetails: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  busDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  busDetailsRoute: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  busDetailsDestination: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
  },
  busDetailsContent: {
    gap: 12,
  },
  busDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  busDetailLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  busDetailValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});