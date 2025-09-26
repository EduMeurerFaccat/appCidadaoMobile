import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { useProblem } from '@/contexts/ProblemaContext';
import api from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, TouchableOpacity } from 'react-native';

export default function Finalizacao() {
    const { data, setData } = useProblem();
    const {user} = useAuth()

    const [loading, setLoading] = useState(true);
    const hasSubmittedRef = useRef(false);
    const isMountedRef = useRef(true);

    useEffect(() => {
        const enviarProblema = async () => {
            // Evita chamadas duplicadas em desenvolvimento (StrictMode) ou remounts rápidos
            if (hasSubmittedRef.current) {
                if (__DEV__) console.log('[Finalizacao] enviarProblema ignorado (já executado)');
                return;
            }
            hasSubmittedRef.current = true;
            try {
                // Simula uma requisição com 2 segundos
                const tipoProblemaId = data.tipo ? Number(data.tipo) : undefined;
                const problema = {
                    usuarioId: user?.id || 0, // Use o ID do usuário autenticado ou 0 se anônimo
                    descricao: data.descricao,
                    categoria: data.tipo,
                    tipoProblemaId: isNaN(tipoProblemaId as number) ? undefined : tipoProblemaId,
                    dataOcorrencia: data.dataOcorrencia,
                    latitude: data.localizacao?.latitude,
                    longitude: data.localizacao?.longitude,
                    titulo: data.titulo,
                };
                const formData = new FormData();
                // Adiciona o JSON como string no campo "problema"
                formData.append('problema', JSON.stringify(problema));

                // Adiciona as imagens no campo "fotos"
                const fotosAnexadas: { uri: string; name: string; type: string }[] = [];
                data.fotos?.forEach((uri, index) => {
                    const filename = uri.split('/').pop() || `foto-${index}.jpg`;
                    const ext = filename.split('.').pop()?.toLowerCase();
                    const type = ext === 'png' ? 'image/png' : 'image/jpeg';

                    formData.append('foto', {
                        uri,
                        name: filename,
                        type,
                    } as any); // necessário o `as any` para funcionar no React Native
                    fotosAnexadas.push({ uri, name: filename, type });
                });

                // Logs antes do envio
                try {
                    console.log('[Finalizacao] Payload problema:', problema);
                    console.log('[Finalizacao] Fotos anexadas:', fotosAnexadas);
                } catch {}

                let result = await api.post('/problemas', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                // await new Promise(resolve => setTimeout(resolve, 2000));

                console.log('Dados enviados:', result);

                // TODO: Substituir isso por sua requisição real, ex:
                // await fetch('https://api.sua-url.com/problemas', {
                //   method: 'POST',
                //   headers: { 'Content-Type': 'application/json' },
                //   body: JSON.stringify(data),
                // });

                // Navegar para tela de sucesso
                // router.replace('/cadastro/sucesso'); // você pode criar essa tela também
            } catch (error) {
                console.error('Erro ao enviar problema:', error);
                // Você pode exibir erro ou redirecionar para outra tela
            }
            finally {
                if (isMountedRef.current) setLoading(false);
            }
        };

        enviarProblema();
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    return (
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            {loading ?
                <>
                    <ThemedText type="title">Enviando dados...</ThemedText>
                    <ActivityIndicator size="large" color="#007aff" style={{ marginTop: 20 }} />
                </>
                : <>
                    <Ionicons name="checkmark-circle" size={80} color="green" />
                    <ThemedText type="title" style={{ marginTop: 20 }}>Cadastro finalizado!</ThemedText>
                    <ThemedText style={{ marginTop: 10, textAlign: 'center' }}>Obrigado por contribuir com a cidade.</ThemedText>
                    <TouchableOpacity
                        style={{ marginTop: 30, backgroundColor: '#1E88E5', paddingVertical: 14, paddingHorizontal: 26, borderRadius: 28 }}
                        onPress={() => {
                            // limpa dados do contexto
                            setData({});
                            // volta para a Home (tab index)
                            router.replace('/(tabs)');
                        }}
                    >
                        <ThemedText style={{ color: '#fff', fontWeight: '600' }}>Voltar para início</ThemedText>
                    </TouchableOpacity>
                </>
            }
        </ThemedView>
    );
}
