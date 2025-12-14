"use client";
import { useState } from 'react';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAssistantMessage, setCurrentAssistantMessage] = useState('');

  const handleSend = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage = userInput.trim();
    setUserInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setCurrentAssistantMessage('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: userMessage }] }),
      });

      if (!response.ok || !response.body) throw new Error('Network error');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantText += chunk;
        setCurrentAssistantMessage(assistantText);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: assistantText }]);
      setCurrentAssistantMessage('');
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Could not get response' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const showGreeting = messages.length === 0 && !currentAssistantMessage;

  return (
    <>
      {/* Floating Button unchanged */}
      {!open && (/* your button code */)}

      {open && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-[1000] border border-gray-300 overflow-hidden">
          {/* Header unchanged */}

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {showGreeting && (
              <div className="flex justify-start">
                <div className="max-w-xs px-4 py-2 rounded-lg bg-gray-200 text-gray-800">
                  Howdy! I'm your Valley Somm — the AI guide to Yadkin Valley wines. Ask me about wineries, trails, pairings, events, or recommendations!
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-4 py-2 rounded-lg ${m.role === 'user' ? 'bg-[#6B2737] text-[#F5F0E1]' : 'bg-gray-200 text-gray-800'}`}>
                  {m.content}
                </div>
              </div>
            ))}

            {currentAssistantMessage && (
              <div className="flex justify-start">
                <div className="max-w-xs px-4 py-2 rounded-lg bg-gray-200 text-gray-800">
                  {currentAssistantMessage}
                </div>
              </div>
            )}

            {isLoading && <div className="text-center text-gray-500 text-sm">Thinking...</div>}
          </div>

          {/* Input/send area unchanged, but onKeyDown/onClick call handleSend */}
        </div>
      )}
    </>
  );
}