import { fetchChatCompletion, fetchImageGeneration } from './api';
import { parseStream } from './parser';
import type { HandlerPayload, Provider, PromptResponse } from '@/types/provider';

const handleChatCompletion = async (payload: HandlerPayload, signal: AbortSignal) => {
    const messages: any[] = [];
    let maxTokens: number = typeof payload.globalSettings.maxTokens === 'number' ? payload.globalSettings.maxTokens : Number(payload.globalSettings.maxTokens);
    let messageHistorySize: number = typeof payload.globalSettings.messageHistorySize === 'number' ? payload.globalSettings.messageHistorySize : Number(payload.globalSettings.messageHistorySize);

    while (messageHistorySize > 0) {
        messageHistorySize--;
        const m = payload.messages.pop();
        if (m === undefined) {
            break;
        }

        if (maxTokens - m.content.length < 0) {
            break;
        }

        maxTokens -= m.content.length;
        messages.unshift(m);
    }

    const response = await fetchChatCompletion({
        apiKey: String(payload.globalSettings.apiKey),
        baseUrl: String(payload.globalSettings.baseUrl).trim().replace(/\/$/, ''),
        body: {
            messages,
            max_tokens: maxTokens,
            model: payload.globalSettings.model,
            temperature: payload.globalSettings.temperature,
            topP: payload.globalSettings.topP,
            stream: payload.globalSettings.stream ?? true,
        },
        signal,
    });

    if (!response.ok) {
        const responseJson = await response.json();
        const errMessage = responseJson.error?.message || response.statusText || 'Unknown error';
        throw new Error(errMessage);
    }

    const isStream = response.headers.get('content-type')?.includes('text/event-stream');
    if (isStream) {
        return parseStream(response);
    } else {
        const resJson = await response.json();
        return resJson.choices[0].message.content;
    }
};

const handleImageGeneration = async (payload: any) => {
    const prompt: string = payload.prompt;
    const response = await fetchImageGeneration({
        apiKey: String(payload.globalSettings.apiKey),
        baseUrl: String(payload.globalSettings.baseUrl).trim().replace(/\/$/, ''),
        body: {
            prompt,
            n: 1,
            size: '512x512',
            response_format: 'url',
        },
    });

    if (!response.ok) {
        const responseJson = await response.json();
        const errMessage = responseJson.error?.message || response.statusText || 'Unknown error';
        throw new Error(errMessage);
    }

    const resJson = await response.json();
    return resJson.data[0].url;
};

export const handlePrompt: Provider['handlePrompt'] = async (payload: HandlerPayload, signal?: AbortSignal): Promise<PromptResponse> => {
    if (payload.botId === 'chat_continuous' || payload.botId === 'chat_single') {
        return handleChatCompletion(payload, signal);
    }
    if (payload.botId === 'image_generation') {
        return handleImageGeneration(payload);
    }
    throw new Error('Invalid botId provided.');
};

export const handleRapidPrompt: Provider['handleRapidPrompt'] = async (prompt: string, globalSettings: any) => {
    const rapidPromptPayload: HandlerPayload = {
        conversationId: 'temp',
        conversationType: 'chat_single',
        botId: 'temp',
        globalSettings: {
            ...globalSettings,
            model: 'gpt-3.5-turbo',
            temperature: 0.4,
            maxTokens: 2048,
            topP: 1,
            stream: false,
        },
        botSettings: {},
        prompt,
        messages: [{ role: 'user', content: prompt }],
    };
    const result = await handleChatCompletion(rapidPromptPayload, new AbortController().signal);
    return typeof result === 'string' ? result : '';
};
