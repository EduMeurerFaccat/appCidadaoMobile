import { useTheme } from '@/constants/useTheme';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const totalSteps = 4;

interface Props {
  currentStep: number;
}

export default function CadastroHeader({ currentStep }: Props) {
  const router = useRouter();
  const colors = useTheme();

  const progress = (currentStep / totalSteps) * 100;

  const sair = () => {
    router.replace('/'); // Volta para a tela principal
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={sair}>
          <Text style={[styles.cancelText, { color: colors.error ?? '#FF4D4D' }]}>Sair</Text>
        </TouchableOpacity>

        <Text style={[styles.stepText, { color: colors.text }]}>
          Etapa {currentStep} de {totalSteps}
        </Text>
      </View>

      <View style={[styles.progressContainer, { backgroundColor: colors.border }]}>
        <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: colors.tint }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight ?? 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  stepText: {
    fontSize: 14,
    fontWeight: '400',
  },
  progressContainer: {
    height: 6,
    width: '100%',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 10,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
});
