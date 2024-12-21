import React, { useState, useRef, useEffect } from 'react';
import { useLiveAPIContext } from '../../contexts/LiveAPIContext';
import { ServerContent, isModelTurn, LiveConfig } from '../../multimodal-live-types';
import { Content } from '@google/generative-ai';
import './ChatBubble.scss';

export const ChatBubble = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Array<{text: string, isUser: boolean}>>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { connected, client } = useLiveAPIContext();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    const content: Content = {
      role: 'user',
      parts: [{ text: inputText }]
    };
    
    setMessages(prev => [...prev, { text: inputText, isUser: true }]);
    client.send([{ text: inputText }]);
    setInputText('');
  };

  const toggleChat = () => {
    setIsExpanded(!isExpanded);
    if (!connected) {
      const config: LiveConfig = {
        model: "models/gemini-2.0-flash-exp",
        generationConfig: {
          responseModalities: "text",
        },
        systemInstruction: {
          parts: [{
            text: "You are a helpful assistant."
          }]
        }
      };
      client.connect(config);
    }
  };

  useEffect(() => {
    if (client) {
      const handleContent = (content: ServerContent) => {
        if (isModelTurn(content)) {
          const text = content.modelTurn.parts
            .filter(part => part.text)
            .map(part => part.text)
            .join('');
            
          if (text) {
            setMessages(prev => [...prev, { text, isUser: false }]);
          }
        }
      };

      client.on('content', handleContent);
      return () => {
        client.off('content', handleContent);
      };
    }
  }, [client]);

  return (
    <div className={`chat-container ${isExpanded ? 'expanded' : ''}`}>
      {!isExpanded ? (
        <button 
          className="bubble-button"
          onClick={toggleChat}
          aria-label="Open chat"
        >
          <span className="material-symbols-outlined">chat</span>
          {!connected && <div className="status-dot" />}
        </button>
      ) : (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Sales Arena Assistant</h3>
            <button onClick={toggleChat} aria-label="Close chat">×</button>
          </div>
          
          <div className="messages-container">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`message ${msg.isUser ? 'user' : 'ai'}`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-container">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSend();
                }
              }}
            />
            <button 
              onClick={handleSend}
              disabled={!connected || !inputText.trim()}
              className="send-button"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};