import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useProblem } from '@/contexts/ProblemaContext';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';

export default function FotosProblema() {
  const { setData, data } = useProblem();
  const cameraRef = useRef<CameraView | null>(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'back' | 'front'>('back');
  const [permission, requestPermission] = useCameraPermissions();

  const showPermissionDeniedAlert = useCallback(() => {
    Alert.alert(
      'Permissão necessária',
      'Precisamos de acesso à câmera para registrar as fotos do problema. Ajuste as permissões nas configurações do sistema.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Abrir configurações',
          onPress: () => {
            if (Linking.openSettings) {
              Linking.openSettings();
            }
          },
        },
      ],
    );
  }, []);

  const ensureCameraPermission = useCallback(async () => {
    if (permission?.granted) {
      return true;
    }

    if (permission && !permission.canAskAgain) {
      showPermissionDeniedAlert();
      return false;
    }

    const response = await requestPermission();

    if (response.granted) {
      return true;
    }

    if (!response.canAskAgain) {
      showPermissionDeniedAlert();
    } else {
      Alert.alert('Permissão negada', 'Não foi possível liberar o acesso à câmera.');
    }

    return false;
  }, [permission, requestPermission, showPermissionDeniedAlert]);

  const handleOpenCamera = useCallback(async () => {
    if (data.fotos && data.fotos.length >= 4) {
      return;
    }

    const isAllowed = await ensureCameraPermission();

    if (!isAllowed) {
      return;
    }

    setCameraVisible(true);
  }, [data.fotos, ensureCameraPermission]);

  const handleCapturePhoto = useCallback(async () => {
    if (!cameraRef.current || isCapturing) {
      return;
    }

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });

      if (!photo?.uri) {
        return;
      }

      const maxWidth = 1280;
      const shouldResize = typeof photo.width === 'number' && photo.width > maxWidth;

      const manipulated = await manipulateAsync(
        photo.uri,
        shouldResize ? [{ resize: { width: maxWidth } }] : [],
        { compress: 0.6, format: SaveFormat.JPEG },
      );

      setData(prev => ({
        ...prev,
        fotos: [...(prev.fotos || []), manipulated.uri].slice(0, 4),
      }));
      setCameraVisible(false);
    } catch (error) {
      console.error('Erro ao capturar foto', error);
      Alert.alert('Não foi possível capturar a foto. Tente novamente.');
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, setData]);

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
              onPress={handleOpenCamera}
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
          <ThemedButton title="Adicionar mais fotos" onPress={handleOpenCamera} />
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

      <Modal
        animationType="slide"
        presentationStyle="fullScreen"
        visible={cameraVisible}
        onRequestClose={() => setCameraVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            facing={cameraFacing}
          >
            <View
              style={{
                position: 'absolute',
                top: 50,
                left: 20,
                right: 20,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <TouchableOpacity onPress={() => setCameraVisible(false)}>
                <Ionicons name="close" size={32} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setCameraFacing(prev => (prev === 'back' ? 'front' : 'back'))}>
                <Ionicons name="camera-reverse-outline" size={32} color="#fff" />
              </TouchableOpacity>
            </View>
          </CameraView>

          <View
            style={{
              position: 'absolute',
              bottom: 40,
              left: 0,
              right: 0,
              alignItems: 'center',
              gap: 16,
            }}
          >
            <TouchableOpacity
              onPress={handleCapturePhoto}
              disabled={isCapturing}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                borderWidth: 6,
                borderColor: '#fff',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: isCapturing ? '#aaa' : '#fff',
              }}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: isCapturing ? '#d1d1d1' : '#fff',
                }}
              />
            </TouchableOpacity>
            <ThemedText style={{ color: '#fff' }}>{`${data.fotos?.length || 0}/4 fotos`}</ThemedText>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
