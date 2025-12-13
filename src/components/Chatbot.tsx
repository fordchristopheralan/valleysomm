"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button'; // Optional: we'll add shadcn/ui later if you want
import { MessageCircle, X } from 'lucide-react';
import { useChat } from 'ai/react';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat', // We'll create this next
    initialMessages: [
      { id: '1', role: 'assistant', content: "Howdy! I'm your Valley Somm — the AI guide to Yadkin Valley wines. Ask me about wineries, trails, pairings, events, or recommendations!" }
    ],
  });

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-[#6B2737] text-[#F5F0E1] p-4 rounded-full shadow-2xl hover:bg-[#D4A017] transition z-50"
      >
        {open ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 w-96 h-96 md:h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          <div className="bg-[#6B2737] text-[#F5F0E1] p-4 rounded-t-lg font-playfair text-xl text-center">
            Ask the Somm
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
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-center text-gray-500">Thinking...</div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about wineries, pairings, trails..."
              className="w-full px-4 py-2 border rounded-full focus:outline-none focus:border-[#6B2737]"
            />
          </form>
        </div>
      )}
    </>
  );
}