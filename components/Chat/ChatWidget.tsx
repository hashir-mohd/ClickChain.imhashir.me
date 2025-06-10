import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ChatMessage as ChatMessageType, ApiError } from '../../types';
import * as apiService from '../../services/apiService';
import ChatMessageBubble from './ChatMessageBubble';
import LoadingSpinner from '../LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { CHAT_WELCOME_MESSAGE } from '../../constants';

const ChatWidget: React.FC = () => {
  const {
    chatMessages,
    addChatMessage,
    conversationId,
    setConversationId,
    currentTrace, 
    isChatOpen, 
    setIsChatOpen
  } = useAppContext();

  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWidgetRef = useRef<HTMLDivElement>(null); 
  
  useEffect(() => {
    if (isChatOpen && chatMessages.length === 0) {
        const welcomeMsg: ChatMessageType = {
            id: `gemini-welcome-${Date.now()}`,
            sender: 'gemini',
            text: CHAT_WELCOME_MESSAGE,
            timestamp: Date.now(),
        };
        addChatMessage(welcomeMsg);
    }
  }, [isChatOpen, chatMessages, addChatMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userInput,
      timestamp: Date.now(),
      traceIdContext: currentTrace?.traceID
    };
    addChatMessage(userMessage);
    setUserInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.postChatMessage({
        prompt: userMessage.text,
        conversationId: conversationId,
        traceId: currentTrace?.traceID, 
      });

      if (response.success) {
        const geminiMessage: ChatMessageType = {
          id: `gemini-${Date.now()}`,
          sender: 'gemini',
          text: response.data.response,
          timestamp: Date.now(),
        };
        addChatMessage(geminiMessage);
        setConversationId(response.data.conversationId);
      } else {
        throw new Error("Gemini API call was not successful.");
      }
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr);
      const errorMessage: ChatMessageType = {
        id: `error-${Date.now()}`,
        sender: 'gemini',
        text: `Sorry, I encountered an error: ${apiErr.message || 'Could not process your request.'}`,
        timestamp: Date.now(),
      };
      addChatMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fabVariants = {
    hidden: { scale: 0, opacity: 0, y: 30, x:30 },
    visible: { 
      scale: 1, opacity: 1, y: 0, x:0,
      transition: { type: 'spring', stiffness: 150, damping: 15, delay: 0.5 } 
    }
  };

  const chatWindowVariants = {
    closed: { opacity: 0, y: 20, scale: 0.9, transition: { type: 'spring', stiffness: 200, damping: 20 } },
    open: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } }
  };


  return (
    <>
      <motion.button
        variants={fabVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.1, boxShadow: "-8px -8px 16px var(--clay-shadow-light), 8px 8px 16px var(--clay-shadow-dark)" }}
        whileTap={{ scale: 0.9, boxShadow: "var(--clay-shadow-inset)" }}
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-8 right-8 bg-[var(--clay-accent-primary)] text-white w-16 h-16 rounded-full flex items-center justify-center z-[80] clay-element"
        aria-label={isChatOpen ? "Close chat" : "Open chat"}
      >
        <AnimatePresence mode="wait">
        {isChatOpen ? (
            <motion.div key="close-icon" initial={{rotate: -90, opacity:0}} animate={{rotate:0, opacity:1}} exit={{rotate:90, opacity:0}} transition={{duration:0.2}}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            </motion.div>
        ) : (
            <motion.div key="chat-icon" initial={{rotate: -90, opacity:0}} animate={{rotate:0, opacity:1}} exit={{rotate:90, opacity:0}} transition={{duration:0.2}}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-3.86 8.25-8.625 8.25S3.75 16.556 3.75 12C3.75 7.444 7.365 3.75 12.375 3.75S21 7.444 21 12z" />
            </svg>
            </motion.div>
        )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
      {isChatOpen && (
        <motion.div
          ref={chatWidgetRef}
          drag
          dragMomentum={false} 
          dragConstraints={{ top: -300, left: -500, right: 20, bottom: 20 }} 
          variants={chatWindowVariants}
          initial="closed"
          animate="open"
          exit="closed"
          className="clay-element fixed bottom-28 right-8 w-full max-w-md h-[70vh] max-h-[550px] rounded-2xl flex flex-col overflow-hidden z-[90] text-[var(--clay-text)]" // Clay element for chat window
        >
          <motion.div 
            className="chat-handle p-4 bg-[var(--clay-bg)] text-base font-semibold border-b border-[var(--clay-bg-darker)] flex justify-between items-center"
          >
            Gemini Assistant
             {currentTrace && <span className="text-xs text-[var(--clay-text-light)] font-normal">(Context: {currentTrace.traceID.substring(0,8)}...)</span>}
          </motion.div>

          <div className="flex-grow p-4 space-y-3.5 overflow-y-auto">
            {chatMessages.map(msg => <ChatMessageBubble key={msg.id} message={msg} />)}
            {isLoading && (
              <div className="flex justify-start">
                 <div className="bg-[var(--clay-bg-darker)] p-2 rounded-xl max-w-[70%] clay-element-sm-shadow"> {/* Clay style for loading bubble */}
                    <LoadingSpinner size="sm" colorClass='border-[var(--clay-text-light)]' />
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} /> 
          </div>
          
          {error && <p className="text-xs text-[var(--clay-accent-error)] px-4 pb-1.5">{error.message}</p>}

          <div className="p-4 border-t border-[var(--clay-bg-darker)] bg-[var(--clay-bg)]">
            <div className="flex items-center space-x-3">
              <motion.input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                placeholder="Ask Gemini..."
                className="flex-grow p-3 clay-inset text-[var(--clay-text)] rounded-xl focus:ring-2 focus:ring-[var(--clay-accent-primary)] focus:outline-none text-sm placeholder-[var(--clay-text-light)]"
                disabled={isLoading}
                whileFocus={{ boxShadow: "var(--clay-shadow-inset), 0 0 0 2px var(--clay-accent-primary)" }}
              />
              <motion.button
                onClick={handleSendMessage}
                disabled={isLoading || !userInput.trim()}
                whileHover={{ scale: 1.05, y: -1, boxShadow: isLoading || !userInput.trim() ? undefined : "-5px -5px 10px var(--clay-shadow-light), 5px 5px 10px var(--clay-shadow-dark)"}}
                whileTap={{ scale: 0.95, boxShadow: isLoading || !userInput.trim() ? undefined : "var(--clay-shadow-inset-sm)"}}
                className="p-3 bg-[var(--clay-accent-primary)] text-white rounded-xl clay-element clay-element-sm-shadow disabled:bg-[var(--clay-bg-darker)] disabled:text-[var(--clay-text-light)] disabled:shadow-[var(--clay-shadow-inset)] disabled:opacity-70"
                aria-label="Send message"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;