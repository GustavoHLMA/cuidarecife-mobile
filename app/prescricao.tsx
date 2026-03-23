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
import { useUI } from '@/contexts/UIContext';

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
  const { showModal, showToast } = useUI();

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
    showModal(
      'Adicionar Receita',
      'De onde você quer pegar a foto da receita?',
      [
        { text: 'Tirar Foto', onPress: () => pickImage('camera') },
        { text: 'Escolher da Galeria', onPress: () => pickImage('gallery') },
        { text: 'Voltar', style: 'cancel' },
      ]
    );
  };

  const pickImage = async (source: 'camera' | 'gallery') => {
    try {
      let result;

      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          showModal('Câmera Bloqueada', 'Para tirar a foto, precisamos que você libere o uso da câmera.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          quality: 0.8,
        });
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          showModal('Galeria Bloqueada', 'Para buscar a foto, precisamos que você libere o acesso da galeria do seu celular.');
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
      showToast('A foto da receita não carregou direito. Pode tentar de novo?', 'error');
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
        showModal('Poxa, o Doc ficou confuso', result.error || 'A foto ficou difícil de ler. Pode tentar mandar outra imagem?');
        return;
      }

      if (result.data?.medications ? result.data.medications.length > 0 : false) {
        const newMeds = (result.data?.medications || []).map((med, index) => ({
          ...med,
          id: `temp-${Date.now()}-${index}`,
          isFree: true,
        }));
        
        let mergedMeds = [...medications];
        let hasConflict = false;
        let conflictDetails = '';

        for (const newMed of newMeds) {
          const existingMedIndex = mergedMeds.findIndex(
            m => m.name.toLowerCase() === newMed.name.toLowerCase()
          );

          if (existingMedIndex >= 0) {
            hasConflict = true;
            conflictDetails += `• ${newMed.name} já existe na sua lista.\n`;
            // Por padrão substituimos o antigo com o novo, mas deixamos o alerta pro usuario
            mergedMeds[existingMedIndex] = newMed;
          } else {
            mergedMeds.push(newMed);
          }
        }
        
        setExtractedMedications(mergedMeds);
        setExtractedText(result.data?.extractedText || '');

        if (hasConflict && medications.length > 0) {
          showModal(
            'Medicamentos Substituídos',
            `Notei que alguns remédios já estavam listados e eu apenas os atualizei:\n\n${conflictDetails}\nVerifique se está tudo certinho antes de guardar a receita.`,
            [
              { text: 'Vamos lá', onPress: () => setShowEditModal(true) }
            ]
          );
        } else {
          setShowEditModal(true);
        }
      } else {
        showModal(
          'Receita em branco?',
          'O Doc não conseguiu achar nomes de remédios nessa foto. Tem certeza que a foto ficou nítida?'
        );
      }
    } catch (error: any) {
      showModal('Opa!', error.message || 'Deu um probleminha para ler a foto agora.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleEditPrescription = () => {
    // Clona os medicamentos atuais para edição
    if (medications.length === 0) {
      showModal('Lista Vazia', 'Adicione a sua receita primeiro para podermos ver os seus remédios.');
      return;
    }
    
    // Converter Medication[] para o formato do modal
    const editableMeds = medications.map(med => ({
      ...med,
      id: med.id || `temp-${Date.now()}-${Math.random()}`,
    }));
    
    setExtractedMedications(editableMeds);
    setExtractedText('Modo de edição da prescrição atual.');
    setShowEditModal(true);
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
      showToast('A receita precisa ter pelo menos um remédio, tá?', 'error');
      return;
    }

    for (const med of extractedMedications) {
      if (!med.name.trim()) {
        showToast('Eita, faltou colocar o nome de algum remédio!', 'error');
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
          times: med.times && med.times.length === med.timesPerDay ? med.times : Array(med.timesPerDay || 1).fill('08:00'),
          isFree: true,
        })),
      });

      if (result.error) {
        showModal('Ops!', result.error || 'Deu um probleminha ao salvar a receita.');
        return;
      }

      showModal('Tudo certo! 🎉', 'Sua receita foi salva. O Doc já organizou os remédios na sua lista do dia a dia.');
      setShowEditModal(false);
      setExtractedMedications([]);
      await loadPrescription();
    } catch (error: any) {
      showModal('Ops!', error.message || 'Tivemos um problema. Pode tentar guardar a receita de novo?');
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
        Speech.stop();
        Speech.speak(result.data.analysisResult, { language: 'pt-BR' });
        showModal("Dica do Doc 👨‍⚕️", result.data.analysisResult);
      } else {
        console.error('[Verificação] Erro:', result.error);
        showModal("Desculpe", result.error || "O Doc não conseguiu ler essa receita agora.");
      }
    } catch (error: any) {
      console.error('[Verificação] Exceção:', error);
      showModal("Sinal Fraco", `A internet não conectou: ${error.message || 'Verifique sua conexão WiFi ou celular'}`);
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
          <TouchableOpacity 
            onPress={() => setShowEditModal(false)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Fechar modal de edição"
          >
            <Ionicons name="close" size={28} color="#004894" accessible={false} importantForAccessibility="no" />
          </TouchableOpacity>
          <Text style={styles.modalTitle} accessible={true} accessibilityRole="header">Revisar Medicamentos</Text>
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
                <Text style={styles.medicationNumber} accessible={true} accessibilityRole="header">Medicamento {index + 1}</Text>
                <TouchableOpacity 
                  onPress={() => removeMedication(index)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Remover medicamento ${index + 1}`}
                >
                  <Ionicons name="trash-outline" size={22} color="#E53935" accessible={false} importantForAccessibility="no" />
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
                    onPress={() => {
                      updateMedication(index, 'timesPerDay', num);
                      
                      // Ajustar o array de horários baseado na quantidade escolhida
                      let currentTimes = [];
                      if (med.times) {
                         try {
                           currentTimes = typeof med.times === 'string' ? JSON.parse(med.times) : med.times;
                           if (!Array.isArray(currentTimes)) currentTimes = [];
                         } catch (e) {
                           currentTimes = [];
                         }
                      }
                      
                      if (currentTimes.length < num) {
                         // Adicionar '08:00' padrão para os novos slots
                         const newSlots = Array(num - currentTimes.length).fill('08:00');
                         updateMedication(index, 'times', [...currentTimes, ...newSlots]);
                      } else if (currentTimes.length > num) {
                         // Cortar o array ao tamanho atual
                         updateMedication(index, 'times', currentTimes.slice(0, num));
                      }
                    }}
                  >
                    <Text style={[
                      styles.timesPerDayText,
                      med.timesPerDay === num ? styles.timesPerDayTextActive : null
                     ]}>{num}x</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Horários (HH:MM)</Text>
              <View style={styles.timesInputsContainer}>
                {(() => {
                  let timesArray = Array(med.timesPerDay || 1).fill('08:00');
                  if (med.times) {
                    try {
                      timesArray = typeof med.times === 'string' ? JSON.parse(med.times) : med.times;
                      if (!Array.isArray(timesArray)) {
                        timesArray = Array(med.timesPerDay || 1).fill('08:00');
                      }
                    } catch (e) {
                      console.log('Error parsing times', e);
                      timesArray = Array(med.timesPerDay || 1).fill('08:00');
                    }
                  }
                  
                  // Ensure timesArray length matches timesPerDay
                  if (timesArray.length < (med.timesPerDay || 1)) {
                    timesArray = [...timesArray, ...Array((med.timesPerDay || 1) - timesArray.length).fill('08:00')];
                  } else if (timesArray.length > (med.timesPerDay || 1)) {
                    timesArray = timesArray.slice(0, med.timesPerDay || 1);
                  }

                  return timesArray.map((time: string, timeIdx: number) => (
                    <TextInput
                      key={`time-${index}-${timeIdx}`}
                      style={styles.timeInput}
                      value={time}
                      placeholder="08:00"
                      keyboardType="numeric"
                      maxLength={5}
                      onChangeText={(v) => {
                        let formatted = v.replace(/[^0-9]/g, '');
                        if (formatted.length > 2) {
                          formatted = formatted.slice(0, 2) + ':' + formatted.slice(2, 4);
                        }
                        
                        const newTimes = [...timesArray];
                        newTimes[timeIdx] = formatted;
                        updateMedication(index, 'times', newTimes);
                      }}
                    />
                  ));
                })()}
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

        <Text style={styles.sectionTitle} accessible={true} accessibilityRole="header">MINHAS PRESCRIÇÕES</Text>

        {/* Botão para Escanear Prescrição */}
        <TouchableOpacity 
          style={[styles.scanButton, isExtracting ? styles.buttonDisabled : null]}
          onPress={handleScanPrescription}
          disabled={isExtracting}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Escanear e ler uma nova prescrição médica"
        >
          {isExtracting ? (
            <ActivityIndicator size="small" color="#fff" style={{marginRight: 10}} />
          ) : (
            <Ionicons name="camera-outline" size={24} color="#fff" style={{marginRight: 10}} accessible={false} importantForAccessibility="no" />
          )}
          <Text style={styles.scanButtonText} importantForAccessibility="no">
            {isExtracting ? "Processando..." : "Escanear Prescrição"}
          </Text>
        </TouchableOpacity>

        {/* Botão para Verificar Prescrição */}
        {medications.length > 0 ? (
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity 
              style={[styles.editButton, isVerifying ? styles.buttonDisabled : null]}
              onPress={handleEditPrescription}
              disabled={isVerifying}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Editar prescrição atual"
            >
              <Ionicons name="create-outline" size={22} color="#fff" style={{marginRight: 8}} accessible={false} importantForAccessibility="no" />
              <Text style={styles.editButtonText} importantForAccessibility="no">Editar Atual</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.verifyButtonSmall, isVerifying ? styles.buttonDisabled : null]}
              onPress={handleVerifyPrescription}
              disabled={isVerifying}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Verificar interações medicamentosas com a Inteligência artificial"
            >
              <Ionicons name="shield-checkmark-outline" size={22} color="#fff" style={{marginRight: 8}} accessible={false} importantForAccessibility="no" />
              <Text style={styles.verifyButtonTextSmall} importantForAccessibility="no">Verificar com IA</Text>
            </TouchableOpacity>
          </View>
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
              <View
                accessible={true}
                accessibilityLabel={`Medicamento prescrito: ${med.name}${med.dosage ? ' ' + med.dosage : ''}. Como tomar: ${med.instructions}.`}
              >
                <Text style={styles.medName} importantForAccessibility="no">
                  {med.name}
                  {med.dosage ? <Text style={styles.medDosage} importantForAccessibility="no"> {med.dosage}</Text> : null}
                </Text>
                <Text style={styles.howTo} importantForAccessibility="no">Como tomar:</Text>
                {med.instructions.split(';').map((instruction, i) => (
                  <Text key={i} style={styles.horario} importantForAccessibility="no">• {instruction.trim()}</Text>
                ))}
              </View>
              <TouchableOpacity 
                style={styles.button} 
                onPress={navigateToFarmacias}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Ver farmácias populares disponíveis para retirar ${med.name}`}
              >
                <Text style={styles.buttonText} importantForAccessibility="no">Ver farmácias</Text>
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
  verifyButtonSmall: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#002867',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  verifyButtonTextSmall: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 25,
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
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
  timesInputsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  timeInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    width: 80,
    textAlign: 'center',
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
