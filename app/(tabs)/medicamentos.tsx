import Header from '@/components/Header'; // Seu componente Header existente
import { useNavigation } from '@react-navigation/native'; // << NOVO: Import para navegação
import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Ícones (SVG já importados no seu código original)
const placeholderMedicationIcon = require('@/assets/images/pilula.svg');
const cameraIcon = require('@/assets/images/camera.svg');

// Dados iniciais dos medicamentos conforme sua lista
const initialMedicationsData = [
  { id: 'med1', name: 'Losartana', dosage: '50mg', time: '08:00', instruction: null, image: placeholderMedicationIcon },
  { id: 'med2', name: 'Hidroclorotiazida', dosage: '25mg', time: '08:00', instruction: null, image: placeholderMedicationIcon },
  { id: 'med3', name: 'Metformina', dosage: '500mg', time: '08:00', instruction: 'Tomar após desjejum', image: placeholderMedicationIcon },
  { id: 'med4', name: 'Metformina', dosage: '500mg', time: '13:00', instruction: 'Tomar após almoço', image: placeholderMedicationIcon },
  { id: 'med5', name: 'Sinvastatina', dosage: '40mg', time: '20:00', instruction: 'Tomar após jantar', image: placeholderMedicationIcon },
  { id: 'med6', name: 'Metformina', dosage: '500mg', time: '20:00', instruction: 'Tomar após jantar', image: placeholderMedicationIcon },
];

const user = {
  name: 'Hosana',
};

// Componente para o ícone de Sol
const SunIcon = () => (
  <View style={styles.periodIconView}>
    <Text style={[styles.periodEmojiIcon, { color: '#FFCD00' }]}>☀️</Text>
  </View>
);

// Componente para o ícone de Lua
const MoonIcon = () => (
  <View style={styles.periodIconView}>
    <Text style={[styles.periodEmojiIcon, { color: '#FFFFFF' }]}>🌙</Text>
  </View>
);

export default function MedicamentosScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [medicationsList, setMedicationsList] = useState(
    initialMedicationsData.sort((a, b) => {
      const timeA = parseInt(a.time.replace(':', ''));
      const timeB = parseInt(b.time.replace(':', ''));
      return timeA - timeB;
    })
  );

  const navigation = useNavigation(); // << NOVO: Hook de navegação

  const headerMaxHeight = 200;
  const profileImageOverflowHeight = 70;
  const initialContentPaddingTop = headerMaxHeight + profileImageOverflowHeight;

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus.status !== 'granted') {
          Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera para esta funcionalidade.');
        }
      }
    })();
  }, []);

  const getTimeOfDay = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return 'MANHÃ';
    if (hour < 18) return 'TARDE';
    return 'NOITE';
  };

  const handleTakeMedication = (medicationId: string) => {
    setMedicationsList(currentMeds => currentMeds.filter(med => med.id !== medicationId));
  };

  const handleOutOfStock = (medicationName: string) => {
    // Alert.alert('Farmácias', `Redirecionando para encontrar farmácias próximas para ${medicationName}.`);
    navigation.navigate('farmacias', { medicationName }); // << AJUSTADO: Navegação real
  };

  // Função processImageForOCR e handleCameraPress mantidas como antes (sem alterações nesta rodada)
  const processImageForOCR = async (uri: string) => {
    console.log('Imagem para processar via API do backend:', uri);
    const API_BASE_URL = 'http://192.168.0.155:3001';
    const BACKEND_API_URL = `${API_BASE_URL}/vision/analyze-image`;

    try {
      Alert.alert('Processando...', 'Enviando imagem para reconhecimento de texto. Isso pode levar alguns segundos.');
      const response = await fetch(uri);
      const blob = await response.blob();

      const base64ImageData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
          } else {
            reject(new Error('Falha ao ler o arquivo como string base64.'));
          }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
      });

      const body = {
        image: base64ImageData,
      };

      const apiResponse = await fetch(BACKEND_API_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const responseText = await apiResponse.text();
      console.log('Raw backend response status:', apiResponse.status);
      console.log('Raw backend response text:', responseText);

      if (apiResponse.ok && responseText) {
        const result = JSON.parse(responseText);

        if (result.extractedText) {
          const extractedText = result.extractedText;
          console.log('Texto Extraído (Backend API):', extractedText);

          const normalizedExtractedText = extractedText.toLowerCase().replace(/\s+/g, ' ').trim();
          console.log('Texto Normalizado:', normalizedExtractedText);

          let foundMedication = null;
          let highestMatchScore = 0;

          for (const med of initialMedicationsData) {
            const normalizedMedName = med.name.toLowerCase().trim();
            if (normalizedExtractedText.includes(normalizedMedName)) {
              const currentScore = normalizedMedName.length;
              if (currentScore > highestMatchScore) {
                highestMatchScore = currentScore;
                foundMedication = med;
              }
            }
          }

          if (foundMedication) {
            Alert.alert('Medicamento Encontrado!', `O texto "${foundMedication.name}" parece corresponder a um dos seus remédios.`);
          } else {
            Alert.alert('Atenção!', `O texto extraído "${normalizedExtractedText}" não corresponde aos seus medicamentos listados. Verifique com cuidado.`);
          }
        } else {
          console.log('Backend API response OK, mas sem extractedText:', result);
          Alert.alert('OCR Falhou', result.message || 'Resposta inesperada da API do backend (sem texto extraído).');
        }
      } else {
        console.log('Resposta da API do backend com erro ou vazia. Status:', apiResponse.status);
        let errorDetails = `Erro ${apiResponse.status}.`;
        try {
          const errorResult = JSON.parse(responseText);
          errorDetails = errorResult.message || responseText;
        } catch (e) {
          errorDetails = responseText.substring(0, 200) + (responseText.length > 200 ? "..." : "");
        }
        Alert.alert('OCR Falhou', errorDetails);
      }
    } catch (error: any) {
      console.error('Erro no processamento OCR via API do backend:', error);
      Alert.alert('Erro OCR API Backend', `Ocorreu um erro: ${error.message || 'Verifique sua conexão e o servidor backend.'}`);
    }
  };

  const handleCameraPress = async () => {
    const permissionResult = await ImagePicker.getCameraPermissionsAsync();
    if (!permissionResult.granted) {
      const requestPermissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!requestPermissionResult.granted) {
        Alert.alert('Permissão Negada', 'Você precisa permitir o acesso à câmera para usar esta funcionalidade.');
        return;
      }
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      await processImageForOCR(imageUri);
    }
  };


  const renderMedicationCard = (medication: typeof initialMedicationsData[0]) => {
    const isFirstCardInList = medicationsList.length > 0 && medicationsList[0].id === medication.id;
    const cardBackgroundColor = isFirstCardInList ? '#2196F3' : '#82BDFB';
    const cardTextColor = isFirstCardInList ? '#FFFFFF' : '#004894'; // Texto principal no card
    const cardSubTextColor = isFirstCardInList ? '#E0E0E0' : '#075E9B'; // Texto secundário (instrução)
    const pillBorderColor = isFirstCardInList ? '#FFCD00' : '#FFCD00';
    const iconTintColor = isFirstCardInList ? '#FFFFFF' : '#004894'; // Cor do ícone de pílula dentro do card

    return (
      <View style={[styles.medicationCard, { backgroundColor: cardBackgroundColor }]}>
        <View style={styles.cardContentRow}>
          <ExpoImage 
            source={medication.image} 
            style={[styles.cardMedicationIconLeft, { tintColor: iconTintColor }]} 
            contentFit="contain" 
          />
          <View style={styles.cardTextContainer}>
            <Text style={styles.medicationFullName}>
              <Text style={[styles.medicationNamePart, { color: cardTextColor }]}>{medication.name} </Text>
              <Text style={styles.medicationDosagePart}>{medication.dosage}</Text>
            </Text>
            {medication.instruction && (
              <Text style={[styles.medicationInstruction, { color: cardSubTextColor }]}>{medication.instruction}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.pillsVisualContainer}>
          {Array.from({ length: 7 }).map((_, pillIndex) => (
            <View
              key={pillIndex}
              style={[
                styles.pillVisual,
                { 
                  backgroundColor: pillIndex < 3 ? '#FFCD00' : '#FFFFFF', // 3 amarelas, 4 brancas
                  borderColor: pillBorderColor,
                }
              ]}
            />
          ))}
        </View>

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.acabouButton]}
            onPress={() => handleOutOfStock(medication.name)}
          >
            <Text style={styles.acabouButtonText}>Acabou :(</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.tomeiButton]}
            onPress={() => handleTakeMedication(medication.id)}
          >
            <Text style={styles.tomeiButtonText}>Tomei!</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };


  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <Header scrollY={scrollY} onReadPress={() => console.log('Read more pressed (Header)')} />
      <Animated.ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingTop: initialContentPaddingTop }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}>
        <View style={styles.medicationSection}>
          <View style={styles.customHeaderContent}>
            <Text style={styles.greetingText}>
              Olá {user.name}, esses são seus remédios do dia
            </Text>
            <TouchableOpacity style={styles.newCameraButton} onPress={handleCameraPress}>
              <ExpoImage source={cameraIcon} style={styles.newCameraIcon} contentFit="contain" />
              <Text style={styles.newCameraButtonText}>VEJA AQUI SE ESTÁ TOMANDO O CERTO</Text>
            </TouchableOpacity>
          </View>

          {['MANHÃ', 'TARDE', 'NOITE'].map(period => {
            const periodMedications = medicationsList.filter(med => getTimeOfDay(med.time) === period);
            if (periodMedications.length === 0) return null;

            return (
              <View key={period} style={styles.periodBlock}>
                <View style={styles.periodHeader}>
                  {period === 'MANHÃ' && <SunIcon />}
                  {period === 'NOITE' && <MoonIcon />}
                  <Text style={styles.periodTitle}>{period}</Text>
                </View>
                {periodMedications.map((med) => (
                  // Container para Horário + Card
                  <View key={med.id} style={styles.medicationItemContainer}>
                    <View style={styles.timeAboveCardContainer}>
                      <Text style={styles.clockIconStyle}>⏰</Text>
                      <Text style={styles.timeAboveCardText}>{med.time}</Text>
                    </View>
                    {renderMedicationCard(med)}
                  </View>
                ))}
              </View>
            );
          })}
           {medicationsList.length === 0 && (
            <Text style={styles.allMedicationsTakenText}>
              Você já tomou todos os seus medicamentos por hoje! 🎉
            </Text>
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
    marginTop: 25,
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
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 7,
  },
  newCameraIcon: {
    width: 47,
    height: 47,
    marginRight: 12,
    tintColor: '#004894',
  },
  newCameraButtonText: {
    fontSize: 24, // << AUMENTADO
    color: '#004894',
    fontWeight: 'bold',
    textAlign: 'center',
    flexShrink: 1, // Permite que o texto quebre se necessário em telas menores
  },
  medicationSection: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  periodBlock: {
    marginBottom: 10, // Reduzido espaço entre blocos de período
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
  periodEmojiIcon: {
    fontSize: 20,
  },
  periodTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#074173',
  },
  // NOVO: Container para cada entrada de medicamento (horário + card)
  medicationItemContainer: {
    marginBottom: 20, // Espaço entre um conjunto (horário+card) e o próximo
    alignItems: 'center', // Centraliza o card abaixo do horário
  },
  // NOVO: Estilos para o horário acima do card
  timeAboveCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8, 
    marginRight: -250,
    // Espaço entre o horário e o card
    // Se quiser que ocupe a largura do card, adicione width ou alignSelf: 'stretch' e ajuste
  },
  clockIconStyle: {
    fontSize: 30,
    color: '#074173', // Cor escura para o relógio
    marginRight: 8,
  },
  timeAboveCardText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#074173', // Cor escura para o horário
  },
  medicationCard: {
    borderRadius: 12,
    // marginBottom removido daqui, pois medicationItemContainer já tem
    paddingVertical: 15, // Ajustado padding
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
    width: '100%', // O card ocupa a largura disponível no seu container
    maxWidth: 400, // Limite para não ficar excessivamente largo em tablets
  },
  // NOVO: Linha para ícone do remédio e textos
  cardContentRow: {
    flexDirection: 'row',
    alignItems: 'center', // Alinha o ícone com o bloco de texto
    marginBottom: 10,
  },
  // NOVO: Ícone do remédio à esquerda dentro do card
  cardMedicationIconLeft: {
    width: 48, // Tamanho do ícone
    height: 48,
    marginRight: 12, // Espaço para o texto
  },
  // NOVO: Container para os textos ao lado do ícone
  cardTextContainer: {
    flex: 1, // Permite que o texto ocupe o espaço restante
  },
  medicationFullName: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  medicationNamePart: {
    fontSize: 30, // Ajustado para caber melhor com o ícone
    fontWeight: 'bold',
  },
  medicationDosagePart: {
    fontSize: 27, // Ajustado
    fontWeight: 'bold',
    color: '#FFCD00',
    marginLeft: 6,
  },
  medicationInstruction: {
    fontSize: 27, // Ligeiramente menor
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 8,
  },
  pillsVisualContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  pillVisual: {
    width: 24, // Ajustado
    height: 24, // Ajustado
    borderRadius: 9,
    marginHorizontal: 3,
    borderWidth: 1.5,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    columnGap: 15,
  },
  actionButton: {
    borderRadius: 25,
    paddingVertical: 12, // Ajustado
    paddingHorizontal: 20, // Ajustado
    minWidth: 130, // Ajustado
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  tomeiButton: {
    backgroundColor: '#FFCD00',
  },
  tomeiButtonText: {
    color: '#004894',
    fontWeight: 'bold',
    fontSize: 24, // Ajustado
  },
  acabouButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#004894',
  },
  acabouButtonText: {
    color: '#004894',
    fontWeight: 'bold',
    fontSize: 24, // Ajustado
  },
  allMedicationsTakenText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#074173',
    marginTop: 30,
    paddingHorizontal: 20,
  },
});