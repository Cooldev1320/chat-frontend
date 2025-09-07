export interface User {
  id: number;
  username: string;
  email: string;
  isOnline?: boolean;
  createdAt: string;
}

export interface MessageReaction {
  emoji: string;
  users: string[];
  count: number;
}

export interface Message {
  id: number;
  content: string;
  createdAt: string;
  userId: number;
  username: string;
  user?: User;
  reactions?: MessageReaction[]; // Add reactions
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type LoginData = LoginRequest;
export type RegisterData = RegisterRequest;

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  loading: boolean;
}