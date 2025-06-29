import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { 
  Settings as SettingsIcon, 
  User, 
  Globe, 
  Moon, 
  Sun, 
  LogOut, 
  ChevronRight,
  Phone,
  Mail,
  HelpCircle,
  MessageCircle,
  Shield,
  FileText,
  Bell,
  Star,
  Share2,
  Info,
  Lock,
  Download,
  Trash2
} from 'lucide-react-native';

export default function Settings() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
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

  const handleLanguageToggle = () => {
    setLanguage(language === 'en' ? 'rw' : 'en');
  };

  const handleSupport = () => {
    Alert.alert(
      'Contact Support',
      'How would you like to contact us?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'WhatsApp', 
          onPress: () => Linking.openURL('https://wa.me/250788123456')
        },
        { 
          text: 'Email', 
          onPress: () => Linking.openURL('mailto:support@ridra.rw')
        }
      ]
    );
  };

  const handleRateApp = () => {
    Alert.alert(
      'Rate Ridra',
      'Thank you for using Ridra! Would you like to rate us on the App Store?',
      [
        { text: 'Later', style: 'cancel' },
        { 
          text: 'Rate Now', 
          onPress: () => {
            // Open app store rating
            Alert.alert('Success', 'Thank you for your feedback!');
          }
        }
      ]
    );
  };

  const handleShareApp = () => {
    Alert.alert(
      'Share Ridra',
      'Help others discover Ridra by sharing the app!',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Share', 
          onPress: () => {
            // Share functionality
            Alert.alert('Shared', 'Thanks for sharing Ridra!');
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
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
            {t('settings')}
          </Text>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            {t('profile')}
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
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Preferences
          </Text>
          
          <SettingItem
            icon={<Globe size={20} color={theme.primary} />}
            title={t('language')}
            subtitle={language === 'en' ? 'English' : 'Kinyarwanda'}
            onPress={handleLanguageToggle}
            rightElement={
              <View style={styles.languageToggle}>
                <Text style={[styles.languageOption, { 
                  color: language === 'en' ? theme.primary : theme.textSecondary 
                }]}>
                  EN
                </Text>
                <Text style={[styles.languageSeparator, { color: theme.textSecondary }]}>
                  |
                </Text>
                <Text style={[styles.languageOption, { 
                  color: language === 'rw' ? theme.primary : theme.textSecondary 
                }]}>
                  RW
                </Text>
              </View>
            }
          />
          
          <SettingItem
            icon={isDark ? <Moon size={20} color={theme.primary} /> : <Sun size={20} color={theme.primary} />}
            title={t('darkMode')}
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

          <SettingItem
            icon={<Bell size={20} color={theme.primary} />}
            title="Notifications"
            subtitle="Manage your notification preferences"
            onPress={() => Alert.alert('Notifications', 'Notification settings coming soon!')}
          />
        </View>

        {/* Privacy & Security Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Privacy & Security
          </Text>
          
          <SettingItem
            icon={<Shield size={20} color={theme.primary} />}
            title="Privacy Policy"
            subtitle="Read our privacy policy"
            onPress={() => Linking.openURL('https://ridra.rw/privacy')}
          />

          <SettingItem
            icon={<FileText size={20} color={theme.primary} />}
            title="Terms of Service"
            subtitle="Read our terms and conditions"
            onPress={() => Linking.openURL('https://ridra.rw/terms')}
          />

          <SettingItem
            icon={<Lock size={20} color={theme.primary} />}
            title="Change Password"
            subtitle="Update your account password"
            onPress={() => Alert.alert('Change Password', "can't access this now")}
          />
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Support & Feedback
          </Text>
          

          <SettingItem
            icon={<MessageCircle size={20} color={theme.primary} />}
            title="Contact Support"
            subtitle="Get in touch with our team"
            onPress={handleSupport}
          />

          <SettingItem
            icon={<Star size={20} color={theme.primary} />}
            title="Rate App"
            subtitle="Help us improve by rating"
            onPress={handleRateApp}
          />

          <SettingItem
            icon={<Share2 size={20} color={theme.primary} />}
            title="Share App"
            subtitle="Tell your friends about Ridra"
            onPress={handleShareApp}
          />
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            About
          </Text>
          
          <SettingItem
            icon={<Info size={20} color={theme.primary} />}
            title="About Ridra"
            subtitle="Learn more about our app"
            onPress={() => Alert.alert('About Ridra', 'Ridra - Your trusted ride-sharing companion in Rwanda.\n\nVersion: 1.0.0\nBuild: 2024.1')}
          />
        </View>
        {/* Actions Section */}
        <View style={styles.section}>
          <SettingItem
            icon={<LogOut size={20} color={theme.error} />}
            title={t('logout')}
            subtitle="Sign out your account"
            onPress={handleLogout}
            danger={true}
          />
        </View>


        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Ridra v1.0.0
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
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageOption: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  languageSeparator: {
    fontSize: 14,
    marginHorizontal: 8,
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