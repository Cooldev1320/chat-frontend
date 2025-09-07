'use client';

import { useState, useEffect, useRef } from 'react';
import { Message } from '@/types/auth';
import { signalRService } from '@/lib/signalr';
import { soundService } from '@/lib/sounds';
import MessageList from './MessageList';

interface ChatWindowProps {
  token: string;
  currentUserId: number;
  username: string;
}

export default function ChatWindow({ token, currentUserId, username }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [connectionState, setConnectionState] = useState('Disconnected');
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [messageReactions, setMessageReactions] = useState<Record<number, Array<{ emoji: string; users: string[]; count: number }>>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!token) {
      console.log('No token available for SignalR connection');
      return;
    }

    const connectToChat = async () => {
      try {
        setIsConnecting(true);
        console.log('Connecting to SignalR with token:', token.substring(0, 20) + '...');
        
        await signalRService.connect(token);
        setConnectionState('Connected');

        signalRService.onReceiveMessage((message: Message) => {
          setMessages(prev => [...prev, message]);
          
          // Play sound for received messages (not your own)
          const messageUserId = message.userId || message.user?.id;
          if (messageUserId !== currentUserId) {
            soundService.playMessageReceived();
          }
        });
        
        signalRService.onUserConnected((username: string) => {
          setConnectedUsers(prev => [...prev, username]);
          soundService.playUserJoined();
        });

        signalRService.onUserDisconnected((username: string) => {
          setConnectedUsers(prev => prev.filter(u => u !== username));
        });

        signalRService.onUserTyping((username: string) => {
          setTypingUsers(prev => {
            if (!prev.includes(username)) {
              return [...prev, username];
            }
            return prev;
          });
        });

        signalRService.onUserStoppedTyping((username: string) => {
          setTypingUsers(prev => prev.filter(u => u !== username));
        });

        signalRService.onCurrentUsers((users: string[]) => {
          setConnectedUsers(users.filter(u => u !== username)); // Exclude yourself
        });

        signalRService.onReactionAdded((data) => {
          setMessageReactions(prev => {
            const reactions = prev[data.messageId] || [];
            const existingReaction = reactions.find(r => r.emoji === data.emoji);
            
            if (existingReaction) {
              return {
                ...prev,
                [data.messageId]: reactions.map(r => 
                  r.emoji === data.emoji 
                    ? { ...r, users: [...r.users, data.username], count: r.count + 1 }
                    : r
                )
              };
            } else {
              return {
                ...prev,
                [data.messageId]: [...reactions, { emoji: data.emoji, users: [data.username], count: 1 }]
              };
            }
          });
        });

        signalRService.onReactionRemoved((data) => {
          setMessageReactions(prev => {
            const reactions = prev[data.messageId] || [];
            
            return {
              ...prev,
              [data.messageId]: reactions
                .map(r => 
                  r.emoji === data.emoji 
                    ? { ...r, users: r.users.filter(u => u !== username), count: r.count - 1 }
                    : r
                )
                .filter(r => r.count > 0)
            };
          });
        });

      } catch (error) {
        console.error('Connection failed:', error);
        setConnectionState('Disconnected');
        soundService.playError();
      } finally {
        setIsConnecting(false);
      }
    };

    connectToChat();

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      signalRService.disconnect();
    };
  }, [token, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    if (signalRService.isConnected()) {
      if (value.trim() && value.length > 0) {
        signalRService.sendTyping();
        
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        typingTimeoutRef.current = setTimeout(() => {
          signalRService.stopTyping();
        }, 3000);
      } else {
        signalRService.stopTyping();
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newMessage.trim() && signalRService.isConnected()) {
      try {
        signalRService.stopTyping();
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        await signalRService.sendMessage(newMessage.trim());
        soundService.playMessageSent(); // Sound for sent message
        setNewMessage('');
        
        if (window.innerWidth < 768) {
          setSidebarOpen(false);
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        soundService.playError();
      }
    }
  };

  const toggleSound = () => {
    const newState = soundService.toggle();
    setSoundEnabled(newState);
  };

  // Update reaction handlers to use SignalR:
  const handleReactionAdd = async (messageId: number, emoji: string) => {
    try {
      await signalRService.addReaction(messageId, emoji);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const handleReactionRemove = async (messageId: number, emoji: string) => {
    try {
      await signalRService.removeReaction(messageId, emoji);
    } catch (error) {
      console.error('Failed to remove reaction:', error);
    }
  };

  const getTypingDisplay = () => {
    if (typingUsers.length === 0) return '';
    if (typingUsers.length === 1) return `${typingUsers[0]} is typing...`;
    if (typingUsers.length === 2) return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
    return `${typingUsers.slice(0, 2).join(', ')} and ${typingUsers.length - 2} others are typing...`;
  };

  if (isConnecting) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Connecting to chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 relative">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 fixed md:relative z-50 md:z-auto
        w-72 bg-gray-800 border-r border-gray-700 flex flex-col
        transition-transform duration-300 ease-in-out
        h-full
      `}>
        {/* Mobile Close Button */}
        <div className="md:hidden flex justify-end p-4">
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Server Header */}
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            ChatApp
          </h2>
          <div className="flex items-center mt-2">
            <div className={`w-2 h-2 rounded-full mr-2 ${signalRService.isConnected() ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-400">{signalRService.isConnected() ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>

        {/* Channels */}
        <div className="flex-1 p-4">
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Text Channels
            </h3>
            <div className="bg-gray-700/50 rounded-lg p-3 border-l-4 border-purple-500">
              <div className="flex items-center text-gray-300">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <span className="font-medium">general</span>
              </div>
            </div>
          </div>

          {/* Online Users */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Online — {connectedUsers.length + 1}
            </h3>
            <div className="space-y-2">
              {/* Current User */}
              <div className="flex items-center text-sm text-gray-300">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="font-medium text-white text-xs">{username.charAt(0).toUpperCase()}</span>
                </div>
                <span className="truncate">{username} (You)</span>
                <div className="w-2 h-2 bg-green-400 rounded-full ml-auto flex-shrink-0"></div>
              </div>
              
              {/* Other Users */}
              {connectedUsers.map((user, index) => (
                <div key={index} className="flex items-center text-sm text-gray-300">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="font-medium text-white text-xs">{user.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="truncate">{user}</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full ml-auto flex-shrink-0"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Info with Sound Toggle */}
        <div className="p-4 bg-gray-800/50 border-t border-gray-700">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">Sounds</span>
            <button
              onClick={toggleSound}
              className={`w-10 h-6 rounded-full transition-colors ${
                soundEnabled ? 'bg-purple-600' : 'bg-gray-600'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                soundEnabled ? 'translate-x-5' : 'translate-x-1'
              }`} />
            </button>
          </div>
          
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="font-medium text-white text-xs">{username.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{username}</p>
              <p className="text-xs text-gray-400">Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-700 min-w-0">
        {/* Chat Header with Sound Indicator */}
        <div className="bg-gray-800 border-b border-gray-600 p-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden mr-3 text-gray-400 hover:text-white"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <svg className="h-6 w-6 text-gray-400 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <h1 className="text-xl font-semibold text-white truncate">general</h1>
          </div>

          {/* Sound Indicator (Mobile) */}
          <button
            onClick={toggleSound}
            className="md:hidden text-gray-400 hover:text-white"
            title={soundEnabled ? 'Sound on' : 'Sound off'}
          >
            {soundEnabled ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 5L7 7H4a1 1 0 00-1 1v8a1 1 0 001 1h3l2 2 5-5V5z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1V8a1 1 0 011-1h1.586l4.707-4.707C10.923 1.663 12 2.109 12 3v18c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            )}
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 flex flex-col">
        <MessageList 
          messages={messages} 
          currentUserId={currentUserId} 
          currentUsername={username}
          messageReactions={messageReactions}
          onReactionAdd={handleReactionAdd}
          onReactionRemove={handleReactionRemove}
        />
          
          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="px-4 py-2 text-sm text-gray-400 italic">
              {getTypingDisplay()}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 bg-gray-800">
          <form onSubmit={handleSendMessage}>
            <div className="flex items-center bg-gray-600 rounded-lg p-3">
              <input
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                placeholder={signalRService.isConnected() ? 'Message #general' : 'Connecting...'}
                className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm md:text-base"
                disabled={!signalRService.isConnected()}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || !signalRService.isConnected()}
                className="ml-3 bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}