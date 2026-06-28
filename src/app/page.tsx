"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  ShoppingCart,
  Sparkles,
  RotateCcw,
  ChevronDown,
  MessageCircle,
} from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import CartDrawer from "@/components/CartDrawer";
import ToolResultRenderer from "@/components/ToolResultRenderer";

const WELCOME_SUGGESTIONS = [
  { emoji: "🛒", text: "Show me today's top products" },
  { emoji: "🎂", text: "I need a birthday cake delivered to Colombo" },
  { emoji: "📱", text: "What electronics do you have?" },
  { emoji: "🎁", text: "Help me find a gift under Rs. 5,000" },
  { emoji: "🥑", text: "Show me grocery options" },
  { emoji: "📦", text: "Track my order" },
];

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const cartItems = useCartStore((state) => state.items);
  const cartItemCount = useCartStore((state) => state.getItemCount());
  const toggleCart = useCartStore((state) => state.toggleCart);
  const addItem = useCartStore((state) => state.addItem);
  const checkoutRequested = useCartStore((state) => state.checkoutRequested);
  const clearCheckoutRequest = useCartStore((state) => state.clearCheckoutRequest);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { cart: cartItems },
      }),
    [cartItems]
  );

  const { messages, sendMessage, status, error, regenerate } = useChat({
    transport,
  });

  const [input, setInput] = useState("");
  const isLoading = status === "submitted" || status === "streaming";

  // Handle checkout request from cart
  useEffect(() => {
    if (checkoutRequested && cartItems.length > 0) {
      clearCheckoutRequest();
      const cartDescription = cartItems
        .map((item) => `${item.name} (x${item.quantity})`)
        .join(", ");
      sendMessage({
        text: `I'd like to checkout with these items: ${cartDescription}. Please help me complete the order.`,
      });
      setShowWelcome(false);
    }
  }, [checkoutRequested, cartItems, clearCheckoutRequest, sendMessage]);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isAtBottom, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`;
    }
  }, [input]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setIsAtBottom(scrollHeight - scrollTop - clientHeight < 100);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setShowWelcome(false);
    sendMessage({ text: suggestion });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    setShowWelcome(false);
    sendMessage({ text: input });
    setInput("");
  };

  const handleSendMessage = useCallback(
    (message: string) => {
      setShowWelcome(false);
      sendMessage({ text: message });
    },
    [sendMessage]
  );

  const handleAddToCart = useCallback(
    (product: { id: string; name: string; price: number; image?: string }) => {
      addItem(product);
    },
    [addItem]
  );

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-screen bg-gradient-mesh relative overflow-hidden">
      {/* Ambient background particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="particle absolute w-2 h-2 rounded-full bg-brand/20 top-[20%] left-[10%]" style={{ animationDelay: '0s', animationDuration: '7s' }} />
        <div className="particle absolute w-1.5 h-1.5 rounded-full bg-brand-light/15 top-[60%] left-[80%]" style={{ animationDelay: '2s', animationDuration: '9s' }} />
        <div className="particle absolute w-1 h-1 rounded-full bg-accent/10 top-[40%] left-[50%]" style={{ animationDelay: '4s', animationDuration: '8s' }} />
        <div className="particle absolute w-2.5 h-2.5 rounded-full bg-brand/10 top-[80%] left-[25%]" style={{ animationDelay: '1s', animationDuration: '10s' }} />
        <div className="particle absolute w-1 h-1 rounded-full bg-brand-light/20 top-[15%] left-[70%]" style={{ animationDelay: '3s', animationDuration: '6s' }} />
      </div>

      {/* Header */}
      <header className="flex-shrink-0 border-b border-glass-border bg-bg-primary/80 backdrop-blur-xl z-20">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-brand-light flex items-center justify-center shadow-[0_0_16px_rgba(124,92,191,0.3)]">
                <Sparkles className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-bg-primary status-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-text-primary leading-tight flex items-center gap-1.5">
                Kade
                <span className="text-text-muted font-normal text-xs">
                  කඩේ
                </span>
              </h1>
              <p className="text-[10px] text-text-secondary leading-tight">
                Your Kapruka Shopping Companion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleCart}
              className="relative p-2.5 rounded-xl hover:bg-white/5 transition-all group"
              aria-label="Shopping cart"
              id="cart-button"
            >
              <ShoppingCart className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors" />
              {cartItemCount > 0 && (
                <motion.span
                  key={cartItemCount}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent text-bg-primary text-[10px] font-bold rounded-full flex items-center justify-center badge-bounce"
                >
                  {cartItemCount}
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto z-10 relative"
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Welcome Screen */}
          <AnimatePresence>
            {showWelcome && !hasMessages && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center min-h-[65vh] text-center"
              >
                {/* Hero Icon */}
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.1 }}
                  className="relative mb-8"
                >
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand via-brand-light to-accent/30 flex items-center justify-center pulse-glow">
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>
                  {/* Orbiting dots */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-12px]"
                  >
                    <div className="absolute top-0 left-1/2 w-2 h-2 -translate-x-1/2 rounded-full bg-brand-light/60" />
                    <div className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-accent/40" />
                  </motion.div>
                </motion.div>

                {/* Welcome Text */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl sm:text-5xl font-bold gradient-text mb-3"
                >
                  ආයුබෝවන්! 👋
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg text-text-secondary mb-1"
                >
                  I&apos;m{" "}
                  <span className="text-text-primary font-semibold">
                    Kade
                  </span>{" "}
                  — your Kapruka shopping companion
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm text-text-muted mb-10 max-w-md"
                >
                  Search products, compare prices, check delivery, and checkout
                  — all through chat. I speak English, සිංහල, and Tanglish!
                </motion.p>

                {/* Suggestion Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
                  {WELCOME_SUGGESTIONS.map((suggestion, i) => (
                    <motion.button
                      key={suggestion.text}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45 + i * 0.06 }}
                      onClick={() => handleSuggestionClick(suggestion.text)}
                      className="group/chip glass-card text-left px-4 py-3.5 rounded-xl text-sm text-text-secondary 
                                 hover:text-text-primary hover:border-brand/30 
                                 hover:bg-brand/5 hover:shadow-[0_0_20px_rgba(124,92,191,0.08)]
                                 transition-all duration-300 cursor-pointer flex items-center gap-3"
                      id={`suggestion-${i}`}
                    >
                      <span className="text-lg group-hover/chip:scale-110 transition-transform">{suggestion.emoji}</span>
                      <span>{suggestion.text}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Powered by line */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-[10px] text-text-muted mt-8 flex items-center gap-1.5"
                >
                  <span className="w-1 h-1 rounded-full bg-success" />
                  Connected to Kapruka&apos;s live catalog
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Messages */}
          {messages.map((message, msgIndex) => (
            <div key={message.id} className="mb-5 message-animate">
              {message.role === "user" ? (
                <div className="flex justify-end">
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="max-w-[80%] bg-brand/15 border border-brand/20 rounded-2xl rounded-br-md px-4 py-3"
                  >
                    <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
                      {message.parts?.filter((p) => p.type === "text").map((p) => (p as any).text).join("")}
                    </p>
                  </motion.div>
                </div>
              ) : (
                <div className="flex justify-start">
                  <div className="max-w-[90%] w-full">
                    {/* Avatar */}
                    <div className="flex items-start gap-2.5 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand to-brand-light flex items-center justify-center flex-shrink-0 mt-0.5 shadow-[0_0_10px_rgba(124,92,191,0.2)]">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-text-muted mt-1">
                        Kade
                      </span>
                    </div>

                    <div className="ml-9 space-y-3">
                      {/* Render text parts */}
                      {message.parts?.map((part, partIndex) => {
                        if (part.type === "text" && part.text) {
                          return (
                            <motion.div
                              key={`text-${partIndex}`}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-sm text-text-primary/90 leading-relaxed whitespace-pre-wrap assistant-prose"
                              dangerouslySetInnerHTML={{
                                __html: formatMessageText(part.text),
                              }}
                            />
                          );
                        }
                        if (part.type.startsWith("tool-")) {
                          const toolName = part.type.replace("tool-", "");
                          const state = (part as any).state;
                          return (
                            <ToolResultRenderer
                              key={`tool-${partIndex}`}
                              toolName={toolName}
                              state={state === "output-available" ? "result" : state}
                              args={(part as any).input || {}}
                              result={
                                state === "output-available"
                                  ? (part as any).output
                                  : undefined
                              }
                              onAddToCart={handleAddToCart}
                              onSendMessage={handleSendMessage}
                            />
                          );
                        }
                        return null;
                      })}

                      {/* Quick reply suggestions after last assistant message */}
                      {msgIndex === messages.length - 1 &&
                        message.role === "assistant" &&
                        !isLoading && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex flex-wrap gap-2 mt-3"
                          >
                            {getQuickReplies(message.parts?.filter((p) => p.type === "text").map((p) => (p as any).text).join("") || "").map(
                              (reply, i) => (
                                <button
                                  key={i}
                                  onClick={() => handleSendMessage(reply)}
                                  className="quick-reply-chip"
                                  id={`quick-reply-${msgIndex}-${i}`}
                                >
                                  {reply}
                                </button>
                              )
                            )}
                          </motion.div>
                        )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-2.5 mb-4"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand to-brand-light flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(124,92,191,0.2)]">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="ml-2 flex gap-1.5 items-center py-3 px-4 rounded-xl glass-card">
                <div className="w-2 h-2 bg-brand rounded-full typing-dot" />
                <div className="w-2 h-2 bg-brand rounded-full typing-dot" />
                <div className="w-2 h-2 bg-brand rounded-full typing-dot" />
                <span className="text-xs text-text-muted ml-2">Kade is thinking...</span>
              </div>
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 rounded-2xl glass-card border-danger/20 mb-4"
            >
              <div className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 text-danger" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-danger font-medium">
                  Aiyo! Something went wrong
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  Let me try that again for you
                </p>
              </div>
              <button
                onClick={() => regenerate()}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                id="retry-button"
              >
                <RotateCcw className="w-4 h-4 text-text-secondary" />
              </button>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {!isAtBottom && hasMessages && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 p-2.5 rounded-full glass-card shadow-lg z-10 hover:bg-white/5 transition-colors"
            id="scroll-bottom-button"
          >
            <ChevronDown className="w-4 h-4 text-text-secondary" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-glass-border bg-bg-primary/80 backdrop-blur-xl z-20">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <form onSubmit={handleFormSubmit} className="flex gap-2 items-end">
            <div className="flex-1 glass-card rounded-2xl input-glow transition-all duration-200">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleFormSubmit(e);
                  }
                }}
                placeholder="Ask Kade anything... 🛍️"
                rows={1}
                className="w-full bg-transparent px-4 py-3 text-sm text-text-primary placeholder-text-muted resize-none outline-none"
                style={{
                  minHeight: "44px",
                  maxHeight: "128px",
                }}
                id="chat-input"
              />
            </div>
            <motion.button
              type="submit"
              disabled={!input.trim() || isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-2xl bg-gradient-to-r from-brand to-brand-light text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-[0_0_16px_rgba(124,92,191,0.2)] hover:shadow-[0_0_24px_rgba(124,92,191,0.35)] flex-shrink-0"
              id="send-button"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </form>

          <p className="text-center text-[10px] text-text-muted mt-2 flex items-center justify-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-brand/60" />
            Powered by Kapruka MCP · Kade may make mistakes · Applicant #68AV2
          </p>
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  );
}

// Smart markdown formatting
function formatMessageText(text: string): string {
  return text
    // Headers
    .replace(/^### (.*$)/gm, '<h3 class="text-base font-semibold text-text-primary mt-3 mb-1">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-lg font-semibold text-text-primary mt-3 mb-1">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold text-text-primary mt-3 mb-1">$1</h1>')
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-text-primary font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code
    .replace(/`(.*?)`/g, '<code class="bg-white/5 px-1.5 py-0.5 rounded text-brand-light text-xs font-mono">$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-brand-light underline underline-offset-2 hover:text-accent transition-colors">$1</a>')
    // Line breaks
    .replace(/\n/g, "<br />");
}

// Context-aware quick reply suggestions
function getQuickReplies(content: string): string[] {
  const lower = content.toLowerCase();
  const replies: string[] = [];

  if (lower.includes("product") || lower.includes("found") || lower.includes("search")) {
    replies.push("Show me more options");
    replies.push("Sort by price: low to high");
  }
  if (lower.includes("cart") || lower.includes("added")) {
    replies.push("View my cart");
    replies.push("Continue shopping");
  }
  if (lower.includes("delivery") || lower.includes("deliver")) {
    replies.push("Check delivery to Colombo");
    replies.push("What about same-day delivery?");
  }
  if (lower.includes("order") && lower.includes("created")) {
    replies.push("Track my order");
  }
  if (lower.includes("categor")) {
    replies.push("Show me electronics");
    replies.push("Show me food & groceries");
  }
  if (lower.includes("cake") || lower.includes("flower") || lower.includes("perishable")) {
    replies.push("Check delivery availability");
  }

  // Default fallbacks if nothing matched
  if (replies.length === 0) {
    replies.push("Show me categories");
    replies.push("Search for something");
  }

  return replies.slice(0, 3);
}
