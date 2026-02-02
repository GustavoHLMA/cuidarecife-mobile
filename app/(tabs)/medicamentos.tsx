import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import { useCallback, useEffect, useRef, useState } from 'react';
import { 
  Alert, 
  Animated, 
  Platform, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

// Ícones
const placeholderMedicationIcon = require('@/assets/images/pilula.svg');
const cameraIcon = require('@/assets/images/camera.svg');
const solIcon = require('@/assets/images/sol.svg');
const luaIcon = require('@/assets/images/lua.svg');
const relogioIcon = require('@/assets/images/relogio.svg');

interface MedicationFromAPI {
  id: string;
  name: string;
  dosage?: string;
  instructions: string;
  timesPerDay: number;
  times: string[];
  isFree: boolean;
  dosesTakenToday: number;
  dosesRequired: number;
  isComplete: boolean;
  weekHistory?: Array<{ 
    day: number; 
    taken: number;
    required: number;
    percentage: number;
    status: 'complete' | 'partial' | 'missed' | 'pending' | 'future';
  }>;
  doseLogs: Array<{
    id: string;
    scheduledTime?: string;
    status?: string;
    takenAt: string;
  }>;
}

interface DisplayMedication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  instruction: string | null;
  image: any;
  doseLogId?: string;
  status: 'pending' | 'taken' | 'forgotten';
  weekHistory: Array<{ 
    day: number; 
    taken: number;
    required: number;
    percentage: number;
    status: 'complete' | 'partial' | 'missed' | 'pending' | 'future';
  }>;
}

const SunIcon = () => (
  <View style={styles.periodIconView}>
    <ExpoImage source={solIcon} style={styles.svgIcon} contentFit="contain" />
  </View>
);

const MoonIcon = () => (
  <View style={styles.periodIconView}>
    <ExpoImage source={luaIcon} style={styles.svgIconLua} contentFit="contain" />
  </View>
);

export default function MedicamentosScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [medicationsList, setMedicationsList] = useState<DisplayMedication[]>([]);
  const [hasPrescription, setHasPrescription] = useState(false);
  const [totalMedicationsCount, setTotalMedicationsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [processingDose, setProcessingDose] = useState<string | null>(null);

  const headerMaxHeight = 200;
  const profileImageOverflowHeight = 70;
  const initialContentPaddingTop = headerMaxHeight + profileImageOverflowHeight;

  // Carregar medicamentos do dia
  const loadMedications = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const result = await api.getTodayMedications();
      
      if (result.error) {
        console.error('[Medicamentos] Erro:', result.error);
        setMedicationsList([]);
        return;
      }

      if (result.data?.medications) {
        const apiMeds = result.data.medications;
        console.log('[Medicamentos] Recebidos da API:', JSON.stringify(apiMeds, null, 2));
        setHasPrescription(apiMeds.length > 0);
        setTotalMedicationsCount(apiMeds.length);
        
        // Transformar medicamentos da API para formato de exibição
        const displayMeds: DisplayMedication[] = [];

        result.data.medications.forEach((med: MedicationFromAPI) => {
          // Se times for vazio ou null, usar horário padrão baseado em timesPerDay
          let times = med.times;
          if (!times || times.length === 0) {
            // Gerar horários padrão baseado em timesPerDay
            const timesPerDay = med.timesPerDay || 1;
            if (timesPerDay === 1) times = ['08:00'];
            else if (timesPerDay === 2) times = ['08:00', '20:00'];
            else if (timesPerDay === 3) times = ['08:00', '14:00', '20:00'];
            else times = ['08:00', '12:00', '16:00', '20:00'];
          }
          
          console.log(`[Medicamentos] ${med.name}: times=${JSON.stringify(times)}, doseLogs=${med.doseLogs?.length || 0}`);
          const dosesTaken = med.doseLogs || [];

          times.forEach((time) => {
            // Verificar se essa dose específica foi tomada ou esquecida
            const doseLog = dosesTaken.find(log => log.scheduledTime === time);
            
            // Determinar status baseado no doseLog da API
            let status: 'pending' | 'taken' | 'forgotten' = 'pending';
            if (doseLog) {
              status = doseLog.status === 'forgotten' ? 'forgotten' : 'taken';
            }

            displayMeds.push({
              id: `${med.id}-${time}`,
              name: med.name,
              dosage: med.dosage || '',
              time: time,
              instruction: med.instructions,
              image: placeholderMedicationIcon,
              doseLogId: doseLog?.id,
              status,
              weekHistory: med.weekHistory || [],
            });
          });
        });

        // Ordenar por horário
        displayMeds.sort((a, b) => {
          const timeA = parseInt(a.time.replace(':', ''));
          const timeB = parseInt(b.time.replace(':', ''));
          return timeA - timeB;
        });

        setMedicationsList(displayMeds);
      } else {
        setHasPrescription(false);
        setTotalMedicationsCount(0);
        setMedicationsList([]);
      }
    } catch (error) {
      console.error('[Medicamentos] Erro ao carregar:', error);
      setMedicationsList([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Carregar ao focar na tela
  useFocusEffect(
    useCallback(() => {
      loadMedications();
    }, [])
  );

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus.status !== 'granted') {
          Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera para verificar medicamentos.');
        }
      }
    })();
    
    return () => {
      Speech.stop();
      setIsSpeaking(false);
    };
  }, []);

  const getTimeOfDay = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return 'MANHÃ';
    if (hour < 17) return 'TARDE';
    return 'NOITE';
  };

  const handleTakeMedication = async (displayMed: DisplayMedication) => {
    // Se já foi tomado, ignorar
    if (displayMed.status === 'taken') return;
    
    const realMedId = displayMed.id.split('-')[0];
    const scheduledTime = displayMed.time;

    setProcessingDose(displayMed.id);

    try {
      const result = await api.recordDose(realMedId, { scheduledTime });

      if (result.error) {
        Alert.alert('Erro', result.error);
        return;
      }

      // Atualizar status localmente e recarregar para atualizar weekHistory
      setMedicationsList(prev => prev.map(med => 
        med.id === displayMed.id ? { ...med, status: 'taken' as const, doseLogId: result.data?.doseLog?.id } : med
      ));
      
      // Refresh para atualizar weekHistory (pills)
      await loadMedications();
      
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível registrar a dose.');
    } finally {
      setProcessingDose(null);
    }
  };

  const handleForgotten = async (displayMed: DisplayMedication) => {
    // Se já está esquecido, ignorar
    if (displayMed.status === 'forgotten') return;
    
    const realMedId = displayMed.id.split('-')[0];
    const scheduledTime = displayMed.time;

    setProcessingDose(displayMed.id);

    try {
      const result = await api.markForgotten(realMedId, { scheduledTime });

      if (result.error) {
        Alert.alert('Erro', result.error);
        return;
      }

      // Atualizar status localmente e recarregar para atualizar weekHistory
      setMedicationsList(prev => prev.map(med => 
        med.id === displayMed.id ? { ...med, status: 'forgotten' as const, doseLogId: result.data?.doseLog?.id } : med
      ));
      
      // Refresh para atualizar weekHistory (pills)
      await loadMedications();
      
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível marcar como esquecido.');
    } finally {
      setProcessingDose(null);
    }
  };

  const handleOutOfStock = (medicationName: string) => {
    router.push({ pathname: '/farmacias', params: { medicationName } });
  };

  const handleCameraPress = async () => {
    const permissionResult = await ImagePicker.getCameraPermissionsAsync();
    if (!permissionResult.granted) {
      const requestPermissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!requestPermissionResult.granted) {
        Alert.alert('Permissão Negada', 'Você precisa permitir o acesso à câmera.');
        return;
      }
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      await processImageForOCR(result.assets[0].uri);
    }
  };

  const processImageForOCR = async (uri: string) => {
    try {
      Alert.alert('Processando...', 'Verificando se o medicamento corresponde à sua prescrição.');
      
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

      const result = await api.analyzeImage(base64);
      
      if (result.error) {
        Alert.alert('Erro', result.error);
        return;
      }

      if (result.data?.extractedText) {
        const extractedText = result.data.extractedText;
        
        // LOG DO TEXTO EXTRAÍDO PELO OCR
        console.log('==================================================');
        console.log('[OCR] TEXTO EXTRAÍDO DA IMAGEM:');
        console.log(extractedText);
        console.log('==================================================');
        
        const lowerText = extractedText.toLowerCase();
        
        // Verificar se algum medicamento da lista está no texto
        let foundMed = null;
        for (const med of medicationsList) {
          if (lowerText.includes(med.name.toLowerCase())) {
            foundMed = med;
            break;
          }
        }

        if (foundMed) {
          Alert.alert(
            '✓ Medicamento Correto!',
            `O medicamento ${foundMed.name} corresponde à sua prescrição.`
          );
        } else {
          Alert.alert(
            '⚠️ Atenção',
            'O medicamento fotografado não corresponde aos seus medicamentos pendentes. Verifique com cuidado.'
          );
        }
      } else {
        console.log('[OCR] Nenhum texto extraído da imagem');
        Alert.alert('Não Reconhecido', 'Não foi possível identificar texto na imagem.');
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha ao processar imagem.');
    }
  };

  const speakScreenContent = async () => {
    if (isSpeaking) {
      Speech.stop();
      return;
    }

    let contentToSpeak = `Olá ${user?.name || 'usuário'}, `;

    if (medicationsList.length === 0) {
      contentToSpeak += "você já tomou todos os seus medicamentos por hoje!";
    } else {
      contentToSpeak += "esses são seus remédios pendentes. ";
      const periods = ['MANHÃ', 'TARDE', 'NOITE'];
      
      periods.forEach(period => {
        const periodMeds = medicationsList.filter(med => getTimeOfDay(med.time) === period);
        if (periodMeds.length > 0) {
          contentToSpeak += `Período da ${period.toLowerCase()}. `;
          periodMeds.forEach(med => {
            contentToSpeak += `${med.name} ${med.dosage}, horário ${med.time}. `;
            if (med.instruction) {
              contentToSpeak += `${med.instruction}. `;
            }
          });
        }
      });
    }

    Speech.speak(contentToSpeak, {
      language: 'pt-BR',
      onStart: () => setIsSpeaking(true),
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const renderMedicationCard = (medication: DisplayMedication) => {
    const isProcessing = processingDose === medication.id;
    
    // Cores baseadas no status
    let cardBg = '#2196F3'; // pending - azul
    let textColor = '#FFFFFF';
    let subTextColor = '#E0E0E0';
    let statusIcon = '';
    let statusText = '';
    
    if (medication.status === 'taken') {
      cardBg = '#4CAF50'; // verde
      textColor = '#FFFFFF';
      subTextColor = '#C8E6C9';
      statusIcon = '✓';
      statusText = 'Tomado';
    } else if (medication.status === 'forgotten') {
      cardBg = '#E53935'; // vermelho
      textColor = '#FFFFFF';
      subTextColor = '#FFCDD2';
      statusIcon = '✗';
      statusText = 'Esquecido';
    }

    return (
      <View style={[styles.medicationCard, { backgroundColor: cardBg }]}>
        <View style={styles.cardContentRow}>
          <ExpoImage 
            source={medication.image} 
            style={[styles.cardMedicationIconLeft, { tintColor: textColor }]} 
            contentFit="contain" 
          />
          <View style={styles.cardTextContainer}>
            <Text style={styles.medicationFullName}>
              <Text style={[styles.medicationNamePart, { color: textColor }]}>{medication.name}</Text>
              {medication.dosage ? (
                <Text style={styles.medicationDosagePart}> {medication.dosage}</Text>
              ) : null}
            </Text>
            {medication.instruction ? (
              <Text style={[styles.medicationInstruction, { color: subTextColor }]} numberOfLines={2}>
                {medication.instruction}
              </Text>
            ) : null}
          </View>
          {medication.status !== 'pending' ? (
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>{statusIcon}</Text>
            </View>
          ) : null}
        </View>
        
        <View style={styles.pillsVisualContainer}>
          {Array.from({ length: 7 }).map((_, i) => {
            const dayHistory = medication.weekHistory?.[i];
            const percentage = dayHistory?.percentage ?? 0;
            const status = dayHistory?.status ?? 'future';
            
            // Cores baseadas no status e percentage
            let pillBg = '#FFFFFF';
            let pillBorder = '#D0D0D0';
            let dividerColor = '#B0B0B0';
            let fillHeight = '0%';
            
            if (status === 'complete') {
              // Completo = totalmente amarelo
              pillBg = '#FFCD00';
              pillBorder = '#E5B800';
              dividerColor = '#DAA520';
              fillHeight = '100%';
            } else if (status === 'partial') {
              // Parcial = preenchimento proporcional
              pillBorder = '#E5B800';
              dividerColor = '#DAA520';
              fillHeight = `${Math.round(percentage * 100)}%`;
            }
            // 'missed', 'pending' e 'future' permanecem brancos
            
            return (
              <View
                key={i}
                style={[
                  styles.pillVisual,
                  { 
                    backgroundColor: status === 'complete' ? pillBg : '#FFFFFF',
                    borderColor: pillBorder,
                    borderWidth: 1.5,
                    overflow: 'hidden',
                  }
                ]}
              >
                {/* Preenchimento proporcional para partial */}
                {status === 'partial' ? (
                  <View 
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: `${Math.round(percentage * 100)}%` as any,
                      backgroundColor: '#FFCD00',
                    }} 
                  />
                ) : null}
                <View style={[styles.pillDivider, { backgroundColor: dividerColor }]} />
              </View>
            );
          })}
        </View>

        {medication.status === 'pending' ? (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.esqueciButton]}
              onPress={() => handleForgotten(medication)}
            >
              <Text style={styles.esqueciButtonText}>Esqueci</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.tomeiButton]}
              onPress={() => handleTakeMedication(medication)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#004894" />
              ) : (
                <Text style={styles.tomeiButtonText}>Tomei!</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, { color: textColor }]}>{statusText}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <Header scrollY={scrollY} onReadPress={speakScreenContent} />
      <Animated.ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingTop: initialContentPaddingTop }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadMedications(true)}
            tintColor="#004894"
          />
        }
      >
        <View style={styles.medicationSection}>
          <View style={styles.customHeaderContent}>
            <Text style={styles.greetingText}>
              Olá {user?.name || 'usuário'}, esses são seus remédios do dia
            </Text>
            <TouchableOpacity style={styles.newCameraButton} onPress={handleCameraPress}>
              <ExpoImage source={cameraIcon} style={styles.newCameraIcon} contentFit="contain" />
              <Text style={styles.newCameraButtonText}>VEJA SE ESTÁ TOMANDO O CERTO</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color="#004894" style={{ marginTop: 40 }} />
          ) : !hasPrescription ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={60} color="#B0BEC5" />
              <Text style={styles.allMedicationsTakenText}>
                Nenhum medicamento cadastrado
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Vá em Prescrição e escaneie sua receita médica para adicionar medicamentos
              </Text>
            </View>
          ) : medicationsList.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.allMedicationsTakenText}>
                Você já tomou todos os seus medicamentos por hoje! 🎉
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Puxe para baixo para atualizar
              </Text>
            </View>
          ) : (
            ['MANHÃ', 'TARDE', 'NOITE'].map(period => {
              const periodMeds = medicationsList.filter(med => getTimeOfDay(med.time) === period);
              if (periodMeds.length === 0) return null;

              return (
                <View key={period} style={styles.periodBlock}>
                  <View style={styles.periodHeader}>
                    {period === 'MANHÃ' ? <SunIcon /> : null}
                    {period === 'NOITE' ? <MoonIcon /> : null}
                    {period === 'TARDE' ? (
                      <View style={styles.periodIconView}>
                        <ExpoImage source={solIcon} style={styles.svgIcon} contentFit="contain" />
                      </View>
                    ) : null}
                    <Text style={styles.periodTitle}>{period}</Text>
                  </View>
                  {periodMeds.map((med) => (
                    <View key={med.id} style={styles.medicationItemContainer}>
                      <View style={styles.timeAboveCardContainer}>
                        <ExpoImage source={relogioIcon} style={styles.clockIconStyle} contentFit="contain" />
                        <Text style={styles.timeAboveCardText}>{med.time}</Text>
                      </View>
                      {renderMedicationCard(med)}
                    </View>
                  ))}
                </View>
              );
            })
          )}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#F2F6FA',
  },
  container: {
    flex: 1,
  },
  customHeaderContent: {
    alignItems: 'center',
    marginBottom: 25,
  },
  greetingText: {
    fontSize: 24,
    color: '#074173',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  newCameraButton: {
    width: '90%',
    maxWidth: 380,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#FFCD00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  newCameraIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
    tintColor: '#004894',
  },
  newCameraButtonText: {
    fontSize: 18,
    color: '#004894',
    fontWeight: 'bold',
    textAlign: 'center',
    flexShrink: 1,
  },
  medicationSection: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  periodBlock: {
    marginBottom: 10,
  },
  periodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  periodIconView: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#004894',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  svgIcon: {
    width: 22,
    height: 22,
    tintColor: '#FFCD00',
  },
  svgIconLua: {
    width: 22,
    height: 22,
  },
  periodTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#074173',
  },
  medicationItemContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  timeAboveCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    alignSelf: 'flex-end',
    marginRight: 20,
  },
  clockIconStyle: {
    width: 24,
    height: 24,
    tintColor: '#074173',
    marginRight: 6,
  },
  timeAboveCardText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#074173',
  },
  medicationCard: {
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
    width: '100%',
    maxWidth: 400,
  },
  cardContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardMedicationIconLeft: {
    width: 44,
    height: 44,
    marginRight: 12,
  },
  cardTextContainer: {
    flex: 1,
  },
  medicationFullName: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  medicationNamePart: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  medicationDosagePart: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFCD00',
  },
  medicationInstruction: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
  },
  pillsVisualContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  pillVisual: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginHorizontal: 3,
    borderWidth: 1.5,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillDivider: {
    width: '120%',
    height: 2,
    transform: [{ rotate: '45deg' }],
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 15,
  },
  actionButton: {
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  tomeiButton: {
    backgroundColor: '#FFCD00',
  },
  tomeiButtonText: {
    color: '#004894',
    fontWeight: 'bold',
    fontSize: 20,
  },
  acabouButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#004894',
  },
  acabouButtonText: {
    color: '#004894',
    fontWeight: 'bold',
    fontSize: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  allMedicationsTakenText: {
    textAlign: 'center',
    fontSize: 20,
    color: '#074173',
    fontWeight: '600',
    paddingHorizontal: 20,
  },
  emptyStateSubtext: {
    textAlign: 'center',
    fontSize: 14,
    color: '#90A4AE',
    marginTop: 10,
  },
  // Novos estilos para status
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  statusBadgeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  esqueciButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E53935',
  },
  esqueciButtonText: {
    color: '#E53935',
    fontWeight: 'bold',
    fontSize: 18,
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});