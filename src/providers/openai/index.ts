import { handlePrompt, handleRapidPrompt } from './handler';
import type { Provider } from '@/types/provider';

const providerOpenAI = () => {
  const provider: Provider = {
    id: 'provider-openai',
    icon: 'i-simple-icons-openai', // @unocss-include
    name: 'OpenAI',
    globalSettings: [
      {
        key: 'apiKey',
        name: 'API Key',
        type: 'api-key',
      },
      {
        key: 'baseUrl',
        name: 'Base URL',
        description: 'Base URL personalizado para a API da OpenAI.',
        type: 'input',
        default: 'https://api.openai.com',
      },
      {
        key: 'model',
        name: 'Modelo da OpenAI',
        description: 'Modelo gpt personalizado para a API da OpenAI.',
        type: 'select',
        options: [
          // Opções do modelo
        ],
        default: 'gpt-3.5-turbo',
      },
      {
        key: 'maxTokens',
        name: 'Máximo de Tokens',
        description: 'O número máximo de tokens a serem gerados na conclusão.',
        type: 'slider',
        min: 0,
        max: 32768,
        default: 2048,
        step: 1,
      },
      {
        key: 'messageHistorySize',
        name: 'Tamanho Máximo do Histórico de Mensagens',
        description: 'O número de mensagens históricas retidas será truncado se o comprimento da mensagem exceder o parâmetro MaxToken.',
        type: 'slider',
        min: 1,
        max: 24,
        default: 5,
        step: 1,
      },
      {
        key: 'temperature',
        name: 'Temperatura',
        type: 'slider',
        description: 'Qual temperatura de amostragem usar, entre 0 e 2. Valores mais altos como 0.8 tornarão a saída mais aleatória, enquanto valores mais baixos como 0.2 a tornarão mais focada e determinística.',
        min: 0,
        max: 2,
        default: 0.7,
        step: 0.01,
      },
      {
        key: 'top_p',
        name: 'Top P',
        description: 'Uma alternativa à amostragem com temperatura, chamada de amostragem de núcleo, onde o modelo considera os resultados dos tokens com massa de probabilidade top_p. Portanto, 0.1 significa que apenas os tokens que compõem os 10% principais de massa de probabilidade são considerados.',
        type: 'slider',
        min: 0,
        max: 1,
        default: 1,
        step: 0.01,
      },
    ],
    bots: [
      {
        id: 'chat_continuous',
        type: 'chat_continuous',
        name: 'Chat Contínuo',
        settings: [],
      },
      {
        id: 'chat_single',
        type: 'chat_single',
        name: 'Chat Único',
        settings: [],
      },
      {
        id: 'image_generation',
        type: 'image_generation',
        name: 'DALL·E',
        settings: [],
      },
    ],
    handlePrompt,
    handleRapidPrompt,
  };
  return provider;
};

export default providerOpenAI;
