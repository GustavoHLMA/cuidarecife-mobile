import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login?mode=login');
  };

  const handleCadastro = () => {
    router.push('/login?mode=register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('@/assets/images/cuidarecife.png')}
        style={styles.logo}
      />

      <View style={styles.textContainer}>
        <ThemedText type="title" style={styles.title}>BEM VINDO AO</ThemedText>
        <ThemedText type="title" style={styles.titleSub}>SEU APLICATIVO COMPANHEIRO</ThemedText>
      </View>

      <Image
        source={require('@/assets/images/arrow.png')}
        style={styles.arrowImage}
      />

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <ThemedText type="title" style={styles.loginButtonText}>
            ENTRAR
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cadastroButton} onPress={handleCadastro}>
          <ThemedText type="title" style={styles.cadastroButtonText}>
            CADASTRAR
          </ThemedText>
        </TouchableOpacity>
      </View>

      <Image
        source={require('@/assets/images/Doki1.png')}
        style={styles.dokiImage}
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
    resizeMode: 'contain',
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
    resizeMode: 'contain',
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
  cadastroButton: {
    backgroundColor: '#82BDFB',
    width: 220,
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cadastroButtonText: {
    color: '#004894',
    fontSize: 20,
    fontWeight: '700',
  },
  dokiImage: {
    width: 500,
    height: 500,
    marginBottom: -400,
    marginTop: 140,
    marginLeft: -200,
    resizeMode: 'contain',
    position: 'absolute',
  },
});

