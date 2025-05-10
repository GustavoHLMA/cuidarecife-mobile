import Header from '@/components/Header';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech'; // ADICIONADO
import { useEffect, useRef, useState } from 'react'; // ADICIONADO useState, useEffect
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
  const router = useRouter();
  const [isSpeaking, setIsSpeaking] = useState(false); // ADICIONADO

  const handlePress = (link?: string) => {
    if (link) {
      Linking.openURL(link).catch((err) => console.error('Erro ao abrir link:', err));
    } else {
      Alert.alert('Funcionalidade ainda não implementada.');
    }
  };

  const Button = ({ title, onPress, imageSource }: { title: string, onPress: () => void, imageSource?: any }) => (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
    >
      {imageSource && <Image source={imageSource} style={styles.buttonImage} contentFit="contain" />}
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  const speakExploreScreenContent = async () => { // ADICIONADA FUNÇÃO
    if (isSpeaking) {
      Speech.stop();
      return;
    }

    // Conteúdo específico da tela Explore
    // Você pode tornar isso mais dinâmico buscando os textos dos componentes se necessário
    let contentToSpeak = "Tela Explorar. ";
    contentToSpeak += "FALTAM 25 DIAS PARA SUA CONSULTA. "; // Exemplo, idealmente viria de uma variável
    contentToSpeak += `Olá Hosana, o que deseja fazer hoje? `; // Assumindo que 'user' está acessível ou você pode definir um nome padrão
    contentToSpeak += "Opções disponíveis: CADASTRO, PRESCRIÇÃO, GLICEMIA, PRESSÃO, AJUDA. ";

    Speech.speak(contentToSpeak, {
      language: 'pt-BR',
      onStart: () => setIsSpeaking(true),
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: (error) => {
        console.error('Erro ao reproduzir fala na tela Explore:', error);
        setIsSpeaking(false);
        Alert.alert("Erro na Leitura", "Não foi possível ler o conteúdo da tela.");
      },
    });
  };

  useEffect(() => { // ADICIONADO useEffect para cleanup
    return () => {
      Speech.stop();
      setIsSpeaking(false);
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header scrollY={scrollY} onReadPress={speakExploreScreenContent} /> {/* MODIFICADO */}

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
          <Button title="PRESSÃO" onPress={() => router.push('/pressao')} /> {/* Navegação para a tela Pressão */}
          <Button title="GLICEMIA" onPress={() => router.push('/glicemia')} /> {/* Navegação para a tela Glicemia */}
        </View>
        <View style={styles.singleButtonRow}>
          <Button title="AJUDA" onPress={() => router.push('/ajuda')} imageSource={require('@/assets/images/robo.png')} />
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
    padding: 10, // Adicionar padding para acomodar a imagem e o texto
  },
  buttonText: {
    color: '#074173',
    fontSize: 22, // Ajustado para tamanho mais confortável
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 5, // Adicionar margem se a imagem estiver presente
  },
  buttonImage: {
    width: 60, // Ajuste o tamanho da imagem conforme necessário
    height: 60, // Ajuste o tamanho da imagem conforme necessário
    marginBottom: 8, // Espaço entre a imagem e o texto
  },
});
