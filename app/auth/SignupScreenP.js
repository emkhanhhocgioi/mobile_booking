
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useNavigation } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

var baseUrl = "http://localhost:5000";

if (Platform.OS === "android") {
  baseUrl = "http://10.0.2.2:5000";
}
if (Platform.OS === "ios") {
  baseUrl = "http://172.20.10.9:5000";
}
const SignUpScreenPartner = () => {
    const navigation = useNavigation();
    const [Username, setUsername] = useState('');
    const [Email, setEmail] = useState('');
    const [Password, setPassword] = useState('');
    const [ConfirmPassword, setConfirmPassword] = useState('');
    const [phonenumber, setPhonenumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});

    // Validation functions (same as customer signup)
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 6;
    };

    const validatePhone = (phone) => {
        const phoneRegex = /^[0-9]{10,15}$/;
        return phoneRegex.test(phone.replace(/\D/g, ''));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!Username.trim()) {
            newErrors.username = 'Business name is required';
        } else if (Username.trim().length < 3) {
            newErrors.username = 'Business name must be at least 3 characters';
        }

        if (!Email.trim()) {
            newErrors.email = 'Business email is required';
        } else if (!validateEmail(Email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!phonenumber.trim()) {
            newErrors.phone = 'Business phone number is required';
        } else if (!validatePhone(phonenumber)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        if (!Password) {
            newErrors.password = 'Password is required';
        } else if (!validatePassword(Password)) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!ConfirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (Password !== ConfirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setErrors({});

        const data = {
            uname: Username.trim(),
            email: Email.trim(),
            password: Password,
            PhoneNumber: phonenumber.trim(),
        };

        try {
            const res = await axios.post(`${baseUrl}/api/signupPartner`, data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (res.status >= 200 && res.status < 300) {
                Alert.alert(
                    "Welcome Partner!",
                    "Your partner account has been created successfully. You can now start listing your properties.",
                    [
                        {
                            text: "Get Started",
                            onPress: () => navigation.navigate('login')
                        }
                    ]
                );
            } else {
                Alert.alert("Error", "Failed to create partner account. Please try again.");
            }
        } catch (error) {
            console.log(error.response ? error.response.data : error.message);

            if (error.response) {
                const message = error.response.data.message || "Unable to connect to server";
                Alert.alert("Registration Failed", message);
            } else if (error.request) {
                Alert.alert("Network Error", "No response from server. Please check your connection.");
            } else {
                Alert.alert("Error", "An unexpected error occurred. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
            </TouchableOpacity>
            
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="business" size={32} color="#28A745" />
              </View>
            </View>
            
            <Text style={styles.title}>Become a Partner</Text>
            <Text style={styles.subtitle}>Start your hospitality business with us</Text>
            
            {/* Partner Benefits */}
            <View style={styles.benefitsContainer}>
              <View style={styles.benefitItem}>
                <Ionicons name="trending-up" size={16} color="#28A745" />
                <Text style={styles.benefitText}>Increase bookings</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="globe-outline" size={16} color="#28A745" />
                <Text style={styles.benefitText}>Global reach</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="shield-checkmark" size={16} color="#28A745" />
                <Text style={styles.benefitText}>Secure payments</Text>
              </View>
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Business Name Input */}
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, errors.username && styles.inputError]}>
                <Ionicons name="business-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Business/Hotel Name"
                  placeholderTextColor="#999"
                  value={Username}
                  onChangeText={(text) => {
                    setUsername(text);
                    if (errors.username) {
                      setErrors(prev => ({ ...prev, username: null }));
                    }
                  }}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
              {errors.username && (
                <Text style={styles.errorText}>{errors.username}</Text>
              )}
            </View>

            {/* Business Email Input */}
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Business email address"
                  placeholderTextColor="#999"
                  value={Email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) {
                      setErrors(prev => ({ ...prev, email: null }));
                    }
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Business Phone Input */}
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, errors.phone && styles.inputError]}>
                <Ionicons name="call-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Business phone number"
                  placeholderTextColor="#999"
                  value={phonenumber}
                  onChangeText={(text) => {
                    setPhonenumber(text);
                    if (errors.phone) {
                      setErrors(prev => ({ ...prev, phone: null }));
                    }
                  }}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                />
              </View>
              {errors.phone && (
                <Text style={styles.errorText}>{errors.phone}</Text>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  value={Password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) {
                      setErrors(prev => ({ ...prev, password: null }));
                    }
                  }}
                  returnKeyType="next"
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#999" 
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showConfirmPassword}
                  value={ConfirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) {
                      setErrors(prev => ({ ...prev, confirmPassword: null }));
                    }
                  }}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#999" 
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Partner Terms */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By joining as a partner, you agree to our{' '}
                <Text style={styles.termsLink}>Partner Agreement</Text>
                {', '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity 
              style={[styles.signupButton, loading && styles.signupButtonLoading]} 
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.loadingText}>Creating partner account...</Text>
                </View>
              ) : (
                <Text style={styles.signupButtonText}>Become a Partner</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Section */}
          <View style={styles.footerSection}>
            <View style={styles.loginPrompt}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('login')}>
                <Text style={styles.loginLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.customerPrompt}>
              <Text style={styles.customerText}>Looking to book hotels? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('signup')}>
                <Text style={styles.customerLink}>Join as traveler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  
  // Header Section
  headerSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 20,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0FFF4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#28A745',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  
  // Benefits Section
  benefitsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  benefitItem: {
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 12,
    color: '#28A745',
    marginTop: 4,
    fontWeight: '500',
  },

  // Form Section
  formSection: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    height: 56,
  },
  inputError: {
    borderColor: '#FF4757',
    backgroundColor: '#FFF5F5',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    color: '#FF4757',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
  
  // Terms
  termsContainer: {
    marginBottom: 24,
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#28A745',
    fontWeight: '500',
  },
  
  // Sign Up Button
  signupButton: {
    backgroundColor: '#28A745',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#28A745',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  signupButtonLoading: {
    backgroundColor: '#1E7E34',
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Footer Section
  footerSection: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    fontSize: 14,
    color: '#007BFF',
    fontWeight: '600',
  },
  customerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerText: {
    fontSize: 14,
    color: '#666',
  },
  customerLink: {
    fontSize: 14,
    color: '#007BFF',
    fontWeight: '600',
  },
});

export default SignUpScreenPartner;
