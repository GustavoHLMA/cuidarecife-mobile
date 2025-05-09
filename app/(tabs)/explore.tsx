import Header from '@/components/Header';
import { useRouter } from 'expo-router'; // Importando o hook useRouter para navegação
import { useRef } from 'react';
import {
  Alert,
  Animated,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ExploreScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const router = useRouter(); // Inicializando o hook do router

  const handlePress = (link?: string) => {
    if (link) {
      Linking.openURL(link).catch((err) => console.error('Erro ao abrir link:', err));
    } else {
      Alert.alert('Funcionalidade ainda não implementada.');
    }
  };

  const Button = ({ title, onPress }: { title: string, onPress: () => void }) => (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress} // Alterando para o onPress passar a navegação
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header scrollY={scrollY} onReadPress={() => {}} />

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Contagem regressiva */}
        <Text style={styles.countdownText}>FALTAM 25 DIAS</Text>
        <Text style={styles.subText}>PARA SUA CONSULTA</Text>

        <View style={styles.separator} />

        {/* Olá Hosana em negrito */}
        <Text style={styles.greetingText}>Olá Hosana, o que deseja fazer hoje?</Text>

        {/* Botões */}
        <View style={styles.buttonRow}>
          <Button title="CADASTRO" onPress={() => handlePress()} />
          <Button title="PRESCRIÇÃO" onPress={() => router.push('/prescricao')} /> {/* Navegação para a tela Prescrição */}
        </View>
        <View style={styles.buttonRow}>
          <Button title="PRESSÃO" onPress={() => handlePress()} />
          <Button title="GLICEMIA" onPress={() => handlePress()} />
        </View>
        <View style={styles.singleButtonRow}>
          <Button title="AJUDA" onPress={() => handlePress()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingTop: 100, // Afastando do Header para mostrar contagem
    flexGrow: 1,
    paddingBottom: 100, // Garantindo que o scroll vai até o final
  },
  countdownText: {
    fontSize: 40,
    color: '#2196F3',
    fontWeight: 'bold',
    marginTop: 150, // Menos espaço acima
    zIndex: 10,
    textAlign: 'center',
  },
  subText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#003164',
    marginTop: 2,
    textAlign: 'center',
  },
  separator: {
    borderBottomColor: '#000000',
    borderBottomWidth: 1,
    opacity: 0.26,
    width: '100%',
    marginVertical: 30,
  },
  greetingText: {
    fontSize: 26,
    color: '#004894',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold', // Texto em negrito
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center', // Centraliza os botões
    gap: 20, // Espaço entre os botões
    width: '100%',
    marginBottom: 12,
  },
  singleButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center', // Centraliza o botão de AJUDA
    width: '100%',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#82BDFB',
    width: 160, // Ajustado para um tamanho mais proporcional
    height: 160,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: '#074173',
    fontSize: 22, // Ajustado para tamanho mais confortável
    fontWeight: '600',
    textAlign: 'center',
  },
});