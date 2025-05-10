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
    paddingTop: 40, // Mantido para o header
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top: 0, // Ancorado no topo
    left: 0, // Ancorado na esquerda
    right: 0, // Ancorado na direita para ocupar toda a largura
    zIndex: 10,
    paddingHorizontal: 16, // Padding horizontal para o conteúdo do header
    paddingTop: 40, // Padding superior para o conteúdo do header
    // backgroundColor: 'rgba(130, 189, 251, 0.8)', // Opcional: para ver a área do header
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    width: 150, // Mantido
    height: 60, // Mantido
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 20, // Ajustado para centralizar melhor com a fonte menor
    justifyContent: 'center',
  },
  backText: {
    color: '#004894',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 22, // Reduzido
  },
  title: {
    color: '#004894',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20, // Mantido de marginVertical
    marginBottom: 30, // Aumentado para mais espaço
  },
  documentButton: {
    backgroundColor: '#FFCB00',
    paddingVertical: 15, // Aumentado um pouco para mais destaque
    marginBottom: 15, // Ajustado
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: '5%', // Adicionado para não colar nas bordas
    width: '90%', // Para garantir que o marginHorizontal funcione como esperado
    alignSelf: 'center',
  },
  buttonText: {
    color: '#002867',
    fontWeight: 'bold',
    fontSize: 17, // Levemente reduzido para caber melhor com padding
    textAlign: 'center',
  },
  scrollView: {
    paddingBottom: 20,
    paddingTop: 100, // Mantido para compensar o header fixo/animado
    // paddingHorizontal: 5, // Removido, o container já tem paddingHorizontal: 16
  },
  card: {
    backgroundColor: '#074173',
    marginBottom: 30,
    // height: 370, // Altura pode ser dinâmica ou minHeight
    minHeight: 370, // Usar minHeight para garantir espaço mínimo
    width: '100%', // Para ocupar a largura do container (respeitando o padding do container)
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: 'center', // Garante que o card se centralize se o width for menor que o pai
  },
  image: {
    width: '90%', // Relativo ao card
    height: 200,
    marginTop: 20,
    alignSelf: 'center', // Centraliza a imagem
    // marginLeft: 40, // Removido
  },
  cardContent: {
    padding: 15, // Padding geral para o conteúdo textual
  },
  cardTitle: {
    fontSize: 28, // Levemente ajustado
    // marginLeft: 10, // Removido, padding do cardContent cuida disso
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'left',
    marginBottom: 5, // Ajustado de marginVertical
  },
  cardAddress: {
    fontSize: 25, // Levemente ajustado
    // marginLeft: 10, // Removido
    color: '#fff',
    textAlign: 'left',
    marginBottom: 10,
  },
  callButton: {
    backgroundColor: '#FFCB00',
    paddingVertical: 10,
    paddingHorizontal: 15, // Ajustado
    borderRadius: 40,
    // marginBottom: 5, // Posição absoluta não precisa de margin bottom assim
    // marginRight: 25, // Posição absoluta não precisa de margin right assim
    position: 'absolute',
    bottom: 15, // Ajustado para mais respiro
    right: 15,  // Ajustado para mais respiro
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  callButtonText: {
    color: '#074173',
    fontWeight: 'bold',
    fontSize: 22, // Reduzido
    marginLeft: 10,
  },
});
