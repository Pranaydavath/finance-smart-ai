"use client";
import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot } from "lucide-react";

function ChatBot({ totalBudget, totalIncome, totalSpend }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Initialize greeting once component mounts or values load
  useEffect(() => {
    setMessages([
      {
        role: "model",
        text: `Hello! 👋 I am your proactive financial assistant. I see you have $${totalIncome} in income and have spent $${totalSpend} so far. How can I help you manage your dashboard metrics today?`,
      },
    ]);
  }, [totalIncome, totalSpend]);

  // Auto-scrolls the chat window to the bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error("Missing Gemini Token Configuration");

      // Map conversation history into Gemini's format
      const historyPayload = messages.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      }));

      // Injects live database telemetry context dynamically
      const systemContextPrompt = `
        [SYSTEM CONTEXT: You are an elite, highly conversational personal finance manager assistant. 
        The user's current live dashboard telemetry records: Total Budget: $${totalBudget} USD, Total Income: $${totalIncome} USD, Total Expenses Logged: $${totalSpend} USD.
        Keep answers short, sharp, friendly, and directly centered around optimizing their spending strategy.]
      `;

      historyPayload.push({
        role: "user",
        parts: [{ text: `${systemContextPrompt}\nUser Query: ${userMessage}` }],
      });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: historyPayload }),
        }
      );

      const data = await response.json();
      const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiResponse) throw new Error("Invalid structure returned");

      setMessages((prev) => [...prev, { role: "model", text: aiResponse }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "Apologies, I hit a minor data sync delay. Could you try submitting that statement again?" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* 🔘 FLOATING TOGGLE TRIGGER BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 flex items-center justify-center"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {/* 💬 MAIN CHATBOX COMPONENT INTERFACE CONTAINER */}
      {isOpen && (
        <div className="bg-white w-[360px] h-[480px] rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header Panel */}
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-200" />
              <div>
                <h3 className="font-bold text-sm tracking-wide">Financial Assistant</h3>
                <p className="text-xs text-blue-200">Live AI Chatbot Active</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-blue-200 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Interactive Messages Display Board */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-sm shadow-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-slate-800 border border-slate-100 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            
            {/* Loading Typing Animation */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none p-3 shadow-sm flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Message Input Form Field */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your metrics..."
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-800"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white p-2 rounded-xl transition-colors flex items-center justify-center"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}

export default ChatBot;