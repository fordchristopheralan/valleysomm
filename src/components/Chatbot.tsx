"use client";
import { useState } from 'react';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');

  const handleSend = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage = userInput.trim();
    setUserInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setStreamingContent('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([...messages, { role: 'user', content: userMessage }]),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to get response from server');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;
        setStreamingContent(assistantContent);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);
      setStreamingContent('');
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const showGreeting = messages.length === 0 && !streamingContent && !isLoading;

  return (
    <>
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
      {open && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-[1000] border border-gray-300 overflow-hidden">
          <div className="bg-[#6B2737] text-[#F5F0E1] p-4 font-playfair text-xl text-center flex justify-between items-center">
            <span>Ask the Somm</span>
            <button onClick={() => setOpen(false)} className="text-[#F5F0E1] hover:text-white" aria-label="Close chat">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {showGreeting && (
              <div className="flex justify-start">
                <div className="max-w-xs px-4 py-2 rounded-lg bg-gray-200 text-gray-800">
                  Howdy! I'm your Valley Somm — the AI guide to Yadkin Valley wines. Ask me about wineries, trails, pairings, events, or recommendations!
                </div>
              </div>
            )}
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-4 py-2 rounded-lg ${m.role === 'user' ? 'bg-[#6B2737] text-[#F5F0E1]' : 'bg-gray-200 text-gray-800'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {streamingContent && (
              <div className="flex justify-start">
                <div className="max-w-xs px-4 py-2 rounded-lg bg-gray-200 text-gray-800">
                  {streamingContent}
                </div>
              </div>
            )}
            {isLoading && <div className="text-center text-gray-500 text-sm">Thinking...</div>}
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