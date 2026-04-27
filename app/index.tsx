import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login?mode=login');
  };



  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('@/assets/images/cuidarecife.png')}
        style={styles.logo}
        contentFit="contain"
        accessible={true}
        accessibilityRole="image"
        accessibilityLabel="Logomarca do Cuida Recife"
      />

      <View 
        style={styles.textContainer}
        accessible={true}
        accessibilityRole="header"
        accessibilityLabel="Bem vindo ao seu aplicativo companheiro"
      >
        <ThemedText type="title" style={styles.title} importantForAccessibility="no">BEM VINDO AO</ThemedText>
        <ThemedText type="title" style={styles.titleSub} importantForAccessibility="no">SEU APLICATIVO COMPANHEIRO</ThemedText>
      </View>

      <Image
        source={require('@/assets/images/arrow.png')}
        style={styles.arrowImage}
        contentFit="contain"
        accessible={false}
        importantForAccessibility="no"
      />

      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Entrar"
          accessibilityHint="Toca duas vezes para ir para a tela de Login"
        >
          <ThemedText type="title" style={styles.loginButtonText} importantForAccessibility="no">
            ENTRAR
          </ThemedText>
        </TouchableOpacity>

      </View>

      <Image
        source={require('@/assets/images/Doki1.png')}
        style={styles.dokiImage}
        contentFit="contain"
        accessible={true}
        accessibilityRole="image"
        accessibilityLabel="Mascote do Cuida Recife dando boas vindas"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  logo: {
    width: 200,
    height: 100,
    top: -150,
  },
  textContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
    marginLeft: 30,
    top: -120,
  },
  title: {
    fontSize: 32,
    fontWeight: 'normal',
    color: '#004894',
  },
  titleSub: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#004894',
  },
  arrowImage: {
    width: 50,
    height: 120,
    marginBottom: 70,
    position: 'absolute',
  },
  buttonsContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginLeft: 130,
    zIndex: 10,
  },
  loginButton: {
    backgroundColor: '#004894',
    width: 220,
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  dokiImage: {
    width: 500,
    height: 500,
    marginBottom: -400,
    marginTop: 140,
    marginLeft: -200,
    position: 'absolute',
  },
});

