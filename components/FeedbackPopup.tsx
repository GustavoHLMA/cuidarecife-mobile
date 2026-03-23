import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { useUI } from '@/contexts/UIContext';

interface FeedbackPopupProps {
  visible: boolean;
  question: string;
  featureName: "CHATBOT" | "OCR" | "CHATBOT_MSG";
  details?: string;
  onClose: () => void;
}

export default function FeedbackPopup({ visible, question, featureName, details, onClose }: FeedbackPopupProps) {
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showModal, showToast } = useUI();

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    try {
      const response = await api.submitMobileFeedback(featureName, rating, details);
      if (response.error) {
        showModal('Poxa, deu erro', response.error);
        return;
      }
      onClose(); // Fechar com sucesso
    } catch (error) {
      showToast('Não conseguimos receber sua nota agora. Obrigado por tentar!', 'error');
    } finally {
      setIsSubmitting(false);
      setRating(0); // reset state
    }
  };

  const handleLater = () => {
    setRating(0);
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.popupContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Avaliação rápída</Text>
            <TouchableOpacity onPress={handleLater} disabled={isSubmitting}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.question}>{question}</Text>
          
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                disabled={isSubmitting}
                style={styles.starButton}
              >
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={40}
                  color={star <= rating ? "#FFD700" : "#CCCCCC"}
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.laterButton} 
              onPress={handleLater}
              disabled={isSubmitting}
            >
              <Text style={styles.laterText}>Responder depois</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.submitButton, 
                (rating === 0 || isSubmitting) && styles.submitDisabled
              ]} 
              onPress={handleSubmit}
              disabled={rating === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitText}>Enviar Avaliação</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003164',
  },
  question: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 25,
    gap: 10,
  },
  starButton: {
    padding: 2,
  },
  actions: {
    flexDirection: 'column',
    gap: 12,
  },
  submitButton: {
    backgroundColor: '#003164',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitDisabled: {
    backgroundColor: '#B0BEC5',
  },
  submitText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  laterButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  laterText: {
    color: '#666',
    fontSize: 14,
    textDecorationLine: 'underline',
  }
});
