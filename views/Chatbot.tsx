import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { KNOWLEDGE_BASE_SEED } from '../data/knowledge_base_seed';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatbotProps {
  userId: string;
  userName: string;
}

/**
 * ButterflyAvatar — Bot avatar for chat messages
 */
const ButterflyAvatar = () => (
  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#B19CD9] to-[#7B68A6] flex items-center justify-center flex-shrink-0 shadow-md">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V8"/><path d="M5 12c-1.5-1.5-2.5-3.5-2-6 2.5-.5 4.5.5 6 2 1.5-1.5 3.5-2.5 6-2 .5 2.5-.5 4.5-2 6"/><path d="M5 20c-1.5-1.5-2.5-3.5-2-6 2.5-.5 4.5.5 6 2 1.5-1.5 3.5-2.5 6-2 .5 2.5-.5 4.5-2 6"/>
    </svg>
  </div>
);

/**
 * Smart keyword-based RAG search — finds the most relevant knowledge entries
 * by matching keywords from the user's question.
 */
const searchKnowledge = (query: string): string[] => {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const scored = KNOWLEDGE_BASE_SEED.map(entry => {
    const contentLower = entry.content.toLowerCase();
    const tagString = entry.metadata.tags.join(' ').toLowerCase();
    let score = 0;

    for (const word of queryWords) {
      if (contentLower.includes(word)) score += 2;
      if (tagString.includes(word)) score += 3;
    }

    // Boost by category
    if (query.toLowerCase().includes('budget') && entry.metadata.category === 'financial') score += 2;
    if (query.toLowerCase().includes('morning') && entry.metadata.tags.includes('morning-reset')) score += 3;
    if (query.toLowerCase().includes('save') && entry.metadata.tags.includes('savings')) score += 3;
    if (query.toLowerCase().includes('debt') && entry.metadata.tags.includes('debt')) score += 3;
    if (query.toLowerCase().includes('goal') && entry.metadata.category === 'goal-setting') score += 2;
    if (query.toLowerCase().includes('affirm') && entry.metadata.category === 'affirmations') score += 3;
    if (query.toLowerCase().includes('planner') && entry.metadata.category === 'app-features') score += 2;
    if (query.toLowerCase().includes('water') && entry.metadata.tags.includes('hydration')) score += 3;
    if (query.toLowerCase().includes('wellness') && entry.metadata.category === 'wellness') score += 2;
    if (query.toLowerCase().includes('credit') && entry.metadata.tags.includes('credit-score')) score += 3;

    return { content: entry.content, score };
  })
  .filter(e => e.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 3);

  return scored.map(e => e.content);
};

/**
 * Generate a helpful response based on RAG context
 */
const generateResponse = (query: string, context: string[], userName: string): string => {
  if (context.length === 0) {
    // General helpful responses for common topics
    const lowerQ = query.toLowerCase();
    if (lowerQ.includes('hello') || lowerQ.includes('hi') || lowerQ.includes('hey')) {
      return `Hi ${userName}! I'm Lavender, your financial wellness assistant. I can help with budgeting tips, debt strategies, savings advice, using the planner features, wellness guidance, and goal setting. What would you like to know?`;
    }
    if (lowerQ.includes('help') || lowerQ.includes('what can you')) {
      return `I can help you with:\n\n• **Budgeting** — The 50/30/20 rule, meal planning, subscription audits\n• **Debt** — Snowball vs avalanche methods, payoff strategies\n• **Savings** — Emergency funds, investing basics\n• **App Features** — How to use Morning Reset, Planner, Financial Hub\n• **Wellness** — Hydration, morning routines, journaling, sleep\n• **Goals** — SMART goals, financial priority ordering\n• **Affirmations** — Money mindset, overcoming shame\n\nJust ask me anything!`;
    }
    return `That's a great question, ${userName}! While I don't have a specific answer for that right now, I recommend checking out the Financial Hub for budgeting tools, or the Morning Reset for daily intention setting. Feel free to ask me about budgeting, debt payoff, savings, planner features, or wellness tips!`;
  }

  // Format the best matching content as a conversational response
  let response = context[0];

  if (context.length > 1) {
    response += `\n\n**Additionally:** ${context[1].substring(0, 200)}...`;
  }

  return response;
};

const Chatbot: React.FC<ChatbotProps> = ({ userId, userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hi ${userName}! I'm Lavender, your financial wellness assistant. Ask me about budgeting, saving, debt payoff, using the planner, or wellness tips!`,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // Load chat history from Supabase
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const { data } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: true })
          .limit(50);

        if (data && data.length > 0) {
          const historyMessages: ChatMessage[] = data.map(m => ({
            id: m.id,
            role: m.role as 'user' | 'assistant',
            content: m.content,
            timestamp: new Date(m.created_at),
          }));
          setMessages(prev => [prev[0], ...historyMessages]);
        }
      } catch {
        // chat_messages table may not exist yet
      }
    };
    loadHistory();
  }, [userId]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const query = input.trim();
    setInput('');
    setIsTyping(true);

    // Store user message
    try {
      await supabase.from('chat_messages').insert({
        user_id: userId,
        role: 'user',
        content: query,
      });
    } catch {}

    // RAG pipeline: search knowledge base → generate response
    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 800));

    const context = searchKnowledge(query);
    const responseText = generateResponse(query, context, userName);

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: responseText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);

    // Store assistant response
    try {
      await supabase.from('chat_messages').insert({
        user_id: userId,
        role: 'assistant',
        content: responseText,
      });
    } catch {}
  };

  const clearChat = async () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `Hi ${userName}! I'm Lavender, your financial wellness assistant. Ask me about budgeting, saving, debt payoff, using the planner, or wellness tips!`,
      timestamp: new Date(),
    }]);
    try {
      await supabase.from('chat_messages').delete().eq('user_id', userId);
    } catch {}
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 lg:bottom-8 right-6 z-[90] w-14 h-14 bg-gradient-to-br from-[#B19CD9] to-[#7B68A6] text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all flex items-center justify-center"
        >
          <MessageCircle size={24} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D4AF37] rounded-full flex items-center justify-center">
            <Sparkles size={10} className="text-white" />
          </span>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 lg:bottom-8 right-4 lg:right-6 z-[90] w-[360px] max-w-[calc(100vw-2rem)] h-[520px] bg-white rounded-3xl shadow-2xl border border-[#E6D5F0] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#7B68A6] to-[#B19CD9] px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ButterflyAvatar />
              <div>
                <h3 className="text-white font-bold text-sm">Lavender AI</h3>
                <p className="text-white/60 text-[10px]">Financial Wellness Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={clearChat} className="p-1.5 hover:bg-white/10 rounded-full transition-all" title="Clear chat">
                <Trash2 size={16} className="text-white/60" />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-full transition-all">
                <X size={18} className="text-white" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#F8F7FC]">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {msg.role === 'assistant' && <ButterflyAvatar />}
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#B19CD9] text-white rounded-br-md'
                    : 'bg-white text-gray-700 border border-[#E6D5F0] rounded-bl-md shadow-sm'
                }`}>
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i} className={i > 0 ? 'mt-2' : ''}>
                      {line.split('**').map((part, j) =>
                        j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part}</span>
                      )}
                    </p>
                  ))}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2">
                <ButterflyAvatar />
                <div className="bg-white border border-[#E6D5F0] rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-[#B19CD9] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-[#B19CD9] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-[#B19CD9] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 bg-white border-t border-[#E6D5F0]">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                className="flex-1 bg-[#F8F7FC] border border-[#E6D5F0] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#B19CD9] placeholder:text-gray-400"
                placeholder="Ask about budgeting, savings..."
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="p-2.5 bg-[#7B68A6] text-white rounded-xl hover:bg-[#B19CD9] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
