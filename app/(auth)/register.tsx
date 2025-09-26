import { ThemedButton } from '@/components/ThemedButton';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/constants/useTheme';
import api from '@/services/api';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export default function RegisterScreen() {
	const [nome, setNome] = useState('');
	const [email, setEmail] = useState('');
	const [senha, setSenha] = useState('');
	const [confirmSenha, setConfirmSenha] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [errors, setErrors] = useState<{ nome?: string; email?: string; senha?: string; confirmSenha?: string }>({});

	const validate = () => {
		const errs: typeof errors = {};
		if (!nome.trim()) { errs.nome = 'Informe o nome'; }
		if (!email.trim()) { errs.email = 'Informe o email'; }
		else if (!emailRegex.test(email.trim())) { errs.email = 'Email inválido'; }
		if (!senha) { errs.senha = 'Informe a senha'; }
		else if (senha.length < 6) { errs.senha = 'Mínimo 6 caracteres'; }
		if (!confirmSenha) { errs.confirmSenha = 'Confirme a senha'; }
		else if (confirmSenha !== senha) { errs.confirmSenha = 'Senhas não conferem'; }
		setErrors(errs);
		return Object.keys(errs).length === 0;
	};

		const submit = async () => {
			if (submitting) {
				return;
			}
			if (!validate()) {
				return;
			}
		try {
			setSubmitting(true);
			const body = {
				nome: nome.trim(),
				email: email.trim(),
				senha,
				// Envia confirmações nos possíveis nomes aceitos pelo backend
				confirmSenha: confirmSenha,
				confirmarSenha: confirmSenha,
				confirmPassword: confirmSenha,
				senhaConfirmacao: confirmSenha,
				tipoUsuario: 'NORMAL'
			};
			const resp = await api.post('/auth/registrar', body);
			if (resp.status === 200 || resp.status === 201) {
				Alert.alert('Sucesso', 'Conta criada. Faça login.');
				router.replace('/(auth)/login');
			} else {
				Alert.alert('Erro', 'Não foi possível criar a conta.');
			}
		} catch (e: any) {
			console.log('Erro registro', e?.response?.data || e.message);
			const raw = e?.response?.data;
			const msg = (typeof raw === 'string' ? raw : (raw?.message || raw?.erro)) || 'Falha ao registrar.';
			Alert.alert('Erro', msg);
		} finally { setSubmitting(false); }
	};

	const colors = useTheme();
	return (
		<KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
			<ScrollView contentContainerStyle={[styles.container,{ backgroundColor: colors.background }]} keyboardShouldPersistTaps='handled'>
				<ThemedView style={styles.header}> 
					<ThemedText type='title' style={styles.title}>Criar Conta</ThemedText>
					<ThemedText style={styles.subtitle}>Preencha seus dados para continuar</ThemedText>
				</ThemedView>

				<View style={styles.field}> 
					<ThemedInput
						placeholder='Nome'
						autoCapitalize='words'
						value={nome}
						onChangeText={setNome}
						returnKeyType='next'
					/>
					{errors.nome && <ThemedText style={styles.error}>{errors.nome}</ThemedText>}
				</View>
				<View style={styles.field}> 
					<ThemedInput
						placeholder='Email'
						keyboardType='email-address'
						autoCapitalize='none'
						value={email}
						onChangeText={setEmail}
						returnKeyType='next'
					/>
					{errors.email && <ThemedText style={styles.error}>{errors.email}</ThemedText>}
				</View>
				<View style={styles.field}> 
					<ThemedInput
						placeholder='Senha'
						secureTextEntry
						value={senha}
						onChangeText={setSenha}
						returnKeyType='next'
					/>
					{errors.senha && <ThemedText style={styles.error}>{errors.senha}</ThemedText>}
				</View>
				<View style={styles.field}> 
					<ThemedInput
						placeholder='Confirmar senha'
						secureTextEntry
						value={confirmSenha}
						onChangeText={setConfirmSenha}
						returnKeyType='done'
						onSubmitEditing={submit}
					/>
					{errors.confirmSenha && <ThemedText style={styles.error}>{errors.confirmSenha}</ThemedText>}
				</View>

				<ThemedButton title={submitting ? 'Enviando...' : 'Cadastrar'} onPress={submit} style={{ opacity: submitting ? 0.6 : 1 }} disabled={submitting} />
				<View style={{ height: 30 }} />
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		padding: 20,
		paddingTop: 60,
	},
	header: { marginBottom: 30 },
	title: { fontSize: 26, fontWeight: '700' },
	subtitle: { marginTop: 6, fontSize: 14, opacity: 0.8 },
	field: { marginBottom: 16 },
	error: { marginTop: 6, color: '#d32f2f', fontSize: 12 },
});

