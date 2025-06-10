import React from 'react';
import { ChatMessage } from '../../types';
import { motion } from 'framer-motion';
import MarkdownRenderer from '../MarkdownRenderer'; 

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  const bubbleVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.9 },
    visible: { 
      opacity: 1, y: 0, scale: 1, 
      transition: { duration: 0.25, type: 'spring', stiffness:120, damping:12 } 
    }
  };
  
  return (
    <motion.div 
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
      className={`flex mb-2 ${isUser ? 'justify-end pl-8' : 'justify-start pr-8'}`}
    >
      <div 
        className={`max-w-[85%] p-3 text-sm clay-element clay-element-sm-shadow
          ${isUser 
            ? 'bg-[var(--clay-accent-primary)] text-white rounded-br-lg rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl' // User bubble specific rounding
            : 'bg-[var(--clay-bg)] text-[var(--clay-text)] rounded-bl-lg rounded-tr-2xl rounded-tl-2xl rounded-br-2xl' // Gemini bubble specific rounding
          }`}
      >
        {isUser ? (
          <span className="whitespace-pre-wrap">{message.text}</span>
        ) : (
          <MarkdownRenderer content={message.text} />
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessageBubble;