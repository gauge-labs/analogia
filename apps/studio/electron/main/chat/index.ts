import { PromptProvider } from '@analogia/ai/src/prompt/provider';
import { chatToolSet } from '@analogia/ai/src/tools';
import { CLAUDE_MODELS, DEEPSEEK_MODELS, LLMProvider } from '@analogia/models';
import {
    ChatSuggestionSchema,
    ChatSummarySchema,
    StreamRequestType,
    type ChatSuggestion,
    type CompletedStreamResponse,
    type PartialStreamResponse,
    type UsageCheckResult,
} from '@analogia/models/chat';
import { MainChannels } from '@analogia/models/constants';
import {
    generateObject,
    streamText,
    type CoreMessage,
    type CoreSystemMessage,
    type TextStreamPart,
    type ToolSet,
} from 'ai';
import { z } from 'zod';
import { mainWindow } from '..';
import { PersistentStorage } from '../storage';
import { initModel } from './llmProvider';

class LlmManager {
    private static instance: LlmManager;
    private abortController: AbortController | null = null;
    private useAnalytics: boolean = true;
    private promptProvider: PromptProvider;

    private constructor() {
        this.restoreSettings();
        this.promptProvider = new PromptProvider();
    }

    private restoreSettings() {
        const settings = PersistentStorage.USER_SETTINGS.read() || {};
        const enable = settings.enableAnalytics !== undefined ? settings.enableAnalytics : true;

        if (enable) {
            this.useAnalytics = true;
        } else {
            this.useAnalytics = false;
        }
    }

    public toggleAnalytics(enable: boolean) {
        this.useAnalytics = enable;
    }

    public static getInstance(): LlmManager {
        if (!LlmManager.instance) {
            LlmManager.instance = new LlmManager();
        }
        return LlmManager.instance;
    }

    public async stream(
        messages: CoreMessage[],
        requestType: StreamRequestType,
        options?: {
            abortController?: AbortController;
            skipSystemPrompt?: boolean;
            forceProvider?: 'anthropic' | 'deepseek';
        },
    ): Promise<CompletedStreamResponse | undefined> {
        const { abortController, skipSystemPrompt, forceProvider } = options || {};
        this.abortController = abortController || new AbortController();
        try {
            if (!skipSystemPrompt) {
                const systemMessage = {
                    role: 'system',
                    content: this.promptProvider.getSystemPrompt(process.platform),
                    experimental_providerMetadata: {
                        //anthropic: { cacheControl: { type: 'ephemeral' } },
                        deepseek: { cacheControl: { type: 'ephemeral' } },
                    },
                } as CoreSystemMessage;
                messages = [systemMessage, ...messages];
            }

            // Determine which provider to use based on forceProvider option
            let model;
            if (forceProvider === 'deepseek') {
                model = await initModel(LLMProvider.DEEPSEEK, DEEPSEEK_MODELS.DEEPSEEK_V3, {
                    requestType,
                });
            } else {
                model = await initModel(LLMProvider.ANTHROPIC, CLAUDE_MODELS.SONNET, {
                    requestType,
                });
            }

            // Check if we're using DeepSeek model
            const isDeepSeek = !forceProvider || forceProvider === 'deepseek';

            const { usage, fullStream, text, response } = await streamText({
                model,
                messages,
                abortSignal: this.abortController?.signal,
                onError: (error) => {
                    console.error('Error', JSON.stringify(error, null, 2));
                    throw error;
                },
                maxSteps: 10,
                // Only include tools for non-DeepSeek models
                tools: isDeepSeek ? undefined : chatToolSet,
                maxTokens: isDeepSeek ? 4096 : 64000, // Limit tokens for DeepSeek
                headers: {
                    'llm-beta': 'output-128k-2025-02-19',
                },
                onStepFinish: ({ toolResults }) => {
                    for (const toolResult of toolResults) {
                        this.emitMessagePart(toolResult);
                    }
                },
            });
            const streamParts: TextStreamPart<ToolSet>[] = [];
            for await (const partialStream of fullStream) {
                this.emitMessagePart(partialStream);
                streamParts.push(partialStream);
            }
            return {
                payload: (await response).messages,
                type: 'full',
                usage: await usage,
                text: await text,
            };
        } catch (error: any) {
            // Inside the stream method, update the error handling
            try {
                // ... existing code ...
            } catch (error: any) {
                try {
                    console.error('Error in stream:', error);

                    // Handle EPIPE errors specifically
                    if (error.code === 'EPIPE') {
                        return {
                            type: 'error',
                            message: 'Connection to AI service was interrupted. Please try again.',
                        };
                    }

                    if (error?.error?.statusCode) {
                        if (error?.error?.statusCode === 403) {
                            const rateLimitError = JSON.parse(
                                error.error.responseBody,
                            ) as UsageCheckResult;
                            return {
                                type: 'rate-limited',
                                rateLimitResult: rateLimitError,
                            };
                        } else {
                            return {
                                type: 'error',
                                message: error.error.responseBody,
                            };
                        }
                    }
                    const errorMessage = this.getErrorMessage(error);
                    return { message: errorMessage, type: 'error' };
                } catch (parseError) {
                    console.error('Error parsing error:', parseError);
                    return { message: 'An unknown error occurred', type: 'error' };
                } finally {
                    this.abortController = null;
                }
            }
        }
    }

    public abortStream(): boolean {
        if (this.abortController) {
            this.abortController.abort();
            return true;
        }
        return false;
    }

    private emitMessagePart(streamPart: TextStreamPart<ToolSet>) {
        const res: PartialStreamResponse = {
            type: 'partial',
            payload: streamPart,
        };
        mainWindow?.webContents.send(MainChannels.CHAT_STREAM_PARTIAL, res);
    }

    private getErrorMessage(error: unknown): string {
        if (error instanceof Error) {
            return error.message;
        }
        if (typeof error === 'string') {
            return error;
        }
        if (error instanceof Response) {
            return error.statusText;
        }
        if (error && typeof error === 'object' && 'message' in error) {
            return String(error.message);
        }
        return 'An unknown chat error occurred';
    }

    public async generateSuggestions(messages: CoreMessage[]): Promise<ChatSuggestion[]> {
        try {
            // const model = await initModel(LLMProvider.ANTHROPIC, CLAUDE_MODELS.HAIKU, {
            //     requestType: StreamRequestType.SUGGESTIONS,
            // });
            const model = await initModel(LLMProvider.DEEPSEEK, DEEPSEEK_MODELS.DEEPSEEK_V3, {
                requestType: StreamRequestType.SUGGESTIONS,
            });

            // Check if we're using DeepSeek model
            const isDeepSeek = model.toString().includes('deepseek');

            // If using DeepSeek, return empty suggestions as DeepSeek doesn't support function calling
            if (isDeepSeek) {
                return [];
            }

            const { object } = await generateObject({
                model,
                output: 'array',
                schema: ChatSuggestionSchema,
                messages,
            });
            return object as ChatSuggestion[];
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    public async generateChatSummary(messages: CoreMessage[]): Promise<string | null> {
        try {
            // const model = await initModel(LLMProvider.ANTHROPIC, CLAUDE_MODELS.HAIKU, {
            //     requestType: StreamRequestType.SUMMARY,
            // });
            const model = await initModel(LLMProvider.DEEPSEEK, DEEPSEEK_MODELS.DEEPSEEK_V3, {
                requestType: StreamRequestType.SUMMARY,
            });

            // Check if we're using DeepSeek model
            const isDeepSeek = model.toString().includes('deepseek');

            // If using DeepSeek, return a simple summary message
            if (isDeepSeek) {
                return 'Summary generation is not available with DeepSeek models.';
            }

            const systemMessage: CoreSystemMessage = {
                role: 'system',
                content: this.promptProvider.getSummaryPrompt(),
                experimental_providerMetadata: {
                    // anthropic: { cacheControl: { type: 'ephemeral' } },
                    deepseek: { cacheControl: { type: 'ephemeral' } },
                },
            };

            // Transform messages to emphasize they are historical content
            const conversationMessages = messages
                .filter((msg) => msg.role !== 'tool')
                .map((msg) => {
                    const prefix = '[HISTORICAL CONTENT] ';
                    const content =
                        typeof msg.content === 'string' ? prefix + msg.content : msg.content;

                    return {
                        ...msg,
                        content,
                    };
                });

            const { object } = await generateObject({
                model,
                schema: ChatSummarySchema,
                messages: [
                    { role: 'system', content: systemMessage.content as string },
                    ...conversationMessages.map((msg) => ({
                        role: msg.role,
                        content: msg.content as string,
                    })),
                ],
            });

            const {
                filesDiscussed,
                projectContext,
                implementationDetails,
                userPreferences,
                currentStatus,
            } = object as z.infer<typeof ChatSummarySchema>;

            // Formats the structured object into the desired text format
            const summary = `# Files Discussed
${filesDiscussed.join('\n')}

# Project Context
${projectContext}

# Implementation Details
${implementationDetails}

# User Preferences
${userPreferences}

# Current Status
${currentStatus}`;

            return summary;
        } catch (error) {
            console.error('Error generating summary:', error);
            return null;
        }
    }
}

export default LlmManager.getInstance();
