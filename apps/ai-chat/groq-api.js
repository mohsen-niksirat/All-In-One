/**
 * groq-api.js — Groq API client with streaming support (core layer).
 */
const GroqAPI = {
    BASE_URL: 'https://api.groq.com/openai/v1',
    NS: 'ai-chat',

    /**
     * Send a chat completion request with streaming
     * @param {Array} messages - Array of {role, content} objects
     * @param {string} model - Model identifier
     * @param {Function} onChunk - Callback for each streamed chunk
     * @param {Function} onDone - Callback when streaming is complete
     * @param {Function} onError - Callback for errors
     * @param {AbortSignal} signal - Abort signal for cancellation
     * @param {number} maxTokens - Max tokens to generate
     */
    async streamChat(messages, model, onChunk, onDone, onError, signal, maxTokens = 1024) {
        const apiKey = Store.get(this.NS, 'apiKey', '');

        if (!apiKey) {
            onError(I18N.t('chat_no_api_key_error'));
            return;
        }

        try {
            const response = await fetch(`${this.BASE_URL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: model,
                    messages: messages,
                    max_tokens: maxTokens,
                    temperature: 0.7,
                    stream: true,
                }),
                signal: signal,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMsg = errorData.error?.message || `${I18N.t('chat_error_http')} ${response.status}`;
                throw new Error(errorMsg);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullContent = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                // Process SSE lines
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep incomplete line in buffer

                for (const line of lines) {
                    const trimmed = line.trim();

                    if (!trimmed || !trimmed.startsWith('data: ')) continue;

                    const data = trimmed.slice(6);

                    if (data === '[DONE]') {
                        onDone(fullContent);
                        return;
                    }

                    try {
                        const parsed = JSON.parse(data);
                        const delta = parsed.choices?.[0]?.delta?.content;

                        if (delta) {
                            fullContent += delta;
                            onChunk(delta, fullContent);
                        }
                    } catch {
                        // Skip malformed JSON lines
                    }
                }
            }

            // Stream ended without [DONE] signal
            onDone(fullContent);

        } catch (error) {
            if (error.name === 'AbortError') {
                onDone(''); // User cancelled
                return;
            }
            onError(error.message || I18N.t('chat_error_connect'));
        }
    },

    /**
     * Validate API key by making a simple request
     */
    async validateApiKey(apiKey) {
        try {
            const response = await fetch(`${this.BASE_URL}/models`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                },
            });
            return response.ok;
        } catch {
            return false;
        }
    },

    /**
     * Get available models
     */
    async getModels(apiKey) {
        try {
            const response = await fetch(`${this.BASE_URL}/models`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                },
            });

            if (!response.ok) return [];

            const data = await response.json();
            return data.data || [];
        } catch {
            return [];
        }
    }
};