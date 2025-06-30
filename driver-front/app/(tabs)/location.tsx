import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocation } from '@/contexts/LocationContext';
import { useDriverData } from '@/hooks/useDriverData';
import { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, Wifi, WifiOff, RefreshCw } from 'lucide-react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

export default function Location() {
  const { theme } = useTheme();
  const { location, requestLocation, loading: locationLoading } = useLocation();
  const { bus, updateBusLocation } = useDriverData();
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (location && isTracking && bus) {
      handleLocationUpdate();
    }
  }, [location, isTracking, bus]);

  const handleLocationUpdate = async () => {
    if (!location || !bus) return;

    const success = await updateBusLocation(
      location.latitude,
      location.longitude,
      0, // speed
      0, // heading
      location.accuracy || 0
    );

    if (success) {
      setLastUpdate(new Date());
    }
  };

  const toggleTracking = async () => {
    if (!bus) {
      Alert.alert('Error', 'No bus assigned to you');
      return;
    }

    if (!location) {
      Alert.alert('Location Required', 'Please enable location first');
      await requestLocation();
      return;
    }

    setIsTracking(!isTracking);
    
    if (!isTracking) {
      // Start tracking
      await handleLocationUpdate();
      Alert.alert('Tracking Started', 'Your location is now being shared with passengers');
    } else {
      Alert.alert('Tracking Stopped', 'Location sharing has been disabled');
    }
  };

  const refreshLocation = async () => {
    await requestLocation();
    if (isTracking) {
      await handleLocationUpdate();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          Location Tracking
        </Text>
        <Pressable
          style={[styles.refreshButton, { backgroundColor: theme.primary + '20' }]}
          onPress={refreshLocation}
          disabled={locationLoading}
        >
          <RefreshCw 
            size={20} 
            color={theme.primary} 
            style={{ transform: [{ rotate: locationLoading ? '180deg' : '0deg' }] }}
          />
        </Pressable>
      </View>

      {/* Status Cards */}
      <View style={styles.statusSection}>
        <View style={[styles.statusCard, { backgroundColor: theme.surface }]}>
          <View style={[styles.statusIcon, { backgroundColor: isTracking ? theme.success + '20' : theme.error + '20' }]}>
            {isTracking ? (
              <Wifi size={24} color={theme.success} />
            ) : (
              <WifiOff size={24} color={theme.error} />
            )}
          </View>
          <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>
            Tracking Status
          </Text>
          <Text style={[styles.statusValue, { color: isTracking ? theme.success : theme.error }]}>
            {isTracking ? 'Active' : 'Inactive'}
          </Text>
        </View>

        <View style={[styles.statusCard, { backgroundColor: theme.surface }]}>
          <View style={[styles.statusIcon, { backgroundColor: theme.primary + '20' }]}>
            <MapPin size={24} color={theme.primary} />
          </View>
          <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>
            Location Status
          </Text>
          <Text style={[styles.statusValue, { color: location ? theme.success : theme.error }]}>
            {location ? 'Available' : 'Unavailable'}
          </Text>
        </View>

        <View style={[styles.statusCard, { backgroundColor: theme.surface }]}>
          <View style={[styles.statusIcon, { backgroundColor: theme.warning + '20' }]}>
            <Clock size={24} color={theme.warning} />
          </View>
          <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>
            Last Update
          </Text>
          <Text style={[styles.statusValue, { color: theme.text }]}>
            {lastUpdate ? lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
          </Text>
        </View>
      </View>

      {/* Map */}
      <View style={[styles.mapContainer, { backgroundColor: theme.surface }]}>
        <Text style={[styles.mapTitle, { color: theme.text }]}>
          Current Location
        </Text>
        {location ? (
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            region={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation={true}
            showsMyLocationButton={false}
          >
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Your Bus"
              description={bus?.plateNumber || 'Bus Location'}
            >
              <View style={[styles.busMarker, { backgroundColor: theme.primary }]}>
                <Text style={[styles.busMarkerText, { color: theme.background }]}>
                  🚌
                </Text>
              </View>
            </Marker>
          </MapView>
        ) : (
          <View style={[styles.noLocationContainer, { backgroundColor: theme.background }]}>
            <MapPin size={48} color={theme.textSecondary} />
            <Text style={[styles.noLocationText, { color: theme.textSecondary }]}>
              Location not available
            </Text>
            <Text style={[styles.noLocationSubtext, { color: theme.textSecondary }]}>
              Please enable location services
            </Text>
          </View>
        )}
      </View>

      {/* Location Details */}
      {location && (
        <View style={[styles.locationDetails, { backgroundColor: theme.surface }]}>
          <Text style={[styles.detailsTitle, { color: theme.text }]}>
            Location Details
          </Text>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
              Latitude:
            </Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              {location.latitude.toFixed(6)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
              Longitude:
            </Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              {location.longitude.toFixed(6)}
            </Text>
          </View>
          {location.accuracy && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                Accuracy:
              </Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                ±{Math.round(location.accuracy)}m
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Control Button */}
      <View style={styles.controlSection}>
        <Pressable
          style={[
            styles.trackingButton,
            { backgroundColor: isTracking ? theme.error : theme.success }
          ]}
          onPress={toggleTracking}
        >
          <Navigation size={20} color={theme.background} />
          <Text style={[styles.trackingButtonText, { color: theme.background }]}>
            {isTracking ? 'Stop Tracking' : 'Start Tracking'}
          </Text>
        </Pressable>
      </View>
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
  refreshButton: {
    padding: 8,
    borderRadius: 20,
  },
  statusSection: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  statusCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
    textAlign: 'center',
  },
  statusValue: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  mapContainer: {
    marginHorizontal: 24,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  mapTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    padding: 16,
    paddingBottom: 8,
  },
  map: {
    height: 200,
  },
  noLocationContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noLocationText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginTop: 12,
  },
  noLocationSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  busMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  busMarkerText: {
    fontSize: 16,
  },
  locationDetails: {
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  detailsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  controlSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  trackingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  trackingButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});