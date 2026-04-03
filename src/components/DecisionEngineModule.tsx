import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  X, 
  Mic, 
  Loader2, 
  ArrowRight, 
  PieChart, 
  Target, 
  Zap,
  IndianRupee
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { databaseService, Bill } from '../services/databaseService';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'analysis' | 'simulation' | 'alert';
  data?: any;
}

interface DecisionEngineModuleProps {
  onClose: () => void;
}

const EXAMPLE_PROMPTS = [
  "How much did I spend on food last month?",
  "Can I afford to buy a new phone for ₹25,000?",
  "What are my top 3 spending categories?",
  "How can I save ₹5,000 more every month?",
  "Simulate spending ₹50,000 on a vacation."
];

export default function DecisionEngineModule({ onClose }: DecisionEngineModuleProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI Financial Advisor. I can help you analyze your spending, simulate financial decisions, and provide personalized advice. How can I assist you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const bills = await databaseService.getBills();
      
      const prompt = `
        You are an AI Financial Advisor for "Money Map". 
        User's transaction history: ${JSON.stringify(bills.slice(0, 20))}
        User's question: "${text}"

        If the user wants to simulate a decision (e.g., "If I spend X on Y"), provide a simulation response.
        Otherwise, provide a general financial analysis or advice.

        Respond in JSON format with:
        - content: string (the main response text)
        - type: "analysis" | "simulation" | "alert"
        - data: object (optional, for simulation include: impact (low/medium/high), color (green/yellow/red), savingsImpact (number), goalDelay (string), budgetDeviation (string))
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || '{}');
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.content || "I'm sorry, I couldn't process that request.",
        type: result.type,
        data: result.data
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error("AI Error:", err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting to my brain right now. Please try again later."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed inset-y-0 right-0 z-[100] w-full max-w-2xl bg-background shadow-2xl flex flex-col border-l border-border/50"
    >
      {/* Header */}
      <div className="p-6 border-b border-border/50 flex items-center justify-between bg-primary/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Smart Decision Engine</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              AI Financial Advisor Online
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex flex-col max-w-[85%]",
                msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div className={cn(
                "p-4 rounded-2xl shadow-sm",
                msg.role === 'user' 
                  ? "bg-primary text-white rounded-tr-none" 
                  : "bg-muted/50 border border-border/50 rounded-tl-none"
              )}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>

              {msg.type === 'simulation' && msg.data && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={cn(
                    "mt-3 w-full p-5 rounded-2xl border flex flex-col gap-4",
                    msg.data.color === 'red' ? "bg-red-500/5 border-red-500/20" :
                    msg.data.color === 'yellow' ? "bg-amber-500/5 border-amber-500/20" :
                    "bg-emerald-500/5 border-emerald-500/20"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm uppercase tracking-wider">Decision Simulation</h4>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase",
                      msg.data.color === 'red' ? "bg-red-500 text-white" :
                      msg.data.color === 'yellow' ? "bg-amber-500 text-white" :
                      "bg-emerald-500 text-white"
                    )}>
                      {msg.data.impact} Impact
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-background/50 border border-border/50">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Savings</p>
                      <p className="text-sm font-bold flex items-center gap-1">
                        <TrendingDown className="w-3 h-3 text-red-500" />
                        ₹{msg.data.savingsImpact?.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-background/50 border border-border/50">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Goal Delay</p>
                      <p className="text-sm font-bold flex items-center gap-1">
                        <Target className="w-3 h-3 text-amber-500" />
                        {msg.data.goalDelay}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-background/50 border border-border/50">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Budget</p>
                      <p className="text-sm font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3 text-primary" />
                        {msg.data.budgetDeviation}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {msg.type === 'analysis' && (
                <div className="mt-3 flex gap-2">
                  <div className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase flex items-center gap-1">
                    <PieChart className="w-3 h-3" /> Spending Pattern
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-500 text-[10px] font-bold uppercase flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Optimization
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
            <p className="text-xs font-medium animate-pulse italic">AI is thinking...</p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 border-t border-border/50 bg-muted/10">
        {messages.length === 1 && (
          <div className="mb-6">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map(p => (
                <button 
                  key={p}
                  onClick={() => handleSend(p)}
                  className="px-4 py-2 rounded-xl bg-background border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-xs font-medium text-muted-foreground hover:text-primary"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="relative">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="Ask anything about your finances..."
            className="w-full pl-6 pr-24 py-4 rounded-2xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-xl shadow-primary/5 transition-all"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground">
              <Mic className="w-5 h-5" />
            </button>
            <button 
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isLoading}
              className="p-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
        <p className="text-[10px] text-center text-muted-foreground mt-4">
          AI can make mistakes. Always verify important financial decisions.
        </p>
      </div>
    </motion.div>
  );
}
