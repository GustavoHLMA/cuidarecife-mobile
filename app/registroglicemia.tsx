import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import * as Speech from 'expo-speech';
import {
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
import { useUI } from '@/contexts/UIContext';

const { width } = Dimensions.get('window');

export default function RegistroGlicemiaScreen() {
  const router = useRouter();
  const [glicemia, setGlicemia] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [antesRefeicao, setAntesRefeicao] = useState(false);
  const [aposRefeicao, setAposRefeicao] = useState(false);
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

    const content = "Registrar Glicemia. Campos disponíveis: Glicemia em mg/dL. Data. Hora. Contexto da refeição: Antes da refeição ou Após a refeição. Preencha os campos e toque em adicionar.";
    Speech.speak(content, {
      language: 'pt-BR',
      onStart: () => setIsSpeaking(true),
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleAdd = async () => {
    if (!glicemia.trim()) {
      showToast('Esqueceu de anotar o valor da glicemia?', 'error');
      return;
    }

    const value = parseInt(glicemia, 10);
    if (isNaN(value) || value <= 0) {
      showToast('Hmm, esse valor da glicemia parece estranho. Pode conferir?', 'error');
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
      showModal('Muito bem! 👍', 'Sua glicemia de hoje foi anotada.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } else {
      showModal('Ops!', result.error || 'Não conseguimos guardar sua glicemia agora. Pode tentar de novo?');
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
        <Text style={styles.title} accessible={true} accessibilityRole="header">REGISTRAR GLICEMIA</Text>

        {/* Campo Glicemia */}
        <Text style={styles.label} importantForAccessibility="no">Glicemia (mg/dL)</Text>
        <TextInput
          style={styles.input}
          placeholder="Escreva aqui apenas os números ex: 120"
          placeholderTextColor="#666"
          keyboardType="numeric"
          value={glicemia}
          onChangeText={setGlicemia}
          accessible={true}
          accessibilityLabel="Campo de Glicemia em miligramas por decilitro."
          accessibilityHint="Digite o valor numérico aferido."
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

        {/* Marcar Refeição */}
        <Text style={styles.label} accessible={true} accessibilityRole="header">CONTEXTO DA REFEIÇÃO</Text>

        <View style={styles.checkboxRow}>
          <Pressable 
            onPress={() => { setAntesRefeicao(!antesRefeicao); setAposRefeicao(false); }} 
            style={styles.checkbox}
            accessible={true}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: antesRefeicao }}
            accessibilityLabel="Antes da refeição"
          >
            {antesRefeicao ? <View style={styles.checkboxChecked} /> : null}
          </Pressable>
          <Text style={styles.checkboxLabel} importantForAccessibility="no">Antes da refeição</Text>
        </View>

        <View style={styles.checkboxRow}>
          <Pressable 
            onPress={() => { setAposRefeicao(!aposRefeicao); setAntesRefeicao(false); }} 
            style={styles.checkbox}
            accessible={true}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: aposRefeicao }}
            accessibilityLabel="Após a refeição"
          >
            {aposRefeicao ? <View style={styles.checkboxChecked} /> : null}
          </Pressable>
          <Text style={styles.checkboxLabel} importantForAccessibility="no">Após a refeição</Text>
        </View>

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
            accessibilityLabel="Salvar medição de glicemia"
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
