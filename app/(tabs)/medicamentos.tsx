import Header from '@/components/Header';
import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef } from 'react';
import { Alert, Animated, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const placeholderMedicationIcon = require('@/assets/images/pilula.svg');
const cameraIcon = require('@/assets/images/camera.svg');

const medications = [
  { name: 'cloridrato de ondansetrona', dosage: '50mg', time: '08:00', doses: 5, taken: 2, image: placeholderMedicationIcon },
  { name: 'Hidroclorotiazida', dosage: '25mg', time: '08:00', doses: 5, taken: 3, image: placeholderMedicationIcon },
];

const user = {
  name: 'Hosana',
};

export default function MedicamentosScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;

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

  const processImageForOCR = async (uri: string) => {
    console.log('Imagem para processar via API do backend:', uri);
    const API_BASE_URL = 'http://192.168.0.155:3001'; // Verifique se este IP e porta estão corretos e acessíveis do seu dispositivo/emulador
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
          'Accept': 'application/json', // Frontend ainda aceita JSON
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      // Logar o status e o texto cru da resposta
      const responseText = await apiResponse.text();
      console.log('Raw backend response status:', apiResponse.status);
      console.log('Raw backend response text:', responseText);

      // Tentar fazer o parse do JSON somente se a resposta for OK e o texto não estiver vazio
      if (apiResponse.ok && responseText) {
        const result = JSON.parse(responseText); // Parse do texto que logamos

        if (result.extractedText) {
          const extractedText = result.extractedText;
          console.log('Texto Extraído (Backend API):', extractedText);

          const normalizedExtractedText = extractedText.toLowerCase().replace(/\s+/g, ' ').trim();
          console.log('Texto Normalizado:', normalizedExtractedText);

          let foundMedication = null;
          let highestMatchScore = 0;

          for (const med of medications) {
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
          // A resposta foi OK (2xx), mas não continha extractedText como esperado
          console.log('Backend API response OK, mas sem extractedText:', result);
          Alert.alert('OCR Falhou', result.message || 'Resposta inesperada da API do backend (sem texto extraído).');
        }
      } else {
        // A resposta não foi OK (ex: 404, 500) ou o texto estava vazio
        console.log('Resposta da API do backend com erro ou vazia. Status:', apiResponse.status);
        // Tentar parsear como JSON se for um erro estruturado do seu backend, senão mostrar o texto cru
        let errorDetails = `Erro ${apiResponse.status}.`;
        try {
          const errorResult = JSON.parse(responseText);
          errorDetails = errorResult.message || responseText;
        } catch (e) {
          // Se não for JSON, responseText já contém o HTML ou a mensagem de erro crua
          errorDetails = responseText.substring(0, 200) + (responseText.length > 200 ? "..." : ""); // Limitar o tamanho do alerta
        }
        Alert.alert('OCR Falhou', errorDetails);
      }
    } catch (error: any) {
      console.error('Erro no processamento OCR via API do backend:', error); // Este é o erro que você está vendo
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
            const periodMedications = medications.filter(med => getTimeOfDay(med.time) === period);
            if (periodMedications.length === 0) return null;

            return (
              <View key={period}>
                <Text style={styles.sectionTitle}>{period}</Text>
                {periodMedications.map((medication, index) => (
                  <View key={`${period}-${index}`} style={styles.medicationCard}>
                    <View style={styles.cardHeader}>
                      <ExpoImage source={medication.image} style={styles.medicationImage} contentFit="contain" />
                      <View style={styles.cardText}>
                        <Text style={styles.medicationName}>{medication.name}</Text>
                        <Text style={styles.medicationDosage}>{medication.dosage}</Text>
                      </View>
                    </View>
                    <Text style={styles.timeText}>{medication.time}</Text>
                    <View style={styles.doseContainer}>
                      {Array.from({ length: medication.doses }).map((_, doseIndex) => (
                        <View
                          key={doseIndex}
                          style={[styles.dose, doseIndex < medication.taken && styles.doseTaken]}
                        />
                      ))}
                    </View>
                    <View style={styles.buttonsContainer}>
                      <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>Acabou :(</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>Tomei!</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

// Seus estilos (mantidos como você forneceu)
const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#f2f6fa',
  },
  container: {
    flex: 1,
  },
  customHeaderContent: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  greetingText: {
    fontSize: 18,
    color: '#074173',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  newCameraButton: {
    width: 350,
    height: 76,
    borderRadius: 5,
    backgroundColor: '#FFCD00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    shadowColor: 'rgba(0, 0, 0, 0.11)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 5,
  },
  newCameraIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  newCameraButtonText: {
    fontSize: 14,
    color: '#074173',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  medicationSection: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#074173',
    marginBottom: 15,
    marginTop: 10,
  },
  medicationCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  medicationImage: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  cardText: {
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e77b7',
  },
  medicationDosage: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  timeText: {
    fontSize: 16,
    color: '#1e77b7',
    marginBottom: 10,
    fontWeight: '500',
  },
  doseContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  dose: {
    width: 20,
    height: 20,
    backgroundColor: '#ccc',
    borderRadius: 10,
    marginRight: 6,
  },
  doseTaken: {
    backgroundColor: '#ffcc00',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#ffcc00',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    minWidth: 120,
    alignItems: 'center',
    elevation: 2,
  },
  buttonText: {
    color: '#074173',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
  },
});