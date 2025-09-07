'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import AuthForm from '@/components/AuthForm';
import { LoginRequest, RegisterRequest } from '@/types/auth';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (data: LoginRequest | RegisterRequest) => {
    try {
      setError(null);
      await login(data as LoginRequest);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    }
  };

  return (
    <AuthForm
      mode="login"
      onSubmit={handleLogin}
      loading={loading}
      error={error}
    />
  );
}