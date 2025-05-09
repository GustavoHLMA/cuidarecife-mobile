import { ThemedText } from '@/components/ThemedText'; // Usando os componentes do tema
import { useRouter } from 'expo-router';
import { Image, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native'; // Certificando que o View está importado corretamente

export default function LoginScreen() {
  const router = useRouter();

  const handleLogin = async () => {
    console.log('Login bem-sucedido');
    router.replace('/(tabs)/medicamentos'); // Alterado de volta para a rota específica
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo */}
      <Image
        source={require('@/assets/images/cuidarecife.png')}
        style={styles.logo}
      />

      {/* Texto de boas-vindas */}
      <View style={styles.textContainer}>
        <ThemedText type="title" style={styles.title}>BEM VINDO</ThemedText>
        <ThemedText type="title" style={styles.titleSub}>AO SEU APLICATIVO COMPANHEIRO</ThemedText>
      </View>

      {/* Botão de login */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <ThemedText type="title" style={styles.loginButtonText}>
          ENTRAR COM CONECTA RECIFE
        </ThemedText>
      </TouchableOpacity>

      {/* Ilustração Doki (não foi alterada) */}
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
    height: 60,
    resizeMode: 'contain',
    marginBottom: 70, // Aumentei o marginBottom para afastar mais da parte superior
  },
  textContainer: {
    alignItems: 'flex-start',
    marginBottom: 40,
    marginTop: 60, // Aumentei o marginTop para descer o texto
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
  loginButton: {
    backgroundColor: '#82BDFB',
    width: '100%',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  loginButtonText: {
    color: '#074173',
    fontSize: 18,
    fontWeight: '600',
  },
  dokiImage: {
    width: 500,
    height: 500,
    marginBottom: -100,
    marginTop: 140,
    marginLeft: -140,
    resizeMode: 'contain',
  },
});
