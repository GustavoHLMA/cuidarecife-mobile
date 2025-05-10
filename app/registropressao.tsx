import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function RegistroPressaoScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleAdd = () => {
    console.log('Pressão adicionada');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Ícone de som */}
        <View style={styles.soundIcon}>
          <Ionicons name="volume-high" size={50} color="#003164" />
        </View>

        {/* Título */}
        <Text style={styles.title}>REGISTRAR PRESSÃO</Text>

        {/* Campo Pressão */}
        <Text style={styles.label}>Pressão (mmHg)</Text>
        <TextInput
          style={styles.input}
          placeholder="Escreva aqui apenas os números ex: 120/80"
          placeholderTextColor="#666"
          multiline
          textAlignVertical="top"
        />

        {/* Campo Data */}
        <Text style={styles.label}>Data</Text>
        <TextInput
          style={styles.input}
          placeholder="ex: 08/05/2025"
          placeholderTextColor="#666"
          multiline
          textAlignVertical="top"
        />

        {/* Campo Hora */}
        <Text style={styles.label}>Hora</Text>
        <TextInput
          style={styles.input}
          placeholder="ex: 18:33"
          placeholderTextColor="#666"
          multiline
          textAlignVertical="top"
        />

        {/* Botões */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backText}>voltar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Text style={styles.addText}>adicionar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEFA', // Azul claro
  },
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 80,
  },
  soundIcon: {
    alignSelf: 'flex-end',
    marginRight: 10,
    marginTop: 10,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#003164',
    textAlign: 'center',
    marginBottom: 40,
  },
  label: {
    fontSize: 26,
    color: '#003164',
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 10,
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
    input: {
  backgroundColor: '#fff',
  borderRadius: 20,
  paddingHorizontal: 30, // aumenta a distância horizontal do texto
  paddingVertical: 20,   // aumenta a distância vertical do texto
  fontSize: 22,
  height: 120,
  width: width - 40,
  elevation: 3,
  justifyContent: 'flex-start',
  textAlignVertical: 'top', // garante que o texto fique no topo em multiline
},
  buttonRow: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  backButton: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 3,
  },
  backText: {
    color: '#003164',
    fontWeight: 'bold',
    fontSize: 24,
  },
  addButton: {
    backgroundColor: '#FFCB00',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 3,
  },
  addText: {
    color: '#003164',
    fontWeight: 'bold',
    fontSize: 24,
  },
});
