"use client";
import { useState, useRef, useEffect } from "react";
import { XMarkIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your MovieKnight assistant. How can I help you find the perfect movie today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMessageText = inputValue.trim();
    const userMessage = {
      id: messages.length + 1,
      text: userMessageText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Prepare conversation history (excluding the welcome message)
      const conversationHistory = messages
        .filter((msg) => msg.id !== 1) // Exclude welcome message
        .map((msg) => ({
          sender: msg.sender,
          text: msg.text,
        }));

      // Call the API route
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessageText,
          conversationHistory: conversationHistory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const botResponse = {
        id: messages.length + 2,
        text: data.response || "I'm sorry, I couldn't generate a response. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Chat error:", error);
      
      // Fallback response if API fails
      const botResponse = {
        id: messages.length + 2,
        text: error.message.includes("API key") 
          ? "The AI assistant is not configured. Please add your Hugging Face API key to enable AI responses."
          : "I'm having trouble connecting right now. Please try again in a moment.",
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickQuestions = [
    "How do I search for movies?",
    "What genres are available?",
    "How do recommendations work?",
  ];

  const handleQuickQuestion = async (question) => {
    if (isTyping) return;

    const userMessage = {
      id: messages.length + 1,
      text: question,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Prepare conversation history
      const conversationHistory = messages
        .filter((msg) => msg.id !== 1)
        .map((msg) => ({
          sender: msg.sender,
          text: msg.text,
        }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: question,
          conversationHistory: conversationHistory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const botResponse = {
        id: messages.length + 2,
        text: data.response || "I'm sorry, I couldn't generate a response. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Chat error:", error);
      
      const botResponse = {
        id: messages.length + 2,
        text: error.message.includes("API key")
          ? "The AI assistant is not configured. Please add your Hugging Face API key to enable AI responses."
          : "I'm having trouble connecting right now. Please try again in a moment.",
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  // Format text with markdown-like support
  const formatMessage = (text) => {
    if (!text) return null;
    
    // Split by newlines and format
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Skip empty lines or render as spacing
      if (!line.trim()) {
        return <br key={index} />;
      }
      
      // Escape HTML first to prevent XSS
      let formatted = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      
      // Bold text **text**
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-cyan-300">$1</strong>');
      // Code `code`
      formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-cyan-950/50 text-cyan-400 px-1.5 py-0.5 rounded font-mono text-xs">$1</code>');
      // Bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        formatted = `<span class="text-cyan-400 mr-2">•</span>${formatted.replace(/^[-•]\s*/, '')}`;
      }
      // Numbered lists
      if (/^\d+\.\s/.test(line.trim())) {
        const match = line.trim().match(/^(\d+)\.\s(.*)/);
        if (match) {
          formatted = `<span class="text-cyan-400 mr-2 font-mono">${match[1]}.</span>${match[2]}`;
        }
      }
      
      return <p key={index} dangerouslySetInnerHTML={{ __html: formatted }} className="leading-relaxed" />;
    });
  };

  return (
    <>
      {/* Chat Button - JARVIS Style */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[9999] w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-neutral-950 overflow-hidden group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open JARVIS"
      >
        {/* Glowing effect */}
        <div className="absolute inset-0 bg-cyan-400/30 rounded-full blur-xl group-hover:bg-cyan-400/50 transition-all" />
        
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative z-10"
            >
              <XMarkIcon className="w-6 h-6 sm:w-7 sm:h-7" />
            </motion.div>
          ) : (
            <motion.div
              key="jarvis"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 w-full h-full flex items-center justify-center"
            >
              <Image
                src="/ailogo.jpeg"
                alt="AI Assistant Logo"
                width={28}
                height={28}
                className="w-6 h-6 sm:w-7 sm:h-7 object-contain rounded-full"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Chat Window - Centered JARVIS Style */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-4xl h-[85vh] max-h-[800px] glass-dark glossy-shine rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-cyan-500/20 pointer-events-auto relative">
              {/* JARVIS Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-600/5 pointer-events-none" />
              
              {/* Animated Grid Background */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                backgroundImage: `
                  linear-gradient(cyan 1px, transparent 1px),
                  linear-gradient(90deg, cyan 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
                animation: 'gridMove 20s linear infinite'
              }} />

              {/* Header - JARVIS Style */}
              <div className="relative bg-gradient-to-r from-cyan-500/20 via-blue-600/20 to-cyan-500/20 border-b border-cyan-500/30 p-5 flex items-center justify-between backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  {/* JARVIS Logo/Icon */}
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/50 relative overflow-hidden">
                      {/* Pulsing ring */}
                      <div className="absolute inset-0 rounded-full border-2 border-cyan-400/50 animate-ping" />
                      <div className="absolute inset-0 rounded-full border border-cyan-300/30" />
                      
                      {/* AI Logo */}
                      <div className="relative z-10 w-full h-full flex items-center justify-center">
                        <Image
                          src="/ailogo.jpeg"
                          alt="AI Assistant Logo"
                          width={28}
                          height={28}
                          className="w-7 h-7 object-contain rounded-full"
                        />
                      </div>
                    </div>
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-cyan-400/30 rounded-full blur-xl -z-10 animate-pulse" />
                  </div>
                  
                  <div>
                    <h3 className="text-white font-bold text-xl tracking-wide flex items-center gap-2">
                      <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        J.A.R.V.I.S.
                      </span>
                      <span className="text-cyan-400 text-sm font-normal">AI Assistant</span>
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                      <p className="text-xs text-cyan-300/80 font-mono">System Online</p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                  aria-label="Close"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-10 custom-scrollbar">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} group`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-5 py-3 relative ${
                        message.sender === "user"
                          ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                          : "bg-gradient-to-br from-neutral-800/90 to-neutral-900/90 text-gray-100 border border-cyan-500/20 shadow-lg backdrop-blur-sm"
                      }`}
                    >
                      {/* Message content with formatting */}
                      <div className="text-sm leading-relaxed space-y-1">
                        {formatMessage(message.text)}
                      </div>
                      
                      {/* Timestamp */}
                      <p className={`text-xs mt-2 ${
                        message.sender === "user" ? "text-cyan-100/70" : "text-cyan-400/60"
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      
                      {/* Corner accent */}
                      {message.sender === "bot" && (
                        <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-bl-2xl" />
                      )}
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gradient-to-br from-neutral-800/90 to-neutral-900/90 text-gray-100 border border-cyan-500/20 rounded-2xl px-5 py-3 shadow-lg backdrop-blur-sm">
                      <div className="flex gap-1.5 items-center">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce shadow-lg shadow-cyan-400/50" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce shadow-lg shadow-cyan-400/50" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce shadow-lg shadow-cyan-400/50" style={{ animationDelay: "300ms" }} />
                        <span className="ml-2 text-xs text-cyan-400/70 font-mono">Processing...</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions */}
              {messages.length === 1 && (
                <div className="px-6 pb-4 space-y-3 relative z-10">
                  <p className="text-xs text-cyan-400/70 font-mono uppercase tracking-wider">Quick Actions</p>
                  <div className="flex flex-wrap gap-2">
                    {quickQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickQuestion(question)}
                        className="text-xs px-4 py-2 bg-neutral-800/50 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-400/50 rounded-full text-cyan-300 hover:text-cyan-200 transition-all duration-200 backdrop-blur-sm"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input - JARVIS Style */}
              <form onSubmit={handleSendMessage} className="p-5 border-t border-cyan-500/20 bg-gradient-to-t from-neutral-900/95 to-neutral-900/50 backdrop-blur-sm relative z-10">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask J.A.R.V.I.S. anything..."
                      className="w-full px-5 py-3.5 bg-neutral-800/80 border border-cyan-500/30 rounded-xl text-white placeholder-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400/50 text-sm transition-all backdrop-blur-sm"
                      disabled={isTyping}
                    />
                    {/* Input glow effect */}
                    <div className="absolute inset-0 rounded-xl bg-cyan-500/10 opacity-0 focus-within:opacity-100 transition-opacity pointer-events-none blur-xl" />
                  </div>
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isTyping}
                    className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-neutral-800 disabled:to-neutral-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <PaperAirplaneIcon className="w-5 h-5 relative z-10" />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(6, 182, 212, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #06b6d4, #3b82f6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #22d3ee, #60a5fa);
        }
      `}</style>
    </>
  );
}

