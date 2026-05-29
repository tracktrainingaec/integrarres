import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2, Volume2, VolumeX } from 'lucide-react';
import { getAIResponse } from '../utils/ai';
import { GlassCard } from './LayoutComponents';
import { getCurrentUser, getChatHistory, saveChatMessage } from '../utils/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIConsultant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user && user.name) {
      const firstName = user.name.split(' ')[0];
      setUserName(firstName);
      setUserEmail(user.email || '');
      
      // Load history
      const loadHistory = async () => {
        const history = await getChatHistory(user.email || '');
        if (history && history.length > 0) {
          const formattedHistory = history.map((h: any) => ({
            id: h.id,
            role: h.role,
            content: h.content,
            timestamp: new Date(h.created_at)
          }));
          setMessages(formattedHistory);
        } else {
          setMessages([
            {
              id: '1',
              role: 'assistant',
              content: `Olá, ${firstName}! Sou o Consultor Integrar da AeC. Como posso ajudar você hoje?`,
              timestamp: new Date(),
            },
          ]);
        }
      };
      loadHistory();
    } else {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: 'Olá! Sou o Consultor Integrar da AeC. Como posso ajudar você hoje?',
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Save user message to DB
    if (userEmail) {
      saveChatMessage(userEmail, 'user', input).catch(err => console.error(err));
    }

    try {
      // Pass history (excluding current user message for efficiency if needed, but here we pass all)
      const response = await getAIResponse(input, userName, messages);
      
      // Split fragmented messages
      const parts = response.split('|').map(p => p.trim()).filter(p => p);
      
      for (const part of parts) {
        const assistantMessage: Message = {
          id: Math.random().toString(36).substr(2, 9),
          role: 'assistant',
          content: part,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Save assistant message to DB
        if (userEmail) {
          saveChatMessage(userEmail, 'assistant', part).catch(err => console.error(err));
        }

        // Handle Audio (Speech Synthesis for now)
        if (isAudioEnabled) {
          speak(part);
        }
        
        // Wait a bit between messages for "picotado" effect
        if (parts.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }
    } catch (error) {
      console.error('Error in AI Chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.1;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full shadow-2xl flex items-center justify-center text-white border-2 border-white/20 backdrop-blur-sm"
      >
        <MessageCircle size={32} />
        {/* Pulse effect */}
        <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8, x: 50 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 100, scale: 0.8, x: 50 }}
            className="fixed bottom-24 right-6 z-50 w-[92vw] sm:w-[400px] h-[550px] md:h-[600px] flex flex-col"
          >
            {/* Custom Premium Container (Replaces GlassCard for better flex control) */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-white/20 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)]">

              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                    <Bot size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Consultor Integrar</h3>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-[10px] opacity-80">Online</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {isAudioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 scrollbar-premium"
              >
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                        msg.role === 'user' ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-600'
                      }`}>
                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                      </div>
                      <div className={`p-4 rounded-2xl text-[13px] leading-relaxed shadow-md ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-br from-primary to-secondary text-white rounded-tr-none' 
                          : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-2 max-w-[85%]">
                      <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center">
                        <Bot size={16} className="text-slate-400" />
                      </div>
                      <div className="p-4 bg-white border border-slate-100 rounded-2xl rounded-tl-none shadow-sm">
                        <Loader2 size={16} className="animate-spin text-primary" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-slate-100">
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Tire sua dúvida..."
                    className="flex-1 p-3 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                  <button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="p-3 bg-primary text-white rounded-xl shadow-lg hover:bg-primary/90 disabled:opacity-50 transition-all"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
