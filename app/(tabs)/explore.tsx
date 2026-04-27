import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUI } from '@/contexts/UIContext';

const Button = ({ title, onPress, imageSource }: { title: string, onPress: () => void, imageSource?: any }) => (
  <TouchableOpacity
    style={styles.button}
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }}
  >
    {imageSource ? <Image source={imageSource} style={styles.buttonImage} contentFit="contain" /> : null}
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

export default function ExploreScreen() {
  const { user, logout } = useAuth();
  const scrollY = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { showModal } = useUI();

  // ... (handlers remain same, but avoiding re-definition of Button)

  const handlePress = (link?: string) => {
    if (link) {
      Linking.openURL(link).catch((err) => console.error('Erro ao abrir link:', err));
    } else {
      showModal('Logo logo chega!', 'Ainda estamos construindo essa parte do aplicativo para você.');
    }
  };

  const handleLogout = () => {
    showModal(
      'Sair do aplicativo',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          }
        },
      ]
    );
  };



  const speakExploreScreenContent = async () => {
    if (isSpeaking) {
      Speech.stop();
      return;
    }

    let contentToSpeak = "Tela Explorar. ";
    contentToSpeak += `Olá ${user?.name || 'usuário'}, o que deseja fazer hoje? `;
    contentToSpeak += "Opções disponíveis: PRESCRIÇÃO, GLICEMIA, PRESSÃO, AJUDA. ";

    Speech.speak(contentToSpeak, {
      language: 'pt-BR',
      onStart: () => setIsSpeaking(true),
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: (error: any) => {
        console.error('Erro ao reproduzir fala na tela Explore:', error);
        setIsSpeaking(false);
        showModal("Ops, fiquei em silêncio", "Não consegui ler essa tela em voz alta para você agora.");
      },
    });
  };

  useEffect(() => {
    return () => {
      Speech.stop();
      setIsSpeaking(false);
    };
  }, []);

  const headerMaxHeight = 200;
  const profileImageOverflowHeight = 70;
  const initialContentPaddingTop = headerMaxHeight + profileImageOverflowHeight;

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        scrollY={scrollY} 
        onReadPress={speakExploreScreenContent} 
        onLogoutPress={handleLogout}
      />

      <ScrollView
        contentContainerStyle={[styles.contentContainer, { paddingTop: initialContentPaddingTop }]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <Text style={styles.greetingText}>
          Olá {user?.name ? user.name : 'usuário'}, o que deseja fazer hoje?
        </Text>

        <View style={styles.buttonRow}>
          <Button title="PRESCRIÇÃO" onPress={() => router.push('/prescricao')} imageSource={(require('@/assets/images/presc.png'))} /> 
          <Button title="PRESSÃO" onPress={() => router.push('/pressao')} imageSource={(require('@/assets/images/pressao.png'))}/> 
        </View>
        <View style={styles.buttonRow}>
          <Button title="GLICEMIA" onPress={() => router.push('/glicemia')} imageSource={(require('@/assets/images/glicemia.png'))}/> 
          <Button title="ASSISTENTE" onPress={() => router.push('/ajuda')} imageSource={require('@/assets/images/robo.png')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F6FA',
  },
  contentContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
    flexGrow: 1,
    paddingBottom: 100,
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
    width: 60,
    height: 60,
    marginBottom: 8,
  },
});
