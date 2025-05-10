import Header from '@/components/Header';
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

export default function GlicemiaScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Header scrollY={scrollY} onReadPress={() => {}} />

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Acompanhamento de Glicemia</Text>
        <Text style={styles.subtitle}>Controle sua glicemia</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/registroglicemia')} // ✅ Direciona para a tela correta
        >
          <Ionicons name="add" size={32} color="#fff" />
          <Text style={styles.buttonText}>REGISTRAR GLICEMIA</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/dicasglicemia')}
        >
          <Ionicons name="information-circle" size={32} color="#fff" />
          <Text style={styles.buttonText}>COMO MEDIR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => console.log('Baixar Histórico pressionado')}
        >
          <Ionicons name="download" size={32} color="#fff" />
          <Text style={styles.buttonText}>BAIXAR HISTÓRICO</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#003164',
  },
  subtitle: {
    fontSize: 18,
    color: '#003164',
    marginTop: 10,
  },
  buttonContainer: {
    marginTop: 150,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 20,
    marginBottom: 15,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 24,
    marginLeft: 15,
  },
});
