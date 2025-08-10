
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CustomToast from '../../components/CustomToast';
import { ErrorMessages, getErrorMessageByStatus, ValidationUtils } from '../../utils/validationUtils';

var baseUrl = "http://localhost:5000";

if (Platform.OS === "android") {
  baseUrl = "http://10.0.2.2:5000";
}
if (Platform.OS === "ios") {
  baseUrl = "http://172.20.10.9:5000";
}
const LoginScreen = () => {
    const navigation = useNavigation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [attemptCount, setAttemptCount] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('error');

    // Validation functions using ValidationUtils
    const validateField = (field, value) => {
        const errors = {};
        
        if (field === 'username' || field === 'all') {
            if (!username.trim()) {
                errors.username = ErrorMessages.REQUIRED_USERNAME;
            } else if (ValidationUtils.isEmailFormat(username)) {
                if (!ValidationUtils.validateEmail(username)) {
                    errors.username = ErrorMessages.INVALID_EMAIL;
                }
            } else {
                if (!ValidationUtils.validateUsername(username)) {
                    errors.username = ErrorMessages.INVALID_USERNAME;
                }
            }
        }

        if (field === 'password' || field === 'all') {
            if (!password.trim()) {
                errors.password = ErrorMessages.REQUIRED_PASSWORD;
            } else if (!ValidationUtils.validatePassword(password)) {
                errors.password = ErrorMessages.INVALID_PASSWORD;
            }
        }

        return errors;
    };

    // Show toast helper
    const showToastMessage = (message, type = 'error') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
    };

    // Form validation
    React.useEffect(() => {
        const isValid = username.trim().length > 0 && password.length >= 6;
        setIsFormValid(isValid);
        
        // Clear general error when user types
        if (error) setError('');
        
        // Clear field-specific errors when user types
        if (fieldErrors.username && username.trim()) {
            setFieldErrors(prev => ({ ...prev, username: null }));
        }
        if (fieldErrors.password && password.trim()) {
            setFieldErrors(prev => ({ ...prev, password: null }));
        }
    }, [username, password, error, fieldErrors]);

    const TestLogin = async () => {
        // Validate form before submission
        const validationErrors = validateField('all');
        if (Object.keys(validationErrors).length > 0) {
            setFieldErrors(validationErrors);
            setError('Vui lòng kiểm tra lại thông tin đăng nhập');
            return;
        }

        // Check for too many failed attempts
        if (attemptCount >= 5) {
            showToastMessage(ErrorMessages.TOO_MANY_ATTEMPTS);
            return;
        }
        
        setLoading(true);
        setError('');
        setFieldErrors({});
    
        const data = {
          uname: username.trim(),
          password: password
        };
        
        try {
          const res = await axios.post(`${baseUrl}/api/login`, data, {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 10000, // 10 second timeout
          });
          
          const arr = [username.trim(), res.data];
          console.log('urole ='+res.data.urole)
          
          // Reset attempt count on successful login
          setAttemptCount(0);
          showToastMessage('Đăng nhập thành công!', 'success');
          
          if (res.data.urole === 0 ) {
            navigation.navigate('admin', {
              username: arr
              }
            );
          } else {
            navigation.navigate('home', {
              username: arr
              }
            );
          }
        } catch (err) {
          console.error('Login Error:', err);
          setAttemptCount(prev => prev + 1);
          
          if (err.response) {
            const status = err.response.status;
            const message = getErrorMessageByStatus(status);
            
            setError(message);
            showToastMessage(message);
            
            // Set specific field errors for certain cases
            if (status === 401 || status === 404) {
              setFieldErrors({
                username: status === 404 ? ErrorMessages.ACCOUNT_NOT_FOUND : '',
                password: status === 401 ? ErrorMessages.LOGIN_FAILED : ''
              });
            }
          } else if (err.request) {
            const message = ErrorMessages.NETWORK_ERROR;
            setError(message);
            showToastMessage(message);
          } else if (err.code === 'ECONNABORTED') {
            const message = 'Kết nối quá chậm. Vui lòng thử lại.';
            setError(message);
            showToastMessage(message);
          } else {
            const message = ErrorMessages.UNKNOWN_ERROR;
            setError(message);
            showToastMessage(message);
          }
        } finally {
          setLoading(false); 
        }
      };
  return (
    <SafeAreaView style={styles.container}>
      <CustomToast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onHide={() => setShowToast(false)}
      />
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
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="bed" size={32} color="#007BFF" />
              </View>
            </View>
            <Text style={styles.welcomeTitle}>Chào mừng trở lại</Text>
            <Text style={styles.welcomeSubtitle}>Đăng nhập vào tài khoản của bạn</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={16} color="#FF4757" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            
            {/* Username Input */}
            <View style={styles.inputContainer}>
              <View style={[
                styles.inputWrapper, 
                fieldErrors.username && styles.inputError,
                username && !fieldErrors.username && styles.inputSuccess
              ]}>
                <Ionicons name="person-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input]}
                  placeholder="Tên đăng nhập hoặc Email"
                  placeholderTextColor="#999"
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    // Real-time validation
                    const errors = validateField('username', text);
                    if (errors.username) {
                      setFieldErrors(prev => ({ ...prev, username: errors.username }));
                    } else {
                      setFieldErrors(prev => ({ ...prev, username: null }));
                    }
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
                {username && !fieldErrors.username && (
                  <Ionicons name="checkmark-circle" size={20} color="#28A745" style={styles.successIcon} />
                )}
              </View>
              {fieldErrors.username && (
                <View style={styles.fieldErrorContainer}>
                  <Ionicons name="alert-circle-outline" size={12} color="#FF4757" />
                  <Text style={styles.fieldErrorText}>{fieldErrors.username}</Text>
                </View>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={[
                styles.inputWrapper,
                fieldErrors.password && styles.inputError,
                password && !fieldErrors.password && styles.inputSuccess
              ]}>
                <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input]}
                  placeholder="Mật khẩu"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    // Real-time validation
                    const errors = validateField('password', text);
                    if (errors.password) {
                      setFieldErrors(prev => ({ ...prev, password: errors.password }));
                    } else {
                      setFieldErrors(prev => ({ ...prev, password: null }));
                    }
                  }}
                  returnKeyType="done"
                  onSubmitEditing={TestLogin}
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
                {password && !fieldErrors.password && (
                  <Ionicons name="checkmark-circle" size={20} color="#28A745" style={styles.successIcon} />
                )}
              </View>
              {fieldErrors.password && (
                <View style={styles.fieldErrorContainer}>
                  <Ionicons name="alert-circle-outline" size={12} color="#FF4757" />
                  <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text>
                </View>
              )}
            </View>

            {/* Login Button */}
            <TouchableOpacity 
              style={[
                styles.loginButton, 
                !isFormValid && styles.loginButtonDisabled,
                loading && styles.loginButtonLoading
              ]} 
              onPress={TestLogin}
              disabled={!isFormValid || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.loadingText}>Đang đăng nhập...</Text>
                </View>
              ) : (
                <Text style={styles.loginButtonText}>Đăng nhập</Text>
              )}
            </TouchableOpacity>

            {/* Forgot Password Link */}
            <TouchableOpacity 
              onPress={() => navigation.navigate('forgotpassword')}
              style={styles.forgotPasswordContainer}
            >
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Section */}
          <View style={styles.footerSection}>
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>hoặc</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.signupPrompt}>
              <Text style={styles.signupText}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('signup')}>
                <Text style={styles.signupLink}>Đăng ký</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.partnerPrompt}>
              <Text style={styles.partnerText}>Muốn trở thành đối tác? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('signupP')}>
                <Text style={styles.partnerLink}>Tham gia với chúng tôi</Text>
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
    marginTop: 40,
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

  // Form Section
  formSection: {
    marginBottom: 40,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderColor: '#FF4757',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#FF4757',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
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
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    paddingVertical: 0,
  },
  inputError: {
    borderColor: '#FF4757',
    backgroundColor: '#FFF5F5',
  },
  inputSuccess: {
    borderColor: '#28A745',
    backgroundColor: '#F0FFF4',
  },
  successIcon: {
    marginLeft: 8,
  },
  fieldErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 16,
  },
  fieldErrorText: {
    color: '#FF4757',
    fontSize: 12,
    marginLeft: 4,
    flex: 1,
  },
  eyeIcon: {
    padding: 4,
  },
  
  // Login Button
  loginButton: {
    backgroundColor: '#007BFF',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#007BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: '#C1C9D0',
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonLoading: {
    backgroundColor: '#0056B3',
  },
  loginButtonText: {
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
  
  // Forgot Password
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  forgotPasswordText: {
    color: '#007BFF',
    fontSize: 14,
    fontWeight: '500',
  },

  // Footer Section
  footerSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
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
  },
  signupPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  signupText: {
    fontSize: 14,
    color: '#666',
  },
  signupLink: {
    fontSize: 14,
    color: '#007BFF',
    fontWeight: '600',
  },
  partnerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerText: {
    fontSize: 14,
    color: '#666',
  },
  partnerLink: {
    fontSize: 14,
    color: '#28A745',
    fontWeight: '600',
  },
});

export default LoginScreen;
