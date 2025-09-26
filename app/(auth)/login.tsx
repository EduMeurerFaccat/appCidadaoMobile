import { ThemedButton } from '@/components/ThemedButton';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@contexts/AuthContext';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export default function LoginScreen() {
  const { login, registerVisitor } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {

      let r = await login(email, password);
      console.log('Login realizado com sucesso:', r);
      
      // Aqui você pode salvar o token ou usuário retornado, se necessário
      // Redireciona para a tela principal
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erro ao fazer login');
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Nome do App no topo, fixo */}
      <ThemedText type="title" style={styles.appName}>
        APP Cidadão
      </ThemedText>
      {/* Fundo SVG */}
      <ThemedText type='title' style={{}}>Login</ThemedText>
      <BackgroundSVG />

      {/* Formulário de Login */}
      <ThemedView style={styles.form}>
        <ThemedInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <ThemedInput
          placeholder="Senha"
          value={password}
          secureTextEntry
          onChangeText={setPassword}
          style={styles.input}
        />
        {error && <ThemedText style={styles.error}>{error}</ThemedText>}
        <ThemedButton style={{backgroundColor: "#6C63FF"}} title="Entrar" onPress={handleLogin} />
        <ThemedButton
          title="Entrar como Visitante"
          onPress={async () => {
            setError(null);
            try {
              await registerVisitor();
              router.replace('/(tabs)');
            } catch (e: any) {
              setError(e.response?.data?.message || 'Erro ao registrar visitante');
            }
          }}
          style={styles.anonButton}
        />
        <ThemedText style={{textAlign: 'center'}} type="link" onPress={() => router.push('/(auth)/register')}>
          Não tem uma conta? Cadastre-se
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

function BackgroundSVG() {
  return (
    <Svg
      width="100%"
      height="300"
      
      style={{ position: 'absolute', top: 0 }}
    >
      <Path
        fill="#6C63FF"
        d="M0,192L48,202.7C96,213,192,235,288,213.3C384,192,480,128,576,101.3C672,75,768,85,864,96C960,107,1056,117,1152,106.7C1248,96,1344,64,1392,48L1440,32V0H0Z"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  appName: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 'bold',
    zIndex: 2,
    fontFamily: 'SpaceMono-Regular', // Fonte personalizada
  },
  form: {
    width: '100%',
    maxWidth: 350,
    padding: 20,
    borderRadius: 12,
    zIndex: 1,
  },
  input: {
    marginBottom: 12,
  },
  error: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  anonButton: {
    marginTop: 12,
    borderColor: '#6C63FF',
    borderWidth: 1,
  },
});
