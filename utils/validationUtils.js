// Validation utilities for authentication forms

export const ValidationUtils = {
  // Email validation
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  },

  // Username validation (3+ characters, letters, numbers, underscores)
  validateUsername: (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
    return usernameRegex.test(username.trim());
  },

  // Password validation (6+ characters)
  validatePassword: (password) => {
    return password.length >= 6;
  },

  // Strong password validation
  validateStrongPassword: (password) => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  },

  // Phone number validation (10-15 digits)
  validatePhone: (phone) => {
    const phoneRegex = /^[0-9]{10,15}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  },

  // Vietnamese phone number validation
  validateVietnamesePhone: (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const vietnamesePhoneRegex = /^(84|0)(3[2-9]|5[689]|7[06-9]|8[1-689]|9[0-46-9])[0-9]{7}$/;
    return vietnamesePhoneRegex.test(cleanPhone);
  },

  // Check if input is email format
  isEmailFormat: (input) => {
    return input.includes('@');
  },

  // Business name validation
  validateBusinessName: (name) => {
    return name.trim().length >= 3 && name.trim().length <= 100;
  },

  // Full name validation
  validateFullName: (name) => {
    const nameRegex = /^[a-zA-ZÀ-ỹ\s]{2,50}$/;
    return nameRegex.test(name.trim());
  },
};

// Error messages in Vietnamese
export const ErrorMessages = {
  REQUIRED_USERNAME: 'Tên đăng nhập là bắt buộc',
  REQUIRED_EMAIL: 'Email là bắt buộc',
  REQUIRED_PASSWORD: 'Mật khẩu là bắt buộc',
  REQUIRED_CONFIRM_PASSWORD: 'Vui lòng xác nhận mật khẩu',
  REQUIRED_PHONE: 'Số điện thoại là bắt buộc',
  REQUIRED_BUSINESS_NAME: 'Tên doanh nghiệp là bắt buộc',
  REQUIRED_FULL_NAME: 'Họ và tên là bắt buộc',

  INVALID_EMAIL: 'Định dạng email không hợp lệ',
  INVALID_USERNAME: 'Tên đăng nhập phải có ít nhất 3 ký tự và chỉ chứa chữ cái, số, dấu gạch dưới',
  INVALID_PASSWORD: 'Mật khẩu phải có ít nhất 6 ký tự',
  INVALID_STRONG_PASSWORD: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
  INVALID_PHONE: 'Số điện thoại không hợp lệ',
  INVALID_VIETNAMESE_PHONE: 'Số điện thoại Việt Nam không hợp lệ',
  INVALID_BUSINESS_NAME: 'Tên doanh nghiệp phải có từ 3-100 ký tự',
  INVALID_FULL_NAME: 'Họ và tên không hợp lệ',

  PASSWORD_MISMATCH: 'Mật khẩu không khớp',
  LOGIN_FAILED: 'Tên đăng nhập hoặc mật khẩu không chính xác',
  NETWORK_ERROR: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet',
  SERVER_ERROR: 'Lỗi máy chủ. Vui lòng thử lại sau',
  UNKNOWN_ERROR: 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại',
  TOO_MANY_ATTEMPTS: 'Bạn đã thử quá nhiều lần. Vui lòng đợi một chút',
  ACCOUNT_LOCKED: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên',
  ACCOUNT_NOT_FOUND: 'Tài khoản không tồn tại',
  EMAIL_ALREADY_EXISTS: 'Email đã được sử dụng',
  USERNAME_ALREADY_EXISTS: 'Tên đăng nhập đã được sử dụng',
};

// Success messages
export const SuccessMessages = {
  ACCOUNT_CREATED: 'Tài khoản đã được tạo thành công',
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  PARTNER_ACCOUNT_CREATED: 'Tài khoản đối tác đã được tạo thành công',
  PASSWORD_RESET_SENT: 'Email đặt lại mật khẩu đã được gửi',
  PROFILE_UPDATED: 'Thông tin cá nhân đã được cập nhật',
};

// HTTP status code handlers
export const getErrorMessageByStatus = (status, defaultMessage = ErrorMessages.UNKNOWN_ERROR) => {
  switch (status) {
    case 400:
      return 'Thông tin không hợp lệ. Vui lòng kiểm tra lại.';
    case 401:
      return ErrorMessages.LOGIN_FAILED;
    case 403:
      return ErrorMessages.ACCOUNT_LOCKED;
    case 404:
      return ErrorMessages.ACCOUNT_NOT_FOUND;
    case 409:
      return 'Thông tin đã tồn tại. Vui lòng chọn thông tin khác.';
    case 422:
      return 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
    case 429:
      return ErrorMessages.TOO_MANY_ATTEMPTS;
    case 500:
      return ErrorMessages.SERVER_ERROR;
    default:
      return defaultMessage;
  }
};

// Form validation helper
export const validateAuthForm = (formData, formType = 'login') => {
  const errors = {};

  switch (formType) {
    case 'login':
      // Username/Email validation
      if (!formData.username?.trim()) {
        errors.username = ErrorMessages.REQUIRED_USERNAME;
      } else if (ValidationUtils.isEmailFormat(formData.username)) {
        if (!ValidationUtils.validateEmail(formData.username)) {
          errors.username = ErrorMessages.INVALID_EMAIL;
        }
      } else {
        if (!ValidationUtils.validateUsername(formData.username)) {
          errors.username = ErrorMessages.INVALID_USERNAME;
        }
      }

      // Password validation
      if (!formData.password?.trim()) {
        errors.password = ErrorMessages.REQUIRED_PASSWORD;
      } else if (!ValidationUtils.validatePassword(formData.password)) {
        errors.password = ErrorMessages.INVALID_PASSWORD;
      }
      break;

    case 'signup':
      // Username validation
      if (!formData.username?.trim()) {
        errors.username = ErrorMessages.REQUIRED_USERNAME;
      } else if (!ValidationUtils.validateUsername(formData.username)) {
        errors.username = ErrorMessages.INVALID_USERNAME;
      }

      // Email validation
      if (!formData.email?.trim()) {
        errors.email = ErrorMessages.REQUIRED_EMAIL;
      } else if (!ValidationUtils.validateEmail(formData.email)) {
        errors.email = ErrorMessages.INVALID_EMAIL;
      }

      // Phone validation
      if (!formData.phone?.trim()) {
        errors.phone = ErrorMessages.REQUIRED_PHONE;
      } else if (!ValidationUtils.validateVietnamesePhone(formData.phone)) {
        errors.phone = ErrorMessages.INVALID_VIETNAMESE_PHONE;
      }

      // Password validation
      if (!formData.password) {
        errors.password = ErrorMessages.REQUIRED_PASSWORD;
      } else if (!ValidationUtils.validatePassword(formData.password)) {
        errors.password = ErrorMessages.INVALID_PASSWORD;
      }

      // Confirm password validation
      if (!formData.confirmPassword) {
        errors.confirmPassword = ErrorMessages.REQUIRED_CONFIRM_PASSWORD;
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = ErrorMessages.PASSWORD_MISMATCH;
      }
      break;

    case 'partner-signup':
      // Business name validation
      if (!formData.businessName?.trim()) {
        errors.businessName = ErrorMessages.REQUIRED_BUSINESS_NAME;
      } else if (!ValidationUtils.validateBusinessName(formData.businessName)) {
        errors.businessName = ErrorMessages.INVALID_BUSINESS_NAME;
      }

      // Email validation
      if (!formData.email?.trim()) {
        errors.email = ErrorMessages.REQUIRED_EMAIL;
      } else if (!ValidationUtils.validateEmail(formData.email)) {
        errors.email = ErrorMessages.INVALID_EMAIL;
      }

      // Phone validation
      if (!formData.phone?.trim()) {
        errors.phone = ErrorMessages.REQUIRED_PHONE;
      } else if (!ValidationUtils.validateVietnamesePhone(formData.phone)) {
        errors.phone = ErrorMessages.INVALID_VIETNAMESE_PHONE;
      }

      // Password validation
      if (!formData.password) {
        errors.password = ErrorMessages.REQUIRED_PASSWORD;
      } else if (!ValidationUtils.validatePassword(formData.password)) {
        errors.password = ErrorMessages.INVALID_PASSWORD;
      }

      // Confirm password validation
      if (!formData.confirmPassword) {
        errors.confirmPassword = ErrorMessages.REQUIRED_CONFIRM_PASSWORD;
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = ErrorMessages.PASSWORD_MISMATCH;
      }
      break;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
