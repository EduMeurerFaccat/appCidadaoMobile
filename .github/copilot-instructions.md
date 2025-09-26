# Copilot Instructions for appCidadaoMobile

# Instruções para o geração de mensagem de commit ao Copilot
- Realizar os comentários de commit em português, seguindo o padrão do projeto.

## Visão geral
Este projeto é um app mobile Expo/React Native com Expo Router, voltado para registro e acompanhamento de problemas urbanos. O código segue arquitetura modular, separando componentes, serviços, contexto e telas por domínio.

## Estrutura principal
- **app/**: Telas e rotas, organizadas por contexto (ex: cadastro, auth, tabs). Usa file-based routing do Expo Router.
- **components/**: Componentes reutilizáveis (inputs, botões, carrossel de imagens, mapa, modais, etc). Sempre prefira Themed* para UI.
- **services/**: Serviços de API (ex: api.ts, problems.ts, comments.ts). Use sempre o `api` (axios) para chamadas HTTP, que já injeta token do AsyncStorage.
- **contexts/**: Contextos globais (ex: AuthContext, ProblemaContext) para estado e ações compartilhadas.
- **constants/**: Temas, cores e helpers de UI.
- **assets/**: Fonts e imagens estáticas.

## Padrões e convenções
- **Autenticação**: Token JWT salvo no AsyncStorage, injetado via interceptor do axios. Use AuthContext para login/logout/validação.
- **Mapas**: Renderização via Leaflet em WebView customizado. Marcadores coloridos por status (azul: aberto, verde: resolvido). Para novos tipos, ajuste o campo `color` no marker.
- **Comentários**: Modal expansível, paginado, com botão flutuante para rolar ao topo. Use serviço comments.ts para listar/postar.
- **Inputs e botões**: Use sempre ThemedInput, ThemedButton, ThemedTextArea para garantir tema.
- **Tema**: Use useTheme() para cores dinâmicas. Evite hardcoded colors.
- **Modais**: Preferência por bottom sheet customizado, com suporte a arrastar para fechar.
- **Validação**: Valide campos de cadastro (email, senha, confirmação) no front antes de enviar.

## Fluxos de desenvolvimento
- **Rodar app**: `npx expo start`
- **Resetar projeto**: `npm run reset-project` (move starter para app-example)
- **Instalar dependências**: `npm install`
- **Debug**: Use logs no console e postMessage para depurar WebView/mapa.
- **Testes**: Não há testes automatizados configurados; para testes manuais, use Expo Go ou simuladores.
- **Lint**: Siga o padrão do eslint.config.js; erros de lint bloqueiam CI.

## Integrações e dependências
- **Backend**: API REST, endpoints em /api. Veja services/api.ts para baseURL.
- **Leaflet**: Mapa via WebView, markers customizados por SVG.
- **AsyncStorage**: Persistência de token e dados temporários.
- **Axios**: Todas chamadas HTTP via services/api.ts.

## Exemplos de padrões
- Para adicionar novo serviço:
  - Crie arquivo em services/, exporte funções assíncronas usando api.
- Para nova tela:
  - Crie arquivo em app/, use componentes Themed* e contexto conforme necessário.
- Para novo tipo de marcador:
  - Ajuste lógica de cor em app/problemas-proximos.tsx e components/LeafletMap.tsx.

## Recomendações para agentes
- Sempre respeite o tema e componentes Themed*.
- Prefira hooks/contextos para estado global.
- Siga o padrão de navegação do Expo Router.
- Antes de editar arquivos, cheque se há mudanças manuais recentes.
- Documente padrões novos neste arquivo.

---

Atualize este documento conforme novos fluxos ou padrões forem adotados.