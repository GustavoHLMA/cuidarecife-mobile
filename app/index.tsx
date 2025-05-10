import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { Image, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();

  const handleLogin = async () => {
    console.log('Login bem-sucedido');
    router.replace('/(tabs)/medicamentos');
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

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <ThemedText type="title" style={styles.loginButtonText}>
          ENTRAR COM
        </ThemedText>
        <ThemedText type="title" style={styles.loginButtonText2}>
          CONECTA RECIFE
        </ThemedText>
      </TouchableOpacity>

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
    width: 200, // Ajuste o tamanho conforme necessário
    height: 100,
    resizeMode: 'contain',
    top: -200,
  },
  textContainer: {
    alignItems: 'flex-start',
    marginBottom: 20, // Reduzido para dar espaço para a seta
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
    width: 100,
    height: 120,
    marginBottom: 70,
    position: 'absolute',
    resizeMode: 'contain',
  },
  loginButton: {
    backgroundColor: '#82BDFB',
    width: 210,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 100,
    marginLeft: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  loginButtonText: {
    color: '#074173',
    fontSize: 18,
    fontWeight: '500',
    marginBottom : -5,
  },
  loginButtonText2: {
    marginRight: 10,
    fontSize: 18,
    fontWeight: '700',
    color: '#074173',
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
