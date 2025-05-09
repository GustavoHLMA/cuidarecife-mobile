import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
import React from 'react';
import { Button, StyleSheet } from 'react-native';
    
    export default function LoginScreen() {
      const router = useRouter();
    
      const handleLogin = async () => {
        console.log('Login bem-sucedido');
        router.replace('/(tabs)/medicamentos'); // Alterado de volta para a rota específica
      };
    
      return (
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={styles.title}>Login</ThemedText>
          <Button title="Entrar" onPress={handleLogin} />
        </ThemedView>
      );
    }
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
      },
      title: {
        marginBottom: 20,
        textAlign: 'center',
      },
      input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
        backgroundColor: 'white', // Adicionado para melhor visibilidade em temas escuros
      },
    });
