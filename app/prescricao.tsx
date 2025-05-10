import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function PrescricaoScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false); // NOVO: Estado para o loading da verificação

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [140, 0],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const headerTranslateY = headerHeight.interpolate({
    inputRange: [0, 140],
    outputRange: [-140, 0],
  });

  // Função para navegação até a tela de farmácias
  const navigateToFarmacias = () => {
    router.push('/farmacias'); // Isso irá direcionar para o arquivo farmacias.tsx
  };

  const speakPrescricaoScreenContent = async () => {
    if (isSpeaking) {
      Speech.stop();
      return;
    }

    let contentToSpeak = "Tela de Prescrições. ";
    contentToSpeak += "Hosana, você deve voltar no médico em 25 dias. ";
    contentToSpeak += "Minhas Prescrições: ";

    data.forEach(med => {
      contentToSpeak += `${med.nome}. Como tomar: `;
      med.horarios.forEach(h => {
        contentToSpeak += `${h}. `;
      });
      contentToSpeak += "Você pode pegar esse medicamento de graça. ";
    });

    Speech.speak(contentToSpeak, {
      language: 'pt-BR',
      onStart: () => setIsSpeaking(true),
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: (error) => {
        console.error('Erro ao reproduzir fala na tela Prescrição:', error);
        setIsSpeaking(false);
        Alert.alert("Erro na Leitura", "Não foi possível ler o conteúdo da tela.");
      },
    });
  };

  useEffect(() => {
    return () => {
      Speech.stop();
      setIsSpeaking(false);
    };
  }, []);

  // NOVO: Função para verificar a prescrição com a IA
  const handleVerifyPrescription = async () => {
    if (isVerifying) return;
    setIsVerifying(true);

    const API_BASE_URL = 'https://cuidarecife-api.onrender.com'; // Use a URL base da sua API
    const VERIFY_ENDPOINT = `${API_BASE_URL}/prescription/verify`; // CORRIGIDO: Adicionado /api

    // Coleta os dados da prescrição para enviar
    const prescriptionData = {
      patientName: "Hosana", // Pode ser dinâmico se tiver essa informação
      returnInDays: 25,    // Pode ser dinâmico
      medications: data.map(med => ({
        name: med.nome,
        instructions: med.horarios.join('; ') // Junta os horários em uma string
      }))
    };

    try {
      Alert.alert("Verificando...", "Enviando prescrição para análise pela IA. Isso pode levar alguns segundos.");

      const response = await fetch(VERIFY_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prescriptionData),
      });

      const responseData = await response.json();

      if (response.ok) {
        Alert.alert("Resultado da Verificação", responseData.analysisResult || "Não foi possível obter um resultado claro.");
      } else {
        Alert.alert("Erro na Verificação", responseData.message || `Erro ${response.status} ao contatar o servidor.`);
      }
    } catch (error: any) {
      console.error('Erro ao verificar prescrição:', error);
      Alert.alert("Erro", "Não foi possível conectar ao serviço de verificação. Verifique sua conexão ou tente mais tarde.");
    }
    setIsVerifying(false);
  };

  return (
    <View style={styles.container}>
      {/* Header animado */}
      <Animated.View style={[styles.header, {
        opacity: headerOpacity,
        transform: [{ translateY: headerTranslateY }]
      }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#004894" />
            <Text style={styles.backText}>voltar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={speakPrescricaoScreenContent}>
            <Ionicons name={isSpeaking ? "volume-off" : "volume-high"} size={34} color="#004894" />
          </TouchableOpacity>
        </View>

        <Text style={styles.noticeText}>
          Hosana, você deve voltar no médico em 25 dias
        </Text>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={[styles.prescriptionList, { paddingTop: 180 }]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <Text style={styles.sectionTitle}>MINHAS PRESCRIÇÕES</Text>

        {/* NOVO: Botão para Verificar Prescrição */}
        <TouchableOpacity 
          style={[styles.verifyButton, isVerifying ? styles.verifyButtonDisabled : {}]}
          onPress={handleVerifyPrescription}
          disabled={isVerifying}
        >
          <Ionicons name="shield-checkmark-outline" size={24} color="#fff" style={{marginRight: 10}} />
          <Text style={styles.verifyButtonText}>
            {isVerifying ? "Verificando com IA..." : "Verificar Prescrição com IA"}
          </Text>
        </TouchableOpacity>

        {data.map((med, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.medName}>{med.nome}</Text>
            <Text style={styles.howTo}>Como tomar:</Text>
            {med.horarios.map((h, i) => (
              <Text key={i} style={styles.horario}>• {h}</Text>
            ))}
            <Text style={styles.freeText}>Você pode pegar esse medicamento de graça</Text>
            <TouchableOpacity style={styles.button} onPress={navigateToFarmacias}>
              <Text style={styles.buttonText}>Ver farmácias</Text>
            </TouchableOpacity>
          </View>
        ))}
      </Animated.ScrollView>
    </View>
  );
}

const data = [
  {
    nome: 'Losartana 50mg',
    horarios: ['8h da manhã', '20h da noite']
  },
  {
    nome: 'Hidroclorotiazida 25mg',
    horarios: ['1 comprimido pela manhã']
  },
  {
    nome: 'Metformina 500mg',
    horarios: [
      '1 comprimido após café da manhã',
      '1 comprimido após almoço',
      '1 comprimido após jantar'
    ]
  },
  {
    nome: 'Sinvastatina 40mg',
    horarios: ['1 comprimido após última refeição']
  }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F5FA',
    paddingTop: StatusBar.currentHeight || 40,
  },
  header: {
    backgroundColor: '#CDE0F6',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: StatusBar.currentHeight || 40,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: -20,
  },
  backText: {
    color: '#004894',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 28,
  },
  noticeText: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#004894',
    textAlign: 'center',
    marginTop: 36,
    marginBottom: 23,
  },
  sectionTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 25,
    marginTop: 30,
    color: '#001D5C',
    marginBottom: 20, // Ajustado para dar espaço ao novo botão
  },
  prescriptionList: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#F9FAFC',
    width: '100%',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderColor: '#004894',
    borderWidth: 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medName: {
    fontWeight: 'bold',
    fontSize: 27,
    color: '#002867',
    marginBottom: 6,
  },
  howTo: {
    fontWeight: 'bold',
    fontSize: 27,
    color: '#002867',
    marginTop: 10,
  },
  horario: {
    marginLeft: 12,
    marginTop: 4,
    fontSize: 27,
    color: '#002867',
  },
  freeText: {
    marginTop: 12,
    fontSize: 27,
    color: '#002867',
  },
  button: {
    alignSelf: 'flex-end',
    marginTop: 16,
    backgroundColor: '#004894',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 24,
  },
  // NOVO: Estilos para o botão de verificação
  verifyButton: {
    flexDirection: 'row',
    backgroundColor: '#002867', // Verde para uma ação positiva/segura
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 30, // Espaço antes da lista de cards
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  verifyButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  verifyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
});
