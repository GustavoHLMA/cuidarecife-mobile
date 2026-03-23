import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import * as Speech from 'expo-speech';
import {
    Dimensions,
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
import { useUI } from '@/contexts/UIContext';

const { width } = Dimensions.get('window');

export default function RegistroPressaoScreen() {
  const router = useRouter();
  const [pressao, setPressao] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showToast, showModal } = useUI();

  const handleBack = () => {
    router.back();
  };

  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => { Speech.stop(); };
  }, []);

  const speakScreenContent = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    const content = "Registrar Pressão. Campos disponíveis: Pressão em mmHg, no formato números, barra e números, exemplo 120 barra 80. Data e Hora. Preencha os campos e toque em adicionar.";
    Speech.speak(content, {
      language: 'pt-BR',
      onStart: () => setIsSpeaking(true),
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleAdd = async () => {
    if (!pressao.trim()) {
      showToast('Esqueceu de anotar o valor da pressão?', 'error');
      return;
    }

    // Parse pressure format: "120/80"
    const parts = pressao.split('/');
    if (parts.length !== 2) {
      showToast('Opa, o formato precisa ser igual a esse: 120/80', 'error');
      return;
    }

    const systolic = parseInt(parts[0].trim(), 10);
    const diastolic = parseInt(parts[1].trim(), 10);

    if (isNaN(systolic) || isNaN(diastolic) || systolic <= 0 || diastolic <= 0) {
      showToast('Hmm, esses valores de pressão parecem estranhos. Pode dar uma olhadinha?', 'error');
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

    setIsLoading(true);
    const result = await api.savePressureReading({
      systolic,
      diastolic,
      measuredAt: measuredAt.toISOString(),
    });
    setIsLoading(false);

    if (result.data) {
      showModal('Muito bem! 👍', 'Sua pressão de hoje foi anotada.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } else {
      showModal('Ops!', result.error || 'Não conseguimos guardar sua pressão agora. Pode tentar de novo?');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Ícone de som */}
        <TouchableOpacity 
          style={styles.soundIcon}
          onPress={speakScreenContent}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Ouvir instruções da tela"
        >
          <Ionicons name="volume-high" size={50} color="#003164" accessible={false} importantForAccessibility="no" />
        </TouchableOpacity>

        {/* Título */}
        <Text style={styles.title} accessible={true} accessibilityRole="header">REGISTRAR PRESSÃO</Text>

        {/* Campo Pressão */}
        <Text style={styles.label} importantForAccessibility="no">Pressão (mmHg)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 120/80"
          placeholderTextColor="#666"
          value={pressao}
          onChangeText={setPressao}
          accessible={true}
          accessibilityLabel="Campo de Pressão em milímetros de mercúrio"
          accessibilityHint="Digite sua pressão no formato número, barra e número. Exemplo: 120 barra 80"
        />

        {/* Campo Data */}
        <Text style={styles.label} importantForAccessibility="no">Data</Text>
        <TextInput
          style={styles.input}
          placeholder={new Date().toLocaleDateString('pt-BR')}
          placeholderTextColor="#666"
          value={data}
          onChangeText={setData}
          accessible={true}
          accessibilityLabel="Campo de Data da medição"
          accessibilityHint="Digite a data em que essa pressão foi aferida"
        />

        {/* Campo Hora */}
        <Text style={styles.label} importantForAccessibility="no">Hora</Text>
        <TextInput
          style={styles.input}
          placeholder={new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          placeholderTextColor="#666"
          value={hora}
          onChangeText={setHora}
          accessible={true}
          accessibilityLabel="Campo de Hora da medição"
        />

        {/* Botões */}
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            accessibilityHint="Toca duas vezes para voltar à tela anterior"
          >
            <Text style={styles.backText} importantForAccessibility="no">voltar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.addButton, isLoading ? { opacity: 0.7 } : null]} 
            onPress={handleAdd}
            disabled={isLoading}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Salvar medição"
            accessibilityState={{ disabled: isLoading }}
          >
            {isLoading ? (
              <ActivityIndicator color="#003164" />
            ) : (
              <Text style={styles.addText} importantForAccessibility="no">adicionar</Text>
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
