import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useNavigation } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
var baseUrl = "http://localhost:5000";

if (Platform.OS === "android") {
  baseUrl = "http://10.0.2.2:5000";
}
if (Platform.OS === "ios") {
  baseUrl = "http://172.20.10.9:5000";
}

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationinput, setVerificationInput] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newpasswordvis, setNewpassowrdvis] = useState(false);
  const [newpassword, setnewpassword] = useState('');
  const [confirmpassword, setConfirmpassword] = useState('');
  const [btntype, setBtntype] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Generate random code
  const randomCode = (length = 6) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters[randomIndex];
    }
    return code;
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrors({ email: 'Please enter your email address' });
      return;
    }
    
    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);
    setErrors({});
    
    let code = randomCode();
    setVerificationCode(code);
    
    const data = {
      email: email.trim(),
      code: code,
    };

    try {
      await axios.post(`${baseUrl}/api/send-verificationcode`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      setModalVisible(true);
      Alert.alert('Success', 'Verification code has been sent to your email!');
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Unable to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationinput.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }
    
    if (verificationinput.trim() === verificationCode) {
      setBtntype(1);
      setNewpassowrdvis(true);
    } else {
      Alert.alert('Error', 'Invalid verification code. Please try again.');
    }
  };

  const handleChangepassword = async () => {
    if (!newpassword || !confirmpassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }
    
    if (newpassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }
    
    if (newpassword !== confirmpassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    
    const data = {
      email: email.trim(),
      newpassword: newpassword,
    };
    
    try {
      await axios.post(`${baseUrl}/api/chagnepassword`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      Alert.alert(
        'Success!',
        'Your password has been updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setModalVisible(false);
              navigation.navigate('login');
            }
          }
        ]
      );
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to update password. Please try again.');
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
                <Ionicons name="key" size={32} color="#FF6B35" />
              </View>
            </View>
            
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Don't worry! Enter your email address and we'll send you a verification code to reset your password.
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email address"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) {
                      setErrors({});
                    }
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleForgotPassword}
                />
              </View>
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Send Code Button */}
            <TouchableOpacity 
              style={[styles.sendButton, loading && styles.sendButtonLoading]} 
              onPress={handleForgotPassword}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.loadingText}>Sending code...</Text>
                </View>
              ) : (
                <Text style={styles.sendButtonText}>Send Verification Code</Text>
              )}
            </TouchableOpacity>

            {/* Back to Login */}
            <TouchableOpacity 
              style={styles.backToLogin}
              onPress={() => navigation.navigate('login')}
            >
              <Ionicons name="arrow-back-outline" size={16} color="#007BFF" />
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Enhanced Verification Modal */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboardView}
          >
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalIconContainer}>
                  <Ionicons 
                    name={btntype === 0 ? "mail" : "lock-closed"} 
                    size={24} 
                    color="#007BFF" 
                  />
                </View>
                <Text style={styles.modalTitle}>
                  {btntype === 0 ? 'Enter Verification Code' : 'Create New Password'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {btntype === 0 
                    ? `We've sent a verification code to ${email}`
                    : 'Please enter your new password'
                  }
                </Text>
              </View>

              {/* Modal Form */}
              <View style={styles.modalForm}>
                {/* Verification Code Input */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="keypad-outline" size={20} color="#999" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter verification code"
                      placeholderTextColor="#999"
                      value={verificationinput}
                      onChangeText={setVerificationInput}
                      keyboardType="default"
                      autoCapitalize="characters"
                      maxLength={6}
                    />
                  </View>
                </View>

                {/* New Password Fields */}
                {newpasswordvis && (
                  <>
                    <View style={styles.inputContainer}>
                      <View style={styles.inputWrapper}>
                        <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="New password"
                          placeholderTextColor="#999"
                          secureTextEntry={!showPassword}
                          value={newpassword}
                          onChangeText={setnewpassword}
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
                    </View>

                    <View style={styles.inputContainer}>
                      <View style={styles.inputWrapper}>
                        <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Confirm new password"
                          placeholderTextColor="#999"
                          secureTextEntry={!showConfirmPassword}
                          value={confirmpassword}
                          onChangeText={setConfirmpassword}
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
                    </View>
                  </>
                )}
              </View>

              {/* Modal Actions */}
              <View style={styles.modalActions}>
                {btntype === 0 ? (
                  <TouchableOpacity 
                    style={styles.verifyButton} 
                    onPress={handleVerifyCode}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.verifyButtonText}>Verify Code</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={[styles.changePasswordButton, loading && styles.changePasswordButtonLoading]} 
                    onPress={handleChangepassword}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#fff" />
                        <Text style={styles.loadingText}>Updating...</Text>
                      </View>
                    ) : (
                      <Text style={styles.changePasswordButtonText}>Update Password</Text>
                    )}
                  </TouchableOpacity>
                )}

                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => {
                    setModalVisible(false);
                    setBtntype(0);
                    setNewpassowrdvis(false);
                    setVerificationInput('');
                    setnewpassword('');
                    setConfirmpassword('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
    marginTop: 40,
    marginBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 30,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },

  // Form Section
  formSection: {
    marginBottom: 40,
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
  errorText: {
    color: '#FF4757',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
  
  // Send Button
  sendButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonLoading: {
    backgroundColor: '#E55A2B',
  },
  sendButtonText: {
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
  
  // Back to Login
  backToLogin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  backToLoginText: {
    color: '#007BFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalKeyboardView: {
    width: '100%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  
  // Modal Header
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Modal Form
  modalForm: {
    marginBottom: 24,
  },
  eyeIcon: {
    padding: 4,
  },
  
  // Modal Actions
  modalActions: {
    gap: 12,
  },
  verifyButton: {
    backgroundColor: '#007BFF',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  changePasswordButton: {
    backgroundColor: '#28A745',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePasswordButtonLoading: {
    backgroundColor: '#1E7E34',
  },
  changePasswordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ForgotPasswordScreen;
