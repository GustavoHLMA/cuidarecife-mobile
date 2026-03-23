import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface ToastProps {
  visible: boolean;
  onClose: () => void;
  message?: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

export const CustomToast: React.FC<ToastProps> = ({ visible, onClose, message, type = 'info', duration = 3000 }) => {
  const [isRendered, setIsRendered] = React.useState(visible);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    if (visible && message) {
      setIsRendered(true);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -50,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start(() => {
          setIsRendered(false);
          onClose();
        });
      }, duration);

      return () => clearTimeout(timer);
    } else if (!visible) {
      opacity.setValue(0);
      translateY.setValue(-50);
      setIsRendered(false);
    }
  }, [visible, message, type, duration]);

  if (!isRendered) return null;

  let backgroundColor = '#333';
  let iconName: keyof typeof Ionicons.glyphMap = 'information-circle';

  if (type === 'success') {
    backgroundColor = '#28a745';
    iconName = 'checkmark-circle';
  } else if (type === 'error') {
    backgroundColor = '#dc3545';
    iconName = 'alert-circle';
  } else if (type === 'info') {
    backgroundColor = '#0a7ea4';
    iconName = 'information-circle';
  }

  return (
    <SafeAreaView style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.toast, { opacity, transform: [{ translateY }], backgroundColor }]}>
        <Ionicons name={iconName} size={24} color="#fff" style={styles.icon} />
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 20 : 50,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxWidth: Platform.OS === 'web' ? 400 : undefined,
    width: '90%',
  },
  icon: {
    marginRight: 12,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
});
