import { HubConnection, HubConnectionBuilder, LogLevel, HubConnectionState } from '@microsoft/signalr';
import { Message } from '@/types/auth';

class SignalRService {
  private connection: HubConnection | null = null;
  private connectionPromise: Promise<void> | null = null;
  private isConnecting = false;

  async connect(token: string): Promise<void> {
    if (this.isConnecting || this.connectionPromise) {
      return this.connectionPromise || Promise.resolve();
    }

    if (this.connection?.state === HubConnectionState.Connected) {
      return Promise.resolve();
    }

    this.isConnecting = true;
    this.connectionPromise = this._doConnect(token);
    
    try {
      await this.connectionPromise;
    } finally {
      this.isConnecting = false;
      this.connectionPromise = null;
    }
  }

  private async _doConnect(token: string): Promise<void> {
    if (!token || token.trim() === '') {
      throw new Error('Invalid token provided for SignalR connection');
    }

    if (this.connection) {
      try {
        await this.connection.stop();
      } catch (error) {
        console.log('Error stopping existing connection:', error);
      }
      this.connection = null;
    }

    console.log('Attempting to connect to SignalR with token:', token.substring(0, 20) + '...');

    const signalRUrl = process.env.NEXT_PUBLIC_SIGNALR_URL || 'http://localhost:5000/chathub';
    
    this.connection = new HubConnectionBuilder()
      .withUrl(signalRUrl, {
        accessTokenFactory: () => token,
        skipNegotiation: false,
        transport: undefined
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .configureLogging(LogLevel.Information)
      .build();

    this.connection.onreconnecting(() => {
      console.log('SignalR reconnecting...');
    });

    this.connection.onreconnected(() => {
      console.log('SignalR reconnected');
    });

    this.connection.onclose((error) => {
      if (error) {
        console.error('SignalR connection closed with error:', error);
      } else {
        console.log('SignalR connection closed');
      }
    });

    try {
      await this.connection.start();
      console.log('SignalR Connected successfully');
    } catch (error) {
      console.error('Failed to start SignalR connection:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.isConnecting = false;
    this.connectionPromise = null;
    
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch (error) {
        console.error('Error stopping SignalR connection:', error);
      } finally {
        this.connection = null;
        console.log('SignalR Disconnected');
      }
    }
  }

  async sendMessage(content: string): Promise<void> {
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      try {
        await this.connection.invoke('SendMessage', content);
      } catch (error) {
        console.error('Error sending message:', error);
        throw error;
      }
    } else {
      throw new Error('SignalR connection is not active');
    }
  }
  async addReaction(messageId: number, emoji: string): Promise<void> {
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      try {
        await this.connection.invoke('AddReaction', messageId, emoji);
      } catch (error) {
        console.error('Error adding reaction:', error);
        throw error;
      }
    }
  }

  async removeReaction(messageId: number, emoji: string): Promise<void> {
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      try {
        await this.connection.invoke('RemoveReaction', messageId, emoji);
      } catch (error) {
        console.error('Error removing reaction:', error);
        throw error;
      }
    }
  }

  onCurrentUsers(callback: (users: string[]) => void): void {
    if (this.connection) {
      this.connection.on('CurrentUsers', callback);
    }
  }

  onReactionAdded(callback: (data: { messageId: number; emoji: string; username: string; userId: number }) => void): void {
    if (this.connection) {
      this.connection.on('ReactionAdded', callback);
    }
  }

  onReactionRemoved(callback: (data: { messageId: number; emoji: string; userId: number }) => void): void {
    if (this.connection) {
      this.connection.on('ReactionRemoved', callback);
    }
  }
  // FIXED: Silent typing indicators (don't try to call server methods)
  async sendTyping(): Promise<void> {
    // Frontend-only typing - no server call needed
    return Promise.resolve();
  }

  async stopTyping(): Promise<void> {
    // Frontend-only typing - no server call needed
    return Promise.resolve();
  }

  onReceiveMessage(callback: (message: Message) => void): void {
    if (this.connection) {
      this.connection.on('ReceiveMessage', callback);
    }
  }

  onUserConnected(callback: (username: string) => void): void {
    if (this.connection) {
      this.connection.on('UserConnected', callback);
    }
  }

  onUserDisconnected(callback: (username: string) => void): void {
    if (this.connection) {
      this.connection.on('UserDisconnected', callback);
    }
  }

  // Keep these for potential future server support
  onUserTyping(callback: (username: string) => void): void {
    if (this.connection) {
      this.connection.on('UserTyping', callback);
    }
  }

  onUserStoppedTyping(callback: (username: string) => void): void {
    if (this.connection) {
      this.connection.on('UserStoppedTyping', callback);
    }
  }

  getConnectionState(): string {
    if (!this.connection) return 'Disconnected';
    
    switch (this.connection.state) {
      case HubConnectionState.Connected:
        return 'Connected';
      case HubConnectionState.Connecting:
        return 'Connecting';
      case HubConnectionState.Reconnecting:
        return 'Reconnecting';
      case HubConnectionState.Disconnected:
        return 'Disconnected';
      case HubConnectionState.Disconnecting:
        return 'Disconnecting';
      default:
        return 'Unknown';
    }
  }

  isConnected(): boolean {
    return this.connection?.state === HubConnectionState.Connected;
  }
}

export const signalRService = new SignalRService();