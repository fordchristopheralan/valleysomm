"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Wine,
  Send,
  RotateCcw,
  MapPin,
  Star,
  DollarSign,
  Plus,
  Check,
  Loader2,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  wineries?: WineryCard[];
}

interface WineryCard {
  id: string;
  name: string;
  slug: string;
  description: string;
  address_city: string;
  tasting_fee: string | null;
  google_rating: number | null;
  quality_score: number;
  wine_styles: string[];
  amenities: string[];
  vibe: string[];
}

const SUGGESTED_PROMPTS = [
  "We're celebrating our anniversary and love dry reds. Something romantic?",
  "Planning a girls' weekend — fun vibes and Instagram-worthy spots!",
  "I'm new to wine and want somewhere beginner-friendly.",
  "We love Cab Franc and want the serious wine spots.",
  "Family trip with teens — where should we go?",
  "Build me a Saturday itinerary starting from Charlotte.",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hey there! 👋 I'm Valley Somm, your personal guide to Yadkin Valley wine country.

I know every winery in the region — the hidden gems, the best Cab Francs, where to catch a sunset with a glass in hand, and which spots are perfect for your specific vibe.

**Tell me about your trip:**
- Who's coming with you?
- What kind of wines do you love (or want to explore)?  
- Any must-haves like good food, scenic views, or a chill atmosphere?

Or just tell me what you're celebrating and I'll take it from there! 🍷`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedWineries, setSelectedWineries] = useState<WineryCard[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize session
  useEffect(() => {
    const initSession = async () => {
      try {
        const res = await fetch("/api/sessions", { method: "POST" });
        const data = await res.json();
        setSessionId(data.sessionId);
      } catch (error) {
        console.error("Failed to create session:", error);
      }
    };
    initSession();
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          sessionId,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      // Find mentioned wineries to show as cards
      const mentionedWineries = data.wineries || [];

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message,
          wineries: mentionedWineries.slice(0, 4),
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Hmm, I had a bit of trouble there. Could you try again?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestion = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const toggleWinery = (winery: WineryCard) => {
    setSelectedWineries((prev) => {
      const exists = prev.find((w) => w.id === winery.id);
      if (exists) {
        return prev.filter((w) => w.id !== winery.id);
      }
      return [...prev, winery];
    });
  };

  const resetChat = () => {
    setMessages([
      {
        role: "assistant",
        content: `Welcome back! 👋 Ready to plan another wine adventure?

What are you looking for this time?`,
      },
    ]);
    setSelectedWineries([]);
  };

  const createItinerary = async () => {
    if (selectedWineries.length === 0) return;

    try {
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          wineryIds: selectedWineries.map((w) => w.id),
        }),
      });

      const data = await res.json();
      if (data.shareToken) {
        window.location.href = `/itinerary/${data.shareToken}`;
      }
    } catch (error) {
      console.error("Failed to create itinerary:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-purple-50/30 to-amber-50/30 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-wine via-burgundy to-burgundy-600 text-white shadow-lg flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Wine className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Valley Somm</h1>
              <p className="text-xs text-white/70">AI Wine Trip Planner</p>
            </div>
          </Link>
          <button
            onClick={resetChat}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Start new conversation"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 animate-fade-in-up ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === "user"
                    ? "bg-stone-700"
                    : "bg-gradient-to-br from-burgundy to-wine"
                }`}
              >
                {message.role === "user" ? (
                  <span className="text-white text-sm font-medium">You</span>
                ) : (
                  <Wine className="w-5 h-5 text-white" />
                )}
              </div>

              {/* Message Content */}
              <div className={`max-w-[85%] ${message.role === "user" ? "text-right" : ""}`}>
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-stone-700 text-white rounded-tr-md"
                      : "bg-white shadow-sm border border-stone-200 rounded-tl-md"
                  }`}
                >
                  <div className="prose prose-sm max-w-none prose-stone whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>

                {/* Winery Cards */}
                {message.wineries && message.wineries.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {message.wineries.map((winery) => (
                      <div
                        key={winery.id}
                        className="bg-white rounded-xl shadow-md border border-stone-200 overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="h-24 bg-gradient-to-br from-burgundy via-wine to-amber-900 flex items-center justify-center">
                          <Wine className="w-10 h-10 text-white/80" />
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-bold text-stone-900 leading-tight">
                              {winery.name}
                            </h4>
                            {winery.google_rating && (
                              <div className="flex items-center gap-1 text-amber-600 ml-2">
                                <Star className="w-3 h-3 fill-current" />
                                <span className="text-xs font-medium">
                                  {winery.google_rating}
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-stone-500 mb-2 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {winery.address_city}
                            {winery.tasting_fee && (
                              <>
                                <span className="mx-1">•</span>
                                <DollarSign className="w-3 h-3" />
                                {winery.tasting_fee}
                              </>
                            )}
                          </p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {winery.vibe?.slice(0, 2).map((v) => (
                              <span
                                key={v}
                                className="px-2 py-0.5 bg-burgundy/10 text-burgundy rounded-full text-xs"
                              >
                                {v}
                              </span>
                            ))}
                          </div>
                          <button
                            onClick={() => toggleWinery(winery)}
                            className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                              selectedWineries.find((w) => w.id === winery.id)
                                ? "bg-gold text-wine"
                                : "bg-burgundy text-white hover:bg-wine"
                            }`}
                          >
                            {selectedWineries.find((w) => w.id === winery.id) ? (
                              <span className="flex items-center justify-center gap-1">
                                <Check className="w-4 h-4" /> Added
                              </span>
                            ) : (
                              <span className="flex items-center justify-center gap-1">
                                <Plus className="w-4 h-4" /> Add to Trip
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-burgundy to-wine flex items-center justify-center">
                <Wine className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-stone-200">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-burgundy/60 rounded-full loading-dot" />
                  <span className="w-2 h-2 bg-burgundy/60 rounded-full loading-dot" />
                  <span className="w-2 h-2 bg-burgundy/60 rounded-full loading-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions (only at start) */}
        {messages.length === 1 && (
          <div className="px-4 pb-4">
            <p className="text-xs text-stone-500 mb-2 font-medium">
              Try asking:
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestion(prompt)}
                  className="px-3 py-1.5 bg-white hover:bg-burgundy/5 border border-stone-200 rounded-full text-sm text-stone-600 hover:text-burgundy hover:border-burgundy/30 transition-colors"
                >
                  {prompt.slice(0, 45)}
                  {prompt.length > 45 ? "..." : ""}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 bg-white/80 backdrop-blur border-t border-stone-200 flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tell me about your ideal wine trip..."
              className="flex-1 px-4 py-3 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-5 py-3 bg-burgundy text-white rounded-xl font-medium hover:bg-wine disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>

      {/* Floating Itinerary Button */}
      {selectedWineries.length > 0 && (
        <button
          onClick={createItinerary}
          className="fixed bottom-24 right-4 md:bottom-8 md:right-8 bg-gold text-wine px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <MapPin className="w-5 h-5" />
          View Itinerary ({selectedWineries.length})
        </button>
      )}
    </div>
  );
}
