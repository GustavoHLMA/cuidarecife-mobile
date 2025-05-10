import { Ionicons } from '@expo/vector-icons'; // Para ícones
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

export default function DicasPressaoScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  const handleBack = () => {
    router.back(); // Função para o botão de voltar
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header com ícone de voltar */}
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={26} color="#004894" />
            <Text style={styles.backText}>voltar</Text>
          </TouchableOpacity>
          <Ionicons name="volume-high" size={34} color="#FFCB00" />
        </View>

        {/* Título da tela */}
        <Text style={styles.title}>COMO AFERIR MINHA PRESSÃO</Text>

        {/* Cartões com dicas */}
        <View style={styles.cardContainer}>
          <View style={styles.cardRow}>
            <View style={styles.card}>
              <Text style={styles.cardText}>Realize as medidas com o braço apoiado na altura do coração.</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardText}>Não fale durante a medida.</Text>
            </View>
          </View>
          <View style={styles.cardRow}>
            <View style={styles.card}>
              <Text style={styles.cardText}>Esteja em ambiente calmo e em repouso por pelo menos 5 minutos.</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardText}>Não fumar, ingerir cafeína ou qualquer outro estimulante por 30 min antes da medida.</Text>
            </View>
          </View>
          <View style={styles.cardRow}>
            <View style={styles.card}>
              <Text style={styles.cardText}>Se houver algum estresse emocional, espere se acalmar, cerca de 20 a 30 minutos.</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardText}>Em caso de estresse emocional, informe ao seu médico o que houve no dia.</Text>
            </View>
          </View>
          <View style={styles.cardRow}>
            <View style={styles.card}>
              <Text style={styles.cardText}>Utilizar um aparelho calibrado e com manutenção em dia.</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardText}>Os aparelhos oscilométricos de braço têm excelente performance e são recomendados.</Text>
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
