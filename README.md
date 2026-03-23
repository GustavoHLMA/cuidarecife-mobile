<div align="center">
<img src="https://github.com/user-attachments/assets/8b65dc9e-49e5-4166-a287-0e10b8fb5928" width="300" height="200" />
</div>

# Cuida Recife Mobile

**Cuida Recife** é um aplicativo de **monitoramento contínuo** e **apoio ao autocuidado** para pacientes com **hipertensão** e **diabetes**, focando na **adesão ao tratamento** e fornecendo **funcionalidades de acessibilidade** e **assistência via IA**. O app ajuda pacientes a **gerenciar sua medicação**, acompanhar a **pressão arterial** e **glicemia**, além de oferecer **educação em saúde** e alertas para **interações medicamentosas**.

## Desafio 🚀

**Desafio Saúde Pública em Recife**: Como podemos **melhorar o monitoramento contínuo**, **a adesão ao tratamento** e o **autocuidado** de pacientes com **hipertensão** e **diabetes** usando um aplicativo acessível, inteligente e interativo?

## Funcionalidades 📋

1. **Monitoramento de medicação**
   - **Câmera do celular** para verificar se o paciente está tomando a medicação correta através de OCR (reconhecimento de imagem/visão computacional).
   - **Lista interativa** com informações lúdicas sobre como e quando tomar cada medicamento.
   - **Assiduidade do tratamento** com visualização do progresso da medicação e opção de sinalizar se tiver acabado (podendo notificar a agentes comunitários de saúde em caso de pacientes domiciliados)

2. **Registro de pressão e glicemia**
   - **Adição de aferições** para pressão, MRPA e glicemia, com opção de baixar histórico de entradas.
   - **Instruções detalhadas** sobre como realizar os procedimentos de aferição de pressão e medição de glicemia.

3. **Assistente IA**
   - **Chat de IA** para **responder dúvidas** do paciente a qualquer momento.
     
4. **Prescrição**
   - **Lista de prescrição do paciente** com instruções de como tomar e se é gratuita pelo Programa de Farmácia Popular do Brasil.
   - **Geolocalização** para encontrar **farmácias do Programa Farmácia Popular do Brasil** próximas para retirada de medicamentos gratuitos.
   - **IA para análise** sobre erros de prescrição (ex: interações medicamentosas, instruções ou horários incorretos).

5. **Notificações e lembretes**
   - Lembretes sobre **próximas consultas**, **medicação** e **aferições de pressão/glicemia** em formato de widget e notificação.

## Tech Stack ⚙️

![React Native](https://img.shields.io/badge/React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) 
![Expo](https://img.shields.io/badge/Expo-1C1E24?style=for-the-badge&logo=expo&logoColor=white) 
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) 
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) 
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white) 
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white) 
![Gemini](https://img.shields.io/badge/Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Cloud Vision API](https://img.shields.io/badge/Cloud%20Vision%20API-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)

## Equipe 🏆

**Gabriella Graciano de Souza**  
📧 E-mail: [gabifc_graciano@hotmail.com](mailto:gabifc_graciano@hotmail.com)  
🖋️ Behance: [behance.net/gabygraciano](https://www.behance.net/gabygraciano)  
🌐 GitHub: [github.com/gabygraciano](https://github.com/gabygraciano)

**Gustavo Henrique Lima Mendes de Almeida**  
📧 E-mail: gustavohlma8@gmail.com  
🌐 GitHub: [github.com/GustavoHLMA](https://github.com/GustavoHLMA)

**Manuelle Graciano Ferreira**
- 🩺 Médica formada pela ***Universidade de Pernambuco***

## Instalação ⬇️

### 1. Clone o repositório
```bash
git clone https://github.com/GustavoHLMA/cuidarecife-mobile.git
cd cuidarecife-mobile
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

Preencha as variáveis de ambiente:
```env
# URLs da API
EXPO_PUBLIC_API_URL_DEV=http://000.000.0.0:3001  # Seu endereço IPv4 local (no terminal-> [windows: 'ipconfig'], [linux: 'ifconfig'])
EXPO_PUBLIC_API_URL_PROD=https://cuidarecife-api.onrender.com
```

> **Nota:** A variável `EXPO_PUBLIC_API_ENV` é automaticamente definida pelos scripts `dev:local` e `dev:prod`.

## Rodando o projeto 🏃

### Desenvolvimento (API local)
```bash
npm run dev:local
```
- Conecta ao backend rodando localmente
- URL: `http://000.000.0.0:3001` (ajuste para o IP de sua máquina)

### Desenvolvimento (API de produção)
```bash
npm run dev:prod
```
- Conecta ao backend no Render
- URL: `https://cuidarecife-api.onrender.com`
  
## Configuração de Ambiente 🔧

O app alterna entre ambientes automaticamente:

| Comando | Ambiente | URL da API |
|---------|----------|------------|
| `npm run dev:local` | development | `http://SEU_IP:3001` |
| `npm run dev:prod` | production | `https://cuidarecife-api.onrender.com` |

## Testando no Celular 📱

1. Instale o **Expo Go**:
   - [iOS](https://apps.apple.com/app/expo-go/id982107779)
   - [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Execute:
   ```bash
   npm run dev:local  # Para testar com API local
   # ou
   npm run dev:prod   # Para testar com API de produção
   ```

3. Escaneie o QR code:
   - **iOS**: Use o app Câmera
   - **Android**: Use o Expo Go

## Como contribuir 🤝

### Commits
Commits devem seguir o padrão:
- `feat(nome da branch): descrição da funcionalidade` - Para novas funcionalidades
- `hotfix(nome da branch): descrição do bug` - Para bugfixes em main
- `chore(nome da branch): descroção da tarefa` - Para alterações referentes builds/deploy/serviços externos etc. 

```
feature(medications): adicionar tela de histórico
fix(auth): corrigir validação de email
```

## Troubleshooting 🔍

### Erro de conexão com API
- Verifique se a API está rodando (`npm run dev` no backend)
- Confirme o IP no `.env` (use `ipconfig` no Windows ou `ifconfig` no Mac/Linux)
- Certifique-se de estar na mesma rede WiFi

### App não atualiza ao salvar código
- Pressione `r` no terminal do Expo para reload manual
- Use `Shift+R` para reload completo (limpa cache)

### Problemas com dependências
```bash
rm -rf node_modules
npm install
npx expo start -c  # -c limpa o cache
```
