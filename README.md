# ChatApp Frontend

A modern, real-time chat application frontend built with Next.js 15, React 19, TypeScript, and Tailwind CSS. Features real-time messaging, emoji reactions, user authentication, and a responsive design.
<video src="https://github.com/user-attachments/assets/36e37988-2c73-4df7-a5c7-a966b2549916" autoplay loop muted playsinline width="600"></video>

## 🚀 Features

- **Real-time Chat**: Instant messaging with SignalR integration
- **User Authentication**: Secure login and registration
- **Message Reactions**: Emoji reactions on messages
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Modern UI**: Clean, Discord-inspired interface
- **Sound Effects**: Audio feedback for messages and notifications
- **Typing Indicators**: Real-time typing status
- **Online Users**: Live user presence tracking
- **Dark Theme**: Beautiful dark mode interface

## 🛠️ Tech Stack

- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **SignalR** - Real-time communication
- **Geist Font** - Modern typography
- **ESLint** - Code linting and formatting

## 📋 Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- ChatApp API backend running on `http://localhost:5000`

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd chat-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your actual configuration values.

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Environment Configuration

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SIGNALR_URL=http://localhost:5000/chathub

# Application Configuration
NEXT_PUBLIC_APP_NAME=ChatApp
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 📱 Pages & Features

### Authentication Pages
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - New user registration

### Chat Pages
- **Chat** (`/chat`) - Main chat interface
- **Home** (`/`) - Redirects to login or chat

### Components
- **AuthForm** - Reusable authentication form
- **ChatWindow** - Main chat interface with sidebar
- **MessageList** - Message display with reactions
- **MessageReactions** - Emoji reaction system
- **AuthProvider** - Authentication context

## 🎨 UI Components

### Chat Interface
- **Sidebar** - Server info, channels, and online users
- **Message Area** - Chat messages with timestamps
- **Input Area** - Message composition with send button
- **Reactions** - Emoji reactions on messages
- **Typing Indicators** - Real-time typing status

### Responsive Design
- **Mobile-First** - Optimized for mobile devices
- **Desktop Layout** - Enhanced desktop experience
- **Sidebar Toggle** - Collapsible sidebar on mobile
- **Touch-Friendly** - Optimized touch interactions

## 🔌 API Integration

### Authentication API
```typescript
// Login
POST /api/auth/login
Body: { email: string, password: string }

// Register
POST /api/auth/register
Body: { username: string, email: string, password: string }
```

### SignalR Events
```typescript
// Send message
signalRService.sendMessage(content: string)

// Add reaction
signalRService.addReaction(messageId: number, emoji: string)

// Remove reaction
signalRService.removeReaction(messageId: number, emoji: string)
```

## 🎵 Sound System

The app includes a sound service for audio feedback:
- **Message Received** - Sound for incoming messages
- **Message Sent** - Sound for sent messages
- **User Joined** - Sound when users join
- **Error** - Sound for error notifications
- **Toggle** - Enable/disable sounds

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Docker Deployment
```dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

FROM base AS start
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./
EXPOSE 3000
CMD ["npm", "start"]
```

## 🧪 Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Code Structure
```
src/
├── app/                 # Next.js App Router pages
│   ├── login/          # Login page
│   ├── register/       # Registration page
│   ├── chat/           # Chat page
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── AuthForm.tsx    # Authentication form
│   ├── ChatWindow.tsx  # Main chat interface
│   ├── MessageList.tsx # Message display
│   └── AuthProvider.tsx # Auth context
├── lib/               # Utility libraries
│   ├── api.ts         # API client
│   └── signalr.ts     # SignalR service
└── types/             # TypeScript definitions
    └── auth.ts        # Authentication types
```

## 🎨 Styling

### Tailwind CSS Configuration
- **Custom Colors** - Purple and blue gradient theme
- **Responsive Design** - Mobile-first approach
- **Dark Theme** - Beautiful dark mode
- **Custom Components** - Reusable UI components
- **Animations** - Smooth transitions and effects

### Font Configuration
- **Geist Sans** - Primary font family
- **Geist Mono** - Monospace font
- **Inter** - Fallback font

## 🔒 Security Features

- **JWT Token Storage** - Secure token management
- **Route Protection** - Protected routes with authentication
- **Input Validation** - Form validation and sanitization
- **CORS Configuration** - Secure cross-origin requests
- **Environment Variables** - Secure configuration management

## 📱 Mobile Features

- **Responsive Layout** - Adapts to all screen sizes
- **Touch Gestures** - Swipe and tap interactions
- **Mobile Navigation** - Collapsible sidebar
- **PWA Ready** - Progressive Web App capabilities
- **Offline Support** - Basic offline functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email your-email@example.com or create an issue in the repository.

## 🔄 Version History

- **v1.0.0** - Initial release with basic chat functionality
- **v1.1.0** - Added message reactions and sound system
- **v1.2.0** - Enhanced mobile responsiveness and UI improvements
