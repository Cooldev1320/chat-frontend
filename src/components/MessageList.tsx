import { Message, MessageReaction } from '@/types/auth';
import MessageReactions from './MessageReactions';
import { useState } from 'react';

interface MessageListProps {
  messages: Message[];
  currentUserId: number;
  currentUsername: string;
  messageReactions?: Record<number, Array<{ emoji: string; users: string[]; count: number }>>;
  onReactionAdd?: (messageId: number, emoji: string) => Promise<void>;
  onReactionRemove?: (messageId: number, emoji: string) => Promise<void>;
}

export default function MessageList({ 
  messages, 
  currentUserId, 
  currentUsername, 
  messageReactions = {}, 
  onReactionAdd, 
  onReactionRemove 
}: MessageListProps) {

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    
    return date.toLocaleDateString();
  };

  const handleReactionAdd = async (messageId: number, emoji: string) => {
    if (onReactionAdd) {
      await onReactionAdd(messageId, emoji);
    }
  };

  const handleReactionRemove = async (messageId: number, emoji: string) => {
    if (onReactionRemove) {
      await onReactionRemove(messageId, emoji);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold mb-2">Welcome to #general!</h3>
          <p className="text-center">This is the beginning of the #general channel.</p>
        </div>
      ) : (
        messages.map((message) => {
          const messageUserId = message.userId || message.user?.id;
          const messageUsername = message.username || message.user?.username || 'Unknown';
          const isOwnMessage = messageUserId === currentUserId;
          
          return (
            <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* User Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0 ${
                  isOwnMessage 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-600' 
                    : 'bg-gray-600'
                }`}>
                  {messageUsername.charAt(0).toUpperCase()}
                </div>
                
                {/* Message Content */}
                <div className="flex flex-col">
                  <div className={`rounded-2xl px-4 py-2 ${
                    isOwnMessage
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'bg-gray-600 text-gray-100'
                  }`}>
                    {!isOwnMessage && (
                      <div className="text-xs font-medium text-gray-300 mb-1">
                        {messageUsername}
                      </div>
                    )}
                    <p className="text-sm">{message.content}</p>
                    <div className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-purple-200' : 'text-gray-400'
                    }`}>
                      {formatTime(message.createdAt)}
                    </div>
                  </div>
                  
                  {/* Message Reactions */}
                  <MessageReactions
                    messageId={message.id}
                    reactions={messageReactions[message.id] || []}
                    currentUsername={currentUsername}
                    onReactionAdd={handleReactionAdd}
                    onReactionRemove={handleReactionRemove}
                  />
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}