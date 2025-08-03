import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import {
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const StartPage = () => {
    const navigation = useNavigation();
    
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="bed" size={40} color="#007BFF" />
          </View>
          <View style={[styles.iconCircle, styles.iconCircle2]}>
            <Ionicons name="location" size={32} color="#28A745" />
          </View>
          <View style={[styles.iconCircle, styles.iconCircle3]}>
            <Ionicons name="star" size={28} color="#FFD700" />
          </View>
        </View>
        
        <Text style={styles.title}>Find Your Perfect Stay</Text>
        <Text style={styles.subtitle}>
          Discover amazing hotels and accommodations worldwide. Join millions of travelers who trust us for their perfect getaway.
        </Text>
        
        {/* Feature highlights */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color="#28A745" />
            <Text style={styles.featureText}>Best Prices</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color="#28A745" />
            <Text style={styles.featureText}>Instant Booking</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color="#28A745" />
            <Text style={styles.featureText}>24/7 Support</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        {/* Primary Actions */}
        <View style={styles.primaryActions}>
          <TouchableOpacity 
            style={styles.signupButton} 
            onPress={() => navigation.navigate('signup')}
            activeOpacity={0.8}
          >
            <Ionicons name="person-add" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.signupButtonText}>Get Started</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={() => navigation.navigate('login')}
            activeOpacity={0.8}
          >
            <Ionicons name="log-in" size={20} color="#007BFF" style={styles.buttonIcon} />
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Partner Section */}
        <View style={styles.partnerSection}>
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>Business Owner?</Text>
            <View style={styles.divider} />
          </View>
          
          <TouchableOpacity 
            style={styles.partnerButton} 
            onPress={() => navigation.navigate('signupP')}
            activeOpacity={0.8}
          >
            <View style={styles.partnerContent}>
              <View style={styles.partnerIconContainer}>
                <Ionicons name="business" size={24} color="#28A745" />
              </View>
              <View style={styles.partnerTextContainer}>
                <Text style={styles.partnerTitle}>Become a Partner</Text>
                <Text style={styles.partnerSubtitle}>List your property and earn more</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#28A745" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  
  // Hero Section
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  iconContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    marginBottom: 40,
  },
  iconCircle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconCircle2: {
    top: 0,
    right: 0,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0FFF4',
    shadowColor: '#28A745',
  },
  iconCircle3: {
    bottom: 0,
    left: 10,
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#FFFBF0',
    shadowColor: '#FFD700',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    color: '#1a1a1a',
    marginBottom: 16,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  
  // Features
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 12,
    color: '#28A745',
    fontWeight: '500',
    marginLeft: 4,
  },

  // Action Section
  actionSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  primaryActions: {
    gap: 16,
    marginBottom: 32,
  },
  signupButton: {
    backgroundColor: '#007BFF',
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007BFF',
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#007BFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },

  // Partner Section
  partnerSection: {
    marginBottom: 20,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E1E5E9',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
  },
  partnerButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E1E5E9',
    padding: 16,
  },
  partnerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partnerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0FFF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  partnerTextContainer: {
    flex: 1,
  },
  partnerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  partnerSubtitle: {
    fontSize: 12,
    color: '#666',
  },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default StartPage;
