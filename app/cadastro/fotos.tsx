import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useProblem } from '@/contexts/ProblemaContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Image, KeyboardAvoidingView, Platform, TouchableOpacity, View } from 'react-native';

export default function FotosProblema() {
  const { setData, data } = useProblem();

  const pickImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;

      setData(prev => ({
        ...prev,
        fotos: [...(prev.fotos || []), uri],
      }));
    }
  };

  function removerFoto(index: number): void {
    setData(prev => {
      const fotosAtualizadas = [...(prev.fotos || [])];
      fotosAtualizadas.splice(index, 1);
      return { ...prev, fotos: fotosAtualizadas };
    });
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ThemedView style={{ flex: 1, padding: 20 }}>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {data.fotos && data.fotos.length > 0 ? (
            data.fotos.slice(0, 4).map((photo, index) => (
              <View
                key={index}
                style={{
                  width: '48%',
                  aspectRatio: 1,
                  marginBottom: 10,
                  borderRadius: 8,
                  overflow: 'hidden',
                }}
              >
                <Image
                  source={{ uri: photo }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => removerFoto(index)}
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    backgroundColor: 'rgb(255, 0, 0)',
                    borderRadius: 12,
                    padding: 2,
                  }}
                >
                  <Ionicons name="trash" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <TouchableOpacity
              onPress={pickImage}
              style={{
                width: '100%',
                aspectRatio: 1,
                marginBottom: 10,
                borderRadius: 8,
                borderStyle: 'dashed',
                borderWidth: 2,
                borderColor: '#888',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="camera-outline" size={40} color="#888" />
              <ThemedText style={{ marginTop: 8, color: '#888' }}>Adicionar foto</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {data.fotos && data.fotos?.length > 0 && data.fotos.length < 4 && (
          <ThemedButton title="Adicionar mais fotos" onPress={pickImage} />
        )}
        {!data.fotos || data.fotos.length === 0 ? (
          <ThemedText style={{ color: '#c62828', marginTop: 8, fontSize: 12 }}>Adicione pelo menos uma foto para continuar.</ThemedText>
        ) : null}
        {/* Botão fixo na parte inferior */}
        <View style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
          <ThemedButton
            title="Próximo"
            onPress={() => {
              if (!data.fotos || data.fotos.length === 0) return; 
              router.push('/cadastro/localizacao');
            }}
            style={!data.fotos || data.fotos.length === 0 ? { opacity: 0.5 } : undefined}
            disabled={!data.fotos || data.fotos.length === 0}
          />
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
