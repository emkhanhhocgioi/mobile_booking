
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

    // Form validation
    React.useEffect(() => {
        setIsFormValid(username.trim().length > 0 && password.length > 0);
        if (error) setError(''); // Clear errors when user types
    }, [username, password]);

    const TestLogin = async () => {
        if (!username.trim() || !password) {
          setError('Please enter both username and password');
          return;
        }
        
        setLoading(true);
        setError('');
    
        const data = {
          uname: username.trim(),
          password: password
        };
        
        try {
          const res = await axios.post(`${baseUrl}/api/login`, data, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
         const arr = [username.trim(), res.data];
          console.log('urole ='+res.data.urole)
          
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
          if (err.response) {
            setError(err.response.data.message || 'Invalid credentials. Please try again.');
          } else if (err.request) {
            setError('Network error. Please check your connection.');
          } else {
            setError('Something went wrong. Please try again.');
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
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="bed" size={32} color="#007BFF" />
              </View>
            </View>
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.welcomeSubtitle}>Sign in to your account</Text>
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
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, username ? styles.inputFocused : null]}
                  placeholder="Username or Email"
                  placeholderTextColor="#999"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, password ? styles.inputFocused : null]}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
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
              </View>
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
                  <Text style={styles.loadingText}>Signing in...</Text>
                </View>
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Forgot Password Link */}
            <TouchableOpacity 
              onPress={() => navigation.navigate('forgotpassword')}
              style={styles.forgotPasswordContainer}
            >
              <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Section */}
          <View style={styles.footerSection}>
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.signupPrompt}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('signup')}>
                <Text style={styles.signupLink}>Sign up</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.partnerPrompt}>
              <Text style={styles.partnerText}>Want to become a partner? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('signupP')}>
                <Text style={styles.partnerLink}>Join us</Text>
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
  inputFocused: {
    borderColor: '#007BFF',
    backgroundColor: '#fff',
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
