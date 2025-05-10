import Header from '@/components/Header';
import { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Image,
  Linking,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const cuidadosData = [
  {
    id: '1',
    image: require('@/assets/images/cuid1.png'),
    title: 'Dicas e cuidados com os pés diabéticos',
    link: 'https://www.iamspe.sp.gov.br/wp-content/uploads/2017/01/cartilha-pe-diabetico.pdf',
  },
  {
    id: '2',
    image: require('@/assets/images/cuid2.png'),
    title: 'Exercícios para fazer em casa e mudar sua vida',
  },
  {
    id: '3',
    image: require('@/assets/images/cuid3.png'),
    title: 'Dicas de receitas com baixo teor de sódio',
  },
  {
    id: '4',
    image: require('@/assets/images/cuid4.png'),
    title: 'Dieta fácil com baixo teor de açúcar',
  },
  {
    id: '5',
    image: require('@/assets/images/cuid5.png'),
    title: 'Cuidados com a hipoglicemia',
  },
];

export default function CuidadosScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = cuidadosData.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePress = (link?: string) => {
    if (link) {
      Linking.openURL(link).catch((err) => console.error('Erro ao abrir link:', err));
    } else {
      Alert.alert('Conteúdo indisponível', 'Este conteúdo ainda está sendo preparado.');
    }
  };

  const renderCard = ({ item }: any) => (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <Image source={item.image} style={styles.cardImage} />
        <Text style={styles.cardText}>{item.title}</Text>
        <TouchableOpacity
          style={styles.readMoreButton}
          onPress={() => handlePress(item.link)}
        >
          <Text style={styles.readMoreText}>LEIA AQUI</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header scrollY={scrollY} onReadPress={() => {}} />

      <FlatList
        data={filteredData}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="always"
        ListHeaderComponent={
          <View style={styles.searchSection}>
            <View style={{ height: 300 }} />
            <Text style={styles.searchTitle}>O QUE VOCÊ PROCURA?</Text>
            <View style={styles.searchInputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Digite aqui"
                placeholderTextColor="#004894"
                value={searchTerm}
                onChangeText={setSearchTerm}
                returnKeyType="search"
              />
              <Icon name="keyboard-voice" size={30} color="#074173" />
            </View>
          </View>
        }
        ListFooterComponent={<View style={{ height: 60 }} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Conteúdo não encontrado.</Text>
        }
        contentContainerStyle={styles.listContainer}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  listContainer: { paddingBottom: 20, paddingHorizontal: 10, marginTop: -40 },
  searchSection: { paddingHorizontal: 20, alignItems: 'center' },
  searchTitle: { fontSize: 28, fontWeight: 'bold', color: '#004894', marginBottom: 20 },
  searchInputWrapper: {
    width: '100%',
    height: 70,
    borderRadius: 35,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#BDD6F0',
    marginBottom: 32,
  },
  input: { flex: 1, fontSize: 22, color: '#004894', marginRight: 12 },
  emptyText: { fontSize: 20, color: '#004894', textAlign: 'center', marginTop: 40 },
  cardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  card: {
    width: 350,
    height: 350,
    flexShrink: 0,
    borderRadius: 10,
    backgroundColor: '#2196F3',
    marginBottom: 15,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardText: {
    color: '#FFF',
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 30,
    marginBottom: 10,
  },
  readMoreButton: {
    backgroundColor: '#FFCD00',
    borderRadius: 40,
    paddingVertical: 12,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  readMoreText: {
    color: '#0E5AA6',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
});
