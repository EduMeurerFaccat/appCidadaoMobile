import { useTheme } from '@/constants/useTheme';
import { Ionicons } from '@expo/vector-icons';
import Voice from '@react-native-voice/voice';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface VoiceTextAreaProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    style?: object;
}

export default function VoiceTextArea(props: VoiceTextAreaProps) {
    const colors = useTheme(); // suas cores temáticas
    const [isListening, setIsListening] = useState(false);

    const { value, onChangeText, placeholder, style } = props;

    useEffect(() => {
        Voice.onSpeechResults = (e) => {
            if (e.value?.length) {
                onChangeText(e.value[0]); // usa o primeiro resultado reconhecido
            }
        };
        Voice.onSpeechEnd = () => setIsListening(false);
        return () => {
            Voice.destroy().then(Voice.removeAllListeners);
        };
    }, []);

    const startListening = async () => {
        try {
            await Voice.start('pt-BR');
            setIsListening(true);
        } catch (e) {
            console.error('Erro ao iniciar voz:', e);
        }
    };

    const stopListening = async () => {
        try {
            await Voice.stop();
            setIsListening(false);
        } catch (e) {
            console.error('Erro ao parar voz:', e);
        }
    };

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: colors.background,
                    borderColor: colors.tint,
                },
            ]}
        >
            <TextInput
                {...props}
                multiline
                style={[
                    styles.textArea,
                    {
                        backgroundColor: colors.background,
                        color: colors.text,
                    },
                    style,
                ]}
                placeholder={placeholder}
                placeholderTextColor={colors.text + '99'} // leve transparência
                value={value}
                onChangeText={onChangeText}
            />
            <TouchableOpacity
                onPress={isListening ? stopListening : startListening}
                style={styles.iconButton}
            >
                <Ionicons
                    name={isListening ? 'mic-off' : 'mic'}
                    size={24}
                    color={isListening ? 'red' : colors.tint}
                />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderWidth: 1,
        borderRadius: 8,
        padding: 8,
        alignItems: 'center',
    },
    textArea: {
        flex: 1,
        fontSize: 16,
        minHeight: 100,
        padding: 8,
        textAlignVertical: 'top', // <-- ESSENCIAL para alinhar ao topo

    },
    iconButton: {
        marginLeft: 10,
        padding: 4,
    },
});
