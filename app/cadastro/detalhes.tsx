import CadastroFooter from '@/components/CadastroFooter';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedDateInput } from '@/components/ThemedDateInput';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedPicker } from '@/components/ThemedPicker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedTextArea } from '@/components/ThemedTextArea';
import { ThemedView } from '@/components/ThemedView';
import { useProblem } from '@/contexts/ProblemaContext';
import { fetchTiposProblemaAtivos } from '@/services/tiposProblema';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

export default function CadastroProblema() {
    const { data, setData } = useProblem();
    const [mostrarPicker, setMostrarPicker] = useState(false);

    useEffect(() => {
        if (!data.dataOcorrencia) {
            setData(prev => ({
                ...prev,
                dataOcorrencia: new Date(),
            }));
        }
    }, []);

    const [tiposLoading, setTiposLoading] = useState(false);
    const [tiposErro, setTiposErro] = useState<string | null>(null);
    const [tiposProblema, setTiposProblema] = useState<{label:string; value:string}[]>([]);

    useEffect(() => {
        const loadTipos = async () => {
            setTiposLoading(true);
            setTiposErro(null);
            try {
                const lista = await fetchTiposProblemaAtivos();
                setTiposProblema(lista);
            } catch (e: any) {
                setTiposErro('Falha ao carregar tipos.');
            } finally { setTiposLoading(false); }
        };
        loadTipos();
    }, []);

    const onChangeData = (selectedDate?: Date) => {
        setMostrarPicker(Platform.OS === 'ios');
        if (selectedDate) {
            setData(prev => ({
                ...prev,
                dataOcorrencia: selectedDate,
            }));
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={50}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ThemedView style={{ flex: 1, paddingHorizontal: 20 }}>
                    <CadastroFooter currentStep={1} />

                    <ScrollView contentContainerStyle={{ paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
                        {/* Título */}
                        <ThemedText type="subtitle" style={{ marginTop: 16 }}>
                            Título do problema:
                        </ThemedText>
                        <ThemedInput
                            placeholder="Ex: Buraco na rua principal"
                            value={data.titulo ?? ''}
                            onChangeText={text => setData(prev => ({ ...prev, titulo: text }))}
                            autoCapitalize="sentences"
                            autoCorrect={false}
                        />

                        <ThemedText type="subtitle" style={{ marginTop: 16 }}>
                            Descrição do problema:
                        </ThemedText>
                        <ThemedTextArea
                            placeholder="Descreva o que aconteceu..."
                            value={data.descricao ?? ''}
                            onChangeText={text => setData(prev => ({ ...prev, descricao: text }))}
                        />

                        <ThemedText type="subtitle" style={{ marginTop: 16 }}>
                            Tipo de problema:
                        </ThemedText>
                        {tiposErro && <ThemedText style={{ color: '#c62828', marginBottom:8 }}>{tiposErro}</ThemedText>}
                        <ThemedPicker
                            selectedValue={data.tipo ?? ''}
                            onValueChange={value => setData(prev => ({ ...prev, tipo: value }))}
                            items={tiposProblema}
                        />
                        {tiposLoading && <ThemedText style={{ fontSize:12, color:'#555', marginTop:4 }}>Carregando tipos...</ThemedText>}

                        <ThemedText type="subtitle" style={{ marginTop: 16 }}>
                            Data da ocorrência:
                        </ThemedText>
                        <ThemedDateInput
                            value={data.dataOcorrencia ?? new Date()}
                            onChange={onChangeData}
                        />
                    </ScrollView>

                    {/* Botão fixo */}
                    <View style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
                        <ThemedButton
                            title="Próximo"
                            onPress={() => router.push('/cadastro/fotos')}
                        />
                    </View>
                </ThemedView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}
