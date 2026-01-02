import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';

interface Medication {
  id?: string;
  name: string;
  dosage?: string;
  instructions: string;
  timesPerDay?: number;
  times?: string[];
  isFree?: boolean;
}

interface Prescription {
  id: string;
  patientName: string | null;
  returnInDays: number | null;
  medications: Medication[];
}

export default function PrescricaoScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const { user } = useAuth();

  // Modal de edição de medicamentos extraídos
  const [showEditModal, setShowEditModal] = useState(false);
  const [extractedMedications, setExtractedMedications] = useState<Medication[]>([]);
  const [extractedText, setExtractedText] = useState('');

  const medications = prescription?.medications ?? [];
  const patientName = prescription?.patientName ?? user?.name ?? 'Paciente';
  const returnInDays = prescription?.returnInDays ?? null;

  useFocusEffect(
    useCallback(() => {
      loadPrescription();
    }, [])
  );

  const loadPrescription = async () => {
    setIsLoading(true);
    const result = await api.getPrescription();
    if (result.data?.prescription) {
      setPrescription(result.data.prescription);
    } else {
      setPrescription(null);
    }
    setIsLoading(false);
  };

  const navigateToFarmacias = () => {
    router.push('/farmacias');
  };

  // Função para capturar/selecionar imagem
  const handleScanPrescription = async () => {
    Alert.alert(
      'Escanear Prescrição',
      'Como deseja adicionar a prescrição?',
      [
        { text: 'Câmera', onPress: () => pickImage('camera') },
        { text: 'Galeria', onPress: () => pickImage('gallery') },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const pickImage = async (source: 'camera' | 'gallery') => {
    try {
      let result;

      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permissão Negada', 'Precisamos de acesso à câmera.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          quality: 0.8,
        });
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permissão Negada', 'Precisamos de acesso à galeria.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          quality: 0.8,
        });
      }

      if (!result.canceled) { 
        if (result.assets[0]) {
          await processImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível processar a imagem.');
    }
  };

  const processImage = async (uri: string) => {
    setIsExtracting(true);
    
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
          } else {
            reject(new Error('Falha ao converter imagem'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const result = await api.extractMedicationsFromImage(base64);

      if (result.error) {
        Alert.alert('Erro na Extração', result.error);
        return;
      }

      if (result.data?.medications ? result.data.medications.length > 0 : false) {
        const meds = (result.data?.medications || []).map((med, index) => ({
          ...med,
          id: `temp-${index}`,
          isFree: true,
        }));
        
        setExtractedMedications(meds);
        setExtractedText(result.data?.extractedText || '');
        setShowEditModal(true);
      } else {
        Alert.alert(
          'Nenhum Medicamento Encontrado',
          'Não foi possível identificar medicamentos na imagem. Tente fotografar novamente.',
          [
            { text: 'OK' },
            { text: 'Ver Texto', onPress: () => Alert.alert('Texto Extraído', result.data?.extractedText || 'Nenhum texto') },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha ao processar a imagem.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Funções de edição de medicamentos
  const updateMedication = (index: number, field: keyof Medication, value: any) => {
    setExtractedMedications(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeMedication = (index: number) => {
    setExtractedMedications(prev => prev.filter((_, i) => i !== index));
  };

  const addEmptyMedication = () => {
    setExtractedMedications(prev => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        name: '',
        dosage: '',
        instructions: '',
        timesPerDay: 1,
        times: ['08:00'],
        isFree: true,
      },
    ]);
  };

  // Salvar prescrição
  const savePrescription = async () => {
    if (extractedMedications.length === 0) {
      Alert.alert('Atenção', 'Adicione pelo menos um medicamento.');
      return;
    }

    for (const med of extractedMedications) {
      if (!med.name.trim()) {
        Alert.alert('Atenção', 'Todos os medicamentos precisam de um nome.');
        return;
      }
    }

    setIsLoading(true);
    try {
      const result = await api.savePrescription({
        patientName: user?.name,
        medications: extractedMedications.map(med => ({
          name: med.name,
          dosage: med.dosage,
          instructions: med.instructions || 'Conforme orientação médica',
          timesPerDay: med.timesPerDay || 1,
          times: med.times || ['08:00'],
          isFree: true,
        })),
      });

      if (result.error) {
        Alert.alert('Erro', result.error);
        return;
      }

      Alert.alert('Sucesso', 'Prescrição salva! Os medicamentos agora aparecem na aba Medicamentos.');
      setShowEditModal(false);
      setExtractedMedications([]);
      await loadPrescription();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha ao salvar prescrição.');
    } finally {
      setIsLoading(false);
    }
  };

  const speakScreenContent = async () => {
    if (isSpeaking) {
      Speech.stop();
      return;
    }

    let contentToSpeak = "Tela de Prescrições. ";
    if (returnInDays) {
      contentToSpeak += `${patientName}, você deve voltar no médico em ${returnInDays} dias. `;
    }
    
    if (medications.length > 0) {
      contentToSpeak += "Seus medicamentos: ";
      medications.forEach(med => {
        contentToSpeak += `${med.name}${med.dosage ? ' ' + med.dosage : ''}. ${med.instructions}. `;
      });
    } else {
      contentToSpeak += "Você ainda não tem prescrições cadastradas. Use o botão escanear para adicionar.";
    }

    Speech.speak(contentToSpeak, {
      language: 'pt-BR',
      onStart: () => setIsSpeaking(true),
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleVerifyPrescription = async () => {
    if (isVerifying || medications.length === 0) return;
    setIsVerifying(true);

    try {
      const prescriptionData = {
        patientName: patientName,
        returnInDays: returnInDays,
        medications: medications.map((med) => ({
          name: med.name,
          instructions: med.instructions
        }))
      };

      console.log('[Verificação] Enviando dados:', JSON.stringify(prescriptionData));
      const result = await api.verifyPrescription(prescriptionData);
      console.log('[Verificação] Resposta:', JSON.stringify(result));

      if (result.data?.analysisResult) {
        Alert.alert("Análise da Prescrição", result.data.analysisResult);
      } else {
        console.error('[Verificação] Erro:', result.error);
        Alert.alert("Erro na Verificação", result.error || "Erro desconhecido ao verificar prescrição.");
      }
    } catch (error: any) {
      console.error('[Verificação] Exceção:', error);
      Alert.alert("Erro de Conexão", `Falha na comunicação: ${error.message || 'Verifique sua internet'}`);
    }
    setIsVerifying(false);
  };

  // Renderizar modal de edição (sem toggle de Farmácia Popular)
  const renderEditModal = () => (
    <Modal
      visible={showEditModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowEditModal(false)}
    >
      <KeyboardAvoidingView 
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowEditModal(false)}>
            <Ionicons name="close" size={28} color="#004894" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Revisar Medicamentos</Text>
          <TouchableOpacity onPress={savePrescription} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#004894" />
            ) : (
              <Text style={styles.saveButtonText}>Salvar</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.modalSubtitle}>
            Confira os medicamentos e faça ajustes se necessário:
          </Text>

          {extractedMedications.map((med, index) => (
            <View key={med.id} style={styles.medicationEditCard}>
              <View style={styles.medicationEditHeader}>
                <Text style={styles.medicationNumber}>Medicamento {index + 1}</Text>
                <TouchableOpacity onPress={() => removeMedication(index)}>
                  <Ionicons name="trash-outline" size={22} color="#E53935" />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Nome *</Text>
              <TextInput
                style={styles.textInput}
                value={med.name}
                onChangeText={(v) => updateMedication(index, 'name', v)}
                placeholder="Ex: Losartana"
              />

              <Text style={styles.inputLabel}>Dosagem</Text>
              <TextInput
                style={styles.textInput}
                value={med.dosage || ''}
                onChangeText={(v) => updateMedication(index, 'dosage', v)}
                placeholder="Ex: 50mg"
              />

              <Text style={styles.inputLabel}>Instruções</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={med.instructions}
                onChangeText={(v) => updateMedication(index, 'instructions', v)}
                placeholder="Ex: 1 comprimido às 8h e 20h"
                multiline
                numberOfLines={2}
              />

              <Text style={styles.inputLabel}>Vezes ao Dia</Text>
              <View style={styles.timesPerDayContainer}>
                {[1, 2, 3, 4].map(num => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.timesPerDayButton,
                      med.timesPerDay === num ? styles.timesPerDayButtonActive : null
                    ]}
                    onPress={() => updateMedication(index, 'timesPerDay', num)}
                  >
                    <Text style={[
                      styles.timesPerDayText,
                      med.timesPerDay === num ? styles.timesPerDayTextActive : null
                    ]}>{num}x</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addMedicationButton} onPress={addEmptyMedication}>
            <Ionicons name="add-circle-outline" size={24} color="#004894" />
            <Text style={styles.addMedicationText}>Adicionar Medicamento</Text>
          </TouchableOpacity>

          {extractedText ? (
            <View style={styles.extractedTextContainer}>
              <Text style={styles.extractedTextTitle}>Texto Extraído (referência):</Text>
              <Text style={styles.extractedTextContent}>{extractedText}</Text>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );

  const headerMaxHeight = 200;
  const profileImageOverflowHeight = 70;
  const initialContentPaddingTop = headerMaxHeight + profileImageOverflowHeight;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header scrollY={scrollY} onReadPress={speakScreenContent} />

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: initialContentPaddingTop, paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {returnInDays ? (
          <Text style={styles.noticeText}>
            {patientName}, retorne ao médico em {returnInDays} dias
          </Text>
        ) : null}

        <Text style={styles.sectionTitle}>MINHAS PRESCRIÇÕES</Text>

        {/* Botão para Escanear Prescrição */}
        <TouchableOpacity 
          style={[styles.scanButton, isExtracting ? styles.buttonDisabled : null]}
          onPress={handleScanPrescription}
          disabled={isExtracting}
        >
          {isExtracting ? (
            <ActivityIndicator size="small" color="#fff" style={{marginRight: 10}} />
          ) : (
            <Ionicons name="camera-outline" size={24} color="#fff" style={{marginRight: 10}} />
          )}
          <Text style={styles.scanButtonText}>
            {isExtracting ? "Processando..." : "Escanear Prescrição"}
          </Text>
        </TouchableOpacity>

        {/* Botão para Verificar Prescrição */}
        {medications.length > 0 ? (
          <TouchableOpacity 
            style={[styles.verifyButton, isVerifying ? styles.buttonDisabled : null]}
            onPress={handleVerifyPrescription}
            disabled={isVerifying}
          >
            <Ionicons name="shield-checkmark-outline" size={24} color="#fff" style={{marginRight: 10}} />
            <Text style={styles.verifyButtonText}>
              {isVerifying ? "Verificando..." : "Verificar com IA"}
            </Text>
          </TouchableOpacity>
        ) : null}

        {isLoading ? (
          <ActivityIndicator size="large" color="#004894" style={{ marginTop: 20 }} />
        ) : medications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={60} color="#B0BEC5" />
            <Text style={styles.emptyStateText}>Nenhuma prescrição cadastrada</Text>
            <Text style={styles.emptyStateSubtext}>
              Escaneie uma prescrição médica para adicionar seus medicamentos
            </Text>
          </View>
        ) : (
          medications.map((med, index) => (
            <View key={med.id || index} style={styles.card}>
              <Text style={styles.medName}>
                {med.name}
                {med.dosage ? <Text style={styles.medDosage}> {med.dosage}</Text> : null}
              </Text>
              <Text style={styles.howTo}>Como tomar:</Text>
              {med.instructions.split(';').map((instruction, i) => (
                <Text key={i} style={styles.horario}>• {instruction.trim()}</Text>
              ))}
              <TouchableOpacity style={styles.button} onPress={navigateToFarmacias}>
                <Text style={styles.buttonText}>Ver farmácias</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </Animated.ScrollView>

      {renderEditModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F5FA',
  },
  noticeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#004894',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 24,
    marginTop: 10,
    color: '#001D5C',
    marginBottom: 20,
  },
  // Botões principais
  scanButton: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 15,
    elevation: 3,
  },
  scanButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  verifyButton: {
    flexDirection: 'row',
    backgroundColor: '#002867',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 25,
    elevation: 3,
  },
  verifyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  // Estado vazio
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 20,
    color: '#546E7A',
    fontWeight: '600',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#90A4AE',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  // Cards
  card: {
    backgroundColor: '#F9FAFC',
    width: '100%',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderColor: '#004894',
    borderWidth: 0.5,
    elevation: 2,
  },
  medName: {
    fontWeight: 'bold',
    fontSize: 22,
    color: '#002867',
    marginBottom: 6,
  },
  medDosage: {
    fontWeight: 'normal',
    color: '#2196F3',
  },
  howTo: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#002867',
    marginTop: 10,
  },
  horario: {
    marginLeft: 12,
    marginTop: 4,
    fontSize: 16,
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
    fontSize: 14,
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004894',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  medicationEditCard: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  medicationEditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicationNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#004894',
  },
  inputLabel: {
    fontSize: 14,
    color: '#546E7A',
    marginBottom: 6,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  timesPerDayContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 10,
  },
  timesPerDayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timesPerDayButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  timesPerDayText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  timesPerDayTextActive: {
    color: '#fff',
  },
  addMedicationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#004894',
    borderStyle: 'dashed',
    borderRadius: 12,
    marginBottom: 20,
  },
  addMedicationText: {
    fontSize: 16,
    color: '#004894',
    fontWeight: '600',
    marginLeft: 8,
  },
  extractedTextContainer: {
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  extractedTextTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF8F00',
    marginBottom: 8,
  },
  extractedTextContent: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
});
