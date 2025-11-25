import React, { useState } from 'react';
import { Brain, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { api } from '../../utils/api'; // Import API utility

const AIAssistantFAB = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am the MasterDiary AI. How can I help you optimize your projects today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userText = input;
    const userMsg = { role: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Prepare context from previous messages (excluding the last user message we just added)
      const context = messages.slice(-6).map(m => ({ 
        role: m.role === 'ai' ? 'assistant' : 'user', 
        content: m.text 
      }));

      const response = await api.post('/ai/chat', {
        message: userText,
        context: context
      });

      const aiMsg = { 
        role: 'ai', 
        text: response.data.reply 
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      console.error('AI Chat Error Details:', error.response?.data || error.message);
      
      let errorMessage = "I'm having trouble connecting to my brain right now.";
      if (error.response) {
          // Server responded with a status code outside 2xx
          errorMessage += ` (Server Error: ${error.response.status})`;
          if (error.response.status === 404) errorMessage += " - AI Service Not Found";
          if (error.response.status === 500) errorMessage += " - Internal Brain Malfunction";
          if (error.response.status === 401) errorMessage += " - Authentication Failed";
      } else if (error.request) {
          // Request made but no response
          errorMessage += " (Network Error: No response from server. Is the backend running?)";
      } else {
          errorMessage += ` (${error.message})`;
      }

      const errorMsg = { 
        role: 'ai', 
        text: errorMessage
      };
      setMessages(prev => [...prev, errorMsg]);
      // Optional: alert(errorMessage); // Uncomment for aggressive debugging
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-6 right-6 z-[9990] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95
          ${isOpen ? 'bg-rose-500 rotate-45' : 'bg-gradient-to-br from-indigo-600 to-violet-600 animate-pulse-glow'}
        `}
      >
        {isOpen ? <X size={24} className="text-white" /> : <Brain size={24} className="text-white" />}
      </button>

      {/* Chat Interface */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[9990] w-96 h-[500px] bg-stone-900/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up origin-bottom-right">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-white/5 flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">AI Copilot</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs text-gray-400 font-medium">Online</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`
                  max-w-[80%] p-3 rounded-2xl text-sm font-medium
                  ${msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-stone-800 text-gray-200 border border-white/5 rounded-tl-none'}
                `}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-stone-800 p-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-black/20 border-t border-white/5">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything..."
                className="w-full bg-stone-800 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              <button 
                onClick={handleSend}
                className="absolute right-2 top-2 p-1.5 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistantFAB;
