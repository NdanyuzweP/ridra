import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useDriverData } from '@/hooks/useDriverData';
import { 
  Bus, 
  Users, 
  MapPin, 
  Clock, 
  DollarSign, 
  Route,
  Settings,
  AlertCircle,
  CheckCircle,
  Calendar,
  Navigation
} from 'lucide-react-native';

export default function MyBus() {
  const { theme } = useTheme();
  const { bus, schedules, passengers, loading, error } = useDriverData();

  const todaySchedules = schedules.filter(schedule => {
    const today = new Date();
    const scheduleDate = new Date(schedule.departureTime);
    return scheduleDate.toDateString() === today.toDateString();
  });

  const upcomingSchedules = schedules.filter(schedule => {
    const now = new Date();
    const scheduleDate = new Date(schedule.departureTime);
    return scheduleDate > now;
  }).slice(0, 3);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading bus information...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !bus) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={theme.error} />
          <Text style={[styles.errorText, { color: theme.error }]}>
            {error || 'No bus assigned to you'}
          </Text>
          <Text style={[styles.errorSubtext, { color: theme.textSecondary }]}>
            Please contact your administrator
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            My Bus
          </Text>
          <Pressable
            style={[styles.settingsButton, { backgroundColor: theme.surface }]}
            onPress={() => Alert.alert('Settings', 'Bus settings coming soon!')}
          >
            <Settings size={20} color={theme.textSecondary} />
          </Pressable>
        </View>

        {/* Bus Information Card */}
        <View style={[styles.busCard, { backgroundColor: theme.surface }]}>
          <View style={styles.busHeader}>
            <View style={[styles.busIcon, { backgroundColor: theme.primary + '20' }]}>
              <Bus size={32} color={theme.primary} />
            </View>
            <View style={styles.busMainInfo}>
              <Text style={[styles.plateNumber, { color: theme.text }]}>
                {bus.plateNumber}
              </Text>
              <Text style={[styles.routeName, { color: theme.textSecondary }]}>
                {bus.route?.name || 'No Route Assigned'}
              </Text>
              <Text style={[styles.routeDescription, { color: theme.textSecondary }]}>
                {bus.route?.description || 'No description available'}
              </Text>
            </View>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: bus.isOnline ? theme.success : theme.error }
            ]}>
              <Text style={[styles.statusText, { color: theme.background }]}>
                {bus.isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>

          <View style={styles.busSpecs}>
            <View style={styles.specItem}>
              <Users size={20} color={theme.primary} />
              <Text style={[styles.specLabel, { color: theme.textSecondary }]}>
                Capacity
              </Text>
              <Text style={[styles.specValue, { color: theme.text }]}>
                {bus.capacity} passengers
              </Text>
            </View>

            <View style={styles.specItem}>
              <DollarSign size={20} color={theme.success} />
              <Text style={[styles.specLabel, { color: theme.textSecondary }]}>
                Fare
              </Text>
              <Text style={[styles.specValue, { color: theme.text }]}>
                {bus.fare} RWF
              </Text>
            </View>

            <View style={styles.specItem}>
              <Route size={20} color={theme.warning} />
              <Text style={[styles.specLabel, { color: theme.textSecondary }]}>
                Duration
              </Text>
              <Text style={[styles.specValue, { color: theme.text }]}>
                {bus.route?.estimatedDuration || 0} min
              </Text>
            </View>
          </View>
        </View>

        {/* Today's Performance */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Today's Performance
          </Text>
          <View style={styles.performanceGrid}>
            <View style={styles.performanceItem}>
              <Calendar size={20} color={theme.primary} />
              <Text style={[styles.performanceValue, { color: theme.text }]}>
                {todaySchedules.length}
              </Text>
              <Text style={[styles.performanceLabel, { color: theme.textSecondary }]}>
                Scheduled Trips
              </Text>
            </View>

            <View style={styles.performanceItem}>
              <CheckCircle size={20} color={theme.success} />
              <Text style={[styles.performanceValue, { color: theme.text }]}>
                {todaySchedules.filter(s => s.status === 'completed').length}
              </Text>
              <Text style={[styles.performanceLabel, { color: theme.textSecondary }]}>
                Completed
              </Text>
            </View>

            <View style={styles.performanceItem}>
              <Users size={20} color={theme.warning} />
              <Text style={[styles.performanceValue, { color: theme.text }]}>
                {passengers.length}
              </Text>
              <Text style={[styles.performanceLabel, { color: theme.textSecondary }]}>
                Interested
              </Text>
            </View>

            <View style={styles.performanceItem}>
              <DollarSign size={20} color={theme.success} />
              <Text style={[styles.performanceValue, { color: theme.text }]}>
                {(passengers.length * bus.fare).toLocaleString()}
              </Text>
              <Text style={[styles.performanceLabel, { color: theme.textSecondary }]}>
                Est. Earnings (RWF)
              </Text>
            </View>
          </View>
        </View>

        {/* Upcoming Schedules */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Upcoming Schedules
          </Text>
          {upcomingSchedules.length > 0 ? (
            upcomingSchedules.map((schedule, index) => (
              <View key={schedule.id} style={styles.scheduleItem}>
                <View style={[styles.scheduleIcon, { backgroundColor: theme.primary + '20' }]}>
                  <Clock size={20} color={theme.primary} />
                </View>
                <View style={styles.scheduleInfo}>
                  <Text style={[styles.scheduleTime, { color: theme.text }]}>
                    {new Date(schedule.departureTime).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                  <Text style={[styles.scheduleRoute, { color: theme.textSecondary }]}>
                    {bus.route?.name}
                  </Text>
                </View>
                <View style={[
                  styles.scheduleStatus,
                  { backgroundColor: getStatusColor(schedule.status, theme) + '20' }
                ]}>
                  <Text style={[
                    styles.scheduleStatusText,
                    { color: getStatusColor(schedule.status, theme) }
                  ]}>
                    {schedule.status}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noSchedules}>
              <Calendar size={32} color={theme.textSecondary} />
              <Text style={[styles.noSchedulesText, { color: theme.textSecondary }]}>
                No upcoming schedules
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Quick Actions
          </Text>
          <View style={styles.actionGrid}>
            <Pressable
              style={[styles.actionButton, { backgroundColor: theme.primary }]}
              onPress={() => Alert.alert('Feature', 'Update location functionality')}
            >
              <Navigation size={24} color={theme.background} />
              <Text style={[styles.actionButtonText, { color: theme.background }]}>
                Update Location
              </Text>
            </Pressable>

            <Pressable
              style={[styles.actionButton, { backgroundColor: theme.success }]}
              onPress={() => Alert.alert('Feature', 'Start trip functionality')}
            >
              <CheckCircle size={24} color={theme.background} />
              <Text style={[styles.actionButtonText, { color: theme.background }]}>
                Start Trip
              </Text>
            </Pressable>

            <Pressable
              style={[styles.actionButton, { backgroundColor: theme.warning }]}
              onPress={() => Alert.alert('Feature', 'View passengers functionality')}
            >
              <Users size={24} color={theme.background} />
              <Text style={[styles.actionButtonText, { color: theme.background }]}>
                View Passengers
              </Text>
            </Pressable>

            <Pressable
              style={[styles.actionButton, { backgroundColor: theme.textSecondary }]}
              onPress={() => Alert.alert('Feature', 'Bus settings functionality')}
            >
              <Settings size={24} color={theme.background} />
              <Text style={[styles.actionButtonText, { color: theme.background }]}>
                Settings
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStatusColor = (status: string, theme: any) => {
  switch (status) {
    case 'completed':
      return theme.success;
    case 'in-transit':
      return theme.warning;
    case 'cancelled':
      return theme.error;
    default:
      return theme.primary;
  }
};

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
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  settingsButton: {
    padding: 8,
    borderRadius: 20,
  },
  busCard: {
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  busHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  busIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  busMainInfo: {
    flex: 1,
  },
  plateNumber: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  routeName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  routeDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  busSpecs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  specItem: {
    alignItems: 'center',
    flex: 1,
  },
  specLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 8,
    marginBottom: 4,
  },
  specValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
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
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  performanceItem: {
    alignItems: 'center',
    width: '48%',
    marginBottom: 16,
  },
  performanceValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginTop: 8,
    marginBottom: 4,
  },
  performanceLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  scheduleRoute: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  scheduleStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scheduleStatusText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'capitalize',
  },
  noSchedules: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noSchedulesText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 8,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '48%',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
});