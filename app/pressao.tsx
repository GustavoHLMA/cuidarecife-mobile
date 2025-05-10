import Header from '@/components/Header'; // Importe o seu componente Header
import { Ionicons } from '@expo/vector-icons'; // Para usar os ícones
import { useRouter } from 'expo-router'; // Importando o hook useRouter para navegação
import { useRef } from 'react';
import {
  Animated,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function PressaoScreen() {
  const router = useRouter(); // Inicializa o hook de navegação
  const scrollY = useRef(new Animated.Value(0)).current;  // Controla a animação do header

  // Função para os botões
const handleButtonPress = (action: string) => {
  console.log(`${action} pressionado`);
  if (action === 'Registrar Pressão') {
    router.push('/registropressao');
  } else if (action === 'Iniciar MRPA') {
    router.push('/iniciarmrpa'); // 👈 Esta é a linha que foi adicionada
  } else if (action === 'Como aferir') {
    router.push('/dicaspressao');
  }
  // Outras ações podem ser adicionadas conforme necessário
};

  return (
    <SafeAreaView style={styles.container}>
      {/* Header animado */}
      <Header scrollY={scrollY} onReadPress={() => {}} />

      {/* Título da tela */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Acompanhamento de Pressão</Text>
        <Text style={styles.subtitle}>Controle sua pressão arterial</Text>
      </View>

      {/* Botões */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleButtonPress('Registrar Pressão')}
        >
          <Ionicons name="add" size={32} color="#fff" />
          <Text style={styles.buttonText}>REGISTRAR PRESSÃO</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => handleButtonPress('Iniciar MRPA')}
        >
          <Ionicons name="play" size={32} color="#fff" />
          <Text style={styles.buttonText}>INICIAR MRPA</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => handleButtonPress('Como aferir')}
        >
          <Ionicons name="information-circle" size={32} color="#fff" />
          <Text style={styles.buttonText}>COMO AFERIR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => handleButtonPress('Baixar Histórico')}
        >
          <Ionicons name="download" size={32} color="#fff" />
          <Text style={styles.buttonText}>BAIXAR HISTÓRICO</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#003164',
  },
  subtitle: {
    fontSize: 18,
    color: '#003164',
    marginTop: 10,
  },
  buttonContainer: {
    marginTop: 150,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 20,
    marginBottom: 15,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 24,
    marginLeft: 15,
  },
});
