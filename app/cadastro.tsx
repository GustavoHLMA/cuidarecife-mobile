import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';

export default function CadastroScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register } = useAuth();
  const { showToast, showModal } = useUI();

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      showToast('Opa! Nome, e-mail e senha são obrigatórios.', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('A senha precisa ter pelo menos 6 caracteres.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('As senhas não conferem. Pode dar uma olhadinha?', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(name.trim(), email.trim(), password, neighborhood.trim() || undefined);

      if (result.success) {
        showToast('Conta criada com sucesso! Bem-vindo(a)!', 'success');
        router.replace('/(tabs)/medicamentos');
      } else {
        showModal('Eita!', result.error || 'Não conseguimos criar sua conta agora.');
      }
    } catch (error) {
      showModal('Eita!', 'Tivemos um probleminha técnico. Pode tentar de novo?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#82BDFB" />
      
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/cuidarecife.png')}
          style={styles.logo}
          contentFit="contain"
          accessible={true}
          accessibilityRole="image"
          accessibilityLabel="Logomarca do Cuida Recife"
        />
      </View>

      <View style={styles.formContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title} accessible={true} accessibilityRole="header">
            Criar Conta
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={24} color="#004894" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nome Completo"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              accessible={true}
              accessibilityLabel="Nome Completo"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={24} color="#004894" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              accessible={true}
              accessibilityLabel="E-mail"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="map-outline" size={24} color="#004894" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Bairro (Opcional)"
              placeholderTextColor="#999"
              value={neighborhood}
              onChangeText={setNeighborhood}
              accessible={true}
              accessibilityLabel="Bairro"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={24} color="#004894" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              accessible={true}
              accessibilityLabel="Senha"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={24}
                color="#004894"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={24} color="#004894" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirmar Senha"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              accessible={true}
              accessibilityLabel="Confirmar Senha"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Cadastrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.loginLink} 
            onPress={() => router.back()}
            disabled={isLoading}
          >
            <Text style={styles.loginLinkText}>
              Já tem uma conta? <Text style={styles.loginLinkBold}>Entrar</Text>
            </Text>
          </TouchableOpacity>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#82BDFB',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  logo: {
    width: 200,
    height: 70,
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 30,
    paddingTop: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#004894',
    marginBottom: 25,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 12,
    height: 55,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#004894',
    borderRadius: 15,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#9CB8D8',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#666',
    fontSize: 16,
  },
  loginLinkBold: {
    color: '#004894',
    fontWeight: 'bold',
  },
});
