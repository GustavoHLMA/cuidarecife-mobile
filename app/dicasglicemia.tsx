import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState, useEffect } from 'react';
import * as Speech from 'expo-speech';
import {
    Animated,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function DicasGlicemiaScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => { Speech.stop(); };
  }, []);

  const speakScreenContent = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    const content = "Como medir a glicemia. Antes de medir a glicemia lave as mãos. Veja se o aparelho de medição está calibrado e limpo. Não use fita de medição vencida. Não repita a medição em um dedo que já tenha sido perfurado. Não meça a glicemia após comer alimentos muito gordurosos. Não meça logo após aplicar insulina.";
    Speech.speak(content, {
      language: 'pt-BR',
      onStart: () => setIsSpeaking(true),
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Header dentro do ScrollView */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleBack} 
            style={styles.backButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            accessibilityHint="Toca duas vezes para voltar à tela anterior"
          >
            <Ionicons name="arrow-back" size={26} color="#004894" accessible={false} importantForAccessibility="no" />
            <Text style={styles.backText} importantForAccessibility="no">voltar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={speakScreenContent}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Ouvir dicas de como medir a glicemia"
          >
            <Ionicons 
              name="volume-high" 
              size={34} color="#FFCB00" 
              accessible={false} 
              importantForAccessibility="no" 
            />
          </TouchableOpacity>
        </View>

        {/* Título */}
        <Text style={styles.title} accessible={true} accessibilityRole="header">COMO MEDIR A GLICEMIA</Text>

        {/* Cartões de dicas */}
        <View style={styles.cardContainer}>
          <View style={styles.cardRow}>
            <View style={styles.card} accessible={true}>
              <Text style={styles.cardText}>Antes de medir a glicemia lave as mãos</Text>
            </View>
            <View style={styles.card} accessible={true}>
              <Text style={styles.cardText}>Veja se o aparelho de medição está calibrado e limpo.</Text>
            </View>
          </View>
          <View style={styles.cardRow}>
            <View style={styles.card} accessible={true}>
              <Text style={styles.cardText}>Não use fita de medição vencida</Text>
            </View>
            <View style={styles.card} accessible={true}>
              <Text style={styles.cardText}>Não repita a medição em um dedo que já tenha sido perfurado</Text>
            </View>
          </View>
          <View style={styles.cardRow}>
            <View style={styles.card} accessible={true}>
              <Text style={styles.cardText}>Não meça a glicemia após comer alimentos muito gordurosos</Text>
            </View>
            <View style={styles.card} accessible={true}>
              <Text style={styles.cardText}>Não meça logo após aplicar insulina</Text>
            </View>
          </View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#074173',
    paddingTop: 40,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    backgroundColor: '#074173',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backText: {
    fontSize: 18,
    color: '#004894',
    marginLeft: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginVertical: 20,
  },
  cardContainer: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  cardText: {
    fontSize: 27,
    color: '#074173',
    fontWeight: '600',
    textAlign: 'left',
  },
});
