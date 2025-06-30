import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { useDriverData } from '@/hooks/useDriverData';
import { useState, useEffect } from 'react';
import { 
  Bus, 
  MapPin, 
  Users, 
  Clock, 
  Navigation, 
  Power, 
  PowerOff,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Route
} from 'lucide-react-native';

export default function Dashboard() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { location, requestLocation } = useLocation();
  const { bus, passengers, schedules, loading, error, updateOnlineStatus } = useDriverData();
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (bus) {
      setIsOnline(bus.isOnline);
    }
  }, [bus]);

  const handleToggleOnline = async () => {
    if (!bus) {
      Alert.alert('Error', 'No bus assigned to you');
      return;
    }

    if (!location) {
      Alert.alert('Location Required', 'Please enable location to go online');
      await requestLocation();
      return;
    }

    const newStatus = !isOnline;
    const success = await updateOnlineStatus(newStatus);
    
    if (success) {
      setIsOnline(newStatus);
      Alert.alert(
        'Status Updated',
        `You are now ${newStatus ? 'online' : 'offline'}`
      );
    } else {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const todaySchedules = schedules.filter(schedule => {
    const today = new Date();
    const scheduleDate = new Date(schedule.departureTime);
    return scheduleDate.toDateString() === today.toDateString();
  });

  const nextSchedule = todaySchedules
    .filter(schedule => new Date(schedule.departureTime) > new Date())
    .sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime())[0];

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={theme.error} />
          <Text style={[styles.errorText, { color: theme.error }]}>
            {error}
          </Text>
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
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'},
            </Text>
            <Text style={[styles.driverName, { color: theme.text }]}>
              {user?.name}
            </Text>
          </View>
          
          <Pressable
            style={[
              styles.onlineToggle,
              { backgroundColor: isOnline ? theme.success : theme.error }
            ]}
            onPress={handleToggleOnline}
          >
            {isOnline ? (
              <Power size={20} color={theme.background} />
            ) : (
              <PowerOff size={20} color={theme.background} />
            )}
            <Text style={[styles.onlineText, { color: theme.background }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </Pressable>
        </View>

        {/* Status Cards */}
        <View style={styles.statusCards}>
          <View style={[styles.statusCard, { backgroundColor: theme.surface }]}>
            <View style={[styles.statusIcon, { backgroundColor: theme.primary + '20' }]}>
              <Bus size={24} color={theme.primary} />
            </View>
            <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>
              Bus Status
            </Text>
            <Text style={[styles.statusValue, { color: theme.text }]}>
              {bus ? bus.plateNumber : 'No Bus'}
            </Text>
          </View>

          <View style={[styles.statusCard, { backgroundColor: theme.surface }]}>
            <View style={[styles.statusIcon, { backgroundColor: theme.success + '20' }]}>
              <Users size={24} color={theme.success} />
            </View>
            <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>
              Interested
            </Text>
            <Text style={[styles.statusValue, { color: theme.text }]}>
              {passengers.length}
            </Text>
          </View>

          <View style={[styles.statusCard, { backgroundColor: theme.surface }]}>
            <View style={[styles.statusIcon, { backgroundColor: theme.warning + '20' }]}>
              <Clock size={24} color={theme.warning} />
            </View>
            <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>
              Today's Trips
            </Text>
            <Text style={[styles.statusValue, { color: theme.text }]}>
              {todaySchedules.length}
            </Text>
          </View>
        </View>

        {/* Bus Information */}
        {bus && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Your Bus
            </Text>
            <View style={styles.busInfo}>
              <View style={styles.busDetail}>
                <Text style={[styles.busDetailLabel, { color: theme.textSecondary }]}>
                  Plate Number
                </Text>
                <Text style={[styles.busDetailValue, { color: theme.text }]}>
                  {bus.plateNumber}
                </Text>
              </View>
              <View style={styles.busDetail}>
                <Text style={[styles.busDetailLabel, { color: theme.textSecondary }]}>
                  Capacity
                </Text>
                <Text style={[styles.busDetailValue, { color: theme.text }]}>
                  {bus.capacity} passengers
                </Text>
              </View>
              <View style={styles.busDetail}>
                <Text style={[styles.busDetailLabel, { color: theme.textSecondary }]}>
                  Route
                </Text>
                <Text style={[styles.busDetailValue, { color: theme.text }]}>
                  {bus.route?.name || 'No Route Assigned'}
                </Text>
              </View>
              <View style={styles.busDetail}>
                <Text style={[styles.busDetailLabel, { color: theme.textSecondary }]}>
                  Fare
                </Text>
                <Text style={[styles.busDetailValue, { color: theme.primary }]}>
                  {bus.fare} RWF
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Next Schedule */}
        {nextSchedule && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Next Schedule
            </Text>
            <View style={styles.scheduleCard}>
              <View style={styles.scheduleHeader}>
                <View style={[styles.scheduleIcon, { backgroundColor: theme.primary + '20' }]}>
                  <Clock size={20} color={theme.primary} />
                </View>
                <View style={styles.scheduleInfo}>
                  <Text style={[styles.scheduleTime, { color: theme.text }]}>
                    {new Date(nextSchedule.departureTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                  <Text style={[styles.scheduleRoute, { color: theme.textSecondary }]}>
                    {bus?.route?.name}
                  </Text>
                </View>
                <View style={[styles.scheduleStatus, { backgroundColor: theme.warning + '20' }]}>
                  <Text style={[styles.scheduleStatusText, { color: theme.warning }]}>
                    {nextSchedule.status}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Quick Actions
          </Text>
          <View style={styles.quickActions}>
            <Pressable
              style={[styles.actionButton, { backgroundColor: theme.primary }]}
              onPress={() => requestLocation()}
            >
              <Navigation size={20} color={theme.background} />
              <Text style={[styles.actionButtonText, { color: theme.background }]}>
                Update Location
              </Text>
            </Pressable>

            <Pressable
              style={[styles.actionButton, { backgroundColor: theme.success }]}
              onPress={() => Alert.alert('Feature', 'Start trip functionality coming soon!')}
            >
              <CheckCircle size={20} color={theme.background} />
              <Text style={[styles.actionButtonText, { color: theme.background }]}>
                Start Trip
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Today's Summary */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Today's Summary
          </Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Route size={20} color={theme.primary} />
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                Trips Completed
              </Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>
                {todaySchedules.filter(s => s.status === 'completed').length}
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Users size={20} color={theme.success} />
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                Total Passengers
              </Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>
                {passengers.length}
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <DollarSign size={20} color={theme.warning} />
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                Estimated Earnings
              </Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>
                {(passengers.length * (bus?.fare || 400)).toLocaleString()} RWF
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 16,
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
  driverName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  onlineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  onlineText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  statusCards: {
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
  },
  statusValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  section: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  busInfo: {
    gap: 12,
  },
  busDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  busDetailLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  busDetailValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  scheduleCard: {
    borderRadius: 8,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleTime: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  scheduleRoute: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  scheduleStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scheduleStatusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'capitalize',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
});