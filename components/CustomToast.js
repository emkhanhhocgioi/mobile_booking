import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

const CustomToast = ({ visible, message, type = 'error', duration = 3000, onHide }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      // Show toast
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) onHide();
    });
  };

  if (!visible) return null;

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#D4EDDA',
          borderColor: '#28A745',
          iconColor: '#28A745',
          iconName: 'checkmark-circle',
        };
      case 'warning':
        return {
          backgroundColor: '#FFF3CD',
          borderColor: '#FFC107',
          iconColor: '#FFC107',
          iconName: 'warning',
        };
      case 'info':
        return {
          backgroundColor: '#D1ECF1',
          borderColor: '#17A2B8',
          iconColor: '#17A2B8',
          iconName: 'information-circle',
        };
      default: // error
        return {
          backgroundColor: '#F8D7DA',
          borderColor: '#DC3545',
          iconColor: '#DC3545',
          iconName: 'alert-circle',
        };
    }
  };

  const toastStyle = getToastStyle();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
          backgroundColor: toastStyle.backgroundColor,
          borderColor: toastStyle.borderColor,
        },
      ]}
    >
      <Ionicons
        name={toastStyle.iconName}
        size={20}
        color={toastStyle.iconColor}
        style={styles.icon}
      />
      <Text style={[styles.message, { color: toastStyle.iconColor }]}>
        {message}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  icon: {
    marginRight: 8,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default CustomToast;
