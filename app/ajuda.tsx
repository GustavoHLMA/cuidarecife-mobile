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
import MarkdownDisplay from 'react-native-markdown-display'; 

const API_URL = 'http://192.168.0.155:3001/chat'; // <<< IMPORTANT: Configure this

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
  const scrollViewRef = useRef<ScrollView>(null);

  const roboImage = require('@/assets/images/robo.png');

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: trimmedInput }),
      });

      const contentType = response.headers.get("content-type");
      if (!response.ok) {
        let errorData;
        if (contentType && contentType.indexOf("application/json") !== -1) {
          errorData = await response.json();
        } else {
          const errorText = await response.text();
          console.error('Backend error (not JSON):', errorText);
          throw new Error(errorText.substring(0, 100) || 'Falha ao conectar com o assistente. Resposta não é JSON.');
        }
        throw new Error(errorData.error || 'Falha ao conectar com o assistente.');
      }

      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        const aiReply: Message = {
          id: Date.now().toString() + '-ai',
          text: data.reply,
          sender: 'ai',
        };
        setMessages((prevMessages) => [...prevMessages, aiReply]);
      } else {
        const responseText = await response.text();
        console.error('Unexpected content type from backend:', contentType, 'Response text:', responseText);
        throw new Error('Resposta inesperada do servidor.');
      }

    } catch (error: any) {
      console.error('Error in handleSendMessage:', error);
      Alert.alert('Erro', error.message || 'Não foi possível obter uma resposta do assistente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // Ajustado o offset
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
            {msg.sender === 'ai' && (
              <ExpoImage source={roboImage} style={styles.aiAvatar} />
            )}
            <View
              style={[
                styles.messageBubble,
                msg.sender === 'user' ? styles.userMessage : styles.aiMessage,
              ]}
            >
              {msg.sender === 'user' ? (
                <Text style={styles.userMessageText}>{msg.text}</Text>
              ) : (
                <MarkdownDisplay
                  style={{
                    body: styles.aiMessageText, // Estilo base para o corpo do markdown
                  }}
                >
                  {msg.text}
                </MarkdownDisplay>
              )}
            </View>
          </View>
        ))}
        {isLoading && messages[messages.length -1].sender === 'user' && (
          <View style={[styles.messageRow, styles.aiMessageRow]}>
            <ExpoImage source={roboImage} style={styles.aiAvatar} />
            <View style={[styles.messageBubble, styles.aiMessage, styles.loadingBubble]}>
              <ActivityIndicator size="small" color="#003164" />
            </View>
          </View>
        )}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Digite sua dúvida sobre saúde..."
          placeholderTextColor="#646262"
          editable={!isLoading}
        />
        <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton} disabled={isLoading}>
          {isLoading && messages[messages.length -1].sender !== 'user' ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    paddingTop: 50,
    marginBottom: 20, 
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
    maxWidth: '80%',
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#DDD',
  },
  input: {
    flex: 1,
    height: 45,
    backgroundColor: '#F0F0F0',
    borderRadius: 22,
    paddingHorizontal: 15,
    marginRight: 10,
    fontSize: 16,
    borderColor: '#E0E0E0',
  },
  sendButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
