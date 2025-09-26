import api from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { User } from '../types/auth';

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    registerVisitor: () => Promise<void>;
    checking: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const stored = await AsyncStorage.getItem('token');
                if (stored && stored.trim().length > 0) {
                    // Garante header default para evitar requisições iniciais sem Authorization
                    try { (api.defaults.headers as any).common['Authorization'] = `Bearer ${stored}`; } catch { /* no-op */ }
                    try {
                        const resp = await api.get('/auth/verificarToken');
                        // Assumindo que resposta inclui dados mínimos do usuário ou apenas validade
                        if (resp.status === 200) {
                            const baseUser: any = resp.data && typeof resp.data === 'object' ? resp.data : {};
                            // Garante manter token
                            baseUser.token = stored;
                            if (!baseUser.tipoUsuario) { baseUser.tipoUsuario = 'NORMAL'; }
                            setUser(baseUser as User);
                            console.log('[Auth] Token válido carregado');
                        } else {
                            console.log('[Auth] Token inválido status', resp.status);
                            await AsyncStorage.removeItem('token');
                            try { delete (api.defaults.headers as any).common['Authorization']; } catch {}
                        }
                    } catch (err) {
                        console.log('[Auth] Erro ao verificar token. Limpando.', err);
                        await AsyncStorage.removeItem('token');
                        try { delete (api.defaults.headers as any).common['Authorization']; } catch {}
                    }
                }
            } finally {
                setChecking(false);
            }
        })();
    }, []);

    const registerVisitor = async () => {
        // Gera UUID simples
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
        // E-mail com TLD válido para regex mais restritivas
        let email = `${uuid}@visitante.com`;
        // Senha forte para atender requisitos mínimos eventuais
        const senha = `Aa1!${uuid.replace(/-/g, '')}`;
        const baseBody: any = {
            nome: 'Visitante',
            email,
            senha,
            // Envia confirmações de senha em possíveis chaves aceitas
            confirmSenha: senha,
            confirmarSenha: senha,
            confirmPassword: senha,
            senhaConfirmacao: senha,
            tipoUsuario: 'VISITANTE'
        };

        const tryRegister = async (body: any) => {
            try {
                const resp = await api.post('/auth/registrar', body);
                return resp;
            } catch (e: any) {
                const status = e?.response?.status;
                if (status === 404 || status === 405) {
                    // Fallback para endpoint em inglês
                    const alt = await api.post('/auth/register', body);
                    return alt;
                }
                throw e;
            }
        };

        try {
            if (__DEV__) { try { console.log('[Auth] Registrando visitante', { email }); } catch {} }
            let response = await tryRegister(baseBody);
            if (response.status === 200 || response.status === 201) {
                await login(email, senha); // Loga automaticamente após registrar
            } else {
                throw new Error('Falha ao registrar visitante');
            }
        } catch (e: any) {
            const backendMsg = e?.response?.data?.message || e?.response?.data?.erro || e?.message;
            console.error('Erro ao registrar visitante', backendMsg);
            throw new Error(backendMsg || 'Erro ao registrar visitante');
        }
    };

    const login = async (email: string, password: string) => {
        // Simular autenticação
        const response = await api.post('/auth/login', { email, senha: password })
        console.log(response);
        
        if (response.status === 200) {
            // Aceita diferentes formatos: { token }, { jwt }, { access_token }
            const data: any = response.data || {};
            const receivedToken: string | undefined = data.token || data.jwt || data.access_token || data.accessToken;
            if (!receivedToken || String(receivedToken).trim().length === 0) {
                console.error('[Auth] Login sem token válido na resposta');
                throw new Error('Falha ao autenticar (token ausente).');
            }
            const userData: User = { ...data, token: receivedToken } as any;
            if (!(userData as any).tipoUsuario) {
                (userData as any).tipoUsuario = 'NORMAL';
            }
            console.log('Usuário autenticado:', userData);
            try { (api.defaults.headers as any).common['Authorization'] = `Bearer ${userData.token}`; } catch {}
            await AsyncStorage.setItem("token", String(userData.token));
            try { await AsyncStorage.setItem('user', JSON.stringify(userData)); } catch {}

            setUser(userData);
        } else {
            console.error('Falha ao autenticar:', response.data);
            throw new Error('Falha ao autenticar');
        }
    };

    const logout = () => {
        setUser(null);
        AsyncStorage.multiRemove(['token', 'user']).catch(() => {});
        try { delete (api.defaults.headers as any).common['Authorization']; } catch {}
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, registerVisitor, checking }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de AuthProvider');
    }
    return context;
};
