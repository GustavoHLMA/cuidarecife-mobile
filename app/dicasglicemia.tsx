import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
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
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={26} color="#004894" />
            <Text style={styles.backText}>voltar</Text>
          </TouchableOpacity>
          <Ionicons name="volume-high" size={34} color="#FFCB00" />
        </View>

        {/* Título */}
        <Text style={styles.title}>COMO MEDIR A GLICEMIA</Text>

        {/* Cartões de dicas */}
        <View style={styles.cardContainer}>
          <View style={styles.cardRow}>
            <View style={styles.card}>
              <Text style={styles.cardText}>Antes de medir a glicemia lave as mãos</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardText}>Veja se o aparelho de medição está calibrado e limpo.</Text>
            </View>
          </View>
          <View style={styles.cardRow}>
            <View style={styles.card}>
              <Text style={styles.cardText}>Não use fita de medição vencida</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardText}>Não repita a medição em um dedo que já tenha sido perfurado</Text>
            </View>
          </View>
          <View style={styles.cardRow}>
            <View style={styles.card}>
              <Text style={styles.cardText}>Não meça a glicemia após comer alimentos muito gordurosos</Text>
            </View>
            <View style={styles.card}>
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
