import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Dimensions,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import { api } from '../services/api';

const { width } = Dimensions.get('window');

export default function RegistroGlicemiaScreen() {
  const router = useRouter();
  const [glicemia, setGlicemia] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [antesRefeicao, setAntesRefeicao] = useState(false);
  const [aposRefeicao, setAposRefeicao] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleAdd = async () => {
    if (!glicemia.trim()) {
      Alert.alert('Erro', 'Por favor, informe o valor da glicemia.');
      return;
    }

    const value = parseInt(glicemia, 10);
    if (isNaN(value) || value <= 0) {
      Alert.alert('Erro', 'Valor de glicemia inválido.');
      return;
    }

    // Parse date and time
    let measuredAt: Date;
    try {
      const [day, month, year] = (data || new Date().toLocaleDateString('pt-BR')).split('/');
      const [hours, minutes] = (hora || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })).split(':');
      measuredAt = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
    } catch {
      measuredAt = new Date();
    }

    let mealContext: 'before' | 'after' | null = null;
    if (antesRefeicao) mealContext = 'before';
    else if (aposRefeicao) mealContext = 'after';

    setIsLoading(true);
    const result = await api.saveGlucoseReading({
      value,
      measuredAt: measuredAt.toISOString(),
      mealContext,
    });
    setIsLoading(false);

    if (result.data) {
      Alert.alert('Sucesso', 'Glicemia registrada com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } else {
      Alert.alert('Erro', result.error || 'Não foi possível salvar a glicemia.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Ícone de som */}
        <View style={styles.soundIcon}>
          <Ionicons name="volume-high" size={50} color="#003164" />
        </View>

        {/* Título */}
        <Text style={styles.title}>REGISTRAR GLICEMIA</Text>

        {/* Campo Glicemia */}
        <Text style={styles.label}>Glicemia (mg/dL)</Text>
        <TextInput
          style={styles.input}
          placeholder="Escreva aqui apenas os números ex: 120"
          placeholderTextColor="#666"
          keyboardType="numeric"
          value={glicemia}
          onChangeText={setGlicemia}
        />

        {/* Campo Data */}
        <Text style={styles.label}>Data</Text>
        <TextInput
          style={styles.input}
          placeholder={new Date().toLocaleDateString('pt-BR')}
          placeholderTextColor="#666"
          value={data}
          onChangeText={setData}
        />

        {/* Campo Hora */}
        <Text style={styles.label}>Hora</Text>
        <TextInput
          style={styles.input}
          placeholder={new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          placeholderTextColor="#666"
          value={hora}
          onChangeText={setHora}
        />

        {/* Marcar Refeição */}
        <Text style={styles.label}>MARQUE AQUI</Text>

        <View style={styles.checkboxRow}>
          <Pressable onPress={() => { setAntesRefeicao(!antesRefeicao); setAposRefeicao(false); }} style={styles.checkbox}>
            {antesRefeicao ? <View style={styles.checkboxChecked} /> : null}
          </Pressable>
          <Text style={styles.checkboxLabel}>Antes da refeição</Text>
        </View>

        <View style={styles.checkboxRow}>
          <Pressable onPress={() => { setAposRefeicao(!aposRefeicao); setAntesRefeicao(false); }} style={styles.checkbox}>
            {aposRefeicao ? <View style={styles.checkboxChecked} /> : null}
          </Pressable>
          <Text style={styles.checkboxLabel}>Após a refeição</Text>
        </View>

        {/* Botões */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backText}>voltar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.addButton, isLoading ? { opacity: 0.7 } : null]} 
            onPress={handleAdd}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#003164" />
            ) : (
              <Text style={styles.addText}>adicionar</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEFA',
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
    paddingHorizontal: 30,
    paddingVertical: 20,
    fontSize: 22,
    height: 120,
    width: width - 40,
    elevation: 3,
    justifyContent: 'flex-start',
    textAlignVertical: 'top',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginLeft: 10,
    marginTop: 10,
  },
  checkbox: {
    width: 32,
    height: 32,
    backgroundColor: '#fff',
    borderRadius: 6,
    marginRight: 15,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    width: 16,
    height: 16,
    backgroundColor: '#003164',
    borderRadius: 3,
  },
  checkboxLabel: {
    fontSize: 27,
    color: '#003164',
    fontWeight: '500',
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
