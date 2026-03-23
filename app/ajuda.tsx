import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { Markdown } from '@docren/react-native-markdown';
import { api } from '@/services/api';
import * as Speech from 'expo-speech';
import FeedbackPopup from '@/components/FeedbackPopup';
import { useFeatureFeedback } from '@/hooks/useFeatureFeedback';
import { useUI } from '@/contexts/UIContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

export default function AjudaScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial-ai-message',
      text: 'Olá! Sou Doc, seu assistente de saúde. Como posso ajudar você hoje?',
      sender: 'ai',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const [activeMessageToRate, setActiveMessageToRate] = useState<Message | null>(null);
  const { showFeedback, incrementUsage, closeFeedback } = useFeatureFeedback("CHATBOT", 3);
  const { showModal } = useUI();

  const roboImage = require('@/assets/images/robo.png');

  // --- Text-to-Speech (Ouvir respostas) ---
  const handleSpeakMessage = (message: Message) => {
    if (speakingMessageId === message.id) {
      Speech.stop();
      setSpeakingMessageId(null);
      return;
    }

    Speech.stop();
    // Remove markdown formatting for cleaner speech
    const cleanText = message.text
      .replace(/[#*_~`>\-\[\]()!]/g, '')
      .replace(/\n+/g, '. ');

    Speech.speak(cleanText, {
      language: 'pt-BR',
      onStart: () => setSpeakingMessageId(message.id),
      onDone: () => setSpeakingMessageId(null),
      onStopped: () => setSpeakingMessageId(null),
      onError: () => setSpeakingMessageId(null),
    });
  };

  // Auto-read new AI messages
  const lastMessageRef = useRef<string | null>(null);
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.sender === 'ai' && lastMsg.id !== 'initial-ai-message' && lastMsg.id !== lastMessageRef.current) {
      lastMessageRef.current = lastMsg.id;
      handleSpeakMessage(lastMsg);
    }
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { Speech.stop(); };
  }, []);

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Botão de microfone: foca no input para ativar teclado de voz nativo
  const handleMicPress = () => {
    showModal(
      'Entrada por Voz',
      'Para ditar sua mensagem:\n\n1. Toque no campo de texto\n2. No teclado, toque no ícone de microfone 🎤\n3. Fale sua mensagem\n\nO teclado do seu celular possui reconhecimento de voz nativo.',
      [{ text: 'Entendi', onPress: () => inputRef.current?.focus() }]
    );
  };

  const handleSendMessage = async () => {
    const trimmedInput = inputText.trim();
    if (trimmedInput === '' || isLoading) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: trimmedInput,
      sender: 'user',
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const chatHistory = messages
        .filter(msg => msg.id !== 'initial-ai-message')
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'model' as const,
          content: msg.text,
        }));

      const result = await api.sendChatMessage(trimmedInput, chatHistory);

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.data?.reply) {
        const aiReply: Message = {
          id: Date.now().toString() + '-ai',
          text: result.data.reply,
          sender: 'ai',
        };
        setMessages((prevMessages) => [...prevMessages, aiReply]);
        await incrementUsage(); // Abre o popup a cada 3 respostas do bot
      } else {
        throw new Error('Resposta inesperada do servidor.');
      }

    } catch (error: any) {
      console.error('[Chat] Erro:', error);
      showModal('Poxa...', error.message || 'O Doc Dida está com problemas para responder agora. Quer tentar mais tarde?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
    >
      <Stack.Screen options={{ title: 'Ajuda - Chat Saúde' }} />
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContentContainer}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageRow,
              msg.sender === 'user' ? styles.userMessageRow : styles.aiMessageRow,
            ]}
          >
            {msg.sender === 'ai' ? (
              <ExpoImage source={roboImage} style={styles.aiAvatar} accessible={false} importantForAccessibility="no" />
            ) : null}
            <View
              style={[
                styles.messageBubble,
                msg.sender === 'user' ? styles.userMessage : styles.aiMessage,
              ]}
              accessible={true}
              accessibilityRole="text"
              accessibilityLabel={msg.sender === 'user' ? `Você disse: ${msg.text}` : `A inteligência artificial disse: ${msg.text}`}
            >
              {msg.sender === 'user' ? (
                <Text style={styles.userMessageText} importantForAccessibility="no">{msg.text}</Text>
              ) : (
                <View>
                  <Markdown
                    styles={{
                      text: styles.aiMessageText,
                    }}
                    markdown={msg.text}
                  />
                  {msg.id !== 'initial-ai-message' && (
                    <TouchableOpacity 
                      style={styles.rateMessageButton} 
                      onPress={() => setActiveMessageToRate(msg)}
                    >
                      <Ionicons name="thumbs-up-outline" size={14} color="#003164" />
                      <Text style={styles.rateMessageText}>Avaliar resposta</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
            {/* Botão de ouvir na mensagem da IA */}
            {msg.sender === 'ai' ? (
              <TouchableOpacity
                onPress={() => handleSpeakMessage(msg)}
                style={styles.speakButton}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={speakingMessageId === msg.id ? "Parar de ouvir resposta" : "Ouvir resposta em voz alta"}
              >
                <Ionicons 
                  name={speakingMessageId === msg.id ? "stop-circle" : "volume-high"} 
                  size={20} 
                  color={speakingMessageId === msg.id ? "#FF4444" : "#2196F3"} 
                />
              </TouchableOpacity>
            ) : null}
          </View>
        ))}
        {isLoading ? (messages[messages.length -1].sender === 'user' ? (
          <View style={[styles.messageRow, styles.aiMessageRow]}>
            <ExpoImage source={roboImage} style={styles.aiAvatar} />
            <View style={[styles.messageBubble, styles.aiMessage, styles.loadingBubble]}>
              <ActivityIndicator size="small" color="#003164" />
            </View>
          </View>
        ) : null) : null}
      </ScrollView>
      <View style={styles.inputContainer}>
        {/* Botão do microfone - ativa teclado de voz nativo */}
        <TouchableOpacity
          onPress={handleMicPress}
          style={styles.micButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Usar entrada de voz"
          accessibilityHint="Toque para saber como ditar sua mensagem usando o microfone do teclado"
        >
          <Ionicons name="mic-outline" size={24} color="#2196F3" />
        </TouchableOpacity>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Digite sua dúvida sobre saúde..."
          placeholderTextColor="#646262"
          editable={!isLoading}
          multiline
          accessible={true}
          accessibilityLabel="Campo de entrada da mensagem"
          accessibilityHint="Digite aqui a sua pergunta ou use o microfone do teclado para ditar"
        />
        <TouchableOpacity 
          onPress={handleSendMessage} 
          style={styles.sendButton} 
          disabled={isLoading}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Enviar mensagem"
          accessibilityState={{ disabled: isLoading }}
        >
          {isLoading ? (messages[messages.length -1].sender !== 'user' ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={24} color="#fff" />
          )) : (
            <Ionicons name="send" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
      <FeedbackPopup 
        visible={showFeedback}
        question="Quanto a nossa conversa agora tirou as suas dúvidas?"
        featureName="CHATBOT"
        onClose={closeFeedback}
      />
      <FeedbackPopup 
        visible={!!activeMessageToRate}
        question="Como você avalia essa resposta específica?"
        featureName="CHATBOT_MSG"
        details={activeMessageToRate?.text}
        onClose={() => setActiveMessageToRate(null)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    paddingTop: 50,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messagesContentContainer: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-end',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  aiMessageRow: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  userMessage: {
    backgroundColor: '#2196F3',
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 18,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  aiMessage: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 18,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  userMessageText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  aiMessageText: {
    fontSize: 16,
    color: '#000000',
  },
  loadingBubble: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  speakButton: {
    marginLeft: 6,
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#DDD',
    marginBottom: 10,
  },
  micButton: {
    padding: 10,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  input: {
    flex: 1,
    minHeight: 45,
    maxHeight: 100,
    backgroundColor: '#F0F0F0',
    borderRadius: 22,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    borderColor: '#E0E0E0',
    borderWidth: 1,
  },
  sendButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rateMessageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rateMessageText: {
    fontSize: 12,
    color: '#003164',
    marginLeft: 4,
  }
});
