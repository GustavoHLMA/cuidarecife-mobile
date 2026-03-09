import Header from '@/components/Header';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  Animated,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { api } from '../services/api';

interface PressureReading {
  id: string;
  systolic: number;
  diastolic: number;
  measuredAt: string;
}

export default function PressaoScreen() {
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [readings, setReadings] = useState<PressureReading[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    const result = await api.getPressureHistory(5);
    if (result.data) {
      setReadings(result.data.readings);
    }
    setIsLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getPressureStatus = (systolic: number, diastolic: number) => {
    if (systolic < 120) {
      if (diastolic < 80) return { label: 'Normal', color: '#4CAF50' };
    }
    if (systolic < 140) {
      if (diastolic < 90) return { label: 'Elevada', color: '#FFC107' };
    }
    return { label: 'Alta', color: '#F44336' };
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header scrollY={scrollY} onReadPress={() => {}} />

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View 
          style={styles.titleContainer}
          accessible={true}
          accessibilityRole="header"
          accessibilityLabel="Acompanhamento de Pressão. Controle sua pressão arterial"
        >
          <Text style={styles.title} importantForAccessibility="no">Acompanhamento de Pressão</Text>
          <Text style={styles.subtitle} importantForAccessibility="no">Controle sua pressão arterial</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/registropressao')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Registrar nova medição de pressão"
            accessibilityHint="Toca duas vezes para abrir o formulário de registro de pressão"
          >
            <Ionicons name="add" size={32} color="#fff" accessible={false} importantForAccessibility="no" />
            <Text style={styles.buttonText} importantForAccessibility="no">REGISTRAR PRESSÃO</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/dicaspressao')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Ler dicas de como aferir a pressão"
            accessibilityHint="Toca duas vezes para abrir o guia passo-a-passo"
          >
            <Ionicons name="information-circle" size={32} color="#fff" accessible={false} importantForAccessibility="no" />
            <Text style={styles.buttonText} importantForAccessibility="no">COMO AFERIR</Text>
          </TouchableOpacity>
        </View>

        {/* Histórico */}
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle} accessible={true} accessibilityRole="header">ÚLTIMAS MEDIÇÕES</Text>
          
          {isLoading ? (
            <ActivityIndicator size="large" color="#003164" />
          ) : readings.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma medição registrada</Text>
          ) : (
            readings.map((reading) => {
              const status = getPressureStatus(reading.systolic, reading.diastolic);
              return (
                <View 
                  key={reading.id} 
                  style={[styles.readingCard, { borderLeftColor: status.color }]}
                  accessible={true}
                  accessibilityLabel={`Medição com status ${status.label}. Pressão ${reading.systolic} por ${reading.diastolic} milímetros de mercúrio. Registrada no dia ${formatDate(reading.measuredAt)} às ${formatTime(reading.measuredAt)}.`}
                >
                  <View style={styles.readingValue}>
                    <Text style={styles.valueText} importantForAccessibility="no">{reading.systolic}/{reading.diastolic}</Text>
                    <Text style={styles.unitText} importantForAccessibility="no">mmHg</Text>
                  </View>
                  <View style={styles.readingInfo}>
                    <Text style={styles.dateText} importantForAccessibility="no">
                      {formatDate(reading.measuredAt)} às {formatTime(reading.measuredAt)}
                    </Text>
                    <Text style={[styles.statusText, { color: status.color }]} importantForAccessibility="no">{status.label}</Text>
                  </View>
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingTop: 280,
    paddingBottom: 40,
    
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    paddingHorizontal: 20,
    fontWeight: 'bold',
    color: '#003164',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#003164',
    marginTop: 8,
  },
  buttonContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    marginBottom: 12,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 20,
    marginLeft: 12,
  },
  historyContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
    flex: 1,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003164',
    marginBottom: 15,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  readingCard: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  readingValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginRight: 20,
  },
  valueText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003164',
  },
  unitText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  readingInfo: {
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    color: '#003164',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
});
