import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { 
  Animated, 
  Linking, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { api } from '@/services/api';

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  cep: string | null;
  phone: string | null;
  distance: number | null;
  fullAddress: string;
}

const ITEMS_PER_PAGE = 10;

export default function FarmaciasScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ medicationName?: string }>();
  const scrollY = new Animated.Value(0);
  
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [locationRequested, setLocationRequested] = useState(false);

  const requestLocationWithPrompt = async (): Promise<{ lat: number; lng: number } | null> => {
    // Show friendly modal first
    setShowLocationModal(true);
    return null; // Will be handled by modal buttons
  };

  const doRequestLocation = async (): Promise<{ lat: number; lng: number } | null> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocationError('Localização não permitida');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      setLocationError('Erro ao obter sua localização');
      return null;
    }
  };

  const loadPharmacies = async (withLocation: boolean = false) => {
    try {
      setLoading(true);
      let location: { lat: number; lng: number } | null = null;
      
      if (withLocation) {
        location = await doRequestLocation();
        setHasLocation(!!location);
      }
      
      const result = await api.getPharmacies(location || undefined);
      if (result.data?.data) {
        setPharmacies(result.data.data);
        setVisibleCount(ITEMS_PER_PAGE);
      }
    } catch (error) {
      console.error('Erro ao carregar farmácias:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // First load without location, then show modal
    loadPharmacies(false).then(() => {
      if (!locationRequested) {
        setShowLocationModal(true);
      }
    });
  }, []);

  const handleLocationAccept = async () => {
    setShowLocationModal(false);
    setLocationRequested(true);
    await loadPharmacies(true);
  };

  const handleLocationDecline = () => {
    setShowLocationModal(false);
    setLocationRequested(true);
    // Already loaded without location
  };

  const handleBack = () => {
    router.back();
  };

  const handleCall = (phoneNumber: string) => {
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    const phoneUrl = `tel:${cleanPhone}`;
    Linking.openURL(phoneUrl);
  };

  const handleOpenMaps = (fullAddress: string) => {
    const encodedAddress = encodeURIComponent(fullAddress);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    Linking.openURL(googleMapsUrl);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setLocationError(null);
    loadPharmacies(hasLocation);
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

  const formatDistance = (distance: number | null): string => {
    if (distance === null) return '';
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    }
    return `${distance.toFixed(1)} km`;
  };

  const visiblePharmacies = pharmacies.slice(0, visibleCount);
  const hasMore = visibleCount < pharmacies.length;

  return (
    <View style={styles.container}>
      {/* Location Permission Modal */}
      <Modal
        visible={showLocationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Ionicons name="location" size={50} color="#004894" />
            </View>
            <Text style={styles.modalTitle}>Encontrar farmácias próximas</Text>
            <Text style={styles.modalText}>
              Para mostrar as farmácias mais perto de você, precisamos acessar sua localização.
            </Text>
            <Text style={styles.modalSubtext}>
              Sua localização é usada apenas para ordenar por distância e não é armazenada.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButtonSecondary} onPress={handleLocationDecline}>
                <Text style={styles.modalButtonSecondaryText}>Agora não</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonPrimary} onPress={handleLocationAccept}>
                <Ionicons name="location" size={20} color="#fff" />
                <Text style={styles.modalButtonPrimaryText}>Permitir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Animated.View
        style={[
          styles.header,
          {
            transform: [{ translateY: scrollY.interpolate({ inputRange: [0, 200], outputRange: [0, -150], extrapolate: 'clamp' }) }],
          },
        ]}
      >
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#004894" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <Ionicons name="volume-high" size={34} color="#074173" />
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollView}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#004894']} />
        }
      >
        <Text style={styles.title}>FARMÁCIAS POPULARES</Text>
        
        {/* Status de localização */}
        {hasLocation ? (
          <View style={styles.locationBanner}>
            <Ionicons name="location" size={18} color="#4CAF50" />
            <Text style={styles.locationText}>Ordenado por proximidade</Text>
          </View>
        ) : locationError ? (
          <TouchableOpacity style={styles.locationErrorBanner} onPress={() => setShowLocationModal(true)}>
            <Ionicons name="location-outline" size={18} color="#FF9800" />
            <Text style={styles.locationErrorText}>Toque para ativar localização</Text>
          </TouchableOpacity>
        ) : locationRequested ? (
          <TouchableOpacity style={styles.locationErrorBanner} onPress={() => setShowLocationModal(true)}>
            <Ionicons name="location-outline" size={18} color="#2196F3" />
            <Text style={[styles.locationErrorText, { color: '#1976D2' }]}>Ativar ordenação por proximidade</Text>
          </TouchableOpacity>
        ) : null}

        {params.medicationName ? (
          <View style={styles.medicationBanner}>
            <Ionicons name="medical" size={20} color="#004894" />
            <Text style={styles.medicationText}>
              Procurando: <Text style={{ fontWeight: 'bold' }}>{params.medicationName}</Text>
            </Text>
          </View>
        ) : null}

        {/* Lembretes */}
        <View style={styles.documentButton}>
          <Text style={styles.buttonText}>LEVAR DOCUMENTO OFICIAL COM FOTO E CPF</Text>
        </View>
        <View style={[styles.documentButton, { marginBottom: 20 }]}>
          <Text style={styles.buttonText}>LEVAR RECEITA MÉDICA</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#004894" />
            <Text style={styles.loadingText}>Buscando farmácias...</Text>
          </View>
        ) : pharmacies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="sad-outline" size={48} color="#074173" />
            <Text style={styles.emptyText}>Nenhuma farmácia encontrada</Text>
          </View>
        ) : (
          <>
            {visiblePharmacies.map((pharmacy) => (
              <View key={pharmacy.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <Ionicons name="medical" size={28} color="#FFCB00" />
                    <Text style={styles.cardTitle} numberOfLines={2}>{pharmacy.name}</Text>
                  </View>
                  {pharmacy.distance !== null ? (
                    <View style={styles.distanceBadge}>
                      <Ionicons name="navigate" size={14} color="#fff" />
                      <Text style={styles.distanceText}>{formatDistance(pharmacy.distance)}</Text>
                    </View>
                  ) : null}
                </View>
                
                <View style={styles.cardContent}>
                  <View style={styles.infoRow}>
                    <Ionicons name="location" size={18} color="#FFCB00" />
                    <Text style={styles.cardAddress}>{pharmacy.address}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="business" size={18} color="#FFCB00" />
                    <Text style={styles.cardNeighborhood}>{pharmacy.neighborhood}</Text>
                  </View>
                </View>
                
                <View style={styles.cardActions}>
                  {pharmacy.phone ? (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleCall(pharmacy.phone!)}
                    >
                      <Ionicons name="call" size={18} color="#074173" />
                      <Text style={styles.actionButtonText}>LIGAR</Text>
                    </TouchableOpacity>
                  ) : null}
                  
                  <TouchableOpacity
                    style={[styles.actionButton, styles.mapsButton]}
                    onPress={() => handleOpenMaps(pharmacy.fullAddress)}
                  >
                    <Ionicons name="map" size={18} color="#fff" />
                    <Text style={[styles.actionButtonText, { color: '#fff' }]}>VER NO MAPS</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Load More Button */}
            {hasMore ? (
              <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore}>
                <Text style={styles.loadMoreText}>
                  Ver mais ({pharmacies.length - visibleCount} restantes)
                </Text>
                <Ionicons name="chevron-down" size={20} color="#004894" />
              </TouchableOpacity>
            ) : null}
          </>
        )}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Mostrando {visiblePharmacies.length} de {pharmacies.length} farmácias
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#82BDFB',
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    width: 150,
    height: 60,
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  backText: {
    color: '#004894',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 22,
  },
  title: {
    color: '#004894',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalIcon: {
    backgroundColor: '#E3F2FD',
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#004894',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  modalSubtext: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#004894',
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    color: '#004894',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonPrimary: {
    flex: 1.2,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 25,
    backgroundColor: '#004894',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  modalButtonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Location banners
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
    gap: 6,
  },
  locationText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '500',
  },
  locationErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3E0',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
    gap: 6,
  },
  locationErrorText: {
    color: '#E65100',
    fontSize: 14,
    fontWeight: '500',
  },
  medicationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    gap: 8,
  },
  medicationText: {
    color: '#004894',
    fontSize: 16,
  },
  documentButton: {
    backgroundColor: '#FFCB00',
    paddingVertical: 15,
    marginBottom: 15,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: '5%',
    width: '90%',
    alignSelf: 'center',
  },
  buttonText: {
    color: '#002867',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  scrollView: {
    paddingBottom: 20,
    paddingTop: 100,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: '#004894',
    fontSize: 16,
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#074173',
    fontSize: 18,
    marginTop: 12,
  },
  card: {
    backgroundColor: '#074173',
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 8,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    gap: 4,
  },
  distanceText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardAddress: {
    fontSize: 15,
    color: '#fff',
    flex: 1,
  },
  cardNeighborhood: {
    fontSize: 14,
    color: '#ccc',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 12,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFCB00',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    gap: 6,
  },
  mapsButton: {
    backgroundColor: '#004894',
  },
  actionButtonText: {
    color: '#074173',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 30,
    marginBottom: 20,
    gap: 8,
  },
  loadMoreText: {
    color: '#004894',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    color: '#004894',
    fontSize: 14,
  },
});
