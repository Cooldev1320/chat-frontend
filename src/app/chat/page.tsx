'use client';

import { useAuth } from '@/components/AuthProvider';
import ChatWindow from '@/components/ChatWindow';

export default function ChatPage() {
  const { user, token, logout } = useAuth();

  if (!user || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={logout}
        className="absolute top-4 right-4 z-50 bg-red-600/80 hover:bg-red-700 text-white px-4 py-2 rounded-lg backdrop-blur-sm border border-red-500/20 transition-all"
      >
        Logout
      </button>
      <ChatWindow token={token} currentUserId={user.id} username={user.username} />
    </div>
  );
}