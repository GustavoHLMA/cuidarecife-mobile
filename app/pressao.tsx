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
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Acompanhamento de Pressão</Text>
          <Text style={styles.subtitle}>Controle sua pressão arterial</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/registropressao')}
          >
            <Ionicons name="add" size={32} color="#fff" />
            <Text style={styles.buttonText}>REGISTRAR PRESSÃO</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/dicaspressao')}
          >
            <Ionicons name="information-circle" size={32} color="#fff" />
            <Text style={styles.buttonText}>COMO AFERIR</Text>
          </TouchableOpacity>
        </View>

        {/* Histórico */}
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>ÚLTIMAS MEDIÇÕES</Text>
          
          {isLoading ? (
            <ActivityIndicator size="large" color="#003164" />
          ) : readings.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma medição registrada</Text>
          ) : (
            readings.map((reading) => {
              const status = getPressureStatus(reading.systolic, reading.diastolic);
              return (
                <View key={reading.id} style={[styles.readingCard, { borderLeftColor: status.color }]}>
                  <View style={styles.readingValue}>
                    <Text style={styles.valueText}>{reading.systolic}/{reading.diastolic}</Text>
                    <Text style={styles.unitText}>mmHg</Text>
                  </View>
                  <View style={styles.readingInfo}>
                    <Text style={styles.dateText}>
                      {formatDate(reading.measuredAt)} às {formatTime(reading.measuredAt)}
                    </Text>
                    <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
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
