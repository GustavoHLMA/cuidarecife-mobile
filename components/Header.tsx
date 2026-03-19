import React, { useState, useRef, useEffect } from 'react';
import {
  Animated as RNAnimated,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

interface HeaderProps {
  scrollY: RNAnimated.Value;
  onReadPress?: () => void;
  onLogoutPress?: () => void;
  onMenuPress?: (option: 'conta' | 'configuracoes') => void;
}

const Header: React.FC<HeaderProps> = ({ scrollY, onReadPress, onLogoutPress, onMenuPress }) => {
  const { user } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerAnim = useRef(new RNAnimated.Value(-DRAWER_WIDTH)).current;
  const overlayAnim = useRef(new RNAnimated.Value(0)).current;
  
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [200, 0],
    extrapolate: 'clamp',
  });

  const opacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const openDrawer = () => {
    setIsDrawerOpen(true);
    RNAnimated.parallel([
      RNAnimated.timing(drawerAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      RNAnimated.timing(overlayAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = () => {
    RNAnimated.parallel([
      RNAnimated.timing(drawerAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }),
      RNAnimated.timing(overlayAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsDrawerOpen(false);
    });
  };

  const handleMenuOption = (option: 'conta' | 'configuracoes') => {
    closeDrawer();
    if (onMenuPress) {
      onMenuPress(option);
    }
  };

  const handleLogout = () => {
    closeDrawer();
    if (onLogoutPress) {
      onLogoutPress();
    }
  };

  return (
    <>
      <RNAnimated.View style={[styles.headerContainer, { height: headerHeight }]}>
        <RNAnimated.View style={[styles.topRow, { opacity }]}>
          <Image
            source={require('@/assets/images/cuidarecife.png')}
            style={styles.logo}
          />
          <View style={styles.rightIcons}>
            <TouchableOpacity onPress={onReadPress} style={styles.iconButton}>
              <Ionicons name="volume-high" size={32} color="#074173" />
            </TouchableOpacity>
            <TouchableOpacity onPress={openDrawer} style={styles.iconButton}>
              <Ionicons name="menu" size={32} color="#074173" />
            </TouchableOpacity>
          </View>
        </RNAnimated.View>

        <RNAnimated.View style={[styles.profileImageWrapper, { opacity }]}>
          <View style={styles.profileImage}>
            <Text style={styles.initialsText}>{getInitials(user?.name || '')}</Text>
          </View>
        </RNAnimated.View>
      </RNAnimated.View>

      {/* Side Drawer Modal */}
      <Modal
        visible={isDrawerOpen}
        transparent
        animationType="none"
        onRequestClose={closeDrawer}
      >
        <View style={styles.modalContainer}>
          {/* Overlay */}
          <TouchableWithoutFeedback onPress={closeDrawer}>
            <RNAnimated.View style={[styles.overlay, { opacity: overlayAnim }]} />
          </TouchableWithoutFeedback>

          {/* Drawer */}
          <RNAnimated.View style={[styles.drawer, { transform: [{ translateX: drawerAnim }] }]}>
            {/* Drawer Header */}
            <View style={styles.drawerHeader}>
              <View style={styles.drawerAvatar}>
                <Text style={styles.drawerAvatarText}>{getInitials(user?.name || '')}</Text>
              </View>
              <Text style={styles.drawerUserName}>{user?.name || 'Usuário'}</Text>
              <Text style={styles.drawerUserEmail}>{user?.email || ''}</Text>
            </View>

            {/* Menu Options */}
            <View style={styles.drawerMenu}>
              <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('conta')}>
                <Ionicons name="person-outline" size={24} color="#004894" />
                <Text style={styles.menuItemText}>Conta</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('configuracoes')}>
                <Ionicons name="settings-outline" size={24} color="#004894" />
                <Text style={styles.menuItemText}>Configurações</Text>
              </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <View style={styles.drawerFooter}>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={24} color="#E53935" />
                <Text style={styles.logoutButtonText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </RNAnimated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 0,
    width: '100%',
    backgroundColor: '#C4DEF9',
    zIndex: 10,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    alignItems: 'center',
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 60,
  },
  logo: {
    width: 140,
    height: 45,
    resizeMode: 'contain',
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  profileImageWrapper: {
    position: 'absolute',
    bottom: -70,
    zIndex: 5,
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: '#074173',
    backgroundColor: '#004894',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Drawer styles
  modalContainer: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  drawerHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
  },
  drawerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#004894',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  drawerAvatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  drawerUserName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#004894',
    marginBottom: 4,
  },
  drawerUserEmail: {
    fontSize: 14,
    color: '#666',
  },
  drawerMenu: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  menuItemText: {
    fontSize: 18,
    color: '#004894',
    marginLeft: 15,
    fontWeight: '500',
  },
  drawerFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 18,
    color: '#E53935',
    marginLeft: 15,
    fontWeight: '500',
  },
});

export default Header;



