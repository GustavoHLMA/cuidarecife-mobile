import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FeedbackPopupProps {
  visible: boolean;
  question: string;
  featureName: string;
  details?: string;
  onClose: () => void;
}

export default function FeedbackPopup({ visible, question, featureName, details, onClose }: FeedbackPopupProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Consider replacing with the actual API URL pointing to the deployed backend
  const API_URL = 'http://localhost:3001/feedback/mobile';

  const handleSubmit = async (rating: number) => {
    setSelectedRating(rating);
    setIsSubmitting(true);
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, feature: featureName, details }),
      });
      
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setSelectedRating(null);
          onClose(); // Close modal after success message
        }, 2000);
      } else {
        console.error('Failed to submit feedback');
        setIsSubmitting(false);
        onClose(); // Fail silently for the user
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setIsSubmitting(false);
      onClose(); // Fail silently
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {success ? (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
              <Text style={styles.successText}>Obrigado pela sua avaliação!</Text>
            </View>
          ) : (
            <>
              <Text style={styles.questionText}>{question}</Text>
              
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    disabled={isSubmitting}
                    onPress={() => handleSubmit(star)}
                    style={styles.starButton}
                  >
                    <Ionicons 
                      name={selectedRating && selectedRating >= star ? "star" : "star-outline"} 
                      size={36} 
                      color={selectedRating && selectedRating >= star ? "#FFD700" : "#C0C0C0"} 
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {isSubmitting ? (
                <ActivityIndicator size="small" color="#2196F3" style={styles.loader} />
              ) : (
                <TouchableOpacity onPress={onClose} style={styles.laterButton}>
                  <Text style={styles.laterText}>Responder mais tarde</Text>
                </TouchableOpacity>
              )}
            </>
          )}
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
    padding: 20,
  },
  container: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#074173',
    textAlign: 'center',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  laterButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  laterText: {
    color: '#646262',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  loader: {
    marginTop: 10,
    marginBottom: 10,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  successText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  }
});
