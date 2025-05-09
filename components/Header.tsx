import React from 'react';
import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface HeaderProps {
  scrollY: Animated.Value;
  onReadPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ scrollY, onReadPress }) => {
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

  return (
    <Animated.View style={[styles.headerContainer, { height: headerHeight }]}>
      {/* Linha superior com logo e ícone */}
      <Animated.View style={[styles.topRow, { opacity }]}>
        <Image
          source={require('@/assets/images/cuidarecife.png')}
          style={styles.logo}
        />
        <TouchableOpacity onPress={onReadPress}>
          <Icon name="volume-up" size={44} color="#074173" /> {/* ⬅️ ícone maior */}
        </TouchableOpacity>
      </Animated.View>

      {/* Imagem de perfil transbordando a base */}
      <Animated.View style={[styles.profileImageWrapper, { opacity }]}>
        <Image
          source={require('@/assets/images/hosana.png')}
          style={styles.profileImage}
        />
      </Animated.View>
    </Animated.View>
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
    width: 160,  // ⬅️ aumentada
    height: 50,
    resizeMode: 'contain',
  },
  profileImageWrapper: {
    position: 'absolute',
    bottom: -70, // 140px de altura da imagem / 2
    zIndex: 15,
  },
  profileImage: {
    width: 140,  // ⬅️ aumentada
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#074173',
    backgroundColor: '#fff',
  },
});

export default Header;
