

import Logo from '@assets/images/icone_lixo.svg'; // ícone do app
import { useRouter } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function TelaInicial() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topContainer}>
          <Logo width={'100%'} height={150} />
        {/* <Image
          source={{uri: '../assets/fotos/icone_lixo.svg'}} // ícone do app
          style={styles.logo}
        /> */}
        <Text style={styles.title}>APP Cidadão</Text>
        <Text style={styles.subtitle}>
          Ajude a melhorar sua cidade. Relate problemas urbanos com facilidade.
        </Text>
      </View>

      {/* Ilustração opcional */}
      {/* <Image
        source={require('./assets/city_illustration.png')}
        style={styles.illustration}
      /> */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.buttonPrimary} onPress={() => router.push('/cadastro/detalhes')}>
          <Text style={styles.buttonText}>Relatar um Problema</Text>
        </TouchableOpacity>

  <TouchableOpacity style={styles.buttonSecondary} onPress={() => router.push('/problemas-proximos')}>
          <Text style={styles.buttonTextSecondary}>Ver Problemas Próximos</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    padding: 24,
    justifyContent: 'space-between',
  },
  topContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E3A59',
    marginBottom: 8,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#6C7A93',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  illustration: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginVertical: 20,
  },
  buttonContainer: {
    marginBottom: 32,
  },
  buttonPrimary: {
    backgroundColor: '#1E88E5',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonSecondary: {
    borderColor: '#1E88E5',
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#1E88E5',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});
