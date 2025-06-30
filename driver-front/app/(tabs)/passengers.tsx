import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useDriverData } from '@/hooks/useDriverData';
import { useState } from 'react';
import { Users, MapPin, Clock, Phone, Mail, Filter, CheckCircle, XCircle } from 'lucide-react-native';

export default function Passengers() {
  const { theme } = useTheme();
  const { passengers, schedules, loading } = useDriverData();
  const [filter, setFilter] = useState<'all' | 'interested' | 'confirmed'>('all');

  const filteredPassengers = passengers.filter(passenger => {
    if (filter === 'all') return true;
    return passenger.status === filter;
  });

  const renderFilterButton = (filterType: 'all' | 'interested' | 'confirmed', label: string) => (
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

  const renderPassengerCard = ({ item: passenger }: { item: any }) => (
    <View style={[styles.passengerCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.passengerHeader}>
        <View style={[styles.passengerAvatar, { backgroundColor: theme.primary }]}>
          <Text style={[styles.passengerInitial, { color: theme.background }]}>
            {passenger.user?.name?.charAt(0) || 'U'}
          </Text>
        </View>
        <View style={styles.passengerInfo}>
          <Text style={[styles.passengerName, { color: theme.text }]}>
            {passenger.user?.name || 'Unknown User'}
          </Text>
          <View style={styles.passengerContact}>
            <Mail size={14} color={theme.textSecondary} />
            <Text style={[styles.contactText, { color: theme.textSecondary }]}>
              {passenger.user?.email || 'No email'}
            </Text>
          </View>
          <View style={styles.passengerContact}>
            <Phone size={14} color={theme.textSecondary} />
            <Text style={[styles.contactText, { color: theme.textSecondary }]}>
              {passenger.user?.phone || 'No phone'}
            </Text>
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: passenger.status === 'confirmed' ? theme.success + '20' : theme.warning + '20' }
        ]}>
          {passenger.status === 'confirmed' ? (
            <CheckCircle size={16} color={theme.success} />
          ) : (
            <Clock size={16} color={theme.warning} />
          )}
          <Text style={[
            styles.statusText,
            { color: passenger.status === 'confirmed' ? theme.success : theme.warning }
          ]}>
            {passenger.status}
          </Text>
        </View>
      </View>

      <View style={styles.passengerDetails}>
        <View style={styles.detailItem}>
          <MapPin size={16} color={theme.primary} />
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
            Pickup Point:
          </Text>
          <Text style={[styles.detailValue, { color: theme.text }]}>
            {passenger.pickupPoint?.name || 'Unknown'}
          </Text>
        </View>
        
        <View style={styles.detailItem}>
          <Clock size={16} color={theme.textSecondary} />
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
            Interested Since:
          </Text>
          <Text style={[styles.detailValue, { color: theme.text }]}>
            {new Date(passenger.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading passengers...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>
            Interested Passengers
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {filteredPassengers.length} passengers found
          </Text>
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryCards}>
        <View style={[styles.summaryCard, { backgroundColor: theme.surface }]}>
          <Users size={24} color={theme.primary} />
          <Text style={[styles.summaryNumber, { color: theme.text }]}>
            {passengers.length}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
            Total Interested
          </Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: theme.surface }]}>
          <CheckCircle size={24} color={theme.success} />
          <Text style={[styles.summaryNumber, { color: theme.text }]}>
            {passengers.filter(p => p.status === 'confirmed').length}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
            Confirmed
          </Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: theme.surface }]}>
          <Clock size={24} color={theme.warning} />
          <Text style={[styles.summaryNumber, { color: theme.text }]}>
            {passengers.filter(p => p.status === 'interested').length}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
            Pending
          </Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {renderFilterButton('all', 'All')}
        {renderFilterButton('interested', 'Interested')}
        {renderFilterButton('confirmed', 'Confirmed')}
      </View>

      {/* Passengers List */}
      <FlatList
        data={filteredPassengers}
        renderItem={renderPassengerCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={[styles.emptyState, { backgroundColor: theme.surface }]}>
            <Users size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyStateText, { color: theme.text }]}>
              No passengers found
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.textSecondary }]}>
              {filter === 'all' 
                ? 'No one has shown interest in your bus yet'
                : `No ${filter} passengers found`
              }
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  header: {
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
  summaryCards: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
    textAlign: 'center',
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
  passengerCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  passengerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  passengerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  passengerInitial: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  passengerInfo: {
    flex: 1,
  },
  passengerName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  passengerContact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  contactText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginLeft: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'capitalize',
  },
  passengerDetails: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  detailValue: {
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