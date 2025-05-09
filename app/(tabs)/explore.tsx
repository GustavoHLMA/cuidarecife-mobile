import Header from '@/components/Header';
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

  const handlePress = (link?: string) => {
    if (link) {
      Linking.openURL(link).catch((err) => console.error('Erro ao abrir link:', err));
    } else {
      Alert.alert('Funcionalidade ainda não implementada.');
    }
  };

  const Button = ({ title }: { title: string }) => (
    <TouchableOpacity
      style={styles.button}
      onPress={() => handlePress()}
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
        <Text style={styles.countdownText}>FALTAM 25 DIAS</Text>
        <Text style={styles.subText}>PARA SUA CONSULTA</Text>

        <View style={styles.separator} />

        <Text style={styles.greetingText}>Olá Hosana, o que deseja fazer hoje?</Text>

        <View style={styles.buttonRow}>
          <Button title="CADASTRO" />
          <Button title="PRESCRIÇÃO" />
        </View>
        <View style={styles.buttonRow}>
          <Button title="PRESSÃO" />
          <Button title="GLICEMIA" />
        </View>
        <View style={styles.singleButtonRow}>
          <Button title="AJUDA" />
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
    paddingTop: 100, // 🔧 antes 120 - afasta do Header para mostrar contagem
    flexGrow: 1,
    paddingBottom: 100, // já resolvia o scroll
  },
  countdownText: {
    fontSize: 40,
    color: '#2196F3',
    fontWeight: 'bold',
    marginTop: 130, // 🔧 antes 50 - menos espaço acima
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
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12, // 🔧 antes 20 — menos espaço entre linhas
    gap: 12, // opcional — espaço entre os botões (RN 0.71+)
  },
  singleButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center', // 🔧 Centraliza os botões
    gap: 20, // 🔧 Espaço entre os botões (React Native 0.71+)
    width: '100%',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#82BDFB',
    width: 170, // 🔧 Largura reduzida para facilitar centralização
    height: 170,
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
    fontSize: 25,
    fontWeight: '600',
    textAlign: 'center',
  },
});