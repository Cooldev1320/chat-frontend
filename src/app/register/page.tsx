'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import AuthForm from '@/components/AuthForm';
import { RegisterData } from '@/types/auth';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (data: RegisterData) => {
    try {
      setError(null);
      await register(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
    }
  };

  return (
    <AuthForm
      mode="register"
      onSubmit={handleRegister}
      loading={loading}
      error={error}
    />
  );
}