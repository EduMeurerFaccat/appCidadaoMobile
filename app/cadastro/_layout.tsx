import { Stack } from 'expo-router';

export default function Layout() {
    return (
        <Stack>
            <Stack.Screen
                name="detalhes"
                options={{ title: 'Detalhes do problema', headerShown: true }}
            />
            <Stack.Screen
                name="fotos"
                options={{ title: 'Fotos do problema', headerShown: true }}
            />
            <Stack.Screen
                name="localizacao"
                options={{ freezeOnBlur: false, title: 'Localização do problema', headerShown: true }}
            />
            <Stack.Screen
                name="finalizado"
                options={{ title: 'Cadastro finalizado', headerShown: true }}
            />
        </Stack>
    );
}
