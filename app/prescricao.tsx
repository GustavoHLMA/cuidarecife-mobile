import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef } from 'react';
import {
  Animated,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function PrescricaoScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;

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
          <Ionicons name="volume-high" size={34} color="#004894" />
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
    marginBottom: 30,
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
});
