import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { 
  Settings as SettingsIcon, 
  User, 
  Moon, 
  Sun, 
  LogOut, 
  ChevronRight,
  Phone,
  Mail,
  HelpCircle,
  Shield,
  FileText,
  Bell,
  Info,
  Bus,
  MapPin
} from 'lucide-react-native';

export default function Settings() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth');
          }
        }
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement,
    danger = false 
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    danger?: boolean;
  }) => (
    <Pressable
      style={[styles.settingItem, { backgroundColor: theme.surface }]}
      onPress={onPress}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: danger ? theme.error + '20' : theme.primary + '20' }]}>
          {icon}
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: danger ? theme.error : theme.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightElement || <ChevronRight size={20} color={theme.textSecondary} />}
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            Driver Settings
          </Text>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Profile
          </Text>
          
          <View style={[styles.profileCard, { backgroundColor: theme.surface }]}>
            <View style={[styles.profileAvatar, { backgroundColor: theme.primary }]}>
              <User size={24} color={theme.background} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.text }]}>
                {user?.name}
              </Text>
              <View style={styles.profileDetail}>
                <Mail size={14} color={theme.textSecondary} />
                <Text style={[styles.profileDetailText, { color: theme.textSecondary }]}>
                  {user?.email}
                </Text>
              </View>
              <View style={styles.profileDetail}>
                <Phone size={14} color={theme.textSecondary} />
                <Text style={[styles.profileDetailText, { color: theme.textSecondary }]}>
                  {user?.phone}
                </Text>
              </View>
              <View style={styles.profileDetail}>
                <Bus size={14} color={theme.primary} />
                <Text style={[styles.profileDetailText, { color: theme.primary }]}>
                  Driver
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Driver Features */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Driver Features
          </Text>
          
          <SettingItem
            icon={<Bus size={20} color={theme.primary} />}
            title="My Bus"
            subtitle="View and manage your assigned bus"
            onPress={() => Alert.alert('Feature', 'Navigate to bus details')}
          />

          <SettingItem
            icon={<MapPin size={20} color={theme.primary} />}
            title="Location Tracking"
            subtitle="Manage location sharing settings"
            onPress={() => Alert.alert('Feature', 'Location tracking settings')}
          />

          <SettingItem
            icon={<Bell size={20} color={theme.primary} />}
            title="Notifications"
            subtitle="Passenger alerts and trip notifications"
            onPress={() => Alert.alert('Feature', 'Notification settings')}
          />
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Preferences
          </Text>
          
          <SettingItem
            icon={isDark ? <Moon size={20} color={theme.primary} /> : <Sun size={20} color={theme.primary} />}
            title="Dark Mode"
            subtitle={isDark ? 'Dark theme enabled' : 'Light theme enabled'}
            onPress={toggleTheme}
            rightElement={
              <View style={[
                styles.toggle,
                { backgroundColor: isDark ? theme.primary : theme.border }
              ]}>
                <View style={[
                  styles.toggleIndicator,
                  { 
                    backgroundColor: theme.background,
                    transform: [{ translateX: isDark ? 18 : 2 }]
                  }
                ]} />
              </View>
            }
          />
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Support & Information
          </Text>
          
          <SettingItem
            icon={<HelpCircle size={20} color={theme.primary} />}
            title="Help & Support"
            subtitle="Get help with the driver app"
            onPress={() => Alert.alert('Support', 'Contact support at driver-support@ridra.rw')}
          />

          <SettingItem
            icon={<Shield size={20} color={theme.primary} />}
            title="Privacy Policy"
            subtitle="Read our privacy policy"
            onPress={() => Alert.alert('Privacy', 'Privacy policy for drivers')}
          />

          <SettingItem
            icon={<FileText size={20} color={theme.primary} />}
            title="Terms of Service"
            subtitle="Driver terms and conditions"
            onPress={() => Alert.alert('Terms', 'Driver terms of service')}
          />

          <SettingItem
            icon={<Info size={20} color={theme.primary} />}
            title="About Ridra Driver"
            subtitle="Learn more about the driver app"
            onPress={() => Alert.alert('About', 'Ridra Driver App v1.0.0\n\nDesigned for professional bus drivers in Rwanda.')}
          />
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <SettingItem
            icon={<LogOut size={20} color={theme.error} />}
            title="Logout"
            subtitle="Sign out of your driver account"
            onPress={handleLogout}
            danger={true}
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Ridra Driver v1.0.0
          </Text>
          <Text style={[styles.footerSubtext, { color: theme.textSecondary }]}>
            Professional bus tracking for Rwanda
          </Text>
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 24,
    borderRadius: 12,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  profileDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileDetailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  settingRight: {
    marginLeft: 12,
  },
  toggle: {
    width: 40,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
});