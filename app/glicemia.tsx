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

interface GlucoseReading {
  id: string;
  value: number;
  measuredAt: string;
  mealContext: string | null;
}

export default function GlicemiaScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const [readings, setReadings] = useState<GlucoseReading[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    const result = await api.getGlucoseHistory(5);
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

  const getMealLabel = (context: string | null) => {
    if (context === 'before') return 'Antes da refeição';
    if (context === 'after') return 'Após a refeição';
    return '';
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
          <Text style={styles.title}>Acompanhamento de Glicemia</Text>
          <Text style={styles.subtitle}>Controle sua glicemia</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/registroglicemia')}
          >
            <Ionicons name="add" size={32} color="#fff" />
            <Text style={styles.buttonText}>REGISTRAR GLICEMIA</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/dicasglicemia')}
          >
            <Ionicons name="information-circle" size={32} color="#fff" />
            <Text style={styles.buttonText}>COMO MEDIR</Text>
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
            readings.map((reading) => (
              <View key={reading.id} style={styles.readingCard}>
                <View style={styles.readingValue}>
                  <Text style={styles.valueText}>{reading.value}</Text>
                  <Text style={styles.unitText}>mg/dL</Text>
                </View>
                <View style={styles.readingInfo}>
                  <Text style={styles.dateText}>
                    {formatDate(reading.measuredAt)} às {formatTime(reading.measuredAt)}
                  </Text>
                  {reading.mealContext ? (
                    <Text style={styles.contextText}>{getMealLabel(reading.mealContext)}</Text>
                  ) : null}
                </View>
              </View>
            ))
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
    paddingLeft: 20,
    paddingRight: 20,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    paddingHorizontal: 20,
    fontWeight: 'bold',
    color: '#003164',
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
    borderLeftColor: '#2196F3',
  },
  readingValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginRight: 20,
  },
  valueText: {
    fontSize: 28,
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
  contextText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});
