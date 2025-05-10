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

export default function IniciarMRPAScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleSave = () => {
    console.log('MRPA salvo');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Título */}
        <Text style={styles.title}>INICIAR MRPA</Text>

        {/* Campo Data */}
        <Text style={styles.label}>Data</Text>
        <TextInput
          style={styles.input}
          placeholder="ex: 08/05/2025"
          placeholderTextColor="#666"
          multiline
          textAlignVertical="top"
        />

        {/* Campo Manhã */}
        <Text style={styles.label}>Manhã</Text>
        <TextInput
          style={styles.input}
          placeholder="ex: 120/80 mmHg"
          placeholderTextColor="#666"
          multiline
          textAlignVertical="top"
        />

        {/* Campo Tarde */}
        <Text style={styles.label}>Tarde</Text>
        <TextInput
          style={styles.input}
          placeholder="ex: 120/80 mmHg"
          placeholderTextColor="#666"
          multiline
          textAlignVertical="top"
        />

        {/* Campo Noite */}
        <Text style={styles.label}>Noite</Text>
        <TextInput
          style={styles.input}
          placeholder="ex: 120/80 mmHg"
          placeholderTextColor="#666"
          multiline
          textAlignVertical="top"
        />

        {/* Botões */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backText}>voltar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveText}>SALVAR</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEFA', // azul claro
  },
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#003164',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  label: {
    fontSize: 20,
    color: '#003164',
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 30,
    paddingVertical: 20,
    fontSize: 20,
    height: 100,
    width: width - 40,
    elevation: 3,
    textAlignVertical: 'top',
  },
  buttonRow: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  backButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 3,
  },
  backText: {
    color: '#003164',
    fontWeight: 'bold',
    fontSize: 20,
  },
  saveButton: {
    backgroundColor: '#FFCB00',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 3,
  },
  saveText: {
    color: '#003164',
    fontWeight: 'bold',
    fontSize: 20,
  },
});
