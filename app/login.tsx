import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';

export default function LoginScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const [isLogin, setIsLogin] = useState(params.mode !== 'register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, register } = useAuth();
  const { showToast, showModal } = useUI();

  useEffect(() => {
    setIsLogin(params.mode !== 'register');
  }, [params.mode]);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      showToast('Opa! Faltou preencher alguma coisa. Pode dar uma olhadinha?', 'error');
      return;
    }

    if (!isLogin && !name.trim()) {
      showToast('Como devemos te chamar? Por favor, digite seu nome.', 'error');
      return;
    }

    if (!isLogin && !neighborhood.trim()) {
      showToast('Pode me dizer o seu bairro? Assim achamos o posto mais perto de você.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(email.trim(), password);
      } else {
        result = await register(name.trim(), email.trim(), password, neighborhood.trim());
      }

      if (result.success) {
        router.replace('/(tabs)/medicamentos');
      } else {
        let errorMsg = result.error || 'Não conseguimos entrar na sua conta agora.';
        if (errorMsg === 'Invalid email or password' || errorMsg === 'Email ou senha inválidos') {
          errorMsg = 'Poxa, parece que o email ou a senha estão incorretos. Que tal tentar novamente?';
        } else if (errorMsg === 'Invalid email format') {
          errorMsg = 'O formato do email parece estranho. Pode dar uma olhadinha e conferir se está tudo certo?';
        }
        showModal('Eita!', errorMsg);
      }
    } catch (error) {
      showModal('Eita!', 'Tivemos um probleminha. Pode tentar de novo?');
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
        <Text style={styles.title} accessible={true} accessibilityRole="header">
          {isLogin ? 'Entrar' : 'Criar Conta'}
        </Text>

        {!isLogin ? (
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={24} color="#004894" style={styles.inputIcon} accessible={false} importantForAccessibility="no" />
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              accessible={true}
              accessibilityLabel="Campo de entrada para o seu Nome completo"
              accessibilityHint="Digite o seu nome completo para o cadastro"
            />
          </View>
        ) : null}

        {!isLogin ? (
          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={24} color="#004894" style={styles.inputIcon} accessible={false} importantForAccessibility="no" />
            <TextInput
              style={styles.input}
              placeholder="Seu bairro (ex: Boa Viagem)"
              placeholderTextColor="#999"
              value={neighborhood}
              onChangeText={setNeighborhood}
              autoCapitalize="words"
              accessible={true}
              accessibilityLabel="Campo de entrada para o seu bairro"
              accessibilityHint="Digite seu bairro para que possamos encontrar farmácias próximas baseadas nele."
            />
          </View>
        ) : null}

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={24} color="#004894" style={styles.inputIcon} accessible={false} importantForAccessibility="no" />
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            accessible={true}
            accessibilityLabel="Campo de entrada para o seu E-mail"
            accessibilityHint="Digite o seu endereço de email"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={24} color="#004894" style={styles.inputIcon} accessible={false} importantForAccessibility="no" />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            accessible={true}
            accessibilityLabel="Campo de entrada para a sua Senha"
            accessibilityHint="Digite a sua senha segura"
          />
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha digitada'}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={24}
              color="#004894"
              accessible={false}
              importantForAccessibility="no"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={isLogin ? 'Entrar na conta' : 'Criar nova conta'}
          accessibilityHint={isLogin ? 'Toca duas vezes para acessar o aplicativo.' : 'Toca duas vezes para registrar a sua nova conta.'}
          accessibilityState={{ disabled: isLoading }}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isLogin ? 'Entrar' : 'Criar conta'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => setIsLogin(!isLogin)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={isLogin ? 'Não tem uma conta? Botão para ir para a tela de Cadastro' : 'Já tem uma conta? Botão para Voltar ao Entrar'}
        >
          <Text style={styles.switchText} importantForAccessibility="no">
            {isLogin
              ? 'Não tem uma conta? Cadastre-se'
              : 'Já tem uma conta? Entrar'}
          </Text>
        </TouchableOpacity>
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
    paddingTop: 80,
    paddingBottom: 40,
  },
  logo: {
    width: 220,
    height: 80,
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#004894',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 15,
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
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    color: '#004894',
    fontSize: 16,
  },
});
