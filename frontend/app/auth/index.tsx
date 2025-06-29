import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Bus, MapPin } from 'lucide-react-native';

export default function AuthIndex() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: theme.primary }]}>
            <Bus color={theme.background} size={40} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Ridra</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {t('welcome')}
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <MapPin color={theme.primary} size={24} />
            <Text style={[styles.featureText, { color: theme.text }]}>
              Track buses in real-time
            </Text>
          </View>
          <View style={styles.feature}>
            <Bus color={theme.primary} size={24} />
            <Text style={[styles.featureText, { color: theme.text }]}>
              Find buses near you
            </Text>
          </View>
        </View>

        <View style={styles.buttons}>
          <Pressable
            style={[styles.button, styles.primaryButton, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={[styles.buttonText, { color: theme.background }]}>
              {t('login')}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.secondaryButton, { borderColor: theme.primary }]}
            onPress={() => router.push('/auth/signup')}
          >
            <Text style={[styles.buttonText, { color: theme.primary }]}>
              {t('signup')}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  features: {
    marginBottom: 60,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginLeft: 12,
  },
  buttons: {
    gap: 16,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    // backgroundColor set via theme
  },
  secondaryButton: {
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});