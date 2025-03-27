import { createAnthropic } from '@ai-sdk/anthropic';
import { createDeepSeek } from '@ai-sdk/deepseek';
import type { StreamRequestType } from '@analogia/models/chat';
import { BASE_PROXY_ROUTE, FUNCTIONS_ROUTE, ProxyRoutes } from '@analogia/models/constants';
import { CLAUDE_MODELS, DEEPSEEK_MODELS, LLMProvider } from '@analogia/models/llm';
import { type LanguageModelV1 } from 'ai';
import { getRefreshedAuthTokens } from '../auth';
export interface AnalogiaPayload {
    requestType: StreamRequestType;
}

export async function initModel(
    provider: LLMProvider,
    model: CLAUDE_MODELS | DEEPSEEK_MODELS,
    payload: AnalogiaPayload,
): Promise<LanguageModelV1> {
    switch (provider) {
        case LLMProvider.ANTHROPIC:
            return await getAnthropicProvider(model as CLAUDE_MODELS, payload);
        case LLMProvider.DEEPSEEK:
            return await getDeepSeekProvider(model as DEEPSEEK_MODELS, payload);
        default:
            throw new Error(`Unsupported provider: ${provider}`);
    }
}

async function getAnthropicProvider(
    model: CLAUDE_MODELS,
    payload: AnalogiaPayload,
): Promise<LanguageModelV1> {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    const proxyUrl = `${import.meta.env.VITE_SUPABASE_API_URL}${FUNCTIONS_ROUTE}${BASE_PROXY_ROUTE}${ProxyRoutes.ANTHROPIC}`;

    const config: {
        apiKey?: string;
        baseURL?: string;
        headers?: Record<string, string>;
    } = {};

    if (apiKey) {
        config.apiKey = apiKey;
    } else {
        const authTokens = await getRefreshedAuthTokens();
        if (!authTokens) {
            throw new Error('No auth tokens found');
        }
        config.apiKey = '';
        config.baseURL = proxyUrl;
        config.headers = {
            Authorization: `Bearer ${authTokens.accessToken}`,
            'X-Analogia-Request-Type': payload.requestType,
        };
    }

    const anthropic = createAnthropic(config);
    return anthropic(model, {
        cacheControl: true,
    });
}

async function getDeepSeekProvider(
    model: DEEPSEEK_MODELS,
    payload: AnalogiaPayload,
): Promise<LanguageModelV1> {
    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    // const proxyUrl = `${import.meta.env.VITE_SUPABASE_API_URL}${FUNCTIONS_ROUTE}${BASE_PROXY_ROUTE}${ProxyRoutes.DEEPSEEK}`;
    const proxyUrl = `https://api.deepseek.com/v1`;

    const config: {
        apiKey?: string;
        baseURL?: string;
        headers?: Record<string, string>;
        disableFunctionCalling?: boolean;
    } = {};

    if (apiKey) {
        config.apiKey = apiKey;
    } else {
        const authTokens = await getRefreshedAuthTokens();
        if (!authTokens) {
            throw new Error('No auth tokens found');
        }
        config.apiKey = '';
        config.baseURL = proxyUrl;
        config.headers = {
            Authorization: `Bearer ${authTokens.accessToken}`,
            'X-Analogia-Request-Type': payload.requestType,
        };
    }

    // Disable function calling for DeepSeek models
    config.disableFunctionCalling = true;

    const deepseek = createDeepSeek(config);
    // const deepseek = createDeepSeek({
    //     apiKey: apiKey ?? '',
    // });
    return deepseek(model, {
        // cacheControl: true,
    });
}
