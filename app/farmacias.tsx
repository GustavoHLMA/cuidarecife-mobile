import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Animated, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function FarmaciasScreen() {
  const router = useRouter();
  const scrollY = new Animated.Value(0);  // Valor para acompanhar o scroll

  const handleBack = () => {
    router.back(); // Voltar à tela anterior
  };

  const handleCall = (phoneNumber: string) => {
    const phoneUrl = `tel:${phoneNumber}`; // URL do protocolo tel para ligar diretamente
    Linking.openURL(phoneUrl); // Abre o aplicativo de chamadas
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          {
            transform: [{ translateY: scrollY.interpolate({ inputRange: [0, 200], outputRange: [0, -150], extrapolate: 'clamp' }) }],
          },
        ]}
      >
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#004894" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <Ionicons name="volume-high" size={34} color="#074173" />
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollView}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        <Text style={styles.title}>FARMÁCIAS PRÓXIMAS</Text>

        {/* Componentes "Levar Documento" e "Levar Receita" */}
        <View style={styles.documentButton}>
          <Text style={styles.buttonText}>LEVAR DOCUMENTO OFICIAL COM FOTO E CPF</Text>
        </View>
        <View style={[styles.documentButton, { marginBottom: 20 }]}>
          <Text style={styles.buttonText}>LEVAR RECEITA MÉDICA</Text>
        </View>

        {/* Card Farmácia 1 */}
        <View style={styles.card}>
          <Image source={require('@/assets/images/PagueMenos.png')} style={styles.image} />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Farmácia Pague Menos</Text>
            <Text style={styles.cardAddress}>Av. Recife, 868</Text>
          </View>
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => handleCall('4002-8282')} // Número específico para Pague Menos
          >
            <Ionicons name="call" size={20} color="#fff" />
            <Text style={styles.callButtonText}>LIGAR</Text>
          </TouchableOpacity>
        </View>

        {/* Card Farmácia 2 */}
        <View style={styles.card}>
          <Image source={require('@/assets/images/Independente.png')} style={styles.image} />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Farmácias Independente</Text>
            <Text style={styles.cardAddress}>Av. Caxangá, 3282</Text>
          </View>
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => handleCall('(81) 98270-8630')} // Número específico para Independente
          >
            <Ionicons name="call" size={20} color="#fff" />
            <Text style={styles.callButtonText}>LIGAR</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#82BDFB', // Cor de fundo ajustada
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 10,
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    width: 150,
    height: 60,
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center', // Alinha o texto e ícone no centro
  },
  backText: {
    color: '#004894',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 26,
  },
  title: {
    color: '#004894',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  documentButton: {
    backgroundColor: '#FFCB00',
    paddingVertical: 12,
    marginBottom: 20, // Espacamento ajustado
    borderRadius: 30, // Arredondando mais os botões
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#002867',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center', // Centralizando o texto
  },
  scrollView: {
    paddingBottom: 20, // Garantindo que a área inferior tenha espaçamento para o conteúdo
    paddingTop: 100, // Ajustando o top para dar espaço
  },
  card: {
    backgroundColor: '#074173', // Cor do card ajustada
    marginBottom: 30,
    height: 370,
    width: 420,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 300, // Diminuindo o tamanho da imagem
    height: 200,  // Ajustando a altura da imagem
    marginTop: 20,
    marginLeft: 40,
  },
  cardContent: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 30,
    marginLeft: 10,
    fontWeight: 'bold',
    color: '#fff', // Cor do texto ajustada
    textAlign: 'left', // Alinhando à esquerda
    marginVertical: 5,
  },
  cardAddress: {
    fontSize: 27,
    marginLeft: 10,
    color: '#fff', // Cor do texto ajustada
    textAlign: 'left', // Alinhando à esquerda
    marginBottom: 10,
  },
  callButton: {
    backgroundColor: '#FFCB00',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 40,
    marginBottom: 5,
    marginRight: 25,
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  callButtonText: {
    color: '#074173', // Cor do texto ajustada
    fontWeight: 'bold',
    fontSize: 27,
    marginLeft: 10, // Ajuste para o espaço entre o ícone e o texto
  },
});
