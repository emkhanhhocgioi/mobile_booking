
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
            newErrors.username = 'Tên doanh nghiệp là bắt buộc';
        } else if (Username.trim().length < 3) {
            newErrors.username = 'Tên doanh nghiệp phải có ít nhất 3 ký tự';
        }

        if (!Email.trim()) {
            newErrors.email = 'Email doanh nghiệp là bắt buộc';
        } else if (!validateEmail(Email)) {
            newErrors.email = 'Vui lòng nhập địa chỉ email hợp lệ';
        }

        if (!phonenumber.trim()) {
            newErrors.phone = 'Số điện thoại doanh nghiệp là bắt buộc';
        } else if (!validatePhone(phonenumber)) {
            newErrors.phone = 'Vui lòng nhập số điện thoại hợp lệ';
        }

        if (!Password) {
            newErrors.password = 'Mật khẩu là bắt buộc';
        } else if (!validatePassword(Password)) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (!ConfirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        } else if (Password !== ConfirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu không khớp';
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
                    "Chào mừng đối tác!",
                    "Tài khoản đối tác của bạn đã được tạo thành công. Bây giờ bạn có thể bắt đầu đăng ký khách sạn của mình.",
                    [
                        {
                            text: "Bắt đầu",
                            onPress: () => navigation.navigate('login')
                        }
                    ]
                );
            } else {
                Alert.alert("Lỗi", "Không thể tạo tài khoản đối tác. Vui lòng thử lại.");
            }
        } catch (error) {
            console.log(error.response ? error.response.data : error.message);

            if (error.response) {
                const status = error.response.status;
                let message = "Không thể kết nối đến máy chủ";
                
                switch (status) {
                    case 400:
                        message = "Thông tin không hợp lệ. Vui lòng kiểm tra lại.";
                        break;
                    case 409:
                        message = "Email hoặc tên doanh nghiệp đã tồn tại. Vui lòng chọn thông tin khác.";
                        break;
                    case 422:
                        message = "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.";
                        break;
                    case 500:
                        message = "Lỗi máy chủ. Vui lòng thử lại sau.";
                        break;
                    default:
                        message = error.response.data.message || "Không thể kết nối đến máy chủ";
                }
                Alert.alert("Đăng ký đối tác thất bại", message);
            } else if (error.request) {
                Alert.alert("Lỗi mạng", "Không có phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng.");
            } else {
                Alert.alert("Lỗi", "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.");
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
            
            <Text style={styles.title}>Trở thành đối tác</Text>
            <Text style={styles.subtitle}>Bắt đầu kinh doanh khách sạn với chúng tôi</Text>
            
            {/* Partner Benefits */}
            <View style={styles.benefitsContainer}>
              <View style={styles.benefitItem}>
                <Ionicons name="trending-up" size={16} color="#28A745" />
                <Text style={styles.benefitText}>Tăng đặt phòng</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="globe-outline" size={16} color="#28A745" />
                <Text style={styles.benefitText}>Tiếp cận toàn cầu</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="shield-checkmark" size={16} color="#28A745" />
                <Text style={styles.benefitText}>Thanh toán an toàn</Text>
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
                  placeholder="Tên doanh nghiệp/Khách sạn"
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
                  placeholder="Email doanh nghiệp"
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
                  placeholder="Số điện thoại doanh nghiệp"
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
                  placeholder="Mật khẩu"
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
                  placeholder="Xác nhận mật khẩu"
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
                Bằng việc tham gia với tư cách đối tác, bạn đồng ý với{' '}
                <Text style={styles.termsLink}>Thỏa thuận đối tác</Text>
                {', '}
                <Text style={styles.termsLink}>Điều khoản dịch vụ</Text>
                {' '}và{' '}
                <Text style={styles.termsLink}>Chính sách bảo mật</Text>
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
                  <Text style={styles.loadingText}>Đang tạo tài khoản đối tác...</Text>
                </View>
              ) : (
                <Text style={styles.signupButtonText}>Trở thành đối tác</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Section */}
          <View style={styles.footerSection}>
            <View style={styles.loginPrompt}>
              <Text style={styles.loginText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('login')}>
                <Text style={styles.loginLink}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.customerPrompt}>
              <Text style={styles.customerText}>Muốn đặt khách sạn? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('signup')}>
                <Text style={styles.customerLink}>Tham gia với tư cách khách hàng</Text>
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
