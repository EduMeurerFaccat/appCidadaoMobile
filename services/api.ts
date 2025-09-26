// src/services/api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const api = axios.create({
  // baseURL: 'https://appcidadaobackend-production.up.railway.app/api', // substitua pela URL real
  // baseURL: 'https://appcidadaobackend-production.up.railway.app/api', // substitua pela URL real
  baseURL: 'http://192.168.2.142:8080/api',
  timeout: 10000, // tempo máximo da requisição (opcional)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Exemplo: interceptor de requisição (para tokens)
api.interceptors.request.use(
  async (config) => {
    // Busca token do AsyncStorage e injeta de forma compatível com Axios v1
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const value = `Bearer ${token}`;
        const h: any = config.headers as any;
        if (h && typeof h.set === 'function') {
          h.set('Authorization', value);
        } else {
          config.headers = { ...(config.headers || {}), Authorization: value } as any;
        }
        if (__DEV__) {
          try { console.log('[api] Authorization header definido'); } catch {}
        }
      } else if (__DEV__) {
        try { console.log('[api] Sem token no AsyncStorage ao preparar requisição'); } catch {}
      }
    } catch (e) {
      if (__DEV__) {
        try { console.log('[api] Falha ao ler token do AsyncStorage', e); } catch {}
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de resposta para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      const status = error?.response?.status;
      const data = error?.response?.data;
      if (__DEV__) {
        try { console.log('[api] response error', { status, data }); } catch {}
      }
      // Sem auto-logout: apenas repassa o erro para quem chamou tratar (UI/fluxo local)
    } catch {}
    return Promise.reject(error);
  }
);

export default api;
