(function () {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatWidget);
    } else {
        initChatWidget();
    }

    function initChatWidget() {
        // Avoid injecting multiple times
        if (document.querySelector('#nara-chat-widget')) {
            return;
        }
        // Create and inject styles
        const style = document.createElement('style');
        style.textContent = `
            .chat-widget {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
            }

            .chat-button {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: #6c5ce7;
                color: white;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .chat-interface {
                display: none;
                position: fixed;
                bottom: 90px;
                right: 20px;
                width: 350px;
                height: 500px;
                background: white;
                border-radius: 10px;
                box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
                flex-direction: column;
            }

            .chat-header {
                background: #6c5ce7;
                color: white;
                padding: 15px;
                border-radius: 10px 10px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .chat-messages {
                flex: 1;
                padding: 15px;
                overflow-y: auto;
                background: #f8f9fa;
            }

            .chat-input-container {
                padding: 15px;
                background: white;
                border-top: 1px solid #eee;
            }

            .chat-input-wrapper {
                display: flex;
                gap: 10px;
                background: #f8f9fa;
                border-radius: 25px;
                padding: 8px 15px;
            }

            .chat-input {
                flex: 1;
                border: none;
                background: transparent;
                padding: 8px;
                outline: none;
                color: #111827; /* near-black for readability */
            }
            .chat-input::placeholder {
                color:rgb(5, 5, 5); /* neutral gray placeholder */
                opacity: 1;
            }

            .send-button {
                background: none;
                border: none;
                color: #6c5ce7;
                cursor: pointer;
                padding: 5px;
            }

            .message {
                margin: 8px 0;
                padding: 10px 15px;
                border-radius: 15px;
                max-width: 80%;
            }

            .user-message {
                background: #6c5ce7;
                color: white;
                margin-left: auto;
            }

            .assistant-message {
                background: white;
                color: #2c3e50;
                margin-right: auto;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            }

            /* Intro card */
            .intro-card {
                display: flex;
                align-items: center;
                gap: 12px;
                margin: 4px 0 12px 0;
                padding: 12px 14px;
                border-radius: 12px;
                background: #ffffff;
                box-shadow: 0 1px 4px rgba(0,0,0,0.06);
            }
            .intro-card .intro-avatar {
                width: 36px;
                height: 36px;
                border-radius: 8px;
                background: #fff;
                border: 1px solid #eee;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }
            .intro-card .intro-title {
                font-weight: 600;
                color: #111827;
            }
            .intro-card .intro-sub {
                font-size: 12px;
                color: #6b7280;
            }
            .intro-card .intro-brand a {
                font-size: 11px;
                color: #6b7280;
                text-decoration: underline;
            }

            .loading-indicator {
                background: white;
                color: #2c3e50;
                margin-right: auto;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            }

            .loading-dots {
                display: flex;
                gap: 2px;
            }

            .loading-dots span {
                animation: loading 1.4s infinite;
            }

            .loading-dots span:nth-child(2) {
                animation-delay: 0.2s;
            }

            .loading-dots span:nth-child(3) {
                animation-delay: 0.4s;
            }

            @keyframes loading {
                0%, 100% { opacity: 0.2; }
                50% { opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        // Create widget container
        const widget = document.createElement('div');
        widget.className = 'chat-widget';
        widget.id = 'nara-chat-widget';

        // Create chat button
        const button = document.createElement('button');
        button.className = 'chat-button';
        button.textContent = '💬';
        widget.appendChild(button);

        // Create chat interface
        const chatInterface = document.createElement('div');
        chatInterface.className = 'chat-interface';

        // Determine bot name (from agent attributes if provided)
        const agentElementForName = document.querySelector('.ai-agent');
        const botName = (agentElementForName && (agentElementForName.getAttribute('bot-name') || agentElementForName.getAttribute('name'))) || 'Nara';

        // Create header with brand (logo + name) and close button
        const header = document.createElement('div');
        header.className = 'chat-header';
        header.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <img src="/static/images/nara_logo.png" alt="Nara Virtual" width="28" height="28" style="border-radius:6px; background:#ffffff; padding:2px;" />
                <span style="font-weight:600;">${botName}</span>
            </div>
            <button class="close-button" style="background: none; border: none; color: white; cursor: pointer; font-size: 20px;">×</button>
        `;
        chatInterface.appendChild(header);

        // Create messages container
        const messages = document.createElement('div');
        messages.className = 'chat-messages';
        chatInterface.appendChild(messages);

        // Intro section inside the body before any chat
        const intro = document.createElement('div');
        intro.className = 'intro-card';
        intro.style.justifyContent = 'center';
        intro.style.flexDirection = 'column';
        intro.style.textAlign = 'center';
        intro.innerHTML = `
            <div class="intro-avatar" style="width:64px;height:64px;border-radius:50%;border:2px solid #e5e7eb;">
                <img src="/static/images/nara_logo.png" alt="${botName}" width="56" height="56" style="border-radius:50%"/>
            </div>
            <div class="intro-title" style="margin-top:8px;">Hey, I'm ${botName}</div>
            <div class="intro-sub">How can I help you today?</div>
        `;
        messages.appendChild(intro);

       

        // Create input container
        const inputContainer = document.createElement('div');
        inputContainer.className = 'chat-input-container';
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'chat-input-wrapper';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'chat-input';
        input.placeholder = 'Type your message...';

        const sendButton = document.createElement('button');
        sendButton.className = 'send-button';
        sendButton.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
        `;

        inputWrapper.appendChild(input);
        inputWrapper.appendChild(sendButton);
        inputContainer.appendChild(inputWrapper);
        chatInterface.appendChild(inputContainer);

        // Footer brand (bluish background)
        const footerBrand2 = document.createElement('div');
        footerBrand2.style.textAlign = 'center';
        footerBrand2.style.fontSize = '11px';
        footerBrand2.style.padding = '8px 10px';
        footerBrand2.style.margin = '6px 10px 10px';
        footerBrand2.style.borderRadius = '10px';
        footerBrand2.style.background = '#eff6ff'; /* light blue */
        footerBrand2.style.border = '1px solid #bfdbfe';
        footerBrand2.style.color = '#2563eb'; /* primary blue */
        footerBrand2.innerHTML = `<a href="https://www.naravirtual.in" target="_blank" rel="noopener" style="color:#2563eb; text-decoration:none; font-weight:600;">Powered by NaraVirtual</a>`;
        chatInterface.appendChild(footerBrand2);

        widget.appendChild(chatInterface);
        document.body.appendChild(widget);

        let chatHistory = [];

        function addMessage(text, isUser) {
            const message = document.createElement('div');
            message.className = `message ${isUser ? 'user-message' : 'assistant-message'}`;
            message.textContent = text;
            messages.appendChild(message);
            messages.scrollTop = messages.scrollHeight;

            chatHistory.push({
                role: isUser ? 'user' : 'assistant',
                content: text
            });
        }

        function addLoadingIndicator() {
            const loading = document.createElement('div');
            loading.className = 'message assistant-message loading-indicator';
            loading.innerHTML = '<div class="loading-dots"><span>.</span><span>.</span><span>.</span></div>';
            messages.appendChild(loading);
            messages.scrollTop = messages.scrollHeight;
            return loading;
        }

        function removeLoadingIndicator(loadingElement) {
            if (loadingElement && loadingElement.parentNode) {
                loadingElement.parentNode.removeChild(loadingElement);
            }
        }

        sendButton.addEventListener('click', function () {
            const message = input.value.trim();
            if (message) {
                addMessage(message, true);
                input.value = '';
            
                const loading = addLoadingIndicator();
            
                const agentElement = document.querySelector('.ai-agent');
                if (!agentElement) {
                    removeLoadingIndicator(loading);
                    addMessage('Error: AI agent configuration missing.', false);
                    return;
                }
            
                const endpoint = agentElement.getAttribute('endpoint') || '/naravirtualbot';
                const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
                const baseURL = window.location.origin;
                const url = `${baseURL}${formattedEndpoint}`;
            
                const chatbotUrl = 'https://chatbot.naravirtual.in/api/chatbot';
                console.log("chatbotUrl", chatbotUrl);

                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        identifier: agentElement.getAttribute('identifier'),
                        question: message,
                        history: chatHistory.slice(-10),
                        user_id: agentElement.getAttribute('user') || 'anonymous',
                        chatbot_url: chatbotUrl
                    })
                })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(err => {
                            throw new Error(err.detail || err.message || 'Unknown error');
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    removeLoadingIndicator(loading);
                    addMessage(data.message, false);
                })
                .catch(error => {
                    removeLoadingIndicator(loading);
                    console.error('Error:', error);
                    addMessage('Sorry, there was an error processing your request.', false);
                });
            }
            
            
        });

        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                sendButton.click();
            }
        });

        // Add click handlers
        button.addEventListener('click', function () {
            chatInterface.style.display = 'flex';
            button.style.display = 'none';
        });

        header.querySelector('.close-button').addEventListener('click', function () {
            chatInterface.style.display = 'none';
            button.style.display = 'block';
        });
    }
})();
