"use client";

import { useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [userInput, setUserInput] = useState('');

  const { messages, status, error, sendMessage, setMessages } = useChat();

  // Add initial greeting on first render
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'greeting',
          role: 'assistant',
          content: "Howdy! I'm your Valley Somm — the AI guide to Yadkin Valley wines. Ask me about wineries, trails, pairings, events, or recommendations!",
        },
      ]);
    }
  }, [messages.length, setMessages]);

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleSend = () => {
    if (userInput.trim() && !isLoading) {
      sendMessage(userInput);
      setUserInput('');
    }
  };

  return (
    <>
      {/* Floating Toggle Button - only visible when chat is closed */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 bg-[#6B2737] text-[#F5F0E1] p-4 rounded-full shadow-2xl hover:bg-[#D4A017] transition z-[999] flex items-center justify-center"
          aria-label="Open chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-[1000] border border-gray-300 overflow-hidden">
          <div className="bg-[#6B2737] text-[#F5F0E1] p-4 font-playfair text-xl text-center flex justify-between items-center">
            <span>Ask the Somm</span>
            <button
              onClick={() => setOpen(false)}
              className="text-[#F5F0E1] hover:text-white"
              aria-label="Close chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    m.role === 'user'
                      ? 'bg-[#6B2737] text-[#F5F0E1]'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {(m as any).content || (m as any).parts?.[0]?.text || ''}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-center text-gray-500 text-sm">Thinking...</div>
            )}
            {error && (
              <div className="text-center text-red-500 text-sm">Error: {error.message}</div>
            )}
          </div>

          <div className="p-4 border-t bg-gray-50">
            <div className="flex gap-2">
              <input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Ask about wineries, trails, pairings..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:border-[#6B2737] text-gray-800"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !userInput.trim()}
                className="bg-[#6B2737] text-[#F5F0E1] px-6 py-3 rounded-full hover:bg-[#D4A017] transition font-medium"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}