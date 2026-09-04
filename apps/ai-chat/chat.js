/**
 * chat.js — Chat manager for messages, UI, and interactions (core layer).
 */
const Chat = {
    NS: 'ai-chat',
    messages: [],
    isStreaming: false,
    abortController: null,
    queued: [],        // offline sends awaiting reconnect: [{ aiMsg, aiElement }]
    elements: {},

    init() {
        this.elements = {
            messages: document.getElementById('messages'),
            input: document.getElementById('message-input'),
            sendBtn: document.getElementById('send-btn'),
            welcome: document.getElementById('welcome'),
            tokenCount: document.getElementById('token-count'),
            lastSync: document.getElementById('last-sync'),
            outbox: document.getElementById('outbox-note'),
        };

        this.loadHistory();
        this.updateLastSync();
        this.setupEventListeners();
        this.updateSendButton();

        // Resend anything queued while offline as soon as we're back online.
        if (window.addEventListener) {
            window.addEventListener('online', () => this.flushQueue());
        }
    },

    /** Show when the conversation was last saved locally (history is always
     *  persisted, so this doubles as the offline 'last synced' stamp). */
    updateLastSync() {
        const el = this.elements.lastSync;
        if (!el) return;
        const ts = parseInt(Store.get(this.NS, 'lastSync', 0), 10);
        el.textContent = ts > 0 ? I18N.t('chat_last_sync', { time: Store.time(ts) }) : '';
    },

    loadHistory() {
        this.messages = Store.getJSON(this.NS, 'history', []);
        if (this.messages.length > 0) {
            this.hideWelcome();
            this.messages.forEach(msg => this.renderMessage(msg, false));
            this.scrollToBottom();
            // Pick up messages still queued from a previous session and, if we
            // are already online, flush them right away.
            this.resumeQueued();
        }
    },

    /** Re-queue assistant turns left marked 'queued' in persisted history. */
    resumeQueued() {
        const pending = this.messages.filter(m => m.role === 'assistant' && m.queued);
        if (pending.length === 0) return;
        pending.forEach((aiMsg) => {
            const el = this.elements.messages.querySelector(`[data-id="${aiMsg.id}"]`);
            if (el) {
                this.queued.push({ aiMsg, aiElement: el });
                const bubble = el.querySelector('.message-bubble');
                if (bubble) bubble.innerHTML = `<span class="queued-text">⏳ ${I18N.t('chat_queued')}</span>`;
            }
        });
        this.updateOutboxNote();
        if (typeof navigator === 'undefined' || navigator.onLine !== false) {
            this.flushQueue();
        }
    },

    setupEventListeners() {
        // Input handling
        this.elements.input.addEventListener('input', () => {
            this.autoResize();
            this.updateSendButton();
        });

        this.elements.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Send button
        this.elements.sendBtn.addEventListener('click', () => this.sendMessage());

        // Quick action buttons (localized prompts)
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.dataset.promptKey;
                if (!key) return;
                this.elements.input.value = I18N.t(key);
                this.updateSendButton();
                this.sendMessage();
            });
        });
    },

    autoResize() {
        const input = this.elements.input;
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    },

    updateSendButton() {
        const hasText = this.elements.input.value.trim().length > 0;
        this.elements.sendBtn.disabled = !hasText || this.isStreaming;
    },

    async sendMessage() {
        const content = this.elements.input.value.trim();
        if (!content || this.isStreaming) return;

        // Hide welcome screen
        this.hideWelcome();

        // Create user message
        const userMsg = {
            id: Store.id(),
            role: 'user',
            content: content,
            timestamp: Date.now(),
        };

        // Add to history and render
        this.messages.push(userMsg);
        this.renderMessage(userMsg);
        this.saveHistory();

        // Clear input
        this.elements.input.value = '';
        this.autoResize();
        this.updateSendButton();

        // Create AI message placeholder
        const aiMsg = {
            id: Store.id(),
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
        };

        this.messages.push(aiMsg);
        const aiElement = this.renderMessage(aiMsg);
        this.showTypingIndicator(aiElement);
        this.scrollToBottom();

        // Start streaming
        await this.streamResponse(aiMsg, aiElement);
    },

    async streamResponse(aiMsg, aiElement) {
        this.isStreaming = true;
        this.updateSendButton();
        this.abortController = new AbortController();

        // Build API messages (system prompt + chat history)
        const systemPrompt = Store.get(this.NS, 'systemPrompt', I18N.t('chat_default_prompt'));
        const model = Store.get(this.NS, 'selectedModel', 'llama-3.3-70b-versatile');
        const maxTokens = parseInt(Store.get(this.NS, 'maxTokens', 1024)) || 1024;

        const apiMessages = [
            { role: 'system', content: systemPrompt },
            ...this.messages
                .filter(m => m.role === 'user' || m.role === 'assistant')
                .filter(m => m.content) // Skip empty AI messages
                .slice(-20) // Last 20 messages for context
                .map(m => ({ role: m.role, content: m.content })),
        ];

        const bubble = aiElement.querySelector('.message-bubble');
        this.removeTypingIndicator(aiElement);

        let chunkCount = 0;

        await GroqAPI.streamChat(
            apiMessages,
            model,
            // onChunk
            (delta, fullContent) => {
                aiMsg.content = fullContent;
                bubble.innerHTML = this.formatMessage(fullContent);
                chunkCount++;

                if (chunkCount % 3 === 0) {
                    this.scrollToBottom();
                }
            },
            // onDone
            (fullContent) => {
                aiMsg.content = fullContent;
                aiMsg.timestamp = Date.now();
                delete aiMsg.queued;
                bubble.innerHTML = this.formatMessage(fullContent || I18N.t('chat_empty_response'));
                this.updateMessageMeta(aiElement, aiMsg);
                this.saveHistory();
                this.updateOutboxNote();
                this.scrollToBottom();
                this.finishStreaming();
            },
            // onError(error, isNetwork) — network failures queue the message
            // for an automatic resend; API/server errors show as before.
            (error, isNetwork) => {
                if (isNetwork) {
                    this.queueMessage(aiMsg, aiElement);
                    return;
                }
                bubble.innerHTML = `<span class="error-text">⚠️ ${error}</span>`;
                this.updateMessageMeta(aiElement, aiMsg);
                this.scrollToBottom();
                this.finishStreaming();
                TG.toast(error, 'error');
            },
            this.abortController.signal,
            maxTokens
        );
    },

    finishStreaming() {
        this.isStreaming = false;
        this.abortController = null;
        this.updateSendButton();
        this.updateTokenCount();
    },

    /**
     * Queue an AI turn for an automatic resend: the user's message is already
     * saved in history, so on reconnect we only re-run the assistant stream
     * against it. The queued bubble shows a placeholder until then.
     */
    queueMessage(aiMsg, aiElement) {
        if (this.queued.some(q => q.aiMsg.id === aiMsg.id)) {
            this.finishStreaming();
            return;
        }
        aiMsg.queued = true;
        this.queued.push({ aiMsg, aiElement });
        const bubble = aiElement.querySelector('.message-bubble');
        if (bubble) bubble.innerHTML = `<span class="queued-text">⏳ ${I18N.t('chat_queued')}</span>`;
        this.updateMessageMeta(aiElement, aiMsg);
        this.saveHistory();
        this.updateOutboxNote();
        this.finishStreaming();
    },

    /** Resend every queued message (triggered by the browser's 'online' event). */
    async flushQueue() {
        if (this.queued.length === 0) return;
        const pending = this.queued.splice(0);
        this.updateOutboxNote();
        for (const item of pending) {
            // Skip entries whose thread was cleared or regenerated meanwhile.
            if (!this.messages.some(m => m.id === item.aiMsg.id)) continue;
            await this.streamResponse(item.aiMsg, item.aiElement);
        }
    },

    /** Show/hide the 'N message(s) queued' note above the composer. */
    updateOutboxNote() {
        const el = this.elements.outbox;
        if (!el) return;
        if (this.queued.length > 0) {
            el.textContent = I18N.t('chat_queued_note', { n: this.queued.length });
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    },

    cancelStreaming() {
        if (this.abortController) {
            this.abortController.abort();
        }
    },

    renderMessage(msg, animate = true) {
        const div = document.createElement('div');
        div.className = `message ${msg.role === 'user' ? 'user' : 'ai'}`;
        div.dataset.id = msg.id;

        if (!animate) {
            div.style.animation = 'none';
        }

        div.innerHTML = `
            <div class="message-bubble">${msg.content ? this.formatMessage(msg.content) : ''}</div>
            <div class="message-meta">
                <span class="message-time">${Store.time(msg.timestamp)}</span>
                <div class="message-actions">
                    <button class="action-btn copy-btn" title="copy">📋</button>
                    ${msg.role === 'assistant' ? '<button class="action-btn regenerate-btn" title="regenerate">🔄</button>' : ''}
                </div>
            </div>
        `;

        // Copy button
        div.querySelector('.copy-btn').addEventListener('click', () => {
            this.copyMessage(msg.content);
        });

        // Regenerate button
        const regenBtn = div.querySelector('.regenerate-btn');
        if (regenBtn) {
            regenBtn.addEventListener('click', () => {
                this.regenerateMessage(msg.id);
            });
        }

        this.elements.messages.appendChild(div);
        return div;
    },

    updateMessageMeta(element, msg) {
        const timeEl = element.querySelector('.message-time');
        if (timeEl) {
            timeEl.textContent = Store.time(msg.timestamp);
        }
    },

    showTypingIndicator(element) {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        element.querySelector('.message-bubble').appendChild(indicator);
    },

    removeTypingIndicator(element) {
        const indicator = element.querySelector('.typing-indicator');
        if (indicator) indicator.remove();
    },

    hideWelcome() {
        if (this.elements.welcome) {
            this.elements.welcome.style.display = 'none';
        }
    },

    showWelcome() {
        if (this.elements.welcome) {
            this.elements.welcome.style.display = 'flex';
        }
    },

    formatMessage(text) {
        // Simple markdown-like formatting
        let formatted = text
            // Code blocks
            .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
            // Inline code
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // Bold
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            // Line breaks
            .replace(/\n/g, '<br>');

        return formatted;
    },

    async copyMessage(content) {
        try {
            await navigator.clipboard.writeText(content);
            TG.toast(I18N.t('chat_copied'), 'success');
        } catch {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = content;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            TG.toast(I18N.t('chat_copied'), 'success');
        }
    },

    async regenerateMessage(msgId) {
        if (this.isStreaming) return;

        // Find the message and remove it and all messages after it
        const idx = this.messages.findIndex(m => m.id === msgId);
        if (idx === -1) return;

        // Remove this message and all after it
        this.messages = this.messages.slice(0, idx);

        // Remove DOM elements
        const allMsgs = this.elements.messages.querySelectorAll('.message');
        allMsgs.forEach(el => {
            const elId = el.dataset.id;
            const elIdx = this.messages.findIndex(m => m.id === elId);
            if (elIdx === -1) el.remove();
        });

        // Remove the last user message content and re-send
        const lastUserMsg = [...this.messages].reverse().find(m => m.role === 'user');
        if (lastUserMsg) {
            // Remove last user message too
            this.messages = this.messages.slice(0, -1);
            const userEl = this.elements.messages.querySelector(`[data-id="${lastUserMsg.id}"]`);
            if (userEl) userEl.remove();

            // Re-send
            this.elements.input.value = lastUserMsg.content;
            this.updateSendButton();
            await this.sendMessage();
        }
    },

    clearChat() {
        this.messages = [];
        Store.remove(this.NS, 'history');
        this.queued = [];
        this.updateOutboxNote();

        // Remove all messages from DOM
        const msgElements = this.elements.messages.querySelectorAll('.message');
        msgElements.forEach(el => el.remove());

        this.showWelcome();
        this.updateTokenCount();
    },

    saveHistory() {
        Store.setJSON(this.NS, 'history', this.messages);
        Store.set(this.NS, 'lastSync', Date.now());
        this.updateLastSync();
    },

    scrollToBottom() {
        requestAnimationFrame(() => {
            this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
        });
    },

    updateTokenCount() {
        const totalChars = this.messages.reduce((sum, m) => sum + (m.content?.length || 0), 0);
        const estimatedTokens = Math.ceil(totalChars / 4);
        this.elements.tokenCount.textContent = estimatedTokens > 0 ? `~${estimatedTokens} tokens` : '';
    },
};