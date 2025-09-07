import { MessageReaction } from '@/types/auth';
import { useState } from 'react';

interface MessageReactionsProps {
  messageId: number;
  reactions: MessageReaction[];
  currentUsername: string;
  onReactionAdd: (messageId: number, emoji: string) => void;
  onReactionRemove: (messageId: number, emoji: string) => void;
}

const COMMON_EMOJIS = ['👍', '❤️', '😄', '😮', '😢', '😡'];

export default function MessageReactions({ 
  messageId, 
  reactions = [], 
  currentUsername, 
  onReactionAdd, 
  onReactionRemove 
}: MessageReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleReactionClick = (emoji: string) => {
    const existingReaction = reactions.find(r => r.emoji === emoji);
    
    if (existingReaction && existingReaction.users.includes(currentUsername)) {
      onReactionRemove(messageId, emoji);
    } else {
      onReactionAdd(messageId, emoji);
    }
    setShowPicker(false);
  };

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {/* Existing Reactions */}
      {reactions.map((reaction) => (
        <button
          key={reaction.emoji}
          onClick={() => handleReactionClick(reaction.emoji)}
          className={`
            inline-flex items-center px-2 py-1 rounded-full text-xs
            transition-colors hover:bg-gray-500/50
            ${reaction.users.includes(currentUsername) 
              ? 'bg-purple-600/30 border border-purple-500' 
              : 'bg-gray-600/50'
            }
          `}
        >
          <span className="mr-1">{reaction.emoji}</span>
          <span className="text-gray-300">{reaction.count}</span>
        </button>
      ))}

      {/* Add Reaction Button - Fixed hover issue */}
      <div className="relative">
        <button 
          onClick={() => setShowPicker(!showPicker)}
          className="w-6 h-6 rounded-full bg-gray-600/50 hover:bg-gray-500/50 flex items-center justify-center text-xs text-gray-400 hover:text-gray-300 transition-colors"
        >
          +
        </button>
        
        {/* Emoji Picker - Fixed positioning */}
        {showPicker && (
          <div className="absolute bottom-8 left-0 bg-gray-800 border border-gray-600 rounded-lg p-2 shadow-lg z-10">
            <div className="flex gap-1">
              {COMMON_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReactionClick(emoji)}
                  className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}