'use client';

import { useState } from 'react';
import { signalRService } from '@/lib/signalr';

export default function DebugPage() {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('Not connected');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnection = async () => {
    if (!token.trim()) {
      addLog('Please enter a token');
      return;
    }

    try {
      addLog('Attempting to connect...');
      setStatus('Connecting...');
      
      await signalRService.connect(token);
      setStatus('Connected');
      addLog('Connection successful!');
    } catch (error) {
      setStatus('Failed');
      addLog(`Connection failed: ${error}`);
      console.error('Connection error:', error);
    }
  };

  const disconnect = async () => {
    try {
      await signalRService.disconnect();
      setStatus('Disconnected');
      addLog('Disconnected');
    } catch (error) {
      addLog(`Disconnect error: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">SignalR Debug Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Test</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">JWT Token:</label>
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full p-3 border rounded-lg"
              rows={3}
              placeholder="Paste your JWT token here..."
            />
          </div>
          
          <div className="flex gap-4 mb-4">
            <button
              onClick={testConnection}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test Connection
            </button>
            <button
              onClick={disconnect}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Disconnect
            </button>
          </div>
          
          <div className="text-sm">
            <strong>Status:</strong> <span className="text-blue-600">{status}</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Logs</h2>
          <div className="bg-gray-50 p-4 rounded max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-sm font-mono mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
