<div align="center">

# 📱 App Cidadão Mobile
Aplicativo mobile para registro, acompanhamento e interação sobre problemas urbanos (iluminação, buracos, resíduos, etc.).

</div>

## 📌 Visão Geral
O App Cidadão permite que moradores registrem ocorrências da cidade com fotos, localização e categoria do problema, acompanhem itens próximos no mapa e interajam através de comentários. O objetivo é criar um canal simples e padronizado para apoiar a gestão pública e aumentar a participação cidadã.

## ✨ Principais Funcionalidades
- Cadastro de problemas urbanos com:
   - Título, descrição, data da ocorrência
   - Geolocalização (latitude/longitude)
   - Upload de múltiplas fotos (multipart/form-data)
   - Associação a um tipo (ex: Iluminação Pública)
- Mapa (Leaflet via WebView) mostrando problemas próximos
   - Marcadores coloridos por status (ex: aberto, resolvido)
- Autenticação com token JWT (login normal + visitante opcional)
- Persistência de sessão com AsyncStorage
- Comentários paginados em bottom sheet (rolagem + carregamento incremental)
- Tema e componentes reutilizáveis (Themed*) garantindo consistência visual

## 🏗️ Arquitetura & Tecnologias
| Camada | Descrição |
|--------|-----------|
| Expo / React Native | Base do app multi-plataforma |
| Expo Router | Roteamento baseado em arquivos (`app/`) |
| Axios | Cliente HTTP com interceptores para token |
| AsyncStorage | Persistência local (token / dados de usuário) |
| Leaflet + WebView | Renderização de mapa e marcadores |
| Context API | Gerência de estado global (auth, fluxo de cadastro) |

## 📂 Estrutura de Pastas (resumo)
```
app/                 Telas e rotas (file-based routing)
components/          Componentes reutilizáveis (Themed*)
contexts/            AuthContext, ProblemaContext
services/            api.ts, problems.ts, tiposProblema.ts, comments...
constants/           Cores, hooks de tema
assets/              Fontes e imagens
```

## 🧭 Fluxo de Cadastro de Problema
1. Tela de detalhes: usuário preenche título, descrição, tipo e data
2. Tela de fotos: seleciona/captura imagens
3. Tela de localização: confirma posição no mapa
4. Tela de finalização (`/cadastro/finalizado`): monta `FormData` e envia para `/problemas`
5. Payload inclui `tipoProblemaId`, coordenadas, texto e imagens (`foto` múltiplas)

## 🔐 Autenticação
- Login em `/auth/login` (payload: `{ email, senha }`)
- Token recebido (chave flexível: `token` | `jwt` | `access_token` ... ) → salvo em `AsyncStorage`
- Interceptor de requisição injeta automaticamente `Authorization: Bearer <token>`
- Verificação inicial: `/auth/verificarToken` ao iniciar o app
- Logout: limpa `token` e `user` + remove header default
- Registro de visitante: gera e-mail/senha temporários e autentica automaticamente

## 🗂️ Tipos de Problema
- Endpoint: `/tipos-problema/ativos`
- Picker salva sempre o `id` como `value`
- Payload final envia `tipoProblemaId` (numérico) e, por compatibilidade temporária, `categoria`

## 🗺️ Mapa
- Endpoint proximidade: `/problemas/proximos?lat=..&lng=..&raioKm=...`
- Conversão de raios (metros → km) implementada em `services/problems.ts`
- Normalização de imagens e campos de status para lidar com respostas heterogêneas

## 💬 Comentários (quando implementado / expandido)
- Listagem paginada
- Botão para carregar mais
- Modal tipo bottom sheet com scroll
- Uso do header Authorization herdado do axios global

## 🎨 UI & Tema
- Componentes prefixados com `Themed` (Input, Button, Text, TextArea, Picker...) garantem coerência com modo claro/escuro
- Evitar cores hardcoded; preferir hooks de tema

## 🔌 Integração com Backend
Arquivo principal de configuração: `services/api.ts`
```
baseURL: https://appcidadaobackend-production.up.railway.app/api
timeout: 10000 ms
```
Para trocar ambiente (ex: local):
```ts
// services/api.ts
// baseURL: 'http://192.168.x.x:8080/api'
```

## 🚀 Como Executar
```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npx expo start

# (Opcional) Reset para esqueleto limpo
npm run reset-project
```
Abra no Expo Go (QR code) ou em emuladores iOS/Android.

## 🧪 Testes
Ainda não há suíte automatizada configurada. Sugestões futuras:
- Jest + Testing Library para componentes
- Mock Service Worker (MSW) para chamadas HTTP

## 🛠️ Troubleshooting
| Problema | Possível causa | Ação |
|----------|----------------|------|
| Token não enviado | Falha ao salvar após login | Verificar logs `[api] Authorization...` |
| Duplicidade de envio no finalizado | StrictMode em dev | Implementado ref de guarda (`hasSubmittedRef`) |
| Imagens não aparecem | URLs relativas ou campo diverso | Ver `extractImages` em `services/problems.ts` |
| 401 inesperado | Token expirado/ausente | Refazer login manualmente (sem auto-logout global) |

## 🗺️ Roadmap (sugestões)
- [ ] Edição/atualização de problema
- [ ] Filtro avançado no mapa (status, tipo)
- [ ] Notificações push para atualizações de status
- [ ] Upload offline + fila de sincronização
- [ ] Testes unitários e de integração
- [ ] Acessibilidade (VoiceOver / TalkBack)

## 🤝 Contribuindo
1. Crie uma branch: `feat/minha-feature`
2. Faça commits em português (ver `.github/copilot-instructions.md`)
3. Abra Pull Request descrevendo mudanças

## 🔒 Boas Práticas de Segurança
- Nunca commitar tokens reais
- Evitar logs sensíveis em produção
- Validar dados antes de enviar (frontend já cobre senha/email)

## 📄 Licença
Definir (ex: MIT, Apache 2.0). Adicionar arquivo `LICENSE` se necessário.

---
Se precisar de ajuda para novos módulos (ex: notificações, cache offline ou testes), abra uma issue ou continue a conversa. 😉
