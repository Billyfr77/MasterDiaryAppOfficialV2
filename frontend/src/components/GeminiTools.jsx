import React, { useState } from 'react';
import { api } from '../utils/api';
import { MessageSquare, FileText, Scissors, Send, Loader, Copy, Check, Sparkles, Cloud } from 'lucide-react';

const GeminiTools = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [loading, setLoading] = useState(false);
  
  // Chat State
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: 'Hello! I am your AI business assistant. I can help you search your data, analyze profits, or manage projects. What do you need?' }
  ]);

  // Generate State
  const [genPrompt, setGenPrompt] = useState('');
  const [genType, setGenType] = useState('email');
  const [generatedContent, setGeneratedContent] = useState('');

  // Summarize State
  const [sumText, setSumText] = useState('');
  const [summary, setSummary] = useState('');

  // Cloud Assist State
  const [cloudAssistMessage, setCloudAssistMessage] = useState('');
  const [cloudAssistResponse, setCloudAssistResponse] = useState('');

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = { role: 'user', content: chatMessage };
    setChatHistory(prev => [...prev, userMsg]);
    setChatMessage('');
    setLoading(true);

    try {
      // Pass context (history) to the backend
      const response = await api.post('/ai/chat', {
        message: userMsg.content,
        context: chatHistory
      });

      const aiMsg = { role: 'assistant', content: response.data.reply };
      setChatHistory(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Chat Error:', error);
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error processing your request.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!genPrompt.trim()) return;
    setLoading(true);
    setGeneratedContent('');

    try {
      const response = await api.post('/ai/generate', {
        prompt: genPrompt,
        type: genType
      });
      setGeneratedContent(response.data.result);
    } catch (error) {
      console.error('Generation Error:', error);
      setGeneratedContent('Error generating content.');
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!sumText.trim()) return;
    setLoading(true);
    setSummary('');

    try {
      const response = await api.post('/ai/summarize', {
        text: sumText
      });
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Summarization Error:', error);
      setSummary('Error summarizing text.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloudAssist = async () => {
    if (!cloudAssistMessage.trim()) return;
    setLoading(true);
    setCloudAssistResponse('');

    try {
      const response = await api.post('/ai/cloud-assist', {
        message: cloudAssistMessage
      });
      setCloudAssistResponse(response.data.insight);
    } catch (error) {
      console.error('Cloud Assist Error:', error);
      setCloudAssistResponse('Error getting cloud assist insight.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-stone-900/60 border border-white/10 rounded-3xl p-6 h-full flex flex-col overflow-hidden shadow-xl backdrop-blur-md">
      <div className="mb-6 border-b border-white/10 pb-4">
        <h3 className="m-0 mb-4 text-white text-xl font-bold flex items-center gap-3">
          <span className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
            <Sparkles size={24} />
          </span>
          Gemini Business AI
        </h3>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`
              px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all
              ${activeTab === 'chat' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'bg-black/20 text-gray-400 hover:bg-black/40 hover:text-white'}
            `}
          >
            <MessageSquare size={16} /> Intelligent Search
          </button>
          <button 
            onClick={() => setActiveTab('generate')}
            className={`
              px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all
              ${activeTab === 'generate' 
                 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                 : 'bg-black/20 text-gray-400 hover:bg-black/40 hover:text-white'}
            `}
          >
            <FileText size={16} /> Generate Content
          </button>
          <button 
            onClick={() => setActiveTab('summarize')}
            className={`
              px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all
              ${activeTab === 'summarize' 
                 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                 : 'bg-black/20 text-gray-400 hover:bg-black/40 hover:text-white'}
            `}
          >
            <Scissors size={16} /> Summarize
          </button>
          <button 
            onClick={() => setActiveTab('cloud-assist')}
            className={`
              px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all
              ${activeTab === 'cloud-assist' 
                 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                 : 'bg-black/20 text-gray-400 hover:bg-black/40 hover:text-white'}
            `}
          >
            <Cloud size={16} /> Cloud Assist
          </button>
        </div>
      </div>

      {/* CHAT TAB */}
      {activeTab === 'chat' && (
        <div className="flex flex-col h-[500px]">
          <div className="flex-1 overflow-y-auto p-4 bg-black/20 rounded-xl border border-white/5 mb-4 space-y-4">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`
                    max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed
                    ${msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-stone-800 text-gray-200 border border-white/10 rounded-tl-none'}
                  `}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-stone-800 px-4 py-3 rounded-2xl rounded-tl-none border border-white/10 flex items-center gap-3 text-gray-400 text-sm">
                  <Loader size={16} className="animate-spin" /> Thinking...
                </div>
              </div>
            )}
          </div>
          <form onSubmit={handleChat} className="flex gap-3">
            <input 
              type="text" 
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask about projects, profits, or staff..."
              className="flex-1 bg-black/20 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors"
            />
            <button 
              type="submit" 
              disabled={loading} 
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      )}

      {/* GENERATE TAB */}
      {activeTab === 'generate' && (
        <div className="flex flex-col gap-4 h-full overflow-y-auto">
          <div className="flex gap-4">
            <select 
              value={genType} 
              onChange={(e) => setGenType(e.target.value)}
              className="bg-black/20 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="email">Professional Email</option>
              <option value="quote_description">Quote Description</option>
              <option value="other">Other</option>
            </select>
          </div>
          <textarea
            value={genPrompt}
            onChange={(e) => setGenPrompt(e.target.value)}
            placeholder={genType === 'email' ? "Enter context for the email (e.g. 'Apologize for delay to Client John due to rain')..." : "Enter details for the quote..."}
            className="w-full h-32 bg-black/20 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors resize-none"
          />
          <button 
            onClick={handleGenerate} 
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader size={20} className="animate-spin" /> : <FileText size={20} />} 
            Generate Content
          </button>
          
          {generatedContent && (
            <div className="mt-4 animate-fade-in">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Result</label>
                <button onClick={() => copyToClipboard(generatedContent)} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1">
                  <Copy size={14} /> Copy
                </button>
              </div>
              <div className="bg-black/20 border border-white/10 rounded-xl p-4 text-gray-200 whitespace-pre-wrap max-h-[300px] overflow-y-auto text-sm leading-relaxed">
                {generatedContent}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUMMARIZE TAB */}
      {activeTab === 'summarize' && (
        <div className="flex flex-col gap-4 h-full overflow-y-auto">
          <textarea
            value={sumText}
            onChange={(e) => setSumText(e.target.value)}
            placeholder="Paste text to summarize (meeting notes, emails, long descriptions)..."
            className="w-full h-48 bg-black/20 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors resize-none"
          />
          <button 
            onClick={handleSummarize} 
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader size={20} className="animate-spin" /> : <Scissors size={20} />} 
            Summarize Text
          </button>
          
          {summary && (
            <div className="mt-4 animate-fade-in">
               <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Summary</label>
                <button onClick={() => copyToClipboard(summary)} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1">
                  <Copy size={14} /> Copy
                </button>
              </div>
              <div className="bg-black/20 border border-white/10 rounded-xl p-4 text-gray-200 whitespace-pre-wrap text-sm leading-relaxed">
                {summary}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CLOUD ASSIST TAB */}
      {activeTab === 'cloud-assist' && (
        <div className="flex flex-col gap-4 h-full overflow-y-auto">
          <textarea
            value={cloudAssistMessage}
            onChange={(e) => setCloudAssistMessage(e.target.value)}
            placeholder="Ask for insights on cloud costs, performance, or deployment strategies..."
            className="w-full h-48 bg-black/20 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors resize-none"
          />
          <button 
            onClick={handleCloudAssist} 
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader size={20} className="animate-spin" /> : <Cloud size={20} />} 
            Get Cloud Insight
          </button>
          
          {cloudAssistResponse && (
            <div className="mt-4 animate-fade-in">
               <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Insight</label>
                <button onClick={() => copyToClipboard(cloudAssistResponse)} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1">
                  <Copy size={14} /> Copy
                </button>
              </div>
              <div className="bg-black/20 border border-white/10 rounded-xl p-4 text-gray-200 whitespace-pre-wrap text-sm leading-relaxed">
                {cloudAssistResponse}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GeminiTools;
