import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useUI } from '@/contexts/UIContext';

const cuidadosData = [
  {
    id: '1',
    image: require('@/assets/images/cuid2.png'),
    title: 'Atividade física',
    link: 'https://gabygraciano.github.io/conteudo-saude-acessivel/conteudo.html?id=atividade-fisica&v=2',
  },
  {
    id: '2',
    image: require('@/assets/images/cuid4.png'),
    title: 'Alimentação saudável',
    link: 'https://gabygraciano.github.io/conteudo-saude-acessivel/conteudo.html?id=alimentacao-saudavel&v=2',
  },
];

export default function CuidadosScreen() {
  const { logout } = useAuth();
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [searchTerm, setSearchTerm] = useState('');
  const { showModal } = useUI();

  const filteredData = cuidadosData.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handlePress = (link?: string) => {
    if (link) {
      router.push({ pathname: '/conteudo', params: { url: link } });
    } else {
      showModal('Ainda não temos', 'Esse material ainda está sendo preparado com muito carinho para você.');
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

  const headerMaxHeight = 200;
  const profileImageOverflowHeight = 70;
  const initialContentPaddingTop = headerMaxHeight + profileImageOverflowHeight;

  return (
    <SafeAreaView style={styles.container}>
      <Header scrollY={scrollY} onReadPress={() => { }} onLogoutPress={handleLogout} />

      <FlatList
        data={filteredData}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="always"
        ListHeaderComponent={
          <View style={[styles.searchSection, { paddingTop: initialContentPaddingTop }]}>
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
  container: { flex: 1, backgroundColor: '#F2F6FA' },
  listContainer: { paddingBottom: 20, paddingHorizontal: 10 },
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
