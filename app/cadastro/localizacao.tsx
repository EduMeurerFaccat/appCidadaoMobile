import { ThemedButton } from '@/components/ThemedButton';
import { useProblem } from '@/contexts/ProblemaContext';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
// Substituindo react-native-maps por Leaflet
import LeafletMap from '@/components/LeafletMap';

export default function LocalizacaoProblema() {
  // Centro inicial (fixo) usado só para criar o mapa
  const [initialCenter, setInitialCenter] = useState<{ latitude: number; longitude: number } | null>(null);
  // Região selecionada (dinâmica) representada pelo pin central enquanto usuário move
  const [selectedRegion, setSelectedRegion] = useState<{ latitude: number; longitude: number } | null>(null);
  const [recenterTick, setRecenterTick] = useState(0);

  const { setData, data } = useProblem();
  const mapRef = useRef(null);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estados de carregamento simplificados (sem timeout / Google Maps)

  useEffect(() => { getLocation(); }, []);

  const getLocation = async () => {
    // Pede permissão
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permissão negada para acessar localização');
      Alert.alert('Erro', 'Permissão negada para acessar localização');
      return;
    }

    // Pega localização
    let location = await Location.getCurrentPositionAsync({});
  const coords = { latitude: location.coords.latitude, longitude: location.coords.longitude };
  setInitialCenter(coords); // só uma vez
  setSelectedRegion(coords); // ponto selecionado inicial
    setRecenterTick(t => t + 1);
    setLocation(location);
  };

  const onRegionChangeComplete = () => {};

  const finalizarCadastro = () => {
  console.log('Localização selecionada:', selectedRegion?.latitude, selectedRegion?.longitude);
    setData(prev => ({
      ...prev,
      localizacao: {
        latitude: selectedRegion?.latitude ?? initialCenter?.latitude ?? -23.55052,
        longitude: selectedRegion?.longitude ?? initialCenter?.longitude ?? -46.633308,
      },
    }));
    router.push('/cadastro/finalizado');
  };

  return (
    <View style={{ flex: 1 }}>
      {!location && (
        <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
          <ActivityIndicator size='large' color='#1E88E5' />
          <Text style={{ marginTop:12, color:'#1E88E5', fontWeight:'600' }}>Obtendo localização...</Text>
        </View>
      )}
      {location && initialCenter && selectedRegion && (
        <LeafletMap
          center={initialCenter}
          reportCenterOnMove
          recenterTrigger={recenterTick}
          onCenterChange={(lat, lng) => {
            const TH = 0.000005; // ~0.5m
            if (Math.abs(lat - selectedRegion.latitude) < TH && Math.abs(lng - selectedRegion.longitude) < TH) { return; }
            setSelectedRegion({ latitude: lat, longitude: lng });
          }}
        />
      )}

      {/* Pin central fixo (SVG custom) */}
      <View pointerEvents='none' style={{ position: 'absolute', top: '50%', left: '50%', marginLeft: -22, marginTop: -48, alignItems: 'center' }}>
        <Svg width={44} height={56} viewBox='0 0 44 56'>
          {/* Sombra */}
          <Path d='M12 52c0 2.2 4.5 4 10 4s10-1.8 10-4-4.5-4-10-4-10 1.8-10 4Z' fill='rgba(0,0,0,0.20)' />
          {/* Corpo do pin */}
          <Path d='M22 0C13 0 6 7.2 6 16.1c0 12 14.2 26.9 15.1 27.8a1.3 1.3 0 0 0 1.8 0C23.8 43 38 28.1 38 16.1 38 7.2 31 0 22 0Z' fill='#e53935'/>
          {/* Borda */}
          <Path d='M22 2.5c7.4 0 13.5 6 13.5 13.6 0 9.8-10.6 21.9-13 24.7-2.4-2.8-13-14.9-13-24.7C9.5 8.5 15.6 2.5 22 2.5Z' fill='none' stroke='white' strokeWidth={2}/>
          {/* Círculo interno */}
          <Circle cx={22} cy={16} r={5} fill='white'/>
          <Circle cx={22} cy={16} r={3} fill='#e53935'/>
        </Svg>
      </View>

      <View style={{ position: 'absolute', bottom: 40, left: 20, right: 20 }}>
        <ThemedButton title='Finalizar Cadastro' onPress={finalizarCadastro} />
      </View>
    </View>
  );
}

// Componente simples de aviso
// Alerta simplificado (mantido se quiser mensagens futuras)
function AlertPlaceholder({ text, danger }: { text: string; danger?: boolean }) {
  return (
    <View style={{ backgroundColor: danger ? '#ffebee' : '#e3f2fd', padding: 8, borderRadius: 8, alignItems: 'center', flexDirection: 'row' }}>
      <Ionicons name={danger ? 'warning' : 'information-circle'} size={16} color={danger ? '#c62828' : '#1565c0'} />
      <Text style={{ marginLeft: 6, color: danger ? '#c62828' : '#1565c0', fontSize: 12 }}>{text}</Text>
    </View>
  );
}
