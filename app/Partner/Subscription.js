import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { WebView } from 'react-native-webview';

let baseUrl = "http://localhost:5000";
if (Platform.OS === "android") {
  baseUrl = "http://10.0.2.2:5000";
} else if (Platform.OS === "ios") {
  baseUrl = "http://172.20.10.9:5000";
} else if (Platform.OS === "web") {
  baseUrl = "http://localhost:5000";
}

const SubscriptionScreen = () => {
  const route = useRoute();
  const uid = route.params.uid;
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [selectedPrice, setSelectedPrice] = useState('20.00');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [paymentUri, setPaymentUri] = useState('');
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'basic',
      name: 'Basic Plan',
      features: ['Post up to 5 hotels', 'Basic analytics', 'Email support'],
      color: '#4CAF50',
      icon: 'business'
    },
    {
      id: 'standard',
      name: 'Standard Plan',
      features: ['Post up to 20 hotels', 'Advanced analytics', 'Priority support', 'Featured listings'],
      color: '#2196F3',
      icon: 'business-center'
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      features: ['Unlimited hotels', 'Premium analytics', '24/7 support', 'Top featured listings', 'Custom branding'],
      color: '#FF9800',
      icon: 'star'
    }
  ];

  const durations = [
    { label: '1 Month', price: '20.00', savings: null },
    { label: '3 Months', price: '50.00', savings: '17%' },
    { label: '6 Months', price: '100.00', savings: '17%' },
    { label: '1 Year', price: '180.00', savings: '25%' }
  ];

  const handleSubmit = async () => {
    if (!selectedPlan) {
      alert('Please select a plan');
      return;
    }

    const data = {
      plan: selectedPlan,
      price: selectedPrice,
    };

    try {
      setLoading(true);
      const res = await axios.post(`${baseUrl}/api/create-payment`, data, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (res.status === 200) {
        setPaymentUri(res.data);
        
        if (Platform.OS === 'web') {
          window.open(res.data, '_blank');
        } else {
          setIsModalVisible(true);
        }
      }
    } catch (error) {
      console.log('Error:', error);
      alert('Payment initialization failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPlanCard = (plan) => (
    <TouchableOpacity
      key={plan.id}
      style={[
        styles.planCard,
        selectedPlan === plan.id && styles.selectedPlanCard,
        { borderColor: plan.color }
      ]}
      onPress={() => setSelectedPlan(plan.id)}
    >
      <View style={styles.planHeader}>
        <View style={[styles.planIcon, { backgroundColor: plan.color }]}>
          <Icon name={plan.icon} size={24} color="#fff" />
        </View>
        <Text style={styles.planName}>{plan.name}</Text>
        {selectedPlan === plan.id && (
          <Icon name="check-circle" size={24} color={plan.color} />
        )}
      </View>
      
      <View style={styles.planFeatures}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Icon name="check" size={16} color={plan.color} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  const renderDurationCard = (duration) => (
    <TouchableOpacity
      key={duration.price}
      style={[
        styles.durationCard,
        selectedPrice === duration.price && styles.selectedDurationCard
      ]}
      onPress={() => setSelectedPrice(duration.price)}
    >
      <View style={styles.durationHeader}>
        <Text style={styles.durationLabel}>{duration.label}</Text>
        {duration.savings && (
          <View style={styles.savingsBadge}>
            <Text style={styles.savingsText}>Save {duration.savings}</Text>
          </View>
        )}
      </View>
      <Text style={styles.durationPrice}>${duration.price}</Text>
      {selectedPrice === duration.price && (
        <Icon name="radio-button-checked" size={20} color="#4CAF50" style={styles.radioIcon} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="business" size={32} color="#2196F3" />
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>Upgrade to unlock premium features for your business</Text>
      </View>

      {/* Plans Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select a Plan</Text>
        <View style={styles.plansContainer}>
          {plans.map(renderPlanCard)}
        </View>
      </View>

      {/* Duration Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose Duration</Text>
        <View style={styles.durationsContainer}>
          {durations.map(renderDurationCard)}
        </View>
      </View>

      {/* Payment Method Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.paymentMethodCard}>
          <Icon name="payment" size={24} color="#4CAF50" />
          <View style={styles.paymentMethodInfo}>
            <Text style={styles.paymentMethodTitle}>PayPal</Text>
            <Text style={styles.paymentMethodDesc}>Secure payment via PayPal</Text>
          </View>
          <Icon name="security" size={20} color="#4CAF50" />
        </View>
      </View>

      {/* Summary Section */}
      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Plan:</Text>
          <Text style={styles.summaryValue}>
            {plans.find(p => p.id === selectedPlan)?.name}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Duration:</Text>
          <Text style={styles.summaryValue}>
            {durations.find(d => d.price === selectedPrice)?.label}
          </Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>${selectedPrice} USD</Text>
        </View>
      </View>

      {/* Subscribe Button */}
      <TouchableOpacity 
        style={[styles.subscribeButton, loading && styles.subscribeButtonDisabled]} 
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Icon name="payment" size={24} color="#fff" />
        )}
        <Text style={styles.subscribeButtonText}>
          {loading ? 'Processing...' : 'Subscribe Now'}
        </Text>
      </TouchableOpacity>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <Text style={styles.featuresTitle}>Why Choose Premium?</Text>
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Icon name="security" size={20} color="#4CAF50" />
            <Text style={styles.featureDescription}>Secure payment processing</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="support" size={20} color="#4CAF50" />
            <Text style={styles.featureDescription}>24/7 customer support</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="cancel" size={20} color="#4CAF50" />
            <Text style={styles.featureDescription}>Cancel anytime</Text>
          </View>
        </View>
      </View>

      {/* Modal for mobile platforms */}
      {Platform.OS !== 'web' && (
        <Modal
          visible={isModalVisible}
          animationType="slide"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complete Payment</Text>
              <TouchableOpacity 
                onPress={() => setIsModalVisible(false)} 
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <WebView
              source={{ uri: paymentUri }}
              style={styles.webView}
              onNavigationStateChange={(navState) => {
                console.log('Navigation state changed:', navState.url);
              }}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.warn('WebView error: ', nativeEvent);
              }}
            />
          </SafeAreaView>
        </Modal>
      )}

      {/* Web notification */}
      {Platform.OS === 'web' && paymentUri && (
        <View style={styles.webNotification}>
          <Icon name="open-in-new" size={24} color="#2196F3" />
          <Text style={styles.webNotificationText}>
            Payment page opened in a new tab
          </Text>
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => window.open(paymentUri, '_blank')}
          >
            <Text style={styles.linkButtonText}>Open Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  plansContainer: {
    gap: 12,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedPlanCard: {
    borderWidth: 2,
    elevation: 4,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  planIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  planFeatures: {
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  durationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  durationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: '47%',
    alignItems: 'center',
    elevation: 1,
  },
  selectedDurationCard: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    elevation: 3,
  },
  durationHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  durationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  savingsBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  savingsText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  durationPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  radioIcon: {
    marginTop: 8,
  },
  paymentMethodCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },
  paymentMethodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  paymentMethodDesc: {
    fontSize: 14,
    color: '#666',
  },
  summarySection: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginBottom: 24,
  },
  subscribeButtonDisabled: {
    backgroundColor: '#ccc',
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  featuresSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  featuresList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 1,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  webView: {
    flex: 1,
  },
  webNotification: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
  },
  webNotificationText: {
    fontSize: 14,
    color: '#1976d2',
    marginLeft: 12,
    flex: 1,
  },
  linkButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  linkButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default SubscriptionScreen;
